import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeViewPreferences } from './initializeViewPreferences.js';

// Configuration Firebase (à remplacer par vos propres valeurs)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exécuter l'initialisation
async function main() {
  try {
    await initializeViewPreferences();
    console.log('ViewPreferences initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
