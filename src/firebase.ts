import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPKgcAjWiMKrsbMNrOB-TRN58_ihXUUMs",
  authDomain: "fluxell.onrender.com",
  projectId: "fluxelldeploy",
  storageBucket: "fluxelldeploy.firebasestorage.app",
  messagingSenderId: "684108324584",
  appId: "1:684108324584:web:fffdecb342b3bc7f95735d",
  measurementId: "G-3ZT8XN2J0P"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard scopes for Google Provider
googleProvider.addScope("profile");
googleProvider.addScope("email");
