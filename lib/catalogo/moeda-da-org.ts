import type { SupabaseClient } from "@supabase/supabase-js";

import { MOEDA_PADRAO } from "@/lib/money";

/**
 * A moeda que a organização declarou — a fonte de `catalog_products.moeda`.
 *
 * ─── Por que uma função, e não `select` inline nas rotas ───────────────────
 *
 * São DOIS caminhos de escrita no catálogo, e eles precisam responder igual: o
 * cadastro de um produto (`POST /api/v1/products`) e o import por planilha,
 * que grava em lote. Duas leituras inline divergem no dia em que uma ganhar
 * fallback e a outra não — e a divergência apareceria como um catálogo com
 * duas moedas dentro da mesma organização, que é justamente o que a coluna
 * existe para impedir.
 *
 * ─── Por que o fallback é 'BRL', e não um erro ─────────────────────────────
 *
 * Se a linha da organização não vier (RLS negando, linha removida no meio da
 * requisição), 'BRL' é o MESMO valor que o `default` da coluna gravaria se
 * ninguém mandasse nada — ou seja, o comportamento de antes desta feature.
 * Derrubar o cadastro do produto porque a leitura de um campo de configuração
 * falhou seria trocar um rótulo errado por um formulário que não salva.
 *
 * ⚠️ O que esta função NUNCA faz é aceitar a moeda de quem chamou. O corpo da
 * requisição não decide unidade, pela mesma razão que não decide escopo
 * (`organization_id` resolvido de fonte confiável, CLAUDE.md multi-tenancy).
 * `produtoCreateSchema` nem declara o campo, então o Zod o descarta antes.
 */
export async function moedaDaOrganizacao(
  supabase: SupabaseClient,
  orgId: string,
): Promise<string> {
  const { data } = await supabase
    .from("organizations")
    .select("currency")
    .eq("id", orgId)
    .maybeSingle();

  const declarada = (data as { currency?: string | null } | null)?.currency;
  return declarada ?? MOEDA_PADRAO;
}
