---
impacto: nada_mudou
secao: corrigido
titulo: Quem não é administrador volta a ver a lista de credenciais de IA
---

Um membro da equipe que não é administrador abria **IA › Provedores** e via a
lista **vazia** — concluindo que a organização não tinha nenhuma chave
cadastrada, quando tinha.

Não havia erro nem aviso: a tela respondia normalmente, só que sem nenhuma
linha. É a pior forma de falhar, porque parece uma informação verdadeira.

A causa foi um ajuste de segurança anterior, que fechou a **escrita** dessas
credenciais para quem não é administrador — e, sem querer, fechou a **leitura**
junto. A tela de provedores é somente-leitura para esses papéis e nunca deveria
ter sido afetada.

Agora a leitura volta a valer para todo membro da organização, e a escrita
continua restrita a administrador, como estava.

A chave em si segue protegida: ela nunca foi exposta por essa tela, e continua
inalcançável para qualquer papel — inclusive para quem passou a enxergar a
lista.
