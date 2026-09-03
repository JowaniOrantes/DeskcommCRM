---
impacto: nada_mudou
secao: corrigido
titulo: Um WhatsApp fora do ar deixa de pendurar a tela até o navegador desistir
---

Quando o serviço que conversa com o WhatsApp fica indisponível, o CRM ficava
esperando por ele sem limite. A tela de conexão girava, o envio não voltava, e o
único desfecho era o navegador ou o servidor desistirem sozinhos, minutos depois
e sem explicação.

O caso ruim não é o serviço recusar a conexão — isso já dava erro na hora. É o
serviço aceitar e nunca responder, que é o que acontece quando ele está
sobrecarregado ou travando: dali não vinha erro nenhum, só espera.

Agora toda conversa com esse serviço tem prazo. Passou do prazo, o CRM desiste e
diz que foi o tempo — em vez de deixar você olhando para uma tela parada sem
saber se funcionou.

Envio de áudio e vídeo tem prazo maior, de propósito: eles são convertidos antes
de sair, e cortá-los no mesmo tempo de uma mensagem de texto faria mensagem
legítima deixar de ser enviada.
