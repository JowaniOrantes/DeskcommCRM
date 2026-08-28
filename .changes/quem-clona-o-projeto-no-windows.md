---
impacto: nada_mudou
secao: corrigido
titulo: Quem baixa o projeto no Windows consegue rodar os testes
---

Isto é do nosso processo de desenvolvimento, não do sistema que você usa. Quem
baixava o projeto no Windows não conseguia rodar a bateria de testes do banco:
o sistema operacional alterava os arquivos de banco de dados na cópia, e uma
conferência de integridade recusava tudo antes de o primeiro teste rodar.

Para quem opera uma VPS nada muda — o servidor sempre rodou em Linux, onde a
alteração não acontece.
