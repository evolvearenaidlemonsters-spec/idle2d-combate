import sys; sys.path.insert(0, __file__.rsplit('/',1)[0]); import recortar
from PIL import Image
U='/root/.claude/uploads/6283858a-d2cb-547b-99d5-8ecb24027fd9/'
def row(names,xs,y0,y1): return [(n,(a,y0,b,y1)) for n,(a,b) in zip(names,xs)]
L = {
 '7d3356cd':row(['heroM_0','heroM_1','heroM_2','heroM_3'],[(120,500),(560,965),(1010,1425),(1490,1870)],240,905),
 '50050860':row(['heroF_0','heroF_1','heroF_2','heroF_3'],[(100,530),(565,995),(1020,1430),(1465,1900)],225,910),
 '9539ab2f':row(['npc_0','npc_1','npc_2','npc_3','npc_4'],[(80,485),(480,835),(875,1190),(1230,1595),(1555,1925)],145,865),
 'd1512dcd':row(['tr_0','tr_1','tr_2','tr_3','tr_4','tr_5'],[(30,355),(385,695),(705,1065),(1065,1315),(1335,1645),(1640,1965)],295,895),
}
for f,items in L.items():
    src=U+f+'-image.jpg'; w=Image.open(src).size[0]
    recortar.cut_box(src,[b for _,b in items],'x',H=360,key='mag',scale=w/2000,fill=False,names=[f'char/{n}.png' for n,_ in items])
import glob
fs=sorted(glob.glob('char/*.png')); o=Image.new('RGBA',(10*130,2*190),(40,60,90,255))
for i,f in enumerate(fs):
    im=Image.open(f); im.thumbnail((122,180)); o.alpha_composite(im,((i%10)*130+4,(i//10)*190+4))
o.convert('RGB').save('/tmp/claude-0/f/ch.png')
