# Formas Mega — prompts do Gemini (08/10)
Referência anexada: a forma final de cada monstro, numa linha, fundo magenta (`docs/ref_mega/refA.jpg`, `refB.jpg`).

Prompt-base (trocar a lista numerada por lote):
> Create the MEGA EVOLUTION of each of the N creatures in the attached image, in the SAME ORDER left to right. Each Mega must clearly be the same species (same face, silhouette and main colors) but transformed into an EXTRAVAGANT, legendary, ultra-powerful version, the most epic form of the line: bigger and more majestic, ornate armor plates, glowing crystal gems, golden and neon trim, flowing energy ribbons, crown-like crests, dramatic extra wings/fins/horns/tails, strong elemental aura around the body.
> 1) … (uma linha por criatura, com o tipo e 3–4 ideias de visual)
> Style: EXACTLY the same art style as the reference: cute chibi 3D cartoon, glossy toy-like, thick soft dark outline, vibrant colors. Each creature full body, front three-quarter view, all the same height, in ONE ROW with wide empty space between them. Plain uniform solid magenta background #FF00FF, no shadow on the ground, no text, no labels, no frames.

Recorte: `python3 tools/cutmega.py imagem.jpg 20164,20464,... 300` → `mon/<nº>.png`; depois gerar `art/pack_mega.js` (ver PASSAGEM v7.5) e pôr o nº em `MEGA_READY`.

Lote de teste: 20164 Mega Arnieon, 20464 Mega Flabraeon Dragão, 20474 Mega Madeleon, 20524 Mega Fanmamaeon, 20924 Mega Semsemeon, 21094 Mega Lutrovoleon, 21284 Mega Vécriinante.
