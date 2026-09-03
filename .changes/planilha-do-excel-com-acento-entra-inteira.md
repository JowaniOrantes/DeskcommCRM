---
impacto: nada_mudou
secao: corrigido
titulo: Planilha exportada do Excel com acento entra inteira, sem virar caractere estranho
---

O Excel em português salva planilha num formato de texto antigo, e é o padrão
dele — quem exporta a lista de produtos ou de contatos quase sempre manda esse
arquivo. O sistema lia todos como se fossem do formato moderno, e o resultado
dependia de onde estava o acento.

Quando o acento estava nos **dados**, era o pior caso: a importação dizia
"pronto, N produtos importados" e o catálogo ficava com nomes como
`A��o C�nica` — sem um erro sequer. É esse nome corrompido que o atendente de IA
lia em voz alta para o cliente, e ninguém confere linha a linha numa lista de
300 itens.

Quando o acento estava no **cabeçalho**, o arquivo inteiro era recusado com uma
mensagem ilegível.

Agora o sistema identifica o formato pelo próprio conteúdo do arquivo e lê os
dois corretamente — sem você precisar reexportar nada. Vale para a importação de
produtos e para a de contatos.

E um arquivo que não é planilha de texto (um `.xlsx` renomeado, por exemplo)
passa a ser recusado com a instrução do que fazer, em vez de virar centenas de
linhas ilegíveis no seu catálogo.
