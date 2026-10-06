import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC3YYcsHk3ceduiWPOBm6oJZBp_ZiArYsg",
  authDomain: "minecraft-clicker-3cd9b.firebaseapp.com",
  projectId: "minecraft-clicker-3cd9b",
  storageBucket: "minecraft-clicker-3cd9b.firebasestorage.app",
  messagingSenderId: "308705407124",
  appId: "1:308705407124:web:6fb19ff52073f2db788481",
  measurementId: "G-VKGX649NEW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnRegister = document.getElementById('btn-register');
const btnLogin = document.getElementById('btn-login');
const btnGoogle = document.getElementById('btn-google'); 
const userStatus = document.getElementById('user-status');

btnRegister.addEventListener('click', () => {
    createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
        .then(() => {
            window.location.href = 'game.html';
        })
        .catch((error) => {
            alert("Error al registrarse: " + error.message);
        });
});

btnLogin.addEventListener('click', () => {
    signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
        .then(() => {
            window.location.href = 'game.html';
        })
        .catch((error) => {
            alert("Error al iniciar sesión: " + error.message);
        });
});

btnGoogle.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            window.location.href = 'game.html';
        })
        .catch((error) => {
            alert("Error con Google: " + error.message);
        });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'game.html';
    } else {
        userStatus.innerText = "Por favor, inicia sesión para jugar.";
    }
});

import { t, setLang, getLang } from "./i18n.js";

document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
});
setLang(getLang());