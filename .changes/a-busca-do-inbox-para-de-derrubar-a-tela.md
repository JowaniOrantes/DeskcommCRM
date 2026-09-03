---
impacto: nada_mudou
secao: corrigido
titulo: Buscar um nome comum no Inbox deixa de derrubar a tela
---

Numa base com muitos contatos, buscar um nome comum — "ana", "silva", "maria" —
fazia o Inbox **parar de abrir**, com erro de servidor, em vez de mostrar a
lista. Buscar por DDD tinha o mesmo efeito, porque quatro dígitos casam todos os
celulares de uma cidade.

Não era lentidão nem lista incompleta: era a tela quebrando, e justamente na
tela onde quem atende passa o dia.

A causa: a busca por contato monta a consulta com a lista de quem casou, e essa
lista viaja dentro do endereço da requisição. Com muitos contatos casando, o
endereço passava do tamanho que o servidor aceita, e o pedido era recusado antes
de chegar ao banco.

Agora a lista é cortada pelo tamanho que cabe, não por uma quantidade fixa. Numa
busca muito ampla o resultado pode não trazer todos os contatos que casariam —
mas a tela **abre**, e a busca por conteúdo da conversa continua rodando ao lado.

Para quem opera uma instalação, nada muda no dia a dia: nenhuma configuração
nova, nenhum passo de atualização.
