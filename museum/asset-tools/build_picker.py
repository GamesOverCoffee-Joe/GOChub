import json, base64, io, glob, os, re
from PIL import Image
S='/tmp/claude-0/-home-user-GOChub/a3c8aa98-73fd-5b6e-823c-b5656ea02370/scratchpad'
MI=S+'/mi/1_Interiors/16x16'; TS=MI+'/Theme_Sorter_Singles'; MX=S+'/mx/Modern_Exteriors_16x16/ME_Theme_Sorter_16x16'
def uri(im):
    b=io.BytesIO(); im.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def mus(n): return (TS+'/22_Museum_Singles/Museum_Singles_%d.png'%n, 'Interiors · Museum #%d'%n)
def liv(n): return (TS+'/2_Living_Room_Singles/Living_Room_Singles_%d.png'%n, 'Interiors · Living room #%d'%n)
def conf(n): return (TS+'/13_Conference_Hall_Singles/Conference_Hall_Singles_%d.png'%n, 'Interiors · Conference hall #%d'%n)
def ext(pat):
    out=[]
    for f in sorted(glob.glob(MX+'/*/'+pat), key=lambda s:[int(t) if t.isdigit() else t for t in re.split(r'(\d+)',s)]):
        nm=re.sub(r'^ME_Singles_|^\d+_[A-Za-z_]+?_16x16_','',os.path.basename(f)[:-4]); nm=re.sub(r'^[A-Za-z_]+?_16x16_','',nm)
        out.append((f,'Exteriors · '+nm.replace('_',' ')))
    return out
def fit(path, w, h):
    im=Image.open(path).convert('RGBA'); bb=im.getbbox()
    if not bb: return None
    c=im.crop(bb); cw,ch=c.size
    if cw<=w and ch<=h:
        out=Image.new('RGBA',(w,h),(0,0,0,0)); out.alpha_composite(c,((w-cw)//2,h-ch)); return out,'fits',''
    tw,th=(cw+15)//16,(ch+15)//16
    out=Image.new('RGBA',(tw*16,th*16),(0,0,0,0)); out.alpha_composite(c,((tw*16-cw)//2,th*16-ch))
    return out,'resize','%d×%d tiles here'%(tw,th)
def shrink(im, w, h): # bigger than the spot: scaled down to fit, for the live preview only
    k=min(w/im.size[0], h/im.size[1]); s=im.resize((max(1,round(im.size[0]*k)),max(1,round(im.size[1]*k))),Image.NEAREST)
    out=Image.new('RGBA',(w,h),(0,0,0,0)); out.alpha_composite(s,((w-s.size[0])//2,h-s.size[1])); return out
def clear_from(im, x, y, tol=48): # flood-fill the colour at (x,y) to transparent: a frame's canvas, a case's glass
    im=im.copy(); px=im.load(); W,H=im.size
    if not (0<=x<W and 0<=y<H): return im
    c0=px[x,y]; seen=set(); st=[(x,y)]
    while st:
        a,b=st.pop()
        if (a,b) in seen or not (0<=a<W and 0<=b<H): continue
        seen.add((a,b)); c=px[a,b]
        if c[3]==0 or sum(abs(c[i]-c0[i]) for i in range(3))>tol: continue
        px[a,b]=(0,0,0,0); st+= [(a+1,b),(a-1,b),(a,b+1),(a,b-1)]
    return im
POST={'display_case':lambda im: clear_from(im,8,9), 'wall_frame_gold':lambda im: clear_from(im,16,14), 'wall_frame_wood':lambda im: clear_from(im,16,14)}
ALSO={'plant':['plant_thirsty'],'trash_can':['trash_full']}
def cands(slot, items, w, h, fitnote=None):
    out=[]
    for i,(p,lab) in enumerate(items):
        if not os.path.exists(p): continue
        r=fit(p,w,h)
        if not r: continue
        im,f,n=r
        pv=im if f=='fits' else shrink(im,w,h)
        if slot in POST: pv=POST[slot](pv)
        ap={slot:uri(pv)}
        for k in ALSO.get(slot,[]): ap[k]=ap[slot]
        out.append(dict(id=slot+'-'+str(i), src=uri(im), w=im.size[0], h=im.size[1], from_=lab, path=os.path.relpath(p,S), fit=fitnote or f, note=n, apply=ap))
    return out
# floors: each style is a 3x2 block; take its top-middle tile
F=Image.open(MI+'/Room_Builder_subfiles/Room_Builder_Floors_16x16.png').convert('RGBA'); floors=[]
for gx in (0,64,128,192):
    for y in range(32,640,32):
        t=F.crop((gx+16,y,gx+32,y+16))
        if t.getbbox() and min(a for *_,a in t.get_flattened_data())==255: floors.append(dict(src=uri(t),w=16,h=16,from_='Interiors · Room builder floor %d'%(len(floors)+1),path='Room_Builder_Floors@%d,%d'%(gx+16,y),fit='fits',note='',tile=True))
W=Image.open(MI+'/Room_Builder_subfiles/Room_Builder_Walls_16x16.png').convert('RGBA'); walls=[]
for gx in (0,176,352):
    for y in range(0,640,32):
        t=W.crop((gx+16,y,gx+32,y+32))
        if t.getbbox() and min(a for *_,a in t.get_flattened_data())==255: walls.append(dict(src=uri(t),w=16,h=32,from_='Interiors · Room builder wall %d'%(len(walls)+1),path='Room_Builder_Walls@%d,%d'%(gx+16,y),fit='fits',note='',tile=True))
def ropes():
    out=[]
    for name,ns in [('black',[74,71,72,73,75]),('gold',[79,76,77,78,80]),('silver',[84,81,82,83,85])]:
        ims=[Image.open(mus(n)[0]).convert('RGBA') for n in ns]; strip=Image.new('RGBA',(16*len(ims),32),(0,0,0,0))
        for k,im in enumerate(ims): strip.alpha_composite(im,(16*k,32-im.size[1]))
        sq=[im.resize((16,16),Image.NEAREST) for im in ims]; pv=Image.new('RGBA',(48,16),(0,0,0,0))
        for k,j in enumerate((0,2,4)): pv.alpha_composite(sq[j],(16*k,0))
        out.append(dict(apply={'velvet_rope':uri(pv)},src=uri(strip),w=strip.size[0],h=32,from_='Interiors · Museum #%s (%s posts and rope)'%(', '.join(map(str,ns)),name),path=','.join(mus(n)[0][len(S)+1:] for n in ns),fit='resize',note='The posts are 2 tiles tall'))
    return out
cur=json.load(open(S+'/current.json'))
def C(k): return cur[k]
def wallcur(p): # top, upper, lower stacked
    ims=[]
    for k in (p+'_wall_top',p+'_wall_upper',p+'_wall_lower'):
        b=base64.b64decode(cur[k]['src'].split(',')[1]); ims.append(Image.open(io.BytesIO(b)).convert('RGBA').crop((0,0,16,16)))
    out=Image.new('RGBA',(16,48)); [out.alpha_composite(im,(0,16*i)) for i,im in enumerate(ims)]; return uri(out), any(cur[k]['own'] for k in (p+'_wall_top',p+'_wall_upper',p+'_wall_lower'))
def first(k,w,h): b=base64.b64decode(cur[k]['src'].split(',')[1]); return uri(Image.open(io.BytesIO(b)).convert('RGBA').crop((0,0,w,h)))
groups=[]
def slot(group,key,label,w,h,items=None,pool=None,note='',current=None,own=None,tile=False,strip=False):
    cs=pool if pool is not None else cands(key,items,w,h)
    cs=[dict(c) for c in cs]
    for i,c in enumerate(cs):
        c['id']=key+'-'+str(i)
        if 'apply' not in c:
            if key.endswith('_wall'):
                b=base64.b64decode(c['src'].split(',')[1]); im=Image.open(io.BytesIO(b)).convert('RGBA')
                c['apply']={key+'_upper':uri(im.crop((0,0,16,16))), key+'_lower':uri(im.crop((0,16,16,32)))}
            else: c['apply']={key:c['src']}
    g=next((x for x in groups if x['name']==group),None)
    if not g: g=dict(name=group,slots=[]); groups.append(g)
    g['slots'].append(dict(key=key,label=label,w=w,h=h,note=note,current=current or first(key,w,h),own=C(key)['own'] if own is None and key in cur else bool(own),tile=tile,strip=strip,cands=[dict(c) for c in cs]))
fl='Tiles in every direction.'
slot('Floors','carpet_floor','Wing floor (carpet)',16,16,pool=floors,note='Every Volume wing uses this one, recolored with the wing\'s own color.',tile=True)
slot('Floors','hall_floor','Hallway floor',16,16,pool=floors,note='The halls between the wings, and the lobby.',tile=True)
for p,nm,nt in [('gallery','Wing wall A','Two of the wings, each in its own color.'),('g2','Wing wall B','One wing, in its color.'),('g3','Wing wall C','One wing, in its color.'),('staff','Staff room wall','The staff room, and one wing in its color.'),('lobby','Hallway wall','The lobby and the halls (the halls fade it from one wing\'s color to the next).'),('shop','Café and gift shop wall','')]:
    src,own=wallcur(p); slot('Walls',p+'_wall',nm,16,32,pool=walls,note=(nt+' ' if nt else '')+'Upper and lower rows; the wall top stays.',current=src,own=own,tile=True)
slot('Exhibits','display_case','Episode display case',16,32,[mus(n) for n in (28,29,30,64,65)],note='The game\'s art shows through the glass, so I\'d clear the glass and anything inside it.')
fr=[mus(n) for n in (91,92,93,89,90)]
slot('Exhibits','wall_frame_gold','Gold frame (episodes)',32,32,fr,note='I\'d cut the canvas out so the episode art shows through.')
slot('Exhibits','wall_frame_wood','Wood frame (community pieces)',32,32,fr,note='Same as the gold frame.')
slot('Exhibits','velvet_rope','Velvet rope',48,16,pool=ropes(),note='The game draws a post, a rope across and a rope up and down (the last one here is the up-and-down piece). The pack\'s posts stand 2 tiles tall, so ropes would get taller.',strip=True)
slot('Exhibits','sign_stand','Sign stand',16,16,[mus(n) for n in (31,32,33,34,35,88,182,183,184,185,201)])
slot('Exhibits','overflow_screen','Touch screen (Volume I)',16,32,[conf(41),conf(43),mus(389),mus(390)])
benches=[mus(36)]+ext('*School_16x16_Bench_*.png')+ext('*Two_Seats_*_Bench_Frontal_*.png')+ext('*Cut_Wood_Bench_1.png')+ext('*City_Props_16x16_Bench_[17].png')
slot('Furniture','bench','Bench',32,16,benches)
slot('Furniture','bench_side','Bench, sideways',16,32,ext('*Two_Seats_*_Bench_Lateral_*.png')+ext('*City_Props_16x16_Bench_[3456].png'),note='Drawn facing left; the game mirrors it for the other side.')
plants=[mus(195),mus(196),mus(197),liv(15),liv(16),liv(14)]+ext('*Plant_Vase_*.png')+ext('*Potted_Plant_*.png')+ext('*Graveyard_16x16_*Flowers_Pot.png')+ext('*City_Props_16x16_Pot_*.png')
slot('Furniture','plant','Potted plant',16,16,plants,note='Plants get watered, so I\'d make a droopy version from your pick for the thirsty look.')
slot('Furniture','planter_wide','Long planter',32,16,ext('*Flower_Bush_*.png')+ext('*Garden_16x16_Bush_1[45].png'))
slot('Furniture','trash_can','Trash can',16,16,ext('*City_Props_16x16_Trashbin_*.png')+ext('*Single_Trash_*.png')+[conf(53)],note='Trash cans fill up, so I\'d draw the full-up heap on top of your pick.')
n=sum(len(s['cands']) for g in groups for s in g['slots'])
open(S+'/picker/data.js','w').write('window.PICKER='+json.dumps(dict(groups=groups),separators=(',',':')).replace('"from_"','"from"')+';')
print('slots',sum(len(g['slots']) for g in groups),'cands',n,'bytes',os.path.getsize(S+'/picker/data.js'))
for g in groups: print(g['name'],[(s['key'],len(s['cands']),sum(c['fit']=='fits' for c in s['cands'])) for s in g['slots']])
