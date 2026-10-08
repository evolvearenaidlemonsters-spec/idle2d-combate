import sys; sys.path.insert(0, __file__.rsplit('/',1)[0]); import recortar
from PIL import Image
U='/root/.claude/uploads/6283858a-d2cb-547b-99d5-8ecb24027fd9/'
L = {
 '739d4a1b':('mag',[(20191,(60,405,345,750)),(20192,(410,305,775,755)),(20415,(815,410,1135,755)),(23581,(1190,440,1500,750)),(23582,(1525,270,1950,755))]),
 'fb0f2b6e':('mag',[(21091,(45,250,325,560)),(21092,(360,140,750,565)),(21093,(775,50,1375,570)),(21831,(55,685,330,980)),(21832,(355,615,735,990)),(21833,(1420,90,1950,560))]),
 '5a6e871c':('mag',[(20281,(45,515,385,810)),(20282,(400,370,825,815)),(20283,(845,195,1375,820))]),
 '87754f9d':('mag',[(20161,(75,185,385,490)),(20162,(455,135,840,500)),(20163,(890,25,1370,505)),(20181,(70,675,410,950)),(20182,(465,585,805,960)),(20183,(840,570,1245,965))]),
 'dad396c4':('mag',[(20411,(75,705,435,1005)),(20412,(505,635,910,1010)),(20413,(1425,575,1945,1020))]),
}
IDS=[]
for f,(key,items) in L.items():
    src = U+f+'-image.jpg'; w = Image.open(src).size[0]; IDS += [i for i,_ in items]
    recortar.cut_box(src, [b for _,b in items], 'x', H=300, key=key, scale=w/2000, fill=False, names=[f'mon/{i}.png' for i,_ in items])
cols=11; rows=(len(IDS)+cols-1)//cols; o=Image.new('RGBA',(cols*130,rows*130),(40,60,90,255))
for i,f in enumerate(IDS):
    im=Image.open(f'mon/{f}.png'); im.thumbnail((122,122)); o.alpha_composite(im,((i%cols)*130+4,(i//cols)*130+4))
o.convert('RGB').save('/tmp/claude-0/f/usina.png'); print(len(IDS))
