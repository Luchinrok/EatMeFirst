# Migració de Festuc a l'arrel de `luchinrok.github.io`

> Objectiu: passar l'app de `https://luchinrok.github.io/Buyte/` (repo de projecte)
> a `https://luchinrok.github.io/` (repo d'usuari/Pages), perquè un TWA la pugui
> empaquetar per a Google Play amb un `assetlinks.json` a l'arrel de l'origen.

## Per què l'arrel i no un domini propi

- **Play = 25 $ un sol cop.** Un domini propi seria despesa recurrent.
- **Un sol `assetlinks.json` a l'arrel autoritza diverses apps** (n'és una llista):
  Festuc, Xala! i futurs projectes poden anar a Play des de subcarpetes del mateix
  `luchinrok.github.io`, cadascun amb el seu `manifest.json` i `start_url`/`scope`.

## ⚠️ Nota per al futur-tu: NO posis domini propi si vols conservar les dades

`localStorage` es particiona per **origen** (esquema + host + port), **no per path**.
Com que el host **no canvia** (`luchinrok.github.io` abans i després, només canvia
`/Buyte/` → `/`), **totes les dades es conserven soles**: rebost, llistes, populars,
categories, historial, insígnies, despeses i configuració. No cal migrar res.

En canvi, moure's a un **domini propi** (p. ex. `festuc.app`) SÍ que és un origen nou
→ `localStorage` **buit** → l'usuari perdria tot el que no estigui sincronitzat al
núvol. Si algun dia t'ho planteges, primer resol la migració de dades (export/import
o resolució per codi de sync) abans de canviar de host.

---

## Passos

### 0. Xarxa de seguretat (opcional però recomanat)
Des de `/Buyte/` viu: **Configuració → Dades → Exporta** i guarda el JSON.
No caldrà (mateix origen), però protegeix davant d'una neteja de caché accidental.
`exportData()` desa **totes** les claus `eatmefirst_*` (loop `startsWith`, sense
llista fixa) → cobertura completa, res s'oblida.

### 1. Crear el repo `Luchinrok/luchinrok.github.io`
El nom ha de ser EXACTAMENT `luchinrok.github.io` (tot en minúscules) perquè
GitHub el serveixi a l'arrel de l'usuari. Crea'l **buit** (sense README ni
.gitignore, per no barrejar commits) a github.com.

### 2. Portar-hi el contingut **conservant la història** (vegeu secció següent)
El contingut ja està a l'arrel del repo `Buyte` (l'`index.html` hi és a dalt;
el `/Buyte/` de la URL ve de ser repo de projecte, no d'una subcarpeta) → **no
cal reestructurar res**, només empènyer-ho al repo nou.

```bash
# des de la còpia de treball actual del repo Buyte
git remote add pages https://github.com/Luchinrok/luchinrok.github.io.git
git push pages main
```

### 3. Activar GitHub Pages al repo nou
Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/ (root)`.
Espera un minut i comprova `https://luchinrok.github.io/`.

### 4. Posar-hi el `assetlinks.json` a l'arrel
Ja hi va inclòs a `.well-known/assetlinks.json` (viatja amb el push). Servit des
del repo d'usuari queda a `https://luchinrok.github.io/.well-known/assetlinks.json`
= ubicació correcta. **Encara és plantilla**: el `package_name` i el
`sha256_cert_fingerprints` reals venen al pas 7.

### 5. Comprovar a l'arrel (abans de tocar `/Buyte/`)
- [ ] L'app carrega a `https://luchinrok.github.io/`.
- [ ] **Les dades hi són ja** (mateix origen): rebost, llistes, config, idioma.
- [ ] La **sincronització** funciona: obre-la amb un codi existent i verifica que
      llegeix/escriu el mateix document (Firestore va per codi, no per URL).
- [ ] El `manifest.json` es descarrega i l'app és **instal·lable** (Chrome →
      "Instal·la l'app"); icones i `theme_color` correctes.
- [ ] `https://luchinrok.github.io/.well-known/assetlinks.json` retorna el fitxer.

### 6. Tall suau a `/Buyte/`
Al repo `Buyte`, substitueix l'`index.html` de l'app pel de redirecció:
`docs/buyte-redirect.html` → passa a ser `index.html` de `/Buyte/`
(conserva `?query`/`#hash`, té text visible i enllaç manual per si el JS falla).
Sense pressa: pre-llançament, pocs o cap usuari amb la PWA instal·lada.

### 7. TWA + Play (quan toqui)
- Genera el TWA amb **Bubblewrap** o **PWABuilder** apuntant a
  `https://luchinrok.github.io/`.
- Obtens el **SHA-256** del certificat de signatura (Play App Signing →
  Configuració → Integritat de l'app; o `keytool -list -v` sobre el keystore).
- Escriu `package_name` + fingerprint reals a `.well-known/assetlinks.json`,
  **treu els camps `_AVIS_*`/`_TODO_*`**, i fes push al repo d'usuari.
- Verifica Digital Asset Links i puja l'AAB a Play.

---

## Còpia de contingut vs conservar la història de git

**Recomanació: conservar la història** (pas 2 amb `git push`, no una còpia de
fitxers). És la traça sencera del projecte (rebranding Buyte→Festuc, motor i18n,
receptes, catàleg…) i no costa res mantenir-la. Com que el contingut ja viu a
l'arrel del repo, no cal reescriure rutes ni aplanar res.

Dues maneres de fer-ho, segons si vols mantenir `/Buyte/` com a redirecció:

- **Opció A — dos repos (recomanada si vols la redirecció).**
  Mantens `Buyte` (convertit en pàgina de redirecció, pas 6) i crees
  `luchinrok.github.io` a part. La història es porta amb `git push pages main`
  (branca) o, per emportar-te **totes** les branques i tags:
  ```bash
  git clone --mirror https://github.com/Luchinrok/Buyte.git
  cd Buyte.git
  git push --mirror https://github.com/Luchinrok/luchinrok.github.io.git
  ```

- **Opció B — reanomenar `Buyte` → `luchinrok.github.io` (un sol repo).**
  Settings → General → Rename. Conserva història, issues i estrelles, i GitHub
  redirigeix els enllaços de **github.com**. Però la URL de Pages `/Buyte/`
  **deixa d'existir** (404) → NO pots tenir-hi la pàgina de redirecció. Només
  té sentit si decideixes descartar el pas 6.

Com que has demanat la redirecció a `/Buyte/`, l'**opció A** és la que encaixa.
```

*Estat d'aquest fitxer: guia de referència. No afecta el codi de l'app.*
