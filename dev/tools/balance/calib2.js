// Calibração "pelo calendário": o jogador simulado só pode vencer cada fase no dia-alvo (com inimigos fáceis), e no fim
// procura, com a foto do jogador naquele dia, a maior dificuldade (dm) que ele ainda vence com o melhor time. uso: node calib2.js seed dias
const fs=require('fs'); const {T}=require('./targets.js');
const html=fs.readFileSync(require('path').join(__dirname,'../../combate.html'),'utf8');
const src=html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const dexJson=html.match(/<script id="dexdata" type="application\/json">([\s\S]*?)<\/script>/)[1];
const names=[...new Set([...src.matchAll(/^(?:const|function|let)\s+([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]))];
const E=new Function('document',src+';return {'+names.join(',')+'};')({getElementById:()=>({textContent:dexJson})});
const SEED=+process.argv[2]||7, DAYS=+process.argv[3]||62;
Object.assign(E.BAL,{dm:Array(40).fill(0.35),edm:Array(40).fill(0.4),expl:Array(6).fill(0.4),dungeon:Array(5).fill(0.4)}); E.applyBalance();
let seed=SEED; const rng=()=>(seed=(seed*1664525+1013904223)%4294967296)/4294967296;
let sv=E.newSave(E.STARTERS[SEED%3]); let now=new Date(2026,9,1,8).getTime();
const pw=(sp,s=sv)=>E.power(E.mkUnit(sp,'A',0,E.progOf(s.owned[sp],s)));
const top=(n,s=sv)=>Object.keys(s.owned).sort((a,b)=>pw(b,s)-pw(a,s)).slice(0,n);
const combos=k=>{const o=[];if(k.length<=3)return[k];for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++)for(let l=j+1;l<k.length;l++)o.push([k[i],k[j],k[l]]);return o;};
function cands(id,s){ const rec=new Set(E.recTypes(id)), res=new Set((E.STAGES[id].resist)||[]), owned=Object.keys(s.owned);
  const good=owned.filter(sp=>E.SPECIES[sp].types.some(t=>rec.has(t))&&!E.SPECIES[sp].types.every(t=>res.has(t))).sort((a,b)=>pw(b,s)-pw(a,s)).slice(0,4);
  return [...new Set([...top(6,s), ...good])]; }
function bestTeam(id,s=sv){ let best=null; for(const t of combos(cands(id,s))){ const b=E.simulate(t,id,E.progMap(s)); if(b.over==='vitoria'){ const st=E.stars(b); if(!best||st>best.s){best={t,b,s:st}; if(st===4)break;} } } return best; }
function grow(){ for(const sp in (sv.frags||{})) if(!sv.owned[sp]) E.summonFrag(sv,sp); E.fillPool(sv); const t=top(9);
  for(let r=0;r<3;r++) for(const x of t) E.levelUp(sv,x,5);
  for(const x of t){ E.feed(sv,x,999); E.breakCap(sv,x); E.feed(sv,x,999); while(E.transform(sv,x)); for(const k of ['Fus','Sk']) E.libBreak(sv,x,k);
    if(sv.items.cartaFus) E.fuse(sv,x,[],Math.min(sv.items.cartaFus,20)); for(const s of Object.keys(E.SKILLS)) while(sv.gold>30000 && E.upgradeSkill(sv,x,s)); } }
let day=0, hour=0; const t=()=>day+hour/24;
const can=id=>E.unlocked(sv,id) && E.chancesLeft(sv,id,now)>0 && E.vitNow(sv,now)>=E.vitCost(id) && t()>=T[id];
function run(id){ const best=bestTeam(id); if(!best) return false; E.tryEnter(sv,id,now); sv.team=best.t; const b=E.newBattle(best.t,id,E.progMap(sv)); while(!b.over){const u=E.current(b);E.act(b,...E.choose(b,u).slice(0,2));} E.applyRewards(sv,b,rng); grow(); return b.over==='vitoria'; }
const snaps={}, cleared={}; snaps[-1]=JSON.parse(JSON.stringify(sv));
for(day=0; day<DAYS; day++){
  const lastC=E.STAGE_ORDER.filter(id=>E.cleared(sv,id)).at(-1);
  if(lastC){ const f=E.startFarm(sv,lastC,now); if(f.farm){ E.collectFarm(sv,now+8*3600e3); sv.farm.last=now+8*3600e3; E.collectFarm(sv,now+16*3600e3); sv.farm=null; } }
  now+=16*3600e3; sv.vit={cur:Math.min(E.VIT_MAX,(sv.vit.cur||0)+192),at:now};
  for(let c=0;c<6;c++){ sv.capsule=sv.capsule||{}; sv.capsule.last=0; E.spinCapsule(sv,'comum',1,now,rng); } E.spinCapsule(sv,'raro',1,now,rng);
  for(hour=0; hour<8; hour++){ now+=3600e3; let g=0;
    while(E.vitNow(sv,now)>=8 && g++<40){
      const pend=Object.keys(T).filter(id=>!E.cleared(sv,id) && can(id)).sort((a,b)=>T[a]-T[b]);
      let ok=false; for(const id of pend){ if(run(id)){ cleared[id]=+t().toFixed(2); ok=true; break; } } if(ok) continue;
      // repetir: Exploração mais alta vencida (cartas), Dungeon (itens), senão BOT na Comum mais alta
      const rep=['dungeon-5','dungeon-4','dungeon-3','dungeon-2','dungeon-1',...E.EXPL_ORDER.slice().reverse()].find(id=>E.cleared(sv,id)&&E.chancesLeft(sv,id,now)>0&&E.vitNow(sv,now)>=E.vitCost(id)&&rng()<.5);
      if(rep){ E.sweep(sv,rep,1,now); grow(); continue; }
      const lc=E.STAGE_ORDER.filter(id=>E.cleared(sv,id)).at(-1); if(!lc) break; E.sweep(sv,lc,1,now); grow(); }
  }
  snaps[day]=JSON.parse(JSON.stringify(sv));
}
// maior dm vencível por fase no dia-alvo
function maxDm(id){ const d=Math.min(DAYS-1, Math.floor(T[id])-1); const s=snaps[d]; const st=E.STAGES[id], old=st.dm;
  const wins=dm=>{ st.dm=dm; const b=bestTeam(id,s); return !!b; };
  let lo=0.05, hi=8; if(!wins(lo)){ st.dm=old; return null; } while(wins(hi)&&hi<200) hi*=2;
  for(let i=0;i<9;i++){ const m=Math.sqrt(lo*hi); if(wins(m)) lo=m; else hi=m; } st.dm=old; return +lo.toFixed(3); }
const out={}; for(const id of Object.keys(T)) out[id]=maxDm(id);
const last=snaps[DAYS-1]; console.error(`seed ${SEED}: treinador ${last.trainer.lv}, monstros ${Object.keys(last.owned).length}, fases ${Object.keys(cleared).length}/${Object.keys(T).length}`);
console.log(JSON.stringify({maxDm:out, cleared}));
