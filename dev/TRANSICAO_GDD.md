# Idle 2D Combate — Documento de Transição (GDD + estado do projeto)

Data: 08/10/2026 · Artifact da conta nova: https://claude.ai/artifact/JFdLWTPJkUdoHzVQKxkKkL · Save: versão 11

Este documento acompanha o pacote `idle2d_projeto_completo.zip`. Junto com o `PASSAGEM_DE_BASTAO.md` (histórico detalhado, versão por versão), ele basta para continuar o projeto numa conversa nova.

**Como retomar numa conta nova:** envie o zip (ou só `combate.html` + este documento + o `PASSAGEM_DE_BASTAO.md`) e diga: *"Continue o projeto Idle 2D Combate a partir do TRANSICAO_GDD.md e do PASSAGEM_DE_BASTAO.md."*

---

## 1. Visão geral

- Jogo **idle 2D de navegador, de colecionar e batalhar monstrinhos**, inspirado num jogo 3D de referência (vídeos e prints da dona do projeto são a "referência absoluta" de layout e telas).
- **Regra fixa:** nada de nomes ou imagens de Pokémon. Todas as criaturas, nomes e artes são originais (geradas no Gemini a partir de prompts escritos pelo Claude). Na interface: "criatura/monstro"; a Pokédex se chama **Livro**.
- Outras regras fixas: Passivas ficam em aberto até chegar material; sem sistema de clima; som removido.
- Jogo em português do Brasil. Respostas curtas, sem explicação técnica longa.

## 2. Arquitetura técnica

| Item | Como é |
|---|---|
| Código | **Um único arquivo `combate.html`** (≈1,5 MB, ~4.900 linhas): HTML + CSS + JavaScript puro, sem build, sem bibliotecas. |
| Desenho | Canvas 2D, palco fixo 1100×520 escalado para a tela (celular deitado e PC). Loop `requestAnimationFrame` protegido (`frame` → `frameBody` com try/catch e watchdog). |
| Motor de regras | Bloco `<script id="engine">`: determinístico, sem desenho (batalha, economia, drops, progresso). É extraído e testado em Node pelo `test_engine.js`. |
| Apresentação | Segundo `<script>`: telas (DOM sobre o canvas), animações, efeitos, popups (`popSeq`). |
| Dados das criaturas | JSON embutido `<script id="dexdata">` (887 entradas do Livro; 267 espécies-base jogáveis + formas). |
| Arte | `art/pack_0..9.js` + `art/pack_mega.js` (WebP em base64; cada pack chama `ART({chave:dataURL})`). Chaves: nº do Livro (`20151`), `b:<chefe>`, `m:<montaria>`, `k:<nº>` (pose de costas). Pastas de imagens: `bg/`, `char/`, `city/`, `ui/`, `lm/`, `dc/`, `map/`, `sk/`. |
| Save | `localStorage` chave `idle2d.save`, versão 10, com migração automática (`migrate`). Sem servidor ainda. |
| Publicação | Artifact do Claude (dev) + site no Netlify (deploy manual da pasta; ver PASSAGEM §3). |
| Testes | `node test_engine.js` deve terminar com `OK`, `migração v9 OK`, `raro grátis OK`, `crítico OK` (+ `eventos OK`, `pesadelo/torre/guilda OK`, `mega/boss global OK`). Playwright para prints. `tools/balance/review.js` percorre todas as telas e lutas (0 erros na última versão). |
| Ferramentas | `tools/pack_art.py`, `tools/unpack_art.py`, `tools/recortar.py`, `tools/cutmega.py`, `tools/balance/` (simulador de balanceamento `sim_balance.js`, calibração `calib2.js`, alvos `targets.js`, revisão `review.js`). |

## 3. Estado atual — mecânicas e regras funcionando

### 3.1 Combate
- 3×3 por ordem de velocidade (lista "Ordem"), manual ou Auto (Auto no treinador Nv 5; velocidade ×3 no Nv 30).
- Tabela de tipos completa igual à referência: ×2 vantagem, ×½ resistência, **0 imunidade** ("Imune"); o Auto evita alvos imunes. Botão **Elemento** na Equipe mostra a Tabela de Supressão Elemental.
- Crítico ×1,5 (5–25% pela velocidade), energia/Supremo com cinema, chefe com barra grande, ondas, estrelas (1–3 pelas vivas, 4ª pelo tempo).
- Cada região **resiste a 2–3 tipos** (dano ×0,6), mostrado no painel da instância — obriga a montar vários times.
- Dica após **3 derrotas seguidas** na mesma fase (poder × recomendado, tipos bons, quem a região resiste, quem fortalecer).

### 3.2 Progressão do jogador
- **VIT:** máx. 120, +1 a cada 5 min. Comum 8, Elite/Dungeon 15, Pesadelo 20, Exploração 12–35, Desafio 15; Torre, Chefe da Guilda e BOSS Global não gastam.
- **Treinador:** 1 EXP por VIT gasta; curva `6,5·Nv + 0,23·Nv²`, teto 80. **Nenhum monstro passa do nível do treinador.**
- **Monstro:** nível (Pool de XP / Poção de XP), intimidade (Fruta; limite 10→50 com Pergaminho de Intimidade I–IV), habilidades (ouro `500·Nv²`; limite 2→10 com Tomo de Habilidade I–IV), fusão (Cartas de XP de Fusão ou sacrifício; limite +2→+10 com Núcleo de Fusão I–IV), evolução (Cartas de Evolução Comum/Rara/Épica/Lendária pelo grau do monstro + ouro `4000·k²`), **forma Mega** (ver 3.6), equipamento (+10, falha a partir do +5), acessórios (Dungeon), montaria (Nv 50 ≈ +17%).
- Itens de liberação I–IV custam 2/4/6/10 e caem no andar correspondente da **Dungeon**.
- **Montaria (v8):** não se compra, evolui: Cabrito → Lagarto → Grifo → Lobo, Nv máx. 50 por estágio (no 50 vira a próxima). Treino com Feno (Crít ×2/×10) ou Treino Avançado (10 💎). **Trajes** (300–2000 💎) são a única compra e somam atributos para sempre.
- **Treinador (v8.2):** visual novo (estilo do NPC Rafa Lima) e fantasias dark compráveis (Fantasma, Esqueleto; 800 💎, somam atributos).
- **Títulos (v8):** 26 títulos; cada um conquistado soma % de atributos (mais difícil = mais); títulos de Top 10/Top 3/1º da Arena valem enquanto você estiver lá.

### 3.3 Conteúdo de fases
- **Aventura:** 8 regiões (Praia, Bosque, Caverna, Vulcão, Pico, Usina, Pântano, Templo) × 5 instâncias, em três modos:
  - **Comum** — dá Poção de XP e Fruta; captura e fragmentos.
  - **Elite** — 3 tentativas/dia; Poção de XP; a Elite 5 dá Carta de Evolução + 12% de equipamento.
  - **Pesadelo** — depois da Elite; 3/dia; Cartas de Fusão, itens de liberação, Carta Épica/Lendária na 5ª.
- **Dungeon:** 5 andares, 3/dia — acessórios + itens de liberação da faixa do andar.
- **História** "As Páginas Perdidas": capítulos por região, diálogos com retrato, Livro → História.
- **Dificuldade calibrada por simulação** (`BAL.dm`/`edm`/`expl`/`dungeon`): jogador dedicado termina a história Comum em ~3 semanas; Elite em ~6–7; Exploração SSS e Dungeon 5 depois de 2 meses.

### 3.4 Provação (cidade → Provação)
- **Arena:** 100 posições, 5 lutas/dia; rivais **acompanham o nível do treinador**; prêmio diário com medalhas, diamantes, ouro e **fragmentos de lendário**; loja da Arena.
- **Torre dos Desafios:** 100 andares com regra de time (só um tipo / só grau C–B / máx. 2 monstros / chefe livre a cada 10); sem VIT, 5 tentativas/dia; prêmios a cada 5 andares.
- **Desafio Semanal:** tipo da semana (só monstros daquele tipo), 3/dia, até 10 Fragmentos Universais por semana. Fundo próprio `bg/weekly.jpg`.
- **BOSS Global:** abre todo dia **às 20h** até meia-noite; o chefe é a **forma Mega do dia** (calendário rotativo de 7 dias); luta por dano, 3/dia; ranking contra 29 treinadores simulados; no dia seguinte dá **1–3 Pedras Mega** daquele monstro (1º–3º = 3, 4º–10º = 2, demais = 1). Fundo `bg/bglobal.jpg`.
- **Exploração:** 2 salas (Terra do Descanso = Cartas de Evolução; Dimensão do Vazio = Cartas de XP de Fusão), ranks C a SSS, BOT/BOT×10.

### 3.5 Economia
- **Ouro apertado** (ganhos menores, custos altos; maximizar um monstro ≈ 1,1 milhão de ouro ≈ 2 meses).
- **Diamantes:** Cápsula Rara, VIT (3 compras/dia), entradas extras (Elite, Dungeon, Desafio), montarias. Pacotes com dinheiro real aparecem na Loja só como **vitrine** (R$ 4,90–199,90).
- **Criatura inteira é rara:** captura por grau (C 25%, B 12%, A 5%, lendário 1%); sem captura vêm fragmentos daquele monstro. Cápsula Comum: criatura 1%; Rara: grau A 5%, lendário 1%.
- **Fragmentos por criatura** (C 10, B 20, A 30, S/lendário 50) + **Fragmento Universal** (só de eventos: Desafio Semanal, Login dia 6, tarefas diárias, marcos da Torre/Exploração/Elite).
- **Farm offline:** até 8 h, só EXP dos monstros e ouro (60%), sem itens e sem EXP de treinador. BOT dá a recompensa básica.
- Evento de **fim de semana:** uma região com VIT pela metade e fragmentos em dobro.
- **Guilda simulada** ("Guardiões de Lumora"): 11 membros NPC, doação diária, Chefe da Guilda por dano (moedas), Loja da Guilda por nível (inclui Pedra Mega Universal no Nv 8, 1 por mês).

### 3.6 Formas Mega (lote de teste)
- Evolução **permanente** depois da forma final (atributos ×1,3), exige Nv 50, intimidade 40, 300 mil de ouro e 1 Pedra Mega (da espécie ou Universal).
- Já com arte (visual extravagante, Gemini): Mega Arnieon, Mega Flabraeon Dragão, Mega Madeleon, Mega Fanmamaeon, Mega Semsemeon, Mega Lutrovoleon, Mega Vécriinante (`MEGA_READY`).

### 3.7 Telas e interface
Cidade (missões, Guia do 1º dia, chat, botões), mapa da Aventura (ilhas pintadas), painel de instância, batalha, resultado animado (captura, 1ª vez, baú bônus), Monstros (Atributos, Intimidade, Habilidade, Equip, Treinar/Fusão, Evoluir), Equipe, Depósito, Bolsa, Loja (Comum, Equip. Montaria, Arena, Diamantes, Guilda), Cápsulas, Fragmentos, Livro, Conquistas, Login Diário, Evento do Dia, Ranking, Perfil, Montaria, Provação. Painel **Dev** só pelas teclas `'` ou `<` (inclui "Resetar o jogo").

## 4. O que acabamos de resolver ou implementar (08/10)

1. Travamento no fim de fase e no "Desistir" — loop protegido, watchdog e resultado à prova de erro.
2. Clarão branco das habilidades travando o navegador — tintas pré-calculadas em cache.
3. Livro: criaturas indisponíveis como quadro preto com "?".
4. Nova economia de fragmentos, Cartas de Evolução, itens de liberação por faixa, Exploração.
5. Tabela de tipos com imunidade real e tela de Elemento.
6. **Balanceamento completo** (VIT, curva do treinador, teto de nível, dificuldade por fase calibrada por simulação, resistências por região, raridade, farm, fim de jogo).
7. Arena que acompanha o jogador, Desafio Semanal, fim de semana, marcos, dica de derrotas.
8. Ouro apertado, equipamento com falha, montaria com peso médio, vitrine de diamantes, Guia do 1º dia.
9. Revisão geral automatizada: corrigido o travamento da luta da Arena (bug antigo) e a Loja Comum que vendia a criatura inteira.
10. Torre dos Desafios, Guilda simulada e Modo Pesadelo.
11. **Formas Mega (lote de teste de 7), BOSS Global às 20h com calendário de 7 dias, Pedras Mega, fundos novos do BOSS Global e do Desafio Semanal.**

## 5. Ideias geradas e próximos passos (pendentes)

### Prioridade imediata
0. **HUD v8 feito** (referências de 08/10). Megas: estilo aprovado; 13 prontas, faltam 32 jogáveis (lotes 1,2,3,5,6 — ver PASSAGEM v7.6); o Gemini da conta nova deu erro 1099 depois de 2 imagens.
1. ~~Aprovação do estilo das Megas~~ (aprovado).
2. Gerar no Gemini as **Megas restantes** em lotes: 40 de monstros jogáveis, 12 de famílias SS ainda bloqueadas e 5 Megas avulsas — prompts e método em `docs/Monstros_mega.md`. Cada nova entra em `MEGA_READY` (o calendário do BOSS Global cresce junto).
3. **Poses de costas das Megas** (as 7 atuais aparecem de frente no lado do jogador).
4. Decidir se as Megas de famílias SS / avulsas viram metas lendárias de fim de jogo (como obtê-las).

### Conteúdo e sistemas
5. Liberar as demais formas bloqueadas do Livro (lendários / SS / Overlord) como metas de fim de jogo.
6. Nova região a cada mês (9ª em diante: 5 Comum + 5 Elite + chefe + capítulo da história) — adiada por decisão ("depois de mais conteúdo" já começou com Pesadelo e Megas).
7. Passivas das criaturas (esperando material da dona).
8. Arte própria para lendários bloqueados.
9. Pequenas diferenças do vídeo: layout de estrelas/baús no resultado, cartão de dica da habilidade.
10. "Adorar" no Ranking hoje só no Top 3 (no mockup aparecia para todos; confirmar).

### Online / monetização (depois de mais conteúdo, por decisão da dona)
11. **Contas na nuvem (Supabase):** login (e-mail/Google), save na nuvem, Arena/Ranking/BOSS Global/Guilda com jogadores reais (trocar os NPCs).
12. **Venda de diamantes com dinheiro real:** precisa de contas na nuvem + pagamento confirmado no servidor (Mercado Pago/Stripe) + revisar regras de cápsulas pagas no Brasil (exibição de chances já existe; reembolso, menores).

### Balanceamento a acompanhar
13. Testar com jogadores o ritmo da Torre e do Pesadelo (estimados, não simulados como a história).
14. Pântano é o ponto mais duro da história com a imunidade real; ajustar se os testes acharem pesado.
15. Rodar de novo `tools/balance/sim_balance.js` sempre que mudar números (VIT, drops, custos).

## 6. Pipeline de arte (resumo)
1. Escrever o prompt (modelos em `docs/`): "chibi 3D cartoon, glossy toy-like, thick soft dark outline", figuras numa linha com espaço, **fundo magenta #FF00FF**, sem sombra/texto; anexar referência aprovada.
2. Gerar no Gemini (o Claude consegue fazer isso pelo navegador embutido: página de referências com links `gemini.google.com/app#idle2dref1=<base64>`, JS cola a imagem e o prompt; baixar a original em `lh3.googleusercontent.com/...=s0`).
3. Recortar (`tools/recortar.py` ou `tools/cutmega.py`), salvar em `mon/`, `boss/`, `back/` etc. e empacotar (`tools/pack_art.py`; as Megas ficam em `art/pack_mega.js`).

## 7. Arquivos do pacote
- `combate.html` — o jogo inteiro.
- `art/`, `bg/`, `char/`, `city/`, `dc/`, `lm/`, `map/`, `sk/`, `ui/` — arte necessária para rodar.
- `test_engine.js` — testes do motor.
- `tools/` — scripts de arte e balanceamento.
- `docs/` — prompts usados no Gemini e referências.
- `PASSAGEM_DE_BASTAO.md` — histórico detalhado de todas as versões e decisões.
- `TRANSICAO_GDD.md` — este documento.

Para rodar localmente: abrir `combate.html` num servidor estático na pasta (ex.: `npx serve .`) ou arrastar a pasta para o Netlify.
