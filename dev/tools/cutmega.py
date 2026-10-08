# uso: cutmega.py <imagem> <id1,id2,...> [altura]  -> mon/<id>.png
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src=sys.argv[1]; ids=[int(x) for x in sys.argv[2].split(',')]; H=int(sys.argv[3]) if len(sys.argv)>3 else 300
im=np.asarray(Image.open(src).convert('RGB')).astype(np.int32); r,g,b=im[...,0],im[...,1],im[...,2]
bg=((r-g)>110)&((b-g)>90)&(np.abs(r-b)<110)
fg=ndimage.binary_opening(~bg,iterations=1)
col=fg.sum(0)>2; runs=[];s=None
for x,v in enumerate(col):
    if v and s is None: s=x
    if not v and s is not None: runs.append([s,x]); s=None
if s is not None: runs.append([s,len(col)])
runs=[q for q in runs if q[1]-q[0]>3]
while len(runs)>len(ids):
    k=min(range(len(runs)-1),key=lambda i:runs[i+1][0]-runs[i][1]); runs[k][1]=runs[k+1][1]; runs.pop(k+1)
assert len(runs)==len(ids),(len(runs),len(ids))
for i,(a,b_) in enumerate(runs):
    sub=fg[:,a:b_]; rows=np.where(sub.any(1))[0]; y0,y1=rows.min(),rows.max()+1
    m=sub[y0:y1]; crop=im[y0:y1,a:b_].copy()
    # tira o rosa da borda (halo do fundo)
    edge=m&~ndimage.binary_erosion(m,iterations=3); cr,cg,cb=crop[...,0],crop[...,1],crop[...,2]
    sp=edge&(cr-cg>70)&(cb-cg>50); crop[sp]=(crop[sp]*.4+np.array([120,90,160])*.6).astype(np.int32)
    al=ndimage.gaussian_filter((m*255).astype(float),.7).clip(0,255).astype(np.uint8)
    out=Image.fromarray(np.dstack([crop.clip(0,255).astype(np.uint8),al]),'RGBA')
    s=H/out.height; out=out.resize((max(1,round(out.width*s)),H),Image.LANCZOS)
    out.save(f'/home/claude/proj/idle2d/mon/{ids[i]}.png'); print(ids[i], out.size)
