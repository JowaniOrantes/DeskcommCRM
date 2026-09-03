---
impacto: nada_mudou
secao: corrigido
titulo: Uma instabilidade passageira do provedor de IA deixa de matar o atendimento na primeira rajada
---

Quando o provedor de IA responde "calma, você está mandando rápido demais" — um
limite temporário que costuma passar sozinho em menos de um minuto —, o sistema
tenta de novo. Ele tinha direito a cinco tentativas, e usava as cinco no mesmo
segundo: a conversa voltava para a fila já liberada, era pega outra vez na
mesma volta, e assim por diante. O limite não teve um instante sequer para
ceder, e a conversa ia para a lista de casos que precisam de gente com um aviso
crítico na Central.

Medido numa instalação real em 31/08: 49 atendimentos descartados em rajadas de
poucos segundos, todos pelo mesmo motivo passageiro.

Agora cada nova tentativa espera mais que a anterior — 10 segundos, depois 20,
depois 40, depois 80 —, o que dá ao provedor tempo de se recuperar antes da
próxima. Na prática, a instabilidade que antes queimava as cinco chances em um
segundo agora tem mais de dois minutos para passar, e o atendimento continua
sozinho quando ela passa.

Para quem opera, nada muda: não há configuração nova, nenhum passo de
atualização e nenhum ajuste no arquivo de ambiente. O que muda é a Central
ficar com os avisos que importam, em vez de encher de casos que se resolveriam
sozinhos.
