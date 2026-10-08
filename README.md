# Idle 2D Combate

Jogo idle 2D de navegador: colecionar e batalhar criaturas originais.

- **Jogar:** https://idle2d.idle2d.workers.dev
- `site/` — o que vai para o ar (`index.html` + arte). O site lê esta pasta direto do GitHub.
- `dev/` — versão de desenvolvimento (`combate.html`, com o botão Dev), testes (`node dev/test_engine.js`), ferramentas de arte e balanceamento, documentos de passagem.

Para atualizar o site: troque os arquivos em `site/` e faça commit na branch `main`. O site atualiza em até 1 minuto (páginas) e 1 dia (imagens; ou limpe o cache no Cloudflare).
