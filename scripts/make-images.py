"""Generate brand PNGs (logo + social card). Runs in GitHub Actions; needs Pillow."""
import os
from PIL import Image, ImageDraw, ImageFont
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'img')
os.makedirs(OUT, exist_ok=True)

def ecg(d, ox, oy, s, w, col):
    pts = [(6, 22), (13, 22), (16, 14), (20, 29), (24, 17), (26, 22), (34, 22)]
    d.line([(ox + x * s, oy + y * s) for x, y in pts], fill=col, width=w, joint='curve')

def find(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

SERIF = ['/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf']
SANS = ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf']

im = Image.new('RGBA', (512, 512), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.rounded_rectangle([0, 0, 511, 511], radius=140, fill='#0E7C6B')
ecg(d, 0, 0, 12.8, 34, '#FFFFFF')
d.ellipse([34 * 12.8 - 31, 22 * 12.8 - 31, 34 * 12.8 + 31, 22 * 12.8 + 31], fill='#E4572E')
im.save(os.path.join(OUT, 'logo-512.png'))

og = Image.new('RGB', (1200, 630), '#0B2E36'); d = ImageDraw.Draw(og)
for x in range(0, 1200, 40): d.line([(x, 0), (x, 630)], fill='#0F3A43', width=1)
for y in range(0, 630, 40): d.line([(0, y), (1200, y)], fill='#0F3A43', width=1)
d.line([(0, 470), (520, 470), (560, 400), (600, 560), (650, 330), (700, 520), (730, 470), (1200, 470)], fill='#1E9C86', width=6, joint='curve')
d.rounded_rectangle([80, 90, 200, 210], radius=32, fill='#0E7C6B'); ecg(d, 80, 90, 3, 8, '#FFFFFF')
d.ellipse([80 + 102 - 8, 90 + 66 - 8, 80 + 102 + 8, 90 + 66 + 8], fill='#E4572E')
f84 = find(SERIF, 84); d.text((230, 105), 'Nurse', font=f84, fill='#FFFFFF')
d.text((230 + d.textlength('Nurse', font=f84), 105), 'Now', font=f84, fill='#FF7A55')
f58 = find(SERIF, 58)
d.text((80, 260), 'Jobs, licensing, NCLEX prep', font=f58, fill='#FFFFFF')
d.text((80, 330), '& free career tools for nurses', font=f58, fill='#FFFFFF')
d.text((80, 540), 'nursenow.com  ·  refreshed daily', font=find(SANS, 30), fill='#F5C35E')
og.save(os.path.join(OUT, 'og.png'), optimize=True)
print('brand images written')
