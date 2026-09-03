---
impacto: capacidade_nova
secao: alterado
titulo: O CRM instala em Postgres 15, não só em 17
---

Até agora a instalação exigia Postgres 17. Quem tentasse usar um banco 15 ou 16
— o padrão de boa parte dos painéis de VPS e dos templates prontos de Supabase
— via a montagem do banco parar no meio, e a instalação terminava sem as
tabelas.

A exigência nunca foi uma decisão de projeto. O arquivo que monta o banco é
gerado automaticamente a partir de um servidor de referência, e esse servidor
rodava a versão 17; ao ser gerado, o arquivo levou junto nove linhas com uma
permissão que só existe nessa versão. Nenhuma parte do sistema usa essa
permissão. Bastava o banco não reconhecê-la para o arquivo inteiro ser
recusado — e um arquivo recusado é um banco vazio, não um banco incompleto.

As nove linhas saíram. A permissão que sobrou em cada uma é exatamente a mesma
de antes, então nada muda no comportamento nem na proteção das tabelas de
auditoria, que continuam não aceitando alteração nem exclusão.

Quem já roda o CRM não precisa fazer nada: o Postgres 17 segue funcionando
igual. O que mudou é que 15 e 16 passaram a funcionar também.
