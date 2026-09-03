import { describe, expect, it, vi } from "vitest";

import { rascunhoDoFluxo } from "@/lib/followup/rascunho";

/**
 * FLUXO PUBLICADO NÃO ABRE VAZIO NO CONSTRUTOR.
 *
 * ═══ O defeito, medido numa instalação real ═════════════════════════════════
 *
 * Um fluxo de 23 nós PUBLICADO e ATIVO abria vazio na tela. A versão ativa
 * estava lá, o motor a estava usando para conversar com clientes, e o canvas
 * desenhava nada — porque ele lê `draft_graph`, e `draft_graph` era NULL.
 *
 * Acontece sempre que a versão nasce por fora do construtor: publicação por
 * script, restauração de backup, importação de outra instalação. O ponteiro
 * ganha `active_version_id` e nunca ganha rascunho.
 *
 * ⚠️ E O ESTRAGO NÃO PARA EM "A TELA ESTÁ VAZIA". No `FlowCanvas`, o mesmo
 * `?? EMPTY_GRAPH` alimentava `savedGraph`. Bastava arrastar um nó e salvar
 * para o rascunho virar quase-nada, e o "Publicar" seguinte trocaria o fluxo
 * que está NO AR por esse quase-nada. A tela oferecia publicar por cima de um
 * fluxo que ela não conseguia mostrar.
 */

const GRAFO_NO_AR = {
  nodes: [
    { id: "t1", type: "trigger", label: "Conversa esfriou", position: { x: 0, y: 0 }, config: {} },
    { id: "e1", type: "end", label: "Fim", position: { x: 200, y: 0 }, config: { outcome: "exhausted" } },
  ],
  edges: [{ id: "a", source: "t1", target: "e1", priority: 0, condition: { type: "always" } }],
};

/** Dublê mínimo do PostgREST: só o encadeamento que `rascunhoDoFluxo` usa. */
function supabaseFake(versao: unknown, espiao?: (filtros: Record<string, string>) => void) {
  const filtros: Record<string, string> = {};
  const chain = {
    select: () => chain,
    eq: (col: string, val: string) => {
      filtros[col] = val;
      return chain;
    },
    maybeSingle: async () => {
      espiao?.(filtros);
      return { data: versao, error: null };
    },
  };
  return { from: () => chain } as never;
}

describe("o rascunho que a tela desenha", () => {
  it("rascunho AUSENTE com versão publicada: abre o que está NO AR", () => {
    return expect(
      rascunhoDoFluxo(
        supabaseFake({ graph: GRAFO_NO_AR }),
        { draft_graph: null, active_version_id: "v1" },
        "org-1",
      ),
    ).resolves.toEqual(GRAFO_NO_AR);
  });

  it("rascunho PRESENTE vence a versão publicada — nunca sobrescreve edição em curso", () => {
    // O controle que impede o conserto de virar outro defeito: quem tem
    // trabalho salvo e não publicado não pode ver esse trabalho sumir.
    const rascunho = { nodes: [{ id: "x" }], edges: [] };
    return expect(
      rascunhoDoFluxo(
        supabaseFake({ graph: GRAFO_NO_AR }),
        { draft_graph: rascunho, active_version_id: "v1" },
        "org-1",
      ),
    ).resolves.toEqual(rascunho);
  });

  it("fluxo NOVO de verdade (sem rascunho e sem versão) abre em branco", () => {
    // Sem este caso, "sempre buscar a versão" satisfaria o primeiro — e o
    // canvas em branco é a resposta certa para quem está começando.
    return expect(
      rascunhoDoFluxo(supabaseFake(null), { draft_graph: null, active_version_id: null }, "org-1"),
    ).resolves.toBeNull();
  });

  it("a busca da versão é filtrada por ORGANIZAÇÃO, não só por id", () => {
    // `active_version_id` vem de uma linha que a RLS já filtrou, mas a consulta
    // seguinte é nova: sem o filtro de org, um id vazado leria o fluxo de outro
    // tenant. Regra dura nº 10 do CLAUDE.md — o filtro é programático, sempre.
    const visto: Record<string, string>[] = [];
    return rascunhoDoFluxo(
      supabaseFake({ graph: GRAFO_NO_AR }, (f) => visto.push({ ...f })),
      { draft_graph: null, active_version_id: "v1" },
      "org-1",
    ).then(() => {
      expect(visto[0]).toEqual({ id: "v1", organization_id: "org-1" });
    });
  });

  it("falha ao ler a versão degrada para branco, e não explode a tela", () => {
    // ⚠️ O dublê aceita QUALQUER número de `.eq()`, de propósito. A primeira
    // versão encadeava exatamente dois, e aí ele reprovava junto com o caso do
    // filtro de organização quando um `.eq` era removido — dois vermelhos, um
    // defeito só. Teste que quebra pela FORMA do dublê não mede o que promete.
    const chain: Record<string, unknown> = {};
    chain.select = () => chain;
    chain.eq = () => chain;
    chain.maybeSingle = async () => ({ data: null, error: { message: "boom" } });
    const quebrado = { from: () => chain } as never;
    return expect(
      rascunhoDoFluxo(quebrado, { draft_graph: null, active_version_id: "v1" }, "org-1"),
    ).resolves.toBeNull();
  });
});
