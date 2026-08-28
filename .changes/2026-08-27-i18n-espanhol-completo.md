---
impacto: capacidade_nova
secao: adicionado
titulo: O sistema inteiro em espanhol, com o idioma trocável em três lugares
---

Quem instala na América Latina agora escolhe o idioma **na própria instalação**,
e o sistema abre em espanhol para todo mundo da empresa — inclusive para quem
for convidado depois e nunca abriu o próprio perfil.

Antes, o espanhol existia pela metade: só as telas do dia a dia estavam
traduzidas, e o resto aparecia em português para quem tinha escolhido espanhol.
Agora a tradução cobre Agenda, Desempenho, Radar, Respostas rápidas, IA e o
painel de administração, com um teste automático que reprova qualquer texto novo
que apareça sem tradução.

O idioma se troca em três lugares, na ordem em que se costuma precisar deles:

- **No topo de qualquer tela** — o botão `PT`/`ES` ao lado do controle de tema.
  Um clique, sem procurar nada. É onde recorre quem abriu o sistema num idioma
  que não lê.
- **Na instalação** — o `install.sh` pergunta, e a resposta define o idioma da
  empresa inteira.
- **Em Configurações** — no seu perfil (só para você) ou em Organização (para
  todo mundo que entrar sem preferência própria).

Também está consertado um controle que não fazia nada: o seletor de Idioma em
Configurações › Organização era gravado no banco e nunca era lido. Quem o
mudasse não via diferença nenhuma. Agora ele vale para toda pessoa da empresa
que não tenha escolhido um idioma seu.

**As datas também acompanham o idioma.** "quinta-feira, 3 de março" vira
"jueves, 3 de marzo" — não sobrou aquele meio-termo em que a tela fala espanhol
e a data insiste no português.

Duas exceções, de propósito: os **e-mails** que o sistema envia seguem em
português (quem recebe um convite ainda não tem conta, então não há preferência
de idioma para consultar), e o **relatório de LGPD** também — ele responde a uma
lei brasileira, e mudar a forma dele conforme quem apertou o botão seria errado.

---

A tradução para espanhol é, em boa parte, contribuição de **@JowaniOrantes**, que
abriu três frentes de trabalho por conta própria: as áreas de IA e administração
(#352), o módulo de Agenda (#379) e as correções que vieram do QA visual dele.
São 57 commits e mais de 460 entradas de dicionário que este release não teria
sem esse trabalho.
