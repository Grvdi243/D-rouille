"""Vérifie que chaque solution de référence de Dérouille fonctionne vraiment.

Python pur : exécuté et testé · SQL : SQLite · Django/DRF : mini-projet + pytest-django · git : dépôt jetable.
"""
import contextlib
import io
import json
import os
import re
import shlex
import sqlite3
import subprocess
import sys
import tempfile
import textwrap
import traceback
from pathlib import Path
from unittest import mock

HERE = Path(__file__).parent
SOL = HERE / "solutions.json"
subprocess.run(["node", "-e", "const fs=require('fs');const EX=eval(fs.readFileSync(process.argv[1],'utf8')+';EXERCISES');"
                "fs.writeFileSync(process.argv[2],JSON.stringify(EX))", str(HERE.parent / "src" / "exercises.js"), str(SOL)], check=True)
EX = json.loads(SOL.read_text(encoding="utf-8"))
results = []


def check(name, fn):
    try:
        fn()
        results.append((name, "OK", ""))
    except Exception as e:  # noqa: BLE001 — on veut le rapport complet
        results.append((name, "ÉCHEC", "".join(traceback.format_exception_only(type(e), e)).strip()))


def sol(track, i):
    return EX[track][i]["solution"]


def split_files(code):
    """Découpe une solution multi-fichiers sur ses en-têtes « # chemin.py » ou « {# chemin.html #} »."""
    files, cur, buf = {}, None, []
    for line in code.splitlines():
        m = re.match(r"^# ([\w/]+\.(?:py|html))\s*$", line) or re.match(r"^\{# ([\w/.]+) #\}\s*$", line)
        if m:
            if cur:
                files[cur] = "\n".join(buf).strip() + "\n"
            cur, buf = m.group(1), []
        else:
            buf.append(line)
    if cur:
        files[cur] = "\n".join(buf).strip() + "\n"
    return files


def run(code):
    ns = {"__name__": "solution"}
    exec(compile(code, "<solution>", "exec"), ns)
    return ns


# ---------------- Python pur ----------------
def p1():
    f = run(sol("python", 0))["format_prix"]
    assert f(3.5) == "3.50 €", f(3.5)
    assert f(10) == "10.00 €", f(10)


def p2():
    f = run(sol("python", 1))["compte_mots"]
    assert f("Le chat et le chien") == {"le": 2, "chat": 1, "et": 1, "chien": 1}
    assert f("") == {}


def p3():
    f = run(sol("python", 2))["moyenne"]
    assert f(10, 14, 18) == 14.0
    assert f() is None


def p4():
    ns = run(sol("python", 3))
    A = ns["Article"]
    assert ns["total_panier"]([A("Café", 4.5, 2), A("Pain", 2.0)]) == 11.0
    assert A("x", 1.0).quantite == 1


def p5():
    f = run(sol("python", 4))["charger_config"]
    d = Path(tempfile.mkdtemp())
    (d / "ok.json").write_text('{"debug": true}', encoding="utf-8")
    (d / "ko.json").write_text("{debug", encoding="utf-8")
    assert f(d / "ok.json") == {"debug": True}
    assert f(d / "absent.json") == {}
    try:
        f(d / "ko.json")
    except ValueError as e:
        assert str(e) == "Config invalide", str(e)
        assert e.__cause__ is not None
    else:
        raise AssertionError("pas de ValueError sur un JSON invalide")


def p6():
    deco = run(sol("python", 5))["compteur_appels"]

    @deco
    def salut(nom="toi"):
        return "salut " + nom

    assert salut.appels == 0
    salut()
    assert salut("x") == "salut x"
    assert salut.appels == 2
    assert salut.__name__ == "salut"


def t1():
    d = Path(tempfile.mkdtemp())
    (d / "notes.py").write_text(sol("python", 2), encoding="utf-8")
    (d / "test_notes.py").write_text(sol("tests", 0), encoding="utf-8")
    r = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", "-p", "no:django", str(d)],
                       cwd=d, capture_output=True, text=True)
    assert r.returncode == 0 and "5 passed" in r.stdout, r.stdout[-800:] + r.stderr[-400:]


def h1():
    class Reponse:
        status_code = 201

        def json(self):
            return {"id": 42}

    out = io.StringIO()
    with mock.patch("requests.post", return_value=Reponse()) as post, contextlib.redirect_stdout(out):
        run(sol("http", 0))
    args, kw = post.call_args
    assert args[0] == "https://api.exemple.com/api/v1/articles/"
    assert kw["json"] == {"titre": "Mon article", "contenu": "Bonjour"}
    assert kw["headers"]["Authorization"] == "Token abc123"
    assert kw.get("timeout")
    assert out.getvalue().strip() == "42", out.getvalue()


# ---------------- SQL (SQLite) ----------------
ROWS = [(i, f"A{i}", i % 3 != 0, f"2026-10-{i:02d}", 1 if i <= 5 else 2) for i in range(1, 11)]


def base_sql():
    db = sqlite3.connect(":memory:")
    db.executescript("""
        CREATE TABLE articles(id INTEGER PRIMARY KEY, titre TEXT, publie BOOLEAN, cree_le TEXT, auteur_id INTEGER);
        CREATE TABLE auteurs(id INTEGER PRIMARY KEY, nom TEXT);
        CREATE TABLE comptes(id INTEGER PRIMARY KEY, solde INTEGER);
        INSERT INTO comptes VALUES (1, 500), (2, 100);
        INSERT INTO auteurs VALUES (1, 'Ada'), (2, 'Linus'), (3, 'Grace');
    """)
    db.executemany("INSERT INTO articles VALUES (?, ?, ?, ?, ?)", ROWS)
    return db


def s1():
    r = base_sql().execute(sol("pg", 0)).fetchall()
    attendu = sorted((x for x in ROWS if x[2]), key=lambda x: x[3], reverse=True)[:5]
    assert [t for t, _ in r] == [x[1] for x in attendu], r


def s2():
    r = base_sql().execute(sol("pg", 1)).fetchall()
    assert dict(r) == {"Ada": 5, "Linus": 5, "Grace": 0}, r
    assert r[-1] == ("Grace", 0), r


def s3():
    db = base_sql()
    db.isolation_level = None
    db.executescript(sol("pg", 2))
    assert db.execute("SELECT solde FROM comptes ORDER BY id").fetchall() == [(400,), (200,)]
    assert db.execute("SELECT 1 FROM sqlite_master WHERE type='index' AND name='idx_articles_auteur_id'").fetchone()


# ---------------- git ----------------
def g1():
    d = Path(tempfile.mkdtemp())
    env = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="t",
               GIT_COMMITTER_EMAIL="t@t", GIT_TERMINAL_PROMPT="0")

    def git(args, cwd):
        r = subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, env=env)
        assert r.returncode == 0, (args, r.stderr)
        return r.stdout

    git(["init", "--bare", "-b", "main", "origin.git"], d)
    git(["clone", "origin.git", "repo"], d)
    repo = d / "repo"
    (repo / "blog").mkdir()
    (repo / "blog" / "views.py").write_text("# v1\n")
    git(["add", "-A"], repo)
    git(["commit", "-m", "init"], repo)
    git(["push", "-u", "origin", "main"], repo)
    (repo / "blog" / "views.py").write_text("# v2 : recherche\n")
    (repo / "notes.txt").write_text("brouillon\n")
    for line in sol("git", 0).splitlines():
        if line.strip() and not line.startswith("#"):
            git(shlex.split(line)[1:], repo)
    assert "feature/recherche" in git(["ls-remote", "--heads", "origin"], repo)
    changed = git(["show", "--name-only", "--format=", "HEAD"], repo).split()
    assert changed == ["blog/views.py"], changed
    assert "notes.txt" in git(["status", "--porcelain"], repo)


# ---------------- Django + DRF ----------------
DJANGO_TESTS = '''
import pytest
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.urls import reverse
from rest_framework.test import APIClient

from blog import notifications
from blog.models import Article


@pytest.fixture
def users(db):
    return User.objects.create_user("glady", password="x"), User.objects.create_user("autre", password="x")


def test_d1_urls():
    assert reverse("liste") == "/blog/"
    assert reverse("detail", args=[3]) == "/blog/3/"


def test_d2_modele(users):
    a = Article.objects.create(titre="Bonjour", contenu="...", auteur=users[0])
    assert str(a) == "Bonjour" and a.publie is False and a.cree_le is not None
    assert list(users[0].articles.all()) == [a]
    assert Article._meta.ordering == ["-cree_le"]
    assert Article._meta.get_field("titre").max_length == 200
    users[0].delete()
    assert Article.objects.count() == 0


def test_d3_orm(users, django_assert_num_queries):
    from datetime import timedelta
    from django.utils import timezone
    now = timezone.now()
    for i, (titre, publie) in enumerate([("Django pas à pas", True), ("Python", True), ("DJANGO avancé", False)]):
        a = Article.objects.create(titre=titre, contenu="x", publie=publie, auteur=users[0])
        Article.objects.filter(pk=a.pk).update(cree_le=now - timedelta(days=i))
    import blog.orm_sol as q
    assert [a.titre for a in q.publies.all()] == ["Django pas à pas", "Python"]
    assert sorted(a.titre for a in q.recherche.all()) == ["DJANGO avancé", "Django pas à pas"]
    with django_assert_num_queries(1):
        assert len([a.auteur.username for a in q.avec_auteurs.all()]) == 3


def test_d4_detail(users, client):
    a = Article.objects.create(titre="Titre test", contenu="Le contenu", auteur=users[0])
    html = client.get(f"/blog/{a.pk}/").content.decode()
    assert "<h1>Titre test</h1>" in html and "Par glady" in html and "<p>Le contenu</p>" in html
    assert client.get("/blog/999/").status_code == 404


def test_r1_serializer(users):
    from blog.serializers import ArticleSerializer
    s = ArticleSerializer(data={"titre": "abc", "contenu": "x"})
    assert not s.is_valid() and s.errors["titre"] == ["Titre trop court"]
    s = ArticleSerializer(data={"titre": "Assez long", "contenu": "x", "auteur": users[1].pk, "id": 999})
    assert s.is_valid(), s.errors
    a = s.save(auteur=users[0])
    assert a.auteur == users[0] and a.pk != 999
    assert set(ArticleSerializer(a).data) == {"id", "titre", "contenu", "auteur", "cree_le"}


def test_r2_viewset_simple():
    from rest_framework import viewsets
    import blog.views_r2 as v
    assert issubclass(v.ArticleViewSet, viewsets.ModelViewSet)


def test_r3_permissions(users):
    c = APIClient()
    assert c.get("/api/v1/articles/").status_code in (401, 403)
    c.force_authenticate(users[0])
    r = c.post("/api/v1/articles/", {"titre": "Mon article", "contenu": "x", "auteur": users[1].pk}, format="json")
    assert r.status_code == 201 and r.data["auteur"] == users[0].pk
    pk = r.data["id"]
    c2 = APIClient()
    c2.force_authenticate(users[1])
    assert c2.get(f"/api/v1/articles/{pk}/").status_code == 200
    assert c2.patch(f"/api/v1/articles/{pk}/", {"titre": "Piratage"}, format="json").status_code == 403
    assert c2.delete(f"/api/v1/articles/{pk}/").status_code == 403
    assert c.patch(f"/api/v1/articles/{pk}/", {"titre": "Nouveau titre"}, format="json").status_code == 200
    assert c.delete(f"/api/v1/articles/{pk}/").status_code == 204


def test_a1_service(users, client):
    from blog.services import publier_article
    a = Article.objects.create(titre="Brouillon", contenu="x", auteur=users[0])
    with pytest.raises(PermissionDenied):
        publier_article(a, users[1])
    a.refresh_from_db()
    assert a.publie is False
    publier_article(a, users[0])
    a.refresh_from_db()
    assert a.publie is True and notifications.envoyes[-1] == a.pk
    b = Article.objects.create(titre="Autre", contenu="x", auteur=users[0])
    client.force_login(users[1])
    assert client.post(f"/blog/{b.pk}/publier/").status_code == 403
    client.force_login(users[0])
    r = client.post(f"/blog/{b.pk}/publier/")
    assert r.status_code == 302 and r["Location"] == f"/blog/{b.pk}/"
'''

SETTINGS = '''
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "verif"
DEBUG = True
ALLOWED_HOSTS = ["testserver"]
INSTALLED_APPS = ["django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
                  "django.contrib.sessions", "django.contrib.messages", "rest_framework", "blog"]
MIDDLEWARE = ["django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware",
              "django.middleware.csrf.CsrfViewMiddleware", "django.contrib.auth.middleware.AuthenticationMiddleware",
              "django.contrib.messages.middleware.MessageMiddleware"]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [BASE_DIR / "templates"],
              "APP_DIRS": True, "OPTIONS": {"context_processors": [
                  "django.template.context_processors.request", "django.contrib.auth.context_processors.auth",
                  "django.contrib.messages.context_processors.messages"]}}]
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
'''


def django_suite():
    d = Path(tempfile.mkdtemp())
    (d / "config").mkdir()
    (d / "blog").mkdir()
    (d / "templates" / "blog").mkdir(parents=True)
    d1, d4, r2, a1 = (split_files(sol(*k)) for k in (("django", 0), ("django", 3), ("drf", 1), ("archi", 0)))
    files = {
        "config/__init__.py": "",
        "config/settings.py": SETTINGS,
        "config/urls.py": d1["config/urls.py"] + '\nurlpatterns += [path("api/v1/", include("blog.api_urls"))]\n',
        "blog/__init__.py": "",
        "blog/models.py": sol("django", 1),
        "blog/orm_sol.py": sol("django", 2),
        "blog/urls.py": d1["blog/urls.py"] + '\nurlpatterns += [path("<int:pk>/publier/", views.publier, name="publier")]\n',
        "blog/views.py": "\n".join([
            d4["blog/views.py"],
            "from django.http import HttpResponse\n\ndef liste(request):\n    return HttpResponse('liste')\n",
            sol("drf", 2),
            a1["blog/views.py"],
        ]),
        "blog/views_r2.py": r2["blog/views.py"],
        "blog/api_urls.py": r2["blog/urls.py"],
        "blog/serializers.py": sol("drf", 0),
        "blog/services.py": a1["blog/services.py"],
        "blog/notifications.py": "envoyes = []\n\n\ndef envoyer_notification(article):\n    envoyes.append(article.pk)\n",
        "templates/blog/detail.html": d4["templates/blog/detail.html"],
        "test_solutions.py": DJANGO_TESTS,
        "test_t2.py": sol("tests", 1),
    }
    for rel, content in files.items():
        (d / rel).write_text(textwrap.dedent(content), encoding="utf-8")
    env = dict(os.environ, PYTHONPATH=str(d), DJANGO_SETTINGS_MODULE="config.settings")
    r = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", "test_solutions.py", "test_t2.py"],
                       cwd=d, capture_output=True, text=True, env=env)
    print(r.stdout[-2500:])
    if r.returncode != 0:
        print(r.stderr[-1500:])
    assert r.returncode == 0, "voir la sortie pytest ci-dessus"


for name, fn in [("Python 1 · format_prix", p1), ("Python 2 · compte_mots", p2), ("Python 3 · moyenne", p3),
                 ("Python 4 · dataclass panier", p4), ("Python 5 · charger_config", p5),
                 ("Python 6 · décorateur", p6), ("Tests 1 · pytest moyenne", t1), ("HTTP 1 · requests", h1),
                 ("PostgreSQL 1 · 5 derniers", s1), ("PostgreSQL 2 · LEFT JOIN + COUNT", s2),
                 ("PostgreSQL 3 · transaction + index", s3), ("Git 1 · branche + push", g1),
                 ("Django 1-4 · DRF 1-3 · Tests 2 · Archi 1", django_suite)]:
    check(name, fn)

print("\n=== Bilan des solutions de référence ===")
for name, status, detail in results:
    print(f"{status:6} {name}" + (f"\n       {detail}" if detail else ""))
print(f"\n{sum(s == 'OK' for _, s, _ in results)}/{len(results)} groupes OK (HTTP 2 « endpoints » : texte, non exécutable)")
sys.exit(0 if all(s == "OK" for _, s, _ in results) else 1)
