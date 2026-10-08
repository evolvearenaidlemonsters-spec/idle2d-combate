const {T}=require('./targets.js'); for(const f of process.argv.slice(2)){ const L=require('fs').readFileSync(f,'utf8').trim().split('\n'); const A=JSON.parse(L.at(-1));
const ids=Object.keys(T).sort((a,b)=>T[a]-T[b]); console.log('== '+f); console.log(ids.filter(id=>/-5$|e5|expl|dungeon/.test(id)).map(id=>id.replace('expl-','x-').replace('descanso','d').replace('vazio','v')+' '+T[id]+'→'+(A[id]??'-')).join(' | '));
console.log(L.filter(l=>/^dia (7|14|21|30|45|62) /.test(l)).map(l=>l.slice(0,120)).join('\n')); }
