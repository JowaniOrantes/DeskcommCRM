/**
 * ATENDIMENTO MANUAL PELO CANAL — o dono pegou o celular e respondeu o cliente
 * direto no WhatsApp (ou por outra plataforma ligada à mesma conta). A IA para
 * NESSA conversa, para não responder junto.
 *
 * ## Por que existe
 *
 * `app/api/v1/messages/_handler.ts` (composer) já silencia o bot quando o ATOR é
 * uma pessoa — mas por uma janela deslizante de 5 min. O envio feito do celular
 * do operador NÃO passa por ali: ele entra pelo webhook do provider
 * (`lib/waha/ingest.ts` `handleOutboundFromUserPhone`, `lib/channels/zernio`) e
 * era gravado como histórico sem tocar em trava nenhuma. Resultado: a IA
 * continuava respondendo por cima de quem estava atendendo à mão.
 *
 * ## O que grava, e o que NÃO grava
 *
 * Igual ao `POST /conversations/[id]/pause-ai` (o botão "assumir"):
 *   - `bot_silenced_until = 'infinity'` — silêncio DURÁVEL, o mesmo literal que
 *     os três guards do motor e `decidirElegibilidade` já leem. Não é a janela
 *     de 5 min: quem foi ao WhatsApp atender não quer a IA voltando sozinha no
 *     meio.  A volta é explícita — `reactivate-bot` / `devolverAtendimentoAoAgente`.
 *   - `last_handoff_at` / `last_handoff_reason` — rastro visível de que uma
 *     pessoa assumiu por fora.
 *
 * **NÃO toca `contacts.ai_authorized_at`.** A origem/autorização do lead é
 * estado SEPARADO (elegibilidade), não handoff. Uma resposta manual pausa a
 * conversa; não apaga que o lead veio do Respondi. Quando o humano devolve, a
 * autorização ainda está lá.
 *
 * **NÃO toca `contacts.force_human`** (trava do CONTATO inteiro — pausar uma
 * conversa não é bloquear o cliente) nem `assignee_kind` (exige um
 * `assigned_to_user_id`, e o celular do dono não é necessariamente um usuário do
 * CRM) nem `status` (mandar para `pending` diria "na fila esperando atendente",
 * o oposto de "estou atendendo").
 *
 * Idempotente: se a conversa JÁ está com silêncio no futuro (outro handoff, ou
 * este mesmo em mensagem anterior), não re-carimba.
 *
 * Fire-and-forget: a ingestão da mensagem do cliente não pode cair porque a
 * pausa falhou.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { normalizarInstante } from "@/lib/ai/elegibilidade/gate";

/** O mesmo literal do handoff e do `pause-ai`: `bot_silenced_until > now()` sempre true. */
const SILENCIO_DURAVEL = "infinity";
const MOTIVO = "Atendimento manual pelo canal (resposta fora do CRM)";

export interface PausaPorAtendimentoManualInput {
  organizationId: string;
  conversationId: string;
  /** Rótulo da origem só para log (ex.: "waha", "zernio"). */
  canal?: string;
}

/**
 * Pausa a IA numa conversa porque uma pessoa respondeu por fora do CRM.
 * Devolve `true` se pausou agora, `false` se já estava pausada ou falhou.
 */
export async function pausarIaPorAtendimentoManual(
  admin: SupabaseClient,
  input: PausaPorAtendimentoManualInput,
): Promise<boolean> {
  try {
    const { data: atual, error: readErr } = await admin
      .from("conversations")
      .select("bot_silenced_until")
      .eq("organization_id", input.organizationId)
      .eq("id", input.conversationId)
      .maybeSingle();

    if (readErr) {
      logger.warn("[atendimento-manual] leitura da conversa falhou — IA não pausada", {
        organization_id: input.organizationId,
        conversation_id: input.conversationId,
        detail: readErr.message.slice(0, 160),
      });
      return false;
    }
    if (atual == null) return false;

    // Já silenciada no futuro (infinity ou janela): não re-carimba o handoff.
    const silenciadaAte = normalizarInstante(
      (atual as { bot_silenced_until: string | null }).bot_silenced_until,
    );
    const agora = Date.now();
    const jaSilenciada =
      silenciadaAte === Number.POSITIVE_INFINITY ||
      (silenciadaAte instanceof Date && silenciadaAte.getTime() > agora) ||
      (typeof silenciadaAte === "number" && Number.isFinite(silenciadaAte) && silenciadaAte > agora);
    if (jaSilenciada) return false;

    const nowIso = new Date().toISOString();
    const { error: updErr } = await admin
      .from("conversations")
      .update({
        bot_silenced_until: SILENCIO_DURAVEL,
        last_handoff_at: nowIso,
        last_handoff_reason: MOTIVO,
      })
      .eq("organization_id", input.organizationId)
      .eq("id", input.conversationId);

    if (updErr) {
      logger.warn("[atendimento-manual] pausa da IA não gravada", {
        organization_id: input.organizationId,
        conversation_id: input.conversationId,
        detail: updErr.message.slice(0, 160),
      });
      return false;
    }

    logger.info("[atendimento-manual] IA pausada — pessoa respondeu pelo canal", {
      organization_id: input.organizationId,
      conversation_id: input.conversationId,
      canal: input.canal ?? "desconhecido",
    });
    return true;
  } catch (err) {
    logger.warn("[atendimento-manual] pausa da IA lançou", {
      organization_id: input.organizationId,
      conversation_id: input.conversationId,
      detail: err instanceof Error ? err.message.slice(0, 160) : "erro",
    });
    return false;
  }
}
