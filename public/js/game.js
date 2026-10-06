import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";
import { t, tItem, setLang, getLang } from "./i18n.js";
import {
    desbloqueosDe, MAX_CANTIDAD, MEJORAS, costeDe as costeN, ventaDe as ventaN,
    num, formatear as formatearNum, formatearTiempo
} from "./logic.js";

const MAX_OFFLINE_S = 8 * 3600;
const AUTOSAVE_MS = 60 * 1000;
const TICK_MS = 250;
const MAX_TICK_S = 5;
const STATUS_MS = 3000;
const RETRY_MS = 5000;
const SALIDA_DEBOUNCE_MS = 2000;
const RESPALDO_MS = 10 * 1000;
const LS_PREFIX = 'mc-clicker-save-';

let contador = 0;
let timer = 0;
const estado = {};
MEJORAS.forEach(m => { estado[m.id] = { cantidad: 0, desbloqueada: !m.oculto }; });

const costeDe   = (m, n = estado[m.id].cantidad) => costeN(m, n);
const ventaDe   = m => ventaN(m, estado[m.id].cantidad);
const calcularPasivo     = () => MEJORAS.reduce((s, m) => s + estado[m.id].cantidad * m.pasivo, 0);
const calcularBonusClick = () => MEJORAS.reduce((s, m) => s + estado[m.id].cantidad * m.clickBonus, 0);

const formatear = n => formatearNum(n, getLang());

const setText = (el, txt) => { if (el.textContent !== txt) el.textContent = txt; };
const setDisabled = (el, v) => { if (el.disabled !== v) el.disabled = v; };

const elContador = document.getElementById('contador');
const elXseg     = document.getElementById('xseg');
const elTimer    = document.getElementById('timer-value');
const elStatus   = document.getElementById('save-status');
const btnGuardar = document.getElementById('guardar');
const btnLogout  = document.getElementById('logout');

const grid = document.getElementById('inv-grid');
const refs = {};
MEJORAS.forEach(m => {
    const icono = m.id[0].toUpperCase() + m.id.slice(1);
    const slot = document.createElement('div');
    slot.className = 'slot' + (m.oculto ? ' locked' : '');
    slot.id = 'mej-' + m.id;
    const iconoUrl = new URL(`content/img/minecraft_icons/${icono}.png`, document.baseURI).href;
    slot.style.setProperty('--icon', `url("${iconoUrl}")`);

    const texto = document.createElement('span');
    const bComprar = document.createElement('button');
    const bVender = document.createElement('button');
    bComprar.type = bVender.type = 'button';
    slot.append(texto, bComprar, bVender);
    grid.appendChild(slot);

    bComprar.addEventListener('click', () => comprar(m));
    bVender.addEventListener('click', () => vender(m));
    refs[m.id] = { slot, texto, bComprar, bVender };
});

function actualizarUI() {
    setText(elContador, formatear(contador) + ' ' + t('emeralds'));
    setText(elXseg, formatear(calcularPasivo()) + ' ' + t('perSec') + '  |  +' + formatear(1 + calcularBonusClick()) + ' ' + t('perClick'));
    setText(elTimer, formatearTiempo(timer));
}

function actualizarMejoraUI(m) {
    const e = estado[m.id], r = refs[m.id];
    const maximo = e.cantidad >= MAX_CANTIDAD;
    setText(r.texto, t('upgradeOf', { n: e.cantidad, name: tItem(m.id) }));
    setText(r.bComprar, t('buyFor', { price: formatear(costeDe(m)) + ' $' }));
    setText(r.bVender, t('sellFor', { price: formatear(e.cantidad ? ventaDe(m) : 0) + ' $' }));
    setDisabled(r.bComprar, !cargado || maximo || contador < costeDe(m));
    setDisabled(r.bVender, !cargado || e.cantidad < 1);
}

function renderTodo() {
    actualizarUI();
    MEJORAS.forEach(actualizarMejoraUI);
}

function desbloquearMejora(id) {
    if (!id || !estado[id]) return;
    estado[id].desbloqueada = true;
    refs[id].slot.classList.remove('locked');
}

function comprar(m) {
    if (!cargado) return;
    const e = estado[m.id];
    const coste = costeDe(m);
    if (contador < coste || e.cantidad >= MAX_CANTIDAD) return;
    contador -= coste;
    e.cantidad++;
    desbloqueosDe(m, e.cantidad).forEach(desbloquearMejora);
    renderTodo();
}

function vender(m) {
    if (!cargado) return;
    const e = estado[m.id];
    if (e.cantidad < 1) return;
    contador += ventaDe(m);
    e.cantidad--;
    renderTodo();
}

document.getElementById('click').addEventListener('click', () => {
    if (!cargado) return;
    contador += 1 + calcularBonusClick();
    renderTodo();
});

let ultimo = Date.now();
function avanzar(segundos, contarTimer = true) {
    if (contarTimer) timer += segundos;
    contador += calcularPasivo() * segundos;
}
setInterval(() => {
    const ahora = Date.now();
    const delta = Math.max(0, (ahora - ultimo) / 1000);
    ultimo = ahora;
    if (!cargado) return;
    avanzar(Math.min(delta, MAX_OFFLINE_S), delta <= MAX_TICK_S);
    if (!document.hidden) renderTodo();
}, TICK_MS);

// ══════════ Guardado ══════════
let uid = null;
let cargado = false;
let bloqueado = false;
let version = 0;
let guardandoP = null;
let ultimoGuardado = 0;
let statusTimeout;

function mostrarEstado(key, params, fijo = false) {
    setText(elStatus, t(key, params));
    clearTimeout(statusTimeout);
    if (!fijo) statusTimeout = setTimeout(() => { elStatus.textContent = ''; }, STATUS_MS);
}

function crearSave() {
    const save = { contador, timer, lastSeen: Date.now(), estado: {} };
    MEJORAS.forEach(m => {
        save.estado[m.id] = { cantidad: estado[m.id].cantidad, desbloqueada: estado[m.id].desbloqueada };
    });
    return save;
}

function aplicarSave(save) {
    contador = Math.max(0, num(save.contador));
    timer    = Math.max(0, num(save.timer));
    MEJORAS.forEach(m => {
        const s = save.estado && save.estado[m.id];
        if (!s) return;
        estado[m.id].cantidad = Math.min(MAX_CANTIDAD, Math.max(0, Math.floor(num(s.cantidad))));
        if (s.desbloqueada || !m.oculto) desbloquearMejora(m.id);
    });
    MEJORAS.forEach(m => desbloqueosDe(m, estado[m.id].cantidad).forEach(desbloquearMejora));

    // Progreso offline
    const lejos = Math.min(Math.max((Date.now() - num(save.lastSeen, Date.now())) / 1000, 0), MAX_OFFLINE_S);
    const antes = contador;
    avanzar(lejos, false);
    ultimo = Date.now();
    return contador - antes;
}

function respaldoLocal() {
    if (!uid || !cargado || bloqueado) return;
    try { localStorage.setItem(LS_PREFIX + uid, JSON.stringify({ ...crearSave(), version })); } catch {}
}
function leerRespaldo() {
    try { return JSON.parse(localStorage.getItem(LS_PREFIX + uid)); } catch { return null; }
}

async function cargarNube() {
    try {
        const snap = await getDoc(doc(db, 'saves', uid));
        const remoto = snap.exists() ? snap.data() : null;
        version = remoto ? num(remoto.version) : 0;

        const local = leerRespaldo();
        const usarLocal = local && num(local.version) >= version && (!remoto || num(local.lastSeen) > num(remoto.lastSeen));
        const save = usarLocal ? local : remoto;

        if (!save) { ultimo = Date.now(); mostrarEstado('noSave'); return 'nosave'; }
        cargado = true;
        const ganado = aplicarSave(save);
        renderTodo();
        if (ganado >= 1) mostrarEstado('offlineGain', { n: formatear(ganado) });
        else mostrarEstado('loaded');
        return 'loaded';
    } catch (err) {
        console.error('Error al cargar:', err);
        return 'error';
    }
}

async function cargarConReintentos() {
    mostrarEstado('loading', undefined, true);
    while (true) {
        const r = await cargarNube();
        if (r !== 'error') break;
        mostrarEstado('loadError', undefined, true);
        await new Promise(res => setTimeout(res, RETRY_MS));
    }
    cargado = true;
    renderTodo();
}

function guardarNube(auto) {
    if (!uid || !cargado || bloqueado) {
        if (!cargado && !auto) mostrarEstado('loading');
        return Promise.resolve(false);
    }
    if (guardandoP) return auto ? guardandoP : guardandoP.then(() => guardarNube(auto));

    ultimoGuardado = Date.now();
    guardandoP = (async () => {
        try {
            const ref = doc(db, 'saves', uid);
            const nuevaVersion = await runTransaction(db, async tx => {
                const snap = await tx.get(ref);
                const remota = snap.exists() ? num(snap.data().version) : 0;
                if (remota !== version) {
                    const err = new Error('conflict');
                    err.code = 'app/conflict';
                    throw err;
                }
                tx.set(ref, { ...crearSave(), version: remota + 1, updatedAt: serverTimestamp() });
                return remota + 1;
            });
            version = nuevaVersion;
            mostrarEstado(auto ? 'autosaved' : 'saved');
            return true;
        } catch (err) {
            if (err.code === 'app/conflict') {
                bloqueado = true;
                mostrarEstado('conflict', undefined, true);
            } else {
                console.error('Error al guardar:', err);
                mostrarEstado('saveError');
            }
            return false;
        } finally {
            guardandoP = null;
        }
    })();
    return guardandoP;
}

btnGuardar.addEventListener('click', () => guardarNube(false));

btnLogout.addEventListener('click', async () => {
    btnLogout.disabled = btnGuardar.disabled = true;
    const ok = await guardarNube(false);
    if (!ok && !confirm(t('leaveUnsaved'))) {
        btnLogout.disabled = btnGuardar.disabled = false;
        return;
    }
    respaldoLocal();
    await signOut(auth);
});

document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang, renderTodo));
});
setLang(getLang(), renderTodo);

let iniciado = false;
function iniciarSesion() {
    setInterval(() => guardarNube(true), AUTOSAVE_MS);
    setInterval(respaldoLocal, RESPALDO_MS);

    const salir = () => {
        respaldoLocal();
        if (Date.now() - ultimoGuardado > SALIDA_DEBOUNCE_MS) guardarNube(true);
    };
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') salir();
        else renderTodo();
    });
    window.addEventListener('pagehide', salir);
}

onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = 'index.html'; return; }
    if (iniciado) return;
    iniciado = true;
    uid = user.uid;
    await cargarConReintentos();
    iniciarSesion();
}, console.error);