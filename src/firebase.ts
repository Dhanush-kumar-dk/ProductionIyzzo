import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// import type { User } from "firebase/auth";

export const app = initializeApp({
  apiKey: "AIzaSyDV0zpilyo2JgsDz1yp88O_BOyOv4zMWvM",
  authDomain: "drop-e7d21.firebaseapp.com",
  projectId: "drop-e7d21",
  storageBucket: "drop-e7d21.firebasestorage.app",
  messagingSenderId: "552289641649",
  appId: "1:552289641649:web:49b0e413fa7dba0cefae90",
  measurementId: "G-YCPZJQ93G1",
});

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { provider };
export const firestore = getFirestore(app);
export const analytics = getAnalytics(app);
