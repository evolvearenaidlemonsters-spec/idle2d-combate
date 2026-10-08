# Empacota a arte de monstros/chefes/montarias em poucos arquivos JS (o artifact aceita no máx. 511 arquivos).
# Uso: python3 tools/pack_art.py  -> art/pack_N.js
import glob, io, base64, os, json
from PIL import Image
items = [(f[4:-4], f) for f in sorted(glob.glob('mon/*.png'))] + [('b:'+f[5:-4], f) for f in sorted(glob.glob('boss/*.png'))] + [('m:'+f[4:-4], f) for f in sorted(glob.glob('mnt/*.png'))] + [('k:'+f[5:-4], f) for f in sorted(glob.glob('back/*.png'))]
os.makedirs('art', exist_ok=True)
for old in glob.glob('art/pack_*.js'): os.remove(old)
N = 120
for k in range(0, len(items), N):
    d = {}
    for key, f in items[k:k+N]:
        b = io.BytesIO(); Image.open(f).save(b, 'WEBP', quality=85); d[key] = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
    open(f'art/pack_{k//N}.js', 'w').write('ART(' + json.dumps(d) + ');')
print(len(items), 'imagens em', (len(items)+N-1)//N, 'pacotes')
import re
p='combate.html'; s=open(p).read()
s=re.sub(r"for\(let i=0;i<\d+;i\+\+\)\{ const sc = document\.createElement\('script'\)", f"for(let i=0;i<{(len(items)+N-1)//N};i++){{ const sc = document.createElement('script')", s, count=1)
open(p,'w').write(s)
