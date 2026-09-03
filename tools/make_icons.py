#!/usr/bin/env python3
"""Draws the Cubilete app icon and writes every size the PWA needs into icons/.
Primary path uses Pillow; if it is missing we fall back to an SVG + macOS qlmanage/sips."""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'icons')
os.makedirs(OUT, exist_ok=True)
SIZES = {'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512, 'favicon-32.png': 32}

SPADE = [(50, 12), (19, 40), (19, 58), (26, 70), (39, 72), (48, 63), (47, 74), (41, 82), (34, 88), (66, 88), (59, 82), (53, 74), (52, 63), (61, 72), (74, 70), (81, 58), (81, 40)]

def draw_pillow():
    from PIL import Image, ImageDraw, ImageFilter
    S = 1024
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # mahogany rounded square with subtle grain
    d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.22), fill=(58, 31, 20, 255))
    grain = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grain)
    for x in range(0, S, 14):
        gd.line((x, 0, x + 60, S), fill=(0, 0, 0, 22), width=5)
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.22), fill=255)
    im.paste(grain, (0, 0), Image.composite(grain.split()[3], Image.new('L', (S, S), 0), mask))
    # Cohiba band across the bottom with checker stripe
    band_top = int(S * 0.74)
    band = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    bd.rectangle((0, band_top, S, S), fill=(245, 184, 46, 255))
    cell = 26
    y0 = band_top - cell * 2
    for yy in range(2):
        for i in range(0, S // cell + 1):
            col = (18, 18, 18, 255) if (i + yy) % 2 == 0 else (242, 234, 219, 255)
            bd.rectangle((i * cell, y0 + yy * cell, (i + 1) * cell, y0 + (yy + 1) * cell), fill=col)
    im.paste(band, (0, 0), Image.composite(band.split()[3], Image.new('L', (S, S), 0), mask))
    # ivory die, slightly tilted, with a black spade
    die = Image.new('RGBA', (600, 600), (0, 0, 0, 0))
    dd = ImageDraw.Draw(die)
    dd.rounded_rectangle((40, 40, 560, 560), radius=90, fill=(241, 230, 200, 255), outline=(217, 199, 155, 255), width=8)
    pts = [(40 + 20 + x * 4.8, 40 + 20 + y * 4.8) for (x, y) in SPADE]
    dd.polygon(pts, fill=(28, 34, 48, 255))
    shadow = Image.new('RGBA', (600, 600), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((40, 60, 560, 580), radius=90, fill=(0, 0, 0, 150))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    die_r = die.rotate(-10, resample=Image.BICUBIC, expand=False)
    shadow_r = shadow.rotate(-10, resample=Image.BICUBIC, expand=False)
    pos = ((S - 600) // 2, int(S * 0.40) - 300)
    im.alpha_composite(shadow_r, pos)
    im.alpha_composite(die_r, pos)
    # gold ring
    d.rounded_rectangle((14, 14, S - 15, S - 15), radius=int(S * 0.21), outline=(245, 184, 46, 200), width=10)
    for name, size in SIZES.items():
        out = im.resize((size, size), Image.LANCZOS)
        if name in ('apple-touch-icon.png', 'favicon-32.png'):
            bg = Image.new('RGB', (size, size), (42, 20, 12))
            bg.paste(out, (0, 0), out)
            bg.save(os.path.join(OUT, name), optimize=True)
        else:
            out.save(os.path.join(OUT, name), optimize=True)
    # maskable: 20% padding on a solid background
    m = Image.new('RGBA', (S, S), (42, 20, 12, 255))
    inner = im.resize((int(S * 0.72), int(S * 0.72)), Image.LANCZOS)
    m.alpha_composite(inner, ((S - inner.width) // 2, (S - inner.height) // 2))
    m.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, 'icon-512-maskable.png'), optimize=True)

def draw_fallback():
    svg = os.path.join(OUT, 'icon.svg')
    spade = 'M' + ' L'.join(f'{x*4.8+60} {y*4.8+60}' for x, y in SPADE) + ' Z'
    with open(svg, 'w') as f:
        f.write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
<rect width="1024" height="1024" rx="225" fill="#3b1f14"/><rect y="760" width="1024" height="264" fill="#f5b82e"/>
<g transform="rotate(-10 512 410) translate(212 110)"><rect width="600" height="600" rx="90" fill="#f1e6c8"/><path d="{spade}" fill="#1c2230"/></g></svg>''')
    subprocess.run(['qlmanage', '-t', '-s', '1024', '-o', OUT, svg], check=True, capture_output=True)
    src = os.path.join(OUT, 'icon.svg.png')
    for name, size in list(SIZES.items()) + [('icon-512-maskable.png', 512)]:
        subprocess.run(['sips', '-z', str(size), str(size), src, '--out', os.path.join(OUT, name)], check=True, capture_output=True)
    os.remove(src); os.remove(svg)

try:
    draw_pillow()
    print('icons written with Pillow')
except ImportError:
    print('Pillow missing — using qlmanage/sips fallback', file=sys.stderr)
    draw_fallback()
    print('icons written with qlmanage/sips')
