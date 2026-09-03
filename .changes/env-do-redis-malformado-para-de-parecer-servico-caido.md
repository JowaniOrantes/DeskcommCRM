---
impacto: nada_mudou
secao: corrigido
titulo: Configuração de fila malformada deixa de ser confundida com serviço fora do ar
---

O sistema usa um serviço de fila (Redis) para contar tentativas de login e
evitar trabalho repetido. O endereço e a senha dele ficam no arquivo de
configuração da instalação.

Quando esse valor sai do arquivo com um pedaço a mais — as aspas coladas junto,
a linha inteira duplicada, uma quebra de linha vinda de um script de instalação
—, o sistema não reclamava. Ele tentava usar assim, falhava, e reportava a mesma
coisa que reporta quando o serviço está mesmo fora do ar: *não consegui falar
com a fila*.

Esses dois diagnósticos mandam você para lugares opostos. Um pede para
reiniciar um serviço — que estava de pé o tempo todo. O outro pede para abrir o
arquivo e apagar duas aspas. Confundir os dois já custou uma tarde inteira numa
instalação real.

Agora o sistema confere a forma do valor antes de tentar usá-lo. Na página de
saúde, o motivo passa a dizer `configuracao_invalida` em vez de um erro de rede,
e quem tem a chave interna vê qual valor está malformado. Nos dois lugares que
falam com a fila, um valor malformado para de virar uma tentativa de conexão
condenada a cada login.

Nada muda para quem já está com a configuração certa: endereço com porta e sem
HTTPS, como o do kit de instalação, continua sendo aceito.

O achado é de @prevprocesso-maker, que percebeu o problema instalando o sistema
para um cliente.
