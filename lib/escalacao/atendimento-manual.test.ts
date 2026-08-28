import { describe, expect, it, vi } from "vitest";

import { pausarIaPorAtendimentoManual } from "./atendimento-manual";

const ORG = "11111111-1111-4111-8111-111111111111";
const CONV = "22222222-2222-4222-8222-222222222222";

/**
 * Dublê do supabase-js que registra os UPDATEs em `conversations`.
 * `silencedUntil` alimenta o SELECT inicial.
 */
function adminStub(silencedUntil: string | null) {
  const updates: Array<Record<string, unknown>> = [];
  const chain = {
    select: () => chain,
    update: (patch: Record<string, unknown>) => {
      updates.push(patch);
      return chain;
    },
    eq: () => chain,
    maybeSingle: () => Promise.resolve({ data: { bot_silenced_until: silencedUntil }, error: null }),
    then: (r: (v: unknown) => unknown) => Promise.resolve({ error: null }).then(r),
  };
  return { admin: { from: vi.fn(() => chain) } as never, updates };
}

describe("pausarIaPorAtendimentoManual", () => {
  it("conversa ativa (sem silêncio): grava silêncio DURÁVEL + rastro de handoff", async () => {
    const { admin, updates } = adminStub(null);
    const pausou = await pausarIaPorAtendimentoManual(admin, {
      organizationId: ORG,
      conversationId: CONV,
      canal: "waha",
    });
    expect(pausou).toBe(true);
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({
      bot_silenced_until: "infinity",
      last_handoff_reason: expect.stringContaining("Atendimento manual"),
    });
    expect(updates[0]).toHaveProperty("last_handoff_at");
  });

  it("NÃO toca ai_authorized_at / force_human / status / assignee_kind", async () => {
    const { admin, updates } = adminStub(null);
    await pausarIaPorAtendimentoManual(admin, { organizationId: ORG, conversationId: CONV });
    const patch = updates[0] ?? {};
    expect(patch).not.toHaveProperty("ai_authorized_at");
    expect(patch).not.toHaveProperty("ai_authorized_reason");
    expect(patch).not.toHaveProperty("force_human");
    expect(patch).not.toHaveProperty("status");
    expect(patch).not.toHaveProperty("assignee_kind");
  });

  it("idempotente: já silenciada com 'infinity' → não re-carimba", async () => {
    const { admin, updates } = adminStub("infinity");
    const pausou = await pausarIaPorAtendimentoManual(admin, { organizationId: ORG, conversationId: CONV });
    expect(pausou).toBe(false);
    expect(updates).toHaveLength(0);
  });

  it("idempotente: já silenciada por janela futura → não re-carimba", async () => {
    const futuro = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { admin, updates } = adminStub(futuro);
    const pausou = await pausarIaPorAtendimentoManual(admin, { organizationId: ORG, conversationId: CONV });
    expect(pausou).toBe(false);
    expect(updates).toHaveLength(0);
  });

  it("silêncio no PASSADO (expirado) → pausa de novo", async () => {
    const passado = new Date(Date.now() - 60 * 1000).toISOString();
    const { admin, updates } = adminStub(passado);
    const pausou = await pausarIaPorAtendimentoManual(admin, { organizationId: ORG, conversationId: CONV });
    expect(pausou).toBe(true);
    expect(updates).toHaveLength(1);
  });

  it("conversa inexistente → não faz nada", async () => {
    const chain = {
      select: () => chain,
      update: () => chain,
      eq: () => chain,
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
    };
    const admin = { from: vi.fn(() => chain) } as never;
    const pausou = await pausarIaPorAtendimentoManual(admin, { organizationId: ORG, conversationId: CONV });
    expect(pausou).toBe(false);
  });
});
