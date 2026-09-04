---
impacto: nada_mudou
secao: corrigido
titulo: O aviso de "canal calado" para de ficar preso aberto na Central
---

Quando a janela de envio do WhatsApp fechava (fora do horário anti-banimento,
por padrão 7h–22h), a Central mostrava um aviso avisando que as respostas
estavam esperando a janela abrir. O aviso deveria desaparecer sozinho assim
que a janela reabrisse — e não desaparecia. Ele ficava aberto o dia inteiro,
mesmo com o agente respondendo normalmente, dando a impressão de canal (ou
loja) fechado quando não estava.

A causa era uma coluna que o código esperava e o banco não tinha:
`agent_inbox_items.resolved_at`. Toda tentativa de fechar o aviso falhava
silenciosamente. Agora a coluna existe, e o aviso fecha sozinho no mesmo
turno em que a janela é encontrada aberta, como sempre foi a intenção.
