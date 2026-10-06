import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";
import { t, tItem, setLang, getLang } from "./i18n.js";

// ── Configuración
const CRECIMIENTO = 1.15; 
const MAX_OFFLINE_S = 8 * 3600;
const AUTOSAVE_MS = 60 * 1000;

const MEJORAS = [
    { id: 'tronco',    costeBase: 10,            clickBonus: 1,   pasivo: 0,      desbloquea: 'piedra',    oculto: false },
    { id: 'piedra',    costeBase: 100,           clickBonus: 5,   pasivo: 0,      desbloquea: 'carbon' },
    { id: 'carbon',    costeBase: 1_000,         clickBonus: 5,   pasivo: 2,      desbloquea: 'hierro' },
    { id: 'hierro',    costeBase: 50_000,        clickBonus: 10,  pasivo: 10,     desbloquea: 'lapiz' },
    { id: 'lapiz',     costeBase: 500_000,       clickBonus: 10,  pasivo: 50,     desbloquea: 'redstone' },
    { id: 'redstone',  costeBase: 5_000_000,     clickBonus: 50,  pasivo: 250,    desbloquea: 'oro' },
    { id: 'oro',       costeBase: 50_000_000,    clickBonus: 50,  pasivo: 1_250,  desbloquea: 'diamante' },
    { id: 'diamante',  costeBase: 500_000_000,   clickBonus: 250, pasivo: 6_250,  desbloquea: 'obsidiana' },
    { id: 'obsidiana', costeBase: 5_000_000_000, clickBonus: 250, pasivo: 31_250, desbloquea: null },
];
MEJORAS.forEach(m => { m.oculto = m.oculto !== false; });

// ── Estado
let contador = 0;
let timer = 0;
const estado = {};
MEJORAS.forEach(m => { estado[m.id] = { cantidad: 0, desbloqueada: !m.oculto }; });

const costeDe   = (m, n = estado[m.id].cantidad) => Math.floor(m.costeBase * CRECIMIENTO ** n);
const ventaDe   = m => Math.floor(costeDe(m, estado[m.id].cantidad - 1) / 2);
const calcularPasivo     = () => MEJORAS.reduce((s, m) => s + estado[m.id].cantidad * m.pasivo, 0);
const calcularBonusClick = () => MEJORAS.reduce((s, m) => s + estado[m.id].cantidad * m.clickBonus, 0);

// ── Formato
const SUFIJOS = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
function formatear(n) {
    if (!isFinite(n)) return '∞';
    const signo = n < 0 ? '-' : '';
    n = Math.abs(n);
    if (n < 1000) return signo + new Intl.NumberFormat(getLang(), { maximumFractionDigits: 2 }).format(Math.floor(n * 100) / 100);
    let i = Math.min(Math.floor(Math.log10(n) / 3), SUFIJOS.length - 1);
    let v = Math.floor(n / 1000 ** i * 100) / 100;
    if (v >= 1000 && i < SUFIJOS.length - 1) { v = Math.floor(v / 1000 * 100) / 100; i++; }
    return signo + new Intl.NumberFormat(getLang(), { maximumFractionDigits: 2 }).format(v) + SUFIJOS[i];
}
// Formato timer 
function formatearTiempo(s) {
    s = Math.floor(s);
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, seg = s % 60;
    const p = n => String(n).padStart(2, '0');
    if (h > 0) return h + 'h ' + p(m) + 'm ' + p(seg) + 's';
    if (m > 0) return m + 'm ' + p(seg) + 's';
    return seg + 's';
}

// ── Generar slots desde MEJORAS
const grid = document.getElementById('inv-grid');
MEJORAS.forEach(m => {
    const icono = m.id[0].toUpperCase() + m.id.slice(1);
    const slot = document.createElement('div');
    slot.className = 'slot' + (m.oculto ? ' locked' : '');
    slot.id = 'mej-' + m.id;
    const iconoUrl = new URL(`content/img/minecraft_icons/${icono}.png`, document.baseURI).href;
    slot.style.setProperty('--icon', `url("${iconoUrl}")`);
    slot.innerHTML = `<span id="text-${m.id}"></span>
        <button id="Comprar-${m.id}"></button>
        <button id="Vender-${m.id}"></button>`;
    grid.appendChild(slot);
    slot.querySelector('#Comprar-' + m.id).addEventListener('click', () => comprar(m));
    slot.querySelector('#Vender-' + m.id).addEventListener('click', () => vender(m));
});

// ── Renderizado
function actualizarUI() {
    document.getElementById('contador').textContent = formatear(contador) + ' ' + t('emeralds');
    document.getElementById('xseg').textContent =
        formatear(calcularPasivo()) + ' ' + t('perSec') + '  |  +' + formatear(1 + calcularBonusClick()) + ' ' + t('perClick');
    document.getElementById('timer-value').textContent = formatearTiempo(timer);
}

function actualizarMejoraUI(m) {
    const e = estado[m.id];
    document.getElementById('text-' + m.id).textContent = t('upgradeOf', { n: e.cantidad, name: tItem(m.id) });
    const comprar = document.getElementById('Comprar-' + m.id);
    const vender  = document.getElementById('Vender-' + m.id);
    comprar.textContent = t('buyFor', { price: formatear(costeDe(m)) + ' $' });
    vender.textContent  = t('sellFor', { price: formatear(e.cantidad ? ventaDe(m) : 0) + ' $' });
    comprar.disabled = contador < costeDe(m);
    vender.disabled  = e.cantidad < 1;
}

function renderTodo() {
    actualizarUI();
    MEJORAS.forEach(actualizarMejoraUI);
}

function desbloquearMejora(id) {
    if (!id) return;
    estado[id].desbloqueada = true;
    document.getElementById('mej-' + id).classList.remove('locked');
}

// ── Compra / venta
function comprar(m) {
    const e = estado[m.id];
    const coste = costeDe(m);
    if (contador < coste) return;
    contador -= coste;
    e.cantidad++;
    if (e.cantidad >= 10) desbloquearMejora(m.desbloquea);
    renderTodo();
}

function vender(m) {
    const e = estado[m.id];
    if (e.cantidad < 1) return;
    contador += ventaDe(m);
    e.cantidad--;
    renderTodo();
}

// ── Click manual
document.getElementById('click').addEventListener('click', function (ev) {
    const ganancia = 1 + calcularBonusClick();
    contador += ganancia;


    renderTodo();
});

// ── Tick con delta de tiempo real
let ultimo = Date.now();
function avanzar(segundos) {
    timer += segundos;
    contador += calcularPasivo() * segundos;
}
setInterval(() => {
    const ahora = Date.now();
    avanzar(Math.min((ahora - ultimo) / 1000, MAX_OFFLINE_S));
    ultimo = ahora;
    renderTodo();
}, 250);

// ══════════ Guardado en Firestore ══════════
let uid = null;
let cargado = false;
let guardando = false;
let statusTimeout;

function mostrarEstado(key, params) {
    const el = document.getElementById('save-status');
    el.textContent = t(key, params);
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => { el.textContent = ''; }, 3000);
}

function crearSave() {
    const save = { contador, timer, lastSeen: Date.now(), estado: {} };
    MEJORAS.forEach(m => {
        save.estado[m.id] = { cantidad: estado[m.id].cantidad, desbloqueada: estado[m.id].desbloqueada };
    });
    return save;
}

function aplicarSave(save) {
    contador = Number(save.contador) || 0;
    timer    = Number(save.timer) || 0;
    MEJORAS.forEach(m => {
        const s = save.estado && save.estado[m.id];
        if (!s) return;
        estado[m.id].cantidad = Math.max(0, Number(s.cantidad) || 0);
        if (s.desbloqueada || !m.oculto) desbloquearMejora(m.id);
    });

    // Progreso offline
    const lejos = Math.min(Math.max((Date.now() - (Number(save.lastSeen) || Date.now())) / 1000, 0), MAX_OFFLINE_S);
    const antes = contador;
    avanzar(lejos);
    ultimo = Date.now();
    renderTodo();
    return contador - antes;
}

async function cargarNube() {
    try {
        const snap = await getDoc(doc(db, 'saves', uid));
        if (!snap.exists()) { mostrarEstado('noSave'); return 'nosave'; }
        const ganado = aplicarSave(snap.data());
        if (ganado >= 1) mostrarEstado('offlineGain', { n: formatear(ganado) });
        else mostrarEstado('loaded');
        return 'loaded';
    } catch (err) {
        console.error('Error al cargar:', err);
        mostrarEstado('loadError');
        return 'error';
    }
}

async function guardarNube(auto) {
    if (!uid || !cargado) { mostrarEstado('loading'); return; }
    if (guardando) return;
    guardando = true;
    try {
        await setDoc(doc(db, 'saves', uid), { ...crearSave(), updatedAt: serverTimestamp() });
        mostrarEstado(auto ? 'autosaved' : 'saved');
    } catch (err) {
        console.error('Error al guardar:', err);
        mostrarEstado('saveError');
    } finally { guardando = false; }
}

document.getElementById('guardar').addEventListener('click', () => guardarNube(false));
document.getElementById('logout').addEventListener('click', async () => {
    await guardarNube(true);
    await signOut(auth);
});

// ── Idioma
document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang, renderTodo));
});
setLang(getLang(), renderTodo);

// ── Sesión
onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = 'index.html'; return; }
    uid = user.uid;
    cargado = (await cargarNube()) !== 'error';

    setInterval(() => guardarNube(true), AUTOSAVE_MS);
    const guardarAlSalir = () => { if (document.visibilityState === 'hidden') guardarNube(true); };
    document.addEventListener('visibilitychange', guardarAlSalir);
    window.addEventListener('pagehide', () => guardarNube(true));
}, console.error);