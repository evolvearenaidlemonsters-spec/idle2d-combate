#!/bin/sh
# Publica o jogo no site (https://idle2d.idle2d.workers.dev): copia combate.html (sem botão Dev) e a arte
# para site/ do repositório idle2d-combate, junto com dev/, e envia para o GitHub (o site lê de lá).
# uso: sh tools/publicar.sh "mensagem do commit"   (rodar na pasta do projeto)
set -e
P=$(pwd); R=${REPO:-/home/claude/idle2d-combate}; MSG=${1:-"Atualização do jogo"}
[ -d "$R/.git" ] || git clone --depth 1 https://github.com/evolvearenaidlemonsters-spec/idle2d-combate "$R"
cd "$R" && git pull -q --rebase origin main || true
mkdir -p site dev
cp "$P/combate.html" site/index.html && sed -i 's/id="devBtn"/id="devBtn" hidden/' site/index.html
for d in art bg char city dc lm map sk ui; do rm -rf "site/$d"; cp -r "$P/$d" site/; done
cp "$P/combate.html" "$P/test_engine.js" "$P/PASSAGEM_DE_BASTAO.md" "$P/TRANSICAO_GDD.md" dev/
rm -rf dev/tools dev/docs; cp -r "$P/tools" "$P/docs" dev/; rm -rf dev/tools/__pycache__ dev/tools/balance/rev
git add -A && (git diff --cached --quiet && echo "Nada mudou." || (git commit -qm "$MSG" && git push -q origin HEAD:main && echo "Publicado: https://idle2d.idle2d.workers.dev"))
