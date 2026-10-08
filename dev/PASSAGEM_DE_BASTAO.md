# Idle 2D Combate — passagem de bastão (07/10/2026)

Este arquivo é o ponto de partida para continuar o projeto em outra conversa. Ele resume tudo o que foi decidido e construído até agora, como o código está organizado, como produzir arte nova, e o que ficou pendente — incluindo a última decisão sobre o visual do combate.

Dona do projeto: Beatriz. Conversa em português do Brasil.

---

## 1. O que é o jogo

- Jogo **idle 2D de navegador**, em **um único arquivo HTML** (`combate.html`), sem build e sem dependências: JavaScript puro + Canvas. Palco fixo de **1100×520**, escalado para caber na tela (celular deitado e PC).
- Adapta, com o máximo de fidelidade visual, um jogo 3D de colecionar monstrinhos (referência: vídeos e prints que a Beatriz manda — eles são a **"referência absoluta"**).
- **Regra fixa: nada de nomes ou imagens de Pokémon.** Todas as criaturas, nomes e artes são originais (geradas pela Beatriz no Gemini a partir de prompts escritos aqui). Na interface o termo é "criatura"/"monstro"; a "Pokédex" se chama **Livro**.
- Outras regras fixas: **Passivas** ficam em aberto até ela mandar material; **sem sistema de clima**.

## 2. Forma de trabalho combinada

- A Beatriz manda mockups/prints/vídeos e pede "igual a isso". Copiar layout, cores, proporções e textos do mockup; quando algo do mockup conflitar com uma regra do jogo, implementar a regra e avisar em uma linha.
- Arte: eu escrevo prompts para o Gemini (fundo magenta #FF00FF, figuras em uma linha com espaço), ela gera e manda as imagens, eu recorto e integro.
- Depois de cada mudança: rodar `node test_engine.js` (tem que terminar com `OK`, `migração v9 OK`, `raro grátis OK`, `crítico OK`), tirar screenshot com Playwright para conferir, e republicar o artifact.
- **Zip do site: só gerar quando ela pedir** (pedido explícito dela em 07/10).
- Respostas curtas; ela não quer explicação técnica longa.

## 3. Onde o jogo está publicado

- **Artifact (versão de desenvolvimento):** https://claude.ai/artifact/JFdLWTPJkUdoHzVQKxkKkL (republicado em 08/10 na conta nova evolvearenaidlemonsters, a partir da v21; os links antigos TRMKVrsozR9zKEZBwc8a4o e Nr1vAYvt5BAdZiZVaN2xyc são de contas anteriores). De outra conversa, dá para atualizar esse mesmo link passando a URL para a ferramenta de Artifact (ler antes, depois publicar com `url`).
  - Publicar só a página: o artifact já contém as pastas de arte; ao republicar, mandar só o `combate.html` (os arquivos que não forem enviados são mantidos).
  - Limite do artifact: 511 arquivos no total e 255 por publicação — por isso a arte de criaturas fica empacotada em `art/pack_*.js`.
- **Site para amigos testarem (desde 08/10): https://idle2d.idle2d.workers.dev** — Worker `idle2d` no Cloudflare (conta evolvearenaidlemonsters) que serve a pasta `site/` do repositório GitHub **evolvearenaidlemonsters-spec/idle2d-combate** (lê de raw.githubusercontent, cache de 60 s no HTML e 1 dia nas imagens). Para atualizar: copiar `combate.html` para `site/index.html` (com `id="devBtn" hidden`) e a arte para `site/`, commit e push na `main`. O repositório também guarda `dev/` (combate.html com Dev, testes, ferramentas, docs). Push funciona pelo proxy do Claude (app Claude instalado no repo). O shell não alcança o Cloudflare; mudanças no Worker são feitas pela ferramenta do Cloudflare (API).
- Netlify (antigo, deploy manual) não é mais usado.
  - Para atualizar: gerar o pacote do site (abaixo), ela descompacta e arrasta a pasta em **Deploys** no Netlify.
  - GitHub/Cloudflare automático foi descartado: o repositório `leomirafake-bot/idle2d` está numa conta ligada ao ChatGPT, sem acesso daqui.
- **Como gerar o pacote do site (só quando ela pedir):**
  ```
  mkdir -p site && cp combate.html site/index.html
  sed -i 's/id="devBtn"/id="devBtn" hidden/' site/index.html   # esconde o botão Dev (as teclas < e ' ainda abrem o painel)
  cp -r art bg char city dc lm sk ui site/
  cd site && zip -qr ../idle2d-site.zip .
  ```
- Cada amigo salva o progresso no próprio navegador (localStorage, chave `idle2d.save`). Contas, save na nuvem e Arena real ficam para depois (Supabase — ela já tem conta).

## 4. Arquivos deste pacote

| Caminho | O que é |
|---|---|
| `combate.html` | O jogo inteiro (≈3.300 linhas). |
| `test_engine.js` | Testes do motor (Node). `node test_engine.js` |
| `art/pack_0..4.js` | Arte de 515 criaturas, 53 chefes e 4 montarias em WebP base64. Cada pack chama `ART({chave:dataURL})`. Chaves: nº do Livro (ex. `20151`), `b:<chefe>`, `m:<montaria>`. |
| `bg/` | Fundos de combate por região. |
| `char/` | Personagens cartoon: `heroM_0..3`, `heroF_0..3` (0 frente, 1 três-quartos, 2 lado andando, 3 costas), `npc_0..4` (vendedora, professor, atendente, juíza, guia), `tr_0..5` (rivais: surfista, caçador de insetos, alpinista, garota do fogo, engenheiro, mística). |
| `city/`, `ui/` | Cidade e ícones/botões de interface. |
| `lm/`, `dc/` | Mapa da Aventura: marcos (10) e enfeites (16). |
| `sk/` | Ícones das habilidades: `<tipo>_<phys|spec|aoe>.png` + `heal`, `buff`, `debuff` (57). |
| `tools/` | Scripts de arte: `recortar.py`, `lote_*.py`, `personagens.py`, `icones.py`, `pack_art.py`, **`unpack_art.py`**, `prompts_monstros.js`, `dex.json`, `gerar_dex.py`. |
| `docs/` | Prompts já usados no Gemini (`Monstros_*.md`, `Chefes_e_Montarias.md`, `Personagens_cartoon.md`, `Mapa_*.md`, `Icones_habilidades.md`) e a especificação antiga (`Especificacao_..._v0_19.md`, de 06/10 — este arquivo aqui é mais atual). |

As pastas `mon/`, `boss/` e `mnt/` (PNGs-fonte) **não vêm no pacote** para caber no upload. Recrie-as com `python3 tools/unpack_art.py` antes de adicionar arte nova.

## 5. Pipeline de arte

1. Escrever o prompt (modelos em `docs/`): estilo "chibi 3D cartoon, glossy toy-like, thick soft dark outline", N figuras numa linha com espaço largo, **fundo magenta #FF00FF uniforme, sem sombra, sem texto**. Pedir para anexar uma imagem já aprovada como referência de estilo.
2. Ela gera no Gemini e manda.
3. Recortar com `tools/recortar.py` → `cut_box(src, boxes, prefix, H, key='mag'|'bgc'|'dom'|'dist', scale, fill, names)`. As caixas são medidas numa imagem de 2000 px de largura (multiplica por `scale = largura/2000`). `key='mag'` guarda pedaços maiores que 2% da peça principal e a até 25 px dela; `'bgc'` para fundos rosa-escuros. Exemplos prontos nos `lote_*.py`.
4. Criaturas/chefes/montarias: salvar em `mon/<nº>.png`, `boss/<chave>.png`, `mnt/<chave>.png` e rodar `python3 tools/pack_art.py` (refaz os packs e corrige a contagem no loader do HTML).
5. Quase-duplicatas de uma mesma família receberam variação de matiz para não ficarem iguais.

## 6. Conteúdo atual

- **515 criaturas jogáveis** (267 espécies-base + formas/evoluções), todas com arte; o Livro tem 887 entradas (Mega/lendários bloqueados aparecem só como silhueta).
- **Regiões (Aventura):** Praia das Conchas, Bosque Sussurrante, Caverna Ecoante, Vulcão Rugidor, Pico Gelado, Usina Trovejante, Pântano Sombrio, Templo Celeste — 5 instâncias Comuns + 5 Elite cada — e a **Dungeon** (5 andares, libera após Caverna 5).
- **Chefes da instância 5:** Carangão (Praia), Troncão Ancião (Bosque), Golemar (Caverna), Magmorr, Yetirão, Turbinox, Lodaçal, Guardião do Templo; Rei da Masmorra (Dungeon 5). Cada Elite tem um chefe próprio (53 chefes no total).
- **Montarias:** Cabrito Montês (1ª vitória Praia 5), Lagarto Corredor, Grifo Real, Lobo Sombrio.
- **3 iniciais (todo jogador começa com as três):** Muroel (`dex20151`, Venenoso), Timelim (`dex20221`, Inseto), Pelião (`dex20651`, Normal/Fada). Na tela inicial escolhe-se o treinador (menino/menina) e quem lidera a equipe. Saves antigos recebem as que faltarem ao abrir o jogo.

## 7. Sistemas e números principais

- **Combate 3×3** por ordem de velocidade (lista "Ordem" à direita), manual ou Auto. Motor determinístico (farm offline e BOT previsíveis).
  - **Auto libera no nível 5 do treinador; velocidade ×3 no nível 30** (ciclo 1→2→3).
  - **Crítico:** ×1,5; chance 5–25% pela velocidade (`critChance`), sorteio determinístico (`isCrit`).
  - Habilidade suprema: a de maior recarga; barrinha de carga embaixo da vida; pré-lançamento com tela escurecida e cartão com o nome (`drawCastCard`).
  - Números de dano estilizados (crítico, super eficaz, pouco eficaz, cura), clarões, tremor de tela, combo "N Finalizar!". Criatura derrotada some (fade).
- **VIT:** máx. 100, +1 a cada 3 min; Comum custa 6, Elite 12. Elite: 3 tentativas/dia, até 3 entradas extras compradas com diamantes.
- **Estrelas** por instância (até 4★), baús de estrela e baú de região (20★). Captura 20% de chance; equipamentos e acessórios (Dungeon).
- **Farm offline** até 8 h; varredura (BOT) após vencer uma vez.
- **Cápsulas:** Comum — **1 grátis por hora; depois 1.000 de ouro por giro (×10 = 10.000)**. Raro — **1 grátis por dia**; 100 💎 (×10 = 900 💎).
- **Arena:** 5 lutas/dia, 5 min entre lutas, prêmio diário por posição, "Adorar" no Top 3 (+10 VIT, 1×/dia), loja da Arena.
- **Perfil** (clicar no avatar): Perfil (nível, título, guilda "em breve", nome), Traje (M/F + 2 bloqueados), Títulos (14).
- **Painel Dev** (botão ao lado de Aventura na Cidade; também teclas `<` e `'`): +100k ouro, +5k 💎, +99 itens, +10 níveis, +200 VIT, +50k XP, todas as fases 4★, todas as montarias, +10 criaturas.
- **Save:** versão 9 (`SAVE_VERSION`), migração v8→v9 já existe (`migrate`). Campo opcional `save.story` para a história.

## 8. Telas já refeitas a partir dos mockups dela

Cidade (câmera afastada, personagens menores, botões só na Cidade), mapa da Aventura (diorama com marcos e enfeites, barra superior, painel de farm, Comum/Elite), janela da instância (mostra só os 3 últimos inimigos), Monstros, Equipe, Depósito, Bolsa, Montaria (o botão da Cidade mostra a montaria em uso), Loja, Cápsulas, Livro (abas Geral/Atributos), Resultado ("Você desistiu"), Perfil, **Arena (abas Pessoal e Ranking, 07/10)** e o HUD de combate.

## 9. História — "As Páginas Perdidas" (implementada em 07/10)

- Ilha de Lumora. O Livro das Criaturas foi rasgado numa tempestade (luz rosa vinda do Templo Celeste); as páginas se espalharam e os chefes as guardam. O Professor entrega ao herói a capa e as páginas em branco.
- Capítulos: Prólogo (Cidade) → 1 Praia → 2 Bosque → 3 Caverna → 4 Vulcão → 5 Pico → 6 Usina → 7 Pântano (Lua, a "sombra") → 8 Templo (o Guardião rasgou o Livro para proteger as criaturas) → extra Dungeon (o Rei da Masmorra queria controlar o Livro). Rivais: Marina, Tito, Bruno, Brasa, Volt, Lua.
- Onde aparece: prólogo antes da escolha inicial; abertura da região na 1ª vez; fala do chefe antes da instância 5; diálogo de vitória + "Página recuperada (x/9)"; **Livro → 📜 História** para reler. Caixa de diálogo com retrato, texto letra por letra e botão Pular.
- Código: objeto `STORY`, funções `talk`, `playSt`, `storyRegion`, `openStory`.

## 10. ÚLTIMA DECISÃO — visual do combate (em andamento)

A Beatriz achou o combate a única parte "ainda não agradável" e mandou um print do vídeo como referência absoluta: **criaturas pequenas, de frente uma para a outra, bem distribuídas no 3×3, e o treinador de costas olhando a batalha**.

Já feito (Version 70):
- Duas diagonais paralelas: aliados em `POS.A = [[275,250],[395,325],[520,430]]`, inimigos em `POS.E = [[690,160],[815,245],[935,330]]`, chefe em `BOSS_POS = [815,245]`.
- Criaturas menores: `scaleOf` = 0,85 normal / 1,05 subchefe / 1,45 chefe.
- Treinador de costas (`heroKey(3)`, altura 96) em (165,445); montado, aparece de lado em 70%.
- Barras de vida finas embaixo dos pés (verde aliado / vermelho inimigo), nível ao lado, nome do chefe com contorno.

**Pose de costas — FEITA (07/10):** 28 criaturas (famílias das 3 iniciais, Praia B, Bosque C/B, 1º prêmio do sorteio) com arte `back/<nº>.png` → chave `k:<nº>` no pack.
- `drawCreature(..., {back:true})` usa `MONIMG['k:<nº>']` no lado A (sem espelhar); quem não tem continua na pose atual.
- `tools/pack_art.py` empacota `back/`; `unpack_art.py` recria `back/`. Prompts em `docs/Monstros_costas.md`, referências em `docs/ref_costas/`.
- 20931 e 21231 saíram meio de lado (olho visível) — dá para refazer se ela quiser.

**Geração automática no Gemini (funciona a partir desta conversa):** navegador do Claude logado no gemini.google.com e no claude.ai; página de referências (artifact JtLX53C2YX5ANfyYXFQv5d) tem links "Enviar N" que abrem o Gemini com a imagem no `#hash`; JS cola a imagem (ClipboardEvent paste) + prompt e envia; a imagem original vem de `lh3.googleusercontent.com/...=s0` aberta em outra aba e baixada com `<a download>` para Downloads (às vezes fica como `.tmp`), depois `device_stage_files`. NÃO usar o botão "Baixar no tamanho original" do Gemini (versão ampliada com defeitos).

## 10b. Combate "cara de vídeo" (07/10, depois do comparativo com o vídeo da Beatriz)
- Dano: números maiores (40/58 px) com etiqueta Super!/Crítico/Inefetivo; recuo do alvo (`v.kb`), pausa de impacto (`hitStop`), faíscas por tipo.
- Derrota: pisca, vira silhueta (`opt.dark` no `drawCreature`), afunda, solta fumaça; inimigo solta orbe dourado que voa até a barra do topo (`orbs`).
- Ondas sempre com 3 inimigos (Praia 1 e 2 refeitas com nível 1).
- Entrada (`beginIntro/runIntro`): treinador em pose de arremesso (`heroX_4`), cápsula original (pílula azul/branca, `drawCapsule`) voa em arco até cada aliado e abre com clarão; inimigos surgem de nuvem roxa. Faixa "Onda N/M".
- Efeitos por tipo (`TFX`): projétil + rastro + impacto com formas (folha, estilhaço, anel, estrela, raio). Suprema com cinema (escurece + feixe de luz `beams`) só na habilidade suprema e no máx. 1 a cada 6 ações. Buffs/debuffs viraram pílulas ▲/▼ acima da barra.
- Chefe: barra grande no topo (`drawBossBar`), aviso "⚠ CHEFE" com tremor na entrada.
- Arena: abertura VS com cortes de luz e falas (`beginVs/drawVs`), cabeçalho com nomes/poder e cronômetro 5:00 (tempo lógico, `ARENA_SEC`), treinador rival desenhado (`tr_N`).
- Resultado animado (CSS): estrelas uma a uma, prêmios pulando, XP enchendo, baús brilhando, criatura nova em destaque com retrato.
- Ambiente: partículas por região (`AMB`: neve, brasas, folhas, bolhas...) e vinheta.
- Treinador: `char/heroM_4/5`, `heroF_4/5` (costas arremessando / comemorando), gerados no Gemini; comemora na vitória.

## 10c. Mapa e cenários pintados (07/10)
- Mapa da Aventura: cada região é uma maquete pintada no Gemini (`map/<key>.png`, 10 ilhas: cidade, praia, bosque, caverna, vulcao, pico, usina, pantano, templo, dungeon), no mesmo estilo/ângulo/luz. `ISL_KEYS` lista quais existem; sem a imagem, cai no desenho antigo (platô + marco + enfeites). Espuma/sombra na água gerada do contorno (`islFoam`). Ilhas em zigue-zague (`NODES`), largura `ISL_W=310`; o caminho vermelho tracejado só aparece no modo antigo.
- Cenários de batalha (`bg/*.jpg`, 1504×704, inclusive `bg/arena.jpg` — estádio) refeitos no mesmo estilo das ilhas e das criaturas: área central vazia com anel, enfeites só nas bordas. Os antigos ficaram fora do projeto.
- Todos gerados numa única conversa do Gemini (prompts no estilo "Now the NEXT island ... EXACTLY the same art style..." e "BATTLE ARENA background ... full-bleed, NO magenta, wide 21:10, central 70% empty").

## 11. Pendências e ideias em aberto

- Pose de costas para mais criaturas (hoje 28).
- Supabase: contas, save na nuvem, Arena real entre jogadores, Partida online.
- Guilda (hoje "em breve").
- Passivas (esperando material dela).
- Arte própria para Mega/lendários bloqueados.
- Pequenas diferenças restantes do vídeo: layout de estrelas/baús no resultado, cartão de dica da habilidade.
- "Adorar" no Ranking só funciona no Top 3 (no mockup aparecia para todos; perguntar se quer mudar a regra).

## 12. Testes e conferência visual

```
node test_engine.js                     # motor, economia, migração, campanha simulada com as 3 iniciais
NODE_PATH=$(npm root -g) node tela.js   # screenshots com Playwright (Chromium já instalado)
```
Modelo de screenshot (pular diálogos e entrar numa fase):
```js
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:520}});
await p.goto('file:///CAMINHO/combate.html');await p.waitForTimeout(1500);
await p.click('#talkSkip');await p.click('#starterCards .card');await p.click('#talkSkip');
await p.evaluate(()=>enter('praia-1'));await p.waitForTimeout(1200);await p.screenshot({path:'combate.png'});await b.close()})()
```

## 10d. Versão 6 (07/10) — comparação com os vídeos de referência
- **Combate:** botões de habilidade hexagonais; 3º espaço trancado ("Intim. N"); segurar o dedo mostra a descrição (`longPress`/`#skTip`). Barra verde de **energia** (`energy`, `ENERGY_MAX=10`): enche ao bater (+1, +1 no crítico, +2 por derrota) e ao apanhar (+1). O cinema do Supremo do aliado só acontece com a barra cheia, que é consumida; do inimigo, só para chefe/subchefe. O motor não mudou. A Ordem mostra o rótulo só no atual (retratos em cache com `portraitC`), o "Nv" do inimigo está maior e a dica fica numa caixa.
- **Carregamento:** `showLoading` mostra o fundo da fase desfocado, a arte do chefe, 3 habilidades, uma dica (`TIPS`) e a barra com %. Dura 1,5 s e pode ser pulado com um toque; a flag `loading` pausa o loop.
- **Resultado:** `popSeq` encadeia pop-ups: Captura (cápsula treme, explode e revela), "1ª Vez – Prêmios" e "Escolha um baú" (bônus só da interface, `BONUS_TABLE`). O "LV" passou a "Treinador Nv".
- **Som:** WebAudio sintetizado, sem arquivos (`sfx(k)`, `music('city'|'battle'|'boss')`). Botão 🔊 na batalha e na cidade, que alterna entre som+música, só efeitos e mudo (`localStorage idle2d.snd`).
- **Laboratório de Cápsulas:** fundo `bg/caplab.jpg`, professor (`char/npc_1.png`) com balão, cápsulas `ui/cap_0/1/2.png`, painel "Prêmio Destaque" (`capDecor`) e revelação com suspense (`capReveal`). A cápsula cai e treme 3x; a cor sobe de azul para roxo e depois dourado, conforme o melhor prêmio, e no ouro a cápsula vira a dourada. Depois explode e as cartas viram.
- **Arena:** fundo `bg/arenalobby.jpg` com pódio ouro/prata/bronze (`LOB_PED`, `lobAt`). Ranking com o top 3 nos pedestais, Desafiar com os 3 alvos nos pedestais, Pessoal no pedestal de prata.
- **Monstros:** radar hexagonal de atributos (`radarSvg`) e faixa de habilidades. A evolução é cinematográfica (`evoCinema`): coluna de luz, silhueta alternando antiga/nova, flash e "Sucesso!" com a diferença de atributos e de Poder.
- **Montaria:** "Treinar · 1 Feno" com Crít ×2 (17%) e ×10 (3%), textos flutuantes e Auto Treino (`trainMount`, que fica fora do motor), além da comparação Nv atual → próximo.
- **Telas novas:**
  - Conquistas (`ACH`, 5 categorias, Coletar/Ir, `save.ach`).
  - Loja de Fragmentos: troca Fragmentos de Grau S por monstros (S 60, A 30, B 15), com radar e confirmação.
  - Login Diário de 7 dias (`save.login`, abre sozinho na cidade).
  - Evento do Dia: tarefas diárias com `save.daily` e contadores `bump('wins'|'caps'|'arena'|'bot')`.
  - Na cidade: botões novos (ícones `ui/m_9..12.png`), selos vermelhos e chat do "Mundo" com balões nos NPCs.
- **Pipeline do Gemini (atualizado):**
  - Referências da v6 estão no artifact FDbKrcVbbnP3wnrtrnByat.
  - Clicar por coordenada dentro do artifact falha, porque o frame fica escalado. Em vez disso: `document.querySelector('iframe').focus()`, depois teclas `Tab`×N + `Return` abrem o "Enviar N".
  - No Gemini: limpar o rascunho (`selectAll` + `delete`) antes de colar, porque o Gemini guarda rascunho. Depois colar, `insertText`, pôr o cursor no fim e enviar com a tecla `Return` (o clique por JS no botão não envia).
  - Imagem recém-gerada (blob): baixar desenhando num canvas, `toBlob` e `<a download>`. Imagem `gg`/`gg-dl`: abrir `=s0` na própria aba e usar `fetch`.
- **Próximo passo combinado:** costas dos monstros restantes.

## 10e. Versão 6.1 (07/10)
- **Som removido** a pedido: `sfx`/`music` viraram funções vazias, sem botões de som.
- **Cidade:**
  - "Arena" virou **Provação** (`openProv`, tela `#prov`). Dentro: Arena (aberta) e cartões "Em breve" (Torre dos Desafios, Chefe Mundial, Expedição) para as próximas instâncias.
  - Botão **"+" Mais** ao lado de Equipe abre `#cMore`, que agora tem Livro, Conquistas, Fragmentos e Montaria (saíram da coluna esquerda).
- **Tela de Monstros refeita no layout do vídeo:**
  - Fundo espacial com grade hexagonal, horizonte do planeta e pedestal ciano com aletas verdes. É procedural (`monBg`), desenhado uma vez e guardado; `spaceURL()` é a versão sem pedestal, usada no Depósito e na Equipe.
  - Lista lateral sem barra de rolagem: roda do mouse, arrasto e toque.
  - Botões "+" (Equipe) e cadeado (Depósito) ao lado da lista.
  - Cabeçalho com tipo, Nv, nome e Poder.
  - Três botões redondos sob o pedestal: Evoluir, Pool de XP (janela com orbe, `openXpPool`) e Harmonia.
  - Painel teal com cantos chanfrados e título em fita; abas laterais Atributos/Intimidade/Habilidade/Equip/Treinar/Evoluir, com a ativa dourada.
  - Atributos: 2 colunas, "Valor Pessoal" (Poder atual/limite) e radar grande atual × limite (forma final no Nv 60), mais a Habilidade Suprema.
  - Intimidade: barra com coração, Elevação Rápida e presentes (Fruta, Pergaminho).
  - Habilidade: sub-abas e linhas com + / Máx / custo.
  - Equip: Item Carregado / Acessórios, com grade de itens.
  - Treinar: Fusão, com grade e "Em Time" riscado.
  - Evoluir: "Visualizar" com radar atual × próxima forma, Habilidade de Comando e requisitos. Embaixo do pedestal, "Toque no avatar para visualizar" troca a forma mostrada (`monView`).
- **Equipe em tela cheia:** 3 pedestais (toque para tirar), Poder da equipe e lista horizontal sem barra (`hScroll`: roda e arrasto).
- **Depósito:** mesmo fundo e pedestais ciano (`miniPed`).
- **Fundo pintado da tela de Monstros:** `bg/monstros.jpg`, gerado no Gemini (chat 38d4abad44db6a2e). É desenhado em escala 0,88 com deslocamento y −62; o pedestal fica em `MON_C = [391,383]`. Sem a imagem, o jogo usa o fundo procedural. Depósito e Equipe continuam com o fundo espacial procedural (`spaceURL`).

## 10f. Ranking (v6.3)
- Botão **Ranking** na cidade (topo direito, ícone de medalha) abre a tela `#rank` (`openRank`/`renderRank`).
- Fundo do salão da Arena com o top 3 no pódio; à direita, painel com abas e a linha "Sua posição".
- Abas:
  - **Poder:** soma do Poder dos 3 monstros da equipe atual (`teamPower`).
  - **Arena:** posição no ladder.
  - **Nível:** do treinador.
  - **Longevidade de Instância:** instância Comum mais avançada vencida (`myInst`).
- Os demais jogadores são os 99 treinadores NPC da Arena (`rankNpcs`, calculados uma vez por sessão). Quando houver servidor, troca-se essa fonte de dados.
- **v6.4:** a pedido, a Arena voltou ao fundo simples (gradiente azul, trilhas e redemoinho, pedestais desenhados). O salão pintado `bg/arenalobby.jpg` foi desativado, mas o arquivo continua no projeto. O Ranking usa o mesmo fundo simples (`arenaBg('ranking', g)`) com 3 pedestais.
- **v6.5:** pódios por posição: `pedestal(g,x,y,w,tier)` com `tier` gold (1º), silver (2º), bronze (3º). Usados no Ranking da cidade e na aba Ranking da Arena (top 3).

### v6.6 — Poses de costas (em andamento)
- Lotes 1–29 de 82 prontos (174 criaturas em back/<id>.png, H=200) e empacotados (`tools/pack_art.py`); publicado Version 12.
- Pipeline e estado: scratchpad/back_state.md (páginas de links p1–p5, prompt, grab, match.py, proc.py). Lote 30 já baixado (150389 bytes, falta stage); 31–33 enviados ao Gemini (conversas no histórico).
- Dicas: `tabs_select` antes de teclas (teclas vão para a aba da frente); batch do navegador tem ~50s; se a aba voltar a /app, abrir a conversa pelo histórico e baixar.

### v6.7 — Poses de costas COMPLETAS (Version 13)
- Todos os 82 lotes prontos: 487 criaturas com pose de costas em back/<id>.png (H=200), empacotadas em art/pack_0..9.js (10 pacotes, o jogo carrega 10).
- Alguns lotes (30,37,41,45,47,53,65,66,70,71,78,80) vieram da prévia do Gemini (1024px, levemente mais suaves) porque a imagem cheia não ficou disponível; podem ser refeitos depois se quiser mais nitidez.
- cutlot.py agora junta pedaços pelo menor espaço e, se faltar criatura (sobreposição), divide a faixa mais larga na coluna mais vazia.
- Downloads no PC agora saem como xN.png (antes .tmp); match.py acha pelo tamanho.

## v6.8 — travamentos, performance, Dev e Livro
- Loop `frame()` protegido: rAF no início + try/catch (`frameBody`); erro numa animação não congela mais a batalha. Watchdog: se `B.over` sem recompensa por 2,5 s → `showResult()`.
- `giveUp()` funciona mesmo com `B.over` (reabre o resultado). `showResult()` virou wrapper com fallback; baú (`chestStep`) com try/catch.
- Flash branco / silhueta escura sem `ctx.filter` por frame: tintas pré-calculadas em cache (`tintOf`, WeakMap TINT).
- Perf (CPU 4x mais lenta, ults forçadas): média 19 ms/frame, p95 34 ms, 0 erros. Teste de todas as fases em auto: todas concluem.
- Botão Dev oculto (só atalho `'` ou `<`); Dev ganhou "⚠ Resetar o jogo" (2 toques; `persistOff` impede regravar).
- Livro: criatura indisponível (`dexOff`) = quadro preto com "?" e "???".

## v6.9 — economia nova, Exploração e Tabela de Tipos (vídeos de 07/10 21h)
- **Fragmentos por criatura** (`save.frags`, `giveFrag`, `fragNeed`: C 10, B 20, A 30, S/lendário 50). `fragS` virou **Fragmento Universal** (`fragU`), que completa qualquer invocação e só vem de evento (Evento do Dia, Login dia 6). Cápsulas dão fragmentos de criatura sorteada (`p.item==='frag'`, `legend:true` sorteia lendário). Loja da Arena vende fragmentos dos 3 lendários em destaque. Tela **Fragmentos** refeita no layout do vídeo (cartões 3×2, n/necessário, Invocar, filtro de tipo, páginas).
- **Drops:** Comum = Poção de XP + Fruta (sem feno, sem equipamento). Elite 1–4 = Poção de XP; **Elite 5** = Carta de Evolução da região (`ELITE_CARD`: Praia–Caverna comum, Vulcão–Usina rara, Pântano–Templo épica) + 12% de equipamento. Fusão por carta saiu da Elite.
- **Faixas de liberação** (`LIB_KIND`, `libNeed`, `libBreak`): Pergaminho de Intimidade, Núcleo de Fusão e Tomo de Habilidade I–IV. **Dungeon andar N dropa a faixa N** (andar 5: 2× faixa IV). Intimidade 10→20→30→40→50; fusão e habilidades começam no limite 2 e sobem de 2 em 2 até 10 (`fusCap`, `skCap`). Custo 1,1,2,2.
- **Cartas de Evolução** (`evoC/R/E/L`) substituem o Cristal: grau C/B comum, A rara, S épica, acima lendária; quantidade = nº da transformação (`evoCardOf`).
- **Provação Exploração** (`#expl`, `openExpl`, `EXPL_*`): Terra do Descanso (cartas de evolução) e Dimensão do Vazio (cartas de XP de fusão), ranks C→SSS (Nv 8–45, VIT 10–40), libera ao vencer Praia 5 e cada rank pelo anterior; BOT/BOT×10 após vencer.
- **Tipos:** imunidade real (0 de dano, etiqueta "Imune"); Auto evita alvos imunes. Botão **Elemento** na Equipe abre a Tabela de Supressão Elemental (ATQ/DEF por tipo).
- Save v10 (`migrate`): fragS→fragU, cristalT→evoC, pergaminho→libInt1, limites de fusão/habilidade calculados pelo que já tinha.
- Ícones novos em `ui/i_evo*.png`, `i_fusXp`, `i_fragU`, `i_lib{Int,Fus,Sk}{1-4}.png` (tingidos dos originais) — publicar junto.

## v7.0 — Balanceamento (08/10)
Decisões da Beatriz: história Comum em **2–3 semanas** para quem joga ~2 h/dia; vários times por **resistência de tipo por região**; muralha = **farm + time certo**; **VIT mais apertada**; farm offline **só EXP/ouro**; **teto de nível = nível do treinador**; criatura inteira rara (lendário 1%, forte 5%…); maximizar um monstro leva **2–3 meses**.
- **VIT:** máx. 120, +1 a cada 5 min (≈290/dia). Comum 8, Elite/Dungeon 15, Exploração 12–35.
- **Treinador:** 1 EXP por VIT gasta (Comum, Elite, BOT…); farm offline não dá. Curva `expTrainer = 6,5·Nv + 0,23·Nv²`, teto 80 (≈Nv 11 no 1º dia, 33 no 14º, 45 no 30º, 60 no 62º). **Monstro não passa do nível do treinador** (`gainCreature`, `levelUp`).
- **Dificuldade por fase:** `STAGES[id].dm` multiplica PS/ataques/defesas dos inimigos (`foeUnit`); valores em `BAL` (dm Comum, edm Elite, expl/explV por sala, dungeon). `applyBalance()` roda no fim do motor. Poder recomendado já usa o dm.
- **Resistência por região** (`REGION_RESIST`, dano ×0,6): Praia Fogo/Terra · Bosque Água/Terra/Planta · Caverna Fogo/Normal/Voador · Vulcão Fogo/Planta/Gelo · Pico Gelo/Água/Normal · Usina Elétrico/Voador/Metálico · Pântano Venenoso/Psíquico/Normal · Templo Batalha/Psíquico/Fada. Aparece no painel da instância ("Resistem a"). `recTypes` foi para o motor e ignora tipos resistidos.
- **Criaturas:** captura por grau (C 25%, B 12%, A 5%, S 1%); sem captura, a vitória Comum dá fragmentos do monstro (C 2, B/A 1) — BOT também. Cápsula Comum: criatura 1%; Rara: grau A 5%, lendário 1%; fragmentos da Cápsula saem de criaturas já vistas.
- **Fim de jogo:** fusão `fusNeed = 30+50·f` (+10 = 2.550 XP); liberação I–IV custa 2/4/6/10; habilidade `300·Nv²` ouro; Dimensão do Vazio dá 1–6 cartas.
- **Ferramentas:** `tools/balance/sim_balance.js` (simula jogador dedicado: `node sim_balance.js dias seed '{json BAL}'`), `calib2.js` (maior dm vencível no dia-alvo), `targets.js` (dias-alvo), `show.js` (compara com alvos). Resultado com os valores finais (3 inícios): ver tabela na resposta de 08/10.

## v7.1 — Arena, eventos e dica (08/10)
- **Arena acompanha o jogador:** `npcOf` usa `ARENA_REF` (= nível do treinador, atualizado em `arenaState`): #99 ≈ 55% do nível, #1 ≈ 120% + 4, com fusão no topo. Prêmio diário agora também dá **fragmentos de um lendário em destaque** (1º 10, top 3 8, top 10 6, top 20 4, top 50 3, resto 2).
- **Desafio Semanal** (Provação, `weeklySetup`, `openWeekly`): tipo da semana (`WEEK_TYPES`, gira toda segunda); só entram monstros desse tipo (`weeklyTeamWhy`); inimigos fracos contra ele, Nv do treinador +2, dm 1,5; 3 entradas/dia, VIT 15, sem BOT; estrelas dão 2/3/2/3 Fragmentos Universais (máx. 10 por semana, `weeklyClaim`). Abre após Bosque 5.
- **Fim de semana** (`weekendRegion`): sáb/dom, uma região por semana com VIT pela metade e fragmentos em dobro nas Comuns. Selo no topo do mapa.
- **Marcos (uma vez):** Exploração — 1º rank novo dá 1/2/3/4/5/6 Universais (`EXPL_MILE`); Elite de uma região completa dá 5 (`ELITE_MILE`). Login (dia 6) e tarefas diárias continuam dando Universais.
- **Dica de derrotas** (`save.losses`, `stuckHint`): após 3 derrotas seguidas na mesma fase, o resultado mostra poder do time × recomendado, tipos que funcionam, quem a região resiste e quem fortalecer (ou onde achar fragmentos). Não facilita a fase.

## v7.2 — Economia, equipamento e primeira hora (08/10)
- **Ouro apertado:** ganho por vitória Comum `40+10·t` e Elite `70+16·t` (−30 a −40%); habilidade `500·Nv²` (Nv 10 = 142,5 mil por habilidade); evolução `4000·k²` de ouro; fusão 8.000 por monstro e 2.000 por carta; amplificar `2000·(N+1)^1,5`; ouro na Loja de Diamantes 10 mil por 80 💎. Na simulação o ouro fica em torno de 20–50 mil (sempre gasto). Maximizar um monstro ≈ 1,1 milhão de ouro (~2 meses).
- **Equipamento:** até +10; do +5 em diante pode falhar (80/65/50/40/30%), gasta o ouro e não perde nível (`AMP_CHANCE`).
- **Montaria:** +0,35% por nível (Nv 50 ≈ +17%) e +2% por peça (`MOUNT_GROWTH`, `MOUNT_GEAR_BONUS`). Junto com equipamento e acessórios ≈ 25–35% do poder no fim de jogo.
- **Diamantes:** Cápsula Rara, VIT, entradas extras (Elite, Dungeon e agora Desafio Semanal), montarias. **Pacotes com dinheiro real** (`DIA_PACKS`, R$ 4,90 a 199,90, 1ª compra ×2) aparecem na Loja de Diamantes só como vitrine: precisam de contas na nuvem e de um meio de pagamento (ex.: Stripe/Mercado Pago via Supabase) — e os diamantes comprados não podem ficar só no navegador.
- **Primeira hora:** Praia (dm 0,7–0,9) e Bosque (1,0–1,25) fáceis; dificuldade começa na Caverna. **Guia do 1º dia** (`GUIDE`, `save.guide`, aparece no topo das Missões da cidade): Praia 1 → abrir Cápsula → monstro Nv 5 → Praia 5 (dá 1 monstro grau B extra) → Bosque 5 (2 Cartas de Evolução Comuns).

## v7.3 — Revisão geral (08/10)
- Roteiro automático `review.js` (no scratchpad; copiar para `tools/` se quiser): percorre todas as telas da cidade num save novo e num avançado, abas da Loja/Arena/Monstros, Pool de XP, liberar faixa, evoluir, amplificar, Cápsula ×10, invocar fragmentos, Elemento, Desafio, Exploração e lutas de Elite, Dungeon, Exploração, Templo 5, Desafio Semanal e Arena até o resultado e a volta; migração de save v8. Resultado: 0 erros depois das correções.
- **Corrigido:** luta da Arena travava no carregamento (`showLoading` lia a última onda de `STAGES.arena`, que é vazia) — bug antigo.
- Loja Comum: o lugar fixo deixou de vender a criatura inteira (20 mil de ouro) e passou a vender 5 fragmentos dela (9 mil).
- Textos atualizados (VIT 8/15, dicas da tela de carregamento, Elite). Montaria: percentual sem casas decimais estranhas. Desafio Semanal: botão "+1 entrada" com diamantes quando acabam as entradas.
- Desempenho igual (CPU 4× mais lenta: média 19 ms por quadro, p95 34 ms).

## v7.4 — Torre dos Desafios, Guilda simulada e Modo Pesadelo (08/10)
Decisões: Torre **por tipo** (regras de time), **Guilda simulada agora**, nuvem **depois de mais conteúdo**, conteúdo novo = **Modo Pesadelo** da história.
- **Torre dos Desafios** (Provação, `towerSetup`, `towerRule`, `openTower`): 100 andares; regras giram: só um tipo (18 tipos), só grau C/B, no máximo 2 monstros; a cada 10 é andar de chefe com time livre. Sem VIT, 5 tentativas por dia (`TOWER_DAILY`), um andar por vez (`save.tower.floor`). Prêmios: a cada 5 andares 30 💎 + 1 Universal; a cada 10, 60 💎 + 3 Universais + Carta de Evolução (Rara até 40, Épica até 80, Lendária depois). Abre após Caverna 5.
- **Guilda simulada** (botão Guilda no "Mais" da cidade, `openGuild`): "Guardiões de Lumora", 11 membros NPC com dano semanal; doação diária (presença 20 moedas, 20 mil de ouro 60, 50 💎 150); **Chefe da Guilda** 2×/dia sem VIT — a luta é por dano (cada 400 = 1 Moeda da Guilda), vale mesmo perdendo; **Loja da Guilda** (aba da Loja): itens de liberação, cartas, feno, até 3 de cada por semana, melhores com o nível da guilda (1–10). Item novo `moedaG` (ícone `ui/i_moedaG.png`). Quando houver servidor, troca-se os NPCs por jogadores.
- **Modo Pesadelo** (3º botão no mapa, ids `região-pN`, `NM_ORDER`): as 8 regiões de novo depois da Elite (Pesadelo N exige Elite N e Pesadelo N−1); inimigos da Elite +4 níveis; poder recomendado de ~6 mil (Praia 1) a ~14 mil (Templo 5) (`NM_REC`); 3 tentativas/dia, 20 VIT; prêmios: Cartas de XP de Fusão e itens de liberação da faixa da região; a 5ª de cada região dá Carta Épica (Praia–Vulcão) ou Lendária (Pico–Templo); baú de região com 3 Universais.
- Revisão automática (`tools/balance/review.js`) atualizada com Torre, Guilda e Pesadelo: 0 erros.

## v7.5 — Formas Mega (lote de teste) e BOSS Global (08/10)
- **Arte Mega** gerada no Gemini (lote de teste com 7, visual extravagante — ver `docs/Monstros_mega.md`): Mega Arnieon, Mega Flabraeon Dragão, Mega Madeleon, Mega Fanmamaeon, Mega Semsemeon, Mega Lutrovoleon, Mega Vécriinante. Recortadas para `mon/<nº>.png` e empacotadas à parte em `art/pack_mega.js` (carregado depois dos 10 packs). Ainda sem pose de costas.
- **Mega = evolução permanente** depois da forma final (`MEGA_READY`, `MEGA_OF`, forma extra com `mega:true`, atributos ×1,3 sobre a forma final). Requisitos: Nv 50, intimidade 40, 300 mil de ouro e **1 Pedra Mega** (da espécie, `save.stones[sp]`, ou a Universal `pedraMU`). As Megas do lote saíram do cadeado no Livro. Rivais da Arena não usam Mega.
- **BOSS Global** (Provação, `openBGlobal`, `bgSetup`): abre todo dia às **20h** até meia-noite; o chefe é a **forma Mega do dia** (calendário rotativo de 7 dias = as 7 Megas do lote, `bgBossOf`); 3 lutas/dia sem VIT; chefe de dano (vida ×60, ataque ×1,8, `hpx`); ranking contra 29 treinadores simulados (`bgNpcs`, determinístico por dia, força acompanha o seu nível). Prêmio no dia seguinte (`bgClaim`): 1º–3º = 3 Pedras Mega daquele monstro, 4º–10º = 2, demais = 1.
- **Loja da Guilda Nv 8:** Pedra Mega Universal, 3.000 moedas, 1 por mês.
- **Fundos novos** (Gemini): `bg/bglobal.jpg` (arena noturna com a silhueta do chefe Mega) e `bg/weekly.jpg` (praça com 7 pilares elementais e o calendário de pedra) — usados no card da Provação e na batalha do BOSS Global e do Desafio Semanal (o Desafio não reaproveita mais o fundo do Pântano).
- Próximo: gerar as Megas restantes em lotes (40 de monstros jogáveis + 12 de famílias SS + 5 avulsas) e as poses de costas delas; cada nova entra em `MEGA_READY` e no calendário do BOSS Global.

## v7.6 — Megas: conta nova, Megas duplas e lote 4 (08/10, tarde)
- Artifact republicado na conta nova (link na §3). A Beatriz **aprovou o estilo das Megas**: gerar o resto.
- **Código:** Mega agora funciona em criatura de um estágio só (grau S, sem formas) e em **famílias com 2 Megas** (Flabraeon Dragão/Voador, Mianeon Fada/Batalha): na aba Evoluir aparecem dois botões para escolher; depois de virar uma Mega não dá para trocar (`megaIdx`, `normalForms`, `canTransform(save,sp,k)`, `transform(save,sp,k)`, `megaPick`). O BOSS Global usa todas as Megas (`MEGA_LIST`), então o calendário tem tantos dias quantas Megas prontas. Testes atualizados.
- **Novas Megas prontas (13 no total):** + Mega Mianeon Fada (21144), Mega Mianeon Batalha (21146), Mega Tokaante (21153), Mega Pifaante (21163), Mega Sosoante (21173), Mega Govoreon (21184).
- **Faltam 32 jogáveis** em 5 lotes (refs e prompts prontos no artifact "Referências Megas" LbiXTSWCnHowJF4mhRRy4C; ids por lote abaixo). Lote 1: 20194,20203,20363,20374,20383,20454,20465 · Lote 2: 20484,20485,20502,20662,20703,20744,20754 · Lote 3: 20872,20883,21102,21112,21122,21134 · Lote 5: 21193,21204,21214,21223,21234,21242 · Lote 6: 21253,21263,21273,21293,21302,21854. (Referência: forma final de cada um; Mianeon Batalha 21145 não tem arte, usa 21143.)
- **Pipeline novo (navegador do Claude no PC dela):** a página de referências manda (postMessage) a imagem e o prompt para a aba claude.ai; o script leva para `gemini.google.com/app#idle2dref<N>=<base64>~~P~~<prompt>`; no Gemini o JS cola a imagem (ClipboardEvent paste) e o texto; enviar com a tecla Return (aba na frente) ou clique no botão por ref. **Uma geração por vez** (várias abas ao mesmo tempo dão erro 1155). Pedir **grade de 2 linhas** com espaço entre as criaturas (em linha única elas se sobrepõem). Baixar: abrir a URL `lh3.googleusercontent.com/gg/...=s0` numa aba, `fetch` + `<a download>` (sai como .tmp em Downloads), `device_stage_files`, recortar com `tools/cutgrid.py img ids 300`, empacotar com `tools/pack_mega.py ids`, pôr os ids em `MEGA_READY`.
- **Bloqueio:** depois de 2 imagens a conta Gemini passou a responder erro 1099 até para texto (provável limite/bloqueio temporário). Tentar de novo mais tarde.

## v8.0 — HUD novo (referências de 08/10), montaria que evolui, trajes e títulos com atributos (08/10)
Pedido da Beatriz: HUD mais bonito em todo o jogo seguindo 16 prints de referência, montaria no HUD principal, ícones sem os círculos, títulos dando atributos (mais difíceis = mais; extra para topo de ranking), montaria que evolui em vez de ser comprada, trajes de montaria à venda dando atributos.
- **Visual (camada "Tema v8" no fim do `<style>`):** azul-tecnológico com hexágonos (`--tk-hex`), cantos cortados (`--tk-cut`), borda ciano, botão principal dourado (`.big`), secundário ciano (`.big.alt`), fechar = placa ciano, recursos em paralelogramo (`.pill`, com "+"), títulos de tela em faixa trapezoidal, abas laterais em placas (ativa dourada), janelas (`.box`, `#rpop .pp`) e painel da instância azuis. Todas as bordas douradas antigas (#c99a5a/#8a7050) viraram ciano.
- **Ícones sem círculo:** `tools/strip_ring.py` gera `ui/n_0..12.png` a partir de `ui/m_*.png` (tira disco e aro). Cápsulas usa `ui/cap_1.png`.
- **Cidade:** avatar redondo com nível; nome + selo do título; recursos; linha de ícones (Ranking, Evento, Login, Conquistas); **retrato da montaria** embaixo do avatar (com "!" quando dá para treinar); esquerda Cápsulas/Bolsa/Loja; direita Provação/Aventura; Missão com faixa azul; **barra de atalhos** embaixo à direita (Monstros, Equipe, Montaria, Livro, Fragmentos, Guilda) sem fundo (só ícones), com botão redondo "+" que recolhe/abre (lembra em `localStorage idle2d.dock`). O antigo menu "Mais" saiu.
- **Montaria v2 (motor):** cadeia `MOUNT_CHAIN` Cabrito → Lagarto → Grifo → Lobo; não se compra; Nv máx. 50 por estágio e no 50 **evolui sozinha** (`mountGain`); bônus `0,02 + 0,0009·(nível total−1) + 0,015·estágio` (nunca cai ao evoluir; Lobo Nv 50 ≈ +24%); EXP por nível cresce 25% por estágio. **Treino Avançado**: 10 💎 = 100 EXP (`trainMountDia`).
- **Trajes de montaria** (`MOUNT_SKINS`, 300–2000 💎): única coisa à venda (Loja › Trajes de Montaria ou Montaria › Trajes). Cada traje comprado soma atributos **para sempre** (mesmo sem vestir, como na referência); o vestido recolore a arte (`mountArt`, cache). Provar antes de comprar (1º toque prova, 2º compra).
- **Títulos com atributos** (motor, `TITLES` + `titleBonus`): 26 títulos; todos os conquistados somam % por atributo; os de ranking da Arena (Top 10 / Top 3 / 1º) valem só o melhor e só enquanto estiver na posição. Selos coloridos por dificuldade (`titleTier`: verde, azul, roxo, dourado; ranking vermelho). Bônus entra em batalha por `progOf().xb` (`extraBonus` = títulos + trajes).
- **Telas refeitas:** Montaria (nome + LV, barra de EXP, 4 estágios, Evolução/Trajes à esquerda, "Atributo dos Monstros Aumentado" Nv→Nv+1 à direita, barra de treino embaixo); Perfil (abas Visão Geral/Título/Traje à direita, nome editável no topo, selo grande sobre o treinador; Título = lista Todos/Possuídos + Atributos Totais/Detalhes com "Usar").
- **Save v11** (`migrate`): montarias compradas viram o estágio mais alto; equipamentos de montaria antigos devolvem os diamantes (sela/rédea 150, ferradura/manta 250).
- Corrigido: Desafio Semanal mostrava "Ouro +NaN / ×undefined 1ª vitória" no resultado.
- Testes novos: evolução da montaria, trajes, títulos (incluindo ranking), migração v10→v11.
- v8.1: barra de atalhos sem fundo azul (ícones soltos, antes cortava as imagens); Monstros com painel de cantos cortados, cabeçalho trapezoidal e abas largas à direita (referências da tela de Monstros).

## v8.2 — Personagem novo e fantasias dark (08/10)
- Montaria saiu da barra do "+" (fica só o retrato no HUD principal).
- **Treinador novo** no estilo do NPC "Rafa Lima" (`char/tr_3.png`: proporção ~4 cabeças, contorno grosso, rosto anime). Menino e menina refeitos no Gemini (6 poses cada) e gravados por cima de `char/heroM_0..5` e `heroF_0..5` (os antigos estão só no scratchpad desta sessão).
- **Fantasias do treinador** (`TRAINER_SKINS`, motor): Fantasma Sombrio (G, DEF.E +2% · VEL +2%) e Esqueleto Noturno (S, ATQ +2% · DEF +2%), 800 💎 cada; compradas somam atributos para sempre (`skinBonus`), vestida muda o visual (`save.costume`, `heroKey` usa `hero<G|S>_N`). Perfil › Traje: comprar (2 toques), vestir, voltar ao padrão, escolher Menino/Menina. As fantasias foram desenhadas a partir do menino (a menina vestindo usa a mesma arte).
- Pipeline do Gemini agora aceita **várias imagens por lote**: página "Referências de Arte" (artifact LbiXTSWCnHowJF4mhRRy4C) lê `manifest.json` ({lots:{chave:{imgs,prompt}}}) e manda por postMessage; o script vai para `gemini.google.com/app#idle2dlot=<k>~~I~~<b64>~~I~~<b64>~~P~~<prompt>`, cola todas as imagens e o texto; enviar clicando no botão (screenshot antes). Às vezes o Gemini para ("Você interrompeu"): mandar "Please generate the image now…". `tools/cutgrid.py` aceita nomes (não só números) e pasta de saída.

## Regra fixa (08/10): publicar sempre
A Beatriz pediu: **toda atualização nova vai para o link dos amigos**. Depois de testar (`node test_engine.js`) e republicar o artifact, rodar `sh tools/publicar.sh "o que mudou"` na pasta do projeto (precisa do repo evolvearenaidlemonsters-spec/idle2d-combate anexado à sessão com acesso de escrita). Conferir abrindo https://idle2d.idle2d.workers.dev.

## v8.3 (08/10/2026)
- PC em tela cheia sem moldura (`deskMode = () => false`).
- Funções liberam por nível do treinador (`FEAT_LV`, selo 🔒 Nv X / NOVO!), missões respeitam isso.
- Fontes mínimas: tudo que era ≤13px virou 14px (selos ≤10px viraram 12px).
- Arte sob demanda no site: `tools/split_art.py` gera `art/i/<chave>.webp` + `art/i/keys.js`; `ART_LAZY` (site público ou `?lazy`) usa Proxy em `MONIMG` e baixa cada imagem só quando aparece. Rodar split_art.py sempre que mexer nos packs.
- Supabase (projeto `idle2d`, id miblsgpxqlgsmoksttgy, sa-east-1): tabelas accounts/saves/rankings/reports (RLS sem políticas), acesso só por funções RPC: acc_create, acc_login, save_put(7 args), save_get, rank_list, report_add. Cliente: `CLOUD` (localStorage idle2d.cloud), `cloudPush` automático (até 1×/min e ao sair da aba), tela Opções (⚙ na cidade) com conta, som e Relatar problema. Ranking ganhou aba "Jogadores Reais".
- Som leve sintetizado (`SOUND`, `sfx`), começa desligado (localStorage idle2d.snd).
- Temas novos: Cápsulas (vitrines de vidro), Livro (fundo azul), Resultado (moldura dourada, `.lose` cinza-azulado).
- Ícones de habilidade novos: `SK2` com 'fogo' pronto; faltam os outros 17 tipos + suporte (lotes sk_* no manifest).
- Pendentes de arte: costas das 45 Megas, versões menina dos trajes Fantasma/Esqueleto.

## v8.4 (08/10/2026)
- Monstros: o Livro (dexdata) ficou só com as 113 famílias escolhidas pela dona (296 formas, incl. Megas), via página "Seleção de Monstros" (artifact XjyqXjnZM11YtDpkCbgC3S, doc picks/escolha). Backup pré-corte no scratchpad. SAVE_VERSION 12: monstros cortados somem e devolvem ouro/Poções/Cartas Raras/Frutas (save.cutRefund → popup "Monstros reorganizados"); fragmentos deles viram ouro.
- Combate: retratos da Ordem enquadrados pelo contorno da arte (artBox/faceC); seta do alvo verde/vermelha/branca conforme vantagem (advOf).
- Mega: monstro precisa de Nv 60 (MEGA_REQ.lv); BOSS Global (Megas da Provação) só com treinador Nv 60 (MEGA_TRAINER_LV).
- Trilha da região (openTrail), Evento laranja, Bolsa com detalhe/Usar, jogadores reais na cidade, todos os ícones SK2 prontos.
- Adiado pela dona: costas das Megas e cidade 3D.
