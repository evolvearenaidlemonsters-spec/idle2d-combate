# Gera a Pokédex original do jogo a partir da estrutura (graus, tipos, status, evolução, golpes) da referência.
# Nomes, textos e visual são próprios; nada de nomes da referência vai para o jogo.
import json, re, sys, random, collections
src, out = sys.argv[1], sys.argv[2]
raw = json.load(open(src))
LOCKED = {'Mega','SS','Overlord','Overlord Ressonância'}
SYL = {
 'Fogo':['bra','fla','ign','pir','ar','cin','bra','ful','tiz','lum'], 'Água':['go','ma','ri','aqu','on','del','pe','lu','na','cor'],
 'Planta':['fo','ra','mus','ver','bro','fe','ti','lia','sem','ga'], 'Elétrico':['fa','vol','zi','tro','ra','pi','zap','cin','te','lu'],
 'Inseto':['ca','sar','zum','li','be','ro','pu','ti','fo','mel'], 'Pedra':['ro','gra','ba','tor','pe','dur','ma','gu','sil','ar'],
 'Terra':['te','bar','gru','lo','du','na','po','ra','cav','to'], 'Metálico':['fer','cro','lat','zi','me','ta','bro','ni','qua','ar'],
 'Voador':['ae','plu','ven','ga','vo','ci','la','ru','e','sa'], 'Gelo':['ge','gla','ne','cri','in','vé','po','la','fri','sa'],
 'Psíquico':['me','psi','ten','ra','mi','ol','sen','vi','an','ze'], 'Fantasma':['so','um','fan','ec','lu','va','nu','bru','ma','vo'],
 'Dragão':['dra','vor','ka','zar','ri','ten','dra','go','sur','an'], 'Fada':['fe','lu','ci','ma','be','ri','fi','na','sa','li'],
 'Batalha':['pu','gol','tu','bra','ma','cus','ri','to','ka','ze'], 'Venenoso':['to','xi','pe','gu','vi','ne','ro','sa','mu','co'],
 'Noturno':['no','tre','vu','ul','ma','sa','gra','um','bo','ca'], 'Normal':['pe','lu','bo','ni','ma','ta','po','li','fu','co'],
}
END = ['o','im','ito','udo','or','ão','ix','el','ar','in','eta','um']
STAGE_END = ['', 'or', 'ante', 'eon', 'ius']
TYPES = list(SYL)
def clean_type(t): return t if t in SYL else 'Normal'
WORDS = {'Trevas','Hipno','Paras'}  # nomes da referência que também são palavras comuns
rows=[]
for x in raw:
    p = x['lista'].split('|'); grade, name, total = p[0], p[1], int(p[-1].replace('.',''))
    types = [clean_type(t) for t in p[2:-1] if t not in ('Silvally',)] or ['Normal']
    types = list(dict.fromkeys(types))[:2]
    rows.append(dict(id=int(x['id']), fam=x['fam'], grade=grade, ref=name, types=types, total=total, x=x))
REFNAMES = sorted({r['ref'] for r in rows if len(r['ref'])>3 and r['ref'] not in WORDS}, key=len, reverse=True)
byref = collections.defaultdict(list)
for r in rows: byref[r['ref']].append(r)
# estágio de cada forma pela linha evolutiva da referência
def stage_of(r):
    evo = r['x']['evo'] or ''
    parts = re.split(r'Estágio (\d+)', evo)
    for i in range(1, len(parts)-1, 2):
        if r['ref'] in parts[i+1]: return int(parts[i])
    return 1
for r in rows: r['stage'] = stage_of(r)
# famílias: mesma "fam" + mesma linha evolutiva
fams = collections.defaultdict(list)
for r in rows: fams[(r['x']['evo'] or r['fam'])].append(r)
rnd = random.Random(7); used=set()
def root_for(t):
    while True:
        s = rnd.choice(SYL[t]).capitalize() + rnd.choice(SYL[t]) + (rnd.choice(SYL[t]) if rnd.random()<.25 else '')
        if s not in used: used.add(s); return s
names=set()
for key, members in fams.items():
    members.sort(key=lambda r:(r['stage'], r['id']))
    t = members[0]['types'][0]; root = root_for(t); end = rnd.choice(END)
    seen = collections.Counter()
    for r in members:
        st = r['stage']; g = r['grade']
        base = root + (end if st==1 else STAGE_END[min(st,4)] if g not in ('Mega','Overlord','Overlord Ressonância') else STAGE_END[min(max(st-1,1),4)])
        if g=='Mega': nm = 'Mega ' + base
        elif g=='Overlord': nm = base + ' Soberano'
        elif g=='Overlord Ressonância': nm = base + ' Ressonante'
        else: nm = base
        seen[nm]+=1
        if seen[nm]>1 or sum(1 for m in members if m is not r and m['stage']==st and m['grade']==g)>0:
            nm = nm + ' ' + (r['types'][-1] if len(set(m['types'][-1] for m in members if m['stage']==st and m['grade']==g))>1 else ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ'][seen[nm]-1])
        k=2; base_nm=nm
        while nm in names: nm = f'{base_nm} {k}'; k+=1
        names.add(nm); r['name']=nm; r['familia']=root
# textos: troca termos da referência por termos do jogo e descarta textos não catalogados
def tidy(s):
    s = re.sub(r'Pokémons?|Pokemons?|pets?', lambda m:'monstros' if m.group(0).endswith('s') else 'monstro', s)
    for ref in REFNAMES: s = re.sub(r'\b'+re.escape(ref)+r'\b', 'o monstro', s)
    return s.strip()
def parse_hab(h):
    if not h: return [], None
    h = re.sub(r'#\d+Não catalogada\.', '', h)
    main, _, sup = h.partition('Habilidade de suporte')
    out=[]
    for m in re.finditer(r'([A-ZÀ-Ý][\wÀ-ÿ\. ]{1,24}? (?:I{1,3}|IV|V))(?=[A-ZÀ-Ý])(.*?)(?=(?:[A-ZÀ-Ý][\wÀ-ÿ\. ]{1,24}? (?:I{1,3}|IV|V))(?=[A-ZÀ-Ý])|$)', main):
        txt = m.group(2).strip()
        if any(re.search(r'\b'+re.escape(ref)+r'\b', m.group(1)) for ref in REFNAMES): continue
        if txt and 'catalogada' not in txt and not re.search(r'[ảạấầẩẫậắằẳẵặẻẽếềểễệỉịỏọốồổỗộớờởỡợủụứừửữựỳỵỷỹđ]', txt): out.append({'n':m.group(1).strip(),'d':tidy(txt)[:160]})
    s = None
    m = re.match(r'([A-ZÀ-Ý][\wÀ-ÿ\. ]{1,24}? (?:I{1,3}|IV|V))(.*)', sup.strip())
    if m: s = {'n':m.group(1).strip() if not any(re.search(r'\b'+re.escape(ref)+r'\b', m.group(1)) for ref in REFNAMES) else 'Apoio Ancestral','d':tidy(m.group(2))[:160]}
    return out[:3], s
def parse_golpes(g):
    if not g: return []
    g = re.sub(r'^\d+','',g); out=[]
    for m in re.finditer(r'(.+?)(inicial|afinidade (\d+))(.*?[Pp]oder d[ae] [Hh]abilidade:?\s*(\d+))', g):
        nm = m.group(1).strip(); desc = m.group(4)
        typ = re.search(r'[Tt]ipo ([A-ZÀ-Ý][a-zà-ÿ]+)', desc); rng = re.search(r'Alcance:\s*([A-Za-zÀ-ÿ ]+?)\s*[Pp]oder', desc)
        cat = 'esp' if re.search(r'ATQ\.?\s?E|SP\.ATK', desc) else 'fis'
        t = clean_type(typ.group(1)) if typ else None
        if re.search(r'[ảạấầẩẫậắằẳẵặẻẽếềểễệỉịỏọốồổỗộớờởỡợủụứừửữựỳỵỷỹđ]', nm+desc) or len(nm)>28: continue
        if any(re.search(r'\b'+re.escape(ref)+r'\b', nm) for ref in REFNAMES): nm = 'Golpe Ancestral' if '(Passiva)' not in nm else 'Aura Ancestral (Passiva)'
        out.append({'n':nm, 'af':int(m.group(3) or 0), 't':t, 'c':cat, 'r':(rng.group(1).strip().lower() if rng else ''), 'p':int(m.group(5)), 'pas':'(Passiva)' in nm,
                    'd':tidy(re.sub(r'\s*Alcance:.*$','',desc))[:110]})
    return out[:5]
def nums(s, keys):
    o=[]; 
    for k in keys:
        m = re.search(re.escape(k)+r'\s*\+?([\d.]+)', s or ''); o.append(int(m.group(1).replace('.','')) if m else 0)
    return o
dex=[]
for r in sorted(rows, key=lambda r:r['id']):
    x = r['x']; hab, sup = parse_hab(x['hab']); req = x['req'] or ''
    lv = re.search(r'Nível mínimo(\d+)', req); af = re.search(r'Afinidade(\d+)', req); items = re.findall(r'Item #\d+×(\d+)', req)
    ganho = (x['ganho'] or '').split('Eficácia')[0]
    ob = x['obter'] or ''
    obt = sorted(set(k for k in ['Evolução','Masmorra','Sorteio','Overlord','Primeira recarga','Loja PvP'] if k in ob)) or ['Desconhecido']
    dex.append({'id':r['id'], 'fam':r['familia'], 'st':r['stage'], 'g':r['grade'], 'nm':r['name'], 'tp':r['types'], 'tot':r['total'],
        'b':[int(v.replace('.','')) for v in x['base'].split(',')], 'hab':hab, 'sup':sup, 'gol':parse_golpes(x['golpes']),
        'evo':{'lv':int(lv.group(1)) if lv else 0, 'af':int(af.group(1)) if af else 0, 'it':sum(map(int,items))} if req else None,
        'gan':nums(ganho,['PS','ATQ','DEF','ATQ.ES','DEF.ES','VEL']) if ganho else None, 'ob':obt, 'col':tidy(x['colecao'] or ''),
        'lock': r['grade'] in LOCKED})
# cadeia: ids da mesma família por estágio
famids = collections.defaultdict(list)
for e in dex: famids[e['fam']].append(e)
for e in dex: e['ch'] = sorted([m['id'] for m in famids[e['fam']]], key=lambda i: next((m['st'],m['id']) for m in famids[e['fam']] if m['id']==i))
leaks = [e for e in dex if any(re.search(r'\b'+re.escape(ref)+r'\b', json.dumps(e, ensure_ascii=False)) for ref in REFNAMES if len(ref)>4)]
print('formas', len(dex), 'famílias', len(famids), 'bloqueadas', sum(e['lock'] for e in dex), 'nomes únicos', len({e['nm'] for e in dex}), 'vazamentos de nome', len(leaks))
print('sem golpes', sum(1 for e in dex if not e['gol']), 'sem passivas', sum(1 for e in dex if not e['hab']))
json.dump(dex, open(out,'w'), ensure_ascii=False, separators=(',',':'))
