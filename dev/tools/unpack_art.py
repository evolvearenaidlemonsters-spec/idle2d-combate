# Recria mon/, boss/ e mnt/ (PNG) a partir de art/pack_*.js — use depois de baixar o projeto,
# antes de adicionar arte nova e rodar tools/pack_art.py (que lê essas pastas).
# Uso (na pasta do projeto): python3 tools/unpack_art.py
import glob, json, base64, io, os
from PIL import Image
n = 0
for f in sorted(glob.glob('art/pack_*.js')):
    d = json.loads(open(f).read()[4:-2])  # 'ART(' ... ');'
    for key, url in d.items():
        im = Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1])))
        folder, name = ('boss', key[2:]) if key.startswith('b:') else ('mnt', key[2:]) if key.startswith('m:') else ('back', key[2:]) if key.startswith('k:') else ('mon', key)
        os.makedirs(folder, exist_ok=True); im.save(f'{folder}/{name}.png'); n += 1
print(n, 'imagens recriadas em mon/, boss/, mnt/')
