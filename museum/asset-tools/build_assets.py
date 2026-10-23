# Turns the art picker's picks into the game's art (PNG per slot in built/), ready to go into the pack's assets.
import json, base64, io, os, colorsys
from PIL import Image
S='/tmp/claude-0/-home-user-GOChub/a3c8aa98-73fd-5b6e-823c-b5656ea02370/scratchpad'
MI=S+'/mi/1_Interiors/16x16'; MX=S+'/mx/Modern_Exteriors_16x16/ME_Theme_Sorter_16x16'
OUT=S+'/built'; out={}
cur=json.load(open(S+'/current.json'))
def curimg(k): return Image.open(io.BytesIO(base64.b64decode(cur[k]['src'].split(',')[1]))).convert('RGBA')
def rb(sheet, x, y, w, h): return Image.open(MI+'/Room_Builder_subfiles/Room_Builder_%s_16x16.png'%sheet).convert('RGBA').crop((x,y,x+w,y+h))
def put(k, im): out[k]=im; im.save(OUT+'/'+k+'.png')
# floors and walls (Room builder coordinates from the picks)
put('carpet_floor', rb('Floors',144,576,16,16)); put('hall_floor', rb('Floors',208,288,16,16))
for p,(x,y) in {'gallery':(192,576),'g2':(368,320),'g3':(368,32),'lobby':(16,480),'shop':(192,224)}.items():
    w=rb('Walls',x,y,16,32); put(p+'_wall_upper', w.crop((0,0,16,16))); put(p+'_wall_lower', w.crop((0,16,16,32)))
# benches
put('bench', Image.open(MX+'/13_School_Singles_16x16/ME_Singles_School_16x16_Bench_1.png').convert('RGBA'))
b5=Image.open(MX+'/3_City_Props_Singles_16x16/ME_Singles_City_Props_16x16_Bench_5.png').convert('RGBA')
bs=Image.new('RGBA',(16,32)); bs.alpha_composite(b5.crop((0,0,16,16)),(0,0)); bs.alpha_composite(b5.crop((0,32,16,48)),(0,16)); put('bench_side', bs) # three seats down to two (the middle seat out)
# the display case: your glass box on top of the pack's pedestal (#64), the game's art behind the glass
ped=Image.open(MI+'/Theme_Sorter_Singles/22_Museum_Singles/Museum_Singles_64.png').convert('RGBA')
case=Image.new('RGBA',(16,32)); case.alpha_composite(ped.crop((0,15,16,32)),(0,15)); glass=curimg('display_case').crop((0,0,16,15)); case.alpha_composite(glass,(0,0)); put('display_case', case)
# frames: the pack's frame moved up so its canvas sits over the art window (4,4)-(27,21), the canvas cut out, your plate below
def clear_from(im,x,y,tol=60):
    im=im.copy(); px=im.load(); W,H=im.size; c0=px[x,y]; seen=set(); st=[(x,y)]
    while st:
        a,b=st.pop()
        if (a,b) in seen or not (0<=a<W and 0<=b<H): continue
        seen.add((a,b)); c=px[a,b]
        if c[3]==0 or sum(abs(c[i]-c0[i]) for i in range(3))>tol: continue
        px[a,b]=(0,0,0,0); st+=[(a+1,b),(a-1,b),(a,b+1),(a,b-1)]
    return im
for slot,n in (('wall_frame_gold',93),('wall_frame_wood',91)):
    src=Image.open(MI+'/Theme_Sorter_Singles/22_Museum_Singles/Museum_Singles_%d.png'%n).convert('RGBA'); bb=src.getbbox(); fr=src.crop(bb)
    im=Image.new('RGBA',(32,32)); im.alpha_composite(fr,(bb[0],1)); im=clear_from(im,16,11)
    plate=curimg(slot).crop((0,26,32,32)); im.alpha_composite(plate,(0,23)); put(slot, im)
# plants: six colors side by side (the game picks one per plant), four stages from tired to flowering
cols=['Violet','Pink','Red','Bordeaux','White_1','White_2']
def common(ims): # the colors every version shares (pot, leaves, outline); anything else is a petal
    sets=[set(c for c in im.getdata() if c[3]) for im in ims]; return set.intersection(*sets)
def leafy(c): return c[1]>c[0]+8 and c[1]>=c[2]
def stage(im, kind, shared):
    im=im.copy(); px=im.load(); W,H=im.size
    leaf=[c for c in shared if leafy(c)] or [(90,160,70,255),(40,90,40,255)]
    lg=max(leaf,key=lambda c:c[1]); ld=min(leaf,key=lambda c:c[1])
    def dry(c): h,l,s2=colorsys.rgb_to_hls(*[v/255 for v in c[:3]]); r,g,b=colorsys.hls_to_rgb(0.12,l*0.92,s2*0.5); return (int(r*255),int(g*255),int(b*255),255)
    for y in range(H):
        for x in range(W):
            c=px[x,y]
            if not c[3]: continue
            if c not in shared: # a petal
                lum=(0.3*c[0]+0.59*c[1]+0.11*c[2])/255; base=lg if lum>0.45 else ld
                if kind=='full': px[x,y]=tuple(int(base[i]*0.55+c[i]*0.45) for i in range(3))+(255,) # buds
                else: px[x,y]=dry(base) if kind=='thirsty' else base
            elif kind=='thirsty' and leafy(c): px[x,y]=dry(c)
    return im
pots=[Image.open(MX+'/19_Graveyard_Singles_16x16/ME_Singles_Graveyard_16x16_%s_Flowers_Pot.png'%c).convert('RGBA') for c in cols]
SH=common(pots)
for k,kind in (('plant_thirsty','thirsty'),('plant','normal'),('plant_full','full'),('plant_flower','flower')):
    sheet=Image.new('RGBA',(16*len(pots),16))
    for i,p in enumerate(pots): sheet.alpha_composite(p if kind=='flower' else stage(p,kind,SH),(16*i,0))
    put(k, sheet)
fb=Image.open(MX+'/3_City_Props_Singles_16x16/ME_Singles_City_Props_16x16_Flower_Bush_1.png').convert('RGBA')
put('planter_wide_flower', fb)
bushes=[Image.open(MX+'/3_City_Props_Singles_16x16/ME_Singles_City_Props_16x16_Flower_Bush_%d.png'%i).convert('RGBA') for i in (1,2,3)]
put('planter_wide', stage(fb,'normal',common(bushes)))
# a contact sheet to check
keys=list(out); W=sum(max(32,out[k].size[0])+6 for k in keys)
sh=Image.new('RGBA',(min(W,1400), 40*((W//1400)+1)+10),(200,200,210,255)); x=y=4
for k in keys:
    im=out[k]
    if x+im.size[0]>1396: x=4; y+=40
    sh.alpha_composite(im,(x,y)); x+=max(32,im.size[0])+6
sh.resize((sh.size[0]*2,sh.size[1]*2),Image.NEAREST).save(S+'/built-sheet.png')
json.dump({k:'data:image/png;base64,'+base64.b64encode(open(OUT+'/'+k+'.png','rb').read()).decode() for k in out},open(S+'/built.json','w'))
print(len(out), list(out))
