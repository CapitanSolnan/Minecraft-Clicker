🌍 **English** · [Español](README.es.md) · [Català](README.ca.md)

# ⛏️ Minecraft Clicker

🎮 **Play now:** [minecraft-clicker-game.web.app](https://minecraft-clicker-game.web.app/)

A Minecraft-themed *clicker* (idle) game built with **plain HTML, CSS and JavaScript** (no frameworks or bundlers). Earn emeralds by mining, buy upgrades that unlock more upgrades, and let your mine work on its own, even when you're away.

Your progress is saved in the cloud with **Firebase**, so you can keep playing from any device.

---

## ✨ Features

- 🖱️ **Click and passive income**: every upgrade increases emeralds per click and/or per second.
- 🌳 **Unlock tree**: with 10, 32 and 64 units of an upgrade you unlock new ones (Log → Stone → Coal → Copper → Iron → Lapis Lazuli → Redstone → Emerald → Diamond → Obsidian → Nether…).
- 💰 **Buy and sell**: the cost grows 15% per unit; selling gives back half the price of the last purchase.
- 🌙 **Offline progress**: earn emeralds while you're away (up to 8 hours).
- ☁️ **Cloud saving** (Firestore) with autosave every 60 s, a manual button, and saving when the tab is closed or hidden.
- 💾 **Local backup** in `localStorage` in case the connection fails.
- 🔒 **Conflict control**: if you open the game in two tabs or devices, it is detected and saving is blocked to avoid overwriting progress.
- 🔐 **Authentication**: email and password, Google, and password recovery.
- 🌍 **Multilingual**: Español, Català and English (your choice is remembered).
- ♿ **Accessibility**: `aria-live`, `aria-label`, visible focus and `prefers-reduced-motion` support.
- 📱 **Responsive**: adapts to mobile and desktop.
- 🔢 **Big numbers**: formatted with suffixes (k, M, B, T, Qa, Qi…).

---

## 🧱 Technologies

| Area | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Backend | [Firebase](https://firebase.google.com/) 10.8.0 (Authentication + Cloud Firestore + Analytics) |
| Typography | *Minecraft* font (`.woff`) |

Firebase modules are loaded directly from the `gstatic.com` CDN, so **no `npm install` is needed**.

---

## 📁 Project structure

```
.
├── index.html          # Login / sign-up screen
├── game.html           # Game screen
├── 404.html            # "Block not found" page
├── css/
│   ├── common.css      # Shared styles (font, background, language switch)
│   ├── index.css       # Login styles
│   └── game.css        # Game styles
├── js/
│   ├── firebase.js     # Firebase initialization (app, auth, db)
│   ├── index.js        # Login logic (email, Google, reset)
│   ├── game.js         # Game logic, UI and saving
│   ├── logic.js        # Upgrades, costs, unlocks and number formatting
│   └── i18n.js         # Translations (es / ca / en) and language switching
└── content/
    ├── Minecraft.woff
    └── img/
        ├── minecraft_title.png
        ├── Video_background.mp4
        └── minecraft_icons/   # Icons for each upgrade (e.g. Tronco.png, Cesped.png…)
```

---

## 🚀 Getting started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd <your-repository>
```

### 2. Set up Firebase

1. Create a project in the [Firebase console](https://console.firebase.google.com/).
2. Enable **Authentication** and turn on the **Email/Password** and **Google** providers.
3. Create a **Cloud Firestore** database.
4. Add a web app and copy its configuration into `js/firebase.js`:

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

5. In **Authentication → Settings → Authorized domains**, add the domain where you publish the game (and `localhost` for development).

### 3. Firestore security rules

Each player must only be able to read and write their own save (`saves/{uid}`):

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

> ℹ️ Firebase web config keys are not secret, but **Firestore rules are essential** to protect the data.

### 4. Run it locally

Because it uses ES Modules, the game **does not work by opening the HTML with `file://`**. Serve the folder with any static server:

```bash
# Python
python -m http.server 8000

# or with Node
npx serve .
```

Open <http://localhost:8000>.

---

## 🎮 How to play

1. Log in or sign up.
2. Click the grass block to earn emeralds.
3. Buy upgrades in the inventory to increase your earnings per click and per second.
4. Reach 10, 32 and 64 units of an upgrade to unlock new ones.
5. Save your game with **Save Progress**, or let autosave do the work.

### Formulas

| Concept | Formula |
| --- | --- |
| Cost of unit *n* | `floor(baseCost × 1.15ⁿ)` |
| Sell value | `floor(cost of the last unit / 2)` |
| Max amount per upgrade | `1000` |
| Emeralds per click | `1 + Σ (amount × clickBonus)` |
| Emeralds per second | `Σ (amount × passive)` |

---

## 💾 Save system

- **Firestore** (`saves/{uid}`): stores the counter, time, each upgrade's state, `lastSeen` and a `version` number.
- **Versioned transactions**: before saving, the remote version is checked against the local one. If they differ, saving is blocked and the player is asked to reload the page.
- **Autosave** every 60 s and when the tab is hidden or closed.
- **Local backup** every 10 s in `localStorage`; on load, the most recent one (local or remote) is used.
- **Automatic retries** if the initial load fails.

---

## 🌍 Adding a language

1. Open `js/i18n.js` and copy a language block inside `translations` (for example `en`) using the new code.
2. Translate every key, including the `items` object.
3. Add a button to the `.lang-switch` in `index.html` and `game.html`:

```html
<button type="button" data-lang="fr" lang="fr" aria-label="Français" aria-pressed="false">FR</button>
```

## 🧩 Adding an upgrade

1. Add an object to `MEJORAS` in `js/logic.js`:

```js
{ id: 'my_upgrade', costeBase: 1_000, clickBonus: 10, pasivo: 5 }
```

2. Link it from another upgrade with `desbloquea1`, `desbloquea2` or `desbloquea3`.
3. Add its icon to `content/img/minecraft_icons/` using the capitalized `id` (`My_upgrade.png`). If it doesn't exist, `No-texture.png` is used.
4. Add its name to `items` for each language in `js/i18n.js`.

---

## 🤝 Contributing

Issues and pull requests are welcome. If you plan a big change, please open an issue first to discuss it.

## 📄 License

The **source code** of this project is released under the [MIT](https://choosealicense.com/licenses/mit/) license. See the [`LICENSE`](LICENSE) file.

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

The MIT license covers **only the code**. It does not include or grant any rights over the Minecraft brand, names, textures, icons, typography or any other Minecraft asset, which belong to their respective owners.

## ⚠️ Legal notice

> **NOT AN OFFICIAL MINECRAFT GAME. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**
>
<<<<<<< HEAD
> *Minecraft* is a registered trademark of Mojang Studios / Microsoft. This is a free, non-profit fan project and is not affiliated with, endorsed or approved by them.
=======
> *Minecraft* es una marca registrada de Mojang Studios / Microsoft. Este es un proyecto de fans, gratuito y sin ánimo de lucro, y no está afiliado, respaldado ni aprobado por ellos.
>>>>>>> 6a97ccac2ddfd05a8dab5a835f3dcd55079db3d0
