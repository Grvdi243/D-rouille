# Dérouille

Une app d'entraînement façon Mimo pour se remettre au développement backend. Elle propose des quiz par niveaux et des défis où l'on écrit du vrai code : Python, Django, DRF, PostgreSQL, HTTP/REST, tests, Git et architecture.

Le dépôt produit deux versions à partir des mêmes sources :

| Version | Où | Progression | Correction des défis |
|---|---|---|---|
| Artifact | claude.ai (privé) | synchronisée entre appareils | automatique, par Claude |
| Site installable (PWA) | GitHub Pages (`docs/`) | sur l'appareil, plus un code de sauvegarde | liste de critères, plus copier-coller vers Claude |

Le code de sauvegarde (Profil, puis Sauvegarde) transfère la progression d'une version à l'autre et d'un appareil à l'autre. L'import fusionne les deux progressions : on garde le meilleur des deux.

## Structure

- `src/app.html` : l'app (styles et JavaScript, sans framework)
- `src/quiz.js` : parcours, niveaux et questions
- `src/exercises.js` : défis code, un par niveau, au même index que leur niveau
- `src/standalone.html`, `src/sw.js`, `src/manifest.webmanifest` : enveloppe de la version installable (hors ligne)
- `assets/` : icônes et polices servies par le site (polices sous licence SIL OFL 1.1)
- `build.js` : génère `build/derouille-artifact.html` et le dossier `docs/`
- `verify/` : tests (solutions de référence et parcours complets dans Chromium)
- `tools/` : scripts pour régénérer les icônes et les polices

## Commandes

```bash
node build.js                  # construit les deux versions
python verify/run_verify.py    # exécute les solutions de référence (Python, SQLite, Django/DRF, git)
python verify/smoke.py         # parcours complet de l'artifact, au format téléphone
python verify/smoke_site.py    # version installable : hors ligne, sauvegarde, aucune requête externe
```

Prérequis pour les tests :
- Node 18 ou plus ;
- Python 3.12 ou plus ;
- les paquets Python : Django, djangorestframework, pytest, pytest-django, requests et playwright, puis `python -m playwright install chromium`.

## Déployer

- **Site** : construire, committer `docs/`, puis pousser sur `main`. GitHub Pages sert la branche `main`, dossier `/docs`.
- **Artifact** : republier `build/derouille-artifact.html` sur l'URL existante.

## Ajouter du contenu

- **Une question** : ajouter un objet dans `qs` du niveau. Types possibles : `mc` (choix), `fill` (trous), `order` (remise en ordre).
- **Un défi** : l'ajouter dans `EXERCISES[parcours]` au même index que son niveau. Sa solution doit être exécutée dans `verify/run_verify.py`.

## Plus tard

Idées notées ici plutôt que codées tout de suite. Le périmètre est volontairement gelé, le projet principal restant « Veille filtrée ».

- (rien pour l'instant)
