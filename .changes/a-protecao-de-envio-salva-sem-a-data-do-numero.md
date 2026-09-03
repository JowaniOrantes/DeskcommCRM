---
impacto: nada_mudou
secao: corrigido
titulo: A proteção de envio volta a salvar sem a data do número
---

Em **Conexões › Proteção de envio**, ajustar o horário de envio e salvar sem
preencher "este número é usado desde" devolvia *"Falha ao salvar os knobs."* e
não gravava nada — nem os campos que você tinha acabado de mudar.

Isso atingia toda instalação nova, porque essa data começa em branco. E a
armadilha era dupla: sem os limites salvos, o sistema trata o número como
recém-criado e libera pouco por dia — exatamente o teto que a pessoa abriu a
tela para corrigir.

Agora o campo em branco significa o que a tela sempre prometeu: em número novo,
ele é tratado como recém-criado. E, se você já tinha informado uma data antes,
limpar o campo não a apaga — para trocá-la, informe outra. O texto de ajuda da
tela passa a dizer isso.

Junto vai um conserto de diagnóstico: quando o banco recusa um campo, o motivo
passa a viajar junto do erro em vez de virar um "falha ao salvar" sem dono.
