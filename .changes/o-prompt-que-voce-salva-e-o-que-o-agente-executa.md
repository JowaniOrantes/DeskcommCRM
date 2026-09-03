---
impacto: nada_mudou
secao: corrigido
titulo: O prompt que você salva passa a ser o que o agente realmente executa
---

Editar as instruções de um agente **já publicado** e salvar mostrava o texto novo
na tela — enquanto o agente continuava atendendo no WhatsApp com o texto
anterior. Não havia erro, nem aviso: quem editava concluía que a mudança estava
no ar, e ela não estava.

A causa é que existem dois lugares onde as instruções podem morar: o cadastro do
agente e a **versão publicada**. Quem atende o cliente é a versão. A tela mandava
alguns agentes para o editor antigo, que grava no cadastro — o lugar que o
atendimento não lê quando há versão publicada.

Agora quem tem versão publicada é levado direto ao editor de versões, que grava
onde o atendimento lê. E, se alguma outra ferramenta tentar mudar as instruções
ou o modelo pelo caminho antigo, a resposta passa a ser um erro que explica o
caminho certo, em vez de um sucesso que não teve efeito.

Agente sem versão publicada continua exatamente como estava.
