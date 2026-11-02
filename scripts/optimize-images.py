#!/usr/bin/env python3
"""Build-time image optimizer for the published site.

Runs inside the Pages deploy workflow on the _site copy, never on the
repository itself. Photos uploaded through the admin panel arrive at camera
resolution; this caps them so the live site stays light:

  * member avatars listed in data/members.json  -> long side <= 600 px
  * admin uploads at image/ root and image/News_highlight/** -> long side <= 1600 px
  * JPEGs are re-encoded (quality 82, progressive); PNGs are left as PNG
    (only resized) so transparency and file names are preserved.

Usage: python3 scripts/optimize-images.py <site-dir>
"""
import json, os, sys
from PIL import Image, ImageOps

site = sys.argv[1] if len(sys.argv) > 1 else '_site'
EXT = {'.jpg', '.jpeg', '.png'}

def shrink(path, max_side, quality=82):
    try:
        im = ImageOps.exif_transpose(Image.open(path))
    except Exception as e:
        print(f'  skip {path}: {e}'); return 0
    w, h = im.size
    before = os.path.getsize(path)
    is_jpeg = path.lower().endswith(('.jpg', '.jpeg'))
    if max(w, h) <= max_side and (not is_jpeg or before <= 350_000):
        return 0
    if max(w, h) > max_side:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    if is_jpeg:
        im.convert('RGB').save(path, 'JPEG', quality=quality, optimize=True, progressive=True)
    else:
        im.save(path, 'PNG', optimize=True)
    after = os.path.getsize(path)
    print(f'  {path}: {w}x{h} {before//1024} KB -> {im.size[0]}x{im.size[1]} {after//1024} KB')
    return before - after

saved = 0
avatars = set()
try:
    members = json.load(open(os.path.join(site, 'data', 'members.json'), encoding='utf-8'))
    for group in members.values():
        for person in group:
            if person.get('avatar'):
                avatars.add(os.path.normpath(os.path.join(site, person['avatar'])))
except Exception as e:
    print('members.json not read:', e)

print('Avatars (<= 600 px):')
for p in sorted(avatars):
    if os.path.exists(p) and os.path.splitext(p)[1].lower() in EXT:
        saved += shrink(p, 600, quality=84)

print('Admin uploads (<= 1600 px):')
roots = [os.path.join(site, 'image')]
targets = []
for root in roots:
    for name in os.listdir(root):
        p = os.path.join(root, name)
        if os.path.isfile(p) and os.path.splitext(name)[1].lower() in EXT:
            targets.append(p)
news_dir = os.path.join(site, 'image', 'News_highlight')
for dirpath, _, files in os.walk(news_dir):
    for name in files:
        if os.path.splitext(name)[1].lower() in EXT:
            targets.append(os.path.join(dirpath, name))
for p in sorted(set(targets) - avatars):
    saved += shrink(p, 1600)

print(f'Total saved: {saved/1024/1024:.2f} MB')
