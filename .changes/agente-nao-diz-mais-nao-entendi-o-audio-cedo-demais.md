---
impacto: nada_mudou
secao: corrigido
titulo: Áudio que demora para transcrever não faz mais o agente dizer "não entendi"
---

Um cliente mandou um áudio perguntando sobre troca de peça de uma moto elétrica. A
transcrição terminou certinha — mas 18 segundos tarde demais: o agente já tinha
respondido "recebi seu áudio, mas não consegui identificar o conteúdo", e o cliente
teve que digitar a pergunta de novo.

A causa era um teto fixo de 45 segundos de espera pela transcrição antes de o turno
seguir sem o texto. Medindo as transcrições reais desta instalação, 45s não é raro
de estourar em áudios normais — só é curto demais para a cauda longa (minutos, quando
há retry por falha transitória), que nenhum teto razoável cobre sem o cliente esperando
minutos pela primeira resposta.

O teto passou para 120 segundos, o suficiente para cobrir esse tipo de atraso comum sem
impor uma espera longa em todo áudio. Para quem opera uma instalação, nada muda no dia
a dia.
