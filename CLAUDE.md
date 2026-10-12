# Dérouille : notes pour Claude

App d'entraînement de Glady (quiz et défis code), en deux versions : artifact claude.ai et site installable. La structure et les commandes sont dans `README.md`.

## Règles

- **Une seule source** : modifier `src/`, `assets/` ou `tools/`, jamais `docs/` ni `build/` à la main. Relancer ensuite `node build.js`.
- **Pas de dépendance** : vanilla JS, sans framework ni dépendance à l'exécution. Le site ne charge aucune ressource externe ; `verify/smoke_site.py` échoue sinon.
- **Solutions vérifiées** : chaque solution de référence de défi est exécutée dans `verify/run_verify.py`. Une référence fausse fausserait la correction.
- **Avant de publier** : `node build.js`, puis les 3 scripts de `verify/` doivent passer sans erreur.
- **Format de progression** : `localStorage` clé `derouille-v1`, ou dans l'artifact le document `data/users/<id>/progress`. Rester rétrocompatible : `normalize()` complète les champs manquants, `mergeStates()` fusionne deux appareils (le champ `epoch` fait gagner une réinitialisation).
- **Artifact** : https://claude.ai/artifact/Cv2yBPP1STxtwrdb9an3no. Publier `build/derouille-artifact.html` avec `url`. Capabilities : `db`, `user`, `sample`.
- **Périmètre gelé** : c'est un projet annexe au fil rouge « Veille filtrée ». Les nouvelles idées vont dans « Plus tard » du README, pas dans le code.
- **Git** : commit local après chaque changement. Jamais de push sans confirmation explicite de Glady.
