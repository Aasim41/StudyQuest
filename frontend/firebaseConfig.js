import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGHUiJJcNPGU56N7U9GbZaykP5NesK1gw",
  authDomain: "studyquest-43b26.firebaseapp.com",
  projectId: "studyquest-43b26",
  storageBucket: "studyquest-43b26.firebasestorage.app",
  messagingSenderId: "442937861011",
  appId: "1:442937861011:web:c54d91924845e9f193be66",
  measurementId: "G-1QVRRSB81K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
