// Simula um jogador dedicado (gasta toda a VIT do dia, farm offline 16 h, cápsulas grátis) e mede em que dia vence cada fase.
// uso: node sim_balance.js [dias] [seed] [dmJSON]
const fs=require('fs');const html=fs.readFileSync(require('path').join(__dirname,'../../combate.html'),'utf8');
const src=html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const dexJson=html.match(/<script id="dexdata" type="application\/json">([\s\S]*?)<\/script>/)[1];
const names=[...new Set([...src.matchAll(/^(?:const|function|let)\s+([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]))];
const E=new Function('document',src+';return {'+names.join(',')+'};')({getElementById:()=>({textContent:dexJson})});
const DAYS=+process.argv[2]||25, SEED=+process.argv[3]||7;
if(process.argv[4]){ Object.assign(E.BAL, JSON.parse(process.argv[4])); E.applyBalance(); }
let seed=SEED; const rng=()=>(seed=(seed*1664525+1013904223)%4294967296)/4294967296;
const sv=E.newSave(E.STARTERS[SEED%3]); const DAY=864e5; let now=new Date(2026,9,1,8).getTime();
const pw=sp=>E.power(E.mkUnit(sp,'A',0,E.progOf(sv.owned[sp],sv)));
const top=n=>Object.keys(sv.owned).sort((a,b)=>pw(b)-pw(a)).slice(0,n);
const combos=k=>{const o=[];if(k.length<=3)return[k];for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++)for(let l=j+1;l<k.length;l++)o.push([k[i],k[j],k[l]]);return o;};
// melhor time: testa combinações dos 8 mais fortes e também dos que têm tipo recomendado
function bestTeam(id){ const rec=new Set(E.recTypes?E.recTypes(id):[]); const owned=Object.keys(sv.owned);
  const cand=[...new Set([...top(7), ...owned.filter(sp=>E.SPECIES[sp].types.some(t=>rec.has(t))).sort((a,b)=>pw(b)-pw(a)).slice(0,4)])];
  let best=null; for(const t of combos(cand)){ const b=E.simulate(t,id,E.progMap(sv)); if(b.over==='vitoria'){ const s=E.stars(b); if(!best||s>best.s){best={t,b,s}; if(s===4)break;} } } return best; }
function grow(){ for(const sp in (sv.frags||{})) if(!sv.owned[sp]) E.summonFrag(sv,sp); E.fillPool(sv); const t=top(6);
  for(let r=0;r<3;r++) for(const x of t) E.levelUp(sv,x,5);
  for(const x of t){ E.feed(sv,x,999); E.breakCap(sv,x); E.feed(sv,x,999); while(E.transform(sv,x)); for(const k of ['Fus','Sk']) E.libBreak(sv,x,k);
    if(sv.items.cartaFus) E.fuse(sv,x,[],Math.min(sv.items.cartaFus,20)); for(const s of Object.keys(E.SKILLS)) while(sv.gold>50000 && E.upgradeSkill(sv,x,s)); } }
const firstDay={}; const log=[];
const failAt={}; const powKey=()=>top(6).reduce((a,x)=>a+pw(x),0)+':'+Object.keys(sv.owned).length;
const tryStage=id=>{ if(!E.unlocked(sv,id)) return false; if(failAt[id]===powKey()) return false; if(E.chancesLeft(sv,id,now)<=0) return false; if(E.vitNow(sv,now)<E.vitCost(id)) return false;
  const best=bestTeam(id); if(!best){ failAt[id]=powKey(); return false; } E.tryEnter(sv,id,now); sv.team=best.t; const b=E.newBattle(best.t,id,E.progMap(sv)); while(!b.over){const u=E.current(b);E.act(b,...E.choose(b,u).slice(0,2));}
  E.applyRewards(sv,b,rng); if(b.over==='vitoria' && firstDay[id]==null) firstDay[id]=+(day+hour/24).toFixed(2); grow(); return b.over==='vitoria'; };
let day=0, hour=0;
for(day=0; day<DAYS; day++){
  // farm offline: 16 h (noite + trabalho) na fase Comum mais difícil vencida
  const lastC=E.STAGE_ORDER.filter(id=>E.cleared(sv,id)).at(-1);
  if(lastC){ const f=E.startFarm(sv,lastC,now); if(f.farm){ E.collectFarm(sv,now+8*3600e3); sv.farm.last=now+8*3600e3; E.collectFarm(sv,now+16*3600e3); sv.farm=null; } }
  now+=16*3600e3; sv.vit={cur:Math.min(E.VIT_MAX, (sv.vit.cur||0)+192), at:now}; // VIT acumulada durante a ausência
  for(let c=0;c<6;c++){ sv.capsule=sv.capsule||{}; sv.capsule.last=0; E.spinCapsule(sv,'comum',1,now,rng); } E.spinCapsule(sv,'raro',1,now,rng);
  // 8 h ativas: gasta VIT em blocos
  for(hour=0; hour<8; hour++){ const T=now+hour*3600e3; now=T; E.vitNow(sv,now);
    let guard=0; while(E.vitNow(sv,now)>=8 && guard++<40){
      const nextC=E.STAGE_ORDER.find(id=>!E.cleared(sv,id));
      if(nextC && tryStage(nextC)) continue;
      // Elite (3/dia), Dungeon (3/dia), Exploração (cartas) — o que estiver liberado e vencível
      let eDone=false; for(const el of E.ELITE_ORDER.filter(id=>E.unlocked(sv,id)&&!E.cleared(sv,id)&&E.chancesLeft(sv,id,now)>0)){ if(tryStage(el)){eDone=true;break;} } if(eDone) continue;
      const dg=[5,4,3,2,1].map(i=>'dungeon-'+i).find(id=>E.unlocked(sv,id)&&E.chancesLeft(sv,id,now)>0); if(dg && tryStage(dg)) continue;
      const ex=E.EXPL_ORDER.filter(id=>E.unlocked(sv,id)).reverse(); let done=false; for(const id of ex){ if(id.includes(rng()<.6?'descanso':'vazio') && tryStage(id)){done=true;break;} } if(done) continue;
      // BOT na Comum mais difícil vencida (EXP e itens)
      const lc=E.STAGE_ORDER.filter(id=>E.cleared(sv,id)).at(-1); if(!lc) break; E.sweep(sv,lc,1,now); grow();
    }
  }
  now+=0; const reg=E.STAGE_ORDER.filter(id=>E.cleared(sv,id)).at(-1);
  log.push(`dia ${String(day+1).padStart(2)}  treinador ${sv.trainer.lv}  Comum até ${reg}  Elite ${E.ELITE_ORDER.filter(id=>E.cleared(sv,id)).length}/40  Expl ${E.EXPL_ORDER.filter(id=>E.cleared(sv,id)).length}/12  Dungeon ${[1,2,3,4,5].filter(i=>E.cleared(sv,'dungeon-'+i)).length}/5  monstros ${Object.keys(sv.owned).length} frags ${Object.values(sv.frags||{}).reduce((a,b)=>a+b,0)}  top ${top(3).map(x=>`${sv.owned[x].lv}/f${sv.owned[x].form}`).join(' ')}  poder ${top(3).reduce((a,x)=>a+pw(x),0)}`);
}
console.log(log.join('\n'));
const R=E.REGIONS.map(r=>`${r.id}-5:${firstDay[r.id+'-5']??'-'}`).join('  '); console.log('Fim de região (dia):', R);
console.log('Elite 5 (dia):', E.REGIONS.map(r=>`${r.id}:${firstDay[r.id+'-e5']??'-'}`).join('  '));
console.log(JSON.stringify(firstDay));
