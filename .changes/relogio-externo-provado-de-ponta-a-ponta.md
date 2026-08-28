---
impacto: nada_mudou
secao: corrigido
titulo: O relógio externo do follow-up passou a ser testado de ponta a ponta
---

Quem roda o sistema numa hospedagem sem agendador próprio — o plano gratuito da
Vercel é o caso comum — depende de um serviço de cron externo bater de tempos em
tempos para os follow-ups andarem. Esse caminho tinha runbook e nunca tinha sido
exercitado: se ele parasse de funcionar, ninguém receberia erro, e os follow-ups
simplesmente ficariam parados.

Agora um teste automático dispara a batida de fora, como o cron real faz, e
confere que o follow-up de fato anda — e que uma batida sem a chave certa é
recusada sem mexer em nada. Você não precisa fazer nada: nada mudou no
comportamento, só passou a existir uma rede que avisa se ele quebrar.
