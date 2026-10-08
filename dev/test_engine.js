// Extrai o motor do HTML e roda verificações. Uso: node test_engine.js
const fs=require('fs'), assert=require('assert');
const html=fs.readFileSync(__dirname+'/combate.html','utf8');
const src=html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const dexJson=html.match(/<script id="dexdata" type="application\/json">([\s\S]*?)<\/script>/)[1];
const E=new Function('document',src+';return {isCrit,critChance,freeRare,STARTERS,POOL,featuredS,summonS,markDex,skillPlan,skillsAt,DEX_BASES,DEXBY,transformReq,eff,obtainOf,REGION_TYPES,WILD_MULT,SKILLS,SPECIES,STAGES,STAGE_ORDER,ELITE_ORDER,REGIONS,tryEnter,chancesLeft,VIT_COST_ELITE,ELITE_DAILY,newBattle,act,choose,current,preview,stars,applyRewards,newSave,unlocked,vitNow,claimRegionChest,regionStars,VIT_MAX,VIT_COST,VIT_REGEN_MS,fillPool,levelUp,feed,breakCap,upgradeSkill,canTransform,transform,mkUnit,progOf,power,FORMS,TRANSFORM_REQ,intNeed,sweep,startFarm,collectFarm,simulate,progMap,STAR_MULT,FARM_CAP_MS,FARM_CYCLE_MIN_MS,npcOf,npcPower,arenaState,arenaTargets,arenaEnter,arenaResolve,claimArenaDaily,myRank,ARENA_DAILY,arenaSwap,arenaCooldown,adore,streakBonus,arenaOffers,rerollArenaShop,ARENA_CD_MS,shopOffers,buyShop,rerollShop,buyArena,LEGEND_FRAGS,buyEliteEntry,spinCapsule,freeLeft,buyDia,buyVit,CAPSULE,DIA_4STAR,newGear,equipGear,unequipGear,amplify,gearStats,fuse,addCreature,fusNeed,DEPOSIT_MAX,mountBonus,feedMount,giveMount,accBonus,dropAcc,equipAcc,unequipAcc,ACC_SETS,MOUNTS,DUNGEON,migrate,libBreak,libNeed,evoCardOf,EXPL_ORDER,fusCapOf,weeklySetup,weeklyClaim,weeklyTeamWhy,weekendRegion,vitCost,ARENA_REF:0,npcOf,EXPL_MILE,ELITE_MILE,WEEK_TYPES,npcPower,arenaState,ampCost,MOUNT_GROWTH,FUS_COST,NM_ORDER,towerSetup,towerRule,towerTeamWhy,towerFloor,TOWER_DAILY,guildDonate,guildState,buyGuild,guildBossSetup,MEGA_OF,megaStones,giveStone,bgSetup,bgOpen,bgBossOf,bgState,bgClaim,bgRanking,dayIdx,MEGA_BOSSES,megaIdx,normalForms,buyMountSkin,extraBonus,buyTrainerSkin,wearTrainerSkin,MOUNT_LV_MAX,MOUNT_CHAIN,TITLES};')({getElementById:()=>({textContent:dexJson})});
// testes de mecânica usam inimigos fracos (dm 0.3); a campanha simulada no fim usa o balanceamento real
const DM0={}; for(const id in E.STAGES){ DM0[id]=E.STAGES[id].dm; E.STAGES[id].dm=0.3; }
const run=(team,id,lv={})=>{const b=E.newBattle(team,id,lv); while(!b.over){const u=E.current(b);E.act(b,...E.choose(b,u).slice(0,2));} return b;};

// recarga: usar na ação 1, indisponível 2 e 3, volta na 4
let b=E.newBattle(['brasilho','folhito','gotim'],'caverna-3'); const br=b.allies[0]; const log=[];
while(!b.over && br.acts<6){ const u=E.current(b); let [s,t]=E.choose(b,u); if(u===br){ s = br.acts===0?'brasa':'arranhao'; log.push(!(br.cd.brasa>0)); } E.act(b,s,t); }
assert.deepStrictEqual(log.slice(0,4),[true,false,false,true],'recarga '+log);
// velocidade: Faiscol (95) age ~3x mais que Rochedo (30)
b=E.newBattle(['faiscol','rochedo','casculo'],'caverna-3'); const pv=E.preview(b,60);
const r=pv.filter(u=>u.sp==='faiscol').length/pv.filter(u=>u.sp==='rochedo').length; assert(r>2&&r<4.5,'proporção '+r);
// determinismo
assert.strictEqual(JSON.stringify(run(['brasilho','folhito','gotim'],'praia-5').log), JSON.stringify(run(['brasilho','folhito','gotim'],'praia-5').log));
// estrelas
const fake=(n,acts)=>({over:'vitoria',stage:'praia-5',actions:acts,allies:[0,1,2].map(i=>({hp:i<n?1:0}))});
assert.deepStrictEqual([fake(1,10),fake(2,10),fake(3,999),fake(3,1)].map(E.stars),[1,2,3,4]);

// recompensas: 1ª vitória e baús uma vez só; batalha não paga duas vezes
let sv=E.newSave(); const b1=run(['folhito','gotim','brasilho'],'praia-1'); assert.strictEqual(b1.over,'vitoria');
const r1=E.applyRewards(sv,b1); assert(r1.first); assert.throws(()=>E.applyRewards(sv,b1));
const g=sv.gold, r2=E.applyRewards(sv,run(['folhito','gotim','brasilho'],'praia-1')); assert(!r2.first && r2.chests.length===0 && sv.gold-g===E.STAGES['praia-1'].rewards.gold);
// desbloqueio em sequência
assert(E.unlocked(sv,'praia-2') && !E.unlocked(sv,'praia-3') && !E.unlocked(sv,'bosque-1'));
// VIT e chances: Comum gasta 6 sem limite; Elite gasta 12 e tem 3 por dia
sv=E.newSave(); let now=new Date(2026,9,6,12).getTime(); assert.strictEqual(E.tryEnter(sv,'praia-1',now),null); assert.strictEqual(E.vitNow(sv,now),E.VIT_MAX-E.VIT_COST);
assert.strictEqual(E.vitNow(sv,now+E.VIT_REGEN_MS*2+5),E.VIT_MAX-E.VIT_COST+2); assert.strictEqual(E.vitNow(sv,now+E.VIT_REGEN_MS*999),E.VIT_MAX);
assert.strictEqual(E.tryEnter(sv,'praia-e1',now),'bloqueada');
sv.stages['praia-1']={best:1,clears:1,chests:[]}; sv.vit={cur:100,at:now};
for(let i=0;i<3;i++) assert.strictEqual(E.tryEnter(sv,'praia-e1',now),null);
assert.strictEqual(E.vitNow(sv,now),100-3*E.VIT_COST_ELITE); assert.strictEqual(E.tryEnter(sv,'praia-e1',now),'chances');
assert.strictEqual(E.chancesLeft(sv,'praia-e1',now+24*3600e3),3,'renova no dia seguinte'); assert.strictEqual(E.chancesLeft(sv,'praia-1',now),Infinity);
assert(!E.unlocked(sv,'praia-e2'),'Elite 2 exige Comum 2'); sv.stages['praia-2']={best:1,clears:1,chests:[]}; assert(!E.unlocked(sv,'praia-e2'),'e exige Elite 1');
sv.vit={cur:5,at:now}; assert.strictEqual(E.tryEnter(sv,'praia-2',now),'vit');
// cada Elite tem um chefe diferente na última onda
const bosses=E.ELITE_ORDER.map(id=>E.STAGES[id].waves.at(-1)[1].split('@')[0]); assert.strictEqual(new Set(bosses).size,40); assert(bosses.every(b=>E.SPECIES[b].boss));

// progressão: Pool de XP, intimidade com limite, Pergaminho, habilidades, transformação
sv=E.newSave(); sv.trainer.lv=99; sv.items={pocaoXP:3, fruta:40, libInt1:3, evoC:2}; sv.gold=5000;
assert.strictEqual(E.fillPool(sv),3); assert.strictEqual(sv.xpPool,300); assert(!sv.items.pocaoXP);
const up=E.levelUp(sv,'brasilho',10); assert(up>0 && sv.owned.brasilho.lv===1+up && sv.xpPool>=0);
const p0=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)));
E.feed(sv,'brasilho',40); assert.strictEqual(sv.owned.brasilho.int,10,'para no limite 10'); assert(sv.items.fruta>0,'sobram frutas no limite');
assert.strictEqual(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)).skills.length,3,'sem habilidade nova antes de avançar');
assert.strictEqual(E.breakCap(sv,'brasilho'),'lancaChamas'); assert.strictEqual(sv.owned.brasilho.cap,20); assert.strictEqual(sv.items.libInt1,1);
assert.deepStrictEqual(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)).skills.slice(3),['lancaChamas']);
assert(E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)))>p0,'intimidade aumenta atributos');
assert(E.upgradeSkill(sv,'brasilho','brasa') && sv.owned.brasilho.sk.brasa===2 && sv.gold===4500);
assert(!E.upgradeSkill(sv,'brasilho','brasa'),'habilidade para no limite 2'); sv.items.libSk1=2; assert.strictEqual(E.libBreak(sv,'brasilho','Sk'),null); assert(E.upgradeSkill(sv,'brasilho','brasa'),'Tomo I libera Nv 4');
assert.strictEqual(E.libNeed(sv.owned.brasilho,'Sk').item,'libSk2'); assert.strictEqual(E.libBreak(sv,'brasilho','Int'),'cedo');
assert.strictEqual(E.canTransform(sv,'brasilho'),'nivel'); sv.owned.brasilho.lv=10; sv.gold=1e5; assert.strictEqual(E.canTransform(sv,'brasilho'),null);
const pb=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho))); assert(E.transform(sv,'brasilho') && sv.owned.brasilho.form===1);
assert(E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)))>pb*1.15,'transformação fortalece'); assert.strictEqual(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)).name,'Brasador');
assert.strictEqual(E.canTransform(sv,'brasilho'),'nivel'); assert.strictEqual(E.FORMS.faiscol.length,4); assert(E.FORMS.faiscol[3].shiny);
assert.deepStrictEqual([0,1,2,3,4,5,6,7].map(E.intNeed),[5,5,5,10,20,30,40,50]);

// BOT: só em instância vencida, gasta VIT e chance da Elite, paga conforme a melhor nota
sv=E.newSave(); now=new Date(2026,9,6,12).getTime();
assert.strictEqual(E.sweep(sv,'praia-1',1,now).why,'naoVencida');
sv.stages['praia-1']={best:2,clears:1,chests:[]}; let g0=sv.gold, sw=E.sweep(sv,'praia-1',10,now);
assert.strictEqual(sw.runs,10); assert.strictEqual(E.vitNow(sv,now),100-60); assert.strictEqual(sv.gold-g0,Math.floor(E.STAGES['praia-1'].rewards.gold*0.7*10));
sw=E.sweep(sv,'praia-1',10,now); assert.strictEqual(sw.runs,5); assert.strictEqual(sw.why,'vit');
sv.vit={cur:100,at:now}; sv.stages['praia-e1']={best:4,clears:1,chests:[]}; sv.elite['praia-e1']={day:'x',used:0};
sw=E.sweep(sv,'praia-e1',10,now); assert.strictEqual(sw.runs,3,'Elite respeita 3 por dia'); assert.strictEqual(sw.why,'chances');
// Farm: igual à batalha online, idempotente, limite de 8 h, equipe congelada no início
sv=E.newSave(); sv.stages['praia-1']={best:4,clears:1,chests:[]};
assert.strictEqual(E.startFarm(sv,'praia-e1',now).why,'elite'); const fst=E.startFarm(sv,'praia-1',now); assert(fst.farm);
const online=E.simulate(['brasilho','folhito','gotim'],'praia-1',E.progMap(sv)); assert.strictEqual(online.over,'vitoria'); assert.strictEqual(sv.farm.cycleMs, Math.max(15*60e3, online.actions*2000)); assert.strictEqual(sv.farm.stars, E.stars(online));
const c1=E.collectFarm(sv,now+sv.farm.cycleMs*5+10); assert.strictEqual(c1.runs,5); assert.strictEqual(E.collectFarm(sv,now+sv.farm.cycleMs*5+10).runs,0,'coletar de novo não duplica');
const c2=E.collectFarm(sv,now+sv.farm.cycleMs*6); assert.strictEqual(c2.runs,1,'sobra do ciclo incompleto foi guardada');
sv.team=['casculo','casculo','casculo']; const c3=E.collectFarm(sv,now+sv.farm.cycleMs*6+20*3600e3); assert(c3.capped && c3.counted<=E.FARM_CAP_MS && c3.discarded>0);
assert.strictEqual(c3.runs,Math.floor(E.FARM_CAP_MS/sv.farm.cycleMs)); assert.deepStrictEqual(sv.farm.team,['brasilho','folhito','gotim'],'troca de equipe não muda o farm em andamento');

// Arena: 3 adversários acima, Trocar, cooldown entre lutas, 5 por dia, troca de lugar, série de vitórias, Adorar
sv=E.newSave(); now=new Date(2026,9,6,12).getTime(); E.arenaState(sv,now);
assert.strictEqual(E.myRank(sv),100); let tg=E.arenaTargets(sv); assert.strictEqual(tg.length,3); assert(tg.every(r=>r<100&&r>=75));
E.arenaSwap(sv); assert.notDeepStrictEqual(E.arenaTargets(sv),tg,'Trocar sorteia outros'); tg=E.arenaTargets(sv);
assert(E.npcPower(E.npcOf(1))>E.npcPower(E.npcOf(50)) && E.npcPower(E.npcOf(50))>E.npcPower(E.npcOf(99)));
assert.strictEqual(E.arenaEnter(sv,3,now).why,'alvo');
const tr=tg[0], en=E.arenaEnter(sv,tr,now); assert(!en.why); assert.strictEqual(E.arenaEnter(sv,E.arenaTargets(sv)[0],now+60e3).why,'cooldown');
const ab=E.newBattle(sv.team,'arena',E.progMap(sv),en.npc.team); ab.over='vitoria';
const ar=E.arenaResolve(sv,ab,tr); assert(ar.win && ar.to===tr,'trocou de lugar'); assert.throws(()=>E.arenaResolve(sv,ab,tr));
assert.deepStrictEqual([sv.arena.stats.battles,sv.arena.stats.wins,sv.arena.stats.streak,sv.arena.stats.dayStreak],[1,1,1,1]);
let t2=now; for(let i=0;i<4;i++){ t2+=E.ARENA_CD_MS; assert(!E.arenaEnter(sv,E.arenaTargets(sv)[0],t2).why); } t2+=E.ARENA_CD_MS; assert.strictEqual(E.arenaEnter(sv,E.arenaTargets(sv)[0],t2).why,'limite');
const d1=E.claimArenaDaily(sv,now); assert(d1 && d1.bonus===0); assert.strictEqual(E.claimArenaDaily(sv,now),null);
assert.deepStrictEqual([4,5,10,15].map(E.streakBonus),[0,10,20,30]);
// série de dias: vitória amanhã soma; pular um dia zera
const tom=now+864e5; E.arenaState(sv,tom); const b2=E.newBattle(sv.team,'arena',{},E.npcOf(99).team); b2.over='vitoria'; E.arenaResolve(sv,b2,E.arenaTargets(sv)[0]); assert.strictEqual(sv.arena.stats.dayStreak,2);
E.arenaState(sv,now+3*864e5); assert.strictEqual(sv.arena.stats.dayStreak,0,'pulou um dia');
const v0=sv.vit.cur; assert.strictEqual(E.adore(sv,1,now+3*864e5),null); assert.strictEqual(E.adore(sv,1,now+3*864e5),'feito'); assert.strictEqual(E.adore(sv,5,now+3*864e5),'rank'); assert.strictEqual(sv.vit.cur,v0+10);
const lb=E.newBattle(sv.team,'arena',E.progMap(sv),E.npcOf(1).team); while(!lb.over){const u=E.current(lb);E.act(lb,...E.choose(lb,u).slice(0,2));} assert.notStrictEqual(lb.over,'vitoria','time inicial perde do 1º');
const rk=E.myRank(sv); const lr=E.arenaResolve(sv,lb,1); assert(!lr.win && lr.to===rk && sv.arena.stats.streak===0);

// Loja: ofertas fixas na hora, compra única, atualizar troca; Arena com limite diário; lendário com 50 fragmentos
sv=E.newSave(); sv.gold=100000; now=new Date(2026,9,6,12,10).getTime();
const o1=E.shopOffers(sv,now), shopSp=o1[0].sp; assert.strictEqual(o1.length,12); assert(E.SPECIES[shopSp].dex && E.SPECIES[shopSp].grade==='A'); assert.deepStrictEqual(E.shopOffers(sv,now+60e3).map(o=>o.price),o1.map(o=>o.price),'mesma hora, mesmas ofertas');
assert.strictEqual(E.buyShop(sv,0,now),null); assert.strictEqual(sv.frags[shopSp],5,'loja vende fragmentos, não a criatura'); assert.strictEqual(E.buyShop(sv,0,now),'vendido');
const after=E.shopOffers(sv,now); assert(after[0].sold && after.slice(1).every(o=>!o.sold),'só a oferta comprada fica vendida');
assert.notStrictEqual(E.shopOffers(sv,now+3600e3)[0].sp,shopSp,'criatura que já tem não volta');
const g1=sv.gold; assert.strictEqual(E.rerollShop(sv,now),null); assert.strictEqual(g1-sv.gold,200); assert.strictEqual(E.rerollShop(sv,now),null); assert.strictEqual(g1-sv.gold,600);
sv.gold=0; assert.strictEqual(E.buyShop(sv,1,now),'ouro');
sv.items.medalha=1000; const ao=E.arenaOffers(sv,now); assert.strictEqual(ao.length,12); assert.strictEqual(ao[0].item,'frag'); assert(E.featuredS(now).includes(ao[0].sp));
assert.strictEqual(E.buyArena(sv,0,now),null); assert.strictEqual(E.buyArena(sv,0,now),'vendido'); assert.strictEqual(sv.frags[ao[0].sp],1);
assert.strictEqual(E.rerollArenaShop(sv,now),null); assert.strictEqual(sv.items.medalha,880); assert(!E.arenaOffers(sv,now)[0].sold,'atualizar libera de novo');
assert.deepStrictEqual(E.arenaOffers(sv,now+864e5).map(o=>o.sold),Array(12).fill(false),'renova no dia seguinte');
const fS=E.featuredS(now); assert.strictEqual(new Set(fS).size,3); assert(fS.every(x=>E.SPECIES[x].grade==='S'));
sv.frags={}; assert.strictEqual(E.summonS(sv,fS[0],now),'fragmentos'); sv.frags[fS[0]]=40; sv.items.fragU=15;
assert.strictEqual(E.summonS(sv,fS[0],now),null,'específicos + universais'); assert(sv.owned[fS[0]] && !sv.frags[fS[0]] && sv.items.fragU===5); assert.strictEqual(E.summonS(sv,fS[0],now),'tem');

// Diamantes: 4★ pela 1ª vez paga uma vez; Arena diária paga; cápsulas; loja; VIT 3x; entrada extra Elite
sv=E.newSave(); now=new Date(2026,9,6,12).getTime();
const fake4={over:'vitoria',stage:'praia-1',actions:1,allies:[0,1,2].map(i=>({hp:1,sp:['brasilho','folhito','gotim'][i]}))};
E.applyRewards(sv,fake4); assert.strictEqual(sv.diamonds,E.DIA_4STAR); E.applyRewards(sv,{...fake4,rewarded:false}); assert.strictEqual(sv.diamonds,E.DIA_4STAR,'só uma vez');
E.arenaState(sv,now); const dd=E.claimArenaDaily(sv,now); assert.strictEqual(sv.diamonds,E.DIA_4STAR+dd.dia); assert.strictEqual(dd.dia,30);
assert(!E.spinCapsule(sv,'comum',1,now,()=>0).why); sv.gold=0; assert.strictEqual(E.spinCapsule(sv,'comum',1,now).why,'ouro','sem grátis e sem ouro'); sv.gold=10500; assert(!E.spinCapsule(sv,'comum',10,now,()=>0).why); assert.strictEqual(sv.gold,500,'×10 custa 10 mil de ouro'); assert.strictEqual(E.freeLeft(sv,now+59*60e3),0); assert.strictEqual(E.freeLeft(sv,now+3600e3),1);
sv.diamonds=1000; const px0=sv.items.pocaoXP; const sp=E.spinCapsule(sv,'raro',10,now,()=>0.8); assert.strictEqual(sp.got.length,10); assert.strictEqual(sv.diamonds,100); assert.strictEqual(sv.items.pocaoXP-px0,200);
assert.strictEqual(E.spinCapsule(sv,'raro',10,now).why,'diamantes');
sv.diamonds=1000; for(let i=0;i<3;i++) assert.strictEqual(E.buyVit(sv,now),null); assert.strictEqual(E.buyVit(sv,now),'limite'); assert.strictEqual(sv.diamonds,1000-50-100-150); assert.strictEqual(E.vitNow(sv,now),E.VIT_MAX+90);
sv.stages['praia-1']={best:1,clears:1,chests:[]}; sv.vit={cur:200,at:now}; for(let i=0;i<3;i++) E.tryEnter(sv,'praia-e1',now); assert.strictEqual(E.tryEnter(sv,'praia-e1',now),'chances');
assert.strictEqual(E.buyEliteEntry(sv,'praia-e1',now),null); assert.strictEqual(E.chancesLeft(sv,'praia-e1',now),1); assert.strictEqual(E.tryEnter(sv,'praia-e1',now),null);
E.buyEliteEntry(sv,'praia-e1',now); E.buyEliteEntry(sv,'praia-e1',now); assert.strictEqual(E.buyEliteEntry(sv,'praia-e1',now),'limite');
assert.strictEqual(E.chancesLeft(sv,'praia-e1',now+864e5),3,'extra não passa para o outro dia');
sv.diamonds=0; assert.strictEqual(E.buyDia(sv,'crist'),'diamantes'); sv.diamonds=60; assert.strictEqual(E.buyDia(sv,'crist'),null);

// Equipamentos: equipar troca, atributos somam, efeito só em +3, Amplificar custa ouro
sv=E.newSave(); sv.gold=100000; const gq1=E.newGear(sv,'carvao'), gq2=E.newGear(sv,'garras');
const pw0=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)));
assert.strictEqual(E.equipGear(sv,'brasilho',gq1.id),null); assert.strictEqual(sv.gear.length,1);
assert(E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)))>pw0);
let ub=E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)); assert.strictEqual(ub.gearTypes,null,'efeito só em +3');
for(let i=0;i<3;i++) assert.strictEqual(E.amplify(sv,sv.owned.brasilho.equip),null); assert.strictEqual(sv.gold,100000-E.ampCost(0)-E.ampCost(1)-E.ampCost(2)); { const gx={plus:5}; sv.gold=1e6; assert.strictEqual(E.amplify(sv,gx,()=>0.99),'falhou'); assert.strictEqual(gx.plus,5,'falha não perde nível'); assert.strictEqual(E.amplify(sv,gx,()=>0),null); assert.strictEqual(gx.plus,6); }
ub=E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)); assert.deepStrictEqual(ub.gearTypes,['Fogo']);
assert.strictEqual(E.equipGear(sv,'brasilho',gq2.id),null); assert.strictEqual(sv.owned.brasilho.equip.kind,'garras'); assert.strictEqual(sv.gear[0].kind,'carvao','o anterior volta para a bolsa');
assert.strictEqual(E.unequipGear(sv,'brasilho'),null); assert.strictEqual(sv.gear.length,2);
// Fusão: sacrifica fora do time, sobe nível, aumenta atributos, devolve equipamento do sacrificado
sv=E.newSave(); sv.gold=50000; sv.owned.siriz={...sv.owned.casculo}; E.equipGear(sv,'casculo',E.newGear(sv,'metal').id);
assert.strictEqual(E.fuse(sv,'brasilho',['folhito']).why,'time'); assert.strictEqual(E.fuse(sv,'brasilho',['brasilho']).why,'material');
const pf=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)));
sv.owned.casculo.lv=10; const fr=E.fuse(sv,'brasilho',['casculo']); assert(!fr.why && fr.up===1 && sv.owned.brasilho.fus===1 && !sv.owned.casculo && sv.gold===50000-E.FUS_COST);
assert.strictEqual(sv.gear.length,1,'equipamento do sacrificado volta'); assert(E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)))>pf);
assert.strictEqual(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)).name,'Brasilho +1');
assert(!E.fuse(sv,'brasilho',['siriz']).why); sv.team=['brasilho','folhito']; assert.strictEqual(E.fuse(sv,'brasilho',['gotim']).why,'minimo','precisa sobrar 3 monstros'); sv.team=['brasilho','folhito','gotim'];
sv.items.cartaFus=5; const fc=E.fuse(sv,'brasilho',[],5); assert(!fc.why && fc.xp===100);
// Depósito: espécie repetida ou depósito cheio vira carta
sv=E.newSave(); assert.strictEqual(E.addCreature(sv,'siriz'),'novo'); assert.strictEqual(E.addCreature(sv,'siriz'),'carta'); assert.strictEqual(sv.items.cartaFus,1);
// drops: com rnd fixo baixo, captura e equipamento acontecem
sv=E.newSave(); const bd=run(['brasilho','folhito','gotim'],'praia-1'); const rd=E.applyRewards(sv,bd,()=>0);
assert(rd.captured && sv.owned[rd.captured.sp] && !rd.gear && !rd.items.feno,'Comum: sem equipamento e sem feno');
assert.deepStrictEqual(Object.keys(E.STAGES['praia-3'].rewards.items).sort(),['fruta','pocaoXP']);
const e5={over:'vitoria',stage:'praia-e5',actions:999,allies:[0,1,2].map(i=>({hp:1,sp:['brasilho','folhito','gotim'][i]}))}, re5=E.applyRewards(sv,e5,()=>0);
assert(re5.gear && re5.items.evoC>=1 && re5.items.pocaoXP>0,'Elite 5: carta de evolução + chance de equipamento');
const e3={...e5,stage:'praia-e3',rewarded:false}, re3=E.applyRewards(sv,e3,()=>0); assert(!re3.gear && !re3.items.evoC && re3.items.pocaoXP>0,'Elite 1-4: só XP');
// Exploração: 2 salas × 6 ranks, libera em sequência, drop por rank, BOT
sv=E.newSave(); now=new Date(2026,9,6,12).getTime(); assert.strictEqual(E.EXPL_ORDER.length,12); assert.strictEqual(E.tryEnter(sv,'expl-descanso-C',now),'bloqueada');
sv.stages['praia-5']={best:1,clears:1,chests:[]}; assert.strictEqual(E.tryEnter(sv,'expl-descanso-C',now),null); assert.strictEqual(E.vitNow(sv,now),E.VIT_MAX-12);
assert(!E.unlocked(sv,'expl-descanso-B')); const ex={over:'vitoria',stage:'expl-descanso-C',actions:999,allies:[0,1,2].map(i=>({hp:1,sp:['brasilho','folhito','gotim'][i]}))};
const rex=E.applyRewards(sv,ex,()=>0.9); assert.strictEqual(rex.items.evoC,1); assert(E.unlocked(sv,'expl-descanso-B') && !E.unlocked(sv,'expl-vazio-B'));
const sx=E.sweep(sv,'expl-descanso-C',3,now); assert.strictEqual(sx.runs,3); assert.strictEqual(sv.items.evoC,4);
sv.stages['expl-vazio-SS']={best:4,clears:1}; sv.stages['expl-vazio-SSS']={best:4,clears:1}; sv.vit={cur:100,at:now}; const sv2=E.sweep(sv,'expl-vazio-SSS',10,now); assert.strictEqual(sv2.runs,2); assert.strictEqual(sv.items.cartaFus,12);
assert.strictEqual(E.startFarm(sv,'expl-descanso-C',now).why,'elite');
// fusão com limite por faixa
sv=E.newSave(); sv.gold=1e6; sv.items.cartaFus=50; assert(!E.fuse(sv,'brasilho',[],50).why); assert.strictEqual(sv.owned.brasilho.fus,2,'para no +2'); assert.strictEqual(E.fuse(sv,'brasilho',[],0).why,'limite');
sv.items.libFus1=2; assert.strictEqual(E.libBreak(sv,'brasilho','Fus'),null); assert.strictEqual(E.fusCapOf(sv.owned.brasilho),4);
// Cápsula: fragmentos de criaturas sorteadas, nunca o Universal
sv=E.newSave(); sv.diamonds=1000; const cf=E.spinCapsule(sv,'raro',1,now,()=>0.1); assert(cf.got[0].item==='frag' && sv.frags[cf.got[0].sp]===5 && !sv.items.fragU);

// Pokédex no jogo: tipos duplos, golpes por afinidade, evolução pela ficha, obtenção, Pokédex do jogador
assert.strictEqual(E.DEX_BASES.length,267); assert.strictEqual(E.POOL.masmorra.length+E.POOL.sorteio.length+E.POOL.arena.length,267);
assert(E.POOL.arena.every(x=>E.SPECIES[x].grade==='S') && E.POOL.sorteio.every(x=>E.SPECIES[x].grade!=='S'));
assert.strictEqual(E.eff('Água',['Fogo','Pedra']),4); assert.strictEqual(E.eff('Normal','Fantasma'),0,'imunidade real, como no vídeo');
for(const r of E.REGIONS) for(const st of r.stages) for(const w of st.waves) for(const f of w){ const sp=f.replace('!','').split('@')[0], S=E.SPECIES[sp]; assert(!E.WILD_MULT || S.boss || (S.dex && E.REGION_TYPES[r.id].includes(S.type)), 'selvagem fora do tema: '+f); }
const pel=E.STARTERS[2]; let pu=E.mkUnit(pel,'A',0,{lv:1,cap:10}); assert.deepStrictEqual(pu.types,['Normal','Fada']); assert.strictEqual(pu.skills.length,3,'básico + golpes de afinidade 0 e 5');
assert(E.skillPlan(pel).some(x=>x.cap===20),'afinidade 10 libera no limite 20');
sv=E.newSave(pel); assert.strictEqual(Object.keys(sv.owned).length,3,'começa com as 3 iniciais'); assert.strictEqual(sv.team[0],pel,'a escolhida lidera'); assert.strictEqual(sv.team.length,3); assert.strictEqual(sv.dex[E.SPECIES[pel].dex],2);
const R2=E.transformReq(pel,2); assert(R2.int>0,'2ª evolução pede intimidade'); sv.owned[pel].lv=50; sv.items[E.evoCardOf(pel)]=99; sv.gold=1e5;
assert.strictEqual(E.canTransform(sv,pel),null); assert(E.transform(sv,pel)); assert.strictEqual(E.canTransform(sv,pel),'intimidade');
assert.strictEqual(sv.dex[E.FORMS[pel][0].dex],2,'forma evoluída marcada na Pokédex'); assert.strictEqual(E.mkUnit(pel,'A',0,E.progOf(sv.owned[pel])).name,E.FORMS[pel][0].name);
const wild=E.mkUnit(E.POOL.masmorra[5],'E',0,1), mine=E.mkUnit(E.POOL.masmorra[5],'A',0,1); assert(wild.st.hp<mine.st.hp,'selvagem é mais fraco');
sv=E.newSave(); sv.diamonds=1000; const capR=E.spinCapsule(sv,'raro',10,now,()=>0.97); assert(capR.got.every(p=>p.item==='creature' && E.POOL.sorteio.includes(p.sp)));

// Montaria: ganha na Praia 5, Feno sobe nível, bônus vale para todos, equipamentos e outras montarias com diamantes
sv=E.newSave(); assert.strictEqual(E.mountBonus(sv),0);
const p5={over:'vitoria',stage:'praia-5',actions:1,allies:[0,1,2].map(i=>({hp:1,sp:['brasilho','folhito','gotim'][i]}))}; const r5=E.applyRewards(sv,p5,()=>0.99);
assert.strictEqual(r5.mount,'cabrito'); assert.strictEqual(sv.mount.cur,'cabrito'); const mb0=E.mountBonus(sv); assert(Math.abs(mb0-.02)<1e-9);
const pw1=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho,sv))), pw0b=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)));
assert(pw1>pw0b,'montaria aumenta o poder');
sv.items.feno=30; const fm=E.feedMount(sv,30); assert(fm.up>=2 && sv.mount.lv===1+fm.up); assert(E.mountBonus(sv)>mb0);
// montaria evolui no Nv máx. (não se compra) e o bônus nunca cai; trajes se compram e somam atributos
sv.mount.lv=E.MOUNT_LV_MAX-1; sv.mount.exp=0; sv.items.feno=9999; const bBefore=E.mountBonus(sv); const fe=E.feedMount(sv,9999);
assert.deepStrictEqual(fe.evo.slice(0,1),['lagarto']); assert(sv.mount.cur!=='cabrito'); assert(E.mountBonus(sv)>bBefore,'evoluir não diminui o bônus');
sv.mount.cur='lobo'; sv.mount.lv=E.MOUNT_LV_MAX; sv.items.feno=5; assert.strictEqual(E.feedMount(sv,5).used,0,'final no máximo não gasta feno');
sv.diamonds=400; assert.strictEqual(E.buyMountSkin(sv,'glacial'),'diamantes'); assert.strictEqual(E.buyMountSkin(sv,'dourado'),null); assert.strictEqual(E.buyMountSkin(sv,'dourado'),'tem');
const pwS0=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho,sv))); sv.mount.skins=[]; const pwS1=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho,sv))); assert(pwS0>pwS1,'traje comprado soma atributos'); sv.mount.skins=['dourado'];
// títulos: cada conquistado soma atributos; de ranking só vale o melhor e enquanto estiver na posição
{ const t=E.newSave(); const b0=E.extraBonus(t); t.stages['praia-5']={best:1,clears:1,chests:[]}; t.stages['templo-p5']={best:1,clears:1,chests:[]}; const b1=E.extraBonus(t); assert(b1.hp>(b0.hp||0) && b1.atk>0);
  E.arenaState(t,Date.now()); const L=t.arena.ladder, i=L.indexOf('me'); L.splice(i,1); L.unshift('me'); const b2=E.extraBonus(t); assert(Math.abs((b2.atk-b1.atk)-.05)<1e-9,'1º da Arena vale só o maior título de ranking'); }
// Acessórios: só na Dungeon; peça no slot certo; 2 e 3 peças ativam bônus do conjunto; fusão devolve
sv=E.newSave(); const a1=E.dropAcc(sv,0,()=>0); assert.strictEqual(E.ACC_SETS[a1.set].grade,'B'); assert.strictEqual(E.dropAcc(sv,4,()=>0.99).set in E.ACC_SETS,true);
const mk=(set,slot)=>{ const a={id:++sv.accSeq,set,slot}; sv.acc.push(a); return a; };
const pa=E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)));
E.equipAcc(sv,'brasilho',mk('marte',0).id); const one=E.accBonus(sv.owned.brasilho.acc); assert.deepStrictEqual(one.pct,{});
E.equipAcc(sv,'brasilho',mk('marte',1).id); assert.strictEqual(E.accBonus(sv.owned.brasilho.acc).pct.atk,.08);
E.equipAcc(sv,'brasilho',mk('marte',2).id); const three=E.accBonus(sv.owned.brasilho.acc); assert(three.pct.atk===.08 && three.pct.hp===.08);
assert(E.power(E.mkUnit('brasilho','A',0,E.progOf(sv.owned.brasilho)))>pa); const n0=sv.acc.length; E.equipAcc(sv,'brasilho',mk('trovao',0).id); assert.strictEqual(sv.acc.length,n0+1,'anterior volta para a bolsa');
assert.strictEqual(E.unequipAcc(sv,'brasilho',1),null); sv.gold=1e5; sv.team=['folhito','gotim','casculo']; E.fuse(sv,'folhito',['brasilho']); assert(sv.acc.length>=n0+2,'fusão devolve acessórios');
// Dungeon: libera após Caverna 5, 3 entradas por dia por andar, sempre dropa acessório, sem farm offline
sv=E.newSave(); now=new Date(2026,9,6,12).getTime(); assert.strictEqual(E.tryEnter(sv,'dungeon-1',now),'bloqueada');
sv.stages['caverna-5']={best:1,clears:1,chests:[]}; sv.vit={cur:100,at:now}; for(let i=0;i<3;i++) assert.strictEqual(E.tryEnter(sv,'dungeon-1',now),null); assert.strictEqual(E.tryEnter(sv,'dungeon-1',now),'chances');
assert(!E.unlocked(sv,'dungeon-2')); assert(!E.STAGE_ORDER.includes('dungeon-1') && !E.ELITE_ORDER.includes('dungeon-1'));
const dg={over:'vitoria',stage:'dungeon-1',actions:999,allies:[0,1,2].map(i=>({hp:1,sp:['brasilho','folhito','gotim'][i]}))}; const rdg=E.applyRewards(sv,dg,()=>0.5);
assert(rdg.acc && sv.acc.length===1); assert(E.unlocked(sv,'dungeon-2')); assert.strictEqual(Object.keys(rdg.items).filter(k=>/^lib\w+1$/.test(k)).length,1,'andar 1 dropa item de liberação faixa I'); assert.strictEqual(E.startFarm(sv,'dungeon-1',now).why,'elite');
// save v7 → v8: ganha bolsa de acessórios e a montaria se já venceu a Praia 5
const old={v:7,owned:{brasilho:{lv:3}},items:{},stages:{'praia-5':{best:2,clears:1}}}; E.migrate(old); assert.strictEqual(old.v,11); assert.deepStrictEqual(old.mount.have,['cabrito']); assert.deepStrictEqual(old.owned.dex20151.acc,[null,null,null]);

// Eventos: Desafio Semanal (só o tipo da semana, até 10 Universais), fim de semana (VIT ½), marcos, dica de derrotas, Arena acompanha o treinador
{ const now=new Date(2026,9,6,12).getTime(), sat=new Date(2026,9,10,12).getTime(); const st=E.weeklySetup(now,20); let s2=E.newSave();
  assert(E.WEEK_TYPES.includes(st.wtype)); s2.owned={}; s2.team=[]; const ok=E.POOL.masmorra.filter(x=>E.SPECIES[x].types.includes(st.wtype)).slice(0,3), no=E.POOL.masmorra.find(x=>!E.SPECIES[x].types.includes(st.wtype));
  assert.strictEqual(E.weeklyTeamWhy(ok),null); assert.strictEqual(E.weeklyTeamWhy([...ok.slice(0,2),no]),'tipo');
  assert.strictEqual(E.weeklyClaim(s2,2,now),5); assert.strictEqual(E.weeklyClaim(s2,4,now),5); assert.strictEqual(E.weeklyClaim(s2,4,now),0,'uma vez por semana'); assert.strictEqual(E.weeklyClaim(s2,1,now+7*864e5),2,'renova na semana seguinte');
  const wr=E.weekendRegion(sat); assert(wr && !E.weekendRegion(now)); const sid=wr+'-1'; assert.strictEqual(E.vitCost(sid,sat),Math.ceil(E.VIT_COST/2)); assert.strictEqual(E.vitCost(sid,now),E.VIT_COST);
  s2=E.newSave(); const lose={over:'derrota',stage:'praia-2',actions:5,allies:[{hp:0,sp:'brasilho'}]}; for(let i=0;i<3;i++) E.applyRewards(s2,{...lose}); assert.strictEqual(s2.losses['praia-2'],3);
  E.applyRewards(s2,{over:'vitoria',stage:'praia-2',actions:999,allies:[0,1,2].map(i=>({hp:1,sp:['brasilho','folhito','gotim'][i]}))},()=>0.99); assert(!s2.losses['praia-2'],'vitória zera a contagem');
  for(let i=1;i<=4;i++) s2.stages['praia-e'+i]={best:1,clears:1,chests:[]}; s2.stages['praia-5']={best:1,clears:1,chests:[]}; const u0=s2.items.fragU||0;
  E.applyRewards(s2,{over:'vitoria',stage:'praia-e5',actions:999,allies:[0,1,2].map(i=>({hp:1,sp:['brasilho','folhito','gotim'][i]}))},()=>0.99); assert.strictEqual((s2.items.fragU||0)-u0,E.ELITE_MILE,'marco: Elite da região completa');
  E.arenaState({trainer:{lv:10}},now); const p10=E.npcPower(E.npcOf(1)); E.arenaState({trainer:{lv:50}},now); assert(E.npcPower(E.npcOf(1))>p10*1.5,'rivais acompanham o treinador'); E.arenaState({trainer:{lv:20}},now);
  console.log('eventos OK'); }
{ const now=new Date(2026,9,6,12).getTime(); let s3=E.newSave(); s3.vit={cur:120,at:now};
  assert.strictEqual(E.NM_ORDER.length,40); assert(!E.unlocked(s3,'praia-p1')); s3.stages['praia-e1']={best:1,clears:1,chests:[]}; assert(E.unlocked(s3,'praia-p1') && !E.unlocked(s3,'praia-p2'));
  assert.strictEqual(E.tryEnter(s3,'praia-p1',now),null); assert.strictEqual(E.vitNow(s3,now),100,'Pesadelo custa 20');
  assert(E.STAGES['templo-p5'].dm>0 && E.ELITE_ORDER.every(id=>!E.STAGES[id].nightmare),'Pesadelo fora da lista Elite');
  // Torre: regra de time, sem VIT, 5 tentativas, avança um andar por vez, prêmio a cada 5
  s3=E.newSave(); s3.stages['caverna-5']={best:1,clears:1,chests:[]}; const st=E.towerSetup(1); assert.strictEqual(st.rule.k,'tipo');
  s3.team=E.POOL.masmorra.filter(x=>!E.SPECIES[x].types.includes(st.rule.T)).slice(0,3); assert.strictEqual(E.tryEnter(s3,'torre',now),'regra');
  s3.team=E.POOL.masmorra.filter(x=>E.SPECIES[x].types.includes(st.rule.T)).slice(0,3); const v0=E.vitNow(s3,now); assert.strictEqual(E.tryEnter(s3,'torre',now),null); assert.strictEqual(E.vitNow(s3,now),v0,'Torre não gasta VIT');
  for(let n=1;n<=5;n++){ E.towerSetup(n); E.applyRewards(s3,{over:'vitoria',stage:'torre',actions:999,allies:[0,1,2].map(i=>({hp:1,sp:['brasilho','folhito','gotim'][i]}))},()=>0.99); }
  assert.strictEqual(E.towerFloor(s3),5); assert.strictEqual(s3.items.fragU,1); assert.strictEqual(E.towerRule(10).k,'livre'); assert.strictEqual(E.towerTeamWhy(['a','b','c'],{k:'dois'}),'regra');
  // Guilda: doação 1x por dia, moedas, loja por nível e limite semanal, chefe dá moedas pelo dano
  s3=E.newSave(); s3.gold=50000; assert.strictEqual(E.guildDonate(s3,'ouro',now),null); assert.strictEqual(E.guildDonate(s3,'presenca',now),'feito'); assert.strictEqual(s3.items.moedaG,60);
  s3.items.moedaG=1000; for(let i=0;i<3;i++) assert.strictEqual(E.buyGuild(s3,'g1',now),null); assert.strictEqual(E.buyGuild(s3,'g1',now),'limite'); assert.strictEqual(E.buyGuild(s3,'g16',now),'nivel');
  E.guildBossSetup(s3,now); const gb=E.newBattle(['brasilho','folhito','gotim'],'gboss',{}); gb.foes[0].hp-=4000; gb.over='derrota'; const gr=E.applyRewards(s3,gb); assert(gr.gboss.dmg>=4000 && gr.gboss.coins===Math.floor(gr.gboss.dmg/400));
  console.log('pesadelo/torre/guilda OK'); }
{ // Mega: evolução depois da forma final, pede Pedra Mega; BOSS Global abre às 20h e dá pedras pelo ranking
  const sp='dex20161', s4=E.newSave(); s4.trainer.lv=99; s4.owned[sp]={...E.newSave().owned[Object.keys(E.newSave().owned)[0]], lv:60, int:50, cap:50, form:E.FORMS[sp].length-1}; s4.gold=1e6;
  assert(E.FORMS[sp].at(-1).mega && E.MEGA_OF[sp]===20164); assert.strictEqual(E.canTransform(s4,sp),'pedra'); E.giveStone(s4,sp,1); assert.strictEqual(E.canTransform(s4,sp),null);
  assert(E.transform(s4,sp) && s4.owned[sp].form===E.FORMS[sp].length && !E.megaStones(s4,sp)); assert.strictEqual(E.canTransform(s4,sp),'max'); assert.strictEqual(s4.dex[20164],2,'Mega no Livro');
  const t19=new Date(2026,9,8,19).getTime(), t21=new Date(2026,9,8,21).getTime(); assert(!E.bgOpen(t19) && E.bgOpen(t21));
  const s5=E.newSave(); s5.stages['caverna-5']={best:1,clears:1,chests:[]}; E.bgSetup(t19,20); assert.strictEqual(E.tryEnter(s5,'bglobal',t19),'fechado'); E.bgSetup(t21,20); assert.strictEqual(E.tryEnter(s5,'bglobal',t21),null);
  assert.notStrictEqual(E.bgBossOf(t21).id, E.bgBossOf(t21+864e5).id,'chefe muda todo dia'); const NB=E.MEGA_BOSSES.length; assert.strictEqual(E.bgBossOf(t21).id, E.bgBossOf(t21+NB*864e5).id,'calendário gira por todas as Megas'); assert(NB>=7);
  const S=E.bgState(s5,t21); S.dmg=1e9; const M=E.bgBossOf(t21); E.bgState(s5,t21+864e5); const cl=E.bgClaim(s5,t21+864e5); assert(cl && cl.rank===1 && cl.n===3 && s5.stones[M.sp]===3); assert.strictEqual(E.bgClaim(s5,t21+864e5),null,'uma vez');
  { // família com 2 Megas: escolhe uma, não passa para a outra
    const m='dex21141'; if(E.megaIdx(m).length>1){ const s6=E.newSave(); s6.trainer.lv=99; s6.owned[m]={...s4.owned[sp], form:E.normalForms(m)}; s6.gold=1e6; s6.items.pedraMU=2;
      const [a,b]=E.megaIdx(m); assert.strictEqual(E.canTransform(s6,m,b),null); assert(E.transform(s6,m,b) && s6.owned[m].form===b); assert.strictEqual(E.canTransform(s6,m),'max'); assert.strictEqual(E.canTransform(s6,m,a),'max'); } }
  { const o={v:10,owned:{dex20151:{lv:5}},items:{},stages:{},dex:{},diamonds:0,mount:{have:['cabrito','grifo'],cur:'cabrito',lv:12,exp:3,gear:{sela:1,manta:1}}}; E.migrate(o);
    assert.strictEqual(o.v,11); assert.strictEqual(o.mount.cur,'grifo'); assert.deepStrictEqual(o.mount.have,['cabrito','lagarto','grifo']); assert.strictEqual(o.diamonds,400,'equipamentos de montaria viram diamantes'); assert(!o.mount.gear); }
  { const t=E.newSave(); t.diamonds=900; const b0=E.extraBonus(t).atk||0; assert.strictEqual(E.buyTrainerSkin(t,'S'),null); assert.strictEqual(t.costume,'S'); assert(E.extraBonus(t).atk>b0,'fantasia soma atributos');
    assert.strictEqual(E.buyTrainerSkin(t,'G'),'diamantes'); assert.strictEqual(E.wearTrainerSkin(t,'G'),'nao'); assert.strictEqual(E.wearTrainerSkin(t,null),null); assert(E.extraBonus(t).atk>b0,'vale mesmo sem vestir'); }
  console.log('mega/boss global OK'); }
for(const id in DM0) E.STAGES[id].dm=DM0[id];
// campanha simulada no Auto, começando só com a criatura inicial: equipe = melhor trio entre as 6 mais fortes; se nenhuma vence, repete a fase anterior
const combos=o=>{const k=Object.keys(o).sort((a,b)=>E.power(E.mkUnit(b,'A',0,E.progOf(o[b])))-E.power(E.mkUnit(a,'A',0,E.progOf(o[a])))).slice(0,6),out=[];
  if(k.length<3) return [k]; for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++)for(let l=j+1;l<k.length;l++)out.push([k[i],k[j],k[l]]);return out;};
const lv=()=>Object.fromEntries(Object.entries(sv.owned).map(([k,v])=>[k,E.progOf(v)]));
const grow=t=>{ E.fillPool(sv); for(let i=0;i<40;i++) for(const x of t) E.levelUp(sv,x,1); for(const x of t){ E.feed(sv,x,99); E.breakCap(sv,x); E.feed(sv,x,99); while(E.transform(sv,x)); } }; // jogador usa Pool, frutas, pergaminhos e evolui
const rng=(seed=>()=>(seed=(seed*1664525+1013904223)%4294967296)/4294967296)(7);
// conteúdo lateral que o jogador também faz: Exploração (cartas) e Dungeon (itens de liberação), no rank mais alto que vence
const side=(lastTeam)=>{ for(const ids of [E.EXPL_ORDER.filter(id=>id.includes('descanso')), E.EXPL_ORDER.filter(id=>id.includes('vazio')), [1,2,3,4,5].map(i=>'dungeon-'+i)]){
  for(const id of ids.slice().reverse()){ if(!E.unlocked(sv,id)) continue; const bb=run(lastTeam,id,lv()); if(bb.over==='vitoria'){ E.applyRewards(sv,bb,rng); break; } } }
  for(const x of Object.keys(sv.owned)){ for(const k of ['Fus','Sk']) E.libBreak(sv,x,k); if(sv.items.cartaFus) E.fuse(sv,x,[],Math.min(sv.items.cartaFus,10)); } };
for(const START of E.STARTERS){
sv=E.newSave(START);
let farms=0, lastTeam=[START], report=[];
for(const id of E.STAGE_ORDER){
  let won=null, f0=farms;
  while(!won && farms-f0<40){
    let best=null; for(const t of combos(sv.owned)){ const bb=run(t,id,lv()); if(bb.over==='vitoria' && (!best||E.stars(bb)>E.stars(best.b))) best={t,b:bb}; }
    if(best){ won=best; E.applyRewards(sv,best.b,rng); lastTeam=best.t; grow(best.t); } // jogador usa o Pool de XP no time
    else { const prev=E.STAGE_ORDER[E.STAGE_ORDER.indexOf(id)-1]; if(!prev) break; E.applyRewards(sv,run(lastTeam,prev,lv()),rng); side(lastTeam); farms++; grow(lastTeam); }
  }
  report.push(`${id.padEnd(10)} ${won?('★'+E.stars(won.b)+' '+won.t.map(x=>E.SPECIES[x].name).join('+')):'TRAVOU'}  repetições antes: ${farms-f0}  monstros: ${Object.keys(sv.owned).length}  níveis: ${won?won.t.map(x=>sv.owned[x].lv).join('/'):''}`);
  if(!won) break;
}
console.log('== Início com '+E.SPECIES[START].name+'\n'+report.join('\n'));
// Elite depois da campanha Comum
const lastCommon=E.STAGE_ORDER.at(-1); let rep2=[];
for(const id of E.ELITE_ORDER){
  let won=null, f0=farms;
  while(!won && farms-f0<60){
    let best=null; for(const t of combos(sv.owned)){ const bb=run(t,id,lv()); if(bb.over==='vitoria' && (!best||E.stars(bb)>E.stars(best.b))) best={t,b:bb}; }
    if(best){ won=best; E.applyRewards(sv,best.b,rng); grow(best.t); } else { E.applyRewards(sv,run(lastTeam,lastCommon,lv()),rng); side(lastTeam); farms++; grow(lastTeam); }
  }
  rep2.push(`${id.padEnd(11)} ${won?('★'+E.stars(won.b)):'TRAVOU'}  repetições: ${farms-f0}`);
  if(!won) break;
}
console.log(rep2.join(' | '));
console.log('Dungeon: '+[1,2,3,4,5].map(i=>{ let st=0; for(const t of combos(sv.owned)){ const bb=run(t,'dungeon-'+i,lv()); st=Math.max(st,E.stars(bb)); } return i+':★'+st; }).join(' '));
console.log('ouro', sv.gold, 'treinador nv', sv.trainer.lv, 'pokédex obtidas', Object.values(sv.dex).filter(v=>v>=2).length);
}
console.log('OK');
{ const o={v:8,owned:{brasilho:{lv:7,int:3,form:1,sk:{brasa:2}},gotim:{lv:2},dex20151:{lv:1}},team:['brasilho','gotim','dex20151'],items:{},stages:{},dex:{}};
  E.migrate(o); assert.strictEqual(o.v,11); assert(!o.owned.brasilho && !o.owned.gotim); assert.strictEqual(o.owned.dex20221.lv,7); assert.deepStrictEqual(o.owned.dex20221.sk,{});
  assert.deepStrictEqual(o.team,['dex20221','dex20651','dex20151']); const o2={v:9,owned:{dex20151:{lv:5,fus:5,sk:{x:7}}},items:{fragS:7,cristalT:3,pergaminho:2},stages:{},dex:{}}; E.migrate(o2);
  assert.deepStrictEqual(o2.items,{fragU:7,evoC:3,libInt1:2}); assert.strictEqual(o2.owned.dex20151.fusCap,6); assert.strictEqual(o2.owned.dex20151.skCap,8);
  console.log('migração v9 OK'); }
{ const sv=E.newSave(E.STARTERS[0]); sv.diamonds=0; const now=Date.UTC(2026,0,5,12); assert.strictEqual(E.freeRare(sv,now),1);
  assert(!E.spinCapsule(sv,'raro',1,now,()=>0).why); assert.strictEqual(E.freeRare(sv,now),0); assert.strictEqual(E.spinCapsule(sv,'raro',1,now).why,'diamantes');
  assert.strictEqual(E.freeRare(sv,now+864e5),1); console.log('raro grátis OK'); }
{ let c=0; const u={side:'A',slot:0,acts:0,fx:[],st:{spd:60}}, t={side:'E',slot:1,fx:[]}; for(let i=0;i<4000;i++){ u.acts=i%7; if(E.isCrit({actions:i,wave:i%3},u,t)) c++; }
  const r=c/4000; assert(r>.04 && r<.13, 'taxa de crítico '+r); console.log('crítico OK', r.toFixed(3)); }
