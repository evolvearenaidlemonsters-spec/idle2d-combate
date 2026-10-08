// Dias-alvo (jogador dedicado, toda a VIT do dia) para vencer cada fase pela 1ª vez
const REG=['praia','bosque','caverna','vulcao','pico','usina','pantano','templo'];
const RSTART=[0,0.5,2,4,6.5,9.5,13,17,21];
const T={};
REG.forEach((k,r)=>{ for(let i=0;i<5;i++){ T[`${k}-${i+1}`]=+(RSTART[r]+(RSTART[r+1]-RSTART[r])*(i+1)/5).toFixed(2); T[`${k}-e${i+1}`]=+(5+r*6+i*1.2).toFixed(2); } });
'C B A S SS SSS'.split(' ').forEach((rk,i)=>{ const d=[1,6,14,26,42,60][i]; T[`expl-descanso-${rk}`]=d; T[`expl-vazio-${rk}`]=d+1; });
[7,15,26,40,58].forEach((d,i)=>T[`dungeon-${i+1}`]=d);
module.exports={T,REG};
