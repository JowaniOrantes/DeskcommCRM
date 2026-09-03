---
impacto: nada_mudou
secao: corrigido
titulo: O agente para de dizer que o cliente não tem nada marcado quando tem
---

O atendente de IA podia marcar uma reunião e, minutos depois, dizer ao próprio
cliente que **ela não existia** — pedindo desculpas por tê-la marcado. Não havia
erro em lugar nenhum: a consulta era válida e devolvia "nenhum compromisso", que
é uma resposta legítima.

A causa é um nome. Dentro do motor, o campo que identifica **a pessoa** da
conversa se chama `lead_id` — mas nas ferramentas de agenda esse mesmo nome
significa **o negócio no funil**, que é outra coisa. O agente passava o
identificador da pessoa no lugar do negócio, a busca não encontrava vínculo
nenhum e respondia "nada marcado".

Agora, quando o identificador não corresponde a um negócio do funil, a resposta
deixa de ser "nada marcado" e passa a ser uma **recusa que ensina o caminho certo**
— e que instrui o agente a dizer que vai confirmar com a equipe, nunca
que o cliente não tem nada.

Um negócio de verdade sem compromissos continua respondendo "nada marcado", que
é a resposta certa.
