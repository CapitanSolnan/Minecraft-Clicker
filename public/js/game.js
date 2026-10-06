import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { t, tItem, setLang, getLang } from "./i18n.js";

const firebaseConfig = {
  apiKey: "AIzaSyC3YYcsHk3ceduiWPOBm6oJZBp_ZiArYsg",
  authDomain: "minecraft-clicker-3cd9b.firebaseapp.com",
  projectId: "minecraft-clicker-3cd9b",
  storageBucket: "minecraft-clicker-3cd9b.firebasestorage.app",
  messagingSenderId: "308705407124",
  appId: "1:308705407124:web:6fb19ff52073f2db788481",
  measurementId: "G-VKGX649NEW"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Estado global
let contador = 0;
let timer = 0;

// ── Configuración de mejoras
const MEJORAS = [
    { id: 'tronco',    costeBase: 10,            costePaso: 10,            clickBonus: 1,   pasivoPorUnidad: 0,      escala: 1,   sufijo: ' $',  desbloquea: 'piedra',    oculto: false },
    { id: 'piedra',    costeBase: 100,           costePaso: 100,           clickBonus: 5,   pasivoPorUnidad: 0,      escala: 1,   sufijo: ' $',  desbloquea: 'carbon',    oculto: true },
    { id: 'carbon',    costeBase: 1_000,         costePaso: 500,           clickBonus: 5,   pasivoPorUnidad: 2,      escala: 1_000, sufijo: 'k $', desbloquea: 'hierro',    oculto: true },
    { id: 'hierro',    costeBase: 50_000,        costePaso: 25_000,        clickBonus: 10,  pasivoPorUnidad: 10,     escala: 1_000, sufijo: 'k $', desbloquea: 'lapiz',     oculto: true },
    { id: 'lapiz',     costeBase: 500_000,       costePaso: 250_000,       clickBonus: 10,  pasivoPorUnidad: 50,     escala: 1_000, sufijo: 'k $', desbloquea: 'redstone',  oculto: true },
    { id: 'redstone',  costeBase: 5_000_000,     costePaso: 2_500_000,     clickBonus: 50,  pasivoPorUnidad: 250,    escala: 1e6, sufijo: 'M $', desbloquea: 'oro',       oculto: true },
    { id: 'oro',       costeBase: 50_000_000,    costePaso: 25_000_000,    clickBonus: 50,  pasivoPorUnidad: 1_250,  escala: 1e6, sufijo: 'M $', desbloquea: 'diamante',  oculto: true },
    { id: 'diamante',  costeBase: 500_000_000,   costePaso: 250_000_000,   clickBonus: 250, pasivoPorUnidad: 6_250,  escala: 1e6, sufijo: 'M $', desbloquea: 'obsidiana', oculto: true },
    { id: 'obsidiana', costeBase: 5_000_000_000, costePaso: 2_500_000_000, clickBonus: 250, pasivoPorUnidad: 31_250, escala: 1e9, sufijo: 'B $', desbloquea: null,        oculto: true },
];

// ── Estado dinámico
const estado = {};
MEJORAS.forEach(m => {
    estado[m.id] = {
        cantidad:     0,
        coste:        m.costeBase,
        venta:        m.costeBase / 2,
        desbloqueada: !m.oculto,
    };
});

// ── Calcular totales
function calcularPasivo() {
    return MEJORAS.reduce((sum, m) =>
        sum + estado[m.id].cantidad * m.pasivoPorUnidad, 0);
}

function calcularBonusClick() {
    return MEJORAS.reduce((sum, m) =>
        sum + estado[m.id].cantidad * m.clickBonus, 0);
}

// ── Formato
function formatearPrecio(valor, escala, sufijo) {
    return (valor / escala).toFixed(2) + sufijo;
}

function formatearContador(n) {
    return Math.floor(n * 100) / 100 + ' ' + t('emeralds');
}

// ── Renderizado
function actualizarTimer() {
    document.getElementById('timer-value').textContent = timer;
}

function actualizarUI() {
    const pasivo     = calcularPasivo();
    const bonusClick = calcularBonusClick();

    document.getElementById('contador').textContent = formatearContador(contador);
    document.getElementById('xseg').textContent =
        pasivo + ' ' + t('perSec') + '  |  +' + (1 + bonusClick) + ' ' + t('perClick');
}

function actualizarMejoraUI(m) {
    const e = estado[m.id];
    document.getElementById('text-' + m.id).textContent =
        t('upgradeOf', { n: e.cantidad, name: tItem(m.id) });
    document.getElementById('Comprar-' + m.id).textContent =
        t('buyFor', { price: formatearPrecio(e.coste, m.escala, m.sufijo) });
    document.getElementById('Vender-' + m.id).textContent =
        t('sellFor', { price: formatearPrecio(e.venta, m.escala, m.sufijo) });
}

// Repinta TODO (se usa al cambiar de idioma)
function renderTodo() {
    actualizarUI();
    actualizarTimer();
    MEJORAS.forEach(actualizarMejoraUI);
}

function desbloquearMejora(id) {
    if (!id) return;
    const e = estado[id];
    if (e.desbloqueada) return;
    e.desbloqueada = true;
    document.querySelector('.mej-' + id).style.display = 'block';
}

// ── Compra / Venta
function comprar(m) {
    const e = estado[m.id];
    if (contador < e.coste) return;

    contador  -= e.coste;
    e.cantidad++;
    e.coste   += m.costePaso;
    e.venta    = e.coste / 2;

    actualizarMejoraUI(m);
    actualizarUI();

    if (e.cantidad >= 10) desbloquearMejora(m.desbloquea);
}

function vender(m) {
    const e = estado[m.id];
    if (e.cantidad < 1) return;

    contador  += e.venta;
    e.cantidad--;
    e.coste   -= m.costePaso;
    e.venta    = e.coste / 2;

    actualizarMejoraUI(m);
    actualizarUI();
}

// Registrar listeners
MEJORAS.forEach(m => {
    document.getElementById('Comprar-' + m.id).addEventListener('click', function() { comprar(m); });
    document.getElementById('Vender-'  + m.id).addEventListener('click', function() { vender(m); });
});

// ── Click manual
document.getElementById('click').addEventListener('click', function() {
    contador += 1 + calcularBonusClick();
    actualizarUI();
});

// ── Tick por segundo
setInterval(function() {
    timer++;
    contador += calcularPasivo();

    actualizarTimer();
    actualizarUI();

    MEJORAS.forEach(function(m) {
        if (estado[m.id].desbloqueada) actualizarMejoraUI(m);
    });
}, 1000);

// ══════════════════════════════════════════════
//  GUARDADO EN FIREBASE (Firestore)
// ══════════════════════════════════════════════
const AUTOSAVE_MS = 5 * 60 * 1000;
let uid = null;
let cargado = false;
let autosaveIniciado = false;
let statusTimeout;

// Recibe la CLAVE de traducción, no el texto
function mostrarEstado(key) {
    const el = document.getElementById('save-status');
    el.textContent = t(key);
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(function() { el.textContent = ''; }, 3000);
}

function crearSave() {
    const save = { contador: contador, timer: timer, estado: {} };
    MEJORAS.forEach(function(m) {
        const e = estado[m.id];
        save.estado[m.id] = {
            cantidad:     e.cantidad,
            coste:        e.coste,
            venta:        e.venta,
            desbloqueada: e.desbloqueada,
        };
    });
    return save;
}

function aplicarSave(save) {
    contador = Number(save.contador) || 0;
    timer    = Number(save.timer)    || 0;

    MEJORAS.forEach(function(m) {
        const s = save.estado && save.estado[m.id];
        const e = estado[m.id];
        if (s) {
            e.cantidad = s.cantidad;
            e.coste    = s.coste;
            e.venta    = s.venta;
            e.desbloqueada = !m.oculto;
            if (s.desbloqueada) {
                desbloquearMejora(m.id);
            } else if (m.oculto) {
                document.querySelector('.mej-' + m.id).style.display = 'none';
            }
        }
        actualizarMejoraUI(m);
    });

    actualizarTimer();
    actualizarUI();
}

async function guardarNube(auto) {
    if (!uid || !cargado) {
        mostrarEstado('loading');
        return;
    }
    try {
        await setDoc(doc(db, 'saves', uid), Object.assign(crearSave(), {
            updatedAt: serverTimestamp(),
        }));
        mostrarEstado(auto ? 'autosaved' : 'saved');
    } catch (err) {
        console.error('Error al guardar:', err);
        mostrarEstado('saveError');
    }
}

async function cargarNube() {
    try {
        const snap = await getDoc(doc(db, 'saves', uid));
        if (snap.exists()) {
            aplicarSave(snap.data());
            mostrarEstado('loaded');
            return true;
        }
        mostrarEstado('noSave');
    } catch (err) {
        console.error('Error al cargar:', err);
        mostrarEstado('loadError');
    }
    return false;
}

// Guardar manual
document.getElementById('guardar').addEventListener('click', function() {
    guardarNube(false);
});

// ── Idioma
document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang, renderTodo));
});
setLang(getLang(), renderTodo);

onAuthStateChanged(auth, async function(user) {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    uid = user.uid;
    await cargarNube();
    cargado = true;

    if (!autosaveIniciado) {
        autosaveIniciado = true;
        setInterval(function() { guardarNube(true); }, AUTOSAVE_MS);

        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') guardarNube(true);
        });
    }
});