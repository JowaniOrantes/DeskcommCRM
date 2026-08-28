/**
 * A IDA, EXECUTADA — publica no Google o que foi marcado aqui.
 *
 * ─── Por que um worker, e não o próprio handler de marcar ────────────────
 *
 * Publicar é rede: cinco a quinze segundos de latência que não são nossos, mais
 * `invalid_grant`, `rate_limited` e 5xx do Google. Pendurar isso no POST faria a
 * pessoa esperar o Google para ver "marcado" — e faria a marcação FALHAR quando
 * o Google estiver fora, sendo que a linha no CRM é a que importa. É a mesma
 * razão pela qual esta base proíbe trigger que faz HTTP.
 *
 * ─── O que decide quem vai ───────────────────────────────────────────────
 *
 * `google_synced_at is null` (nunca foi) **ou** `updated_at > google_synced_at`
 * (mudou depois da última ida). Remarcar e cancelar mexem em `updated_at`, então
 * as duas operações entram por este mesmo caminho — não há fila própria para
 * cada verbo.
 *
 * ─── E o filtro de membro ativo entra aqui também ────────────────────────
 *
 * `apenasDeMembrosAtivos` já impede LER a agenda pessoal de quem saiu da
 * organização. Escrever nela é o outro lado da mesma porta: mandar compromisso
 * da clínica para o calendário pessoal de um ex-funcionário é pior que ler, e a
 * mesma função responde às duas perguntas porque a pergunta é uma só — esta
 * pessoa ainda é do time?
 */
import { NextResponse, type NextRequest } from "next/server";

import { apenasDeMembrosAtivos } from "@/lib/agenda/google/membros";
import { apagarNoGoogle, publicarNoGoogle } from "@/lib/agenda/google/escrita";
import type { AgendamentoParaGoogle } from "@/lib/agenda/google/evento";
import { audit } from "@/lib/audit";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { PROVEDOR_GOOGLE } from "@/lib/agenda/tipos";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptWebhookSecret } from "@/lib/webhooks/secrets";

export const dynamic = "force-dynamic";

/** Teto por rodada: o cron roda a cada 5min, e ida longa demais estoura o job. */
const TETO_POR_RODADA = 50;

interface LinhaParaIda {
  id: string;
  organization_id: string;
  owner_user_id: string | null;
  title: string | null;
  description: string | null;
  starts_at: string;
  ends_at: string;
  time_zone: string;
  status: string;
  location_kind: string;
  location_details: string | null;
  google_event_id: string | null;
}

function autorizado(req: NextRequest): boolean {
  const cabecalho = req.headers.get("authorization") ?? "";
  const aceitos = [env.INTERNAL_CRON_SECRET, env.INTERNAL_SECRET].filter(Boolean);
  // Fail-closed: sem segredo configurado, ninguém entra.
  return aceitos.length > 0 && aceitos.some((s) => cabecalho === `Bearer ${s}`);
}

async function executar(req: NextRequest): Promise<Response> {
  if (!autorizado(req)) {
    return NextResponse.json(
      { error: { code: "unauthenticated", message: "cron secret inválido" } },
      { status: 401 },
    );
  }

  const admin = createAdminClient();
  const resumo = { candidatos: 0, publicados: 0, apagados: 0, falhas: 0, semConexao: 0 };

  const { data: pendentes, error: erroLeitura } = await admin
    .from("calendar_appointments")
    .select(
      "id, organization_id, owner_user_id, title, description, starts_at, ends_at, time_zone, status, location_kind, location_details, google_event_id",
    )
    // ⚠️ NÃO volte a `.or("…,updated_at.gt.google_synced_at")`.
    //
    // O PostgREST trata o lado DIREITO de `gt.` como VALOR LITERAL, nunca como
    // nome de coluna: ele tentava converter a string "google_synced_at" em
    // `timestamptz` e recusava a consulta INTEIRA. Em produção isso era um
    // `warn` a cada 5 minutos desde o deploy da v1.7.0 e ZERO compromissos
    // empurrados — a ida ao Google nunca aconteceu em instalação nenhuma.
    //
    // `needs_google_push` é coluna GERADA (migration 0200) que carrega
    // exatamente a mesma pergunta, num filtro que o PostgREST sabe fazer.
    .eq("needs_google_push", true)
    .not("owner_user_id", "is", null)
    .order("starts_at", { ascending: true })
    .limit(TETO_POR_RODADA);

  if (erroLeitura) {
    logger.warn("[agenda-google-push] leitura falhou", { error: erroLeitura.message });
    return NextResponse.json({ error: { code: "internal_error", message: erroLeitura.message } }, { status: 500 });
  }

  const linhas = (pendentes ?? []) as LinhaParaIda[];
  resumo.candidatos = linhas.length;
  if (linhas.length === 0) {
    // Rodada vazia NÃO audita: o repo já pagou 95% do audit log em batida de
    // cron sem efeito. Auditar é para quando houve efeito.
    return NextResponse.json({ data: resumo });
  }

  // Só de quem ainda é do time — mesma função que impede a leitura.
  const doTime = await apenasDeMembrosAtivos(
    admin,
    linhas.map((l) => ({ ...l, user_id: l.owner_user_id as string })),
  );

  for (const linha of doTime) {
    const { data: conexoes } = await admin
      .from("calendar_connections")
      .select("id, status, oauth_access_token_encrypted, account_email")
      .eq("organization_id", linha.organization_id)
      .eq("user_id", linha.owner_user_id as string)
      // A CONSTANTE. Era `"google"`, que o CHECK proíbe: o worker achava o
      // compromisso pendente, não achava conexão nenhuma, contava `semConexao` e
      // seguia. A ida CRM→Google nunca aconteceu em instalação alguma — e sem
      // rastro, porque rodada sem efeito não audita (o que é doutrina e está
      // certo: o defeito era não haver efeito, não a ausência de log).
      .eq("provider", PROVEDOR_GOOGLE)
      .eq("status", "healthy")
      .limit(1);

    const conexao = conexoes?.[0];
    if (!conexao?.oauth_access_token_encrypted) {
      // Sem agenda conectada não é falha: é o estado normal de quem não conectou.
      // Marcar `google_synced_at` aqui faria a ida "acontecer" sem ter acontecido,
      // e a linha nunca mais seria candidata quando a pessoa conectasse.
      resumo.semConexao += 1;
      continue;
    }

    const accessToken = await decryptWebhookSecret(admin, conexao.oauth_access_token_encrypted);
    const calendario = conexao.account_email;
    if (!accessToken || !calendario) {
      resumo.falhas += 1;
      continue;
    }

    const cancelado = linha.status === "cancelled";
    const efeito = cancelado
      ? await apagarNoGoogle(accessToken, calendario, linha.id)
      : await publicarNoGoogle(accessToken, calendario, {
          id: linha.id,
          organization_id: linha.organization_id,
          title: linha.title ?? "Agendamento",
          description: linha.description,
          starts_at: linha.starts_at,
          ends_at: linha.ends_at,
          time_zone: linha.time_zone,
          status: linha.status,
          location_kind: linha.location_kind,
          location_details: linha.location_details,
        } as AgendamentoParaGoogle);

    if (!efeito.ok) {
      resumo.falhas += 1;
      // O erro FICA NA LINHA, não só no log: `google_sync_error` é o que a tela
      // pode mostrar. Erro que só existe em log é estoque morto.
      await admin
        .from("calendar_appointments")
        .update({ google_sync_error: `${efeito.classificacao.desfecho}: ${efeito.detalhe}` })
        .eq("id", linha.id);
      continue;
    }

    await admin
      .from("calendar_appointments")
      .update({
        google_connection_id: conexao.id,
        google_calendar_id: calendario,
        google_event_id: cancelado ? null : efeito.eventoId,
        google_sequence: efeito.sequence,
        google_synced_at: new Date().toISOString(),
        google_sync_error: null,
      })
      .eq("id", linha.id);

    if (cancelado) resumo.apagados += 1;
    else resumo.publicados += 1;
  }

  // Auditar SÓ quando houve efeito — a rodada que não fez nada não é mutação.
  if (resumo.publicados > 0 || resumo.apagados > 0 || resumo.falhas > 0) {
    await audit({
      action: "agenda.google.sync_executado",
      organizationId: doTime[0]?.organization_id ?? "",
      metadata: { direcao: "ida", ...resumo },
    });
  }

  return NextResponse.json({ data: resumo });
}

export async function GET(req: NextRequest): Promise<Response> {
  return executar(req);
}

export async function POST(req: NextRequest): Promise<Response> {
  return executar(req);
}
