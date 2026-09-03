# TRIAGEM.md — o procedimento de triagem de PR

Este arquivo é o procedimento inteiro. O comando `/triagem-de-pr` é só a porta.

**Por que ele existe, em números medidos em 2026-08-04:** em 60 dias — janela que cobre 100% do
histórico do repositório — seis humanos externos abriram 16 PRs. **Quinze mergeados, zero fechados.**
A taxa de rejeição é zero. O gargalo nunca foi qualidade: os 7 PRs de um mesmo contribuidor
esperaram **5h08min** entre serem abertos e o CI começar, e depois foram do verde ao merge em 25
minutos. Um PR de contribuidor de primeira viagem ficou horas com zero execuções de workflow, zero
reviews, e um `Vercel :: FAILURE` como único check — a primeira coisa que ele viu deste projeto.

Logo: **esta triagem não é um porteiro.** Ela é uma desbloqueadora que, depois de desbloquear,
verifica com rigor. As duas coisas nesta ordem.

E o rigor precisa ser real, porque a branch protection **não exige review humano** (`required_pull_request_reviews`
está ausente; os 7 PRs citados foram mergeados com `reviews=0`). Não há rede embaixo de você. Erro
seu entra na `main`.

---

## 0. Âncora — o passe que impede o erro mais caro

```bash
git fetch origin
MAIN=$(git rev-parse origin/main)
```

Daqui em diante, **todo** config de gate se lê por `git show origin/main:<path>`. Nunca do disco.

Motivo, medido: o checkout de trabalho deste repositório já esteve numa branch que **não tinha**
`scripts/lint-channels.ts`, não tinha `.github/workflows/e2e.yml` e ainda usava Node 20 no
`perf.yml`. Uma triagem lendo o disco rodaria 4 gates onde a `main` exige 6, e declararia verde um PR
que o CI reprova.

O SHA curto da `main` entra em **toda** afirmação daí em diante. Número sem SHA não compara.

---

## 1. Acolhida — em minutos, sem uma linha de avaliação

Nesta ordem:

1. Liberar o CI do fork. **`gh pr checks` NÃO mostra workflow parado esperando aprovação** — ele
   lista só o que já começou, então um PR travado aparece como se não tivesse check nenhum, e a
   acolhida promete "acabei de liberar" sem ter liberado. A sonda que enxerga é o campo
   `conclusion`, e o comando é este, sempre, antes de qualquer outra coisa:

   ```bash
   BR=$(gh pr view <n> --json headRefName --jq .headRefName)
   for id in $(gh api repos/{owner}/{repo}/actions/runs \
                 --jq "[.workflow_runs[] | select(.head_branch==\"$BR\" and .conclusion==\"action_required\")] | .[].id"); do
     gh api -X POST "repos/{owner}/{repo}/actions/runs/$id/approve"
   done
   ```

   Medido: o PR #176 ficou **6 dias** aberto e, quando a triagem chegou, os 4 workflows estavam em
   `action_required` desde o primeiro push. A latência de 5h08min que este arquivo cita não é
   lentidão de runner — é PR esperando um humano clicar.
2. Aplicar `triagem:recebido` + as labels `area/*` derivadas do diff.
3. Postar a acolhida — molde em `references/resposta-ao-contribuidor.md`, seção *Acolhida*.

**A liberação do CI é o primeiro comando da triagem, antes de ler o diff.** Medido em 2026-09-03: numa fila de 26 PRs, **12 workflows** de cinco contribuidores estavam parados em `action_required`, um deles havia mais de um dia — e três PRs tinham **zero** execuções no `head_sha` (ver modo de falha 17). Cada minuto entre abrir o PR e liberar é latência pura, que é o gargalo que este documento existe para matar. Libere primeiro; avalie depois.

A acolhida **não contém juízo técnico**. É isso, e só isso, que a torna segura de ser automática:
ela não pode estar errada sobre o mérito porque não fala do mérito. Ela diz três coisas — o `Vercel`
vermelho é esperado em fork e não é culpa dele, o CI está sendo liberado, e quando vem o veredito.

Todo comentário desta triagem abre com a âncora invisível `<!-- triagem-de-pr:v1:pass=N -->`. Leia as
âncoras existentes antes de escrever: **acolhida nunca é postada duas vezes.**

---

## 2. Raio de dano — decide quanto se gasta

| o PR toca | passes obrigatórios |
|---|---|
| só `.md`, `docs/` | 3, 9, 10 |
| só `package.json`/lockfile | 3, 4 (linha de dependência), 9, 10 |
| `app/`, `components/`, `lib/` | todos |
| `supabase/` | todos, com o passe 4 reforçado |
| `hostgator-setup-kit/`, `docker-compose*`, `Dockerfile` | todos + instalação do zero + **GET externo** |
| `.github/workflows/` vindo de fork | todos + leitura linha a linha |

PR pequeno não paga pipeline caro. Isso não é economia: triagem lenta reintroduz exatamente a
latência que ela existe para matar.

---

## 3. Gates — na prévia do merge, não na branch

`strict=false` na branch protection: um PR pode ser mergeado sem estar rebasado na `main`. O CI testa
**a branch**; o que vai para produção é **o merge**. Monte a prévia e rode ali:

```bash
git merge-tree --write-tree origin/main <sha-do-pr>
```

É o único jeito de pegar convergência independente — dois lados que mudaram a mesma coisa de formas
compatíveis textualmente e incompatíveis semanticamente. Isso não gera conflito e não aparece em
nenhum gate.

Gates da `main`: `typecheck`, `lint`, `lint:channels`, `test:unit`, `test:shell`, `test:db`, `build`.
Obrigatórios no merge — **cinco**, e não confie nesta lista: meça.

```bash
gh api repos/melgarafael/DeskcommCRM/branches/main/protection \
  --jq '.required_status_checks.contexts|join(", ")'
# em 2026-08-14: verify, build-and-size, invariants, e2e, imagens-ok
```

Esta linha listava **três** — faltavam `e2e` e `imagens-ok`, que são justamente os que
cobrem o artefato que o self-hoster instala. Um triador que a lesse declararia "passou os
obrigatórios" tendo rodado 3 de 5, dentro do próprio documento que o `CLAUDE.md` aponta
como o lugar onde medir contra a régua errada é o modo de falha número um.

Meça exit code **direto**. `cmd | tail` devolve o exit do `tail` — verde falso.

---

---

## 3-bis. Meça o CUSTO da medição antes de pagá-lo

O passe 3 manda rodar os gates na prévia do merge. Ele não diz quando isso é **redundante**, e
essa omissão custa horas quando há fila.

Dois números decidem, e os dois são baratos:

```bash
B=$(git merge-base origin/main pr-<n>)
git rev-list --count $B..origin/main                                   # ATRASO
comm -12 <(git diff --name-only $B origin/main | sort) \
         <(git diff --name-only $B pr-<n>     | sort) | wc -l          # SOBREPOSIÇÃO
```

| atraso | sobreposição | o que a prévia pode ter que a branch não tinha | o que fazer |
|---|---|---|---|
| 0 | 0 | **nada** — a prévia É a branch | não rode gate nenhum; leia o CI da branch |
| >0 | 0 | só acoplamento **semântico** (a `main` mudou um contrato que o PR usa) | rode `typecheck` — é ele que pega assinatura mudada — e leia |
| >0 | >0 | convergência independente: texto compatível, semântica incompatível | rode **tudo** na prévia. É o caso que o passe 3 existe para pegar |

Medido em 2026-09-03, com 21 PRs abertos: **16 tinham atraso 0 e sobreposição 0**. Rodar a bateria
completa nos 16 teria custado horas de CPU para reproduzir, byte a byte, um verde que o CI já tinha
publicado — enquanto os contribuidores esperavam. Latência é o gargalo deste repositório; gastar o
relógio provando o já provado é o passe 3 trabalhando contra o motivo pelo qual ele existe.

⚠️ **O atraso 0 tem prazo de validade: ele vence no seu próprio primeiro merge.** Assim que um PR
entra, todos os outros ficam com atraso ≥1 — e a linha da tabela muda. Ver 3-ter.

---

## 3-ter. Quando há FILA, o risco muda de lugar

Com um PR na mesa, o risco é o PR contra a `main`. Com vinte, o risco dominante é **um PR contra o
outro** — e nenhum gate do mundo o mede, porque no instante em que o CI roda os dois ainda não se
encontraram.

Antes de mergear qualquer coisa, monte a matriz:

```bash
for a in $LISTA; do for b in $LISTA; do
  [ "$a" -lt "$b" ] || continue
  L=$(comm -12 <(git diff --name-only $(git merge-base origin/main pr-$a) pr-$a | sort) \
               <(git diff --name-only $(git merge-base origin/main pr-$b) pr-$b | sort) \
       | grep -v '^\.changes/')
  [ -n "$L" ] && echo "#$a x #$b -> $L"
done; done
```

`.changes/` sai da conta de propósito: fragmentos são arquivos novos com nome próprio, nunca colidem,
e mantê-los no resultado esconde as colisões que importam atrás de ruído.

O que a matriz devolve costuma ser **um punhado de pares e um arquivo-hub**. Medido na mesma data:
dos 21 PRs, 15 eram totalmente independentes; as 7 colisões se concentravam em `lib/i18n/dicionario.ts`
(4 PRs) e um par em `.github/workflows/release.yml`.

A consequência é a ordem de trabalho, e ela é o oposto do intuitivo:

1. **Independentes primeiro**, em qualquer ordem, sem re-medir nada entre eles.
2. **Cluster por último**, em série, **re-medindo a prévia a cada merge** — porque o segundo do par
   deixou de ter atraso 0 no instante em que o primeiro entrou.

Mergear na ordem em que os PRs aparecem na tela é o que produz o conflito que ninguém entende de
onde veio.

### ⚠️ A matriz por ARQUIVO é necessária e NÃO é suficiente

Medido no mesmo dia, e é a correção que este passe pediu poucas horas depois de ser escrito: os PRs
**#497 e #498 têm sobreposição de arquivo ZERO**, cada um com os cinco checks obrigatórios verdes
contra a `main` — e **a prévia do merge dos dois é vermelha**.

```
#498  acrescenta o job  publish-image.yml::promover-stable
#497  acrescenta GATILHO_ESPERADO, um mapa que exige igualdade de CONJUNTO
      entre os jobs de .github/workflows e as chaves do mapa

merge dos dois → Tests 1 failed | 13 passed (14)
                 AssertionError: Um job apareceu ou sumiu em .github/workflows.
                 +   "publish-image.yml::promover-stable"
```

A classe é esta, e vale para muito além deste par:

> **Um teste que prende um INVENTÁRIO do repositório — jobs, telas, tabelas, rotas — colide com
> qualquer PR que mude esse inventário, sem tocar em nenhum arquivo em comum.**

O arquivo A declara o mundo; o arquivo B muda o mundo. Nenhum `git merge-tree` acusa, nenhum `comm`
de nomes de arquivo enxerga, e — como a branch protection roda com `strict=false` — **quem mergear
por segundo entra sem re-rodar o CI e deixa a `main` vermelha**, em qualquer das duas ordens.

Esta base tem vários desses inventários, e todos têm a mesma propriedade:
`tests/unit/navegacao-completude.test.ts` (telas), `tests/invariants/rls-isolation.test.ts` (a lista
fixa `TABLES`), `tests/unit/e2e-cobertura-completa.test.ts` (specs), `GATILHO_ESPERADO` (jobs).

**Como cobrir o buraco, sem custo:** depois de montar a matriz por arquivo, faça uma segunda
varredura — para cada PR da fila, o diff **adiciona ou remove** uma entrada de inventário?

```bash
gh pr diff <n> | grep -E "^[+-]  [A-Za-z0-9_-]+:$"        # jobs de workflow (com controle positivo)
gh pr diff <n> --name-only | grep -E "registry\.ts|rls-isolation|e2e-cobertura|GATILHO"
```

Se **algum** PR mexe no inventário e **outro** mexe na declaração dele, os dois estão acoplados
mesmo com interseção de arquivos vazia — e a emenda pertence ao PR **do mapa**, porque o mapa é
artefato dele.

E note o desfecho estrutural: com `strict=false`, esta classe **não tem gate**. Ou a branch
protection passa a exigir a branch atualizada, ou algum check roda na prévia do merge. Enquanto não
rodar, quem cobre é este passe — à mão.

---

## 4. Complemento — o que os gates não provam

`references/complemento-do-ci.md`, linha por linha, com o gatilho de cada uma no diff.

Esta é a razão de a triagem existir tecnicamente. Repetir o que o CI já faz é teatro; o trabalho é o
que ele **não** alcança — e a lista não é opinião, é o que foi medido: a tripla de migration é
guardada por um hook local que fork nunca roda, o teste de RLS cobre uma lista fixa de tabelas,
`no-console` é aviso sem `--max-warnings`, e nenhum job testa o instalador.

---

## 5. Reprodução — no SHA da `main`, não na base do PR

Todo PR que alega consertar bug:

1. Reproduza o defeito na `main` **de hoje**. Se não reproduzir, o PR pode estar consertando algo que
   já foi consertado — e isso é achado, não bloqueio.
2. Prove que a correção o remove.
3. Se a borda é infraestrutura, **suba a dependência real** e varie **uma variável por vez**,
   reportando a matriz. `--dry-run`, `config` e `typecheck` são renderização, não comportamento.

E a pergunta que tem nome próprio — **falha-em-verde**:

> Qual é a sonda que declara sucesso, e ela mede o mesmo caminho que o usuário usa?

Um instalador já terminou com "Instalação concluída! Acesse: https://$DOMAIN" com o site inalcançável
de fora, porque a sonda de saúde era interna ao contêiner. Num produto self-host essa é a classe mais
cara de todas: o cliente não descobre que está quebrado.

---

## 6. O teste que falta — o passe de maior rendimento

Se o PR muda comportamento e não traz teste, **você escreve o teste**. Não peça primeiro.

O valor não é o teste. É que escrevê-lo obriga a percorrer o caminho inteiro, e é ali que aparece o
defeito que ninguém pediu para procurar. Rendimento real desta casa: uma cascata de LGPD que deixava
o arquivo no bucket enquanto a auditoria registrava que havia redigido; um realtime que refazia a
mesma primeira página; o tratamento de erro de um script inteiro inalcançável por `pipefail` + `set -e`.

Depois de escrever: **sabote e veja vermelho.** Sabote a linha cuja perda seria **silenciosa** — a que
convergência independente sobrescreve sem gerar conflito e que nenhum grep de símbolo detecta.
Presença de símbolo não é comportamento. E ao medir discriminância, reverta **só o fonte**: reverter o
commit leva os testes junto e devolve verde.


### 6-bis. O gate que o PR deixou cego — a classe que passa por "tem teste"

O passe 6 pergunta *falta teste?*. Falta uma pergunta irmã, e ela é a que escapa:

> **O PR criou uma SEGUNDA porta para um dado que já tinha guarda na primeira?**

Quando a resposta é sim, o gate existente **continua verde** — ele não foi quebrado, ele ficou com o
escopo velho. E nada avisa, porque uma guarda de ausência não sabe distinguir "não achei nada" de
"não olhei ali".

Medido na triagem do PR #474 (2026-09-03). `tests/unit/ocupacao-do-google-nao-expoe-titulo.test.ts`
guarda que o nome de um evento pessoal do Google não chegue à tela da Agenda, e o recorte dele era
`app/app/agenda/**`. O PR acrescentou a rota `app/api/v1/agenda/agendamentos` como segunda fonte da
mesma ocupação — a que substitui a semente do servidor no primeiro refetch. A **mesma** sabotagem
(`title` acrescentado ao `select`) nos dois caminhos:

```
em app/app/agenda/page.tsx                  → exit 1   (a guarda pega)
em app/api/v1/agenda/agendamentos/route.ts  → exit 0   (a guarda passa)
```

O autor tinha respeitado a decisão à risca no código — rótulo fixo, coluna fora do `select`, o
argumento inteiro no comentário. O que faltava era o mecanismo por trás, e a falha é do projeto.

**Como procurar, em três movimentos:**

1. O PR toca um dado que já tem guarda? (`grep` o nome da tabela/coluna em `tests/`.)
2. Abra a guarda e **leia o recorte dela** — quase sempre é uma constante de caminho no topo. Guarda
   de escopo fixo é a regra nesta base, não a exceção.
3. Sabote **no caminho novo** e no antigo. Dois exits diferentes para a mesma sabotagem é o achado.

E ao consertar o recorte, meça as **três** direções: limpo → verde; sabotado no caminho novo →
vermelho; sabotado no caminho antigo → **ainda** vermelho. Sem a terceira, você pode ter trocado
cobertura nova por cobertura velha e chamado isso de conserto.

---

## 7. Teste a própria suspeita antes de exigir

Regra de cultivo, não de rigor.

Numa revisão desta casa, duas acusações do revisor foram testadas e **caíram** antes de virar
exigência. Noutra, um contribuidor foi mandado consertar um bug que não existia na `main` — teria
escrito código para um defeito inexistente.

**Nenhum pedido sai sem a medição que prova o defeito, anexada ao pedido.** Se você não mediu, não é
pedido: é pergunta, e vai redigido como pergunta.

---

## 8. Reconciliação

O que é mecânico, você conserta — branch própria, commit próprio, creditando o autor original no
corpo. O que muda uma decisão de projeto do contribuidor **volta como pergunta**, nunca como patch
por cima. A diferença entre as duas é: você consegue enunciar a intenção dele e mostrar que ela
sobrevive à sua mudança?

---

## 9. Veredito com proveniência

```
VEREDITO: MERGEAR | MERGEAR+ISSUE | SEGURAR
main: <sha curto>            prévia do merge: <tree>
MEDIDO:      <o quê> — <comando> — <saída observada>
NÃO MEDIDO:  <o quê> — <por quê>
BLOQUEADOR:  <arquivo:linha> — <o defeito> — <como reproduzir>
VERSÃO:      <patch | minor | major | nenhuma> — <o que o dono da VPS precisa fazer>
```

**`NÃO MEDIDO` é campo obrigatório.** Veredito sem ele é recusado pelo cético e não vai para o PR.
Ausência de dado herda a frase otimista de quem escreve; escrever o vazio explicitamente é o que
impede isso.

Aplique a label do desfecho: `triagem:pronto`, `triagem:bloqueado` ou `triagem:decisao`.

---

## 10. Resposta que faz voltar

`references/resposta-ao-contribuidor.md`. As três regras duras:

- **Creditar pelo nome** o que o contribuidor achou ou mediu.
- **Nunca cobrar como descuido um gate que não está documentado.** Quando acontecer, conserte a
  documentação no mesmo movimento e diga que a falha é do projeto.
- **Nunca pedir sem medição anexada** (passe 7).

Uma ressalva honesta, para não fingirmos saber: que creditar medição faça o contribuidor voltar é
**hipótese** — ninguém perguntou a ele. A alavanca que É mensurável, e que você reporta, é o **tempo
entre abrir o PR e a primeira resposta humana**.

---

## 11. Catraca — o passe que impede esta triagem de ser eterna

Todo defeito que os gates não pegaram vira **gate novo** ou dívida com issue aberta.

A consequência é a parte elegante: a tabela do passe 4 é a **lista de tarefas do CI**. Cada linha que
vira gate de verdade é uma linha que a triagem para de fazer à mão. Este procedimento deve ficar mais
leve com o tempo. Se estiver ficando mais pesado, o passe 11 não está sendo cumprido.

---

## 12. A versão — porque merge na `main` não é entrega

**O self-hoster puxa imagem publicada por número de versão.** Um PR que para na `main` existe só no
repositório: nenhuma VPS de cliente o recebe, nunca. Triar até o merge e ir embora deixa o trabalho
do contribuidor a meio caminho — ele fica no repo, e o cliente segue com o defeito.

A lei é [`docs/doctrine/versionamento.md`](../docs/doctrine/versionamento.md). O que muda para você:

### O fragmento é bloqueador, e você o escreve quando falta

Todo PR que muda comportamento traz um arquivo em `.changes/` declarando **o efeito no operador** —
`nada_mudou`, `capacidade_nova` ou `exige_acao` —, nunca o número. Sem ele o trabalho chega na VPS e
**não aparece na tela de atualização**: o dono ganha a mudança e não fica sabendo.

Contribuidor externo não conhece essa regra, e o passe 10 proíbe cobrar como descuido um gate não
documentado. Então: **se o PR muda comportamento e não traz fragmento, escreva você**, em branch
própria, creditando o autor — é reconciliação mecânica (passe 8), não decisão de projeto. Só volta
como pergunta se você não souber dizer o que muda para quem opera.

O impacto se **mede**, não se chuta. A pergunta é uma: *o operador precisa fazer alguma coisa?*
Variável nova é o caso clássico — abra `lib/env.ts` e veja se ela é `required()` ou
`optional().default(...)`. Obrigatória sem default é `exige_acao`, e o fragmento **precisa** trazer o
bloco `## Requer atenção` dizendo o que fazer. Confira com `pnpm release:conferir`.

### Seção de versão escrita à mão é BLOQUEADOR

Se o PR adiciona uma linha `## [X.Y.Z]` ao `CHANGELOG.md`, isso entra no veredito como bloqueador e
sai da branch. Ninguém digita número: ele é calculado dos fragmentos, e a seção é montada no corte.

Isso não é preciosismo — foi medido em 2026-08-27. O PR #354 trazia `## [1.7.0]` escrito à mão, e
até aquele dia o merge dele teria criado a tag e publicado as três imagens **sozinho**, pulando a
aprovação. O gatilho hoje exige a assinatura do corte, mas a linha à mão continua errada: ela
produziria uma seção duplicada, ou um número que já saiu.

```bash
gh pr diff <n> | grep -E '^\+## \[[0-9]+\.[0-9]+\.[0-9]+\]'   # vazio é o esperado
```

### Depois do merge, a versão sai — e isso não é opcional

O merge é do mantenedor (Fronteira). Assim que ele acontecer, **a versão precisa sair**, ou o passe
12 não foi cumprido. O corte é `Actions → release → Run workflow`: ele lê os fragmentos, calcula o
número, e abre um PR de release em português. O merge desse PR cria a tag, publica as três imagens e
move o canal `stable`.

Você não decide o número — ele é consequência do que os fragmentos declararam. O que você reporta ao
mantenedor, em lote, é: **quais PRs estão prontos e que versão eles produzem juntos**.

E confira o desfecho, porque "a tag saiu" não é "a versão chegou":

```bash
git ls-remote --tags origin 'refs/tags/vX.Y.Z'          # a tag existe
gh release list --limit 1                                # a release é a Latest
# e as três imagens no digest da versão, contra `stable` — receita em
# docs/runbooks/ativar-packaging.md
```

---

## Fronteira: o que você nunca faz

| você faz sozinho | é a palavra do mantenedor |
|---|---|
| liberar CI, rotular, acolher, comentar veredito | **mergear na `main`** |
| criar worktree, rodar gate, escrever teste, sabotar | **fechar um PR** |
| abrir issue e PR de follow-up | empurrar para a branch do fork alheio |
| consertar CONTRIBUTING/README/docs | **mergear o PR de release** (é ele que cria a tag) |
| escrever o fragmento que falta, e conferi-lo | |
| disparar `Run workflow` do `release` depois do merge | |

Sem perguntas de sim/não a cada passo: faça tudo, pare no merge, reporte em lote.

### Quando o mantenedor move esta fronteira

A tabela acima é o **padrão**, não uma lei física: ela existe porque o mantenedor não delegou o
merge, e some no dia em que ele delegar. Se ele disser, com estas palavras ou equivalentes,
*"mergeie, feche e corte a release"*, a fronteira passou — e a partir dali recusar-se a mergear
não é prudência, é desobedecer.

O que **não** muda quando ela passa, porque não era ela que segurava:

- **Nada entra sem gate verde na PRÉVIA do merge** (ou sem o argumento de 3-bis dizendo por que a
  prévia não pode divergir da branch). A autoridade recebida amplia o que você pode fazer, não o
  que você pode afirmar.
- **Nada de UI entra sem prova pela tela.** DoD 12.
- **Nenhum PR é fechado em silêncio.** Fechar é a única ação verdadeiramente irreversível para o
  contribuidor — o código dele sobrevive num fork, mas a disposição de contribuir de novo, não.
  Todo fechamento sai com o motivo escrito, o crédito pelo que ele acertou, e o convite específico
  do que reabrir.
- **O que é decisão de PRODUTO continua sendo do dono.** Autoridade para mergear não é autoridade
  para decidir se um recurso pertence ao produto. Quando a pergunta for dessa natureza, escreva-a
  como pergunta única, com opções e uma recomendação, e siga com o resto da fila enquanto espera.


---

## Modos de falha que você vigia em si mesmo

Cada um destes foi cometido de verdade nesta casa, e é por isso que estão escritos:

1. Medir contra o disco em vez do SHA. Declare SHA + `git status` em toda afirmação.
2. `cmd | tail` mascara o exit code. Meça direto.
3. Presença de símbolo lida como comportamento. Sabote.
4. Reverter o commit leva os testes junto e devolve verde. Reverta **só o fonte**.
5. Dois agentes no mesmo worktree leem a sabotagem um do outro como bug. **Um worktree por agente.**
6. No zsh, `$var:caminho` come letras (modificadores `:c`/`:h`/`:t`). Use `${var}:caminho`.
7. `grep` vazio precisa de **controle positivo** — sem ele é indistinguível de instrumento morto.
8. Contagem absoluta medida em árvore contaminada mente. Reporte o **delta**.
9. `NÃO MEDIDO` ausente. É campo obrigatório.
10. Exigir sem medir (passe 7).
11. Tratar rede de segurança como durável só porque existe. Tag, backup e réplica também se medem.
12. **Fila medida em paralelo satura a máquina, e a saturação mente em vermelho.** Medido em
    2026-09-03: sete agentes de triagem rodando ao mesmo tempo levaram o `load average` de 0,9 para
    **90,7**, e nesse regime o `next build` morreu duas vezes com `ELIFECYCLE 143` — `SIGTERM`, não
    erro de compilação. O sintoma imita defeito do PR com perfeição: log truncado, sem stack, sem
    linha culpada. Antes de atribuir um vermelho ao código, rode `uptime`. E escalone: leitura e
    `gh` em paralelo à vontade, mas **um `build`/`test:db` por vez** — os dois pesados são serial,
    não porque sejam lentos, e sim porque concorrer com eles corrompe o resultado de todo o resto.
13. **Um worktree por agente vira entulho se ninguém varre.** A mesma medição achou **195**
    worktrees registrados, **23** deles `prunable`. Worktree órfão não é só disco: ele aparece em
    `git worktree list` e faz a próxima sessão achar que há trabalho vivo onde não há. Feche o seu
    com `git worktree remove --force` no fim do seu passe, e rode `git worktree prune` ao encerrar
    a triagem. Isto é passe 11 aplicado ao próprio espaço de trabalho: se a bagunça só cresce, o
    procedimento não está se pagando.
14. **Verde de um gate não é verde de outro: eles medem DIMENSÕES diferentes.** O `CLAUDE.md` já
    avisa que *gate escolhido não é suíte* — mas ali o recorte é por **arquivo** (rodar
    `vitest run tests/unit` em vez de `pnpm test:unit`). Este é por **dimensão**, e escapa até de
    quem rodou a suíte inteira: **o vitest não checa tipo**. Uma árvore com `test:unit` verde pode
    ter `typecheck` vermelho, e a leitura natural do verde — "a suíte está limpa" — é falsa. Medido
    em 2026-09-03 num PR desta casa: o autor rodou `tsc`, depois acrescentou casos ao teste, nunca
    re-rodou o `tsc`, viu `test:unit` verde e abriu o PR; o `verify` do CI reprovou por
    `modeloDeAmbiente` recebendo `null` onde o tipo é `string | undefined`. **Tipo e comportamento
    são eixos independentes** — a ordem certa é `typecheck` **depois** da última edição, nunca antes.
15. **Árvore parada é pré-condição do resultado, não detalhe.** `scripts/test-db.sh` guarda isso
    explicitamente (`arvore_mexeu` → *"a árvore mudou DURANTE a corrida: este resultado não vale,
    tenha ele passado ou não"*). **O `test:unit` não tem essa guarda**, e a ausência produz uma
    assinatura que se lê como defeito: **1 arquivo vermelho com 0 casos vermelhos** — os dois
    números discordando. A causa medida foi trocar de branch com a suíte rodando: o arquivo saiu do
    disco no meio e o vitest não conseguiu carregá-lo. Numa triagem com vários worktrees em
    paralelo isto deixa de ser acidente e vira risco de rotina. Antes de atribuir um vermelho ao
    código, confirme que **nada mexeu na árvore durante a corrida** — e, se mexeu, jogue o
    resultado fora e rode de novo, tenha ele passado ou não.
16. **O alvo se move enquanto você mede — e em lote ele se move sempre.** Toda medição vale para um
    SHA, e num repositório vivo o `head` de um PR muda no meio da triagem. Medido em 2026-09-03: um
    agente reportou o `verify` do #495 vermelho em `d94e30e1`, com a causa raiz identificada e
    reproduzida. Quando o veredito ia sair, o `head` era `61d9c066` — alguém consertara às 19:49 —
    e o `verify` estava `SUCCESS`. Deferir ao relatório teria produzido um pedido para consertar o
    que já estava consertado, que é exatamente o erro que o passe 7 existe para impedir. **Antes de
    agir sobre qualquer medição de terceiro — ou sua, de meia hora atrás —, reconfira o
    `headRefOid`.**

    ⚠️ **E reconferir no INÍCIO da medição não basta — tem de ser IMEDIATAMENTE ANTES do merge.**
    Medido no mesmo dia, no mesmo PR, na direção contrária: mergeei o #495 às **21:29:38 UTC**; o
    autor empurrou às **21:31:07** a guarda que faltava — a varredura de fonte que prende os dois
    call sites do conserto. **89 segundos.** O conserto de comportamento entrou na `main`; a rede
    que o protege, não. E ninguém teria notado, porque tudo ficou verde: era justamente uma guarda
    contra um defeito que a suíte não pegava.

    Numa fila, o intervalo entre "medi" e "mergeei" é onde o contribuidor está trabalhando — ele
    está ativo *porque* você respondeu. **Releia o `headRefOid` como último ato antes do merge**, e
    se ele mudou, remeça o que a mudança tocou.
17. **`?branch=` é sonda cega quando o fork abriu o PR a partir da `main` dele.** Medido em
    2026-09-03: os PRs #418 e #465 têm `headRefName = main`, então `actions/runs?branch=main`
    devolve os runs da **`main` do upstream** — dezenas de execuções verdes sem relação nenhuma com
    o PR. Um triador que leia essa saída conclui "o CI rodou". Não rodou: no `head_sha` real havia
    **zero** execuções, e o contribuidor estava esperando havia dias sem que nada tivesse começado.
    Use sempre `actions/runs?head_sha=$(gh pr view <n> --json headRefOid --jq .headRefOid)`.
18. **Re-run não é evento novo.** Quando o vermelho é staleness — o CI testou contra uma `main`
    velha —, `gh run rerun` **não resolve**: ele reusa o payload do evento original, e o checkout
    faz `fetch` do **SHA fixo** daquele merge (`+61e359c…:refs/remotes/pull/<n>/merge`), não do ref.
    Medido no #422 em 2026-09-03. Se o workflow não tiver `workflow_dispatch` — e o `e2e.yml` não
    tem —, o único caminho é um evento `pull_request` novo: close+reopen do PR. **Avise o
    contribuidor antes de fazer**, porque ele recebe um e-mail de "fechado" e isso lê como rejeição.

    ⚠️ **E o close+reopen NÃO basta sozinho: o run novo nasce TRAVADO.** Medido logo em seguida, no
    mesmo #422 — reabri o PR, os quatro workflows foram criados, e os quatro nasceram em
    `conclusion: action_required`, esperando aprovação manual outra vez, porque a política de fork
    vale para **cada** evento novo. E o pior: `gh pr checks` continuava mostrando o `e2e=FAILURE`
    **do run velho**, então a tela dizia "reprovou de novo" quando na verdade **nada tinha rodado**.
    Eu quase reabri o diagnóstico e desmenti publicamente uma explicação que estava certa.

    **Depois de todo close+reopen, refaça o passe 1** — libere os runs novos e confirme pelo
    `head_sha`, nunca pelo `gh pr checks`:

    ```bash
    SHA=$(gh pr view <n> --json headRefOid --jq .headRefOid)
    gh api "repos/{owner}/{repo}/actions/runs?head_sha=$SHA&per_page=30" \
      --jq '[.workflow_runs[]|select(.conclusion=="action_required")]|.[].id'
    ```
19. **Precedência invertida: consultar a fonte SÓ quando o palpite não sabe.** Uma cascata escrita
    como *"se a heurística conhece, use-a; senão, vá à fonte"* faz o palpite **vencer sempre que ele
    acha que sabe** — e o dado bom nunca é ouvido. Medido em 2026-09-03, no PR #524, rodando a
    função de verdade:

    ```
    openrouter/openai/gpt-3.5-turbo   catalogo=false  registro=true   => enxergaImagem=true
    openrouter/google/gemma-2-9b-it   catalogo=false  registro=true   => enxergaImagem=true
    openrouter/anthropic/claude-2.1   catalogo=false  registro=true   => enxergaImagem=true
    openrouter/mistralai/mistral-7b   catalogo=false  registro=false  => enxergaImagem=false
    ```

    Num roteador (OpenRouter) o registro interno responde pelo **prefixo do fabricante**: vê
    `openai/` e afirma que o modelo enxerga imagem, para qualquer modelo daquele fabricante. O
    catálogo tem o dado que a **própria OpenRouter declarou** (`architecture.input_modalities`), e
    para o `gpt-3.5-turbo` ele diz `false` — que é a verdade. Como o catálogo só era consultado
    quando o registro não conhecia, e num roteador o registro sempre "conhece" se o prefixo bate, o
    dado declarado **nunca chegava a ser lido**.

    A quarta linha é o que fecha o argumento: com `registro=false`, a cascata cai no catálogo e
    acerta. Não é o registro que está errado — é a **ordem**.

    **A regra — e a primeira versão dela, escrita aqui, estava ERRADA.** Eu tinha escrito *"fonte
    declarada primeiro, heurística só no vazio"*, e quem mediu o caso derrubou a formulação no mesmo
    dia: **no provedor direto a coluna do catálogo é um default que ninguém preencheu** — medido
    `false` para todos os modelos numa instalação real. "Fonte primeiro" ali faria o sistema mentir
    `false` para tudo, que é o mesmo defeito virado do avesso.

    A regra certa é **MEDIDA VENCE PALPITE**, e o critério é ter opinião:

    | caminho | quem manda | por quê |
    |---|---|---|
    | provedor direto | o **registro** | a coluna do catálogo é default não preenchido — não tem opinião |
    | roteador | o **catálogo** quando ele tem opinião | `supports_vision` é `not null default false`, então `null` só acontece quando **não há linha** |

    Ou seja: não é a *origem* do dado que decide, é se aquela origem **tem algo a dizer sobre este
    caso**. Um default que ninguém preencheu não é dado — é ausência com cara de resposta, e é
    exatamente por isso que a heurística existia. E quando encontrar uma cascata
    num PR, pergunte de cada degrau: *ele pode responder ERRADO com confiança, impedindo o degrau
    seguinte — que tem o dado bom — de ser consultado?* Cascata é onde esta classe mora: `??`, `||`,
    `if (!conhecido) buscar(...)`, cache lido antes da fonte, prefixo/regex decidindo o que um campo
    declarado já responde.
20. **O conserto que troca ruído por SILÊNCIO — e por que essa direção é a pior.** O #524 nasceu
    para matar um aviso **falso** no caminho do provedor direto, e de quebra matou um aviso
    **verdadeiro** no caminho do roteador: antes dele a tela dizia *"gpt-3.5-turbo não enxerga
    imagens; fotos e comprovantes serão ignorados"*, e estava certa; depois, o aviso some e o `PUT`
    responde 200 limpo.

    As duas direções do erro **não custam o mesmo**. Aviso demais o operador percebe e reclama —
    o defeito se auto-denuncia. Silêncio ele **não percebe**: perde a informação sem saber que
    perdeu, e num produto self-host ninguém está olhando por ele.

    **Portanto, sempre que um PR REMOVE um aviso, um erro, um log ou uma validação, a pergunta é
    obrigatória:** *em quais casos esse aviso estava CERTO, e eles continuam avisando?* Enumere os
    casos verdadeiros **antes** de aceitar a remoção dos falsos, e exija um teste que prenda pelo
    menos um verdadeiro — senão o próximo conserto os leva junto de novo, e em silêncio.

    Note que este PR tinha checks verdes, teste próprio e fragmento. **Nada disso mede a direção do
    erro.** Quem achou foi uma revisão adversarial rodando a função com casos que separavam os
    caminhos — e quem confirmou foi o autor, remedindo contra o próprio PR em vez de deferir ao
    relatório. É o passe 7 aplicado a si mesmo, e é o que se espera de quem contribui aqui.
