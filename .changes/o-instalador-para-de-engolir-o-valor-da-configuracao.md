---
impacto: nada_mudou
secao: corrigido
titulo: O instalador para de confundir comentário com valor de configuração
---

No arquivo de exemplo que serve de base para a configuração da VPS, as
explicações ficavam na mesma linha dos valores. O instalador lê esse arquivo
linha a linha e tratava a explicação como parte do valor — então uma senha, um
endereço ou uma chave podiam chegar ao servidor com um texto extra colado no
fim, e o erro só aparecia depois, num lugar sem relação com a causa.

As explicações passaram para a linha de cima. Quem já tem o servidor rodando não
precisa refazer nada; a mudança protege quem instala do zero a partir de agora.
