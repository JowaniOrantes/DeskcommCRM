---
impacto: nada_mudou
secao: corrigido
titulo: O compromisso marcado aqui passa a aparecer na Agenda do Google — e o que está ocupado lá aparece aqui
---

Quem conectou a Agenda do Google tinha a integração **ligada e sem efeito nenhum**.
Valia nas duas direções, e nada na tela dizia isso.

**Nada saía daqui.** O compromisso era marcado, o sistema tentava criá-lo lá a
cada cinco minutos, e o Google recusava todas as vezes — por um detalhe de
formato. O erro era registrado só como "HTTP 400", sem o motivo que o Google
mandava junto. Por isso a falha durou tanto: dava para ver que não funcionava, e
não dava para saber por quê. Isso nunca funcionou em instalação nenhuma; os
compromissos já marcados sobem na próxima sincronização.

**E o que estava ocupado lá não era desenhado aqui.** O horário já era
respeitado — ninguém conseguia marcar em cima —, mas o bloco não aparecia na
grade. O dono via a agenda vazia e o horário indisponível ao mesmo tempo. Agora o
bloco aparece, marcado como *Ocupado*.

O **nome** do evento particular continua não aparecendo, de propósito: a agenda
conectada é pessoal de quem atende, e esta tela é vista pela gestão.

**Quando o Google recusa o acesso**, a tela deixa de mandar "tente de novo" —
conselho que não funcionaria, porque a causa costuma ser a API do Google Agenda
desligada no projeto do Google Cloud. Agora ela diz onde ligar.

Para quem opera, nada muda no dia a dia.

O conserto é de @Clalber, que diagnosticou os três defeitos e provou a correção
com tráfego real.
