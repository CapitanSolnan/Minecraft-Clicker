import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";
import { t, tItem, setLang, getLang } from "./i18n.js";

// ── Configuración
const CRECIMIENTO = 1.15;
const MAX_OFFLINE_S = 8 * 3600;
const AUTOSAVE_MS = 60 * 1000;
const TICK_MS = 250;
const MAX_TICK_S = 5;
const STATUS_MS = 3000;
const RETRY_MS = 5000;
const SALIDA_DEBOUNCE_MS = 2000;
const RESPALDO_MS = 10 * 1000;
const UNIDADES_DESBLOQUEO = 10;
const MAX_CANTIDAD = 1000;
const LS_PREFIX = 'mc-clicker-save-';


//Desbloquea1 -> 10
//Desbloquea2 -> 32
//Desbloquea3 -> 64
const MEJORAS = [
    { id: 'tronco',    costeBase: 10,            clickBonus: 1,   pasivo: 0,      desbloquea1: 'piedra',     desbloquea2: 'cortador',  desbloquea3: 'tablones'},
    { id: 'cortador',  costeBase: 50,            clickBonus: 1,   pasivo: 0},
    { id: 'tablones',  costeBase: 50,            clickBonus: 1,   pasivo: 0},

    { id: 'piedra',    costeBase: 100,           clickBonus: 5,   pasivo: 0,      desbloquea1: 'carbon',     desbloquea2: 'afilador', desbloquea3: 'mina' },
    { id: 'afilador',  costeBase: 500,           clickBonus: 5,   pasivo: 0},
    { id: 'mina',      costeBase: 500,           clickBonus: 5,   pasivo: 0},

    { id: 'carbon',    costeBase: 1_000,         clickBonus: 5,   pasivo: 2,      desbloquea1: 'cobre',      desbloquea2: 'horno', desbloquea3: 'piedra_lisa'  },
    { id: 'horno',      costeBase: 5_000,        clickBonus: 5,   pasivo: 10},
    { id: 'piedra_lisa', costeBase: 5_000,       clickBonus: 5,   pasivo: 10},

    { id: 'cobre',     costeBase: 10_000,        clickBonus: 10,  pasivo: 10,     desbloquea1: 'hierro',     desbloquea2: 'copper_golem', desbloquea3: 'copper_chest' },
    {id: 'copper_golem', costeBase: 50_000,      clickBonus: 10,  pasivo: 10},
    {id: 'copper_chest', costeBase: 50_000,      clickBonus: 10,  pasivo: 10},

    { id: 'hierro',    costeBase: 50_000,        clickBonus: 10,  pasivo: 10,     desbloquea1: 'lapiz',      desbloquea2: 'armadura',   desbloquea1: 'golem_hierro' },
    { id: 'armadura',  costeBase: 500_000,       clickBonus: 10,  pasivo: 50},
    { id: 'golem_hierro', costeBase: 5_000_000,  clickBonus: 50,  pasivo: 250},

    { id: 'lapiz',     costeBase: 500_000,       clickBonus: 10,  pasivo: 50,     desbloquea1: 'redstone',   desbloquea2: 'enchants', desbloquea3: 'libro_encantado' },
    { id: 'enchants',  costeBase: 5_000_000,     clickBonus: 50,  pasivo: 250},
    { id: 'book_enchant', costeBase: 50_000_000, clickBonus: 50, pasivo: 1_250},

    { id: 'redstone',  costeBase: 5_000_000,     clickBonus: 50,  pasivo: 250,    desbloquea1: 'esmeralda',  desbloquea2: 'minas_plus', desbloquea3: 'granja'  },
    { id: 'minas_plus', costeBase: 50_000_000,   clickBonus: 50,  pasivo: 1_250},
    { id: 'granjas',   costeBase: 50_000_000,    clickBonus: 50,  pasivo: 1_250 },

    { id: 'esmeralda', costeBase: 50_000_000,    clickBonus: 100, pasivo: 1_250,  desbloquea1: 'diamante',   desbloquea2: 'aldeano' },
    { id: 'aldeano',   costeBase: 500_000_000,   clickBonus: 100, pasivo: 6_250,  desbloquea3: 'tradeos' },
    { id: 'tradeos',   costeBase: 5_000_000_000, clickBonus: 250, pasivo: 31_250},

    { id: 'diamante',  costeBase: 500_000_000,   clickBonus: 250, pasivo: 6_250,  desbloquea1: 'obsidiana', desbloquea2: 'mejora_armadura' },
    { id: 'mejora_armadura', costeBase: 5_000_000_000, clickBonus: 250, pasivo: 31_250, desbloquea3: 'pico_diamante' },
    { id: 'pico_diamante', costeBase: 50_000_000_000, clickBonus: 250, pasivo: 156_250},

    { id: 'obsidiana', costeBase: 5_000_000_000, clickBonus: 250, pasivo: 31_250, desbloquea1: 'nether' },
    { id: 'nether',   costeBase: 50_000_000_000, clickBonus: 500, pasivo: 156_250, desbloquea1: null },
];
MEJORAS.forEach((m, i) => { m.oculto = i > 0; });

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
function formatearTiempo(s) {
    s = Math.floor(s);
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, seg = s % 60;
    const p = n => String(n).padStart(2, '0');
    if (h > 0) return h + 'h ' + p(m) + 'm ' + p(seg) + 's';
    if (m > 0) return m + 'm ' + p(seg) + 's';
    return seg + 's';
}

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
    if (e.cantidad >= UNIDADES_DESBLOQUEO) desbloquearMejora(m.desbloquea);
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

const num = (v, def = 0) => { v = Number(v); return Number.isFinite(v) ? v : def; };

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
    MEJORAS.forEach(m => { if (estado[m.id].cantidad >= UNIDADES_DESBLOQUEO) desbloquearMejora(m.desbloquea); });

    // Progreso offline
    const lejos = Math.min(Math.max((Date.now() - num(save.lastSeen, Date.now())) / 1000, 0), MAX_OFFLINE_S);
    const antes = contador;
    avanzar(lejos, false);
    ultimo = Date.now();
    return contador - antes;
}

function respaldoLocal() {
    if (!uid || !cargado) return;
    try { localStorage.setItem(LS_PREFIX + uid, JSON.stringify({ ...crearSave(), version })); } catch { /* ignorar */ }
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
