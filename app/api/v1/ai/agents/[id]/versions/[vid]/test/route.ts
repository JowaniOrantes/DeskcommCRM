/**
 * POST /api/v1/ai/agents/:id/versions/:vid/test (admin)
 *
 * Spec 10 §4.4. Cria ai_agent_runs com is_dry_run=true e executa o runtime
 * real (S-13.08) via `callInternalRuntime` → `runAgent`. Esse é o default.
 *
 * INTERNAL_AGENT_RUN_STUB=true troca a execução por um trace fabricado —
 * serve para exercitar o render da UI sem gastar token, e NÃO é o default:
 * numa instalação nova, "Testar agente" tem que testar o agente.
 *
 * Crítico: dry_run=true → bypass do partial unique
 *   ai_agent_runs_one_running_per_conv (que filtra is_dry_run=false), por
 *   isso múltiplos tests simultâneos pra mesma conversation não conflitam.
 *
 * Sample contact é apenas pra contexto do prompt — nunca toca contacts/conversations
 * tables, nunca chama WAHA, nunca cria messages.outbound.
 */
import { randomUUID } from "node:crypto";
import { type NextRequest } from "next/server";

import { ok, fail } from "@/lib/api/wrappers";
import { audit } from "@/lib/audit";
import { env } from "@/lib/env";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { testRunSchema } from "@/lib/ai/agents/validation";
import { avaliarRespostaDeTeste } from "@/lib/ai/agents/avaliar-resposta-de-teste";
import { traduzir } from "@/lib/i18n/dicionario";

export const dynamic = "force-dynamic";

const UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Ctx = { params: Promise<{ id: string; vid: string }> };

export async function POST(req: NextRequest, ctx: Ctx): Promise<Response> {
  const requestId = randomUUID();
  const { id, vid } = await ctx.params;
  if (!UUID_RX.test(id) || !UUID_RX.test(vid)) {
    return fail("invalid_request", "ids inválidos.", 400, { requestId });
  }

  const authz = await requireRole("admin", { requestId, resource: "ai_agents" });
  if (!authz.ok) return authz.response;
  const t = (texto: string) => traduzir(texto, authz.user.idioma);
  const { user: authUser, org: activeOrg } = authz;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("invalid_request", t("Body JSON inválido."), 400, { requestId });
  }
  const parsed = testRunSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("validation_failed", t("Campos inválidos."), 422, {
      requestId,
      details: parsed.error.flatten(),
    });
  }

  const admin = createAdminClient();

  const { data: version } = await admin
    .from("ai_agent_versions")
    .select(
      "id, agent_id, organization_id, system_prompt, provider, model, channel_session_id, max_steps, token_budget, cost_budget_cents, tool_ids",
    )
    .eq("id", vid)
    .eq("organization_id", activeOrg.orgId)
    .eq("agent_id", id)
    .maybeSingle();

  if (!version) return fail("not_found", t("Version não encontrada."), 404, { requestId });

  const startedAt = new Date();

  const { data: runRow, error: runErr } = await admin
    .from("ai_agent_runs")
    .insert({
      organization_id: activeOrg.orgId,
      agent_id: id,
      agent_version_id: vid,
      conversation_id: null,
      contact_id: null,
      channel_session_id: version.channel_session_id,
      inbound_message_id: null,
      outbound_message_id: null,
      status: "running",
      is_dry_run: true,
      started_at: startedAt.toISOString(),
    })
    .select("id")
    .single();

  if (runErr || !runRow) {
    return fail("internal_error", "Erro ao iniciar test run.", 500, { requestId });
  }

  let resultPayload: Record<string, unknown>;

  if (env.INTERNAL_AGENT_RUN_STUB) {
    resultPayload = await runStubbedTest({
      runId: runRow.id,
      orgId: activeOrg.orgId,
      versionId: vid,
      sampleMessage: parsed.data.sample_message,
      sampleContact: parsed.data.sample_contact,
      version,
      startedAt,
    });
  } else {
    // Runtime real (S-13.08). Falha aqui é o caso comum de instalação nova —
    // credencial de IA ausente. Um 500 cru mandaria a pessoa pro log do
    // servidor; devolvemos o porquê legível na própria tela.
    try {
      resultPayload = await callInternalRuntime({
        runId: runRow.id,
        orgId: activeOrg.orgId,
        versionId: vid,
        sampleMessage: parsed.data.sample_message,
        sampleContact: parsed.data.sample_contact,
      });
    } catch (err) {
      const detalhe = err instanceof Error ? err.message : String(err);
      return fail(
        "internal_error",
        `Não consegui executar o agente: ${detalhe}. Confira as credenciais de IA da organização.`,
        500,
        { requestId },
      );
    }
  }

  void audit({
    action: "ai_agent.tested",
    actorUserId: authUser.id,
    organizationId: activeOrg.orgId,
    resourceType: "ai_agent_version",
    resourceId: vid,
    requestId,
    metadata: { run_id: runRow.id, dry_run: true },
  });

  return ok(resultPayload, { requestId });
}

interface StubArgs {
  runId: string;
  orgId: string;
  versionId: string;
  sampleMessage: string;
  sampleContact?: { name?: string; phone?: string };
  version: {
    system_prompt: string;
    provider: string;
    model: string;
    channel_session_id: string;
    tool_ids: unknown;
  };
  startedAt: Date;
}

async function runStubbedTest(args: StubArgs): Promise<Record<string, unknown>> {
  const finishedAt = new Date();
  const latencyMs = finishedAt.getTime() - args.startedAt.getTime();

  // Trace fake plausível pra UI testar render. Nada disso é executado.
  const toolCalls = [
    {
      step: 1,
      tool_name: "(stub)",
      args: { sample_message: args.sampleMessage },
      result: { ok: true, note: "INTERNAL_AGENT_RUN_STUB=true — runtime real chega na S-13.08." },
      started_at: args.startedAt.toISOString(),
      ended_at: finishedAt.toISOString(),
    },
  ];

  const finalText = `[STUB] Resposta simulada para "${args.sampleMessage.slice(0, 80)}".`;

  const admin = createAdminClient();
  await admin
    .from("ai_agent_runs")
    .update({
      status: "completed",
      tokens_in: 0,
      tokens_out: 0,
      cost_cents: 0,
      latency_ms: latencyMs,
      steps_count: 1,
      tool_calls: toolCalls,
      completed_at: finishedAt.toISOString(),
    })
    .eq("id", args.runId)
    .eq("organization_id", args.orgId);

  return {
    run_id: args.runId,
    status: "completed",
    final_text: finalText,
    // O stub também passa pela avaliação: um caminho que não a tivesse voltaria
    // a ser o "verde que não olhou para nada" — só que mais difícil de notar,
    // porque conviveria com um caminho que olha.
    guardrails: avaliarRespostaDeTeste(finalText),
    tool_calls: toolCalls,
    tokens_in: 0,
    tokens_out: 0,
    cost_cents: 0,
    latency_ms: latencyMs,
    would_send_to: {
      session: args.version.channel_session_id,
      chat_id: args.sampleContact?.phone ?? null,
    },
    stub: true,
  };
}

async function callInternalRuntime(args: {
  runId: string;
  orgId: string;
  versionId: string;
  sampleMessage: string;
  sampleContact?: { name?: string; phone?: string };
}): Promise<Record<string, unknown>> {
  // S-13.08 wires the real runtime. We invoke `runAgent` in-process to avoid
  // a fetch loopback (no cold-start, no INTERNAL_SECRET required in dev).
  // The run row is already in is_dry_run=true mode so the runtime bypasses
  // WAHA dispatch + outbound message insert.
  const { runAgent } = await import("@/lib/ai/runtime/agent");
  const result = await runAgent({
    runId: args.runId,
    override: {
      sampleMessage: args.sampleMessage,
      sampleContact: args.sampleContact,
    },
  });
  // O runtime desta rota é o `@deprecated`, e ele NÃO importa `runBeforeSend` —
  // a cadeia de guardrails vive no processo do worker e está ausente do build do
  // app. Sem a linha abaixo, o botão "Testar" mostra uma resposta que nenhum
  // gate examinou, e o self-hoster publica achando que viu o comportamento real.
  //
  // A avaliação cobre o que é decidível só com o texto e DECLARA o resto (ver
  // lib/ai/agents/avaliar-resposta-de-teste.ts): fabricar o estado do turno para
  // rodar a cadeia toda daria um veredito inventado, que é pior do que um
  // "não avaliado" visível.
  return { ...result, stub: false, guardrails: avaliarRespostaDeTeste(result.final_text) };
}
