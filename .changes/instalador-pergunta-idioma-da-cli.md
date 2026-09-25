---
impacto: capacidade_nova
secao: adicionado
titulo: O instalador pergunta em que idioma ele mesmo fala — português ou español
---

`install.sh` estava inteiramente em português, mesmo permitindo escolher espanhol como idioma da aplicação web instalada — um operador hispanohablante precisava entender português para completar a própria instalação. Agora a primeira pergunta interativa, antes de qualquer outra saída, é o idioma da instalação (Português/Español), e todo o resto do script — banner, validadores, entrevista, detecção de proxy, aplicação do schema, tela final — responde nesse idioma. A escolha é gravada em `DESKCOMM_IDIOMA_CLI` no `.env` e persiste entre reexecuções do `install.sh`. Fora do escopo desta passada: os demais scripts do kit (`update.sh`, `backup.sh`, `diagnostico.sh`...) ainda respondem só em português — ficam para uma extensão futura do mesmo mecanismo (`hostgator-setup-kit/_i18n.sh`).
