#!/usr/bin/env bash
# Idioma da LINHA DE COMANDO do kit — o idioma em que install.sh/_common.sh
# falam com quem instala. É DISTINTO do idioma que o CRM instalado usa com os
# clientes da empresa (aquele mora em user_metadata.locale/organizations, e
# continua todo em português por padrão, escolhido pela pessoa na tela).
#
# Lido de DESKCOMM_IDIOMA_CLI: variável de ambiente (já exportada nesta mesma
# sessão, por perguntar_idioma_cli) ou linha do .env (via load_env, que roda
# antes deste arquivo ser sourced de novo num script futuro). Sem nenhuma das
# duas, pt-BR — o idioma original de todo texto deste kit, e o que qualquer
# instalação já existente continua vendo sem mudar nada.
IDIOMA_CLI="${DESKCOMM_IDIOMA_CLI:-pt-BR}"

# Tabela pt-BR → es. A CHAVE é sempre o texto em português, byte a byte — o
# mesmo contrato de lib/i18n/dicionario.ts na aplicação web: a chave nunca
# muda, só o valor por idioma. Mensagem com valor que só existe em tempo de
# execução (nome de arquivo, URL, número, saída de outro comando) usa
# placeholders {1}, {2}… na chave E no valor; quem chama passa os valores como
# argumentos de t(), nunca embutidos na chave. Placeholder por posição, e não
# %s do printf, porque texto de erro real às vezes carrega um % de verdade
# (porcentagem, encoding de URL) — com {N} isso nunca precisa de escape.
declare -A _ES=(
  ["Este servidor usa arquitetura '{1}', mas as imagens publicadas do DeskcommCRM hoje são linux/amd64."]="Este servidor usa arquitectura '{1}', pero las imágenes publicadas de DeskcommCRM hoy son linux/amd64."
  ["  Use uma VPS x86_64/amd64. Repetir o download não resolve; ARM64 só será suportado quando houver imagens multi-arquitetura."]="  Usa una VPS x86_64/amd64. Repetir la descarga no soluciona nada; ARM64 solo se admitirá cuando existan imágenes multiarquitectura."
  ["  (rede '{1}' criada — é por ela que o Traefik alcança o CRM)"]="  (red '{1}' creada — es por ella que Traefik alcanza el CRM)"
  ["A rede Docker '{1}' (a do Nginx Proxy Manager) não existe.
Rode 'docker network ls', identifique a rede do seu NPM (Settings > a que o
contêiner dele já está conectado) e ponha PROXY_NETWORK_NAME=<nome> no .env
antes de tentar de novo."]="La red Docker '{1}' (la del Nginx Proxy Manager) no existe.
Ejecuta 'docker network ls', identifica la red de tu NPM (Settings > la red a
la que su contenedor ya está conectado) y pon PROXY_NETWORK_NAME=<nombre> en
el .env antes de volver a intentarlo."
  ["Não consegui criar a rede Docker '{1}'. O Docker respondeu:
  {2}"]="No pude crear la red Docker '{1}'. Docker respondió:
  {2}"
  ["A rede Docker '{1}' não existe.
Rode 'docker network ls', identifique a rede do seu Traefik e ponha
TRAEFIK_NETWORK=<nome> no .env antes de tentar de novo."]="La red Docker '{1}' no existe.
Ejecuta 'docker network ls', identifica la red de tu Traefik y pon
TRAEFIK_NETWORK=<nombre> en el .env antes de volver a intentarlo."
  ["A rede '{1}' tem driver '{2}', e o app precisa
de uma bridge para o Traefik alcançar o contêiner. Se o seu Traefik roda em modo
host (é o caso quando 'docker ps' não mostra porta publicada nele), APAGUE a linha
TRAEFIK_NETWORK do .env: o kit cria e usa a rede '{3}'.
Senão, rode 'docker network ls' e ponha a bridge certa em TRAEFIK_NETWORK no .env.
Se for uma overlay do Swarm, ela precisa ter sido criada com --attachable —
sem isso um contêiner de compose comum não consegue entrar nela."]="La red '{1}' tiene el driver '{2}', y la app necesita
una bridge para que Traefik alcance el contenedor. Si tu Traefik corre en modo
host (es el caso cuando 'docker ps' no muestra un puerto publicado en él), BORRA
la línea TRAEFIK_NETWORK del .env: el kit crea y usa la red '{3}'.
Si no, ejecuta 'docker network ls' y pon la bridge correcta en TRAEFIK_NETWORK en el .env.
Si es una overlay de Swarm, tiene que haberse creado con --attachable —
sin eso un contenedor de compose común no puede entrar en ella."
  ["Pausando o sistema para mexer no banco com segurança."]="Pausando el sistema para modificar la base de datos con seguridad."
  ["⛔ PEÇAS DO BANCO NÃO VOLTARAM depois da atualização:"]="⛔ PARTES DE LA BASE DE DATOS NO VOLVIERON después de la actualización:"
  ["   Enquanto elas estiverem paradas, o CRM não consegue ler nem gravar."]="   Mientras estén detenidas, el CRM no puede leer ni escribir."
  ["   Para subir à mão:  docker start {1}"]="   Para levantarlas a mano:  docker start {1}"
  ["   O CRM segue PARADO de propósito. Resolva as regras antes de subir."]="   El CRM sigue DETENIDO a propósito. Resuelve las reglas antes de levantarlo."
  ["Modo single-server sem {1}/.env — rode install-single-server.sh."]="Modo single-server sin {1}/.env — ejecuta install-single-server.sh."
  ["Atualizando o Supabase desta VPS ({1} → {2})"]="Actualizando el Supabase de esta VPS ({1} → {2})"
  ["O Supabase não foi atualizado; segue na versão {1}. A próxima atualização tenta de novo."]="El Supabase no se actualizó; sigue en la versión {1}. La próxima actualización lo vuelve a intentar."
  ["⚠ As imagens prontas desta versão não servem para esta VPS."]="⚠ Las imágenes listas de esta versión no sirven para esta VPS."
  ["  O motivo mais comum é a arquitetura dela ser diferente da das imagens"]="  El motivo más común es que su arquitectura sea distinta de la de las imágenes"
  ["  publicadas: o registro responde que não tem manifest para a arquitetura"]="  publicadas: el registro responde que no tiene manifest para la arquitectura"
  ["  daqui. Não é problema da sua VPS nem do seu acesso."]="  de aquí. No es un problema de tu VPS ni de tu acceso."
  ["  Vou construir as três imagens aqui, do código desta versão."]="  Voy a construir las tres imágenes aquí, a partir del código de esta versión."
  ["  Leva de 15 a 25 minutos e a tela fica sem novidade nesse tempo —"]="  Toma de 15 a 25 minutos y la pantalla no muestra novedades en ese tiempo —"
  ["  não é travamento, pode deixar rodando."]="  no significa que se colgó, puedes dejarlo corriendo."
  ["✖ A construção das imagens aqui falhou (o erro está logo acima)."]="✖ La construcción de las imágenes aquí falló (el error está justo arriba)."
  ["✖ As imagens foram construídas, mas os serviços não subiram."]="✖ Las imágenes se construyeron, pero los servicios no arrancaron."
  ["Não achei {1}. Rode a partir da pasta do projeto."]="No encontré {1}. Ejecuta esto desde la carpeta del proyecto."
  ["Falta o .env (rode install.sh primeiro)."]="Falta el .env (ejecuta install.sh primero)."
  ["• parte do banco não aplicou (disputa com o app no ar ou conexão instável) — aplicando de novo, é seguro (passada {1} de {2}). O que não aplicou:"]="• parte de la base de datos no se aplicó (disputa con la app activa o conexión inestable) — aplicando de nuevo, es seguro (pasada {1} de {2}). Lo que no se aplicó:"
  ["Usuário não encontrado."]="Usuario no encontrado."
  ["⚠ 'crontab' não encontrado — instale o pacote 'cron' e rode de novo pra ativar as automações."]="⚠ No se encontró 'crontab' — instala el paquete 'cron' y vuelve a ejecutar esto para activar las automatizaciones."
  ["⚠ falta INTERNAL_SECRET/INTERNAL_CRON_SECRET — não ativei o cron das automações."]="⚠ Falta INTERNAL_SECRET/INTERNAL_CRON_SECRET — no activé el cron de las automatizaciones."
  ["⚠ falta NEXT_PUBLIC_APP_URL — não ativei o cron das automações."]="⚠ Falta NEXT_PUBLIC_APP_URL — no activé el cron de las automatizaciones."
  ["⚠ não consegui gravar {1} — não ativei o cron das automações."]="⚠ No pude guardar {1} — no activé el cron de las automatizaciones."
  ["✓ automações ativas (cron do event-log-drain, a cada minuto)"]="✓ Automatizaciones activas (cron del event-log-drain, cada minuto)"
  ["Higienizando eventos pendentes antigos (1ª ativação do cron)"]="Depurando eventos pendientes antiguos (1.ª activación del cron)"
  ["✓ eventos pendentes com mais de 7 dias marcados como concluídos"]="✓ Eventos pendientes con más de 7 días marcados como concluidos"
  ["⚠ não consegui higienizar eventos antigos — confira manualmente a tabela event_log se necessário."]="⚠ No pude depurar eventos antiguos — revisa manualmente la tabla event_log si hace falta."
  ["⚠ não consegui gerar a senha nova das rotinas — tento de novo na próxima atualização."]="⚠ No pude generar la contraseña nueva de las rutinas — lo intento de nuevo en la próxima actualización."
  ["Trocando a senha interna das rotinas (a antiga ficou no log do sistema)"]="Cambiando la contraseña interna de las rutinas (la anterior quedó en el log del sistema)"
  ["⚠ não consegui reiniciar o app com a senha nova — mantive a antiga e tento de novo na próxima atualização."]="⚠ No pude reiniciar la app con la contraseña nueva — mantuve la anterior y lo intento de nuevo en la próxima actualización."
  ["⚠ o app ainda não respondeu depois da troca — a senha nova já está no .env e segue valendo."]="⚠ La app todavía no respondió después del cambio — la contraseña nueva ya está en el .env y sigue vigente."
  ["✓ senha interna das rotinas trocada — a que ficou gravada no log do sistema não abre mais nada"]="✓ Contraseña interna de las rutinas cambiada — la que quedó grabada en el log del sistema ya no abre nada"
  ["  Recomendado (não obrigatório): apagar os logs antigos, onde a senha velha aparece."]="  Recomendado (no obligatorio): borrar los logs antiguos, donde aparece la contraseña anterior."
  ["  Numa VPS Ubuntu/Debian, como root:"]="  En una VPS Ubuntu/Debian, como root:"
  ["⚠ 'crontab' não encontrado — o botão de atualizar pela tela não vai funcionar."]="⚠ No se encontró 'crontab' — el botón de actualizar desde la pantalla no va a funcionar."
  ["⚠ falta INTERNAL_SECRET — não ativei o agente de atualização."]="⚠ Falta INTERNAL_SECRET — no activé el agente de actualización."
  ["⚠ falta NEXT_PUBLIC_APP_URL — não ativei o agente de atualização."]="⚠ Falta NEXT_PUBLIC_APP_URL — no activé el agente de actualización."
  ["✓ atualização pela tela ativa (agente a cada 5 minutos)"]="✓ Actualización desde la pantalla activa (agente cada 5 minutos)"
  ["✓ chave de cifra dos segredos gerada e gravada no .env"]="✓ Clave de cifrado de los secretos generada y guardada en el .env"
  ["✓ chave de cifra ativa no banco (segredos de webhook são guardados cifrados)"]="✓ Clave de cifrado activa en la base de datos (los secretos de webhook se guardan cifrados)"
  ["⚠ não consegui semear a chave de cifra no banco — segredos de webhook não poderão ser salvos até rodar update.sh de novo."]="⚠ No pude sembrar la clave de cifrado en la base de datos — los secretos de webhook no podrán guardarse hasta volver a ejecutar update.sh."

  # ── install.sh: banner() e show_recovery() ──────────────────────────────
  ["  Agentes de IA que atendem no WhatsApp, dentro do seu CRM."]="  Agentes de IA que atienden por WhatsApp, dentro de tu CRM."
  ["  Open-source · roda no seu servidor · os dados são seus."]="  Open-source · corre en tu servidor · los datos son tuyos."
  ["A instalação parou. Nada ficou pela metade sem conserto."]="La instalación se detuvo. Nada quedó a medias sin solución."
  ["Como voltar atrás e recomeçar do zero:"]="Cómo volver atrás y empezar de cero:"
  ["apaga a configuração digitada"]="borra la configuración ingresada"
  ["derruba o que subiu"]="derriba lo que se levantó"
  ["começa de novo"]="empieza de nuevo"
  ["Se o schema chegou a ser aplicado e você quer o banco limpo de novo,"]="Si el esquema llegó a aplicarse y quieres la base de datos limpia de nuevo,"
  ["abra o Supabase > SQL Editor e rode (ATENÇÃO: apaga todos os dados):"]="abre Supabase > SQL Editor y ejecuta (ATENCIÓN: borra todos los datos):"

  # ── install.sh: validadores (v_domain, v_email, v_hex, v_locale, v_supabase_url, v_sb_key, v_db_url, v_anthropic, v_openrouter) ──
  ["Digite só o domínio, sem https:// — ex.: crm.suaempresa.com.br"]="Escribe solo el dominio, sin https:// — ej.: crm.tuempresa.com.mx"
  ["Digite só o domínio, sem barra nem caminho — ex.: crm.suaempresa.com.br"]="Escribe solo el dominio, sin barra ni ruta — ej.: crm.tuempresa.com.mx"
  ["Isso não parece um domínio (falta o ponto) — ex.: crm.suaempresa.com.br"]="Esto no parece un dominio (falta el punto) — ej.: crm.tuempresa.com.mx"
  ["E-mail inválido — precisa ter @ e um domínio, ex.: voce@suaempresa.com.br"]="Correo inválido — necesita @ y un dominio, ej.: tu@tuempresa.com.mx"
  ["Use um código de cor como #7a5cd6 — cerquilha e 6 dígitos —, ou Enter para a cor do sistema"]="Usa un código de color como #7a5cd6 — numeral y 6 dígitos —, o Enter para el color del sistema"
  ["Escolha 1 (Português) ou 2 (Español) — ou Enter para Português"]="Elige 1 (Português) o 2 (Español) — o Enter para Português"
  ["Cole a URL completa, começando com https:// — ex.: https://abcdefgh.supabase.co"]="Pega la URL completa, empezando con https:// — ej.: https://abcdefgh.supabase.co"
  ["A URL precisa começar com https://. Na nuvem ela fica em Settings > API > Project URL (termina em .supabase.co); num Supabase próprio, é o endereço do seu servidor."]="La URL debe empezar con https://. En la nube está en Settings > API > Project URL (termina en .supabase.co); en un Supabase propio, es la dirección de tu servidor."
  ["O modo single-server exige SUPABASE_INTERNAL_URL com http:// ou https:// para validar o Supabase local."]="El modo single-server requiere SUPABASE_INTERNAL_URL con http:// o https:// para validar el Supabase local."
  ["Não consegui alcançar {1} — confira se o projeto existe, está ativo (projeto pausado não responde) e se o VPS tem internet."]="No pude conectar con {1} — revisa que el proyecto exista, esté activo (un proyecto pausado no responde) y que la VPS tenga internet."
  ["Essa é a chave '{1}', e aqui eu preciso da '{2}'. Em Settings > API elas ficam uma embaixo da outra — confira qual copiou."]="Esa es la clave '{1}', y aquí necesito la '{2}'. En Settings > API están una debajo de la otra — revisa cuál copiaste."
  ["Essa chave é de OUTRO projeto Supabase ({1}), e a URL que você deu é do projeto {2}. Copie as duas do mesmo projeto."]="Esa clave es de OTRO proyecto de Supabase ({1}), y la URL que diste es del proyecto {2}. Copia las dos del mismo proyecto."
  ["Isso não parece uma chave do Supabase (elas começam com 'eyJ' ou 'sb_'). Pegue em Settings > API."]="Esto no parece una clave de Supabase (empiezan con 'eyJ' o 'sb_'). Consíguela en Settings > API."
  ["  ⚠ não consegui checar a chave online (sem resposta do Supabase); sigo com ela."]="  ⚠ no pude comprobar la clave en línea (Supabase no respondió); sigo con ella."
  ["O Supabase recusou essa chave (resposta {1}). Confira se copiou a '{2}' inteira, sem espaço no fim."]="Supabase rechazó esa clave (respuesta {1}). Revisa que hayas copiado la '{2}' completa, sin espacio al final."
  ["Resposta inesperada do Supabase ao testar a chave ({1}). Confira a chave e o projeto."]="Respuesta inesperada de Supabase al probar la clave ({1}). Revisa la clave y el proyecto."
  ["A connection string começa com postgresql:// — copie em Settings > Database > Connection string, modo URI."]="La connection string empieza con postgresql:// — cópiala en Settings > Database > Connection string, modo URI."
  ["Você colou a string com o [YOUR-PASSWORD] no meio — troque isso pela senha do banco (a que você definiu ao criar o projeto)."]="Pegaste la cadena con [YOUR-PASSWORD] en el medio — cambia eso por la contraseña de la base de datos (la que definiste al crear el proyecto)."
  ["Essa é a 'Direct connection' do Supabase — ela só existe em IPv6 e o VPS é IPv4, então nunca conecta."]="Esa es la 'Direct connection' de Supabase — solo existe en IPv6 y la VPS es IPv4, así que nunca conecta."
  ["Volte em Settings > Database e copie a do Session pooler (o host termina em .pooler.supabase.com)."]="Vuelve a Settings > Database y copia la del Session pooler (el host termina en .pooler.supabase.com)."
  ["Essa connection string é do projeto '{1}', mas a URL que você deu é do projeto '{2}'. Precisam ser o mesmo projeto."]="Esa connection string es del proyecto '{1}', pero la URL que diste es del proyecto '{2}'. Tienen que ser el mismo proyecto."
  ["Não consegui conectar no banco. O Postgres respondeu:"]="No pude conectar con la base de datos. Postgres respondió:"
  ["Quase sempre é a senha com caractere especial: na URL ela precisa ser codificada."]="Casi siempre es la contraseña con un carácter especial: en la URL debe estar codificada."
  ["Troque  @ por %40   :  por %3A   /  por %2F   ?  por %3F   #  por %23"]="Cambia  @ por %40   :  por %3A   /  por %2F   ?  por %3F   #  por %23"
  ["Senha do banco errada. É a senha do PROJETO (definida ao criá-lo), não a da sua conta Supabase."]="Contraseña de la base de datos incorrecta. Es la contraseña del PROYECTO (definida al crearlo), no la de tu cuenta de Supabase."
  ["Dá pra redefinir em Settings > Database > Reset database password."]="Puedes restablecerla en Settings > Database > Reset database password."
  ["Isso é o problema de IPv6: use a connection string do Session pooler, não a Direct connection."]="Este es el problema de IPv6: usa la connection string del Session pooler, no la Direct connection."
  ["A chave da Anthropic começa com 'sk-ant-'. Pegue em console.anthropic.com > API Keys."]="La clave de Anthropic empieza con 'sk-ant-'. Consíguela en console.anthropic.com > API Keys."
  ["  ⚠ não consegui checar a chave online; sigo com ela."]="  ⚠ no pude comprobar la clave en línea; sigo con ella."
  ["A Anthropic recusou essa chave (401). Confira se está ativa e se copiou inteira."]="Anthropic rechazó esa clave (401). Revisa que esté activa y que la hayas copiado completa."
  ["  ⚠ a Anthropic respondeu {1} ao testar a chave; sigo com ela."]="  ⚠ Anthropic respondió {1} al probar la clave; sigo con ella."
  ["A chave da OpenRouter começa com 'sk-or-'. Pegue em openrouter.ai/keys."]="La clave de OpenRouter empieza con 'sk-or-'. Consíguela en openrouter.ai/keys."
  ["A OpenRouter recusou essa chave (401). Confira se está ativa e se copiou inteira."]="OpenRouter rechazó esa clave (401). Revisa que esté activa y que la hayas copiado completa."
  ["  ⚠ a OpenRouter respondeu {1} ao testar a chave; sigo com ela."]="  ⚠ OpenRouter respondió {1} al probar la clave; sigo con ella."
  ["A chave da OpenAI começa com 'sk-'. Pegue em platform.openai.com > API keys (ou deixe em branco)."]="La clave de OpenAI empieza con 'sk-'. Consíguela en platform.openai.com > API keys (o déjala en blanco)."
  ["A OpenAI recusou essa chave (401). Confira se está ativa e se copiou inteira."]="OpenAI rechazó esa clave (401). Revisa que esté activa y que la hayas copiado completa."
  ["  ⚠ a OpenAI respondeu {1} ao testar a chave; sigo com ela."]="  ⚠ OpenAI respondió {1} al probar la clave; sigo con ella."
  ["Senha muito curta ({1} caracteres). Use pelo menos 8 — é a senha de admin do seu CRM."]="Contraseña muy corta ({1} caracteres). Usa al menos 8 — es la contraseña de admin de tu CRM."

  # ── install.sh: ask_one() — o motor genérico de todas as perguntas ──────
  ["Falta {1} (modo --yes exige .env preenchido)."]="Falta {1} (el modo --yes requiere el .env completo)."
  ["A entrada terminou antes de eu receber {1}. Rode o instalador num terminal interativo."]="La entrada terminó antes de recibir {1}. Ejecuta el instalador en una terminal interactiva."
  ["  Esse campo é obrigatório. (digite 'voltar' para refazer a pergunta anterior)"]="  Este campo es obligatorio. (escribe 'voltar' para rehacer la pregunta anterior)"
  ["  Esse valor parece ter sido colado 2x seguidas (o campo é secreto e não mostra o que você cola). Cole uma vez só."]="  Este valor parece haberse pegado 2 veces seguidas (el campo es secreto y no muestra lo que pegas). Pégalo una sola vez."
  ["  (digite 'voltar' para refazer a pergunta anterior)"]="  (escribe 'voltar' para rehacer la pregunta anterior)"
  ["  ✓ recebido ({1} caracteres)"]="  ✓ recibido ({1} caracteres)"
)

# t <texto-modelo-em-pt-BR> [valor-de-{1}] [valor-de-{2}]…
# Devolve o texto pronto: em es quando IDIOMA_CLI=es E existe tradução na
# tabela; em pt-BR em qualquer outro caso — padrão do kit, e também a rede de
# segurança de uma mensagem nova ainda sem entrada na tabela (nunca uma tela
# em branco por falta de tradução).
t() {
  local chave="$1"; shift || true
  local texto="$chave"
  if [ "$IDIOMA_CLI" = "es" ] && [ "${_ES[$chave]+isset}" = "isset" ]; then
    texto="${_ES[$chave]}"
  fi
  local i=1 arg
  for arg in "$@"; do
    texto="${texto//"{$i}"/"$arg"}"
    i=$((i + 1))
  done
  printf '%s' "$texto"
}

# Pergunta o idioma da CLI — o primeiro passo interativo do install.sh, antes
# de qualquer outra saída, para o resto da instalação já nascer no idioma
# escolhido. Só interativo e só uma vez: com --yes, fora de terminal, ou com
# DESKCOMM_IDIOMA_CLI já definida (env ou .env de uma instalação existente),
# não pergunta de novo — mesma régua de resposta_sim/NONINTERACTIVE do resto
# do kit.
perguntar_idioma_cli() {
  [ "${NONINTERACTIVE:-0}" = "1" ] && return 0
  [ -t 0 ] || return 0
  [ -n "${DESKCOMM_IDIOMA_CLI:-}" ] && return 0
  local resp
  printf '%s\n' "Idioma da instalação / Idioma de la instalación:"
  printf '%s\n' "  1) Português"
  printf '%s\n' "  2) Español"
  printf '%s' "Escolha 1 ou 2 (Enter = 1) / Elige 1 o 2 (Enter = 1): "
  read -r resp || resp=""
  case "$resp" in
    2 | es | Es | ES | español | Español) IDIOMA_CLI=es ;;
    *) IDIOMA_CLI=pt-BR ;;
  esac
  export DESKCOMM_IDIOMA_CLI="$IDIOMA_CLI"
}
