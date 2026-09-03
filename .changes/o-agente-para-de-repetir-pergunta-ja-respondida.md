---
impacto: nada_mudou
secao: corrigido
titulo: O agente para de repetir uma pergunta que o cliente já respondeu
---

Numa conversa real, o agente pediu o e-mail do cliente **quatro vezes** — com o
cliente respondendo três. Para quem está do outro lado, isso não parece um
sistema: parece desatenção.

Eram duas causas somadas.

A primeira: ao fechar cada turno, o agente anota qual é a "próxima ação". Como
essa anotação é escrita logo depois de ele perguntar e antes de a resposta
chegar, ele anotava como próxima ação **a pergunta que acabara de fazer**. No
turno seguinte essa anotação voltava no topo das instruções, acima do histórico
— e mandava perguntar de novo o que o histórico logo abaixo já respondia.

A segunda: o cadastro do contato aparecia com o e-mail em branco, e o agente lia
isso como um fato ("não tem e-mail"), com mais autoridade do que a mensagem em
que o cliente tinha acabado de digitá-lo. E como esse campo nunca é preenchido
sozinho, o pedido se repetia indefinidamente.

Agora a anotação diz explicitamente que se refere ao **depois** da resposta, o
bloco avisa que foi escrito antes da última mensagem do cliente — e que, em caso
de desacordo, vale o histórico —, e o cadastro em branco vem com a ressalva de
que a informação pode já ter sido dada na conversa.
