
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_2BZiY7zXA-nKL36QSXdPbXKZ0idFElg",
  authDomain: "gen-lang-client-0503650656.firebaseapp.com",
  projectId: "gen-lang-client-0503650656",
  storageBucket: "gen-lang-client-0503650656.firebasestorage.app",
  messagingSenderId: "142701338125",
  appId: "1:142701338125:web:278e90d50a86a919cd7f44",
  measurementId: "G-X49ZDJMKMV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
