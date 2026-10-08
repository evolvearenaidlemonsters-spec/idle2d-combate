# Especificação do jogo Idle 2D — v0.19

Data: 06/10/2026
Status: decisões da v0.3 e v0.4 aprovadas pela usuária em 06/10/2026 (ver seção 15). Demais regras continuam PROPOSTAS. Implementação autorizada apenas etapa por etapa, com aprovação de cada entrega.
Objetivo: recriar em 2D, jogável no navegador (celular deitado e PC), a experiência observada nas gravações: campanha de aventura com fases comuns e elite, chefes e subchefes, arenas, evolução das criaturas, cidade e farm offline.

## 1. Como interpretar este documento

- APROVADO: decisão explicitamente confirmada pela usuária.
- OBSERVADO: comportamento ou elemento visível nas gravações; não comprova a fórmula interna.
- PROPOSTO: regra original escolhida para tornar o jogo implementável; pode ser alterada na revisão.
- PENDENTE: detalhe que ainda precisa de decisão ou evidência.

Fontes: gravações enviadas em 06/10/2026, às 15:59:08, 16:28:40, 16:34:27, 16:35:35 e 16:36:37. A análise visual não fornece acesso ao código ou às fórmulas do jogo de referência.

## 2. O que a referência estabelece

| Elemento | Evidência visual | Limite da conclusão |
| --- | --- | --- |
| Campanha | Mapa, instâncias, ondas e estrelas | Requisitos exatos de cada estrela não confirmados |
| Combate | Equipes 3×3, barras de vida, seleção de habilidades/alvos, lista Ordem | Algoritmo exato da ordem não confirmado |
| Automação | Botão Auto e controle ×2 | Política exata da IA não confirmada |
| Habilidades | Ataques individuais/em grupo e efeitos de atributos | Fórmulas, chances e duração não confirmadas |
| Atributos | Vida, velocidade, ataque/defesa físicos e especiais | Relação numérica não confirmada |
| Progressão | Melhoria de habilidades, custos, requisitos e linhas evolutivas | Economia completa não confirmada |
| Cidade | Movimento, companheiro, NPCs e outros jogadores | Protocolo multiplayer não observável |
| Offline | Criado para a adaptação | Não assumir que existe na referência |

APROVADO (v0.4): as gravações são a referência máxima; buscar o máximo de similaridade na experiência. As criaturas, nomes e artes são próprios do projeto (não copiar personagens da referência); as fórmulas internas continuam sendo regras próprias documentadas.

Detalhes observados no combate e reproduzidos na etapa 1: coluna Ordem à direita com quem age embaixo (moldura laranja, rótulos Eu/Inimigo); pausa, ajuda, ×1/×2 e Auto no canto superior esquerdo; "Ondas: n/3" no topo; três botões hexagonais de habilidade com o tipo embaixo; anel azul sob quem age; seta laranja sobre o alvo; itens do treinador bloqueados (Insígnia, Cerca, Baga, Campo); linha de registro embaixo; chefe grande na onda 3; números de dano flutuando; barras verdes para aliados e vermelhas para inimigos.

## 3. Projeto e tecnologia — APROVADO

- Projeto novo e independente. Não integra o Idle Pokémon existente nem herda suas regras de hunt.
- Um único arquivo HTML com JavaScript puro e Canvas, sem instalação nem etapa de build.
- Plataformas: celular na horizontal e navegador de PC, com um único layout adaptável.
- Arte provisória com formas simples e cores; arte final entra depois que as regras estiverem validadas.
- Cada etapa é entregue como página jogável publicada (artifact) para teste e aprovação.
- PROPOSTO: motor de regras separado da renderização (mesmo arquivo, funções sem desenho), para permitir o cálculo offline e testes automáticos.
- PROPOSTO: progresso salvo no navegador do jogador, com versão do save.

## 4. Escopo — APROVADO

A usuária quer tudo o que aparece nas gravações:
- Aventura com fases comuns e fases elite.
- Chefes e subchefes em determinadas fases.
- Arenas.
- Mapa de fases com estrelas.
- Melhoria de habilidades e evolução das criaturas.
- Farm offline.
- Cidade para andar.

Fora do escopo por enquanto: multiplayer na cidade, PvP online, guildas, comércio, pagamentos/VIP.
APROVADO (v0.4): arenas são lutas contra times salvos de outros jogadores (PvP assíncrono), com o inimigo controlado pela política Auto.

## 5. Equipe e formação

- APROVADO: três criaturas em campo por time.
- PROPOSTO: elenco de até seis, sem espécies duplicadas; demais na reserva, sem substituição durante a batalha.
- Uma criatura com zero de vida sai da linha do tempo.
- Treinador aparece ao lado da equipe como representação visual e não recebe dano.
- Formação sem bônus de posição na primeira versão.

Conjunto inicial: seis criaturas de teste (dano físico, dano especial, defesa, suporte, dano em grupo e velocidade).

## 6. Ordem das ações: linha do tempo — APROVADO (fórmula PROPOSTA)

APROVADO: criaturas mais rápidas agem mais vezes; não há rodadas fixas.

PROPOSTO:
- Cada criatura tem um "tempo da próxima ação". Após agir: próximo = agora + 1000 / velocidade efetiva.
- No início da batalha: primeiro = 1000 / velocidade.
- Age sempre quem tem o menor tempo; empates usam identificador estável (aliados antes de inimigos, depois posição).
- Alterar a velocidade recalcula o tempo restante proporcionalmente e já vale para a próxima ação.
- A lista "Ordem" mostra as próximas 8 ações previstas e destaca quem está agindo.
- Manual: quando é a vez de um aliado, o jogo espera a escolha de habilidade e alvo. O tempo não avança enquanto espera.
- Inimigos sempre usam a política automática.
- Auto pode ser ligado/desligado entre ações, sem ação extra.
- ×1 e ×2 mudam só a velocidade da animação, nunca dano, chances ou recompensas.
- Animações apenas representam resultados do motor.

Para o farm, cada ação tem duração lógica de dois segundos, independente de FPS e animação.

## 7. Habilidades e atributos — PROPOSTO

Atributos: vida máxima/atual, ataque físico, defesa física, ataque especial, defesa especial e velocidade.
OBSERVADO: três botões de habilidade por criatura, cada um com seu tipo. Etapa 1: ataque básico sem recarga + duas habilidades com recarga (2 e 3 ações).

- Ataque básico sem recarga.
- Habilidade especial: recarga de duas ações do próprio usuário (usada na ação 1, volta na ação 4).
- Habilidades em grupo atingem todos os inimigos vivos, com indicador ×N.
- Cura não ultrapassa a vida máxima e não revive.
- Efeito de atributo dura duas ações do afetado; reaplicar renova duração sem somar intensidade.
- OBSERVADO: tipos e tabela de eficácia existem na referência. Etapa 1 usa 8 tipos (Normal, Fogo, Água, Planta, Elétrico, Inseto, Pedra, Voador): fraqueza ×2, resistência ×0,5.
- Sem crítico, esquiva ou imunidades na primeira entrega.

Dano = máximo(1, piso(potência × ataque / (ataque + defesa))). Valores em tabela de dados, não espalhados no código.

## 8. Política automática — PROPOSTO

1. Cura disponível e aliado abaixo de 40% de vida → curar o de menor proporção.
2. Dano em grupo disponível e 2+ inimigos vivos → usar.
3. Efeito de atributo disponível e ainda não ativo no alvo → aplicar.
4. Dano individual disponível → usar.
5. Ataque básico.

Alvo ofensivo: inimigo com menor vida atual. Sem vantagem sobre o modo manual. Cada decisão aparece no registro.

## 9. Fases, ondas, chefes e estrelas — PROPOSTO

- Fase comum: três ondas; a última pode conter subchefe.
- Fase elite: liberada ao concluir a comum correspondente; inimigos mais fortes, última onda com chefe, recompensa maior.
- Chefe/subchefe: mais vida e atributos, uma habilidade própria; sem mecânicas especiais na primeira versão.
- Entre ondas: aliados conservam vida, recargas e efeitos.
- Derrota: nenhuma ativa viva, ou 120 ações por onda (falha por limite).
- APROVADO (v0.4): estrelas na vitória: 1, 2 ou 3 conforme quantas criaturas terminam vivas; 4 com as três vivas e dentro do tempo recomendado da fase.
- PROPOSTO: tempo da fase medido em tempo lógico (2 s por ação, independente do ×2); Praia das Conchas recomenda 1:30.
- Melhor classificação registrada; bônus de primeira conclusão uma única vez.
- Nova tentativa começa com vida cheia, recargas disponíveis e sem efeitos.

## 10. Progressão — PROPOSTO (detalhar na etapa 5)

Implementado na etapa 2 (valores de teste, editáveis em tabela):
- Tela de resultado no formato da referência: Pontuação (estrelas), LV/EXP do treinador, Prêmio Básico (XP de cada criatura com nível e barra), Prêmios (ouro e itens) e Prêmio Estrelar (3 baús).
- Fase 1-1: treinador +6 XP; 39 XP divididos entre as 3 em campo (13 cada, inclusive derrotadas); +120 ouro; Concha ×2.
- 1ª vitória (uma única vez): +200 ouro e a criatura Faiscol.
- Prêmio Estrelar (cada baú uma única vez): 3★ → 300 ouro + Concha ×3; 4★ → 500 ouro + Pérola ×1; Especial 4★ → Cristal de Habilidade ×3.
- Derrota ou tempo esgotado: sem recompensa.
- Níveis: treinador precisa de 10×nível XP; criatura, 20×nível. Cada nível dá +4% em PS, ataques e defesas (velocidade não muda).
- Início: Brasilho, Folhito, Casculo e Gotim. Faiscol vem da 1ª vitória; Rochedo aparece bloqueado como "Disponível na loja".
- Progresso salvo no navegador, com versão; versão incompatível reinicia e avisa. Botão "Recomeçar progresso" com confirmação de dois toques.
- Cada batalha só paga uma vez (proteção contra pagamento duplicado).


- XP de conclusão dividido igualmente entre as três ativas; reservas não recebem.
- Ouro e materiais pertencem ao jogador.
- Melhorar habilidade: custo em ouro/materiais, aumenta potência.
- Evolução: nível mínimo + materiais; muda aparência e atributos base.
- APROVADO (v0.4): novas criaturas vêm como recompensa ao concluir certas fases ou compradas na loja.

## 11. Farm online e offline — PROPOSTO

- Disponível apenas em fase já vencida; usa apenas Auto e a equipe registrada na ativação.
- Vitória entrega recompensa repetível e inicia nova tentativa; primeira derrota encerra a sessão.
- Limite offline: oito horas por ausência (configurável); excesso descartado e informado.
- Processa somente o intervalo ainda não contabilizado; reabrir não duplica recursos.
- Mantém tentativa incompleta para continuar online; entrega só recompensas de tentativas concluídas.
- Avança o motor sem renderização.
- Mesmos dados e tempo lógico produzem o mesmo resultado online e offline.
- Save local não protege economia competitiva; validação em servidor só se houver versão online.

Resumo ao voltar: tempo ausente, tempo processado, vitórias, motivo de parada, XP, ouro e materiais.

## 12. Interface

Arena 2D em vista 3/4: chão em diagonal, aliados embaixo à esquerda, inimigos em cima à direita, como nas gravações. Posições lógicas fixas; aproximar-se para atacar é só animação.

Mostrar vida, efeitos, Ordem, onda, habilidade disponível/recarga, alvo e Auto. Distinguir aliado/inimigo por mais que cor. Áreas de toque sem sobreposição. Legível no celular deitado; no PC, mesmo layout escalado.

Animações mínimas: repouso, ataque, dano, derrota. Toque duplo não executa ação duas vezes.

## 13. Critérios de aceitação

| ID | Situação | Resultado esperado |
| --- | --- | --- |
| A01 | Selecionar espécies duplicadas | Impedir seleção e explicar |
| A02 | Velocidades diferentes ou empatadas | Mais rápido age mais vezes na proporção da velocidade; desempate estável |
| A03 | Modo manual aguardando escolha | Tempo não avança; sem ações inimigas durante espera |
| A04 | Alterar velocidade | Próxima ação do afetado é recalculada imediatamente |
| A05 | Usar habilidade especial | Recarga respeita ações 2 e 3, volta na 4 |
| A06 | Criatura derrotada | Removida de alvos e da linha do tempo |
| A07 | Ataque em grupo | Todos os inimigos vivos afetados uma vez; ×N correto |
| A08 | Cura e efeitos | Respeitam teto, duração e reaplicação |
| A09 | Trocar Auto ou ×2 | Sem ação/recompensa duplicada; regras iguais |
| A10 | Passar de onda | Vida, recargas e efeitos conservados |
| A11 | Finalizar fase | Vitória/derrota, estrelas e recursos corretos |
| A12 | Repetir vitória | Bônus inicial não repetido |
| A13 | Farm perde ou excede limite | Sessão para e resumo explica |
| A14 | Online versus offline | Igual estado/recompensa para igual tempo lógico |
| A15 | Ausência acima de oito horas | Somente o limite processado; excesso informado |
| A16 | Voltar durante tentativa | Estado parcial preservado |
| A17 | Reabrir/coletar repetidamente | Intervalo não concedido novamente |
| A18 | Trocar equipe ao retornar | Passado não recalculado |
| A19 | Save carregado | Retoma estado válido; versão incompatível tratada |

## 14. Etapas de entrega — PROPOSTO

Cada etapa é uma página jogável; só começa a próxima após aprovação.

1. Combate: arena 3/4, 3×3, linha do tempo, manual/Auto, ×2, uma fase de três ondas, registro de ações. Valida A01–A11.
2. Fase completa: estrelas, recompensas, primeira conclusão, repetir. Valida A12.
3. Mapa de aventura: várias fases comuns em sequência, subchefes.
4. Fases elite e chefes.
5. Progressão: XP, nível, melhoria de habilidades, evolução.
6. Farm online e offline. Valida A13–A19.
7. Arenas (após decidir o formato pendente).
8. Cidade 2D para andar, com NPCs.
9. Arte final substituindo as formas provisórias.

## 15. Histórico de decisões

- v0.1: proposta inicial baseada nas gravações.
- v0.2: usuária confirmou times de três criaturas.
- v0.3 (06/10/2026): projeto novo e separado do Idle Pokémon; ordem por linha do tempo (rápido age mais vezes); formas simples provisórias; celular deitado e PC; arquivo HTML único com JS puro; entregas como artifacts; escopo inclui tudo das gravações (aventura comum e elite, chefes/subchefes, arenas, estrelas, evolução, farm offline, cidade). Removidas as regras de preservação da hunt e o critério A20.
- v0.4 (06/10/2026): vídeos como referência máxima de similaridade; arenas contra times salvos; criaturas novas por conclusão de fase ou loja; tipos incluídos no combate; três habilidades por criatura. Etapa 1 publicada para teste.
- v0.16 (06/10/2026): leitura da Origem Fadas Wiki registrada como referência.
- v0.15 (06/10/2026): Equipamentos, Fusão, Depósito e captura de monstros.
- v0.14 (06/10/2026): Cidade (etapa 8); Comum segue sem limite.
- v0.13 (06/10/2026): diamantes, Cápsulas, Loja de Diamantes, compra de VIT, entrada extra na Elite, cooldown da Arena 5 min.
- v0.12 (06/10/2026): Arena e Loja ajustadas ao vídeo (abas, 3 adversários, Trocar, cooldown, séries, Adorar, Loja da Arena rotativa).
- v0.11 (06/10/2026): Loja Comum, Loja da Arena e lendário Celéstor por fragmentos.
- v0.10 (06/10/2026): etapa 7 implementada (Arena com ranking, 5 lutas/dia, medalhas e recompensa diária).
- v0.9 (06/10/2026): etapa 6 implementada (BOT por estrelas e farm offline de 8 h).
- v0.8 (06/10/2026): etapa 5 implementada (tela de Monstros: XP, intimidade, habilidades, transformação).
- v0.7 (06/10/2026): etapa 4 implementada (Elite, chefes originais, limite diário, novos itens).
- v0.6 (06/10/2026): etapa 3 implementada (mapa, regiões, instâncias, subchefes, VIT, poder).
- v0.5 (06/10/2026): etapa 2 implementada (recompensas, 1ª vitória, baús do Prêmio Estrelar, níveis, save local).

## 17. Mapa de aventura (etapa 3)

OBSERVADO no vídeo de 06/10/2026 17:57: mapa com regiões ligadas por caminho tracejado vermelho; contador de estrelas por região (ex.: 11/20 = 4 estrelas × 5 instâncias); botões Comum/Elite embaixo; ao tocar a região abre painel com lista de instâncias (estrelas ou cadeado), baú da região no total de estrelas e detalhe da instância: tipo recomendado, Consome VIT, Chances restantes (Sem limite), inimigos com nível, tipo e selo BOSS, Poder recomendado × Poder, botão Time, Drop Principal, BOT ×10, BOT e Entrar. No Elite, algumas fases mostram "Libera [criatura] após vencer a fase".

PROPOSTO e implementado (valores de teste):
- Regiões: Praia das Conchas (nível 1–2), Bosque Sussurrante (4–7), Caverna Ecoante (8–10), 5 instâncias cada. Cidade (etapa 8) e Vulcão Rugidor aparecem bloqueados.
- Instâncias com 2 ou 3 ondas; subchefe (SUB) na última onda das instâncias 3 e 4; chefe na instância 5 (Carangão, Troncão Ancião, Golemar).
- Subchefe: PS ×2,2 e ataques/defesas ×1,15, desenhado maior. Inimigos têm nível (+4% por nível, como as criaturas do jogador).
- Liberação em sequência: cada instância exige vencer a anterior; a região seguinte abre ao vencer a instância 5 da anterior.
- Tempo recomendado (4ª estrela): 8 s por inimigo comum, 16 por subchefe, 30 por chefe, arredondado para cima em 10 s.
- VIT: máximo 100, cada entrada custa 6 (descontado ao entrar, também em Repetir/Próxima), recupera 1 a cada 3 minutos.
- Poder = 0,6×PS + ataque + defesa + ataque esp. + defesa esp. + velocidade. Poder recomendado = 1,25 × poder da onda mais forte. Verde se o seu poder alcança o recomendado.
- Tipo recomendado: os 3 tipos com mais vantagem contra os inimigos da instância.
- Recompensas crescem por instância; baú da região ao juntar todas as estrelas (400 ouro × nº da região + Cristal de Habilidade ×3), uma única vez.
- Faiscol passa a ser recompensa da 1ª vitória em Praia das Conchas 5.
- Equipe escolhida no botão Equipe/Time e salva. Resultado oferece Repetir, Próxima instância e Voltar ao mapa.
- BOT e BOT ×10 aparecem desativados até a etapa 6 (farm).
- Save passou para a versão 2; o progresso da etapa 2 é reiniciado com aviso.

Simulação no Auto (escolhendo a melhor equipe): todas as 15 instâncias são vencíveis; na Caverna às vezes é preciso repetir a instância anterior para ganhar nível.

## 18. Fases Elite (etapa 4)

APROVADO (06/10/2026):
- Elite = as mesmas instâncias da Comum, mais difíceis, com um chefe diferente no final de cada uma.
- Inimigos da Elite são os mesmos monstros da Comum; só o chefe é uma criatura original.
- Recompensas: Elite dá itens de destravar habilidades (Pergaminho de Habilidade) e de transformação (Cristal de Transformação); Comum dá itens inferiores, de nível/XP (Poção de XP) e intimidade (Fruta da Amizade).
- Elite: 3 tentativas por dia e mais VIT que a Comum. Comum sem limite.

PROPOSTO e implementado (valores de teste):
- Inimigos da Elite +3 níveis; o chefe Elite entra no meio da última onda, 1 nível abaixo do inimigo mais forte da instância.
- 15 chefes originais: Praia — Coralito Rei, Ostrâmia, Gaivotão, Estrela Abissal, Polvorão; Bosque — Cogumestre, Vespérula, Corujaço, Raizão, Mantídeo; Caverna — Morcegante, Cristalok, Faíscorte, Toupedra, Titã de Basalto.
- Elite N libera ao vencer a Comum N e a Elite N−1 da mesma região.
- VIT: Elite custa 12 (Comum 6). A tentativa diária é descontada ao entrar, junto com a VIT; renova à meia-noite (horário do aparelho).
- Recompensas Elite ≈ 1,5× XP e ouro da Comum; baús do Prêmio Estrelar e baú da região (800 ouro × nº da região + Cristal de Transformação ×3) com itens Elite.
- Mapa: botões Comum/Elite alternam o modo; Elite tem tom roxo, contadores e painel em laranja e "Chances restantes n/3 hoje".
- Save v3: itens da etapa anterior (Concha, Semente, Minério, Pérola, Cristal) foram convertidos em ouro (20 cada); o resto do progresso é mantido.
- Os itens novos ainda não têm uso; entram na etapa 5 (progressão e evolução).

Simulação no Auto: depois da campanha Comum, as 15 Elite são vencíveis; a Caverna Elite pede repetir a Comum algumas vezes para subir de nível.

## 19. Progressão das criaturas (etapa 5)

APROVADO (06/10/2026):
- Poção de XP aumenta o nível base; Fruta da Amizade aumenta a intimidade. Os dois aumentam os atributos.
- Intimidade nos níveis 10, 20, 30 e 40 destrava novas habilidades.
- Pergaminho de Habilidade destrava o limite da intimidade ao bater 10, 20, 30 e 40.
- Cristal de Transformação transforma a criatura em uma versão melhor dela mesma. Algumas melhoram 2×, outras 3×, e poucas, exclusivas, têm uma versão shiny final (4×).

OBSERVADO no vídeo de 06/10/2026 19:50: tela do monstro com lista à esquerda, criatura no centro (Nv, nome, Poder, coração da intimidade), abas à direita (Atributos, Intimidade, Habilidade, Equip, Treinar, Evoluir); Pool de XP com itens usados automaticamente e botões de 1 e 10 níveis; intimidade com barra crescente (0/5 … 10/40 … 0/50) e, no limite, "Limite do Nv. de Intimidade +10" + "Nova Habilidade" pedindo item para "Avançar"; lista de habilidades com "Nível de Intimidade N para desbloquear" e melhoria por ouro (200); prévia da cadeia de evolução com 3 formas.

PROPOSTO e implementado (valores de teste):
- Pool de XP: cada Poção vira 100 XP, usada automaticamente ao abrir a tela; +1 nível e +10 níveis gastam do Pool (20 × nível por nível).
- Intimidade: Fruta = +20; necessário por nível 5, 5, 5, 10, 20, 30, 40, 50…; +1% em PS, ataques e defesas por nível; máximo 50.
- Limite começa em 10. Avançar no limite custa Pergaminhos (1 no 10, 2 no 20, 3 no 30, 4 no 40), sobe o limite em 10 e destrava a habilidade daquele nível.
- 4 habilidades novas por tipo (Nv 10/20/30/40): golpe forte, golpe em grupo, apoio (cura ou reforço) e golpe final. Ex. Fogo: Lança-Chamas, Explosão Ígnea, Fúria Solar, Supernova.
- Habilidades sobem de nível com ouro (200 × nível), +8% de poder por nível, máximo 10.
- Transformações: Brasilho 3 (Brasador, Pirofante, Vulcanorr); Folhito 2 (Folhudo, Florestal); Casculo 2 (Cascudão, Carapaçor); Gotim 3 (Gotão, Marejante, Abissorr); Faiscol 4 com shiny exclusiva (Faiscão, Trovolt, Tempestron, Tempestron Shiny); Rochedo 2 (Rochão, Montanhor).
- Transformação k exige nível 10×k, Cristal de Transformação 2×k (10 para a shiny) e 1000×k de ouro. Cada forma multiplica os atributos (×1,25 a ×2,2) e muda o visual (chifres, aura, brilho shiny).
- Na batalha aparecem todas as habilidades destravadas; com mais de 3, os botões ficam menores.
- Save v4: criaturas ganham intimidade, limite, forma e níveis de habilidade; progresso anterior mantido.

Fora desta etapa: abas Equip e Treinar, presentes com valores diferentes (+10/+20/+40/+150/+600), pontos de habilidade por tempo e habilidades passivas (aguardando vídeo).

## 20. BOT e farm offline (etapa 6)

APROVADO (06/10/2026):
- BOT é uma varredura: gasta VIT e entrega a recompensa de acordo com quantas estrelas a instância já tem.
- Offline: escolher uma das instâncias vencidas e juntar as recompensas, com limite de 8 h.

PROPOSTO e implementado (valores de teste):
- BOT e BOT ×10: só em instância já vencida; cada varredura passa pelas mesmas regras de entrada (VIT 6/12 e, na Elite, a tentativa diária). Paga a recompensa básica × 55% (1★), 70% (2★), 85% (3★) ou 100% (4★) da melhor nota; sem 1ª vitória nem baús. XP vai para a equipe atual. Resumo "BOT Completo".
- Farm offline: só instâncias Comuns vencidas (Elite tem limite diário). Ao iniciar, o jogo simula a batalha no Auto com a equipe e os atributos daquele momento; se a equipe não vence, o farm não começa e o motivo é mostrado.
- Uma vitória a cada 15 min (ou o tempo lógico da batalha, se for maior): ≈ 32 vitórias em 8 h, perto do que a VIT permite jogando. Nota da simulação define o percentual (55–100%).
- Não gasta VIT. Junta no máximo 8 h desde a última coleta; o excedente é descartado e informado. A sobra de um ciclo incompleto continua contando. Coletar duas vezes não duplica.
- Coleta automática ao abrir o jogo ("Bem-vindo de volta!": instância, tempo fora, tempo contado, vitórias, nota, XP, ouro e itens) e pelo botão de farm no topo do mapa.
- Equipe e atributos ficam congelados no início do farm; trocar a equipe vale só para um farm novo. Iniciar outro farm coleta o anterior antes.
- Cálculo local (protótipo). Numa versão online, horário e recompensas precisam ser validados pelo servidor.

## 21. Arena (etapa 7)

APROVADO (06/10/2026):
- Ranking: você desafia quem está acima e troca de lugar se vencer.
- 5 lutas de arena por dia.
- Recompensa diária por se manter no ranking, para incentivar a arena.
- Moeda exclusiva da arena, trocada na loja (ideias: fragmentos de monstros lendários, itens de habilidade, destrave de intimidade).
- Por enquanto os "times salvos" são adversários gerados pelo jogo.

PROPOSTO e implementado (valores de teste):
- 100 posições; o jogador começa em #100. Adversários gerados com equipe, nível, forma e intimidade fixos por posição inicial (#99 ≈ Nv 1, #1 ≈ Nv 38). Nomes originais únicos.
- Alvos: os 5 logo acima no topo; mais abaixo, saltos de posição/20 (em #100: #95, #90, #85, #80, #75).
- A luta conta ao entrar (5 por dia, renova à meia-noite). Batalha de uma onda contra o time do adversário, controlado pelo Auto; mesmas regras de combate.
- Vitória: troca de lugar com o desafiado e +10 Medalhas de Arena. Derrota ou tempo esgotado: posição mantida e +2 medalhas.
- Recompensa diária pela posição atual, coletável uma vez por dia: #1 300 medalhas + 3000 ouro; top 3 250 + 2500; top 10 200 + 2000; top 20 150 + 1500; top 50 100 + 1000; demais 60 + 500.
- Tela da Arena: ranking completo à esquerda (você destacado), seu card (posição, time, poder, lutas restantes, medalhas, recompensa diária) e 5 cartas de desafio com o time e o poder de cada adversário. Fundo de batalha próprio.
- A equipe da Arena é a mesma equipe salva (botão Time). Numa versão online, ela vira o "time salvo" que outros jogadores desafiam.
- Pendente: loja das medalhas (etapa da loja).

## 22. Loja

APROVADO (06/10/2026): criar a loja; a moeda da Arena é trocada nela por coisas boas (fragmentos de monstros lendários, itens de habilidade, destrave de intimidade).

OBSERVADO (gravação 15:59, 4:48): Loja com abas (Loja Comum, Loja de Equipamento da Montaria, Loja da Arena), grade de 12 ofertas com nome, ícone, quantidade e preço, "Próxima atualização" com contagem regressiva e botão Atualizar.

PROPOSTO e implementado (valores de teste):
- Loja Comum (ouro): 12 ofertas sorteadas por hora (Poção de XP, Fruta da Amizade, Pergaminho, Cristal de Transformação, Fragmento de Celéstor), com descontos de 10–30%. Cada oferta compra-se uma vez por renovação. Atualizar manual: 200, 400, 600… de ouro na mesma hora.
- Rochedo à venda na Loja Comum por 20 000 de ouro até ser comprado (lugar fixo durante a hora).
- Loja da Arena (medalhas), fixa, limite por dia: Fragmento de Celéstor ×10 (400, 1/dia), Pergaminho ×1 (120, 3/dia), Cristal de Transformação ×1 (150, 3/dia), Poção de XP ×10 (80, 3/dia), Fruta ×10 (80, 3/dia), 5000 ouro (100, 2/dia). Limites renovam à meia-noite.
- Lendário original: Celéstor (Voador), invocado com 50 fragmentos na Loja da Arena. Atributos altos, habilidades de Voador destravadas pela intimidade (Tufão, Furacão, Vento a Favor, Céu Furioso) e 1 transformação (Celéstor Aurora).
- Aba de equipamento/montaria fica para quando existir sistema de equipamento.
- Pendente: confirmar a regra real dos fragmentos (quantidade, outros lendários).

## 23. Arena e Loja revistas pelo vídeo de 06/10/2026 20:19

OBSERVADO:
- Arena com abas laterais Pessoal, Desafiar, Partida, Ranking e Loja; Poder Total no canto.
- Pessoal: treinador e companheiro no pedestal, LV e nome, Formação de 3; Info Pessoal com Ranking de Arena, Prêmios esperados, Total de Batalhas, Vitórias, Taxa, Maior série, Maior série de hoje (premiação +%), Série atual, Poder da Defesa.
- Desafiar: 3 adversários em pedestais (N.posição, LV, Poder), botão Trocar, botão com Cooldown (≈ 9 min) entre lutas; caixa com No., Série de Vitórias, Prêmio esperado e "Vitórias diárias consecutivas N, premiações extras X%".
- Partida: busca aleatória (Combinação Comum / Desafiadora) contra adversário oculto.
- Ranking: Ranking do PVP e de Prestígio; top com medalhas 1–3, Poder, botão Adorar → "Venerado" e VIT ×10 cada.
- Loja: abas Loja Comum, Loja de Equipamento da Montaria (diamantes), Loja da Arena e Loja da Guilda. Loja da Arena tem 12 ofertas em moeda da arena (fragmento de lendário ×1 por 100, cartas de evolução, itens de habilidade), contagem para a próxima atualização e botão Atualizar.
- Diamantes aparecem como moeda premium.

PROPOSTO e implementado:
- Arena refeita com abas Pessoal, Desafiar, Ranking e Loja (Partida fica pendente).
- Desafiar: 3 adversários sorteados acima de você (faixa = 1/4 da sua posição); Trocar sorteia outros, grátis; novos adversários após cada luta. 10 min de intervalo entre lutas, além das 5 por dia.
- Estatísticas: batalhas, vitórias, taxa, maior série, maior série do dia, série atual e dias seguidos com vitória (quebra se passar um dia sem vencer).
- Premiação extra da recompensa diária pelos dias seguidos com vitória: 5+ dias +10%, 10+ +20%, 15+ +30%.
- Ranking: top 30 (e a sua posição); Adorar o top 3 uma vez por dia, +10 VIT cada (pode passar do máximo).
- Loja da Arena agora rotativa: 12 ofertas sorteadas por dia (sempre 1 Fragmento de Celéstor ×1 por 100), cada uma compra-se uma vez; Atualizar custa 20, 40, 60… medalhas. O lendário (Invocar) fica no primeiro espaço.
- Abas Loja de Equipamento da Montaria e Loja da Guilda aparecem desativadas.
- Pendentes: Partida (busca aleatória), Ranking de Prestígio, diamantes, equipamentos, guilda.

## 24. Diamantes, Cápsulas e compras com diamantes

APROVADO (06/10/2026):
- Cooldown da Arena: 5 minutos.
- Partida = batalha online simultânea; fica para quando houver multiplayer (aba aparece desativada).
- Diamantes: ganha 1 vez por instância ao completá-la pela primeira vez com 4 estrelas; ganha diariamente na Arena por se manter no ranking.
- Gasta em: roleta/cápsulas para fragmentos (sorteio comum grátis e sorteio raro com diamantes, com prêmios melhores), loja de diamantes, VIT (até 3 compras de 30 VIT) e entrada extra nas Elites.

PROPOSTO e implementado (valores de teste):
- 4★ pela primeira vez: 20 diamantes (Comum) ou 40 (Elite). 4★ conquistadas antes desta versão não pagam retroativo.
- Arena diária: #1 100, top 3 80, top 10 60, top 20 50, top 50 40, demais 30 diamantes (com o mesmo bônus de série de vitórias).
- Cápsulas (botão no mapa, "Brinquedo em Cápsula"): Sorteio Comum grátis 1 vez por dia (Poção de XP, Fruta, ouro, Fragmento ×1, Pergaminho); Sorteio Raro 100 diamantes (×10 por 900) com fragmentos ×3/×5/×10, Cristal, Pergaminho e Poção. Chances em % mostradas na tela.
- Loja de Diamantes (nova aba): VIT ×30 (50/100/150 diamantes, 3 por dia, pode passar do máximo), Fragmento ×5 (250), Cristal de Transformação (60), Pergaminho (50), Poção ×20 (30), Fruta ×20 (30), 10 000 ouro (40).
- Entrada extra na Elite: botão "+1 entrada" no painel da instância; 20/40/60 diamantes, até 3 por instância por dia; não acumula para o dia seguinte.
- APROVADO: a Comum continua sem limite de entradas.

## 25. Cidade (etapa 8)

OBSERVADO (vídeo 20:38): cidade em 3/4 com ruas, faixas, setas, praça com fonte/estátua, árvores, postes; jogador com companheiro seguindo (nomes em azul e verde); outros jogadores andando com seus monstros; HUD com avatar e nível, diamantes/ouro/VIT, ícones de atalho à esquerda (Brinquedo em Cápsula, Bolsa, Loja, Roleta, eventos), Aventura/Provação no topo direito, painel Missão à direita e Treino/Time/Monster embaixo.

PROPOSTO e implementado:
- O jogo abre na Cidade (mundo 2000×1300, câmera segue o jogador). Andar: tocar no chão ou setas/WASD; colisão com prédios, fonte e árvores.
- Companheiro = 1ª criatura da equipe, segue o jogador. 9 treinadores da Arena passeiam com seus monstros (toque mostra nome e poder; interação real depende do multiplayer).
- Prédios com NPC na porta: Loja (Vendedora), Centro de Monstros (Professor), Brinquedo em Cápsula (Atendente), Arena (Juíza da Arena) e Portão da Aventura (Guia, abre o mapa). Perto do NPC aparece "Entrar: …"; tocar no prédio leva o jogador até a porta e abre.
- HUD: avatar e nível do treinador, diamantes, ouro, VIT; atalhos Cápsulas, Loja, Aventura, Arena, Monstros, Equipe.
- Painel Missão (recolhível) com atalhos: próxima instância Comum, próxima Elite, prêmio diário da Arena, lutas restantes, cápsula grátis e farm.
- No mapa, o botão Cidade e a ilha Cidade voltam para a cidade.

## 16. Pendências observadas na referência

- RESOLVIDO: a barra "Finalizar!" é só um contador visual de combo; mostra "N Finalizar!" quando a equipe derrota um inimigo. Não tem efeito nas regras.
- RESOLVIDO: critério das 4 estrelas (seção 9).
- PENDENTE: propriedades passivas ("ativou Propriedade [Boost de Velocidade I]") ficam para depois; a usuária vai enviar vídeo mostrando como funcionam.

## 26. Equipamentos, Fusão e Depósito

APROVADO (06/10/2026):
- Arte final fica para depois; primeiro todo o sistema base.
- Equipamentos dropam nas dungeons e melhoram atributos do monstro.
- Fusão = sacrificar um monstro para melhorar os atributos de outro.
- Depósito = aba com todos os monstros obtidos.

OBSERVADO (vídeos 20:34 e 20:48): Item Carregado com PS +70, ATQ +16, DEF +9, VEL +2, ATQ.ES +16, DEF.ES +9, efeito especial ("Velocidade +6%", "Poder de Habilidade de tipos +10%") que ativa em +3, Amplificar, Remover, Síntese Rápida, Como Obter (drop por instância Elite com BOT); Acessórios liberam no Nv 45. Fusão: barra de nível (0/10, 30/50), Carta de XP de Fusão, monstros fora do time como material ("Em Time" bloqueado), 5000 de ouro por material, tela "Aprimorado" com PS/ATQ aumentados e nome "+1". Depósito: monstros em pedestais com Poder e tipo, ordenar por Poder/Nível/Intimidade/Fusão/Padrão, "Qtd. de Monstro 5/50".

PROPOSTO e implementado (valores de teste):
- 8 equipamentos: Garras Velozes (VEL +6%), Revestimento de Metal (Pedra/Normal +10%), Carvão Ardente (Fogo), Gota Mística (Água), Semente Milagrosa (Planta), Ímã (Elétrico), Bico Afiado (Voador), Pó Prateado (Inseto). Base: PS +70, ATQ +16, DEF +9, ATQ.E +16, DEF.E +9, VEL +2.
- Amplificar: +10% da base por nível, máximo +10, custa 1000 × (nível+1) de ouro. Efeito especial ativa em +3.
- 1 item por monstro (Item Carregado); trocar devolve o anterior à bolsa. Acessórios: em breve.
- Drop por região: Praia (Gota, Garras, Metal), Bosque (Semente, Pó, Bico), Caverna (Metal, Ímã, Carvão). Chance por vitória: Comum 8%, Elite 35%.
- Captura: vitória em instância Comum tem 20% de chance de dar um monstro comum daquela instância (Siriz, Pombito, Brotim, Pedrisco etc.). Espécie repetida ou Depósito cheio (50) vira Carta de XP de Fusão.
- Carta de XP de Fusão: Elite (50% por vitória), Cápsula comum e Loja Comum.
- Fusão: escolhe materiais fora do time (e do farm) e cartas; XP do material = 20 + 2×nível + 10×fusão; carta = 20 XP. Necessário por nível: 10, 50, 90… (+40). Cada nível de fusão: +4% em PS, ataques e defesas; nome ganha "+N"; máximo +10. Custo 5000 de ouro por monstro e 1000 por carta. Confirmação em dois toques. O sacrificado some; o equipamento dele volta à bolsa. É preciso ficar com pelo menos 3 monstros.
- Depósito: botão Monstros (mapa, cidade e Centro de Monstros) abre o Depósito; tocar abre a ficha. Lista lateral da ficha e tela de Equipe mostram todos os monstros obtidos.
- Save v6 (progresso mantido).
- Pendentes: Síntese Rápida, Acessórios, Valor Individual, Bolsa (inventário geral).

## 27. Referência: Origem Fadas Wiki (lida em 06/10/2026)

Fonte: https://wiki.origemfadas.com.br/ — guia comunitário do jogo de referência (Pocket Contest). Resumo do que a wiki descreve:

- Pokédex: 887 formas; cada uma tem tipo(s), Status total (ex.: 1.200 a 1.360) e grau na linha evolutiva: B, A, S, SS, Mega, Overlord, Overlord Ressonância, Dynamax. Custos de evolução por Overlord, Ressonância e Dynamax.
- Cápsula diária: 56 lendários em rodízio anual (365 dias); cada um aparece 5 a 7 vezes por ano. Recursos de evolução citados: Livro de Fogo, Fragmento Universal, diamantes.
- Evolução de status, três métodos: Montaria (maior ganho bruto por nível em todos os status), Carta de Avanço (ganho pequeno e preciso, bom em Velocidade; 100 níveis ≈ +1.000 VEL; muda o "Valor Pessoal") e Fusão (melhor para dano; ~21× a Carta em Ataque).
- Itens Carregados (12): Sobras (cura 9% PS), Óculos do Sábio (+18% poder especial), Garras Velozes (+17% VEL), Faixa Muscular (+18% ATQ/ATQ.E), Griseous Orb (+27% ATQ/ATQ.E); itens de tipo +28% de poder de habilidade para 3 tipos (Carvão, Ímã, Faixa Preta, Metal Coat, Presas de Dragão); Lentes Especiais e Água Mística (+17% precisão/controle). Cada item tem efeito avançado (ex.: Garras: 30% de chance de VEL ×3 por 1 turno ao entrar).
- Acessórios: conjuntos de 3 peças com 4 efeitos, ranqueados S (Trovão, Ho-oh), A (Eternidade, Pilar, Chefe, Propósito, Origem), B (Marte); alguns por janela de horário.
- Mecânicas extras: Habilidade Oculta (517; 116 entram no status antes da batalha) e Especialidade (efeito de batalha).
- Clima da Masmorra: 9 climas (Ensolarado, Chuva, Chuva Forte, Tempestade, Neblina, Neve Fraca, Neve Forte, Nevasca, Tempestade de Areia) em calendário anual, liberando grupos de monstros e prêmios diários.
- Modos: Explorador, Liga Pokémon, Séries Mundiais (1 time); Liga da Conferência, Liga dos Campeões, EXVS entre servidores (3 times). Arena: 1 time, mesmo servidor. Prêmios por colocação.
- Eventos de inauguração de servidor: 7 dias, 4 rankings (Recargas, Montaria, Poder, Nível), prêmios para o top 20.
- Crítico: há documento de fórmula de dano crítico e chance de crítico (externo, não lido).

Lacunas da wiki: detalhes de cada conjunto de acessório, regras/odds da cápsula, monstros por clima e fórmulas de crítico não estavam acessíveis.

## 28. Pokédex e criaturas no jogo (v0.17)

APROVADO em 06/10/2026:
- Pokédex com as 887 formas da referência, todas com nomes e visuais originais. Mega, SS, Overlord e Ressonância (347 formas) ficam visíveis, mas bloqueadas.
- Início: o jogador escolhe 1 de 3 criaturas grau C (Muroel, Timelim e Pelião). O resto ele captura, sorteia ou compra.
- Masmorras: os selvagens vêm da Pokédex, e os tipos dependem do tema da região.
  - Praia: Água, Voador, Normal, Gelo e Fada.
  - Bosque: Planta, Inseto, Venenoso, Batalha, Noturno e Fogo.
  - Caverna: Pedra, Elétrico, Terra, Metálico, Fantasma, Psíquico e Dragão.
- Obtenção:
  - Grau S: invocado na loja da Arena com 50 Fragmentos de Grau S. São 3 criaturas em destaque por dia.
  - "Sorteio" sem "Masmorra": sai nas Cápsulas. A Comum dá até grau B e a Rara dá até grau A.
  - Demais: capturadas nas masmorras.
- A Pokédex do jogador marca o que foi visto e o que foi obtido.

PROPOSTO (implementado na v15):
- **Jogáveis:** são as 267 bases liberadas. Os estágios seguintes liberados da família viram as evoluções.
- **Requisitos de evolução** (vêm da ficha):
  - nível = metade do nível da referência;
  - intimidade = afinidade da referência;
  - Cristais = itens da referência ÷ 10;
  - ouro = 1000 × número da evolução.
- **Escala dos status:** PS ×0,45, ATQ ×0,65, DEF ×1,1, ATQ.E ×0,65, DEF.E ×1,1. A VEL ~500 da referência vira 25–110, em torno de 60.
- **Selvagens:** são mais fracos. PS ×0,34, ATQ ×0,62, DEF ×0,78, ATQ.E ×0,62, DEF.E ×0,68.
- **Golpes por afinidade:** a afinidade 0–9 libera no limite de intimidade 10, a 10–19 no 20, e assim por diante.
  - Todo monstro tem um ataque básico Normal sem recarga.
  - Golpes de status viram buff ou debuff do atributo citado no texto.
  - Passivas e efeitos como congelar, envenenar e confundir ficam para depois.
- **Tipos:** 18 tipos com tabela completa. Duplo tipo multiplica os efeitos. Imunidade vale ×0,5 para nenhuma luta travar.
- **Começo com uma criatura:**
  - Praia 1 tem só um inimigo por onda e dá um monstro na 1ª vitória.
  - Praia 2 foi feita para 2 criaturas e também dá um monstro.
  - As 4 estrelas pedem todos os membros vivos, qualquer que seja o tamanho do time.
- **Lojas:**
  - A Loja Comum tem 1 criatura grau A por hora, que o jogador ainda não tem.
  - Os treinadores da Arena usam criaturas da Pokédex.
- **Save:** passa para v7. Os monstros de teste antigos continuam no Depósito, e os Fragmentos de Celéstor viram Fragmentos de Grau S.

## 29. Mapa completo: 8 regiões (v0.18)

- O mapa rola na horizontal. No celular é arrastar; no PC, arrastar ou usar a roda do mouse. Ao abrir, ele centraliza na última região liberada.
- Cada região tem 5 instâncias Comuns e 5 Elite, o que dá 40 + 40 no total.
- Cada nova região usa a estrutura da Caverna, com +4 níveis por região.
- O chefe da 5ª Comum e os 5 chefes Elite de cada região nova são criaturas originais, 30 novos ao todo.

| Região | Tipos dos selvagens | Níveis Comum | Chefe da 5ª |
| --- | --- | --- | --- |
| Praia das Conchas | Água, Voador | 1–2 | Carangão |
| Bosque Sussurrante | Planta, Inseto | 4–6 | Troncão Ancião |
| Caverna Ecoante | Pedra, Terra | 8–10 | Golemar |
| Vulcão Rugidor | Fogo, Dragão | 12–14 | Magmorr |
| Pico Gelado | Gelo, Batalha | 16–18 | Yetirão |
| Usina Trovejante | Elétrico, Metálico | 20–22 | Turbinox |
| Pântano Sombrio | Venenoso, Fantasma, Noturno | 24–26 | Lodaçal |
| Templo Celeste | Psíquico, Fada, Normal | 28–30 | Guardião do Templo |

- Todas as 149 criaturas de masmorra aparecem em alguma fase e podem ser capturadas; as 3 iniciais ficam de fora.
- Cada região tem fundo de batalha próprio e equipamentos ligados ao tema.
- Simulação no Auto, para cada inicial:
  - **Uso dos recursos:** o jogador simulado gasta o Pool de XP, as frutas e os pergaminhos e evolui as criaturas.
  - **Resultado:** a campanha Comum e a Elite terminam nas três simulações.
  - **Ponto mais difícil:** o Guardião do Templo, no fim da Comum.

## 30. Visual, Montaria, Bolsa, Acessórios e Dungeon (v0.19)

APROVADO em 06/10/2026:
- **Cenários:** reproduzem o estilo dos cenários do jogo de referência. A Praia é o exemplo para aprovação, gerada no Canva em `bg/praia.jpg`. As outras regiões seguem o mesmo processo depois do OK.
- **Passivas:** ficam em aberto ("em breve") até chegar o material da usuária.
- **Clima da Masmorra:** não será usado por enquanto.
- **Montaria, Bolsa e Acessórios:** serão criados. Os Acessórios caem só numa área nova chamada "Dungeon".

PROPOSTO (implementado na v17):
- **Montaria:**
  - O treinador monta, na batalha e na cidade. O bônus vale para todos os monstros do jogador em batalha (PS, ATQ, DEF, ATQ.E, DEF.E).
  - Bônus = base da montaria ativa + 0,8% por nível (até o nível 50) + 3% por equipamento da montaria.
  - Montarias:
    - Cabrito Montês: +2%, ganho na 1ª vitória da Praia 5.
    - Lagarto Corredor: +4%, custa 300 diamantes.
    - Grifo Real: +6%, custa 800 diamantes.
    - Lobo Sombrio: +8%, custa 1500 diamantes.
  - Equipamentos da montaria (Sela, Rédea, Ferraduras e Manta) custam 150 a 250 diamantes e ficam na Loja de Equipamento da Montaria, agora ativa.
  - O nível sobe com Feno Dourado (+10 de EXP; precisa de 10 × nível). O Feno vem das Comuns (1 por vitória), da Dungeon e da loja.
- **Bolsa:** tem abas Itens, Itens Carregados e Acessórios. Cada item mostra a descrição e onde conseguir.
- **Acessórios:**
  - São 3 espaços por monstro: Anel (ATQ/ATQ.E), Colar (PS) e Brinco (DEF/DEF.E).
  - Os atributos fixos sobem com o grau: B ×1, A ×1,6 e S ×2,4.
  - Conjuntos e bônus (2 peças / 3 peças):
    - Marte (B): ATQ +8% / PS +8%.
    - Brisa (B): VEL +5% / DEF.E +10%.
    - Pilar (A): DEF +12% / PS +12%.
    - Eternidade (A): PS +10% / DEF e DEF.E +8%.
    - Origem (A): ATQ.E +12% / VEL +6%.
    - Trovão (S): VEL +8% / ATQ e ATQ.E +15%.
    - Fênix (S): PS +15% / ATQ.E +15% e DEF.E +10%.
  - Na Fusão, os acessórios do monstro sacrificado voltam para a Bolsa.
- **Dungeon:**
  - É um nó próprio no mapa e abre ao vencer a Caverna Ecoante 5.
  - Tem 5 andares: níveis 12, 18, 24, 30 e 36. Cada um tem 3 entradas por dia, custa 12 de VIT e permite comprar entradas extras com diamantes.
  - Cada andar tem chefe original: Golem Rúnico, Baú Mímico, Sentinela Arcana, Dragão da Cripta e Rei da Masmorra.
  - Toda vitória (inclusive no BOT) dá 1 acessório. O grau depende do andar: B; B/A; B/A; A/S; A/S.
  - Sem farm offline.
- **Save:** passa para v8. Quem já venceu a Praia 5 ganha o Cabrito Montês.
