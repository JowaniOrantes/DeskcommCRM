---
impacto: nada_mudou
secao: corrigido
titulo: O nome, a descrição e a ordem do agente passam a ser salvos de verdade
---

Na tela de um agente, trocar o **Nome** não mudava nada. A pessoa digitava,
salvava, publicava — e o nome continuava o mesmo, no editor e na lista.
**Descrição** e **Ordem de preferência** sumiam do mesmo jeito.

O que tornava isso difícil de perceber é que nada falhava: o campo aceitava a
digitação, o aviso verde dizia "Rascunho salvo", e a publicação respondia com
sucesso. Todas essas mensagens eram verdadeiras — a respeito da **versão**, que
era a única coisa realmente gravada. Recarregar a página não ajudava, porque o
valor nunca chegou a ser gravado.

Agora os três são salvos junto com o rascunho, e a lista de agentes reflete o
nome novo na hora.

Dois detalhes que vêm junto: apagar a descrição realmente a apaga (antes o campo
vazio seria interpretado como "não mexi"), e uma ordem de preferência fora de
0 a 1000 é avisada embaixo do campo, em vez de virar erro genérico depois.
