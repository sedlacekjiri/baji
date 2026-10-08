# Báji ♥

Jednoduchý, plně responzivní web v češtině pro Báru. Je to čisté HTML/CSS/JS
bez frameworků a bez buildu — dá se nasadit prakticky kamkoliv jako statický web.

## Aktuální stav (v3 — minimalistická, fotka + věta)

Hlavní stránka je teď minimalistická: světlé pozadí, černé písmo, brána
s otázkou na vydru (zůstává) a po odemčení jen černobílá fotka
(`assets/img/my.jpg`) a jedna věta pod ní. Větu změníš v `index.html`
v sekci `<section class="words">`. Na mobilu se fotka ořízne na
výšku tak, aby byl vidět hlavně pár.

## Vlastní analytika (baji.cz/stats)

Malý vlastní nástroj místo Plausible: Netlify Functions + Netlify Blobs
(úložiště přímo v Netlify, nic dalšího se nezakládá ani neplatí).

- `js/t.js` — měřicí skript na všech stránkách (hlavní i archiv). Posílá:
  stránku, odkud člověk přišel, jazyk, velikost displeje a **dobu, kdy byla
  stránka opravdu vidět** (každých 15 s + při zavření). Zaznamená i to, jestli
  zadal/a správné heslo.
- `netlify/functions/hit.mjs` — přijímá data, doplní město/zemi (z Netlify,
  podle IP — samotná IP se **neukládá**) a zařízení/prohlížeč (včetně
  Instagramu/Messengeru, když se odkaz otevře v aplikaci).
- `netlify/functions/stats.mjs` + `stats/index.html` — přehled na
  **baji.cz/stats/**, chráněný heslem.

**Jednorázové nastavení:** na Netlify → Site configuration → Environment
variables přidej proměnnou `STATS_KEY` (libovolné heslo ke statistikám) a
spusť nový deploy. Pak otevři baji.cz/stats/ a zadej to heslo.

Prohlížeč, ze kterého se přihlásíš do statistik, se automaticky přestane
měřit (aby tvoje vlastní návštěvy nekazily čísla) — přepíná se tlačítkem
„Neměřit tento prohlížeč“. Kdo je kdo se z principu nepozná jménem — každý
prohlížeč dostane náhodné označení („návštěvník B8O7“), takže je vidět, když
se stejný člověk vrací.

Plausible je zatím na hlavní stránce pořád zapojené vedle toho; až budeš
spokojený, stačí smazat jeho dva `<script>` v `index.html`.

## Archiv — původní web (v1)

Původní web (příběh, galerie, dopis, Hot Pick ze Spotify, video) je uložený
ve složce `archive/v1-puvodni/` a běží na adrese `/archive/v1-puvodni/`
(taky za heslem „vydra“). Fotky a videa sdílí se složkou `assets/`.

## Archiv — video se vzkazem (v2)

Jednoduchá verze s videem `assets/video/hero2.mp4` (na mobilu
`hero2-mobile.mp4`) na pozadí a textem „Zase ses zastavila na našem webu? /
Možná ti trochu chybím, možná mě trochu miluješ. / Tak mi zavolej.“ je uložená
ve složce `archive/v2-video-vzkaz/` a na webu běží dál na adrese
`/archive/v2-video-vzkaz/`. Fotky a video sdílí se složkou `assets/`.

Vrácení v2: obsah `archive/v2-video-vzkaz/` přesunout zpět do kořene (cesty
`../../assets/` změnit na `assets/`, v CSS `../../../assets/` na
`../assets/`) — nebo napsat Claudovi „vrať web na verzi v2 z archivu“.

## Struktura (v1)

```
index.html          hlavní (a jediná) stránka
css/style.css        styly
js/script.js          logika hesla, navigace, animace
assets/img/          fotky (couple.jpg, story.jpg)
assets/video/        hero.mp4
netlify.toml          konfigurace pro Netlify
```

## Jak to funguje

1. Po načtení se zobrazí **brána s heslem** — otázka na "vydru". Odpověď se
   porovnává bez ohledu na velikost písmen, mezery a interpunkci (`Vydra!`,
   `V Y D R A`, `vydra🦦` — všechno projde). Logika je v `js/script.js`,
   konstanta `CORRECT_ANSWER`.
2. Po správné odpovědi se brána schová a načte se hlavní jednostránkový web
   (hero video → příběh → galerie → dopis → patička).
3. Odemčení se pamatuje jen na dobu session (zavření okna prohlížeče heslo
   vrátí zpět) — je to hravá pojistka, ne skutečné zabezpečení. Kdokoliv se
   umí podívat do zdrojového kódu, odpověď uvidí.

## Co si doplnit

- **Fotka na bráně / v příběhu**: nahraj soubory `assets/img/couple.jpg`
  a `assets/img/story.jpg`. Dokud tam nejsou, zobrazí se místo nich hezký
  barevný přechod, takže web nevypadá rozbitě.
- **Text**: v `index.html` uprav odstavce v sekcích `#pribeh` a `#dopis` —
  jsou tam jen ukázkové věty.
- **Galerie**: aktuálně je to 6 barevných dlaždic. Nejjednodušší úprava je
  nahradit `<figure class="gallery__item">` za `<figure class="gallery__item">
  <img src="assets/img/galerie-1.jpg" alt="…"></figure>` a přidat pravidlo
  `.gallery__item img { width:100%; height:100%; object-fit:cover; }` do CSS.

## Video — kam ho dát?

Máš v zásadě dvě rozumné cesty:

**A) Nahrát video přímo do repozitáře (nejjednodušší)**
Stačí zkomprimovaný `.mp4` uložit jako `assets/video/hero.mp4` a nasadit
na Netlify spolu se zbytkem webu — nic dalšího řešit nemusíš, `<video>` tag
už je připravený. Funguje to bez problémů, pokud je soubor rozumně velký
(ideálně do cca 15–20 MB, aby se rychle načetl i na mobilu). Zkomprimovat
video zdarma jde třeba přes HandBrake (desktop) nebo online nástroj typu
Cloudconvert — cíl: H.264 mp4, šířka cca 1280–1920 px, bitrate tak akorát,
aby to nebylo rozmazané, ale ani zbytečně těžké.

**B) Hostovat video jinde a jen ho vložit (lepší pro delší/kvalitnější video)**
Pokud je video velké (desítky až stovky MB), lepší je nedávat ho do gitu a
místo toho ho nahrát na:
- **YouTube jako neveřejné/nezapsané (unlisted)** — zdarma, neomezená
  velikost, ale objeví se přehrávač s YouTube brandingem/ovládáním.
- **Cloudinary / Bunny Stream / Backblaze B2** — mají štědré free tiery a
  dají přímý odkaz na `.mp4`, který jde použít stejně jako lokální soubor.

Pokud zvolíš variantu B, dej mi vědět a upravím `<source>` v `index.html`
tak, aby ukazoval na externí URL (případně přepnu hero na `<iframe>` s
YouTube embedem, pokud půjde cesta přes YouTube).

## Nasazení na Netlify

1. Repozitář propoj s Netlify (New site from Git).
2. Build command nech prázdný, Publish directory nastav na `.` (kořen) —
   `netlify.toml` už to má předvyplněné, takže stačí "Deploy site".
3. Po nasazení nahraj fotky/video přímo do repozitáře (git push) — Netlify
   automaticky znovu nasadí.

Žádný build krok, žádné závislosti — čisté HTML/CSS/JS, přesně jak chceš.
