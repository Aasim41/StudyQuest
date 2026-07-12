import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBcbEPlEEP4FYaQOG8Y8oRznLzpMZVBowQ",
  authDomain: "studyquest-2.firebaseapp.com",
  projectId: "studyquest-2",
  storageBucket: "studyquest-2.firebasestorage.app",
  messagingSenderId: "780918043284",
  appId: "1:780918043284:web:7c0d6f1919426f2091ba81",
  measurementId: "G-RCSZDG6B0F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);
