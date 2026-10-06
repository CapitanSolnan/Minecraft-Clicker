import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC3YYcsHk3ceduiWPOBm6oJZBp_ZiArYsg",
  authDomain: "minecraft-clicker-3cd9b.firebaseapp.com",
  projectId: "minecraft-clicker-3cd9b",
  storageBucket: "minecraft-clicker-3cd9b.firebasestorage.app",
  messagingSenderId: "308705407124",
  appId: "1:308705407124:web:6fb19ff52073f2db788481",
  measurementId: "G-VKGX649NEW"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
