/**
 * Ler o estado de elegibilidade de uma conversa via pool `pg` (o transporte do
 * agent-engine). Uma query, três tabelas: o modo do gate do canal, as travas do
 * contato, o silêncio da conversa.
 *
 * O drain (decide ENFILEIRAR) e o turno (decide RODAR) chamam isto e passam o
 * resultado para `decidirElegibilidade` — a MESMA regra pura.
 */
import type pg from "pg";

import {
  decidirElegibilidade,
  lerModoDoGate,
  type DecisaoDeElegibilidade,
  type EstadoDeElegibilidade,
} from "./gate";

interface LinhaDeElegibilidade {
  ai_gate: string | null;
  force_human: boolean | null;
  assignee_kind: string | null;
  bot_silenced_until: Date | string | null;
  ai_authorized_at: Date | string | null;
}

function comoData(v: Date | string | null): Date | number | null {
  if (v === null) return null;
  if (v instanceof Date) return v;
  if (v === "infinity") return Number.POSITIVE_INFINITY;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Roda a query e a regra. `null` = conversa não encontrada (deixe o chamador
 * decidir; o drain trata como "sem gate", segue o fluxo antigo).
 */
export async function decidirElegibilidadeDaConversa(
  pool: pg.Pool,
  input: { organizationId: string; conversationId: string; agora: Date; ttlMs: number },
): Promise<DecisaoDeElegibilidade | null> {
  const { rows } = await pool.query<LinhaDeElegibilidade>(
    `select
       cs.metadata->>'ai_gate'      as ai_gate,
       ct.force_human               as force_human,
       cv.assignee_kind             as assignee_kind,
       cv.bot_silenced_until        as bot_silenced_until,
       ct.ai_authorized_at          as ai_authorized_at
     from conversations cv
     join contacts ct
       on ct.id = cv.contact_id and ct.organization_id = cv.organization_id
     join channel_sessions cs
       on cs.id = cv.channel_session_id and cs.organization_id = cv.organization_id
     where cv.organization_id = $1 and cv.id = $2`,
    [input.organizationId, input.conversationId],
  );
  const r = rows[0];
  if (r === undefined) return null;

  const aiAuthorizedAt = comoData(r.ai_authorized_at);
  const estado: EstadoDeElegibilidade = {
    modo: lerModoDoGate(r.ai_gate),
    forceHuman: r.force_human === true,
    botSilencedUntil: comoData(r.bot_silenced_until),
    assigneeKind: r.assignee_kind,
    aiAuthorizedAt: aiAuthorizedAt instanceof Date ? aiAuthorizedAt : null,
    agora: input.agora,
    ttlMs: input.ttlMs,
  };
  return decidirElegibilidade(estado);
}
