---
impacto: nada_mudou
secao: corrigido
titulo: O agente para de achar que está fechado por causa do fuso
---

O agente recebia o horário de cada mensagem do histórico em UTC, e não no fuso
da sua organização — três horas à frente, para quem está no horário de
Brasília. Uma mensagem enviada às 15:45 chegava até ele como 18:45.

Isso só doía em agentes instruídos a conferir o relógio antes de responder:
eles concluíam que já era fora do expediente e respondiam "estamos fechados",
citando na mesma frase o horário de atendimento dentro do qual o cliente ainda
estava. O erro passou despercebido porque o resto do agente já mostrava a hora
certa — só o horário das mensagens do histórico saía errado. Foi visto em
produção em dois dias diferentes, com clientes reais recebendo "estamos
fechados" em pleno horário comercial.

Agora o horário de cada mensagem chega ao agente já no fuso da sua organização,
o mesmo que ele usa para saber que dia e que horas são.
