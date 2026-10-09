# uso: cut_pix.py <folha> <id1,id2,...> <pasta> [altura=360] [linhas=1]
# Folha de personagens em pixel art com fundo magenta. Recorta cada personagem (maiores componentes),
# com a MESMA escala para toda a folha (o mais alto fica com <altura>), pés alinhados embaixo (topo preenchido).
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, ids, out = sys.argv[1], sys.argv[2].split(','), sys.argv[3]
H = int(sys.argv[4]) if len(sys.argv)>4 else 360; rows = int(sys.argv[5]) if len(sys.argv)>5 else 1; drop = len(sys.argv)>6 and sys.argv[6]=='drop'  # drop: ignora pedaços soltos (ex.: bolinha arremessada)
im = np.asarray(Image.open(src).convert('RGB')).astype(np.int32); r,g,b = im[...,0],im[...,1],im[...,2]
bg = ((r-g)>90) & ((b-g)>70) & (np.abs(r-b)<120)
fg = ndimage.binary_opening(~bg, iterations=2)
lab, n = ndimage.label(fg); sizes = ndimage.sum(fg, lab, range(1,n+1))
big = [i+1 for i in np.argsort(sizes)[::-1][:len(ids)]]
cen = {k: ndimage.center_of_mass(lab==k) for k in big}
# pedaços pequenos (bolinha, chama solta) entram no personagem mais próximo
own = np.zeros_like(lab)
for k in big: own[lab==k] = k
for k in range(1, n+1):
    if k in big or sizes[k-1] < 60 or drop: continue
    cy, cx = ndimage.center_of_mass(lab==k); kk = min(big, key=lambda q: (cen[q][0]-cy)**2 + (cen[q][1]-cx)**2); own[lab==k] = kk
# ordem: linhas (por y) e depois x
hh = im.shape[0]/rows
order = sorted(big, key=lambda k: (int(cen[k][0]//hh), cen[k][1]))
sl = {k: ndimage.find_objects((own==k).astype(int))[0] for k in big}
mh = max(s[0].stop - s[0].start for s in sl.values()); sc = (H-6)/mh
for name, k in zip(ids, order):
    if name == '-': continue
    ys, xs = sl[k]; m = ndimage.binary_closing(own[ys, xs]==k, iterations=1) & ~bg[ys, xs]
    crop = im[ys, xs].copy()
    # tira o rosa da borda (despill)
    edge = m & ~ndimage.binary_erosion(m, iterations=2); cr, cg, cb = crop[...,0], crop[...,1], crop[...,2]
    pink = edge & ((cr-cg) > 60) & ((cb-cg) > 40); crop[pink] = (crop[pink]*.35 + np.array([40,30,45])*.65).astype(np.int32)
    o = Image.fromarray(np.dstack([crop.clip(0,255).astype(np.uint8), (m*255).astype(np.uint8)]), 'RGBA')
    w2, h2 = max(1, round(o.width*sc)), max(1, round(o.height*sc)); o = o.resize((w2, h2), Image.LANCZOS)
    c = Image.new('RGBA', (w2+8, H), (0,0,0,0)); c.alpha_composite(o, (4, H-3-h2)); c.save(f'{out}/{name}.png'); print(name, c.size, h2)
