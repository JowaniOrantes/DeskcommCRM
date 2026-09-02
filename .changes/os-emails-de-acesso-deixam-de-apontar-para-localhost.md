---
impacto: nada_mudou
secao: corrigido
titulo: Os e-mails de acesso deixam de apontar para um endereço que não existe
---

Numa instalação feita pelo caminho documentado, os e-mails de **"esqueci minha
senha"**, de confirmação de cadastro e de aceite de convite chegavam com um link
para `localhost:3000` — um endereço que só existe na máquina de quem programa.
O e-mail chegava, a pessoa clicava, e o navegador dizia que a página não existe.
Na prática, **ninguém conseguia redefinir a própria senha**.

O endereço certo mora no painel do Supabase, e o instalador já sabia configurá-lo
sozinho — só que precisava de um token que ele nunca pedia. O aviso existia, mas
saía no meio de um registro de dez minutos, logo antes de uma tela verde dizendo
"Instalação concluída". Ninguém voltava para ler.

Agora o instalador pergunta esse token (é opcional, e **não fica salvo** — ele
abre a conta inteira do Supabase, então é usado uma vez e descartado). Quem
preferir pular continua podendo: a instalação termina repetindo o passo que
falta, com o seu domínio já preenchido, em vez de deixar a descoberta para o dia
em que alguém esquecer a senha.
