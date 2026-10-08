import sys; sys.path.insert(0, __file__.rsplit('/',1)[0]); import recortar
from PIL import Image
U='/root/.claude/uploads/6283858a-d2cb-547b-99d5-8ecb24027fd9/'
CX=[(20,505),(505,1005),(1005,1500),(1500,1990)]; RY=[(30,565),(565,1100)]
def q(i): r,c=divmod(i,4); return (CX[c][0],RY[r][0],CX[c][1],RY[r][1])
G = {  # posição na grade (0-3 linha de cima, 4-7 de baixo) -> id; posições ausentes = duplicatas descartadas
 '49a515af':{0:23531,1:23551,2:23631,3:23801,5:23911,6:23931,7:23971},
 '82f90a6f':{0:23131,1:23171,2:23391,3:23421,4:23441,6:23442,7:23461},
 '2d6c5ea3':{0:22781,1:22809,2:22851,3:22939,5:23041,6:23051,7:23121},
 'a3b3d93c':{0:22351,1:22564,2:22701,3:22711,4:22721,6:22731,7:22771},
 '9d5eccc3':{0:22231,1:22239,2:22261,3:22279,4:22301,6:22333,7:22343},
 '3c3c9d4d':{0:21301,1:21329,2:21339,3:21601,4:21602,6:21629,7:22201},
 '251cab9d':{0:20925,1:21101,2:21111,3:21121,4:21139,6:21239,7:21241},
 '82665295':{0:20501,1:20661,2:20691,3:20719,5:20859,6:20871,7:20901},
}
IDS=[]
for f,m in G.items():
    src=U+f+'-image.jpg'; w=Image.open(src).size[0]; IDS+=list(m.values())
    recortar.cut_box(src,[q(i) for i in m],'x',H=300,key='mag',scale=w/2000,fill=False,names=[f'mon/{i}.png' for i in m.values()])
row=[(20033,(30,360,335,690)),(20211,(340,360,580,690)),(20416,(585,360,862,690)),(20479,(862,360,1150,690)),(20483,(1140,360,1415,690)),(20486,(1420,360,1695,690)),(20491,(1680,360,1960,690))]
src=U+'43a10cc6-image.jpg'; w=Image.open(src).size[0]; IDS+=[i for i,_ in row]
recortar.cut_box(src,[b for _,b in row],'x',H=300,key='mag',scale=w/2000,fill=False,names=[f'mon/{i}.png' for i,_ in row])
cols=9; rows=(len(IDS)+cols-1)//cols; o=Image.new('RGBA',(cols*130,rows*130),(40,60,90,255))
for i,f in enumerate(IDS):
    im=Image.open(f'mon/{f}.png'); im.thumbnail((122,122)); o.alpha_composite(im,((i%cols)*130+4,(i//cols)*130+4))
o.convert('RGB').save('/tmp/claude-0/f/arena.png'); print(len(IDS))
