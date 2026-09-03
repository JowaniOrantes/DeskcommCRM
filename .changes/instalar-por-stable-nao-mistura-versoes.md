---
impacto: nada_mudou
secao: corrigido
titulo: Instalar pelo canal padrão não mistura mais versões entre os serviços
---

O DeskcommCRM roda três serviços que saem do mesmo código — o aplicativo, o
trabalhador de fundo e o agendador. Quem instala pelo canal padrão espera os
três na mesma versão.

Até agora cada um deles avançava o canal por conta própria, ao terminar de ser
publicado, sem saber se os irmãos tinham conseguido. Quando a publicação de um
falhava por um problema de infraestrutura, os outros dois seguiam em frente — e
quem instalasse naquela janela recebia uma instalação **misturada**, com peças
de versões diferentes. Aconteceu de verdade no fechamento da versão anterior.

Agora o canal só avança depois que as três imagens estão publicadas e o
aplicativo provou que sobe. Se qualquer uma falhar, o canal fica onde estava —
uma versão inteira e velha, em vez de uma nova pela metade.

E o fechamento de cada versão passa a conferir isso antes de dar por concluído:
não basta as imagens existirem, o canal precisa apontar para elas.

Nada muda para quem já tem uma instalação funcionando.
