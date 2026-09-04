---
impacto: nada_mudou
secao: corrigido
titulo: O agente para de achar que está fechado por causa do fuso
---

O histórico de mensagens entregava ao agente o horário de cada mensagem em
UTC, cru do banco — enquanto o relógio "## Agora" do mesmo prompt já mostrava
a hora certa no fuso da organização. Um agente instruído a comparar o
horário exato de cada mensagem contra o expediente local via uma mensagem
enviada às 15:45 (horário de São Paulo) como "18:45" e respondia que a loja
estava fechada dentro do próprio horário de atendimento que ele citava na
resposta.

Medido em produção em duas instalações distintas, no mesmo dia: uma cliente
mandou uma mensagem às 15:45 e recebeu "estamos fechados" com a oficina
ainda aberta; dois dias depois, outra cliente recebeu a mesma resposta
errada às 13h de uma sexta-feira, dentro do horário comercial citado pelo
próprio agente.

Agora cada mensagem do histórico chega ao agente já convertida para a hora
de parede do fuso da organização, com o mesmo relógio que o bloco "## Agora"
usa. O agente compara maçã com maçã.
