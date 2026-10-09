# Converte a arte pintada em pixel art no estilo do treinador: pixels grandes, contorno preto grosso, poucas cores, sombreamento chapado.
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
def pixelize(src, dst, H=84, colors=32, out=3):
    im = Image.open(src).convert('RGBA'); a = np.asarray(im)
    ys, xs = np.where(a[...,3] > 40); im = im.crop((xs.min(), ys.min(), xs.max()+1, ys.max()+1))
    w = max(1, round(im.width*H/im.height))
    # reduz com média (área) e endurece o alfa
    sm = im.resize((w, H), Image.BOX); arr = np.asarray(sm).astype(np.int32)
    alpha = arr[...,3] > 110
    alpha = ndimage.binary_closing(alpha, iterations=1); alpha = ndimage.binary_fill_holes(alpha)
    rgb = Image.fromarray(arr[...,:3].clip(0,255).astype(np.uint8))
    # mais contraste e saturação (cara de 16 bits)
    from PIL import ImageEnhance
    rgb = ImageEnhance.Color(rgb).enhance(1.25); rgb = ImageEnhance.Contrast(rgb).enhance(1.12)
    q = rgb.quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    c = np.asarray(q).astype(np.int32).copy()
    # contorno: borda externa de 1 pixel bem escura (puxada da cor vizinha) + linhas internas onde a cor muda muito
    edge = alpha & ~ndimage.binary_erosion(alpha)
    c[edge] = (c[edge]*0.55).astype(np.int32)          # borda interna sombreada
    alpha = np.pad(alpha,1); c = np.pad(c,((1,1),(1,1),(0,0)))
    ring = ndimage.binary_dilation(alpha) & ~alpha      # contorno externo preto grosso, como no treinador
    c[ring] = [22,16,30]; alpha = alpha | ring
    lum = c @ np.array([.3,.59,.11]); gy, gx = np.gradient(lum)
    edge = np.pad(edge,1); inner = alpha & ~edge & ~ring & (np.hypot(gx,gy) > 70) & (lum < ndimage.maximum_filter(lum,3))
    c[inner] = (c[inner]*0.45).astype(np.int32)
    o = np.dstack([c.clip(0,255), alpha*255]).astype(np.uint8)
    # moldura transparente de 1 px e ampliação nearest
    im2 = Image.fromarray(o,'RGBA').resize((o.shape[1]*out, o.shape[0]*out), Image.NEAREST)
    im2.quantize(colors=64, method=Image.FASTOCTREE, dither=Image.NONE).save(dst, optimize=True)
if __name__=='__main__':
    # uso: pixelar.py <pasta_entrada> <pasta_saida>  (converte todos os .webp de monstros, chefes, costas e montarias)
    import os, glob
    from multiprocessing import Pool
    src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
    fs = [f for f in glob.glob(src+'/*.webp')]
    def job(f):
        try: pixelize(f, os.path.join(out, os.path.basename(f)[:-5]+'.png')); return 0
        except Exception as e: print('ERRO', f, e); return 1
    with Pool(8) as p: print('erros:', sum(p.map(job, fs)), 'de', len(fs))
