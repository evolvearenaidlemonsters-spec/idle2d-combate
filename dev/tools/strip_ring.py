# Tira o disco azul-piscina e o aro branco dos ícones redondos (ui/m_*.png) -> ui/n_*.png
import sys, numpy as np
from PIL import Image
from scipy import ndimage
def strip(src, dst):
    im=Image.open(src).convert('RGBA'); a=np.asarray(im).astype(int); r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
    h,w=al.shape; yy,xx=np.mgrid[:h,:w]; cy,cx=h/2-.5,w/2-.5; rad=np.hypot(yy-cy,xx-cx)/(min(h,w)/2)
    teal=(g>r+25)&(b>r+15)&(np.abs(g-b)<70)            # disco azul-piscina
    light=(r>170)&(g>200)&(b>200)                       # aro claro
    ring=(rad>.80)
    # disco = pixels azul-piscina ligados ao aro (o contorno escuro do objeto separa o objeto do disco)
    soft=teal|(light&(rad>.7))
    lab0,_=ndimage.label(soft|ring); touch=np.unique(lab0[ring&(soft|ring)]); disc=np.isin(lab0,touch[touch>0])
    bg=disc|ring
    fg=(~bg)&(al>40)
    fg=ndimage.binary_opening(fg,iterations=1)
    lab,n=ndimage.label(fg)
    if n==0: return
    sz=ndimage.sum(fg,lab,range(1,n+1)); keep=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>max(25,.02*sz.max())])
    keep=ndimage.binary_fill_holes(keep)  # buracos internos (partes azuis do objeto)
    out=a.copy(); out[...,3]=np.where(keep,al,0)
    o=Image.fromarray(out.clip(0,255).astype(np.uint8),'RGBA'); bb=o.getbbox(); o=o.crop(bb)
    # contorno escuro suave + sombra
    s=max(o.size); W=int(s*1.12)+8; c=Image.new('RGBA',(W,W)); off=((W-o.width)//2,(W-o.height)//2)
    A=np.zeros((W,W)); A[off[1]:off[1]+o.height,off[0]:off[0]+o.width]=np.asarray(o)[...,3]/255
    ring=ndimage.grey_dilation(A,size=(5,5)); ring=ndimage.gaussian_filter(ring,1.0)
    sh=ndimage.shift(ndimage.gaussian_filter(A,3),(4,1))*.55
    base=np.zeros((W,W,4)); base[...,:3]=[20,30,45]; base[...,3]=np.clip(np.maximum(ring,sh),0,1)*255
    c=Image.alpha_composite(Image.fromarray(base.astype(np.uint8),'RGBA'),c); c.paste(o,off,o)
    c.save(dst)
for i in range(13): strip(f'/home/claude/proj/ui/m_{i}.png', f'/home/claude/proj/ui/n_{i}.png')
