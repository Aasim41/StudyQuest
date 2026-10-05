import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBcbEPlEEP4FYaQOG8Y8oRznLzpMZVBowQ",
  authDomain: "studyquest-2.firebaseapp.com",
  projectId: "studyquest-2",
  storageBucket: "studyquest-2.firebasestorage.app",
  messagingSenderId: "780918043284",
  appId: "1:780918043284:web:7c0d6f1919426f2091ba81",
  measurementId: "G-RCSZDG6B0F",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  if (Platform.OS === 'web') {
    auth = FirebaseAuth.getAuth(app);
  } else {
    const ReactNativeAsyncStorage = require("@react-native-async-storage/async-storage").default;
    const getReactNativePersistence = FirebaseAuth.getReactNativePersistence;
    if (typeof getReactNativePersistence === 'function') {
      auth = FirebaseAuth.initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    } else {
      auth = FirebaseAuth.getAuth(app);
    }
  }
} catch (e) {
  auth = FirebaseAuth.getAuth(app);
}

let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  db = getFirestore(app);
}

const storage = getStorage(app);

export { auth, db, storage };
export default app;
