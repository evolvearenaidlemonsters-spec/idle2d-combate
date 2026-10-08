# uso: cut_icons.py <imagem> <prefixo>   ex.: fogo -> sk2/fogo_phys_1..3, fogo_spec_1..3, fogo_aoe_1..3 ; sup -> heal_1..3, buff_1..3, debuff_1..3
# Recorta 9 ícones (grade 3x3, quadrados com fundo pintado separados por magenta) e salva 128x128.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, pre = sys.argv[1], sys.argv[2]
im=np.asarray(Image.open(src).convert('RGB')).astype(int); r,g,b=im[...,0],im[...,1],im[...,2]
cs=np.concatenate([im[:6,:6].reshape(-1,3),im[:6,-6:].reshape(-1,3),im[-6:,:6].reshape(-1,3),im[-6:,-6:].reshape(-1,3)]); ref=np.median(cs,0)
bg=(np.sqrt(((im-ref)**2).sum(2))<70)|(((r-g)>110)&((b-g)>90))
fg=ndimage.binary_opening(~bg,iterations=2); lab,n=ndimage.label(fg); sz=ndimage.sum(fg,lab,range(1,n+1))
big=[i+1 for i in np.argsort(-sz)[:9]]
boxes=[ndimage.find_objects((lab==k).astype(int))[0] for k in big]
cent=[((s[0].start+s[0].stop)/2,(s[1].start+s[1].stop)/2) for s in boxes]
order=sorted(range(9),key=lambda i:cent[i][0]); rows=[sorted(order[j*3:j*3+3],key=lambda i:cent[i][1]) for j in range(3)]
names=(['heal','buff','debuff'] if pre=='sup' else [f'{pre}_phys',f'{pre}_spec',f'{pre}_aoe'])
for ri,row in enumerate(rows):
    for ci,i in enumerate(row):
        s=boxes[i]; h=s[0].stop-s[0].start; w=s[1].stop-s[1].start; m=min(h,w); cy=(s[0].start+s[0].stop)//2; cx=(s[1].start+s[1].stop)//2
        pad=int(m*0.06); x0=cx-m//2+pad; y0=cy-m//2+pad; x1=x0+m-2*pad; y1=y0+m-2*pad  # corta um pouco da borda arredondada/magenta
        o=Image.fromarray(im[y0:y1,x0:x1].clip(0,255).astype(np.uint8)).resize((128,128),Image.LANCZOS)
        o.save(f'/home/claude/proj/sk2/{names[ri]}_{ci+1}.png'); print(names[ri],ci+1,(w,h))
