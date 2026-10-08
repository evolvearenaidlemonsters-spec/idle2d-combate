import numpy as np
from PIL import Image
from scipy import ndimage
U='/root/.claude/uploads/6283858a-d2cb-547b-99d5-8ecb24027fd9/'
MAP = {
 'ed061e88':['fada_phys','fada_spec','fada_aoe','noturno_phys','noturno_spec','noturno_aoe','metalico_phys','metalico_spec','metalico_aoe'],
 'f3ca6ce3':['voador_phys','voador_spec',None,'voador_aoe','inseto_spec','inseto_aoe','inseto_phys','fantasma_phys','fantasma_spec','psiquico_spec','fantasma_aoe','psiquico_aoe','psiquico_phys','dragao_phys','dragao_spec',None,'dragao_aoe','debuff'],
 '4e8ab575':['gelo_phys','gelo_spec',None,'gelo_aoe','batalha_spec','batalha_aoe','batalha_phys','venenoso_phys','venenoso_spec','terra_spec','venenoso_aoe','terra_aoe','terra_phys','pedra_phys','pedra_spec',None,'pedra_aoe','buff'],
 'a480ed86':['normal_phys','normal_spec','normal_aoe','fogo_phys','fogo_spec','fogo_aoe','agua_phys','agua_spec','agua_aoe','planta_phys','planta_spec','planta_aoe','eletrico_phys',None,'eletrico_spec','eletrico_aoe','heal',None],
}
for f,names in MAP.items():
    im=Image.open(U+f+'-image.jpg').convert('RGB'); a=np.asarray(im).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
    mag=((r-g)>100)&((b-g)>100); lab,n=ndimage.label(ndimage.binary_opening(~mag,iterations=3)); objs=ndimage.find_objects(lab)
    boxes=[o for o in objs if (o[0].stop-o[0].start)>a.shape[0]*0.15 and (o[1].stop-o[1].start)>a.shape[1]*0.08]
    rows=sorted(boxes,key=lambda o:o[0].start); out=[]; 
    # group rows
    grp=[]; 
    for o in rows:
        if grp and abs(o[0].start-grp[-1][0][0].start)<40: grp[-1].append(o)
        else: grp.append([o])
    for gg in grp: out += sorted(gg,key=lambda o:o[1].start)
    assert len(out)==len(names),(f,len(out))
    for o,nm in zip(out,names):
        if not nm: continue
        t=im.crop((o[1].start,o[0].start,o[1].stop,o[0].stop)).resize((128,128),Image.LANCZOS).convert('RGBA'); x=np.array(t).astype(int)
        m=((x[...,0]-x[...,1])>90)&((x[...,2]-x[...,1])>90); x[...,3][m]=0; Image.fromarray(x.astype(np.uint8)).save(f'sk/{nm}.png')
import glob; print(len(glob.glob('sk/*.png')))
