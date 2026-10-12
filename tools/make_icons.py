"""Génère les icônes de Dérouille (SVG + PNG) avec Chromium via Playwright.

Usage : python tools/make_icons.py
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "assets" / "icons"
BLUE, FLAME = "#2E5BFF", "#FF8A3D"
GLYPH = ('<path d="M200 178 120 256l80 78M312 178l80 78-80 78M280 140l-48 232" fill="none" stroke="#fff" '
         'stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>'
         f'<g transform="translate(330 40) scale(6.5)"><path fill="{FLAME}" '
         'd="M12 2c1 3.5 5 5.6 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.4 2-4.5.2 1.6 1 2.6 2 3 0-3.2-.2-6 1-9Z"/></g>')


def icon_svg(rounded=True, scale=1.0):
    offset = 256 - 256 * scale
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
            f'<rect width="512" height="512" rx="{112 if rounded else 0}" fill="{BLUE}"/>'
            f'<g transform="translate({offset} {offset}) scale({scale})">{GLYPH}</g></svg>')


OUT.mkdir(parents=True, exist_ok=True)
(OUT / "icon.svg").write_text(icon_svg(), encoding="utf-8")
targets = [  # (fichier, taille, coins arrondis, échelle du dessin)
    ("icon-192.png", 192, True, 1.0),
    ("icon-512.png", 512, True, 1.0),
    ("maskable-512.png", 512, False, 0.72),        # zone sûre Android : le dessin tient dans 80 % du centre
    ("apple-touch-icon.png", 180, False, 0.86),    # iOS arrondit lui-même les coins
]
with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, size, rounded, scale in targets:
        page = browser.new_page(viewport={"width": size, "height": size})
        page.set_content(f'<html><body style="margin:0;background:transparent">'
                         f'<div style="width:{size}px;height:{size}px">{icon_svg(rounded, scale)}</div></body></html>')
        page.screenshot(path=str(OUT / name), omit_background=True, clip={"x": 0, "y": 0, "width": size, "height": size})
        page.close()
    browser.close()
print("icônes :", ", ".join(sorted(f.name for f in OUT.iterdir())))
