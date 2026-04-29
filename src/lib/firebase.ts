import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

console.log("Firebase config loaded:", !!firebaseConfig);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with standard settings for most stability
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);
