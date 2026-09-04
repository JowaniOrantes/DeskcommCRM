---
impacto: nada_mudou
secao: corrigido
titulo: A quebra de mensagem em bolhas não corta mais um valor em reais no meio
---

Com "quebrar resposta em várias mensagens" ligado, o agente tratava qualquer "." como fim de
frase — inclusive o "." que separa milhar num preço em reais ("R$ 10.990"). O valor virava
duas "frases" ("R$ 10." e "990 no cartão…"), que às vezes iam para bolhas de WhatsApp
SEPARADAS (o cliente que via só a primeira lia "R$ 10" como o preço fechado de um produto de
R$ 10.990) e às vezes eram remendadas com um espaço a mais ("R$ 7. 990").

Agora um "." só conta como fim de frase quando não está entre dois dígitos.
