"""Télécharge les polices Google de Dérouille (sous-ensemble latin) pour que le site les serve lui-même.

Le site marche ainsi hors ligne et derrière un réseau filtrant. Licences : SIL Open Font License 1.1.
Usage : python tools/fetch_fonts.py
"""
import re
import urllib.request
from pathlib import Path

CSS_URL = ("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800"
           "&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
LICENSES = ["bricolagegrotesque", "atkinsonhyperlegible", "jetbrainsmono"]
OUT = Path(__file__).resolve().parent.parent / "assets" / "fonts"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


css = get(CSS_URL).decode("utf-8")
OUT.mkdir(parents=True, exist_ok=True)
blocks, files = [], {}
for subset, block in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})", css):
    if subset != "latin":
        continue
    url = re.search(r"url\((https://[^)]+?\.woff2)\)", block).group(1)
    if url not in files:
        family = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        weight = re.search(r"font-weight:\s*(\d+)", block).group(1)
        name = re.sub(r"[^a-z0-9]+", "-", family.lower()).strip("-") + f"-{weight}.woff2"
        (OUT / name).write_bytes(get(url))
        files[url] = name
    blocks.append(block.replace(url, "./" + files[url]))

(OUT / "fonts.css").write_text(
    "/* Polices servies par le site (sous-ensemble latin). Licences SIL OFL 1.1 : voir OFL-*.txt */\n"
    + "\n".join(blocks) + "\n", encoding="utf-8")
for slug in LICENSES:
    (OUT / f"OFL-{slug}.txt").write_bytes(get(f"https://raw.githubusercontent.com/google/fonts/main/ofl/{slug}/OFL.txt"))
print(f"{len(blocks)} @font-face, {len(files)} fichiers woff2, {len(LICENSES)} licences")
