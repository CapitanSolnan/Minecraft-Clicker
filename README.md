# ⛏️ Minecraft Clicker

Juego *clicker* (idle) con temática de Minecraft, hecho con **HTML, CSS y JavaScript puro** (sin frameworks ni *bundlers*). Consigue esmeraldas picando, compra mejoras que desbloquean otras mejoras y deja que tu mina trabaje sola, incluso cuando no estás.

Tu progreso se guarda en la nube con **Firebase**, así que puedes seguir jugando desde cualquier dispositivo.

---

## ✨ Características

- 🖱️ **Click y producción pasiva**: cada mejora aumenta las esmeraldas por click y/o por segundo.
- 🌳 **Árbol de desbloqueos**: con 10, 32 y 64 unidades de una mejora se desbloquean nuevas mejoras (Tronco → Piedra → Carbón → Cobre → Hierro → Lapislázuli → Redstone → Esmeralda → Diamante → Obsidiana → Nether…).
- 💰 **Comprar y vender**: el coste crece un 15 % por unidad; al vender recuperas la mitad del precio de la última compra.
- 🌙 **Progreso offline**: ganas esmeraldas mientras estás fuera (hasta 8 horas).
- ☁️ **Guardado en la nube** (Firestore) con autoguardado cada 60 s, botón manual y guardado al cerrar o ocultar la pestaña.
- 💾 **Respaldo local** en `localStorage` por si falla la conexión.
- 🔒 **Control de conflictos**: si abres la partida en dos pestañas o dispositivos, se detecta y se bloquea el guardado para evitar pisar el progreso.
- 🔐 **Autenticación**: correo y contraseña, Google y recuperación de contraseña.
- 🌍 **Multidioma**: Español, Català y English (se recuerda la elección).
- ♿ **Accesibilidad**: `aria-live`, `aria-label`, foco visible y respeto a `prefers-reduced-motion`.
- 📱 **Responsive**: se adapta a móvil y escritorio.
- 🔢 **Números grandes**: formato con sufijos (k, M, B, T, Qa, Qi…).

---

## 🧱 Tecnologías

| Área | Tecnología |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Backend | [Firebase](https://firebase.google.com/) 10.8.0 (Authentication + Cloud Firestore + Analytics) |
| Tipografía | Fuente *Minecraft* (`.woff`) |

Los módulos de Firebase se cargan directamente desde el CDN de `gstatic.com`, por lo que **no hace falta `npm install`**.

---

## 📁 Estructura del proyecto

```
.
├── index.html          # Pantalla de login / registro
├── game.html           # Pantalla del juego
├── css/
│   ├── common.css      # Estilos compartidos (fuente, fondo, selector de idioma)
│   ├── index.css       # Estilos del login
│   └── game.css        # Estilos del juego
├── js/
│   ├── firebase.js     # Inicialización de Firebase (app, auth, db)
│   ├── index.js        # Lógica del login (email, Google, reset)
│   ├── game.js         # Lógica del juego, UI y guardado
│   ├── logic.js        # Mejoras, costes, desbloqueos y formateo de números
│   └── i18n.js         # Traducciones (es / ca / en) y cambio de idioma
└── content/
    ├── Minecraft.woff
    └── img/
        ├── minecraft_title.png
        ├── Video_background.mp4
        └── minecraft_icons/   # Iconos de cada mejora (p. ej. Tronco.png, Cesped.png…)
```

---

## 🚀 Puesta en marcha

### 1. Clona el repositorio

```bash
git clone https://github.com/<tu-usuario>/<tu-repositorio>.git
cd <tu-repositorio>
```

### 2. Configura Firebase

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com/).
2. Activa **Authentication** y habilita los proveedores **Correo/contraseña** y **Google**.
3. Crea una base de datos **Cloud Firestore**.
4. Añade una app web y copia su configuración en `js/firebase.js`:

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

5. En **Authentication → Settings → Authorized domains**, añade el dominio donde publiques el juego (y `localhost` para desarrollo).

### 3. Reglas de seguridad de Firestore

Cada jugador solo debe poder leer y escribir su propia partida (`saves/{uid}`):

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

> ℹ️ Las claves de configuración web de Firebase no son secretas, pero **las reglas de Firestore sí son imprescindibles** para proteger los datos.

### 4. Ejecuta el proyecto en local

Al usar ES Modules, el juego **no funciona abriendo el HTML con `file://`**. Sirve la carpeta con cualquier servidor estático:

```bash
# Python
python -m http.server 8000

# o con Node
npx serve .
```

Abre <http://localhost:8000>.

---

## 🎮 Cómo se juega

1. Inicia sesión o regístrate.
2. Pulsa el bloque de césped para ganar esmeraldas.
3. Compra mejoras en el inventario para aumentar tus ganancias por click y por segundo.
4. Consigue 10, 32 y 64 unidades de una mejora para desbloquear nuevas.
5. Guarda tu partida con **Guardar Progreso** o deja que el autoguardado haga su trabajo.

### Fórmulas

| Concepto | Fórmula |
| --- | --- |
| Coste de la unidad *n* | `floor(costeBase × 1.15ⁿ)` |
| Valor de venta | `floor(coste de la última unidad / 2)` |
| Cantidad máxima por mejora | `1000` |
| Esmeraldas por click | `1 + Σ (cantidad × clickBonus)` |
| Esmeraldas por segundo | `Σ (cantidad × pasivo)` |

---

## 💾 Sistema de guardado

- **Firestore** (`saves/{uid}`): guarda contador, tiempo, estado de cada mejora, `lastSeen` y un número de `version`.
- **Transacciones con versión**: antes de guardar se comprueba que la versión remota coincida con la local. Si no, se bloquea el guardado y se pide recargar la página.
- **Autoguardado** cada 60 s y al ocultar/cerrar la pestaña.
- **Respaldo local** cada 10 s en `localStorage`; al cargar se usa el más reciente (local o remoto).
- **Reintentos** automáticos si falla la carga inicial.

---

## 🌍 Añadir un idioma

1. Abre `js/i18n.js` y copia un bloque de idioma dentro de `translations` (por ejemplo `en`) con el nuevo código.
2. Traduce todas las claves, incluido el objeto `items`.
3. Añade un botón en el `.lang-switch` de `index.html` y `game.html`:

```html
<button type="button" data-lang="fr" lang="fr" aria-label="Français" aria-pressed="false">FR</button>
```

## 🧩 Añadir una mejora

1. Añade un objeto a `MEJORAS` en `js/logic.js`:

```js
{ id: 'mi_mejora', costeBase: 1_000, clickBonus: 10, pasivo: 5 }
```

2. Enlázala desde otra mejora con `desbloquea1`, `desbloquea2` o `desbloquea3`.
3. Añade su icono en `content/img/minecraft_icons/` con el `id` capitalizado (`Mi_mejora.png`). Si no existe, se usa `No-texture.png`.
4. Añade su nombre en `items` para cada idioma en `js/i18n.js`.

---

## 🤝 Contribuir

Las *issues* y los *pull requests* son bienvenidos. Si vas a proponer un cambio grande, abre antes una *issue* para comentarlo.

## 📄 Licencia

El **código fuente** de este proyecto se distribuye bajo la licencia [MIT](https://choosealicense.com/licenses/mit/).

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

La licencia MIT cubre **únicamente el código**. No incluye ni concede derechos sobre la marca, los nombres, las texturas, los iconos, la tipografía ni ningún otro recurso de Minecraft, que pertenecen a sus respectivos propietarios.

## ⚠️ Aviso legal

> **NOT AN OFFICIAL MINECRAFT GAME. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**
>
> *Minecraft* es una marca registrada de Mojang Studios / Microsoft. Este es un proyecto de fans, gratuito y sin ánimo de lucro, y no está afiliado, respaldado ni aprobado por ellos.