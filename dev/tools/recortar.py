# Recorta personagens de uma folha com fundo verde (#00FF00): chroma key, separa por componente, salva PNG com transparência.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
def cut(src, prefix, expect, H=360):
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.int32); r,g,b = im[...,0],im[...,1],im[...,2]
    bg = (g > 120) & (g > r*1.25) & (g > b*1.25)            # verde dominante = fundo (inclui fumaça esverdeada)
    fg = ndimage.binary_opening(~bg, iterations=2)
    lab, n = ndimage.label(fg); sizes = ndimage.sum(fg, lab, range(1,n+1))
    keep = [i+1 for i in np.argsort(sizes)[::-1][:expect]]   # os maiores = personagens
    boxes = sorted([(ndimage.find_objects((lab==k).astype(int))[0], k) for k in keep], key=lambda t:t[0][1].start)
    out = []
    for j,(sl,k) in enumerate(boxes):
        m = ndimage.binary_fill_holes(lab==k)
        m = ndimage.binary_dilation(m, iterations=1) & ~bg | (lab==k)
        ys, xs = sl; crop = im[ys, xs].copy(); a = (m[ys, xs]*255).astype(np.uint8)
        a = ndimage.gaussian_filter(a.astype(float), .6).clip(0,255).astype(np.uint8)
        cr, cg, cb = crop[...,0], crop[...,1], crop[...,2]; cg[:] = np.minimum(cg, np.maximum(cr, cb)+12)   # tira o reflexo verde
        rgba = np.dstack([crop.clip(0,255).astype(np.uint8), a]); img = Image.fromarray(rgba, 'RGBA')
        img = img.resize((round(img.width*H/img.height), H), Image.LANCZOS)
        img.save(f'{prefix}_{j}.png'); out.append(img.size)
    print(prefix, n, out)
if __name__=='__main__': cut(sys.argv[1], sys.argv[2], int(sys.argv[3]))

def cut_cols(src, prefix, expect, H=360, guess=None):
    """Para personagens encostados: corta nas colunas com menos pixels perto das divisões esperadas."""
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.int32); r,g,b = im[...,0],im[...,1],im[...,2]
    bg = (g > 120) & (g > r*1.25) & (g > b*1.25); fg = ndimage.binary_opening(~bg, iterations=2)
    col = fg.sum(0); W = fg.shape[1]; xs = np.where(col>0)[0]; x0, x1 = xs[0], xs[-1]; step = (x1-x0)/expect
    cuts = [x0] + [int(gx-40+np.argmin(col[gx-40:gx+40])) for gx in guess] + [x1+1] if guess else [x0] + [int(x0+step*k - step*.15 + np.argmin(col[int(x0+step*k-step*.15):int(x0+step*k+step*.15)])) for k in range(1,expect)] + [x1+1]
    out = []
    for j in range(expect):
        sub = fg.copy(); sub[:, :cuts[j]] = False; sub[:, cuts[j+1]:] = False
        lab, n = ndimage.label(sub); sizes = ndimage.sum(sub, lab, range(1,n+1)); k = int(np.argmax(sizes))+1
        m = ndimage.binary_fill_holes(lab==k); ys, xsl = ndimage.find_objects(m.astype(int))[0]
        crop = im[ys, xsl].copy(); a = ndimage.gaussian_filter((m[ys,xsl]*255).astype(float), .6).clip(0,255).astype(np.uint8)
        cr, cg, cb = crop[...,0], crop[...,1], crop[...,2]; cg[:] = np.minimum(cg, np.maximum(cr, cb)+12)
        img = Image.fromarray(np.dstack([crop.clip(0,255).astype(np.uint8), a]), 'RGBA')
        img = img.resize((round(img.width*H/img.height), H), Image.LANCZOS); img.save(f'{prefix}_{j}.png'); out.append(img.size)
    print(prefix, cuts, out)

def cut_box(src, boxes, prefix, H=360, key='dom', scale=1.0, fill=True, names=None):
    """Recorta objetos dentro de caixas (x0,y0,x1,y1 em coordenadas de exibição × scale). key: 'dom' = verde dominante; 'dist' = perto da cor do fundo (melhor para objetos verdes)."""
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.int32); r,g,b = im[...,0],im[...,1],im[...,2]
    if key=='dom': bg = (g > 120) & (g > r*1.25) & (g > b*1.25)
    elif key=='bgc': c = np.median(im[:10].reshape(-1,3), 0); dd = np.sqrt(((im-c)**2).sum(-1)); bg = dd < 55
    elif key=='mag': bg = ((r-g) > 110) & ((b-g) > 110) & (np.abs(r-b) < 90)
    else:
        c = np.median(np.concatenate([im[:8].reshape(-1,3), im[:, :8].reshape(-1,3)]), 0)
        bg = (np.sqrt(((im-c)**2).sum(-1)) < 75) & (g > r+60) & (g > b+60)
    fg = ndimage.binary_opening(~bg, iterations=1); out = []
    for j,(x0,y0,x1,y1) in enumerate(boxes):
        x0,y0,x1,y1 = [int(v*scale) for v in (x0,y0,x1,y1)]
        sub = np.zeros_like(fg); sub[y0:y1, x0:x1] = fg[y0:y1, x0:x1]
        lab, n = ndimage.label(sub); sizes = ndimage.sum(sub, lab, range(1,n+1)); k = int(np.argmax(sizes))+1
        m = lab==k
        if key in ('mag','bgc'): near = ndimage.binary_dilation(m, iterations=25); m = np.isin(lab, [i+1 for i in np.nonzero(sizes > sizes.max()*.02)[0] if (near & (lab==i+1)).any()])
        m = ndimage.binary_fill_holes(m) if fill else m
        # junta pedaços pequenos próximos (folhas, chamas) do mesmo objeto
        near = ndimage.binary_dilation(m, iterations=6); m = m | (sub & near)
        ys, xs = ndimage.find_objects(m.astype(int))[0]
        crop = im[ys, xs].copy(); a = ndimage.gaussian_filter((m[ys,xs]*255).astype(float), .7).clip(0,255).astype(np.uint8)
        cr, cg, cb = crop[...,0], crop[...,1], crop[...,2]
        if key=='bgc':
            edge = m[ys,xs] & ~ndimage.binary_erosion(m[ys,xs], iterations=3); sp = edge & (dd[ys,xs] < 110); crop[sp] = (crop[sp]*.35 + np.array([90,80,110])*.65).astype(np.int32)
        elif key=='mag':
            edge = m[ys,xs] & ~ndimage.binary_erosion(m[ys,xs], iterations=3); sp = edge & (cr-cg > 90) & (cb-cg > 90); crop[sp] = (crop[sp]*.35 + np.array([90,80,110])*.65).astype(np.int32)
        else: spill = cg > np.maximum(cr,cb)+70; cg[spill] = (np.maximum(cr,cb)+70)[spill]
        img = Image.fromarray(np.dstack([crop.clip(0,255).astype(np.uint8), a]), 'RGBA')
        img = img.resize((round(img.width*H/img.height), H), Image.LANCZOS); img.save(names[j] if names else f'{prefix}_{j}.png'); out.append(img.size)
    print(prefix, out)

def cut_grid(src, cols, rows, prefix, H=160):
    """Ícones em grade sobre fundo magenta (#FF00FF): um por célula, maior componente."""
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.int32); r,g,b = im[...,0],im[...,1],im[...,2]
    bg = ((r-g) > 110) & ((b-g) > 110) & (np.abs(r-b) < 90)
    fg = ndimage.binary_opening(~bg, iterations=1); Hh, Ww = fg.shape; out = []
    for j in range(rows*cols):
        cx, cy = j % cols, j // cols; x0,x1 = Ww*cx//cols, Ww*(cx+1)//cols; y0,y1 = Hh*cy//rows, Hh*(cy+1)//rows
        sub = np.zeros_like(fg); sub[y0:y1, x0:x1] = fg[y0:y1, x0:x1]
        lab, n = ndimage.label(sub); sizes = ndimage.sum(sub, lab, range(1,n+1)); k = int(np.argmax(sizes))+1
        m = (lab==k) | (sub & ndimage.binary_dilation(lab==k, iterations=8)); m = ndimage.binary_fill_holes(m)
        ys, xs = ndimage.find_objects(m.astype(int))[0]
        crop = im[ys, xs].copy(); a = ndimage.gaussian_filter((m[ys,xs]*255).astype(float), .7).clip(0,255).astype(np.uint8)
        # tira o reflexo magenta das bordas
        cr, cg, cb = crop[...,0], crop[...,1], crop[...,2]; sp = (cr-cg > 90) & (cb-cg > 90); crop[sp] = (crop[sp]*.4 + np.array([60,60,90])*.6).astype(np.int32)
        img = Image.fromarray(np.dstack([crop.clip(0,255).astype(np.uint8), a]), 'RGBA')
        s = H/max(img.size); img = img.resize((round(img.width*s), round(img.height*s)), Image.LANCZOS); img.save(f'{prefix}_{j}.png'); out.append(img.size)
    print(prefix, out)

def cut_mag(src, names, H=300):
    """Objetos separados sobre fundo magenta: os N maiores componentes, da esquerda para a direita, salvos com os nomes dados."""
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.int32); r,g,b = im[...,0],im[...,1],im[...,2]
    bg = ((r-g) > 110) & ((b-g) > 110) & (np.abs(r-b) < 90)
    fg = ndimage.binary_opening(~bg, iterations=1)
    big = ndimage.binary_dilation(fg, iterations=10)            # junta asas finas e antenas ao corpo
    lab, n = ndimage.label(big); sizes = ndimage.sum(fg, lab, range(1,n+1))
    keep = [i+1 for i in np.argsort(sizes)[::-1][:len(names)]]
    objs = sorted([(ndimage.find_objects((lab==k).astype(int))[0], k) for k in keep], key=lambda t:t[0][1].start)
    for nm,(sl,k) in zip(names, objs):
        m = fg & (lab==k); ys, xs = ndimage.find_objects(m.astype(int))[0]
        crop = im[ys, xs].copy(); a = ndimage.gaussian_filter((m[ys,xs]*255).astype(float), .7).clip(0,255).astype(np.uint8)
        edge = m[ys,xs] & ~ndimage.binary_erosion(m[ys,xs], iterations=3)   # só a borda (o corpo pode ser roxo de verdade)
        cr, cg, cb = crop[...,0], crop[...,1], crop[...,2]; sp = edge & (cr-cg > 90) & (cb-cg > 90); crop[sp] = (crop[sp]*.35 + np.array([90,80,110])*.65).astype(np.int32)
        img = Image.fromarray(np.dstack([crop.clip(0,255).astype(np.uint8), a]), 'RGBA')
        img = img.resize((round(img.width*H/img.height), H), Image.LANCZOS); img.save(nm); print(nm, img.size)
