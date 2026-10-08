# uso: cutgrid.py <imagem> <id1,id2,...> [altura] [pasta]  -> <pasta>/<id>.png
# Recorta N criaturas de uma imagem em grade (fundo magenta). Ordem: linha a linha, da esquerda para a direita.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src=sys.argv[1]; ids=[x for x in sys.argv[2].split(',')]; H=int(sys.argv[3]) if len(sys.argv)>3 else 300
out_dir=sys.argv[4] if len(sys.argv)>4 else '/home/claude/proj/mon'
im=np.asarray(Image.open(src).convert('RGB')).astype(np.int32); r,g,b=im[...,0],im[...,1],im[...,2]
h0,w0=r.shape; cs=np.concatenate([im[:8,:8].reshape(-1,3),im[:8,-8:].reshape(-1,3),im[-8:,:8].reshape(-1,3),im[-8:,-8:].reshape(-1,3)]); ref=np.median(cs,0)
dist=np.sqrt(((im-ref)**2).sum(2))
bg=(((r-g)>110)&((b-g)>90)&(np.abs(r-b)<110)) | (dist<float(sys.argv[5]) if len(sys.argv)>5 else dist<70)
fg=ndimage.binary_opening(~bg,iterations=1)
lab,n=ndimage.label(fg); sizes=ndimage.sum(fg,lab,range(1,n+1))
order=np.argsort(-sizes); N=len(ids)
big=[i+1 for i in order[:N]]
def save(idx,m,y0,x0):
    crop=im[y0:y0+m.shape[0],x0:x0+m.shape[1]].copy()
    edge=m&~ndimage.binary_erosion(m,iterations=3); cr,cg,cb=crop[...,0],crop[...,1],crop[...,2]
    sp=edge&(((cr-cg>70)&(cb-cg>50))|(np.sqrt(((crop-ref)**2).sum(2))<110)); crop[sp]=(crop[sp]*.4+np.array([120,90,160])*.6).astype(np.int32)
    al=ndimage.gaussian_filter((m*255).astype(float),.7).clip(0,255)
    F=max(8,m.shape[1]//14)
    for side in (0,1):  # borda cortada reta (aura encostada no vizinho): esmaece
        colv=m[:, 0 if side==0 else -1]
        if colv.sum() > 0.08*m.shape[0]:
            ramp=np.linspace(0,1,F)
            if side==0: al[:,:F]*=ramp[None,:]
            else: al[:,-F:]*=ramp[::-1][None,:]
    al=al.astype(np.uint8)
    o=Image.fromarray(np.dstack([crop.clip(0,255).astype(np.uint8),al]),'RGBA')
    sc=H/o.height; o=o.resize((max(1,round(o.width*sc)),H),Image.LANCZOS); o.save(f'{out_dir}/{idx}.png'); print(idx,o.size)
import os
if os.environ.get('SPLITS') or (sizes[big[-1]-1] <= 0.15*sizes[big[0]-1] and w0 > 2.5*h0):  # uma linha só: corta por colunas vazias
    col=fg.sum(0)>2; runs=[];st=None
    for x,v in enumerate(col):
        if v and st is None: st=x
        if not v and st is not None: runs.append([st,x]); st=None
    if st is not None: runs.append([st,len(col)])
    runs=[q for q in runs if q[1]-q[0]>3]
    mass=lambda q: int(fg[:,q[0]:q[1]].sum())
    while len(runs)>N:
        ms=[mass(q) for q in runs]; j=min(range(len(runs)),key=lambda i:ms[i])
        if ms[j] < 0.12*max(ms): runs.pop(j); continue
        k=min(range(len(runs)-1),key=lambda i:runs[i+1][0]-runs[i][1]); runs[k][1]=runs[k+1][1]; runs.pop(k+1)
    while len(runs)<N:
        k=max(range(len(runs)),key=lambda i:runs[i][1]-runs[i][0]); a,b=runs[k]; prof=fg[:,a:b].sum(0); m0=a+(b-a)//4; m1=b-(b-a)//4
        cut=m0+int(np.argmin(prof[m0-a:m1-a])); runs[k:k+1]=[[a,cut],[cut,b]]
    if os.environ.get('SPLITS'): xs=[0]+[int(v) for v in os.environ['SPLITS'].split(',')]+[w0]; runs=[[xs[i],xs[i+1]] for i in range(len(xs)-1)]
    cents=ndimage.center_of_mass(fg,lab,range(1,n+1))
    for idx,(a,b) in zip(ids,runs):
        keep=[i+1 for i,(cy,cx) in enumerate(cents) if a<=cx<b and sizes[i]>30]
        m=np.zeros_like(fg)
        for c in set(lab[fg].tolist())-{0}:
            cm=lab==c; xs_=np.where(cm.any(0))[0]; span=xs_.max()-xs_.min()
            if c in keep or (span>1.2*(b-a) and cm[:,a:b].any()):
                if span>1.2*(b-a): cm[:,:a]=False; cm[:,b:]=False
                m|=cm
        yy,xx=np.where(m); y0,y1,x0,x1=yy.min(),yy.max()+1,xx.min(),xx.max()+1; save(idx,m[y0:y1,x0:x1],y0,x0)
    sys.exit(0)
assert sizes[big[-1]-1] > 0.15*sizes[big[0]-1], ('peças grandes demais juntas ou faltando', sorted(sizes)[-N-2:])
# junta pedaços pequenos (>0,1% da maior) ao corpo mais próximo
dist={}
for k in big:
    dist[k]=ndimage.distance_transform_edt(lab!=k)
owner=np.zeros_like(lab)
for k in big: owner[lab==k]=k
for i in range(1,n+1):
    if i in big or sizes[i-1] < 0.001*sizes[big[0]-1]: continue
    ys,xs=np.where(lab==i); y,x=ys[0],xs[0]
    k=min(big,key=lambda k:dist[k][y,x])
    if dist[k][y,x] < 0.06*im.shape[1]: owner[lab==i]=k
# ordena: linhas pelo centro y (agrupando), depois x
cent={k:ndimage.center_of_mass(owner==k) for k in big}
ys=sorted(cent[k][0] for k in big); hmed=np.median([np.ptp(np.where((owner==k).any(1))[0]) for k in big])
rows=[]
for k in sorted(big,key=lambda k:cent[k][0]):
    if rows and abs(cent[k][0]-np.mean([cent[j][0] for j in rows[-1]]))<0.45*hmed: rows[-1].append(k)
    else: rows.append([k])
seq=[k for row in rows for k in sorted(row,key=lambda k:cent[k][1])]
for idx,k in zip(ids,seq):
    m=owner==k; yy,xx=np.where(m); y0,y1,x0,x1=yy.min(),yy.max()+1,xx.min(),xx.max()+1
    m=m[y0:y1,x0:x1]; crop=im[y0:y1,x0:x1].copy()
    edge=m&~ndimage.binary_erosion(m,iterations=3); cr,cg,cb=crop[...,0],crop[...,1],crop[...,2]
    sp=edge&(((cr-cg>70)&(cb-cg>50))|(np.sqrt(((crop-ref)**2).sum(2))<110)); crop[sp]=(crop[sp]*.4+np.array([120,90,160])*.6).astype(np.int32)
    al=ndimage.gaussian_filter((m*255).astype(float),.7).clip(0,255).astype(np.uint8)
    o=Image.fromarray(np.dstack([crop.clip(0,255).astype(np.uint8),al]),'RGBA')
    s=H/o.height; o=o.resize((max(1,round(o.width*s)),H),Image.LANCZOS)
    o.save(f'{out_dir}/{idx}.png'); print(idx,o.size,'linha',[i for i,row in enumerate(rows) if k in row][0])
