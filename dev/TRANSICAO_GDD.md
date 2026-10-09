# Evolve Arena: Idle Monsters — Documento de Transição (GDD + estado do projeto)

Data: 09/10/2026 · Versão do jogo: **v10.2** · Save: versão 13
Antigo nome: "Idle 2D Combate". Dona do projeto: Beatriz (português do Brasil, respostas curtas).

**Como retomar numa conta nova:** envie o zip `evolve_arena_projeto.zip` (ou ao menos `combate.html` + este documento + `PASSAGEM_DE_BASTAO.md`) e diga: *"Continue o projeto Evolve Arena a partir do TRANSICAO_GDD.md e do PASSAGEM_DE_BASTAO.md."* O `PASSAGEM_DE_BASTAO.md` tem o histórico detalhado de cada versão e decisão.

---

## 1. Visão geral e regras fixas

- Jogo **idle 2D de navegador de colecionar e batalhar monstros**, inspirado num jogo 3D de referência (vídeos e prints da Beatriz são a "referência absoluta" de layout).
- **Nada de nomes ou imagens de Pokémon.** Todos os monstros são originais. Na interface: "monstro/criatura"; a Pokédex se chama **Livro**.
- Passivas em aberto até chegar material; sem clima; família de fogo original **cancelada**.
- **Toda mudança vai direto para o link** (`sh tools/publicar.sh "msg"`); o artifact é atualizado quando ela pede.
- Pixel art **só na cidade** (monstros, treinador, NPCs, montarias). Combate e menus (Monstros, Livro, Equipe, Montarias…) usam a arte pintada.

## 2. Arquitetura técnica

| Item | Como é |
|---|---|
| Código | **Um único arquivo `combate.html`** (~1 MB, ~6.200 linhas): HTML + CSS + JavaScript puro, sem build e sem bibliotecas. |
| Desenho | Canvas 2D, palco fixo 1100×520 escalado para a tela. Loop `requestAnimationFrame` protegido (try/catch + watchdog). |
| Motor de regras | `<script id="engine">`: determinístico, sem desenho (batalha, economia, drops, progresso). Testado em Node: `node test_engine.js` (todas as linhas terminam em "OK"). |
| Combate (apresentação) | Classe **`BattleSystem`** (instância `BS`): nextTurn, fila "Ordem" com animação FLIP e prévia, painel de habilidades, números de dano, barras de vida com rastro, Auto, velocidade ×1/×2, pausa, Supremo com cinema (câmera, faixas, onda de impacto). |
| Dados | JSON embutido `<script id="dexdata">`: 113 famílias escolhidas pela dona (296 formas, com Megas). |
| Arte dos monstros | `art/pack_0..9.js` + `art/pack_mega.js` (WebP base64, `ART({chave:dataURL})`); no site também `art/i/<chave>.webp` sob demanda. Chaves: nº do Livro, `b:<chefe>`, `m:<montaria>`, `k:<nº>` (costas). |
| Pixel art | `px/<chave>.webp` (613: monstros, chefes, montarias), gerados por `tools/pixelar_todos.py`. No artifact vêm num pacote só: `art/pack_px.js`. |
| Personagens | `char/` = pixel art (cidade): heróis M/F/G/S (poses 0–5), `wk{M,F}_{s,f,b}{0-3}` (caminhada), `rd{M,F}_{montaria}` (montado), `npc_0..4`, `tr_0..5`. `charo/` = arte original (resto do jogo). |
| Cidade | Pintura `city/cena.jpg` (2576×1247); recortes OCC para profundidade, colisão BLOCK_R/BLOCK_C, caminho A*, altares do Top 1, `bakeCity` (cache), mapa de luz, sombra projetada, desfoque nas bordas, nuvens, névoa, vinheta. Opção Gráficos: baixa. |
| Outras pastas | `bg/` (cenários de batalha), `city/`, `ui/` (ícones), `lm/`, `dc/`, `map/` (mapa), `sk/`, `sk2/` (ícones de habilidade). |
| Save | `localStorage` `idle2d.save` (versão 13, migração automática). Conta na nuvem opcional (Supabase, projeto `idle2d`, funções RPC). |
| Publicação | Site: https://idle2d.idle2d.workers.dev (Worker Cloudflare lendo a pasta `site/` do GitHub **evolvearenaidlemonsters-spec/idle2d-combate**; `tools/publicar.sh` copia e faz push). Artifact: https://claude.ai/artifact/JFdLWTPJkUdoHzVQKxkKkL (máx. 511 arquivos). Cache: subir `ASSET_V` (hoje '95') ao trocar imagens. |
| Arte nova | Gemini pelo Chrome: página "Referências de Arte" (artifact LbiXTSWCnHowJF4mhRRy4C, `manifest.json` com lotes) → Gemini; resultado volta pelo "Recebedor de Arte" (6wthfTkT3MXWPV3Cq781QN). Recorte: `tools/cut_pix.py`, `tools/cutgrid.py`. Fundo magenta #FF00FF. |

## 3. Estado atual — mecânicas funcionando

### Combate
- 3×3 por velocidade (Ordem), manual ou Auto; velocidade ×1/×2 (lembrada). Atalhos: Espaço = Auto, X = velocidade, 1–4 = habilidade, Esc = pausa.
- Tabela de tipos com imunidade; crítico; energia (25) e **Supremo** com cinema; Supremo começa recarregando.
- Ondas: a próxima onda só entra depois que os derrotados somem. Chefes, estrelas (1–4), regiões resistem a 2–3 tipos, dica após 3 derrotas.

### Progressão
- VIT: máx. 80 + 2 por nível (até 200); compra 120 por 40 💎 (3×/dia). Derrota devolve a VIT.
- Treinador: teto de nível dos monstros; funções liberam por nível (Bolsa 2, Login 2, Loja 3, Livro 3, Evento 4, Conquistas 6, Fragmentos 7, Ranking 8, Provação 10, Guilda 12).
- Monstro: nível, intimidade, habilidades, fusão, evolução (Cartas), **Mega** (Nv 60, Pedra Mega), equipamento (+10), acessórios.
- Montaria que evolui (Cabrito → Lagarto → Grifo → Lobo, Nv 50 por estágio) + trajes (💎). Fantasias do treinador (Fantasma, Esqueleto). 26 títulos com atributos.
- Fragmentos por grau (B/A/S) e por monstro.

### Conteúdo
- Aventura: 8 regiões × 5 instâncias (Comum, Elite, Pesadelo), Dungeon, história "As Páginas Perdidas".
- Provação: Arena (100 posições), Torre dos Desafios (100 andares), Desafio Semanal, BOSS Global (20h, Megas), Exploração.
- Guilda simulada, Loja (Comum, Arena, Guilda, Diamantes como vitrine), Cápsulas, Login, Evento, Conquistas, Ranking (inclui jogadores reais).

### Cidade
- Pintura com câmera que segue o jogador, toque para andar (A*), teclado, colisões e recortes de profundidade.
- Altares Top 1 (Poder, Livro, Nível, Arena) abrem o Ranking; prédios abrem Loja, Cápsulas, Centro de Monstros, Arena, Galeria dos Campeões e Portão da Aventura.
- Treinador com **caminhada animada** (frente, lado e costas), **montado** de verdade na montaria, monstro companheiro seguindo.
- Sem NPCs andando (chat do mundo continua); HUD sem "+".

## 4. O que acabamos de resolver ou implementar (09/10)

1. Cidade nova pintada, câmera 25% mais longe, sem pessoas pintadas; Firefox sem travar + opção Gráficos baixa.
2. Novo visual pixel art do treinador, NPCs e rivais; altares do Top 1.
3. Tela Monstros (tema Holo) e todas as telas padronizadas (Tema Aço); painéis 25% menores.
4. Combate: classe BattleSystem, layout de celular, animações (fila, dano, Supremo cinema); animações eram escondidas pelo "reduzir movimento" do sistema → virou opção do jogo.
5. Nome novo **Evolve Arena: Idle Monsters**; novo ícone da Aventura; atalhos de teclado; Cápsulas com X.
6. Pixel art de todos os monstros/chefes/montarias (só na cidade).
7. 10 cenários de batalha novos no estilo da cidade.
8. v10.1: mortos não reaparecem no fim da onda; ícones de medalha/diamante corrigidos nas recompensas; personagens pixel só na cidade.
9. v10.2: sem NPCs andando, HUD sem "+", treinador montado (8 imagens), caminhada animada (menino e menina), rivais refeitos sem pedaços cortados, profundidade na cidade (sombra projetada, luz do cenário, desfoque, nuvens, névoa, vinheta).

## 5. Ideias e próximos passos (pendentes)

### Arte
1. Fantasias Fantasma (poses 4/5 e montado) e Esqueleto inteiras no estilo pixel; caminhada animada para as fantasias.
2. Versões menina das fantasias.
3. Megas restantes (32 jogáveis + SS/avulsas) e poses de costas das Megas (adiado pela dona).
4. Ícones de habilidade restantes e arte própria para lendários bloqueados.
5. Ajustes finos: altura do rótulo "Você" quando montado; possíveis ajustes do desfoque/névoa da cidade.

### Conteúdo e sistemas
6. Passivas dos monstros (aguardando material).
7. Liberar formas bloqueadas (lendários/SS/Overlord) como metas de fim de jogo.
8. Nova região por mês (9ª em diante).
9. Cidade 3D (adiado pela dona).

### Online / monetização
10. Contas na nuvem completas (login, save, Arena/Ranking/BOSS Global/Guilda com jogadores reais) — base Supabase pronta.
11. Venda de diamantes com dinheiro real (servidor + pagamento + regras de cápsulas no Brasil).

### Balanceamento
12. Testar com jogadores o ritmo da Torre e do Pesadelo; Pântano é o ponto mais duro; rodar `tools/balance/sim_balance.js` a cada mudança de números.

## 6. Arquivos do pacote
- `combate.html` — o jogo inteiro (abrir num servidor estático, ex.: `npx serve .`).
- `art/`, `bg/`, `char/`, `charo/`, `city/`, `dc/`, `lm/`, `map/`, `px/`, `sk/`, `sk2/`, `ui/` — arte necessária.
- `test_engine.js` — testes do motor. `tools/` — scripts (arte, pixel, recorte, balanceamento, publicação). `docs/` — prompts do Gemini.
- `PASSAGEM_DE_BASTAO.md` — histórico completo. `TRANSICAO_GDD.md` — este documento.
