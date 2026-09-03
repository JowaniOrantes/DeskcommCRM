---
impacto: nada_mudou
secao: corrigido
titulo: Loja com catálogo grande volta a achar o próprio produto
---

Numa loja com muitos produtos cadastrados, o atendente de IA podia responder
**"não temos"** para um produto que a loja tem. E não havia como perceber: a
resposta era educada, o sistema não registrava erro nenhum, e o mesmo produto às
vezes aparecia na busca seguinte.

A causa é que a busca consultava um lote do catálogo sem definir a ordem. Sem
ordem, o banco devolve as linhas que quiser — e o produto pedido podia
simplesmente não estar no lote que veio. O limite real também era metade do que
o sistema pedia.

Agora a busca percorre o catálogo em páginas, na ordem do código, até encontrar
ou terminar. E, se o catálogo for grande demais para varrer inteiro, o atendente
**para de dizer que a loja não tem**: ele diz que não encontrou no que
conseguiu consultar e que vai confirmar com a equipe.

A diferença importa para quem está comprando: "não temos" encerra a conversa,
"vou confirmar" não.
