
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDNEoTDY8S7eCObS76FPJVaefc2J4ighwc",
  authDomain: "crop-connect-aefc6.firebaseapp.com",
  projectId: "crop-connect-aefc6",
  storageBucket: "crop-connect-aefc6.firebasestorage.app",
  messagingSenderId: "632465119070",
  appId: "1:632465119070:web:9ec7bce5c22a35809961cf",
  measurementId: "G-W1VJ2Y7RDR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
