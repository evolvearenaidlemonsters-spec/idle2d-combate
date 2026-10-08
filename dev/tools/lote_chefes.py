import sys; sys.path.insert(0, __file__.rsplit('/',1)[0]); import recortar
from PIL import Image
U='/root/.claude/uploads/6283858a-d2cb-547b-99d5-8ecb24027fd9/'
L = {
 '1a6ef9d9':[('golemrunico',(25,300,530,795)),('mimico',(535,360,895,785)),('sentinela',(868,280,1222,765)),('dracripta',(1128,265,1645,785)),('reidungeon',(1598,260,1980,770))],
 '02d84d00':[('guardiao',(40,195,460,750)),('mentalis',(438,200,748,550)),('fadalume',(732,235,1032,675)),('monjirao',(1022,235,1362,700)),('oraculo',(1368,260,1598,695)),('soberaneo',(1542,155,1950,700))],
 '080b0921':[('lodacal',(20,80,555,535)),('espectrim',(580,20,895,540)),('sapotox',(1015,85,1505,500)),('corvonox',(1515,35,1965,535)),('assombra',(545,595,1020,1070)),('rainhabruma',(1450,595,1970,1065))],
 '1c6fec0e':[('turbinox',(30,25,540,535)),('voltaico',(550,55,1020,540)),('engrenor',(1035,50,1580,560)),('tesladon',(1540,45,1970,540)),('raiomag',(30,585,585,1075)),('blindorr',(1015,625,1545,1065))],
 '24a6a1cf':[('yetirao',(25,25,645,545)),('nevasca',(645,20,1000,575)),('punhofrio',(1075,50,1615,565)),('borealia',(1625,35,1970,560)),('estalactor',(25,590,555,1080)),('mestrekai',(1055,605,1465,1085))],
 '015d261f':[('magmorr',(35,35,505,560)),('brasaleao',(540,45,960,540)),('fornalha',(1055,50,1435,540)),('dracoviva',(1470,70,1950,560)),('cinzaruna',(570,605,1065,1055)),('pirodraco',(1295,565,1960,1065))],
 '317120ed':[('golemar',(30,45,580,550)),('morcegante',(605,45,1045,560)),('cristalok',(1075,25,1525,550)),('basalto',(1545,35,1980,560)),('faiscorte',(70,580,560,1065)),('toupedra',(1075,595,1560,1065))],
 'e0589460':[('troncao',(15,45,610,1080)),('cogumestre',(610,45,1045,540)),('vesperula',(1080,40,1525,535)),('mantideo',(1515,45,1955,555)),('corujaco',(635,600,1050,1070)),('raizao',(1085,565,1570,1075))],
 '230724d9':[('carangao',(35,45,665,545)),('coralito',(760,30,1295,535)),('ostramia',(1370,35,1960,535)),('gaivotao',(95,585,615,1065)),('abissal',(675,565,1270,1065)),('polvorao',(1330,565,1965,1065))],
}
M = [('cabrito',(35,285,525,955)),('lagarto',(445,250,1025,930)),('grifo',(925,260,1505,935)),('lobo',(1415,345,1980,930))]
for f, items in L.items():
    src=U+f+'-image.jpg'; w=Image.open(src).size[0]
    recortar.cut_box(src,[b for _,b in items],'x',H=360,key='mag',scale=w/2000,fill=False,names=[f'boss/{k}.png' for k,_ in items])
src=U+'4677b574-image.jpg'; w=Image.open(src).size[0]
recortar.cut_box(src,[b for _,b in M],'x',H=300,key='mag',scale=w/2000,fill=False,names=[f'mnt/{k}.png' for k,_ in M])
import glob
fs=sorted(glob.glob('boss/*.png'))+sorted(glob.glob('mnt/*.png')); cols=10; rows=(len(fs)+cols-1)//cols
o=Image.new('RGBA',(cols*140,rows*140),(40,60,90,255))
for i,f in enumerate(fs):
    im=Image.open(f); im.thumbnail((132,132)); o.alpha_composite(im,((i%cols)*140+4,(i//cols)*140+4))
o.convert('RGB').save('/tmp/claude-0/f/chefes.png'); print(len(fs))
