// Construit les deux versions de Dérouille à partir des mêmes sources :
//   build/derouille-artifact.html  → la page publiée sur claude.ai (synchro + correction par Claude)
//   docs/                          → le site installable (PWA) servi par GitHub Pages
// Usage : node build.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const config = JSON.parse(read("derouille.config.json"));

const data = ["src/quiz.js", "src/exercises.js"].map(f => {
  const s = read(f);
  if (/<\/script/i.test(s)) throw new Error(f + " contient </script, ce qui casserait la page");
  return s;
}).join("\n");
const app = read("src/app.html");
const [head, body] = app.split("<!--@BODY@-->");
if (body === undefined) throw new Error("marqueur <!--@BODY@--> absent de src/app.html");
for (const marker of ["/*@CONFIG@*/", "/*@DATA@*/"]) if (!body.includes(marker)) throw new Error(marker + " absent de src/app.html");

const hash = crypto.createHash("sha256")
  .update([app, data, read("src/sw.js"), read("src/standalone.html"), read("src/manifest.webmanifest")].join("\0"))
  .digest("hex").slice(0, 7);
const now = new Date();
const version = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}-${hash}`;
const inject = (html, target) => html
  .replace("/*@CONFIG@*/", () => `const BUILD = ${JSON.stringify({target, version, siteUrl: config.siteUrl || ""})};`)
  .replace("/*@DATA@*/", () => data);

// 1. Page de l'artifact (le squelette <html>/<head> est ajouté par claude.ai à la publication).
fs.mkdirSync(path.join(ROOT, "build"), {recursive: true});
const artifact = inject(head + body, "artifact");
fs.writeFileSync(path.join(ROOT, "build/derouille-artifact.html"), artifact);

// 2. Site installable : polices et icônes locales, aucune ressource externe.
const DOCS = path.join(ROOT, "docs");
fs.rmSync(DOCS, {recursive: true, force: true});
fs.mkdirSync(DOCS, {recursive: true});
const siteHead = head
  .replace(/<title>[\s\S]*?<\/title>\s*/, "")
  .replace(/<!--@FONTS-->[\s\S]*?<!--@\/FONTS-->\s*/, "");
const page = read("src/standalone.html")
  .replace("<!--@HEAD@-->", () => siteHead.trim())
  .replace("<!--@APP@-->", () => inject(body, "site").trim());
if (/fonts\.googleapis|fonts\.gstatic/.test(page)) throw new Error("le site référence encore Google Fonts");
fs.writeFileSync(path.join(DOCS, "index.html"), page);
fs.copyFileSync(path.join(ROOT, "src/manifest.webmanifest"), path.join(DOCS, "manifest.webmanifest"));
const copied = [];
for (const dir of ["icons", "fonts"]) {
  fs.mkdirSync(path.join(DOCS, dir), {recursive: true});
  for (const f of fs.readdirSync(path.join(ROOT, "assets", dir))) {
    fs.copyFileSync(path.join(ROOT, "assets", dir, f), path.join(DOCS, dir, f));
    if (!f.endsWith(".txt")) copied.push(dir + "/" + f);
  }
}
const assets = ["./", "index.html", "manifest.webmanifest", ...copied.sort()];
fs.writeFileSync(path.join(DOCS, "sw.js"), read("src/sw.js")
  .replace("__VERSION__", version)
  .replace("__ASSETS__", JSON.stringify(assets)));
fs.writeFileSync(path.join(DOCS, ".nojekyll"), "");

console.log(`version ${version}`);
console.log(`artifact : build/derouille-artifact.html (${(artifact.length / 1024).toFixed(0)} Ko)`);
console.log(`site     : docs/ (${assets.length} fichiers mis en cache hors ligne, index ${(page.length / 1024).toFixed(0)} Ko)`);
