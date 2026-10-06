export const CRECIMIENTO = 1.15;
export const MAX_CANTIDAD = 1000;

export const UMBRALES = [10, 32, 64];

export const desbloqueosDe = (m, cantidad) =>
    UMBRALES
        .map((umbral, i) => (cantidad >= umbral ? m['desbloquea' + (i + 1)] : null))
        .filter(Boolean);

export const MEJORAS = [
    { id: 'tronco',    costeBase: 10,             clickBonus: 1,     pasivo: 0,           desbloquea1: 'piedra',    desbloquea2: 'cortador',        desbloquea3: 'tablones' },
    { id: 'cortador',  costeBase: 250,            clickBonus: 3,     pasivo: 0 },
    { id: 'tablones',  costeBase: 1_000,          clickBonus: 6,     pasivo: 0 },

    { id: 'piedra',    costeBase: 100,            clickBonus: 5,     pasivo: 0,           desbloquea1: 'carbon',    desbloquea2: 'afilador',        desbloquea3: 'mina' },
    { id: 'afilador',  costeBase: 2_500,          clickBonus: 15,    pasivo: 0 },
    { id: 'mina',      costeBase: 10_000,         clickBonus: 30,    pasivo: 0 },

    { id: 'carbon',      costeBase: 1_000,        clickBonus: 10,    pasivo: 1,           desbloquea1: 'cobre',     desbloquea2: 'horno',           desbloquea3: 'piedra_lisa' },
    { id: 'horno',       costeBase: 25_000,       clickBonus: 30,    pasivo: 5 },
    { id: 'piedra_lisa', costeBase: 100_000,      clickBonus: 60,    pasivo: 20 },

    { id: 'cobre',        costeBase: 10_000,      clickBonus: 25,    pasivo: 2,           desbloquea1: 'hierro',    desbloquea2: 'copper_golem',    desbloquea3: 'copper_chest' },
    { id: 'copper_golem', costeBase: 250_000,     clickBonus: 75,    pasivo: 50 },
    { id: 'copper_chest', costeBase: 1_000_000,   clickBonus: 150,   pasivo: 200 },

    { id: 'hierro',       costeBase: 100_000,     clickBonus: 50,    pasivo: 20,          desbloquea1: 'lapiz',     desbloquea2: 'armadura',        desbloquea3: 'golem_hierro' },
    { id: 'armadura',     costeBase: 2_500_000,   clickBonus: 150,   pasivo: 500 },
    { id: 'golem_hierro', costeBase: 10_000_000,  clickBonus: 300,   pasivo: 2_000 },

    { id: 'lapiz',        costeBase: 1_000_000,   clickBonus: 100,   pasivo: 200,         desbloquea1: 'redstone',  desbloquea2: 'enchants',        desbloquea3: 'book_enchant' },
    { id: 'enchants',     costeBase: 25_000_000,  clickBonus: 300,   pasivo: 5_000 },
    { id: 'book_enchant', costeBase: 100_000_000, clickBonus: 600,   pasivo: 20_000 },

    { id: 'redstone',     costeBase: 10_000_000,  clickBonus: 250,   pasivo: 2_000,       desbloquea1: 'esmeralda', desbloquea2: 'minas_plus',      desbloquea3: 'granjas' },
    { id: 'minas_plus',   costeBase: 250_000_000, clickBonus: 750,   pasivo: 50_000 },
    { id: 'granjas',      costeBase: 1_000_000_000, clickBonus: 1_500, pasivo: 200_000 },

    { id: 'esmeralda',    costeBase: 100_000_000, clickBonus: 500,   pasivo: 20_000,      desbloquea1: 'diamante',  desbloquea2: 'aldeano',         desbloquea3: 'tradeos' },
    { id: 'aldeano',      costeBase: 2_500_000_000, clickBonus: 1_500, pasivo: 500_000 },
    { id: 'tradeos',      costeBase: 10_000_000_000, clickBonus: 3_000, pasivo: 2_000_000 },

    { id: 'diamante',        costeBase: 1_000_000_000,   clickBonus: 1_000, pasivo: 200_000,    desbloquea1: 'obsidiana', desbloquea2: 'mejora_armadura', desbloquea3: 'pico_diamante' },
    { id: 'mejora_armadura', costeBase: 25_000_000_000,  clickBonus: 3_000, pasivo: 5_000_000 },
    { id: 'pico_diamante',   costeBase: 100_000_000_000, clickBonus: 6_000, pasivo: 20_000_000 },

    { id: 'obsidiana', costeBase: 10_000_000_000,  clickBonus: 2_500, pasivo: 2_000_000,   desbloquea1: 'nether' },
    { id: 'nether',    costeBase: 100_000_000_000, clickBonus: 5_000, pasivo: 20_000_000 },
];
MEJORAS.forEach((m, i) => { m.oculto = i > 0; });

export const costeDe = (m, n) => Math.floor(m.costeBase * CRECIMIENTO ** n);

export const ventaDe = (m, cantidad) => cantidad < 1 ? 0 : Math.floor(costeDe(m, cantidad - 1) / 2);

export const num = (v, def = 0) => { v = Number(v); return Number.isFinite(v) ? v : def; };

const SUFIJOS = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatear(n, locale = 'es') {
    if (!isFinite(n)) return '∞';
    const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    const signo = n < 0 ? '-' : '';
    n = Math.abs(n);
    if (n < 1000) return signo + fmt.format(Math.floor(n * 100) / 100);
    let i = Math.min(Math.floor(Math.log10(n) / 3), SUFIJOS.length - 1);
    let v = Math.floor(n / 1000 ** i * 100) / 100;
    if (v >= 1000 && i < SUFIJOS.length - 1) { v = Math.floor(v / 1000 * 100) / 100; i++; }
    return signo + fmt.format(v) + SUFIJOS[i];
}

export function formatearTiempo(s) {
    s = Math.floor(s);
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, seg = s % 60;
    const p = n => String(n).padStart(2, '0');
    if (h > 0) return h + 'h ' + p(m) + 'm ' + p(seg) + 's';
    if (m > 0) return m + 'm ' + p(seg) + 's';
    return seg + 's';
}