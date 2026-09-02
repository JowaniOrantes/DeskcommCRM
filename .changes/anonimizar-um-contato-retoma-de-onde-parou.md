---
impacto: nada_mudou
secao: corrigido
titulo: Anonimizar um contato retoma de onde parou, em vez de dizer que já foi
---

A anonimização de um contato remove os dados pessoais em três lugares: o
cadastro do contato, os títulos dos negócios dele e o histórico de atividades.
Se a operação era interrompida no meio — o navegador desistindo, o servidor
reiniciando —, o primeiro lugar ficava pronto e os outros dois não.

E não havia como terminar: clicar em "Anonimizar" de novo respondia **"já anonimizado"**
e não fazia mais nada. O contato ficava para sempre com nome de
cliente visível dentro dos negócios e do histórico — que é exatamente o dado que
a anonimização existe para remover, e que a lei dá prazo para remover.

Agora o botão retoma o que faltou. Rodar de novo num contato já inteiro não
estraga nada, e o registro de auditoria distingue a retomada da execução
original — a data em que o titular exerceu o direito não é sobrescrita.
