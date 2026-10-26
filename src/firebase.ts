import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

export const app = initializeApp({
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDV0zpilyo2JgsDz1yp88O_BOyOv4zMWvM",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "drop-e7d21.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "drop-e7d21",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "drop-e7d21.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "552289641649",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:552289641649:web:49b0e413fa7dba0cefae90",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    "G-YCPZJQ93G1",
});

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { provider };
export const firestore = getFirestore(app);

export const analyticsPromise =
  typeof window !== "undefined"
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(app) : null))
        .catch(() => null)
    : Promise.resolve(null);

