"""Test de la version installable (docs/) servie en HTTP local, comme sur GitHub Pages.

Vérifie : service worker et hors ligne, polices locales, aucune requête externe, carte d'installation,
défi en auto-évaluation avec copie de la demande pour Claude, code de sauvegarde exporté puis importé ailleurs.
Usage : python verify/smoke_site.py (après node build.js)
"""
import functools
import http.server
import socketserver
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = Path(__file__).resolve().parent / "shots"
SHOTS.mkdir(exist_ok=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".webmanifest": "application/manifest+json", ".js": "text/javascript", ".woff2": "font/woff2"}

    def log_message(self, *args):
        pass


httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(ROOT)))
httpd.daemon_threads = True
ORIGIN = f"http://127.0.0.1:{httpd.server_address[1]}"
URL = ORIGIN + "/docs/"
threading.Thread(target=httpd.serve_forever, daemon=True).start()

errors, external, report = [], [], []


def log(msg):
    report.append(msg)
    print(msg)


def watch(page, label):
    page.on("pageerror", lambda e: errors.append(f"[{label}] pageerror: {e}"))
    page.on("console", lambda m: errors.append(f"[{label}] console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("request", lambda r: external.append(r.url) if not r.url.startswith((ORIGIN, "data:", "blob:")) else None)


def answer_current(page):
    q = page.evaluate("({t: L.queue[0].q.t, a: L.queue[0].q.a, lines: L.queue[0].q.lines, chips: L.chips, opts: L.opts && L.opts.map(o => o.ok)})")
    if q["t"] == "mc":
        page.click(f'.opt[data-i="{q["opts"].index(True)}"]')
    elif q["t"] == "fill":
        used = set()
        for a in q["a"]:
            c = next(i for i, ch in enumerate(q["chips"]) if ch == a and i not in used)
            used.add(c)
            page.click(f'.chip[data-c="{c}"]')
    else:
        for i in range(len(q["lines"])):
            page.click(f'.chips .line-chip[data-l="{i}"]')
    page.click("#check")
    page.wait_for_selector("#next")


def play_level(page):
    while True:
        answer_current(page)
        page.click("#next")
        if page.query_selector(".result"):
            return
        page.wait_for_selector("#check")


def mobile(browser):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=ORIGIN)
    return ctx


with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = mobile(browser)
    page = ctx.new_page()
    watch(page, "site")
    page.goto(URL)
    page.wait_for_selector(".path .node")
    log("Build : " + str(page.evaluate("({target: BUILD.target, version: BUILD.version, correcteur: graderState})")))
    page.evaluate("navigator.serviceWorker.ready.then(() => true)")
    page.reload()
    page.wait_for_selector(".path .node")
    log(f"Service worker actif : {page.evaluate('!!navigator.serviceWorker.controller')}")
    page.wait_for_timeout(600)
    loaded = page.evaluate("[...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/\"/g, '')))]")
    log(f"Polices locales chargées : {sorted(loaded)}")
    assert {"Atkinson Hyperlegible", "Bricolage Grotesque"} <= set(loaded), loaded
    log(f"Carte « Installe Dérouille » affichée : {page.query_selector('#installX') is not None}")
    page.screenshot(path=str(SHOTS / "site-1-accueil.png"))

    page.click('.node[data-level="0"]')
    page.click("[data-go]")
    page.wait_for_selector("#check")
    play_level(page)
    page.wait_for_timeout(1500)
    page.click("#goDefi")
    page.wait_for_selector("#code")
    log("Bouton de vérification : " + page.inner_text("#xcheck"))
    page.fill("#code", page.evaluate("X.ex.solution"))
    page.click("#xcheck")
    page.wait_for_selector(".checklist")
    page.click("[data-ask]")
    page.wait_for_selector(".toast.good")
    clip = page.evaluate("navigator.clipboard.readText()")
    log(f"Demande pour Claude copiée : {len(clip)} caractères, critères inclus = {'Critères à vérifier' in clip}, code inclus = {'format_prix' in clip}")
    page.screenshot(path=str(SHOTS / "site-2-auto-eval.png"))
    for box in page.query_selector_all(".checklist input:not([data-bonus])"):
        box.check()
    page.click("[data-ok]")
    page.wait_for_selector(".verdict.good")
    page.click("[data-next]")
    page.wait_for_selector(".path")
    xp = page.evaluate("S.xp")
    log(f"Progression : {xp} XP, défis = {page.evaluate('Object.keys(S.ex)')}")

    page.click('.tabbtn[data-tab="profile"]')
    page.click("#exportBtn")
    page.wait_for_selector(".codebox")
    code = page.eval_on_selector(".codebox", "e => e.value")
    page.click("[data-copy]")
    page.wait_for_selector(".toast.good")
    log(f"Code de sauvegarde : {code[:24]}… ({len(code)} caractères)")
    page.screenshot(path=str(SHOTS / "site-3-profil.png"))

    ctx.set_offline(True)
    page.reload()
    page.wait_for_selector(".tabbar")
    log(f"Hors ligne après rechargement : app affichée, {page.evaluate('S.xp')} XP conservés")
    ctx.set_offline(False)
    ctx.close()

    ctx2 = mobile(browser)
    page2 = ctx2.new_page()
    watch(page2, "autre-appareil")
    page2.goto(URL)
    page2.wait_for_selector(".path .node")
    page2.click('.tabbtn[data-tab="profile"]')
    page2.click("#importBtn")
    page2.fill(".codebox", "  " + code[:60] + "\n" + code[60:] + "  ")
    page2.click("[data-ok]")
    page2.wait_for_selector(".toast.good")
    log(f"Import sur un autre appareil : {page2.evaluate('S.xp')} XP (attendu {xp}), niveaux = {page2.evaluate('Object.keys(S.levels)')}")
    assert page2.evaluate("S.xp") == xp
    page2.click("#importBtn")
    page2.fill(".codebox", "n'importe quoi")
    page2.click("[data-ok]")
    page2.wait_for_selector(".toast.warn")
    log("Code invalide → " + page2.inner_text(".toast.warn").replace("\n", " "))
    ctx2.close()
    browser.close()
httpd.shutdown()

print("\n=== Requêtes externes ===")
print("\n".join(sorted(set(external))) if external else "aucune")
print("=== Erreurs JavaScript ===")
print("\n".join(errors) if errors else "aucune")
sys.exit(1 if errors or external else 0)
