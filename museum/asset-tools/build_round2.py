# Round 2 of the art picker: café and gift shop, lobby, staff room, office, B1 Storage, screening nook.
import json, base64, io, glob, os, re
from PIL import Image
S='/tmp/claude-0/-home-user-GOChub/a3c8aa98-73fd-5b6e-823c-b5656ea02370/scratchpad'
MI=S+'/mi/1_Interiors/16x16'; TS=MI+'/Theme_Sorter_Singles'; MX=S+'/mx/Modern_Exteriors_16x16/ME_Theme_Sorter_16x16'
def uri(im): b=io.BytesIO(); im.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
cur=json.load(open(S+'/current2.json'))
def cururi(k,w,h): b=base64.b64decode(cur[k]['src'].split(',')[1]); return uri(Image.open(io.BytesIO(b)).convert('RGBA').crop((0,0,w,h)))
THEME={k:d for d in os.listdir(TS) for k in [re.sub(r'^\d+_|_Singles$|_SIngles$','',d).lower()]}
def theme_files(name):
    d=TS+'/'+THEME[name]; fs=glob.glob(d+'/*.png'); fs.sort(key=lambda s:int(re.findall(r'(\d+)\.png$',s)[0]) if re.findall(r'(\d+)\.png$',s) else 0); return fs
LABEL={k:re.sub(r'_',' ',re.sub(r'^\d+_|_Singles$|_SIngles$','',d)) for k,d in THEME.items()}
def pool(w, h, themes, minfill=0.45, cap=40, taller=None):
    taller = (h==16 and w>=32) if taller is None else taller
    out=[]; seen=set()
    for t in themes:
        for f in theme_files(t):
            im=Image.open(f).convert('RGBA'); bb=im.getbbox()
            if not bb: continue
            c=im.crop(bb); cw,ch=c.size
            big = cw<=w and h<ch<=h+16 and cw>=w*0.7 and taller # one tile deeper than the spot (counters, desks): shown shrunk, needs a size change
            if not big and (cw>w or ch>h or cw*ch < minfill*w*h or cw < w*0.7 or ch < h*(0.6 if h>16 else 0.45)): continue
            key=c.tobytes()
            if key in seen: continue
            seen.add(key); n=re.findall(r'(\d+)\.png$',f)[0]
            if big:
                k=min(w/cw,h/ch); sm=c.resize((max(1,round(cw*k)),max(1,round(ch*k))),Image.NEAREST); p=Image.new('RGBA',(w,h)); p.alpha_composite(sm,((w-sm.size[0])//2,h-sm.size[1]))
                out.append(dict(src=uri(p),w=w,h=h,from_='Interiors · %s #%s'%(LABEL[t],n),path=os.path.relpath(f,S),fit='resize',note='%d×%d tiles'%((cw+15)//16,(ch+15)//16),apply=None)); continue
            p=Image.new('RGBA',(w,h)); p.alpha_composite(c,((w-cw)//2,h-ch))
            out.append(dict(src=uri(p),w=w,h=h,from_='Interiors · %s #%s'%(LABEL[t],n),path=os.path.relpath(f,S),fit='fits',note='',apply=None))
            if len(out)>=cap: return out
    return out
F=Image.open(MI+'/Room_Builder_subfiles/Room_Builder_Floors_16x16.png').convert('RGBA'); floors=[]
for gx in (0,64,128,192):
    for y in range(32,640,32):
        t=F.crop((gx+16,y,gx+32,y+16))
        if t.getbbox() and min(a for *_,a in t.get_flattened_data())==255: floors.append(dict(src=uri(t),w=16,h=16,from_='Interiors · Room builder floor %d'%(len(floors)+1),path='Room_Builder_Floors@%d,%d'%(gx+16,y),fit='fits',note='',tile=True))
groups=[]
ROOM={'Café and gift shop':'museum:cafe','Lobby':'lobby','Staff room':'staff',"Curator's office":'office','B1 Storage':'storage','Screening nook':'screening'}
def slot(group,key,label,w,h,cands,note='',tile=False):
    if not cands: return # nothing in the packs fits this spot as one piece
    cs=[]
    for i,c in enumerate(cands):
        c=dict(c); c['id']=key+'-'+str(i); c.pop('apply',None); cs.append(c) # the page applies src to the slot (and its partner slots)
    g=next((x for x in groups if x['name']==group),None)
    if not g: g=dict(name=group,slots=[]); groups.append(g)
    g['slots'].append(dict(room=ROOM[group],key=key,label=label,w=w,h=h,note=note,current=cururi(key,w,h),own=cur[key]['own'],tile=tile,strip=False,cands=cs))
KIT=['kitchen','ice_cream_shop','grocery_store']; SHOP=['grocery_store','clothing_store','museum','ice_cream_shop']; HOME=['living_room','bedroom','condominium']
slot('Café and gift shop','shop_floor','Café and shop floor',16,16,floors,note='Tiles in every direction.',tile=True)
slot('Café and gift shop','cafe_counter','Café counter',48,16,pool(48,16,KIT+['museum','hospital']))
slot('Café and gift shop','espresso_machine','Espresso machine',16,32,pool(16,32,KIT,0.3))
slot('Café and gift shop','cafe_table','Café table',16,16,pool(16,16,KIT+HOME+['conference_hall','classroom_and_library']))
slot('Café and gift shop','cafe_stool','Café stool',16,16,pool(16,16,KIT+HOME+['conference_hall','classroom_and_library'],0.3))
slot('Café and gift shop','shop_counter','Gift shop counter',48,16,pool(48,16,SHOP+['hospital']))
slot('Café and gift shop','shop_shelves','Gift shop shelves',32,32,pool(32,32,SHOP+['classroom_and_library']))
slot('Café and gift shop','shelf_unit','Wide shelf unit',48,32,pool(48,32,SHOP+['classroom_and_library','basement']))
slot('Café and gift shop','item_rack','Item rack',32,32,pool(32,32,['clothing_store','grocery_store']))
slot('Café and gift shop','mug_shelf','Mug shelf',32,32,pool(32,32,KIT+HOME))
slot('Café and gift shop','featured_stand','Featured stand',16,32,pool(16,32,SHOP))
slot('Café and gift shop','postcard_spinner','Postcard spinner',16,32,pool(16,32,['grocery_store','clothing_store','museum']))
slot('Café and gift shop','magazine_rack','Magazine rack',16,32,pool(16,32,['classroom_and_library','grocery_store','hospital','living_room']))
slot('Café and gift shop','floor_lamp','Floor lamp',16,32,pool(16,32,HOME+['hospital','conference_hall'],0.2))
slot('Café and gift shop','planter','Planter (café and lobby)',16,16,pool(16,16,['living_room','museum','grocery_store','hospital'],0.35),note='The flowering version would be made from your pick.')
slot('Café and gift shop','basket','Basket',16,16,pool(16,16,['grocery_store','clothing_store','living_room'],0.35))
slot('Lobby','lobby_floor','Lobby floor',16,16,floors,note='Tiles in every direction.',tile=True)
slot('Lobby','front_desk','Front desk',48,16,pool(48,16,['museum','hospital','conference_hall']+SHOP))
slot('Staff room','staff_floor','Staff room floor',16,16,floors,note='Tiles in every direction.',tile=True)
slot('Staff room','lockers','Lockers',16,32,pool(16,32,['gym','classroom_and_library','hospital','jail']))
slot('Staff room','break_table','Break table',32,16,pool(32,16,KIT+HOME+['conference_hall']))
slot('Staff room','coffee_counter','Coffee counter',32,16,pool(32,16,KIT))
slot('Staff room','fridge','Fridge',16,32,pool(16,32,KIT))
slot('Staff room','collection_cabinet','Collection cabinet',48,32,pool(48,32,HOME+['museum','classroom_and_library']))
slot('Staff room','corkboard','Corkboard',32,32,pool(32,32,['classroom_and_library','conference_hall','hospital']))
slot('Staff room','whiteboard','Whiteboard',32,32,pool(32,32,['classroom_and_library','conference_hall','hospital']))
slot('Curator\'s office','office_desk','Desk',48,32,pool(48,32,['television_and_film_studio','conference_hall']+HOME+['classroom_and_library']))
slot('Curator\'s office','pc_tower','PC tower',16,32,pool(16,32,['television_and_film_studio','conference_hall','bedroom']))
slot('Curator\'s office','office_shelf','Bookshelf',32,32,pool(32,32,['classroom_and_library']+HOME))
slot('Curator\'s office','office_chair','Office chair',16,16,pool(16,16,['conference_hall','classroom_and_library','television_and_film_studio','bedroom'],0.3))
slot('Curator\'s office','camera_tripod','Camera on a tripod',16,32,pool(16,32,['television_and_film_studio'],0.2))
slot('Curator\'s office','softbox','Studio light',16,32,pool(16,32,['television_and_film_studio'],0.2))
slot('Curator\'s office','deck_table','Small table',16,16,pool(16,16,HOME+['conference_hall'],0.35))
slot('B1 Storage','storage_shelves','Storage shelves',32,32,pool(32,32,['basement','grocery_store']))
slot('B1 Storage','box_stack','Box stack',16,32,pool(16,32,['basement','grocery_store']))
slot('B1 Storage','workbench','Workbench',48,16,pool(48,16,['basement','kitchen']))
slot('Screening nook','popcorn_stand','Popcorn stand',16,32,pool(16,32,['ice_cream_shop','grocery_store','kitchen'],0.3))
for g in groups: [s['cands'].__len__() for s in g['slots']]
open(S+'/picker/data.js','w').write('window.PICKER='+json.dumps(dict(groups=groups),separators=(',',':')).replace('"from_"','"from"')+';')
print('slots',sum(len(g['slots']) for g in groups),'cands',sum(len(s['cands']) for g in groups for s in g['slots']),'bytes',os.path.getsize(S+'/picker/data.js'))
for g in groups: print(g['name'],[(s['key'],len(s['cands'])) for s in g['slots']])
