# Separa art/pack_*.js em arquivos individuais art/i/<chave>.webp (carregamento sob demanda no site)
# e grava art/i/keys.js com a lista de chaves. Uso: python3 tools/split_art.py
import glob, json, base64, os
os.makedirs('art/i', exist_ok=True)
keys = []
for f in sorted(glob.glob('art/pack_*.js')):
    d = json.loads(open(f).read()[4:-2])
    for key, url in d.items():
        open('art/i/' + key.replace(':', '_') + '.webp', 'wb').write(base64.b64decode(url.split(',', 1)[1])); keys.append(key)
open('art/i/keys.js', 'w').write('ARTKEYS(' + json.dumps(keys) + ');')
print(len(keys), 'imagens')
