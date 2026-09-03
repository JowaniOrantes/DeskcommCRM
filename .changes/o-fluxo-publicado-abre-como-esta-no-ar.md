---
impacto: nada_mudou
secao: corrigido
titulo: Um fluxo de retorno publicado não abre mais vazio na tela
---

Um fluxo de retorno que estava **no ar e funcionando** podia abrir **em branco**
no construtor. A automação rodava normalmente e conversava com os clientes; a
tela é que não mostrava nada.

Acontecia quando o fluxo foi publicado por fora do construtor — restauração de
backup, instalação assistida, importação de outra instalação. Nesses casos o
sistema guarda a versão publicada mas não guarda uma cópia de trabalho, e a tela
só sabia abrir a cópia de trabalho.

**O risco era maior do que a tela vazia.** Quem abrisse, mexesse em qualquer
coisa e salvasse estaria salvando por cima — com o desenho vazio que a tela
mostrou. Um "publicar" depois disso trocaria o fluxo que está funcionando por
esse vazio, sem aviso nenhum.

Agora, quando não existe cópia de trabalho, a tela abre **exatamente o que está no ar**.
Quem nunca editou vê o fluxo publicado; quem tem trabalho salvo e não publicado
continua vendo o seu trabalho, que segue tendo prioridade.

Para quem opera uma instalação, nada muda no dia a dia: nenhuma configuração
nova, nenhum passo de atualização.
