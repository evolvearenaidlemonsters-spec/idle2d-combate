// Revisão geral: percorre telas e fluxos em dois saves (novo e avançado), junta erros e tira prints pequenos
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:520}});
const errs=[]; let step='';
p.on('pageerror',e=>errs.push(`[${step}] ${e.message}`)); p.on('console',m=>{ if(m.type()==='error' && !m.text().includes('ERR_TUNNEL')) errs.push(`[${step}] console: ${m.text()}`); });
const shot=async n=>{ await p.waitForTimeout(450); await p.screenshot({path:`rev/${n}.png`}); };
const ev=async (name,fn,arg)=>{ step=name; try{ await p.evaluate(fn,arg); }catch(e){ errs.push(`[${name}] EVAL ${e.message.split('\n')[0]}`); } };
const closeAll=()=>{ document.querySelectorAll('.screen,.ov').forEach(e=>{ if(e.id!=='city') e.hidden=true; }); const r=document.getElementById('rpop'); if(r) r.hidden=true; document.getElementById('capRev')?.remove(); document.getElementById('xpPool') && (document.getElementById('xpPool').hidden=true); };
await p.addInitScript(`window.closeAll=()=>{ document.querySelectorAll('.screen,.ov').forEach(e=>{ if(e.id!=='city') e.hidden=true; }); const r=document.getElementById('rpop'); if(r) r.hidden=true; document.getElementById('capRev')?.remove(); document.getElementById('evoFx')?.remove(); const x=document.getElementById('xpPool'); if(x) x.hidden=true; };`);
await p.goto('file:///home/claude/proj/idle2d/combate.html'); await p.waitForTimeout(1500);
step='inicio'; try{ await p.click('#talkSkip',{timeout:2000}); await shot('00_escolha'); await p.click('#starterCards .card',{timeout:2000}); await p.click('#talkSkip',{timeout:2000}); }catch(e){ errs.push('inicio: '+e.message.split('\n')[0]); }
await p.waitForTimeout(800); await shot('01_cidade_nova');
// --- jogador novo: todas as telas da cidade
for(const id of ['login','evt','cap','shop','dex','bag','mnt','prov','rank','ach','frag','team','mon']){ await ev('novo:'+id, ()=>{ document.querySelectorAll('.screen,.ov').forEach(e=>{ if(e.id!=='city') e.hidden=true; }); document.getElementById('rpop').hidden=true; }); await ev('novo:'+id, id=>goTo(id), id); await shot('n_'+id); }
await ev('novo:fecha', ()=>closeAll()); await ev('novo:mapa', ()=>{ $('city').hidden=true; showMap(); }); await shot('n_mapa');
await ev('novo:praia1', ()=>{ document.getElementById('rpop').hidden=true; openRegion(0,'praia-1'); }); await shot('n_praia1');
// batalha praia-1 manual→auto até o fim
await ev('novo:batalha', ()=>{ enter('praia-1'); }); await p.waitForTimeout(2500); await shot('n_batalha');
await ev('novo:auto', ()=>{ save.trainer.lv=Math.max(save.trainer.lv,5); auto=true; speed=3; if(waiting){ const u=waiting,[s,t]=choose(B,u); doAct(u,s,t); } });
for(let i=0;i<40;i++){ await p.waitForTimeout(1000); const d=await p.evaluate(()=>({res:!$('res').hidden,rp:!$('rpop').hidden,over:B&&B.over})); if(d.res||d.rp) break; }
await shot('n_resultado'); for(let i=0;i<6;i++){ await ev('novo:popups', ()=>{ if(!$('rpop').hidden){ const c=document.querySelector('#rpop .pickc, #rpop [data-c]'); if(c && !c.dataset.done){ c.dataset.done=1; c.click(); return; } const bs=[...document.querySelectorAll('#rpop button')].filter(b=>b.offsetParent&&!b.disabled); bs.at(-1)?.click(); } }); await p.waitForTimeout(800); }
await shot('n_resultado2'); await ev('novo:voltar', ()=>$('teamBtn').click()); await shot('n_volta');
// --- jogador avançado
await ev('avancado:setup', ()=>{ closeAll(); for(const id in STAGES) if(!STAGES[id].weekly && id!=='arena') save.stages[id]={best:3,clears:1,chests:[]}; save.trainer.lv=50; save.gold=5e6; save.diamonds=5e4; save.vit={cur:300,at:Date.now()};
  for(const k in ITEMS) save.items[k]=50; for(const sp of POOL.masmorra.slice(0,30)) addCreature(save,sp); for(const sp of Object.keys(save.owned)){ save.owned[sp].lv=45; }
  giveFrag(save, FRAG_POOL[2], 99); giveFrag(save, featuredS(Date.now())[0], 60); for(let i=0;i<4;i++) newGear(save,'carvao'); save.mount=null; giveMount(save,'cabrito'); persist(); showCity(); });
await shot('a_cidade');
for(const id of ['cap','shop','dex','bag','mnt','prov','rank','ach','frag','team']){ await ev('av:'+id, closeAll); await ev('av:'+id, id=>goTo(id), id); await shot('a_'+id); }
for(const t of ['comum','equip','arena','dia','guilda']){ await ev('av:loja '+t, t=>{ closeAll(); shopTab=t; openShop(); renderShop(); }, t); await shot('a_loja_'+t); }
for(const t of ['pessoal','desafiar','ranking']){ await ev('av:arena '+t, t=>{ closeAll(); openArena(t); }, t); await shot('a_arena_'+t); }
const sp0=await p.evaluate(()=>save.team[0]);
for(const t of ['attr','int','skill','equip','fus','evo']){ await ev('av:mon '+t, t=>{ closeAll(); openMon(save.team[0]); monTab=t; renderMon(); }, t); await shot('a_mon_'+t); }
await ev('av:xppool', ()=>{ openXpPool(); $('xp10').click(); }); await shot('a_xppool');
await ev('av:liberar', ()=>{ monTab='skill'; renderMon(); document.querySelector('[data-lib]')?.click(); monTab='fus'; renderMon(); });
await ev('av:evoluir', ()=>{ monTab='evo'; renderMon(); $('evoBtn').click(); }); await p.waitForTimeout(3500); await shot('a_evo'); await ev('av:evo ok', ()=>{ document.querySelector('#evoFx button')?.click(); document.getElementById('evoFx')?.remove(); });
await ev('av:equipar', ()=>{ closeAll(); openMon(save.team[0]); monTab='equip'; renderMon(); const g=save.gear[0]; if(g) equipGear(save, save.team[0], g.id); renderMon(); for(let i=0;i<8;i++) $('ampBtn')?.click(); }); await shot('a_amp');
await ev('av:capsula10', ()=>{ closeAll(); openCap(); const r=spinCapsule(save,'raro',10,Date.now()); capReveal('raro', r.got, ()=>{}); }); await p.waitForTimeout(3300); await shot('a_capsula');
await ev('av:invocar', ()=>{ closeAll(); openFrag(); const b=[...document.querySelectorAll('#fragGrid .fcard button')].find(x=>!x.disabled); b&&b.click(); }); await p.waitForTimeout(400); await ev('av:invocar2', ()=>{ document.querySelector('#rpop .go button:last-child')?.click(); }); await p.waitForTimeout(1500); await shot('a_invocar');
await ev('av:elemento', ()=>{ closeAll(); team=save.team.slice(); buildCards(); $('sel').hidden=false; openElem(); }); await shot('a_elem');
await ev('av:historia', ()=>{ closeAll(); openStory && openStory(); }); await shot('a_historia');
await ev('av:perfil', ()=>{ closeAll(); openProf && openProf(); }); await shot('a_perfil');
await ev('av:weekly', ()=>{ closeAll(); openProv(); openWeekly(); }); await shot('a_weekly');
await ev('av:expl', ()=>{ closeAll(); openExpl('vazio'); }); await shot('a_expl');
await ev('av:torre', ()=>{ closeAll(); openProv(); openTower(); }); await shot('a_torre');
await ev('av:guilda', ()=>{ closeAll(); goTo('guild'); }); await shot('a_guilda');
await ev('av:lojaguilda', ()=>{ closeAll(); shopTab='guilda'; openShop(); renderShop(); }); await shot('a_lojaguilda');
await ev('av:pesadelo', ()=>{ closeAll(); $('city').hidden=true; showMap(); setMode('p'); openRegion(2); }); await shot('a_pesadelo');
// batalhas de cada modo até o resultado e a volta
for(const id of ['caverna-e3','dungeon-2','expl-descanso-A','templo-5','desafio','arena','praia-p2','torre','gboss']){
  await ev('av:luta '+id, id=>{ closeAll(); $('city').hidden=true; if(id==='desafio'){ weeklySetup(Date.now(), save.trainer.lv); const T=STAGES.desafio.wtype; const ok=Object.keys(save.owned).filter(sp=>SPECIES[sp].types.includes(T)).slice(0,3); if(!ok.length){ const c=POOL.masmorra.filter(sp=>SPECIES[sp].types.includes(T)).slice(0,3); c.forEach(sp=>addCreature(save,sp)); ok.push(...c); } save.team=ok; curStage='desafio'; start(); }
    else if(id==='torre'){ const st=towerSetup(Math.min(TOWER_MAX,towerFloor(save)+1)); const okT=Object.keys(save.owned).filter(sp=>!towerTeamWhy([sp],st.rule)).slice(0,st.rule.k==='dois'?2:3); if(!okT.length){ const c=POOL.masmorra.filter(sp=>!towerTeamWhy([sp],st.rule)).slice(0,2); c.forEach(sp=>addCreature(save,sp)); okT.push(...c); } save.team=okT; curStage='torre'; start(); }
    else if(id==='gboss'){ guildBossSetup(save,Date.now()); save.team=Object.keys(save.owned).slice(0,3); curStage='gboss'; start(); }
    else if(id==='arena'){ openArena('desafiar'); const tg=arenaTargets(save); const en=arenaEnter(save,tg[0],Date.now()); if(en.npc){ arenaTarget=tg[0]; arenaOpp=en.npc; curStage='arena'; start(en.npc.team); } }
    else { save.team=Object.keys(save.owned).slice(0,3); curStage=id; start(); } }, id);
  await p.waitForTimeout(2600); await ev('av:auto '+id, id=>{ auto=true; speed=3; if(id==='gboss'){ B.foes[0].hp-=5000; for(const u of B.allies) u.hp=1; } else if(B) for(const u of all(B)) if(u.side==='E') u.hp=1; if(waiting){ const u=waiting,[s,t]=choose(B,u); doAct(u,s,t); } }, id);
  let d; for(let i=0;i<40;i++){ await p.waitForTimeout(800); d=await p.evaluate(()=>({res:!$('res').hidden,rp:!$('rpop').hidden})); if(d.res||d.rp) break; await p.evaluate(()=>{ if(B && !B.over) for(const u of all(B)) if(u.side==='E') u.hp=Math.min(u.hp,1); }); }
  for(let i=0;i<6;i++){ await ev('av:popups '+id, ()=>{ if(!$('rpop').hidden){ const c=document.querySelector('#rpop .pickc, #rpop [data-c]'); if(c && !c.dataset.done){ c.dataset.done=1; c.click(); return; } const bs=[...document.querySelectorAll('#rpop button')].filter(b=>b.offsetParent&&!b.disabled); bs.at(-1)?.click(); } }); await p.waitForTimeout(700); }
  await shot('a_res_'+id); const res=await p.evaluate(()=>({res:!$('res').hidden, title:$('resTitle').textContent}));
  if(!res.res) errs.push(`[luta ${id}] resultado não apareceu`);
  await ev('av:volta '+id, ()=>$('teamBtn').click()); await p.waitForTimeout(600);
  const vis=await p.evaluate(()=>[...document.querySelectorAll('.screen,.ov')].filter(e=>!e.hidden).map(e=>e.id)); console.log('volta de', id, '→', vis.join(',')||'(nada)', '|', res.title);
}
// migração de save antigo (v8)
await ev('migracao', ()=>{ const old={v:8,owned:{brasilho:{lv:7,int:3,form:1,sk:{brasa:2}},gotim:{lv:2}},team:['brasilho','gotim'],items:{fragS:12,cristalT:4,pergaminho:3,pocaoXP:5},stages:{'praia-1':{best:2,clears:1}},dex:{},gold:500,trainer:{lv:6,exp:0},vit:{cur:50,at:0},xpPool:0,gear:[],gearSeq:0,elite:{},regionChests:{},diamonds:10};
  localStorage.setItem(SAVE_KEY, JSON.stringify(old)); }); await p.reload(); await p.waitForTimeout(2000); step='apos-migracao';
const mig=await p.evaluate(()=>({v:save.v, items:save.items, owned:Object.keys(save.owned), team:save.team})); console.log('migração', JSON.stringify(mig)); await shot('m_cidade');
console.log('ERROS', errs.length); for(const e of errs) console.log(' -', e);
await b.close(); })();
