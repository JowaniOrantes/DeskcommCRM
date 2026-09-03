---
impacto: nada_mudou
secao: corrigido
titulo: A mensagem de erro do WhatsApp deixa de repetir a resposta crua do serviço
---

Quando algo dá errado ao conectar ou enviar pelo WhatsApp, a tela mostra uma
mensagem explicando o que houve. Essa mensagem vinha com um pedaço da resposta
crua do serviço de WhatsApp colado no fim — os primeiros 200 caracteres do que
ele devolveu, fossem eles quais fossem.

O problema não é o tamanho: é que esse trecho é escrito por outro programa, e a
gente não decide o que vai nele. A resposta de erro dele fala sobre sessões de
conversa, e pode carregar telefone de cliente, o endereço do seu servidor ou a
chave que liga os dois. Isso saía pela nossa própria página, para quem estivesse
com a tela aberta.

Agora a mensagem diz o que importa e nada além: qual operação falhou e qual foi
o código do erro — que é o que separa "a senha do WhatsApp está errada" de "o
serviço de WhatsApp caiu". Se você precisar do texto completo para investigar,
ele continua onde sempre esteve: no registro do próprio serviço de WhatsApp, no
seu servidor.

Para quem opera, nada muda: nenhuma configuração nova, nenhum passo de
atualização.

O achado é de @prevprocesso-maker, que percebeu o vazamento rodando o sistema
para um cliente.
