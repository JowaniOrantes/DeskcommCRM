---
impacto: nada_mudou
secao: corrigido
titulo: Configuração de fila malformada deixa de ser confundida com serviço fora do ar
---

O sistema usa um serviço de fila para contar tentativas de login e evitar
trabalho repetido. Quando o endereço dele sai do arquivo de configuração com um
pedaço a mais — aspas coladas, a linha duplicada, uma quebra vinda de um script
—, o sistema tentava usar assim e reportava a mesma coisa que reporta quando o
serviço está mesmo fora do ar.

Os dois diagnósticos mandam você para lugares opostos: um pede para reiniciar um
serviço que estava de pé o tempo todo; o outro, para apagar duas aspas no
arquivo. Confundir os dois já custou uma tarde numa instalação real.

Agora a forma do valor é conferida antes do uso. A página de saúde passa a dizer
que a configuração está inválida, em vez de acusar a rede. Endereço com porta e
sem HTTPS, como o do kit de instalação, continua sendo aceito.

O achado é de @prevprocesso-maker.
