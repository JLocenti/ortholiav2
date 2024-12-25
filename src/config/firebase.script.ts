import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB9WCYJTnQBGYvlZxLCYwVuBMlQyWPOhYo",
  authDomain: "ortholia-dev.firebaseapp.com",
  projectId: "ortholia-dev",
  storageBucket: "ortholia-dev.appspot.com",
  messagingSenderId: "1019599829572",
  appId: "1:1019599829572:web:4c8c1f9e1c2f6a9c1c2f6a",
  measurementId: "G-MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Fonction d'authentification
export async function authenticate(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Authentification réussie');
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    throw error;
  }
}
