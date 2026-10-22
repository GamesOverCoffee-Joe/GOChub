import sys,glob,os,re
from PIL import Image,ImageDraw
# sheet.py out.png scale cols files...  (labels: index in list)
out,sc,cols=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]); files=sys.argv[4:]
ims=[Image.open(f).convert('RGBA') for f in files]
cw=max(i.size[0] for i in ims); ch=max(i.size[1] for i in ims)
cellw=cw*sc+4; cellh=ch*sc+14; rows=(len(ims)+cols-1)//cols
S=Image.new('RGBA',(cols*cellw,rows*cellh),(205,205,215,255)); d=ImageDraw.Draw(S)
for k,(f,im) in enumerate(zip(files,ims)):
    x=(k%cols)*cellw; y=(k//cols)*cellh
    S.alpha_composite(im.resize((im.size[0]*sc,im.size[1]*sc),Image.NEAREST),(x+2,y+12))
    lab=re.sub(r'.*?(\d+)\.png$',r'\1',os.path.basename(f)); d.text((x+2,y),lab,fill=(0,0,0,255))
S.save(out)
