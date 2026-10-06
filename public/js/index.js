import { auth, app } from "./firebase.js";
import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged,
    GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { t, setLang, getLang } from "./i18n.js";

// Analytics es opcional: un bloqueador de anuncios no debe romper el login
import("https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js")
    .then(m => m.getAnalytics(app)).catch(() => {});

const form      = document.getElementById('auth-section');
const email     = document.getElementById('email');
const password  = document.getElementById('password');
const status    = document.getElementById('user-status');
const buttons   = form.querySelectorAll('button');

const ERRORS = {
    'auth/email-already-in-use': 'errEmailInUse',
    'auth/invalid-credential': 'errInvalid',
    'auth/wrong-password': 'errInvalid',
    'auth/user-not-found': 'errInvalid',
    'auth/invalid-email': 'errEmail',
    'auth/weak-password': 'errWeak',
    'auth/network-request-failed': 'errNetwork',
    'auth/popup-closed-by-user': null,
    'auth/cancelled-popup-request': null,
};

let statusKey = 'checkingSession';
let isError = false;
function setStatus(key, error = false) {
    statusKey = key; isError = error;
    status.textContent = t(key);
    status.classList.toggle('error', error);
}

async function run(fn) {
    buttons.forEach(b => b.disabled = true);
    try { await fn(); }
    catch (e) {
        const key = e.code in ERRORS ? ERRORS[e.code] : 'errGeneric';
        if (key) setStatus(key, true);
        else setStatus('loginPrompt');
    } finally { buttons.forEach(b => b.disabled = false); }
}

// La redirección a game.html la hace SOLO onAuthStateChanged
form.addEventListener('submit', e => {
    e.preventDefault();
    run(() => signInWithEmailAndPassword(auth, email.value, password.value));
});
document.getElementById('btn-register').addEventListener('click', () => {
    if (!form.reportValidity()) return;
    run(() => createUserWithEmailAndPassword(auth, email.value, password.value));
});
document.getElementById('btn-google').addEventListener('click', () => {
    run(() => signInWithPopup(auth, new GoogleAuthProvider()));
});
document.getElementById('btn-reset').addEventListener('click', () => {
    if (!email.value) return setStatus('resetNeedEmail', true);
    run(async () => { await sendPasswordResetEmail(auth, email.value); setStatus('resetSent'); });
});

onAuthStateChanged(auth, user => {
    if (user) window.location.href = 'game.html';
    else setStatus('loginPrompt');
});

document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang, () => setStatus(statusKey, isError)));
});
setLang(getLang(), () => setStatus(statusKey, isError));
