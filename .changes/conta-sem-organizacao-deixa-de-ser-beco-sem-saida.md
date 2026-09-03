---
impacto: capacidade_nova
secao: adicionado
titulo: Conta confirmada que ficou sem empresa agora tem como terminar o cadastro
---

Ao criar a conta, o sistema confirma o e-mail e em seguida cria a empresa. Os
dois passos são separados, e o segundo pode falhar — banco indisponível por um
instante, permissão ainda propagando, disco cheio. Quando falhava, a pessoa já
estava logada, mas sem empresa nenhuma.

E aí não havia saída. O Inbox dizia "aceite um convite ou contate o admin"; a
tela de configuração inicial devolvia para a de entrar, que devolvia para o
Inbox. As duas saídas oferecidas não existem para quem instalou o sistema no
próprio servidor: não há convite para aceitar, e o administrador é a própria
pessoa. Destravar exigia mexer no banco à mão — exatamente o que instalar um
sistema pronto deveria evitar.

Agora existe uma tela para isso. Quem cai nesse estado é levado a uma página que
pede o nome da empresa e conclui o cadastro, seguindo para a configuração
inicial normalmente. Os três caminhos que antes fechavam o círculo passam a
levar até ela.

A tela só aparece para quem realmente está sem empresa: quem já tem uma é
mandado direto para o Inbox, e quem tem um convite pendente continua sendo
orientado a usar o convite em vez de abrir empresa própria. Há um limite de
tentativas por conta, porque cada acerto cria uma empresa de verdade.

Para quem opera, nada muda: nenhuma configuração nova, nenhum passo de
atualização.

A tela e o caminho são de @prevprocesso-maker, que passou por isso instalando o
sistema para um cliente.
