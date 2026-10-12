"""Test de fumée de Dérouille dans Chromium, au format téléphone.

1. Sans plateforme Claude : leçon complète (avec une erreur), défi en auto-évaluation, onglets.
2. Avec une plateforme simulée (sample/db/user) : correction « réussi », « presque », JSON invalide.
"""
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
SHOTS = HERE / "shots"
SHOTS.mkdir(exist_ok=True)
content = (HERE.parent / "build" / "derouille-artifact.html").read_text(encoding="utf-8")
# Même squelette que celui ajouté à la publication.
page_html = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" '
             'content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}'
             'body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>'
             '</head><body>' + content + '</body></html>')
(HERE / "page.html").write_text(page_html, encoding="utf-8")
URL = (HERE / "page.html").as_uri()

FAKE_CLAUDE = """
window.__mode = "ok"; window.__saved = null; window.__calls = 0;
const sample = async (input) => ({text: "ok", truncated: false});
sample.json = async (prompt, opts) => {
  window.__calls++;
  await new Promise(r => setTimeout(r, 400));
  if (window.__mode === "garbage") return {hello: "world"};
  const n = +(/exactement (\\d+) éléments/.exec(prompt) || [0, 0])[1];
  const crit = Array.from({length: n}, (_, i) => ({note: "Vérifié.", ok: !(window.__mode === "almost" && i === 0)}));
  return {syntaxe_ok: true, criteres: crit, feedback: "Bonne structure générale.", a_corriger: window.__mode === "almost" ? ["Le premier critère n'est pas rempli."] : []};
};
const db = {doc: (p) => ({get: async () => ({exists: false, data: () => undefined}), set: async (d) => { window.__saved = d; }})};
const user = {id: async () => "u_test"};
window.claude = {use: async (name) => ({sample, db, user})[name] || null};
"""

errors = []
report = []


def log(msg):
    report.append(msg)
    print(msg)


def attach(page, label):
    page.on("pageerror", lambda e: errors.append(f"[{label}] pageerror: {e}"))
    page.on("console", lambda m: errors.append(f"[{label}] console.{m.type}: {m.text}") if m.type == "error" else None)


def answer_current(page, correct=True):
    q = page.evaluate("({t: L.queue[0].q.t, a: L.queue[0].q.a, lines: L.queue[0].q.lines, chips: L.chips, opts: L.opts && L.opts.map(o => o.ok)})")
    if q["t"] == "mc":
        idx = q["opts"].index(True)
        if not correct:
            idx = next(i for i, ok in enumerate(q["opts"]) if not ok)
        page.click(f'.opt[data-i="{idx}"]')
    elif q["t"] == "fill":
        used = set()
        answers = q["a"] if correct else list(reversed(q["chips"]))[:len(q["a"])]
        for a in answers:
            c = next(i for i, ch in enumerate(q["chips"]) if ch == a and i not in used)
            used.add(c)
            page.click(f'.chip[data-c="{c}"]')
        if not correct and [q["chips"][i] for i in used] == q["a"]:
            pass
    else:
        order = list(range(len(q["lines"])))
        if not correct:
            order = order[::-1]
        for i in order:
            page.click(f'.chips .line-chip[data-l="{i}"]')
    page.click("#check")
    page.wait_for_selector("#next")
    return page.evaluate("document.getElementById('action').className")


def play_level(page, wrong_first=False):
    first = True
    while True:
        cls = answer_current(page, correct=not (wrong_first and first))
        first = False
        page.click("#next")
        if page.query_selector(".result"):
            return
        page.wait_for_selector("#check")


with sync_playwright() as p:
    browser = p.chromium.launch()
    # ---------- 1. Sans plateforme ----------
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page = ctx.new_page()
    attach(page, "sans-claude")
    page.goto(URL)
    page.wait_for_selector(".path .node")
    page.wait_for_timeout(400)
    page.screenshot(path=str(SHOTS / "1-apprendre.png"))
    overflow = page.evaluate("document.documentElement.scrollWidth > innerWidth")
    log(f"Apprendre : débordement horizontal = {overflow}")

    page.click('.node[data-level="0"]')
    page.click("[data-go]")
    page.wait_for_selector("#check")
    play_level(page, wrong_first=True)
    page.wait_for_timeout(2600)
    page.screenshot(path=str(SHOTS / "2-resultat.png"))
    st = page.evaluate("({xp: S.xp, lvl: S.levels['python:0'], missed: S.missed.length, combo: S.stats.bestCombo, badges: S.badges, streak: S.streak})")
    log(f"Après le niveau 1 : {json.dumps(st, ensure_ascii=False)}")
    assert st["xp"] > 0 and st["lvl"], "le niveau 1 n'a pas été validé"

    page.click("#goDefi")
    page.wait_for_selector("#code")
    page.screenshot(path=str(SHOTS / "3-defi.png"))
    # Auto-indentation : « def f(): » + Entrée doit indenter.
    page.fill("#code", "")
    page.click("#code")
    page.keyboard.type("def f():")
    page.keyboard.press("Enter")
    val = page.eval_on_selector("#code", "e => e.value")
    log(f"Auto-indentation : {val!r}")
    assert val == "def f():\n    ", val
    # Barre de symboles et guillemets typographiques.
    page.click('#symbar [data-sym="("]')
    page.keyboard.type("“x”")
    val = page.eval_on_selector("#code", "e => e.value")
    log(f"Symbole + guillemets corrigés : {val!r}")
    assert val.endswith('("x"'), val
    # Indice : -1 étoile.
    page.click("#xhint")
    log("Potentiel après un indice : " + page.inner_text("#potential").replace("\n", " "))
    # Code réel puis vérification (pas de Claude → auto-évaluation).
    sol = page.evaluate("X.ex.solution")
    page.fill("#code", sol)
    page.click("#xcheck")
    page.wait_for_selector(".checklist")
    page.screenshot(path=str(SHOTS / "4-auto-eval.png"))
    for box in page.query_selector_all(".checklist input:not([data-bonus])"):
        box.check()
    page.click("[data-ok]")
    page.wait_for_selector(".verdict.good")
    page.wait_for_timeout(1500)
    page.screenshot(path=str(SHOTS / "5-verdict-auto.png"))
    ex = page.evaluate("S.ex['python:0']")
    log(f"Défi 1 enregistré : étoiles={ex and ex['stars']} auto={ex and ex['self']}")
    assert ex and ex["stars"] == 2, ex
    page.click("[data-next]")
    page.wait_for_selector(".path")
    page.wait_for_timeout(1200)

    page.click('.tabbtn[data-tab="code"]')
    page.wait_for_selector(".ex-card")
    page.screenshot(path=str(SHOTS / "6-coder.png"))
    log(f"Coder : débordement = {page.evaluate('document.documentElement.scrollWidth > innerWidth')}")
    page.click('.tabbtn[data-tab="profile"]')
    page.wait_for_selector(".badges")
    page.screenshot(path=str(SHOTS / "7-profil.png"), full_page=True)
    log(f"Profil : badges = {page.evaluate('S.badges')}")
    ctx.close()

    # ---------- 2. Plateforme simulée ----------
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True, color_scheme="dark")
    ctx.add_init_script(FAKE_CLAUDE)
    page = ctx.new_page()
    attach(page, "claude-simulé")
    page.goto(URL)
    page.wait_for_selector(".path .node")
    page.wait_for_function("graderState === 'ready' && synced === true")
    log("Plateforme simulée : correcteur prêt, synchro active")
    page.screenshot(path=str(SHOTS / "8-sombre.png"))
    page.click('.node[data-level="0"]')
    page.click("[data-go]")
    page.wait_for_selector("#check")
    play_level(page)
    page.wait_for_timeout(2500)
    log(f"Sauvegarde distante après le niveau : xp={page.evaluate('window.__saved && window.__saved.xp')}")
    page.click("#goDefi")
    page.wait_for_selector("#code")
    starter = page.evaluate("X.ex.starter")
    page.click("#xcheck")
    page.wait_for_timeout(300)
    log(f"Code inchangé → appels Claude = {page.evaluate('window.__calls')} (attendu 0)")
    page.evaluate("window.__mode = 'almost'")
    page.fill("#code", starter + "\n# essai 1\n")
    page.click("#xcheck")
    page.wait_for_selector(".g-wrap")
    page.screenshot(path=str(SHOTS / "9-correction.png"))
    page.wait_for_selector(".verdict.warn")
    page.screenshot(path=str(SHOTS / "10-presque.png"))
    log("Verdict « presque » affiché : " + page.inner_text(".v-score"))
    page.click(".verdict [data-close]")
    page.wait_for_timeout(300)
    page.click("#xcheck")
    page.wait_for_selector(".verdict.warn")
    log(f"Même code resoumis → appels Claude = {page.evaluate('window.__calls')} (attendu 1, cache)")
    page.click(".verdict [data-close]")
    page.wait_for_timeout(300)
    page.wait_for_selector(".toast.warn", state="detached")
    page.evaluate("window.__mode = 'garbage'")
    page.fill("#code", starter + "\n# essai 2\n")
    page.click("#xcheck")
    page.wait_for_selector(".toast.warn")
    log("JSON invalide → message : " + page.inner_text(".toast.warn").replace("\n", " "))
    xp_before = page.evaluate("S.xp")
    page.evaluate("window.__mode = 'ok'")
    page.fill("#code", page.evaluate("X.ex.solution"))
    page.click("#xcheck")
    page.wait_for_selector(".verdict.good")
    page.wait_for_timeout(2200)
    page.screenshot(path=str(SHOTS / "11-reussi.png"))
    stars = page.evaluate("S.ex['python:0'].stars")
    log(f"Réussi : +{page.evaluate('S.xp') - xp_before} XP, étoiles={stars}")
    ctx.close()

    # ---------- 3. Reprise là où on s'est arrêté ----------
    ctx = browser.new_context(viewport={"width": 360, "height": 740}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page = ctx.new_page()
    attach(page, "reprise")
    page.goto(URL)
    page.wait_for_selector(".path .node")
    page.click('.node[data-level="0"]')
    page.click("[data-go]")
    page.wait_for_selector("#check")
    for _ in range(2):
        answer_current(page)
        page.click("#next")
        page.wait_for_selector("#check")
    page.click("#quit")
    page.wait_for_selector("#resumeBtn")
    page.wait_for_timeout(500)
    page.screenshot(path=str(SHOTS / "12-reprise-carte.png"))
    page.reload()
    page.wait_for_selector("#resumeBtn")
    log("Après rechargement : carte « " + page.inner_text(".resume .resume-body").replace("\n", " ") + " »")
    page.click('.node[data-level="0"]')
    has_resume = page.query_selector("[data-resume]") is not None
    log(f"Feuille du niveau : bouton Reprendre = {has_resume}")
    assert has_resume
    page.click("[data-resume]")
    page.wait_for_selector("#check")
    solved = page.evaluate("L.solved")
    log(f"Reprise : {solved} bonnes réponses déjà comptées (attendu 2)")
    assert solved == 2, solved
    play_level(page)
    log(f"Niveau fini après reprise : session = {page.evaluate('S.session')}, étoiles = {page.evaluate(chr(83) + '.levels[' + chr(34) + 'python:0' + chr(34) + '].stars')}")
    page.click("#goDefi")
    page.wait_for_selector("#code")
    page.fill("#code", "def format_prix(montant):\n    return montant  # brouillon")
    page.wait_for_timeout(1200)
    page.click("#xquit")
    page.wait_for_selector("#exResumeBtn")
    page.reload()
    page.wait_for_selector("#exResumeBtn")
    page.click("#exResumeBtn")
    page.wait_for_selector("#code")
    restored = page.eval_on_selector("#code", "e => e.value")
    log(f"Brouillon restauré : {restored!r}")
    assert restored.endswith("# brouillon"), restored
    ctx.close()
    browser.close()

print("\n=== Erreurs JavaScript ===")
print("\n".join(errors) if errors else "aucune")
sys.exit(1 if errors else 0)
