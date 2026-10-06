🌍 [English](README.md) · [Español](README.es.md) · **Català**

# ⛏️ Minecraft Clicker

🎮 **Juga ara:** [minecraft-clicker-game.web.app](https://minecraft-clicker-game.web.app/)

Joc *clicker* (idle) amb temàtica de Minecraft, fet amb **HTML, CSS i JavaScript pur** (sense frameworks ni *bundlers*). Aconsegueix maragdes picant, compra millores que n'afegeixen d'altres i deixa que la teva mina treballi sola, fins i tot quan no hi ets.

El teu progrés es desa al núvol amb **Firebase**, així que pots continuar jugant des de qualsevol dispositiu.

---

## ✨ Característiques

- 🖱️ **Clic i producció passiva**: cada millora augmenta les maragdes per clic i/o per segon.
- 🌳 **Arbre de desbloquejos**: amb 10, 32 i 64 unitats d'una millora es desbloquegen noves millores (Tronc → Pedra → Carbó → Coure → Ferro → Lapislàtzuli → Redstone → Maragda → Diamant → Obsidiana → Nether…).
- 💰 **Comprar i vendre**: el cost creix un 15 % per unitat; en vendre recuperes la meitat del preu de l'última compra.
- 🌙 **Progrés offline**: guanyes maragdes mentre ets fora (fins a 8 hores).
- ☁️ **Desat al núvol** (Firestore) amb autodesat cada 60 s, botó manual i desat en tancar o amagar la pestanya.
- 💾 **Còpia local** a `localStorage` per si falla la connexió.
- 🔒 **Control de conflictes**: si obres la partida en dues pestanyes o dispositius, es detecta i es bloqueja el desat per no trepitjar el progrés.
- 🔐 **Autenticació**: correu i contrasenya, Google i recuperació de contrasenya.
- 🌍 **Multillengua**: Español, Català i English (es recorda l'elecció).
- ♿ **Accessibilitat**: `aria-live`, `aria-label`, focus visible i respecte a `prefers-reduced-motion`.
- 📱 **Responsive**: s'adapta a mòbil i escriptori.
- 🔢 **Nombres grans**: format amb sufixos (k, M, B, T, Qa, Qi…).

---

## 🧱 Tecnologies

| Àrea | Tecnologia |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Backend | [Firebase](https://firebase.google.com/) 10.8.0 (Authentication + Cloud Firestore + Analytics) |
| Tipografia | Font *Minecraft* (`.woff`) |

Els mòduls de Firebase es carreguen directament des del CDN de `gstatic.com`, per tant **no cal `npm install`**.

---

## 📁 Estructura del projecte

```
.
├── index.html          # Pantalla d'inici de sessió / registre
├── game.html           # Pantalla del joc
├── 404.html            # Pàgina "Bloc no trobat"
├── css/
│   ├── common.css      # Estils compartits (font, fons, selector d'idioma)
│   ├── index.css       # Estils de l'inici de sessió
│   └── game.css        # Estils del joc
├── js/
│   ├── firebase.js     # Inicialització de Firebase (app, auth, db)
│   ├── index.js        # Lògica de l'inici de sessió (correu, Google, reset)
│   ├── game.js         # Lògica del joc, UI i desat
│   ├── logic.js        # Millores, costos, desbloquejos i format de nombres
│   └── i18n.js         # Traduccions (es / ca / en) i canvi d'idioma
└── content/
    ├── Minecraft.woff
    └── img/
        ├── minecraft_title.png
        ├── Video_background.mp4
        └── minecraft_icons/   # Icones de cada millora (p. ex. Tronco.png, Cesped.png…)
```

---

## 🚀 Posada en marxa

### 1. Clona el repositori

```bash
git clone https://github.com/<el-teu-usuari>/<el-teu-repositori>.git
cd <el-teu-repositori>
```

### 2. Configura Firebase

1. Crea un projecte a la [consola de Firebase](https://console.firebase.google.com/).
2. Activa **Authentication** i habilita els proveïdors **Correu/contrasenya** i **Google**.
3. Crea una base de dades **Cloud Firestore**.
4. Afegeix una app web i copia'n la configuració a `js/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

5. A **Authentication → Settings → Authorized domains**, afegeix el domini on publiquis el joc (i `localhost` per al desenvolupament).

### 3. Regles de seguretat de Firestore

Cada jugador només ha de poder llegir i escriure la seva pròpia partida (`saves/{uid}`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /saves/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

> ℹ️ Les claus de configuració web de Firebase no són secretes, però **les regles de Firestore són imprescindibles** per protegir les dades.

### 4. Executa el projecte en local

Com que fa servir ES Modules, el joc **no funciona obrint l'HTML amb `file://`**. Serveix la carpeta amb qualsevol servidor estàtic:

```bash
# Python
python -m http.server 8000

# o amb Node
npx serve .
```

Obre <http://localhost:8000>.

---

## 🎮 Com es juga

1. Inicia sessió o registra't.
2. Prem el bloc de gespa per guanyar maragdes.
3. Compra millores a l'inventari per augmentar els guanys per clic i per segon.
4. Aconsegueix 10, 32 i 64 unitats d'una millora per desbloquejar-ne de noves.
5. Desa la partida amb **Desar progrés** o deixa que l'autodesat faci la feina.

### Fórmules

| Concepte | Fórmula |
| --- | --- |
| Cost de la unitat *n* | `floor(costBase × 1.15ⁿ)` |
| Valor de venda | `floor(cost de l'última unitat / 2)` |
| Quantitat màxima per millora | `1000` |
| Maragdes per clic | `1 + Σ (quantitat × clickBonus)` |
| Maragdes per segon | `Σ (quantitat × passiu)` |

---

## 💾 Sistema de desat

- **Firestore** (`saves/{uid}`): desa el comptador, el temps, l'estat de cada millora, `lastSeen` i un número de `version`.
- **Transaccions amb versió**: abans de desar es comprova que la versió remota coincideixi amb la local. Si no, es bloqueja el desat i es demana recarregar la pàgina.
- **Autodesat** cada 60 s i en amagar o tancar la pestanya.
- **Còpia local** cada 10 s a `localStorage`; en carregar s'utilitza la més recent (local o remota).
- **Reintents** automàtics si falla la càrrega inicial.

---

## 🌍 Afegir un idioma

1. Obre `js/i18n.js` i copia un bloc d'idioma dins de `translations` (per exemple `en`) amb el codi nou.
2. Tradueix totes les claus, inclòs l'objecte `items`.
3. Afegeix un botó al `.lang-switch` d'`index.html` i `game.html`:

```html
<button type="button" data-lang="fr" lang="fr" aria-label="Français" aria-pressed="false">FR</button>
```

## 🧩 Afegir una millora

1. Afegeix un objecte a `MEJORAS` a `js/logic.js`:

```js
{ id: 'la_meva_millora', costeBase: 1_000, clickBonus: 10, pasivo: 5 }
```

2. Enllaça-la des d'una altra millora amb `desbloquea1`, `desbloquea2` o `desbloquea3`.
3. Afegeix la seva icona a `content/img/minecraft_icons/` amb l'`id` en majúscula inicial (`La_meva_millora.png`). Si no existeix, s'usa `No-texture.png`.
4. Afegeix-ne el nom a `items` per a cada idioma a `js/i18n.js`.

---

## 🤝 Contribuir

Les *issues* i els *pull requests* són benvinguts. Si vas a proposar un canvi gran, obre abans una *issue* per comentar-lo.

## 📄 Llicència

El **codi font** d'aquest projecte es distribueix sota la llicència [MIT](https://choosealicense.com/licenses/mit/). Consulta el fitxer [`LICENSE`](LICENSE).

```
MIT License

Copyright (c) 2026 CapitanSolnan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

La llicència MIT cobreix **únicament el codi**. No inclou ni concedeix drets sobre la marca, els noms, les textures, les icones, la tipografia ni cap altre recurs de Minecraft, que pertanyen als seus respectius propietaris.

## ⚠️ Avís legal

> **NOT AN OFFICIAL MINECRAFT GAME. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**
>
> *Minecraft* és una marca registrada de Mojang Studios / Microsoft. Aquest és un projecte de fans, gratuït i sense ànim de lucre, i no està afiliat, avalat ni aprovat per ells.