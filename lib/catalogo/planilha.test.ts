import { describe, expect, it } from "vitest";

import { lerPlanilha } from "./planilha";

/**
 * `traduzir()` real só troca a CHAVE que bate byte a byte com uma entrada do
 * dicionário; o resto degrada para o próprio texto (`lib/i18n/dicionario.ts`).
 * Um mock que maiusculiza QUALQUER string escondia o bug real: a chave que o
 * código montava (`") — escreva assim…"`, com o parêntese dentro de `t()`)
 * nunca bateu com a entrada do dicionário (sem o parêntese) — e um mock
 * "universal" não reproduz esse descasamento, porque ele nunca falha em
 * traduzir nada. Este fake replica o comportamento de fallback: só a chave
 * que está no mapa mock é transformada; o resto sai como entrou.
 */
const DICIONARIO_FAKE: Record<string, string> = {
  "preço não reconhecido (": "PRECIO NO RECONOCIDO (",
  " — escreva assim: 5.499,00": " — ESCRÍBALO ASÍ: 5.499,00",
  "custo não reconhecido (": "COSTO NO RECONOCIDO (",
  "código repetido na planilha (": "CÓDIGO REPETIDO EN LA PLANILLA (",
};
const gritar = (texto: string): string => DICIONARIO_FAKE[texto] ?? texto;

describe("lerPlanilha — mensagens de erro passam por t()", () => {
  it("traduz a mensagem de preço não reconhecido por completo, incluindo o texto após o valor cru", () => {
    const csv = "codigo,nome,preco\nX1,Produto,abc\n";
    const resultado = lerPlanilha(csv, gritar);
    if ("erro" in resultado) throw new Error("não deveria ser erro de planilha inteira");
    expect(resultado.erros).toHaveLength(1);
    // O valor cru ("abc") não passa por t() — só o texto fixo ao redor, e
    // TODO ele: um pedaço que ficasse fora de `_t()` bateria com uma chave
    // ausente do DICIONARIO_FAKE e sairia em português, reprovando o teste.
    const motivo = resultado.erros[0]!.motivo;
    expect(motivo).toBe('PRECIO NO RECONOCIDO ("abc") — ESCRÍBALO ASÍ: 5.499,00');
  });

  it("traduz custo não reconhecido por completo", () => {
    const csv = "codigo,nome,preco,custo\nX1,Produto,10.00,xyz\n";
    const resultado = lerPlanilha(csv, gritar);
    if ("erro" in resultado) throw new Error("não deveria ser erro de planilha inteira");
    expect(resultado.erros[0]!.motivo).toBe('COSTO NO RECONOCIDO ("xyz")');
  });

  it("traduz código repetido por completo", () => {
    const csv = "codigo,nome,preco\nDUP,Um,10.00\nDUP,Dois,20.00\n";
    const resultado = lerPlanilha(csv, gritar);
    if ("erro" in resultado) throw new Error("não deveria ser erro de planilha inteira");
    expect(resultado.erros[0]!.motivo).toBe('CÓDIGO REPETIDO EN LA PLANILLA ("DUP")');
  });

  it("sem função t: comportamento idêntico ao de antes (degrada para o texto original)", () => {
    const csv = "codigo,nome,preco\nX1,Produto,abc\n";
    const resultado = lerPlanilha(csv);
    if ("erro" in resultado) throw new Error("não deveria ser erro de planilha inteira");
    expect(resultado.erros[0]!.motivo).toBe('preço não reconhecido ("abc") — escreva assim: 5.499,00');
  });
});
