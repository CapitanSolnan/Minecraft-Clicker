// ── Diccionario de traducciones
export const translations = {
    es: {
        title: 'Minecraft Clicker',
        timer: 'Tiempo transcurrido:',
        save: 'Guardar Progreso',
        inventory: 'Inventario',
        emeralds: 'ESMERALDAS',
        perSec: '/seg',
        perClick: 'por click',
        buyFor: 'Comprar por {price}',
        sellFor: 'Vender por {price}',
        upgradeOf: '{n} Mejora de {name}',
        loading: 'Espera, cargando partida...',
        autosaved: 'Autoguardado ✔',
        saved: 'Partida guardada ✔',
        saveError: 'Error al guardar ✖',
        loaded: 'Partida cargada ✔',
        noSave: 'No hay partida guardada',
        loadError: 'Error al cargar ✖',
        items: {
            tronco: 'Tronco',
            piedra: 'Piedra',
            carbon: 'Carbón',
            hierro: 'Hierro',
            lapiz: 'Lapislázuli',
            redstone: 'Redstone',
            oro: 'Oro',
            diamante: 'Diamante',
            obsidiana: 'Obsidiana',
        },
        loginPageTitle: 'Minecraft Clicker - Login',
        authTitle: 'Iniciar Sesión / Registrarse',
        email: 'Correo electrónico',
        password: 'Contraseña',
        register: 'Registrarse',
        login: 'Iniciar Sesión',
        google: 'Iniciar sesión con Google',
        checkingSession: 'Comprobando sesión...',
    },
    en: {
        title: 'Minecraft Clicker',
        timer: 'Time elapsed:',
        save: 'Save Progress',
        inventory: 'Inventory',
        emeralds: 'EMERALDS',
        perSec: '/sec',
        perClick: 'per click',
        buyFor: 'Buy for {price}',
        sellFor: 'Sell for {price}',
        upgradeOf: '{n} {name} Upgrade',
        loading: 'Please wait, loading game...',
        autosaved: 'Autosaved ✔',
        saved: 'Game saved ✔',
        saveError: 'Error saving ✖',
        loaded: 'Game loaded ✔',
        noSave: 'No saved game found',
        loadError: 'Error loading ✖',
        items: {
            tronco: 'Log',
            piedra: 'Stone',
            carbon: 'Coal',
            hierro: 'Iron',
            lapiz: 'Lapis Lazuli',
            redstone: 'Redstone',
            oro: 'Gold',
            diamante: 'Diamond',
            obsidiana: 'Obsidian',
        },
        currentLang: 'Current language: {lang}',
        loginPageTitle: 'Minecraft Clicker - Login',
        authTitle: 'Login / Register',
        email: 'Email',
        password: 'Password',
        register: 'Register',
        login: 'Login',
        google: 'Login with Google',
        checkingSession: 'Checking session...',
    },
    ca: {
        title: 'Minecraft Clicker',
        timer: 'Temps transcorregut:',
        save: 'Descarregar Progrés',
        inventory: 'Inventari',
        emeralds: 'ESMERALDES',
        perSec: '/seg',
        perClick: 'per clic',
        buyFor: 'Comprar per {price}',
        sellFor: 'Vendre per {price}',
        upgradeOf: '{n} Millores de {name}',
        loading: 'Espere, carregant partida...',
        autosaved: 'Autodesarregat ✔',
        saved: 'Partida desarregada ✔',
        saveError: 'Error al desarregar ✖',
        loaded: 'Partida carregada ✔',
        noSave: 'No hi ha partida desarregada',
        loadError: 'Error al carregar ✖',
        items: {
            tronco: 'Tronc',
            piedra: 'Pedra',
            carbon: 'Carbó',
            hierro: 'Ferró',
            lapiz: 'Lapislázuli',
            redstone: 'Redstone',
            oro: 'Or',
            diamante: 'Diamant',
            obsidiana: 'Obsidiana',
        },
        currentLang: 'Current language: {lang}',
        loginPageTitle: 'Minecraft Clicker - Login',
        authTitle: 'Iniciar Sessió / Registrar-se',
        email: 'Correu electrònic',
        password: 'Contrasenya',
        register: 'Registrar-se',
        login: 'Iniciar Sessió',
        google: 'Iniciar sessió amb Google',
        checkingSession: 'Comprovant sessió...',
    },
};

let currentLang = localStorage.getItem('lang') || 'es';
if (!translations[currentLang]) currentLang = 'es';

export function t(key, params = {}) {
    let text = translations[currentLang][key] ?? key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replace('{' + k + '}', v);
    }
    return text;
}

export function tItem(id) {
    return translations[currentLang].items[id] ?? id;
}

export function getLang() {
    return currentLang;
}

export function setLang(lang, onChange) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.title = t(document.body.dataset.titleKey || 'title');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });


    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
});

    if (onChange) onChange();
}