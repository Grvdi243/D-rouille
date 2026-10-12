/* Quiz : parcours → niveaux → questions (t: mc | fill | order) */
const TRACKS = [
{ id:"python", name:"Python", color:"--t-python", desc:"Les bases qui reviennent partout : types, structures, fonctions, classes.", levels:[
 { title:"Variables & types", qs:[
  {t:"mc", q:"Quel est le type de `3 / 2` ?", o:["float","int","str","Decimal"], a:0, x:"`/` renvoie toujours un `float` en Python 3 (`1.5`). Pour une division entière, utilise `//`."},
  {t:"mc", q:"Qu'affiche ce code ?", code:"print(7 // 2, 7 % 2)", o:["3 1","3.5 1","3 0","4 1"], a:0, x:"`//` = division entière (3), `%` = reste (1)."},
  {t:"fill", q:"Complète pour afficher « Salut Glady ».", code:'nom = "Glady"\nprint(f"Salut {___}")', c:["nom",'"nom"',"{nom}","name"], a:["nom"], x:"Dans une f-string, on met le nom de la variable entre accolades : `{nom}`."},
  {t:"mc", q:"Lequel de ces types est immuable ?", o:["tuple","list","dict","set"], a:0, x:"Un `tuple` ne peut pas être modifié après création. `list`, `dict` et `set` sont mutables."},
  {t:"mc", q:"Qu'affiche ce code ?", code:"x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)", o:["[1, 2, 3, 4]","[1, 2, 3]","Erreur","[4]"], a:0, x:"`y = x` ne copie pas la liste : les deux noms pointent vers le même objet. Pour copier : `x.copy()` ou `list(x)`."},
  {t:"mc", q:'Que vaut `bool("0")` ?', o:["True","False","0","Erreur"], a:0, x:"Seule la chaîne vide `\"\"` est fausse. `\"0\"` est une chaîne non vide, donc `True`."}
 ]},
 { title:"Listes & dictionnaires", qs:[
  {t:"mc", q:"Qu'affiche ce code ?", code:"nums = [10, 20, 30, 40]\nprint(nums[-1])", o:["40","10","Erreur","30"], a:0, x:"Les index négatifs partent de la fin : `-1` = dernier élément."},
  {t:"mc", q:"Que vaut `nums[1:3]` ?", code:"nums = [10, 20, 30, 40]", o:["[20, 30]","[10, 20, 30]","[20, 30, 40]","[10, 20]"], a:0, x:"Un slice `[début:fin]` inclut le début et exclut la fin : index 1 et 2."},
  {t:"fill", q:"Complète pour obtenir `[0, 1, 4, 9]`.", code:"carres = [___ for n in range(4)]", c:["n ** 2","n ^ 2","2 ** n","sqrt(n)"], a:["n ** 2"], x:"`**` est la puissance. Attention : `^` est le XOR bit à bit, pas une puissance."},
  {t:"mc", q:"Que renvoie ce code ?", code:'d = {"a": 1}\nd.get("b", 0)', o:["0","None","KeyError","1"], a:0, x:"`.get(clé, défaut)` renvoie la valeur par défaut si la clé n'existe pas, sans lever d'erreur."},
  {t:"mc", q:"Et celui-ci ?", code:'d = {"a": 1}\nd["b"]', o:["KeyError","None","0","IndexError"], a:0, x:"L'accès avec `[]` sur une clé absente lève `KeyError`. D'où l'intérêt de `.get()`."},
  {t:"fill", q:"Complète pour parcourir clés ET valeurs.", code:"for cle, val in d.___():\n    print(cle, val)", c:["items","keys","values","pairs"], a:["items"], x:"`.items()` renvoie des paires `(clé, valeur)`, qu'on déballe dans la boucle."}
 ]},
 { title:"Fonctions", qs:[
  {t:"mc", q:"Que renvoie une fonction sans `return` ?", o:["None","0","False","Une erreur"], a:0, x:"Sans `return` explicite, une fonction renvoie `None`."},
  {t:"mc", q:"Qu'affiche ce code ? (piège classique)", code:"def ajoute(x, liste=[]):\n    liste.append(x)\n    return liste\n\najoute(1)\nprint(ajoute(2))", o:["[1, 2]","[2]","[1]","Erreur"], a:0, x:"La valeur par défaut `[]` est créée UNE seule fois et partagée entre les appels. Anti-pattern : utilise `liste=None` puis `if liste is None: liste = []`."},
  {t:"fill", q:"Complète pour accepter un nombre variable d'arguments.", code:"def total(*___):\n    return sum(args)", c:["args","kwargs","*args","list"], a:["args"], x:"`*args` récupère les arguments positionnels dans un tuple."},
  {t:"mc", q:"Dans `def f(**kwargs)`, quel est le type de `kwargs` ?", o:["dict","tuple","list","set"], a:0, x:"`**kwargs` regroupe les arguments nommés dans un dictionnaire."},
  {t:"order", q:"Remets cette fonction dans l'ordre.", lines:["def est_pair(n):","    if n % 2 == 0:","        return True","    return False"], x:"La signature d'abord, puis le test, et le `return False` au niveau de la fonction (hors du `if`)."},
  {t:"mc", q:"Qu'affiche ce code ?", code:"double = lambda x: x * 2\nprint(double(5))", o:["10","25","7","Erreur"], a:0, x:"Une `lambda` est une petite fonction anonyme d'une seule expression."}
 ]},
 { title:"Classes & dataclasses", qs:[
  {t:"mc", q:"Dans une méthode, que représente `self` ?", o:["L'instance courante","La classe","Le module","La méthode parente"], a:0, x:"`self` est l'objet sur lequel la méthode est appelée."},
  {t:"fill", q:"Complète le constructeur.", code:"class Chien:\n    def ___(self, nom):\n        self.nom = nom", c:["__init__","__new__","init","constructor"], a:["__init__"], x:"`__init__` initialise l'instance après sa création."},
  {t:"mc", q:"Par défaut, que génère `@dataclass` ?", o:["`__init__`, `__repr__` et `__eq__`","Seulement `__init__`","Une table en base","Des getters/setters"], a:0, x:"Avec les options par défaut, `@dataclass` génère `__init__`, `__repr__` et `__eq__` à partir des champs annotés."},
  {t:"fill", q:"Complète pour créer une dataclass.", code:"from dataclasses import dataclass\n\n@___\nclass Point:\n    x: int\n    y: int", c:["dataclass","dataclasses","Dataclass","data"], a:["dataclass"], x:"On importe le décorateur `dataclass` et on l'applique avec `@dataclass`."},
  {t:"mc", q:"Qu'affiche ce code ?", code:'class A:\n    def parle(self):\n        return "A"\n\nclass B(A):\n    pass\n\nprint(B().parle())', o:["A","B","None","AttributeError"], a:0, x:"`B` hérite de `A` : sans redéfinition, c'est la méthode de `A` qui est utilisée."},
  {t:"mc", q:"À quoi sert `super().__init__(...)` ?", o:["Appeler l'`__init__` de la classe parente","Créer une nouvelle classe","Rendre l'objet immuable","Appeler l'`__init__` de l'enfant"], a:0, x:"Il exécute l'initialisation du parent, souvent avant d'ajouter ses propres attributs."}
 ]},
 { title:"Erreurs & fichiers", qs:[
  {t:"fill", q:"Complète pour gérer une conversion ratée.", code:'try:\n    x = int("abc")\nexcept ___:\n    x = 0', c:["ValueError","TypeError","KeyError","IndexError"], a:["ValueError"], x:"`int(\"abc\")` lève `ValueError` : bon type (str), mauvaise valeur."},
  {t:"mc", q:'Pourquoi `with open("f.txt") as f:` ?', o:["Le fichier est fermé automatiquement, même en cas d'erreur","C'est plus rapide","Ça crée le fichier s'il n'existe pas","Ça lit le fichier en binaire"], a:0, x:"`with` utilise un gestionnaire de contexte : la fermeture est garantie à la sortie du bloc."},
  {t:"mc", q:"Quelle fonction transforme une chaîne JSON en objet Python ?", o:["json.loads","json.dumps","json.dump","json.parse"], a:0, x:"`loads` = load string. `dumps` fait l'inverse. `load`/`dump` travaillent avec des fichiers."},
  {t:"mc", q:"Quand s'exécute un bloc `finally` ?", o:["Toujours, exception ou pas","Seulement s'il y a une exception","Seulement s'il n'y en a pas","Jamais si `return` est appelé"], a:0, x:"`finally` s'exécute dans tous les cas, même après un `return` dans le `try`."},
  {t:"order", q:"Remets dans l'ordre pour lire un fichier JSON.", lines:["import json",'with open("data.json") as f:',"    data = json.load(f)",'print(data["nom"])'], x:"Import, ouverture avec `with`, lecture dans le bloc, puis utilisation des données."},
  {t:"mc", q:"Une fonction fait `raise ValueError(\"x\")` et l'appelant n'a pas de `try`. Que se passe-t-il ?", o:["L'exception remonte et le programme s'arrête avec un traceback","La fonction renvoie None","Python ignore l'erreur","Seul un warning s'affiche"], a:0, x:"Une exception non attrapée remonte la pile d'appels jusqu'en haut et arrête le programme."}
 ]},
 { title:"Python avancé", qs:[
  {t:"mc", q:"Que crée une fonction qui contient `yield` ?", o:["Un générateur qui produit les valeurs à la demande","Une liste","Une coroutine async","Un thread"], a:0, x:"Un générateur calcule chaque valeur seulement quand on la demande : idéal pour de gros volumes."},
  {t:"mc", q:"Qu'affiche ce code ?", code:"def deco(f):\n    def wrapper():\n        return f() + 1\n    return wrapper\n\n@deco\ndef un():\n    return 1\n\nprint(un())", o:["2","1","None","Erreur"], a:0, x:"`@deco` remplace `un` par `wrapper`, qui appelle l'original puis ajoute 1."},
  {t:"fill", q:"Dans un décorateur, conserve le nom et la docstring de la fonction d'origine.", code:"from functools import ___\n\ndef deco(f):\n    @wraps(f)\n    def wrapper(*args, **kwargs):\n        return f(*args, **kwargs)\n    return wrapper", c:["wraps","partial","lru_cache","reduce"], a:["wraps"], x:"Sans `@wraps`, `un.__name__` vaudrait `\"wrapper\"`, ce qui brouille le débogage et les logs."},
  {t:"mc", q:"`def f(x: int) -> str:` puis `f(\"abc\")`. Que se passe-t-il ?", o:["Rien de spécial : Python ne vérifie pas les annotations à l'exécution","TypeError immédiat","Conversion automatique en int","SyntaxError"], a:0, x:"Les annotations servent aux outils (mypy, IDE). Pour une validation réelle, il faut du code ou une lib dédiée."},
  {t:"mc", q:"On appelle `charger()` (définie avec `async def`) sans `await`. Résultat ?", o:["Un objet coroutine, le corps ne s'exécute pas","Le résultat de la fonction","Une exception immédiate","Un thread démarre"], a:0, x:"Une coroutine doit être attendue (`await`) ou planifiée (ex : `asyncio.run`). Python affiche souvent un warning « was never awaited »."},
  {t:"mc", q:"Que vaut `sum(x * x for x in range(4))` ?", o:["14","30","16","9"], a:0, x:"0 + 1 + 4 + 9 = 14. L'expression génératrice évite de construire une liste intermédiaire."}
 ]}
]},
{ id:"django", name:"Django", color:"--t-django", desc:"Projet, modèles, ORM, vues : le cœur d'une app web.", levels:[
 { title:"Projet & apps", qs:[
  {t:"mc", q:"Quelle commande crée une nouvelle app `blog` ?", o:["`python manage.py startapp blog`","`django-admin newapp blog`","`python manage.py createapp blog`","`pip install blog`"], a:0, x:"`startapp` crée le dossier de l'app (models.py, views.py, …)."},
  {t:"mc", q:"Où déclarer une nouvelle app pour que Django la prenne en compte ?", o:["`INSTALLED_APPS` dans settings.py","urls.py","apps.py uniquement","`MIDDLEWARE`"], a:0, x:"Sans l'ajout dans `INSTALLED_APPS`, ses modèles et migrations sont ignorés."},
  {t:"mc", q:"Comment lancer le serveur de développement ?", o:["`python manage.py runserver`","`python manage.py start`","`django run`","`python app.py`"], a:0, x:"`runserver` lance un serveur de dev, à ne jamais utiliser en production."},
  {t:"mc", q:"Différence entre projet et app ?", o:["Le projet porte la config, une app est un module fonctionnel","C'est la même chose","Une app contient plusieurs projets","Le projet ne contient que les templates"], a:0, x:"Un projet = settings + urls racine. Une app = une fonctionnalité (blog, comptes…), réutilisable."},
  {t:"fill", q:"Complète l'import.", code:'from django.urls import ___\n\nurlpatterns = [\n    path("", views.accueil),\n]', c:["path","url","route","include"], a:["path"], x:"`path()` associe une route à une vue. `url()` est l'ancienne API, supprimée depuis Django 4.0."},
  {t:"mc", q:"À quoi sert `include()` dans urls.py ?", o:["Brancher les URLs d'une app dans celles du projet","Importer un template","Inclure un fichier settings","Charger un modèle"], a:0, x:'Ex : `path("blog/", include("blog.urls"))`.'}
 ]},
 { title:"Modèles & migrations", qs:[
  {t:"fill", q:"Complète la déclaration du modèle.", code:"from django.db import models\n\nclass Article(models.___):\n    titre = models.CharField(max_length=200)", c:["Model","Models","Base","Table"], a:["Model"], x:"Tout modèle hérite de `models.Model`."},
  {t:"mc", q:"Quel champ pour un titre court avec longueur max ?", o:["`CharField(max_length=200)`","`TextField()`","`StringField(200)`","`CharField()` sans argument"], a:0, x:"`CharField` exige `max_length`. `TextField` sert aux textes longs."},
  {t:"mc", q:"Tu modifies un modèle. Quelles commandes, dans l'ordre ?", o:["`makemigrations` puis `migrate`","`migrate` puis `makemigrations`","`syncdb`","`runserver` suffit"], a:0, x:"`makemigrations` génère le fichier de migration, `migrate` l'applique à la base."},
  {t:"fill", q:"Supprimer l'auteur doit supprimer ses articles.", code:"auteur = models.ForeignKey(\n    User, on_delete=models.___\n)", c:["CASCADE","DELETE","REMOVE","DROP"], a:["CASCADE"], x:"`CASCADE` supprime les objets liés. Autres options utiles : `PROTECT`, `SET_NULL` (avec `null=True`)."},
  {t:"mc", q:"À quoi sert `__str__` sur un modèle ?", o:["Donner une représentation lisible (admin, shell)","Valider les données","Définir la table SQL","Trier les résultats"], a:0, x:"Sans `__str__`, l'admin affiche « Article object (1) »."},
  {t:"mc", q:"Que fait `DateTimeField(auto_now_add=True)` ?", o:["Enregistre la date à la création uniquement","Met à jour la date à chaque sauvegarde","Rend le champ obligatoire dans les formulaires","Ajoute un index"], a:0, x:"`auto_now_add` = à la création. `auto_now` = à chaque `save()`."}
 ]},
 { title:"L'ORM", qs:[
  {t:"mc", q:"`Article.objects.get(pk=999)` alors que l'id n'existe pas :", o:["Lève `Article.DoesNotExist`","Renvoie None","Renvoie un QuerySet vide","Lève `KeyError`"], a:0, x:"`get()` attend exactement un résultat. Sinon `DoesNotExist` (0) ou `MultipleObjectsReturned` (2+)."},
  {t:"mc", q:"Que renvoie `.filter()` ?", o:["Un QuerySet (évalué paresseusement)","Une liste Python","Un seul objet","Un dict"], a:0, x:"Les QuerySets sont paresseux : aucune requête SQL tant qu'on ne les évalue pas."},
  {t:"fill", q:"Recherche « contient django », sans tenir compte de la casse.", code:'Article.objects.filter(titre_____="django")', c:["icontains","contains","like","ilike"], a:["icontains"], x:"Le préfixe `i` = insensible à la casse. `contains` est sensible à la casse."},
  {t:"mc", q:"Tu boucles sur des articles et affiches `article.auteur.nom` : une requête par article. Correctif ?", o:["`select_related(\"auteur\")`","`prefetch_related(\"auteur\")` obligatoirement","`.all()`","`.values()`"], a:0, x:"C'est le problème N+1. `select_related` fait une jointure SQL (ForeignKey/OneToOne). `prefetch_related` sert surtout au ManyToMany et aux relations inverses."},
  {t:"mc", q:"Quand la requête d'un QuerySet est-elle exécutée ?", o:["Quand on l'évalue (boucle, list(), len()…)","Dès sa création","À chaque `.filter()` chaîné","Uniquement avec `.execute()`"], a:0, x:"On peut chaîner `.filter().exclude().order_by()` sans coût : une seule requête au moment de l'évaluation."},
  {t:"fill", q:"Trie du plus récent au plus ancien.", code:'Article.objects.order_by("___date")', c:["-","+","!","desc "], a:["-"], x:"Le préfixe `-` inverse l'ordre (descendant)."}
 ]},
 { title:"Vues & templates", qs:[
  {t:"mc", q:"Quel est le premier paramètre d'une vue fonction ?", o:["request","self","response","kwargs"], a:0, x:"Django passe l'objet `HttpRequest` en premier argument."},
  {t:"fill", q:"Complète pour rendre un template.", code:'def liste(request):\n    articles = Article.objects.all()\n    return ___(request, "blog/liste.html", {"articles": articles})', c:["render","HttpResponse","redirect","template"], a:["render"], x:"`render(request, template, contexte)` renvoie une `HttpResponse` avec le HTML généré."},
  {t:"mc", q:"Syntaxe d'une boucle dans un template ?", o:["`{% for a in articles %}…{% endfor %}`","`{{ for a in articles }}`","`<for a in articles>`","`{% foreach articles %}`"], a:0, x:"Les tags `{% %}` ont souvent une balise de fermeture (`endfor`, `endif`, `endblock`)."},
  {t:"mc", q:"Différence entre `{{ }}` et `{% %}` ?", o:["`{{ }}` affiche une variable, `{% %}` exécute un tag","Aucune","`{{ }}` est pour les commentaires","`{% %}` affiche du HTML brut"], a:0, x:"`{{ article.titre }}` affiche, `{% if %}`/`{% for %}` contrôlent la logique."},
  {t:"mc", q:"Que faut-il mettre dans tout formulaire POST ?", o:["`{% csrf_token %}`","`{% secure %}`","`method=\"GET\"`","Rien, Django gère tout"], a:0, x:"Sécurité : le jeton CSRF empêche un site tiers de soumettre un formulaire à ta place. Sans lui, Django renvoie une 403."},
  {t:"mc", q:"Que fait `get_object_or_404(Article, pk=pk)` ?", o:["Renvoie l'objet ou lève `Http404`","Renvoie None si absent","Crée l'objet s'il manque","Renvoie un QuerySet"], a:0, x:"Raccourci propre pour les pages détail : pas besoin de gérer `DoesNotExist` à la main."}
 ]}
]},
{ id:"drf", name:"DRF", color:"--t-drf", desc:"Django REST Framework : serializers, ViewSets, permissions.", levels:[
 { title:"Serializers", qs:[
  {t:"mc", q:"Rôle d'un serializer ?", o:["Convertir objets ↔ JSON et valider les données","Gérer les URLs","Créer les tables","Authentifier l'utilisateur"], a:0, x:"Il sérialise (objet → JSON) et désérialise + valide (JSON → données propres)."},
  {t:"fill", q:"Complète pour un serializer basé sur un modèle.", code:'class ArticleSerializer(serializers.___):\n    class Meta:\n        model = Article\n        fields = ["id", "titre"]', c:["ModelSerializer","Serializer","ModelForm","Model"], a:["ModelSerializer"], x:"`ModelSerializer` génère les champs et `create()`/`update()` depuis le modèle."},
  {t:"mc", q:"Risque principal de `fields = \"__all__\"` ?", o:["Exposer des champs sensibles sans le vouloir","Ralentir les migrations","Rien, c'est recommandé","Bloquer la validation"], a:0, x:"Sécurité : liste explicitement les champs. Un champ ajouté plus tard au modèle serait exposé automatiquement."},
  {t:"mc", q:"Que faut-il appeler avant `serializer.save()` ?", o:["`serializer.is_valid()`","`serializer.clean()`","`serializer.validate()`","Rien"], a:0, x:"`save()` sans `is_valid()` lève une erreur. Les erreurs sont dans `serializer.errors`."},
  {t:"fill", q:"Complète le nom de la validation d'un champ.", code:"def ___titre(self, value):\n    if len(value) < 5:\n        raise serializers.ValidationError(\"Trop court\")\n    return value", c:["validate_","clean_","check_","is_valid_"], a:["validate_"], x:"Convention DRF : `validate_<nom_du_champ>`. (`clean_` est la convention des formulaires Django.)"},
  {t:"mc", q:"Que fait `read_only=True` sur un champ ?", o:["Renvoyé en sortie, ignoré en entrée","Champ caché dans la réponse","Champ obligatoire","Champ non modifiable en base"], a:0, x:"Idéal pour `id`, dates calculées, auteur défini côté serveur."}
 ]},
 { title:"Vues & ViewSets", qs:[
  {t:"mc", q:"Quelles actions fournit `ModelViewSet` ?", o:["list, create, retrieve, update, partial_update, destroy","Seulement list et retrieve","Seulement create","Aucune, il faut tout écrire"], a:0, x:"Le CRUD complet. `ReadOnlyModelViewSet` ne fournit que list et retrieve."},
  {t:"fill", q:"Complète le ViewSet.", code:"class ArticleViewSet(viewsets.ModelViewSet):\n    queryset = Article.objects.all()\n    ___ = ArticleSerializer", c:["serializer_class","serializer","serializers","model"], a:["serializer_class"], x:"`queryset` + `serializer_class` : le minimum pour un ModelViewSet."},
  {t:"mc", q:"Quel objet génère automatiquement les URLs d'un ViewSet ?", o:["Un router (ex : `DefaultRouter`)","`path()` seul","`include()` seul","Le serializer"], a:0, x:'`router.register("articles", ArticleViewSet)` puis on inclut `router.urls`.'},
  {t:"mc", q:"Quelle méthode HTTP pour une mise à jour partielle ?", o:["PATCH","PUT","POST","UPDATE"], a:0, x:"`PUT` remplace la ressource entière, `PATCH` modifie certains champs."},
  {t:"mc", q:"Code HTTP d'une création réussie ?", o:["201 Created","200 OK","204 No Content","202 Accepted"], a:0, x:"`CreateModelMixin` renvoie 201. 204 est typique d'une suppression réussie."},
  {t:"mc", q:"À quoi sert `@api_view([\"GET\"])` ?", o:["Transformer une vue fonction en vue DRF","Déclarer un ViewSet","Créer un serializer","Enregistrer une route"], a:0, x:"Il ajoute `Request`/`Response` DRF et limite les méthodes autorisées."}
 ]},
 { title:"Permissions & sécurité", qs:[
  {t:"fill", q:"Seuls les utilisateurs connectés peuvent accéder.", code:"class ArticleViewSet(viewsets.ModelViewSet):\n    permission_classes = [___]", c:["IsAuthenticated","AllowAny","IsAdminUser","IsLoggedIn"], a:["IsAuthenticated"], x:"`IsAuthenticated` refuse les requêtes anonymes. `IsLoggedIn` n'existe pas."},
  {t:"mc", q:"Différence entre 401 et 403 ?", o:["401 : non authentifié · 403 : authentifié mais non autorisé","Aucune","401 : serveur en panne · 403 : page absente","401 : autorisé · 403 : interdit"], a:0, x:"401 = « qui es-tu ? », 403 = « je sais qui tu es, mais non »."},
  {t:"mc", q:"Pourquoi filtrer `get_queryset()` avec `self.request.user` ?", o:["Chaque utilisateur ne voit que ses propres données","Pour accélérer le cache","Pour trier les résultats","C'est obligatoire dans DRF"], a:0, x:"Sécurité : sans ça, n'importe qui peut lire `/api/articles/42/` d'un autre utilisateur."},
  {t:"mc", q:"Où coder une permission « seul l'auteur peut modifier cet objet » ?", o:["`has_object_permission` d'une `BasePermission`","Dans le serializer","Dans `settings.py`","Dans le modèle"], a:0, x:"`has_permission` vérifie la vue, `has_object_permission` vérifie un objet précis."},
  {t:"mc", q:"Pourquoi `serializer.save(auteur=self.request.user)` dans `perform_create` ?", o:["L'auteur est fixé côté serveur, pas fourni par le client","Pour éviter une migration","Pour accélérer la requête","Pour valider le titre"], a:0, x:"Ne jamais faire confiance au client pour l'identité : il pourrait envoyer l'id d'un autre."},
  {t:"mc", q:"Où ranger la `SECRET_KEY` ?", o:["Dans une variable d'environnement, hors Git","Dans settings.py commité","Dans le README","Dans un template"], a:0, x:"Une clé commitée est compromise, même supprimée ensuite (elle reste dans l'historique)."}
 ]}
]},
{ id:"pg", name:"PostgreSQL", color:"--t-sql", desc:"Requêtes, jointures, index et transactions.", levels:[
 { title:"SELECT", qs:[
  {t:"mc", q:"Comment sélectionner toutes les colonnes de `articles` ?", o:["`SELECT * FROM articles;`","`GET * FROM articles;`","`SELECT ALL articles;`","`SELECT articles.*all;`"], a:0, x:"En pratique, préfère lister les colonnes utiles."},
  {t:"fill", q:"Seulement les articles publiés.", code:"SELECT titre FROM articles\n___ publie = true;", c:["WHERE","IF","FILTER","HAVING"], a:["WHERE"], x:"`WHERE` filtre les lignes avant tout regroupement."},
  {t:"fill", q:"Du plus récent au plus ancien.", code:"SELECT titre FROM articles\nORDER BY date ___;", c:["DESC","ASC","DOWN","REVERSE"], a:["DESC"], x:"`ASC` est l'ordre par défaut, `DESC` l'inverse."},
  {t:"mc", q:"Que fait `LIMIT 5` ?", o:["Renvoie au plus 5 lignes","Saute 5 lignes","Limite à 5 colonnes","Limite le temps à 5 s"], a:0, x:"Combine-le avec `ORDER BY` pour un résultat déterministe. `OFFSET` saute des lignes."},
  {t:"mc", q:"`WHERE titre LIKE 'Dj%'` trouve :", o:["Les titres qui commencent par « Dj »","Les titres qui finissent par « Dj »","Les titres égaux à « Dj% »","Les titres contenant « Dj » n'importe où"], a:0, x:"`%` = n'importe quelle suite de caractères. `ILIKE` = version insensible à la casse (spécifique à PostgreSQL)."},
  {t:"mc", q:"Pourquoi `WHERE x = NULL` ne renvoie rien ?", o:["Une comparaison avec NULL n'est jamais vraie : il faut `IS NULL`","NULL vaut 0","C'est une erreur de syntaxe","Il faut écrire `== NULL`"], a:0, x:"NULL = « inconnu ». `x = NULL` donne NULL (ni vrai ni faux)."}
 ]},
 { title:"Jointures & agrégats", qs:[
  {t:"mc", q:"Que renvoie un `INNER JOIN` ?", o:["Les lignes qui ont une correspondance des deux côtés","Toutes les lignes des deux tables","Toutes les lignes de gauche","Le produit cartésien"], a:0, x:"`JOIN` seul = `INNER JOIN`."},
  {t:"mc", q:"Et un `LEFT JOIN` ?", o:["Toutes les lignes de gauche, avec NULL si pas de correspondance","Seulement les lignes sans correspondance","Toutes les lignes de droite","Identique à INNER JOIN"], a:0, x:"Utile pour « auteurs avec ou sans articles »."},
  {t:"fill", q:"Nombre d'articles par auteur.", code:"SELECT auteur_id, ___(*)\nFROM articles\nGROUP BY auteur_id;", c:["COUNT","SUM","TOTAL","LEN"], a:["COUNT"], x:"`COUNT(*)` compte les lignes de chaque groupe."},
  {t:"mc", q:"Pour garder seulement les auteurs avec plus de 5 articles :", o:["`HAVING COUNT(*) > 5`","`WHERE COUNT(*) > 5`","`LIMIT 5`","`FILTER > 5`"], a:0, x:"`WHERE` filtre avant le regroupement, `HAVING` filtre après (sur les agrégats)."},
  {t:"order", q:"Remets cette requête dans l'ordre.", lines:["SELECT a.nom, COUNT(*)","FROM auteurs a","JOIN articles ar ON ar.auteur_id = a.id","GROUP BY a.nom","ORDER BY COUNT(*) DESC;"], x:"Ordre d'écriture : SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT."},
  {t:"mc", q:"En ORM Django, quelle méthode ajoute un compte à CHAQUE auteur ?", o:["`annotate(nb=Count(\"article\"))`","`aggregate(nb=Count(\"article\"))`","`count()`","`values(\"article\")`"], a:0, x:"`annotate` ajoute un champ par objet. `aggregate` renvoie un seul dict pour tout le QuerySet."}
 ]},
 { title:"Index & transactions", qs:[
  {t:"mc", q:"À quoi sert un index ?", o:["Accélérer les recherches, au prix d'écritures plus lentes","Chiffrer une colonne","Garantir l'unicité, toujours","Trier physiquement la table"], a:0, x:"Chaque INSERT/UPDATE doit aussi mettre à jour l'index : n'indexe que ce que tu filtres ou tries souvent."},
  {t:"mc", q:"Une `PRIMARY KEY` implique :", o:["Valeurs uniques et non NULL","Valeurs uniques, NULL autorisé","Auto-incrément obligatoire","Rien de plus qu'un nom"], a:0, x:"PostgreSQL crée aussi un index unique automatiquement."},
  {t:"mc", q:"Que garantit une transaction (atomicité) ?", o:["Tout est appliqué, ou rien","Les requêtes vont plus vite","Les données sont chiffrées","Aucun autre utilisateur ne peut lire"], a:0, x:"Si une étape échoue, tout est annulé (ROLLBACK)."},
  {t:"fill", q:"Version Django d'une transaction.", code:"from django.db import transaction\n\nwith transaction.___():\n    compte_a.save()\n    compte_b.save()", c:["atomic","begin","commit","lock"], a:["atomic"], x:"`transaction.atomic()` s'utilise en context manager ou en décorateur."},
  {t:"mc", q:"Quel est le problème ici ?", code:'cursor.execute(\n    f"SELECT * FROM users WHERE nom = \'{nom}\'"\n)', o:["Injection SQL : il faut passer des paramètres (`%s`)","Rien","Il manque un `;`","`cursor` n'existe pas en Django"], a:0, x:"Sécurité : `cursor.execute(\"... WHERE nom = %s\", [nom])` laisse le driver échapper la valeur. Avec l'ORM, tu es protégé par défaut."},
  {t:"mc", q:"Que montre `EXPLAIN ANALYZE` ?", o:["Le plan d'exécution avec les temps réels","Le schéma de la table","Les erreurs de syntaxe","L'historique des requêtes"], a:0, x:"Attention : `ANALYZE` exécute réellement la requête. Prudence avec un UPDATE ou un DELETE."}
 ]}
]},
{ id:"http", name:"HTTP & REST", color:"--t-http", desc:"Le langage des APIs : méthodes, codes de statut, design d'URLs.", levels:[
 { title:"HTTP", qs:[
  {t:"mc", q:"Une requête `GET` doit être :", o:["Sûre : elle ne modifie rien côté serveur","Utilisée pour supprimer","Toujours authentifiée","Envoyée avec un body JSON"], a:0, x:"GET lit. Pour modifier : POST, PUT, PATCH, DELETE. Un GET qui modifie des données est un anti-pattern (et un risque CSRF)."},
  {t:"mc", q:"Que signifie un code 404 ?", o:["Ressource introuvable","Erreur serveur","Non authentifié","Requête réussie sans contenu"], a:0, x:"Famille 4xx = erreur du client. 5xx = erreur du serveur."},
  {t:"mc", q:"Et un code 500 ?", o:["Erreur interne du serveur","Ressource déplacée","Requête mal formée","Trop de requêtes"], a:0, x:"Typiquement une exception non gérée dans ton code. Regarde les logs."},
  {t:"mc", q:"Laquelle de ces méthodes n'est PAS idempotente ?", o:["POST","GET","PUT","DELETE"], a:0, x:"Idempotent = répéter la requête donne le même état final. Deux POST créent deux ressources."},
  {t:"mc", q:"Quel `Content-Type` pour un body JSON ?", o:["application/json","text/json","json/application","text/plain"], a:0, x:"Sans le bon en-tête, beaucoup de serveurs (dont DRF) ne parsent pas le body comme du JSON."},
  {t:"mc", q:"Qu'apporte HTTPS par rapport à HTTP ?", o:["Le chiffrement du trafic (TLS)","Des requêtes plus rapides","La compression automatique","L'authentification des utilisateurs"], a:0, x:"Sécurité : sans HTTPS, tokens et mots de passe circulent en clair."}
 ]},
 { title:"Design d'API REST", qs:[
  {t:"mc", q:"Meilleure URL pour lister les commentaires de l'article 42 ?", o:["`GET /articles/42/commentaires`","`GET /getCommentaires?article=42`","`POST /articles/42/listerCommentaires`","`GET /commentaires/article-42/get`"], a:0, x:"Des noms (ressources) dans l'URL, l'action portée par la méthode HTTP."},
  {t:"mc", q:"Laquelle est un anti-pattern REST ?", o:["`POST /creerArticle`","`POST /articles`","`DELETE /articles/3`","`PATCH /articles/3`"], a:0, x:"Le verbe est déjà dans la méthode HTTP : pas besoin de « creer » dans l'URL."},
  {t:"mc", q:"Pourquoi paginer une liste ?", o:["Éviter de renvoyer des milliers de lignes d'un coup","C'est obligatoire en HTTP","Pour chiffrer les données","Pour éviter les migrations"], a:0, x:"Performance et mémoire, côté serveur comme côté client. DRF propose `PageNumberPagination` et d'autres."},
  {t:"mc", q:"Quel code DRF renvoie quand un serializer est invalide ?", o:["400 Bad Request","500 Internal Server Error","404 Not Found","200 OK avec les erreurs"], a:0, x:"`is_valid(raise_exception=True)` lève une `ValidationError`, transformée en 400 avec le détail des erreurs."},
  {t:"mc", q:"Pourquoi préfixer l'API avec `/api/v1/` ?", o:["Faire évoluer l'API sans casser les clients existants","C'est plus rapide","Django l'exige","Pour le SEO"], a:0, x:"Une v2 peut changer les formats pendant que les clients v1 continuent de fonctionner."},
  {t:"mc", q:"« REST est stateless » signifie :", o:["Chaque requête porte tout ce qu'il faut (ex : le token)","Le serveur n'a pas de base de données","Les réponses ne sont jamais mises en cache","On ne peut pas modifier de données"], a:0, x:"Le serveur ne se souvient pas de la requête précédente : ça facilite la montée en charge."}
 ]}
]},
{ id:"tests", name:"Tests", color:"--t-test", desc:"pytest et pytest-django : prouver que ton code marche.", levels:[
 { title:"pytest : les bases", qs:[
  {t:"mc", q:"Par défaut, quels fichiers pytest découvre-t-il ?", o:["`test_*.py` ou `*_test.py`","Tous les `.py`","Seulement `tests.py`","Ceux listés dans settings.py"], a:0, x:"Et dans ces fichiers, les fonctions préfixées `test`."},
  {t:"fill", q:"Complète le test.", code:"def test_addition():\n    ___ add(2, 3) == 5", c:["assert","check","expect","return"], a:["assert"], x:"pytest réécrit les `assert` pour afficher un diff clair en cas d'échec."},
  {t:"fill", q:"Vérifie qu'une exception est levée.", code:"import pytest\n\ndef test_division():\n    with pytest.___(ZeroDivisionError):\n        1 / 0", c:["raises","throws","error","expect"], a:["raises"], x:"`pytest.raises` échoue si l'exception attendue n'est PAS levée."},
  {t:"mc", q:"À quoi sert une fixture ?", o:["Préparer des données ou ressources réutilisables, injectées par nom","Lancer les tests en parallèle","Mesurer la couverture","Ignorer un test"], a:0, x:"Le test déclare la fixture en paramètre, pytest l'exécute et injecte la valeur."},
  {t:"fill", q:"Déclare une fixture.", code:'import pytest\n\n@pytest.___\ndef utilisateur():\n    return {"nom": "Glady"}', c:["fixture","setup","mark","param"], a:["fixture"], x:"Ensuite : `def test_nom(utilisateur): assert utilisateur[\"nom\"] == \"Glady\"`."},
  {t:"mc", q:"À quoi sert `@pytest.mark.parametrize` ?", o:["Lancer le même test avec plusieurs jeux de données","Rendre un test plus rapide","Marquer un test comme ignoré","Créer une fixture"], a:0, x:"Un test, plusieurs cas : moins de duplication, rapport détaillé par cas."}
 ]},
 { title:"Tester Django & DRF", qs:[
  {t:"mc", q:"Avec pytest-django, comment autoriser un test à utiliser la base ?", o:["`@pytest.mark.django_db`","`@pytest.database`","`@django.test`","Rien, c'est automatique"], a:0, x:"Sans ce marqueur, tout accès à la base lève une erreur explicite."},
  {t:"mc", q:"Sur quelle base tournent les tests ?", o:["Une base de test séparée, créée puis détruite","Ta base de dev","La base de production","Aucune, tout est simulé"], a:0, x:"Tes données de dev ne sont jamais touchées."},
  {t:"mc", q:"Quel client utiliser pour tester une API DRF ?", o:["`APIClient` de `rest_framework.test`","`requests`","`curl`","`HttpRequest`"], a:0, x:"Il gère le JSON (`format=\"json\"`) et l'authentification simplement."},
  {t:"mc", q:"Que fait `client.force_authenticate(user=u)` ?", o:["Authentifie les requêtes sans passer par un login ou un token","Crée l'utilisateur","Teste le mot de passe","Désactive les permissions"], a:0, x:"Pratique pour tester les permissions sans dépendre du mécanisme d'auth."},
  {t:"mc", q:"Dans un test d'API, que vérifier en priorité ?", o:["Code de statut, permissions et données renvoyées","Le nom des variables","Le temps d'exécution exact","Le HTML de l'admin"], a:0, x:"Teste le comportement observable, pas les détails d'implémentation. N'oublie pas le cas « autre utilisateur → 403/404 »."},
  {t:"mc", q:"À quoi sert `unittest.mock.patch` ?", o:["Remplacer une dépendance externe (API, email) pendant le test","Corriger un bug","Accélérer la base","Générer des données aléatoires"], a:0, x:"Tes tests restent rapides, isolés et ne dépendent pas d'un service extérieur."}
 ]}
]},
{ id:"git", name:"Git", color:"--t-git", desc:"Les commandes du quotidien et les réflexes de sécurité.", levels:[
 { title:"Git au quotidien", qs:[
  {t:"mc", q:"Quelle commande prépare un fichier pour le prochain commit ?", o:["`git add`","`git commit`","`git push`","`git stage-all`"], a:0, x:"`add` place les changements dans la zone de staging, `commit` les enregistre."},
  {t:"mc", q:"Que montre `git status` ?", o:["Les fichiers modifiés, stagés et non suivis","L'historique des commits","Les branches distantes","Le contenu d'un fichier"], a:0, x:"Ton réflexe avant chaque commit. L'historique, c'est `git log`."},
  {t:"mc", q:"Créer une branche et basculer dessus :", o:["`git switch -c ma-branche`","`git branch --go ma-branche`","`git new ma-branche`","`git push ma-branche`"], a:0, x:"Équivalent historique : `git checkout -b ma-branche`."},
  {t:"mc", q:"Que mettre dans `.gitignore` pour un projet Django ?", o:["`.env`, `venv/`, `__pycache__/`, `db.sqlite3`","`models.py`","`requirements.txt`","`manage.py`"], a:0, x:"Secrets, dépendances installées et fichiers générés ne vont pas dans Git."},
  {t:"order", q:"Remets ce workflow dans l'ordre.", lines:["git switch -c fix-login","git add .","git commit -m \"Fix login redirect\"","git push -u origin fix-login"], x:"Branche → staging → commit → push (`-u` lie la branche locale à la distante)."},
  {t:"mc", q:"Tu as commité un `.env` avec un mot de passe. Première chose à faire ?", o:["Changer le mot de passe : il reste dans l'historique","Supprimer le fichier et recommiter","Rien si le repo est privé","Renommer le fichier"], a:0, x:"Sécurité : supprimer le fichier ne l'efface pas de l'historique. Considère le secret comme compromis."}
 ]}
]},
{ id:"archi", name:"Architecture", color:"--t-archi", desc:"Ce qui fait la différence entre « ça marche » et « c'est pro ».", levels:[
 { title:"Réflexes de senior", qs:[
  {t:"mc", q:"Où placer la logique métier dans un projet Django ?", o:["Hors des vues : modèles ou couche de services","Dans les templates","Dans urls.py","Directement dans les vues, c'est plus simple"], a:0, x:"Des vues fines sont plus faciles à tester et à réutiliser (vue web, API, commande)."},
  {t:"mc", q:"À quoi sert Celery ?", o:["Exécuter des tâches longues en arrière-plan","Remplacer l'ORM","Servir les fichiers statiques","Gérer les migrations"], a:0, x:"Envoi d'emails, imports, traitements lourds : on ne bloque pas la requête HTTP."},
  {t:"mc", q:"À quoi sert un cache comme Redis ?", o:["Garder des résultats coûteux pour répondre plus vite","Remplacer PostgreSQL","Chiffrer les données","Versionner le code"], a:0, x:"Difficulté classique : invalider le cache quand la donnée change."},
  {t:"mc", q:"Où mettre la configuration qui change selon l'environnement (dev/prod) ?", o:["Dans des variables d'environnement","En dur dans settings.py","Dans le code des vues","Dans la base de données"], a:0, x:"Principe des applications « 12-factor » : même code partout, configuration injectée."},
  {t:"mc", q:"Pourquoi `logging` plutôt que `print` en production ?", o:["Niveaux, horodatage et redirection vers fichiers ou services","C'est plus court à écrire","`print` ne marche pas en prod","Pour masquer les erreurs"], a:0, x:"`logger.error(...)`, `logger.info(...)` : tu filtres et retrouves ce qui s'est passé."},
  {t:"mc", q:"Le principe DRY signifie :", o:["Ne pas dupliquer la même logique à plusieurs endroits","Écrire le moins de tests possible","Ne jamais utiliser de librairies","Tout mettre dans un seul fichier"], a:0, x:"« Don't Repeat Yourself ». Attention à ne pas tomber dans l'excès inverse : une abstraction prématurée coûte aussi."}
 ]}
]}
];
