---
impacto: nada_mudou
secao: corrigido
titulo: Sete alertas de segurança em bibliotecas de terceiros foram fechados
---

O GitHub apontava sete alertas de segurança em bibliotecas que o DeskcommCRM não
usa diretamente — elas chegam junto com outras que ele usa. São quatro em
`fast-uri` (confusão de endereço ao normalizar uma URL malformada), dois em `qs`
(contorno do limite de tamanho de lista e travamento por entrada preparada) e um
em `browserslist`.

As três entraram no piso de versão que o projeto já mantém para casos assim, sem
subir de versão maior: `fast-uri` 3.1.7, `qs` 6.16.0 e `browserslist` 4.28.8.

Nada muda para quem opera a instalação: são correções de bibliotecas internas,
sem migration e sem passo de atualização.

Isto veio da contribuição de Maurilio Garcia (**@maugarciasa**), no PR #556.
