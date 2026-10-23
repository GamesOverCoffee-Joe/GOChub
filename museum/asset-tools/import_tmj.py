# Tiled map -> the game's painted room: import_tmj.py MAP KIT REPO_MUSEUM_DIR
# Writes paint/<room>.png (just the tiles the map uses, flips baked in) and returns the room's "paint" entry for the pack.
import json, sys, re, os
from PIL import Image
mp, kit, out_dir = sys.argv[1:4]
m = json.load(open(mp)); W, H = m['width'], m['height']
room = next((p['value'] for p in m.get('properties', []) if p['name'] == 'room'), os.path.basename(mp)[:-4])
sets = []
for t in m['tilesets']:
    x = open(os.path.join(kit, 'tilesets', os.path.basename(t['source']))).read()
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
index, tiles, layers = {}, [], []
for l in m['layers']:
    if l['type'] != 'tilelayer' or not l.get('visible', True): continue
    data = []
    for g in l['data']:
        if not g: data.append(0); continue
        if g not in index:
            t = tile(g)
            if not t.getbbox(): index[g] = 0
            else: tiles.append(t); index[g] = len(tiles)
        data.append(index[g])
    if any(data): layers.append({'name': l['name'], 'above': bool(re.search(r'above', l['name'], re.I)), 'data': data})
COLS = 32; rows = (len(tiles) + COLS - 1) // COLS
atlas = Image.new('RGBA', (COLS * 16, max(1, rows) * 16))
for i, t in enumerate(tiles): atlas.alpha_composite(t, ((i % COLS) * 16, (i // COLS) * 16))
os.makedirs(os.path.join(out_dir, 'paint'), exist_ok=True)
atlas.save(os.path.join(out_dir, 'paint', room + '.png'), optimize=True)
print(json.dumps({'room': room, 'paint': {'img': 'paint/' + room + '.png', 'cols': COLS, 'w': W, 'h': H, 'layers': layers}}, separators=(',', ':')))
