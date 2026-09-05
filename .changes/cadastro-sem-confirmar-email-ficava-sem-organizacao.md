---
impacto: nada_mudou
secao: corrigido
titulo: Quem se cadastra numa instalação que não pede confirmação de e-mail para de ser mandado esperar um e-mail que não chega
---

Quem administra a instalação pode desligar a confirmação de e-mail no provedor
de autenticação — é uma escolha comum, e às vezes é o estado em que uma VPS
recém-montada já vem. Nesse modo, criar a conta **já entra no sistema**: não
existe link nenhum para clicar, porque e-mail nenhum é enviado.

A tela do cadastro não sabia disso e dizia assim mesmo: *"Enviamos um link de
confirmação para o seu e-mail. Abra o e-mail e clique no link para ativar sua
conta."* A pessoa fazia o que a tela mandou — esperava. O e-mail nunca chegava.
Ela estava, o tempo todo, do lado de dentro, com a conta pronta e sem empresa
nenhuma configurada, sem nenhuma razão para descobrir sozinha que bastava
continuar.

Agora, quando o sistema percebe que a pessoa já entrou, ele a leva direto ao
passo seguinte, em vez de mandá-la esperar: quem se cadastrou por conta própria
vai concluir a configuração da empresa, com o nome que ela mesma digitou no
cadastro já preenchido; quem se cadastrou a partir de um convite vai aceitar o
convite, e continua sem ganhar uma empresa própria por engano.

Para quem opera uma instalação, nada muda no dia a dia: nenhuma configuração
nova, nenhum passo de atualização. Quem já usa o sistema com confirmação de
e-mail ligada não vê diferença nenhuma — a tela do e-mail continua igual, porque
nesse caso o e-mail realmente vai chegar.

O achado é de @KIRAzinx566, que instalou o sistema para um cliente e o encontrou
parado nessa tela.
