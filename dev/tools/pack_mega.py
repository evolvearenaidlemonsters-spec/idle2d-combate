# Junta a arte das Megas em art/pack_mega.js: mantém o que já está no pacote e acrescenta/troca
# mon/<id>.png (frente) e back/<id>.png (costas, chave k:<id>) dos ids informados.
# uso: python3 tools/pack_mega.py 21144,21146,...
import sys, json, re, io, base64, os
from PIL import Image
P='/home/claude/proj'; f=f'{P}/art/pack_mega.js'
d=json.loads(re.match(r'ART\((.*)\);?\s*$', open(f).read(), re.S).group(1))
for x in [i for i in sys.argv[1].split(',') if i]:
    for src,key in ((f'{P}/mon/{x}.png',x),(f'{P}/back/{x}.png','k:'+x)):
        if os.path.exists(src):
            b=io.BytesIO(); Image.open(src).save(b,'WEBP',quality=85); d[key]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
open(f,'w').write('ART('+json.dumps(d)+');')
print(len(d),'imagens', os.path.getsize(f)//1024,'KB')
