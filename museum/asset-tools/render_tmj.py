# Render a Tiled .tmj (with the starter kit's tilesets) to a PNG: tiled_render.py MAP KIT OUT
import json, sys, re, os
from PIL import Image
mp, kit, out = sys.argv[1:4]
m = json.load(open(mp)); W, H = m['width'], m['height']
sets = []
for t in m['tilesets']:
    p = os.path.join(kit, 'tilesets', os.path.basename(t['source'])); x = open(p).read()
    img = re.search(r'<image source="\.\./([^"]+)"', x).group(1); cols = int(re.search(r'columns="(\d+)"', x).group(1))
    sets.append((t['firstgid'], Image.open(os.path.join(kit, img)).convert('RGBA'), cols))
sets.sort(key=lambda s: s[0])
def tile(g):
    fh, fv, fd = g & 0x80000000, g & 0x40000000, g & 0x20000000; g &= 0x1FFFFFFF
    fg, im, cols = max((s for s in sets if s[0] <= g), key=lambda s: s[0]); i = g - fg
    t = im.crop(((i % cols) * 16, (i // cols) * 16, (i % cols) * 16 + 16, (i // cols) * 16 + 16))
    if fd: t = t.transpose(Image.TRANSPOSE)
    if fh: t = t.transpose(Image.FLIP_LEFT_RIGHT)
    if fv: t = t.transpose(Image.FLIP_TOP_BOTTOM)
    return t
c = Image.new('RGBA', (W * 16, H * 16), (0, 0, 0, 0))
for l in m['layers']:
    if l['type'] != 'tilelayer' or not l.get('visible', True): continue
    for k, g in enumerate(l['data']):
        if g: c.alpha_composite(tile(g), ((k % W) * 16, (k // W) * 16))
c.save(out); print(out, c.size)
