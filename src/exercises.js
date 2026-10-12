/* Exercices de code : un par niveau de quiz (même index), débloqué quand le quiz du niveau est réussi.
   diff : 1 facile · 2 moyen · 3 difficile — lang : python | sql | bash | text
   criteria : évalués un par un par Claude ; ceux qui commencent par « Bonus » ne bloquent pas la réussite. */
const EXERCISES = {
python: [
 { title:"Formater un prix", diff:1, lang:"python",
   prompt:["Écris une fonction `format_prix(montant)` qui **renvoie** (pas `print`) le montant avec 2 décimales, suivi d'un espace et du symbole €."],
   example:`format_prix(3.5)   # "3.50 €"
format_prix(10)    # "10.00 €"`,
   starter:`def format_prix(montant):
    # ton code ici
    pass
`,
   criteria:["La fonction renvoie la chaîne avec return (pas de print)","Le montant a toujours exactement 2 décimales (3.5 → 3.50, 10 → 10.00)","La chaîne se termine par un espace puis le symbole €"],
   hints:["Une f-string sait formater un nombre : `f\"{valeur:.2f}\"`.","`:.2f` donne 2 chiffres après la virgule. Il ne reste qu'à ajouter `\" €\"` à la fin."],
   solution:`def format_prix(montant):
    return f"{montant:.2f} €"
`},
 { title:"Compter les mots", diff:1, lang:"python",
   prompt:["Écris `compte_mots(texte)` qui renvoie un dictionnaire `{mot: nombre d'apparitions}`.","Les majuscules ne comptent pas : « Le » et « le » sont le même mot."],
   example:`compte_mots("Le chat et le chien")
# {"le": 2, "chat": 1, "et": 1, "chien": 1}`,
   starter:`def compte_mots(texte):
    compteur = {}
    # ton code ici
    return compteur
`,
   criteria:["Renvoie un dictionnaire {mot: nombre}","Ignore la casse (« Le » et « le » comptent ensemble)","Ne lève pas de KeyError à la première apparition d'un mot"],
   hints:["`texte.lower().split()` te donne la liste des mots en minuscules.","Pour incrémenter sans KeyError : `compteur[mot] = compteur.get(mot, 0) + 1`."],
   solution:`def compte_mots(texte):
    compteur = {}
    for mot in texte.lower().split():
        compteur[mot] = compteur.get(mot, 0) + 1
    return compteur
`},
 { title:"Une moyenne qui ne plante pas", diff:1, lang:"python",
   prompt:["Écris `moyenne(*notes)` qui renvoie la moyenne des notes reçues en arguments.","S'il n'y a aucune note, la fonction renvoie `None` au lieu de planter."],
   example:`moyenne(10, 14, 18)  # 14.0
moyenne()            # None`,
   starter:`def moyenne(*notes):
    # ton code ici
    pass
`,
   criteria:["Accepte un nombre variable d'arguments (*notes)","Renvoie la moyenne exacte (somme / nombre de notes)","Renvoie None quand il n'y a aucune note, sans ZeroDivisionError"],
   hints:["`notes` est un tuple : `sum(notes)` et `len(notes)` fonctionnent dessus.","Un tuple vide est « faux » : `if not notes: return None`."],
   solution:`def moyenne(*notes):
    if not notes:
        return None
    return sum(notes) / len(notes)
`},
 { title:"Un panier en dataclass", diff:2, lang:"python",
   prompt:["Crée une dataclass `Article` avec `nom` (str), `prix` (float) et `quantite` (int, 1 par défaut).","Ajoute une méthode `total()` qui renvoie prix × quantité.","Puis écris `total_panier(articles)` qui renvoie la somme des totaux d'une liste d'articles."],
   example:`panier = [Article("Café", 4.5, 2), Article("Pain", 2.0)]
total_panier(panier)  # 11.0`,
   starter:`from dataclasses import dataclass


# ta dataclass ici


def total_panier(articles):
    pass
`,
   criteria:["Article est une dataclass avec nom, prix et quantite annotés","quantite vaut 1 par défaut","La méthode total() renvoie prix × quantite","total_panier renvoie la somme des totaux de la liste"],
   hints:["Un champ avec valeur par défaut s'écrit `quantite: int = 1`, après les champs sans défaut.","`sum(a.total() for a in articles)` additionne sans boucle explicite."],
   solution:`from dataclasses import dataclass


@dataclass
class Article:
    nom: str
    prix: float
    quantite: int = 1

    def total(self):
        return self.prix * self.quantite


def total_panier(articles):
    return sum(a.total() for a in articles)
`},
 { title:"Charger une config", diff:2, lang:"python",
   prompt:["Écris `charger_config(chemin)` qui lit un fichier JSON et renvoie son contenu (un dict).","- fichier absent : renvoie `{}`","- JSON invalide : lève `ValueError(\"Config invalide\")`"],
   starter:`import json


def charger_config(chemin):
    # ton code ici
    pass
`,
   criteria:["Le fichier est ouvert avec with","Le contenu est lu avec json.load (ou json.loads)","Fichier absent : renvoie {}","JSON invalide : lève ValueError(\"Config invalide\")","Bonus : raise … from e pour garder l'erreur d'origine"],
   hints:["Deux `except` suffisent : `FileNotFoundError` et `json.JSONDecodeError`.","Bonne pratique : `raise ValueError(\"Config invalide\") from e` garde l'erreur d'origine dans le traceback."],
   solution:`import json


def charger_config(chemin):
    try:
        with open(chemin, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        raise ValueError("Config invalide") from e
`},
 { title:"Compter les appels", diff:3, lang:"python",
   prompt:["Écris un décorateur `compteur_appels` qui compte combien de fois la fonction décorée est appelée.","Le compteur se lit dans l'attribut `.appels` de la fonction. Utilise `functools.wraps` pour garder le nom d'origine."],
   example:`@compteur_appels
def salut():
    return "salut"

salut()
salut()
print(salut.appels)    # 2
print(salut.__name__)  # salut`,
   starter:`from functools import wraps


def compteur_appels(func):
    # ton code ici
    pass
`,
   criteria:["compteur_appels renvoie une fonction qui appelle func avec *args et **kwargs et renvoie son résultat","Le compteur .appels part de 0 et augmente de 1 à chaque appel","@wraps(func) est appliqué à la fonction interne"],
   hints:["Une fonction est un objet : tu peux lui ajouter un attribut, par exemple `wrapper.appels = 0`.","Dans `wrapper`, incrémente `wrapper.appels += 1` puis renvoie `func(*args, **kwargs)`."],
   solution:`from functools import wraps


def compteur_appels(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.appels += 1
        return func(*args, **kwargs)

    wrapper.appels = 0
    return wrapper
`}
],
django: [
 { title:"Brancher les URLs", diff:1, lang:"python",
   prompt:["Dans `blog/urls.py`, crée deux routes :","- `\"\"` vers `views.liste`, nommée `\"liste\"`","- `\"<int:pk>/\"` vers `views.detail`, nommée `\"detail\"`","Puis, dans `config/urls.py`, branche ces URLs sous le préfixe `\"blog/\"`."],
   starter:`# blog/urls.py
from django.urls import path

from . import views

urlpatterns = [
    # tes routes ici
]


# config/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # branche le blog ici
]
`,
   criteria:["Route \"\" vers views.liste nommée \"liste\"","Route \"<int:pk>/\" vers views.detail nommée \"detail\"","Le projet inclut blog.urls sous \"blog/\" avec include()"],
   hints:["Une route nommée : `path(\"\", views.liste, name=\"liste\")`.","Côté projet : `path(\"blog/\", include(\"blog.urls\"))`."],
   solution:`# blog/urls.py
from django.urls import path

from . import views

urlpatterns = [
    path("", views.liste, name="liste"),
    path("<int:pk>/", views.detail, name="detail"),
]


# config/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("blog/", include("blog.urls")),
]
`},
 { title:"Le modèle Article", diff:2, lang:"python",
   prompt:["Écris le modèle `Article` :","- `titre` : 200 caractères max","- `contenu` : texte long","- `auteur` : l'utilisateur ; ses articles sont supprimés avec lui ; `related_name=\"articles\"`","- `publie` : booléen, faux par défaut","- `cree_le` : date de création remplie automatiquement","Ajoute `__str__` (renvoie le titre) et un tri par défaut du plus récent au plus ancien."],
   starter:`from django.conf import settings
from django.db import models


class Article(models.Model):
    # tes champs ici

    def __str__(self):
        pass
`,
   criteria:["titre = CharField(max_length=200) et contenu = TextField()","auteur = ForeignKey vers l'utilisateur avec on_delete=models.CASCADE et related_name=\"articles\"","publie = BooleanField(default=False)","cree_le = DateTimeField(auto_now_add=True)","__str__ renvoie le titre","Meta.ordering = [\"-cree_le\"]","Bonus : settings.AUTH_USER_MODEL plutôt qu'importer User"],
   hints:["Pour référencer l'utilisateur, la bonne pratique est `settings.AUTH_USER_MODEL` plutôt qu'importer `User`.","Le tri par défaut se déclare dans une classe interne : `class Meta: ordering = [\"-cree_le\"]`."],
   solution:`from django.conf import settings
from django.db import models


class Article(models.Model):
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="articles",
    )
    publie = models.BooleanField(default=False)
    cree_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-cree_le"]

    def __str__(self):
        return self.titre
`},
 { title:"Trois requêtes ORM", diff:2, lang:"python",
   prompt:["Avec le modèle `Article` (champs `titre`, `publie`, `cree_le`, `auteur`), écris trois requêtes :","- `publies` : les articles publiés, du plus récent au plus ancien","- `recherche` : les articles dont le titre contient « django », sans tenir compte de la casse","- `avec_auteurs` : tous les articles, en chargeant l'auteur dans la même requête SQL"],
   starter:`from blog.models import Article

publies = ...
recherche = ...
avec_auteurs = ...
`,
   criteria:["publies : filter(publie=True) puis order_by(\"-cree_le\")","recherche : filter(titre__icontains=\"django\")","avec_auteurs : select_related(\"auteur\")"],
   hints:["Les lookups s'écrivent avec deux underscores : `champ__lookup=valeur`.","Pour une ForeignKey, `select_related` fait une jointure SQL ; `prefetch_related` sert aux relations multiples."],
   solution:`from blog.models import Article

publies = Article.objects.filter(publie=True).order_by("-cree_le")
recherche = Article.objects.filter(titre__icontains="django")
avec_auteurs = Article.objects.select_related("auteur")
`},
 { title:"La page détail", diff:2, lang:"python",
   prompt:["Écris la vue `detail(request, pk)` : elle récupère l'article (ou renvoie une 404) et rend `blog/detail.html` avec le contexte `{\"article\": article}`.","Puis écris le template : le titre dans un `<h1>`, « Par » suivi du nom d'utilisateur de l'auteur, puis le contenu dans un `<p>`."],
   starter:`# blog/views.py
from django.shortcuts import get_object_or_404, render

from .models import Article


def detail(request, pk):
    pass


{# templates/blog/detail.html #}
`,
   criteria:["La vue utilise get_object_or_404(Article, pk=pk)","La vue rend blog/detail.html avec le contexte {\"article\": article}","Le template affiche le titre dans un <h1> et le contenu dans un <p>","Le template affiche « Par » suivi de article.auteur.username"],
   hints:["`get_object_or_404(Article, pk=pk)` remplace un try/except `DoesNotExist`.","Dans un template, on suit les relations avec des points : `{{ article.auteur.username }}`."],
   solution:`# blog/views.py
from django.shortcuts import get_object_or_404, render

from .models import Article


def detail(request, pk):
    article = get_object_or_404(Article, pk=pk)
    return render(request, "blog/detail.html", {"article": article})


{# templates/blog/detail.html #}
<h1>{{ article.titre }}</h1>
<p>Par {{ article.auteur.username }}</p>
<p>{{ article.contenu }}</p>
`}
],
drf: [
 { title:"Le serializer Article", diff:2, lang:"python",
   prompt:["Écris un `ModelSerializer` pour `Article` qui expose `id`, `titre`, `contenu`, `auteur` et `cree_le`.","`id`, `auteur` et `cree_le` sont en lecture seule.","Ajoute une validation : un titre de moins de 5 caractères est refusé avec le message « Titre trop court »."],
   starter:`from rest_framework import serializers

from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        # à compléter
`,
   criteria:["ModelSerializer avec model = Article","fields liste explicitement id, titre, contenu, auteur, cree_le (pas \"__all__\")","id, auteur et cree_le sont en lecture seule","validate_titre lève ValidationError(\"Titre trop court\") sous 5 caractères et renvoie value sinon"],
   hints:["`read_only_fields = [...]` se déclare dans `Meta`, à côté de `fields`.","La méthode `validate_titre(self, value)` doit **renvoyer** `value` quand tout va bien."],
   solution:`from rest_framework import serializers

from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ["id", "titre", "contenu", "auteur", "cree_le"]
        read_only_fields = ["id", "auteur", "cree_le"]

    def validate_titre(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Titre trop court")
        return value
`},
 { title:"Une API CRUD complète", diff:1, lang:"python",
   prompt:["Écris `ArticleViewSet`, qui fournit le CRUD complet avec `ArticleSerializer`.","Puis, dans `urls.py`, enregistre-le dans un `DefaultRouter` sous le préfixe `articles` et expose ses URLs."],
   starter:`# blog/views.py
from rest_framework import viewsets

from .models import Article
from .serializers import ArticleSerializer


# ton ViewSet ici


# blog/urls.py
from rest_framework.routers import DefaultRouter

from .views import ArticleViewSet

# ton router ici
`,
   criteria:["ArticleViewSet hérite de viewsets.ModelViewSet","queryset et serializer_class sont définis","Un DefaultRouter enregistre ArticleViewSet sous \"articles\"","Les URLs du router sont exposées (urlpatterns = router.urls, ou include(router.urls))"],
   hints:["Le minimum d'un ModelViewSet : `queryset` et `serializer_class`.","`router = DefaultRouter()` puis `router.register(\"articles\", ArticleViewSet)`."],
   solution:`# blog/views.py
from rest_framework import viewsets

from .models import Article
from .serializers import ArticleSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer


# blog/urls.py
from rest_framework.routers import DefaultRouter

from .views import ArticleViewSet

router = DefaultRouter()
router.register("articles", ArticleViewSet)

urlpatterns = router.urls
`},
 { title:"Seul l'auteur modifie", diff:3, lang:"python",
   prompt:["Écris la permission `EstAuteurOuLectureSeule` : tout utilisateur connecté peut lire, mais seul l'auteur peut modifier ou supprimer un article.","Dans `ArticleViewSet` : exige l'authentification, applique ta permission, et fixe l'auteur automatiquement à la création (le client ne doit pas pouvoir le choisir)."],
   starter:`from rest_framework import permissions, viewsets

from .models import Article
from .serializers import ArticleSerializer


class EstAuteurOuLectureSeule(permissions.BasePermission):
    pass


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
`,
   criteria:["has_object_permission autorise les méthodes sûres (permissions.SAFE_METHODS)","Pour les autres méthodes, seul obj.auteur == request.user est autorisé","permission_classes contient IsAuthenticated et EstAuteurOuLectureSeule","perform_create appelle serializer.save(auteur=self.request.user)"],
   hints:["`permissions.SAFE_METHODS` contient GET, HEAD et OPTIONS.","`def perform_create(self, serializer): serializer.save(auteur=self.request.user)`."],
   solution:`from rest_framework import permissions, viewsets

from .models import Article
from .serializers import ArticleSerializer


class EstAuteurOuLectureSeule(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.auteur == request.user


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related("auteur")
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated, EstAuteurOuLectureSeule]

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)
`}
],
pg: [
 { title:"Les 5 derniers articles", diff:1, lang:"sql",
   prompt:["Table `articles(id, titre, publie, cree_le)`.","Écris la requête qui renvoie le titre et la date des 5 derniers articles **publiés**, du plus récent au plus ancien."],
   starter:`-- ta requête ici
`,
   criteria:["Sélectionne titre et cree_le (pas SELECT *)","Filtre sur publie = true","Trie par cree_le DESC","Limite à 5 lignes"],
   hints:["L'ordre des clauses : SELECT → FROM → WHERE → ORDER BY → LIMIT.","Sans `ORDER BY`, « les 5 derniers » n'a pas de sens : l'ordre des lignes n'est pas garanti."],
   solution:`SELECT titre, cree_le
FROM articles
WHERE publie = true
ORDER BY cree_le DESC
LIMIT 5;
`},
 { title:"Auteurs et nombre d'articles", diff:2, lang:"sql",
   prompt:["Tables `auteurs(id, nom)` et `articles(id, titre, auteur_id)`.","Renvoie le nom de chaque auteur et son nombre d'articles, **y compris les auteurs sans article** (0), du plus prolifique au moins prolifique."],
   starter:`-- ta requête ici
`,
   criteria:["Part de auteurs avec un LEFT JOIN vers articles","Compte avec COUNT(articles.id), pas COUNT(*), pour obtenir 0","GROUP BY sur l'auteur","Trie par nombre d'articles décroissant"],
   hints:["Pour garder les auteurs sans article, la table `auteurs` doit être à gauche d'un `LEFT JOIN`.","Piège : `COUNT(*)` compte aussi la ligne remplie de NULL. `COUNT(ar.id)` ignore les NULL."],
   solution:`SELECT au.nom, COUNT(ar.id) AS nb_articles
FROM auteurs au
LEFT JOIN articles ar ON ar.auteur_id = au.id
GROUP BY au.id, au.nom
ORDER BY nb_articles DESC;
`},
 { title:"Virement tout-ou-rien", diff:2, lang:"sql",
   prompt:["Table `comptes(id, solde)`.","1. Écris le SQL qui transfère 100 du compte 1 vers le compte 2, en tout-ou-rien.","2. Ajoute un index sur la colonne `auteur_id` de la table `articles`."],
   starter:`-- 1. Virement

-- 2. Index
`,
   criteria:["BEGIN et COMMIT encadrent les deux UPDATE","Les soldes sont modifiés de façon relative (solde = solde - 100, solde = solde + 100)","Les bons comptes sont ciblés (WHERE id = 1 et WHERE id = 2)","CREATE INDEX … ON articles (auteur_id)"],
   hints:["Une transaction s'ouvre avec `BEGIN;` et se valide avec `COMMIT;`.","`UPDATE comptes SET solde = solde - 100 WHERE id = 1;` évite de lire le solde puis de le réécrire."],
   solution:`-- 1. Virement
BEGIN;
UPDATE comptes SET solde = solde - 100 WHERE id = 1;
UPDATE comptes SET solde = solde + 100 WHERE id = 2;
COMMIT;

-- 2. Index
CREATE INDEX idx_articles_auteur_id ON articles (auteur_id);
`}
],
http: [
 { title:"Appeler une API", diff:1, lang:"python",
   prompt:["Avec la librairie `requests`, crée un article en envoyant `{\"titre\": \"Mon article\", \"contenu\": \"Bonjour\"}` en JSON à `https://api.exemple.com/api/v1/articles/`.","Authentifie-toi avec le token `abc123` (schéma `Token` de DRF). Si la création réussit, affiche l'`id` renvoyé ; sinon, affiche le code d'erreur."],
   starter:`import requests

# ton code ici
`,
   criteria:["requests.post vers https://api.exemple.com/api/v1/articles/","Le body est envoyé en JSON (json=…)","En-tête Authorization: Token abc123","Succès testé sur le code 201 (ou raise_for_status), puis affichage de reponse.json()[\"id\"]","Sinon, affichage du code d'erreur","Bonus : un timeout"],
   hints:["`requests.post(url, json=donnees, headers={...})` envoie du JSON avec le bon Content-Type.","L'en-tête attendu par DRF : `{\"Authorization\": \"Token abc123\"}`. Une création réussie renvoie 201."],
   solution:`import requests

reponse = requests.post(
    "https://api.exemple.com/api/v1/articles/",
    json={"titre": "Mon article", "contenu": "Bonjour"},
    headers={"Authorization": "Token abc123"},
    timeout=10,
)

if reponse.status_code == 201:
    print(reponse.json()["id"])
else:
    print("Erreur", reponse.status_code)
`},
 { title:"Concevoir les endpoints", diff:2, lang:"text",
   prompt:["Une app gère des **projets** qui contiennent des **tâches**. Écris les endpoints REST, une ligne par endpoint (méthode, URL, code de succès), pour :","- lister les projets","- créer un projet","- voir une tâche d'un projet","- cocher une tâche (ne modifier que le champ `faite`)","- supprimer une tâche"],
   example:`GET  /api/v1/exemples/  → 200`,
   starter:`# MÉTHODE  /url  → code
`,
   criteria:["5 endpoints, un par action demandée","Pas de verbe dans les URLs, ressources au pluriel","GET liste → 200 et POST création → 201","PATCH pour cocher une tâche","DELETE → 204"],
   hints:["La méthode HTTP porte l'action : pas de `/creer` ni de `/supprimer` dans l'URL.","Modifier un seul champ = `PATCH`. Une suppression réussie renvoie souvent 204 No Content."],
   solution:`GET     /api/v1/projets/                         → 200
POST    /api/v1/projets/                         → 201
GET     /api/v1/projets/{id}/taches/{tache_id}/  → 200
PATCH   /api/v1/projets/{id}/taches/{tache_id}/  → 200
DELETE  /api/v1/projets/{id}/taches/{tache_id}/  → 204
`}
],
tests: [
 { title:"Tester moyenne()", diff:1, lang:"python",
   prompt:["La fonction `moyenne(*notes)` de l'exercice Python est dans `notes.py`. Écris ses tests pytest :","- un test du cas normal","- un test du cas sans note (doit renvoyer `None`)","- un test paramétré avec au moins 3 jeux de données"],
   starter:`import pytest

from notes import moyenne


# tes tests ici
`,
   criteria:["Des fonctions test_… qui utilisent assert","Un test du cas normal avec une valeur attendue correcte","Le cas sans note vérifie moyenne() is None","@pytest.mark.parametrize avec au moins 3 jeux de données corrects"],
   hints:["Pour comparer à None, utilise `is None` plutôt que `== None`.","`@pytest.mark.parametrize(\"notes, attendu\", [((10,), 10), ...])` puis appelle `moyenne(*notes)`."],
   solution:`import pytest

from notes import moyenne


def test_moyenne_simple():
    assert moyenne(10, 14, 18) == 14


def test_moyenne_sans_note():
    assert moyenne() is None


@pytest.mark.parametrize("notes, attendu", [
    ((10,), 10),
    ((0, 20), 10),
    ((12, 13, 14), 13),
])
def test_moyenne_parametree(notes, attendu):
    assert moyenne(*notes) == attendu
`},
 { title:"Tester l'API et ses permissions", diff:3, lang:"python",
   prompt:["Écris deux tests pytest-django pour l'API `/api/v1/articles/`, protégée par `IsAuthenticated` :","- un utilisateur anonyme est refusé (401 ou 403 selon l'authentification)","- un utilisateur connecté crée un article : réponse 201, et l'auteur enregistré est bien lui"],
   starter:`import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


# tes tests ici
`,
   criteria:["@pytest.mark.django_db sur les tests qui utilisent la base","Un APIClient est utilisé","Anonyme : le test accepte 401 ou 403","Connecté : force_authenticate puis POST en JSON, avec assert sur 201","L'auteur de l'article créé est vérifié"],
   hints:["Crée l'utilisateur avec `User.objects.create_user(username=..., password=...)`.","`client.force_authenticate(user=user)` puis `client.post(url, donnees, format=\"json\")`."],
   solution:`import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.fixture
def client_api():
    return APIClient()


@pytest.mark.django_db
def test_anonyme_refuse(client_api):
    reponse = client_api.get("/api/v1/articles/")
    assert reponse.status_code in (401, 403)


@pytest.mark.django_db
def test_creation_assigne_auteur(client_api):
    user = User.objects.create_user(username="glady", password="motdepasse")
    client_api.force_authenticate(user=user)
    reponse = client_api.post(
        "/api/v1/articles/",
        {"titre": "Mon premier article", "contenu": "Bonjour"},
        format="json",
    )
    assert reponse.status_code == 201
    assert reponse.data["auteur"] == user.id
`}
],
git: [
 { title:"Ta branche de fonctionnalité", diff:1, lang:"bash",
   prompt:["Écris les commandes, dans l'ordre, pour :","- te placer sur `main` et la mettre à jour","- créer la branche `feature/recherche` et basculer dessus","- ajouter **uniquement** `blog/views.py`","- committer avec un message clair","- pousser la branche sur `origin` en la liant à ta branche locale"],
   starter:`# une commande par ligne
`,
   criteria:["git switch main (ou checkout main) puis git pull","git switch -c feature/recherche (ou checkout -b)","git add blog/views.py seulement (pas git add .)","git commit -m avec un message explicite","git push -u origin feature/recherche"],
   hints:["`git switch -c nom` crée la branche et bascule dessus.","`-u` (ou `--set-upstream`) lie la branche locale à la distante pour les prochains `git push`."],
   solution:`git switch main
git pull
git switch -c feature/recherche
git add blog/views.py
git commit -m "Ajoute la recherche d'articles"
git push -u origin feature/recherche
`}
],
archi: [
 { title:"Extraire un service", diff:3, lang:"python",
   prompt:["La vue ci-dessous fait trop de choses. Extrais la logique métier dans une fonction `publier_article(article, utilisateur)` du fichier `services.py` :","- si l'utilisateur n'est pas l'auteur : lève `PermissionDenied`","- sinon : passe `publie` à `True`, sauvegarde, puis appelle `envoyer_notification(article)`","La vue ne garde que la partie HTTP : récupérer l'article, appeler le service, rediriger."],
   example:`def publier(request, pk):
    article = get_object_or_404(Article, pk=pk)
    if article.auteur != request.user:
        return HttpResponseForbidden()
    article.publie = True
    article.save()
    envoyer_notification(article)
    return redirect("detail", pk=pk)`,
   starter:`# blog/services.py
from django.core.exceptions import PermissionDenied

from .notifications import envoyer_notification


def publier_article(article, utilisateur):
    pass


# blog/views.py
def publier(request, pk):
    pass
`,
   criteria:["publier_article lève PermissionDenied si l'utilisateur n'est pas l'auteur","Le service passe publie à True et sauvegarde l'article","Le service appelle envoyer_notification(article)","La vue enchaîne get_object_or_404, l'appel du service et redirect","La vue ne contient plus de logique métier","Bonus : save(update_fields=[\"publie\"])"],
   hints:["Le service ne connaît pas `request` : il reçoit l'article et l'utilisateur en paramètres.","Une `PermissionDenied` non attrapée dans une vue est convertie par Django en réponse 403."],
   solution:`# blog/services.py
from django.core.exceptions import PermissionDenied

from .notifications import envoyer_notification


def publier_article(article, utilisateur):
    if article.auteur != utilisateur:
        raise PermissionDenied("Seul l'auteur peut publier.")
    article.publie = True
    article.save(update_fields=["publie"])
    envoyer_notification(article)
    return article


# blog/views.py
from django.shortcuts import get_object_or_404, redirect

from .models import Article
from .services import publier_article


def publier(request, pk):
    article = get_object_or_404(Article, pk=pk)
    publier_article(article, request.user)
    return redirect("detail", pk=pk)
`}
]
};
