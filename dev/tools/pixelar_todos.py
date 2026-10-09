# Converte todos os monstros (art/i/<nº>.webp) e chefes (art/i/b_*.webp) para pixel art em px/ (webp sem perdas).
import sys, os, glob
from multiprocessing import Pool
sys.path.insert(0, os.path.dirname(__file__)); import pixelar
from PIL import Image
def one(f):
    k = os.path.basename(f)[:-5]; dst = f'px/{k}.webp'
    if os.path.exists(dst) and '--force' not in sys.argv: return
    tmp = f'/tmp/px_{k}.png'
    try:
        pixelar.pixelize(f, tmp, out=4); Image.open(tmp).save(dst, 'WEBP', lossless=True, method=4); os.remove(tmp)
    except Exception as e: print('ERRO', k, e)
if __name__ == '__main__':
    os.makedirs('px', exist_ok=True)
    fs = [f for f in glob.glob('art/i/*.webp') if os.path.basename(f)[0].isdigit() or os.path.basename(f).startswith('b_')]
    with Pool(8) as p: p.map(one, fs)
    print(len(fs), 'convertidos')
