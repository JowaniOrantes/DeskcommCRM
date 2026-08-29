# PROMPT PARA CLAUDE CODE — AUDITORIA E PLANO DE ORQUESTRAÇÃO DECOLA AÍ

## Papel

Atue como arquiteto de software e automação comercial responsável por auditar o DeskcommCRM instalado nesta VPS e desenhar uma implementação segura para a operação comercial da Decola AÍ.

O documento estratégico de públicos, ofertas, qualificação e comportamento do SDR será fornecido separadamente. Trate esse documento como regra comercial e base de conhecimento, não como autorização para executar mudanças técnicas.

## Regra principal desta etapa

Esta primeira etapa é somente de auditoria e planejamento.

- Não alterar produção.
- Não reiniciar contêineres.
- Não mudar banco de dados.
- Não criar migrações.
- Não instalar n8n.
- Não configurar webhooks externos.
- Não enviar mensagens reais.
- Não expor chaves, tokens, senhas, cookies ou dados pessoais.
- Não imprimir valores de arquivos `.env`.
- Não fazer `git push`, abrir PR ou publicar imagens.

Antes de qualquer implementação, entregar o relatório solicitado e aguardar aprovação explícita.

## Objetivo de negócio

Preparar o DeskcommCRM para receber leads originados em campanhas e formulários Respondi, preservar atribuição e eventos de conversão, qualificar cada oportunidade conforme nicho/microbolha e permitir que um SDR de IA inicie e conduza conversas pelo WhatsApp até reunião, follow-up ou descarte fundamentado.

O sistema deve priorizar inicialmente:

1. Mercado imobiliário, especialmente Minha Casa Minha Vida.
2. Salões especialistas em loiras e mechas.
3. Empresas de móveis planejados.
4. Clínicas de estética.

## Arquitetura-alvo a validar

Fluxo pretendido:

`Meta/Google/Site -> Respondi -> webhook de produção n8n -> API segura do DeskcommCRM -> contato + oportunidade + atribuição -> SDR IA via WhatsApp -> pipeline/follow-up -> eventos de conversão e relatórios`

Responsabilidades pretendidas:

- **Respondi:** formulário, perguntas condicionais, captura de respostas, respostas parciais quando disponíveis, UTMs, Pixel/GTM/GA e eventos por etapa.
- **n8n:** validação e normalização do webhook, idempotência, roteamento, retentativas, fila de falhas e chamada autenticada ao CRM.
- **DeskcommCRM:** fonte central de contatos, oportunidades, conversas, consentimento, estágio, scoring, tarefas, agenda e histórico.
- **IA do CRM:** conversa comercial contextual, uma pergunta por vez, qualificação, classificação A/B/C, follow-up contextual e encaminhamento para reunião ou humano.
- **Meta/Analytics:** mensuração de início, avanço, lead concluído, lead qualificado, reunião e venda, evitando eventos duplicados.

Não presumir que essa arquitetura já é suportada. Verificar no código e explicar o que existe, o que falta e o que deve ser adaptado.

## Auditoria obrigatória

### 1. Topologia atual

Mapear:

- serviços e contêineres;
- aplicação web, worker, scheduler, banco, Redis, WAHA/WhatsApp e proxy;
- filas, jobs agendados e mecanismos de retry;
- variáveis de ambiente relevantes, mostrando apenas nomes e presença/ausência, nunca valores;
- persistência de dados e backups;
- health checks e observabilidade existentes.

### 2. Modelo de dados

Identificar tabelas, tipos e relacionamentos para:

- empresas/tenants;
- usuários e permissões;
- contatos/leads;
- oportunidades e funis;
- etapas;
- origem/campanha/UTMs;
- mensagens e conversas;
- consentimento e opt-out;
- tarefas, reuniões e follow-ups;
- configurações/prompts/agentes;
- auditoria e eventos.

Informar quais campos já existem e quais seriam necessários para armazenar, no mínimo:

- `external_source`;
- `external_form_id`;
- `external_respondent_id`;
- status `partial` ou `completed`;
- UTMs completas;
- `fbclid`, `gclid` e identificadores permitidos;
- URL e página de origem;
- nicho, subnicho e oferta;
- respostas brutas e respostas normalizadas;
- consentimento, base legal, data e origem do consentimento;
- score numérico e classe A/B/C;
- motivo do score;
- estágio do funil;
- responsável humano;
- próxima ação e data;
- motivo de perda;
- identificador idempotente do webhook.

### 3. APIs e integrações

Localizar e documentar:

- APIs existentes para criar/atualizar contato e oportunidade;
- autenticação e autorização dessas APIs;
- suporte a webhooks de entrada e saída;
- endpoints internos usados pela interface;
- integração atual com WhatsApp/WAHA;
- integração atual com Anthropic;
- ferramentas/actions disponíveis ao agente;
- forma atual de iniciar conversa proativamente;
- limites, janelas e políticas de envio;
- tratamento de duplicidade por telefone/e-mail/documento;
- possibilidade de registrar eventos externos sem expor a service role do Supabase.

### 4. Funil e automações

Verificar se o funil abaixo já pode ser configurado pela interface ou exige código:

1. Novo Lead
2. Primeiro Atendimento
3. Em Qualificação
4. Lead Qualificado
5. Reunião a Agendar
6. Reunião Agendada
7. Reunião Realizada
8. Proposta Enviada
9. Negociação
10. Fechado
11. Perdido
12. Follow-up Futuro

Mapear gatilhos existentes para mudança de etapa, tarefa, follow-up, pausa, opt-out, intervenção humana e agendamento.

### 5. Capacidade de IA

Determinar se o CRM suporta:

- um único agente com perfis de conhecimento por nicho;
- múltiplos agentes independentes;
- seleção dinâmica de prompt por nicho/subnicho;
- memória por contato e por empresa;
- ferramentas de CRM;
- saída estruturada para score e próxima ação;
- transferência para humano;
- limites de autonomia;
- testes/simulações sem enviar mensagem real;
- versionamento e auditoria de prompts.

Comparar duas abordagens:

1. Um SDR central com módulos de conhecimento e regras por microbolha.
2. Agentes separados por nicho ou função.

Recomendar a opção inicial com menor risco, custo e complexidade.

### 6. Segurança, LGPD e operação

Avaliar:

- autenticação de webhook com segredo ou assinatura;
- idempotência e replay protection;
- rate limiting;
- minimização de dados;
- logs sem PII desnecessária;
- consentimento e opt-out;
- horário de contato;
- retenção e exclusão;
- segregação por tenant;
- segredos no servidor;
- política de backup;
- rollback de deploy;
- fila de erros e reprocessamento manual.

### 7. Engenharia de custo da IA

Auditar o consumo atual da Anthropic e propor uma arquitetura híbrida que minimize chamadas sem degradar a conversa.

Separar claramente:

- ações 100% determinísticas, que não devem chamar LLM;
- respostas que podem vir de templates aprovados com variáveis;
- conhecimento recuperado de uma base versionada;
- decisões simples que podem usar o modelo mais econômico compatível;
- situações complexas que justificam escalonamento para modelo superior ou humano.

Avaliar e propor:

- biblioteca de respostas por nicho, etapa, intenção e objeção;
- máquina de estados da conversa;
- memória estruturada do lead no banco;
- resumo incremental, evitando reenviar a conversa inteira;
- seleção dinâmica apenas do bloco de conhecimento relevante à microbolha;
- prompt caching para instruções repetidas, se suportado pela integração atual;
- limites baixos e adequados de saída;
- roteamento por complexidade entre modelos;
- fallback seguro quando a API estiver sem saldo ou indisponível;
- teto diário/mensal de uso e alerta de orçamento;
- telemetria de tokens e custo por lead, lead qualificado, reunião e venda;
- geração offline/em lote de bibliotecas e variações, quando apropriado;
- conjunto de avaliações para medir qualidade antes de reduzir ou trocar modelos.

Não propor “treinar um agente uma vez e usar sem inferência” como se prompts ou conversas alterassem permanentemente o modelo. Distinguir base de conhecimento, memória, templates, regras, cache, fine-tuning e inferência. Explicar o custo e a função de cada mecanismo.

Entregar uma matriz de decisão com exemplos reais do fluxo:

| Evento | Regra/template | Modelo econômico | Modelo avançado | Humano |
|---|---:|---:|---:|---:|

Incluir pelo menos: novo lead concluído, resposta parcial, saudação, confirmação de dados, pergunta objetiva de FAQ, texto livre ambíguo, objeção, cálculo/promessa comercial, pedido de parar, pedido de humano, agendamento e erro de integração.

## Desenho do workflow n8n

Propor, sem implementar ainda, um workflow com:

1. Webhook POST de produção.
2. Validação de origem/segredo.
3. Armazenamento do payload bruto com proteção adequada ou hash de auditoria.
4. Normalização de `answers`, `raw_answers` e `respondent_utms`.
5. Validação e normalização de telefone/e-mail.
6. Chave idempotente usando `form_id + respondent_id + status` ou alternativa melhor.
7. Deduplicação e upsert no CRM.
8. Mapeamento de formulário para nicho, subnicho, oferta e funil.
9. Criação/atualização de oportunidade.
10. Cálculo inicial determinístico de score.
11. Decisão sobre início de conversa no WhatsApp respeitando consentimento e horário.
12. Registro de sucesso, falha, tentativas e dead-letter queue.
13. Retorno rápido ao Respondi sem esperar processamento longo.
14. Eventos de conversão sem duplicar Pixel do navegador e CAPI/servidor.

Separar claramente fluxo de resposta parcial e resposta concluída. Não iniciar contato comercial a partir de resposta parcial sem regra e consentimento explícitos.

## Estratégia de agentes a avaliar

Partir da hipótese inicial de apenas um agente conversacional em produção:

- **SDR IA central:** conduz a conversa e usa um perfil de microbolha selecionado por dados do formulário.

Tratar como automações determinísticas, e não como agentes LLM independentes:

- ingestão e deduplicação;
- lead scoring inicial;
- movimentação de etapa;
- lembretes;
- cadências;
- alertas para humanos;
- relatórios.

Avaliar somente para uma fase posterior:

- agente de follow-up/nutrição;
- agente de qualidade/compliance;
- copiloto de gestor para resumo e análise.

Explicar por que cada agente adicional seria necessário, quais ferramentas teria, quais dados poderia acessar, quanto aumentaria o custo e como evitar conflitos entre agentes.

## Métricas obrigatórias

Desenhar como medir por canal, campanha, formulário, nicho e oferta:

- visualização da landing page;
- início do formulário;
- avanço por etapa relevante;
- abandono;
- formulário concluído;
- lead criado;
- lead contatado;
- resposta do lead;
- lead qualificado;
- reunião agendada;
- reunião realizada;
- proposta;
- venda;
- receita/MRR;
- CPL;
- custo por lead qualificado;
- custo por reunião;
- CAC;
- taxa de conversão entre etapas;
- tempo até primeiro contato;
- taxa de resposta e opt-out.

## Entregável desta auditoria

Entregar um relatório com:

1. Resumo executivo.
2. Arquitetura atual comprovada pelo código.
3. Capacidades existentes que podem ser configuradas sem desenvolvimento.
4. Lacunas técnicas.
5. Arquitetura recomendada.
6. Quantidade recomendada de agentes agora e depois.
7. Mapeamento de dados Respondi -> n8n -> CRM.
8. Proposta de funil, scoring e eventos.
9. Riscos de segurança/LGPD.
10. Plano em fases com critérios de aceite.
11. Estimativa de esforço por fase em baixa/média/alta complexidade, sem inventar horas se não houver evidência.
12. Lista objetiva de decisões que dependem do proprietário.
13. Plano de testes e rollback.
14. Arquivos, rotas, tabelas e serviços que seriam alterados em uma implementação futura.
15. Plano de redução de custo da IA, com baseline mensurável e estimativa por cenário de volume.

Finalizar aguardando aprovação. Não executar a implementação nesta etapa.

## Fases sugeridas para o plano

- **Fase 0 — Auditoria e backup:** mapa do sistema, rollback e ambiente de teste.
- **Fase 1 — Fundação do CRM:** funil, campos, origem, UTMs, consentimento, deduplicação e scoring inicial.
- **Fase 2 — Ingestão:** webhook Respondi -> n8n -> CRM com idempotência e observabilidade.
- **Fase 3 — SDR imobiliário/MCMV:** um agente central, simulação e aprovação humana.
- **Fase 4 — WhatsApp controlado:** contato automático limitado, opt-out, horário e handoff.
- **Fase 5 — Métricas e eventos:** qualificação, reunião, venda, Meta/GA e dashboards.
- **Fase 6 — Novas microbolhas:** loiras/mechas, móveis planejados e estética.
- **Fase 7 — Agentes adicionais:** somente se métricas demonstrarem necessidade.
