import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAHXa6rPfUBBCwXGzKvKuLYBGFrp0NWXU0",
  authDomain: "ortholia-v4.firebaseapp.com",
  projectId: "ortholia-v4",
  storageBucket: "ortholia-v4.appspot.com",
  messagingSenderId: "1087462003392",
  appId: "1:1087462003392:web:0e8f1d5e0a3c9c0e0e0e0e"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initPractitioners() {
  try {
    const practitionersCollection = collection(db, 'practitioners');
    const now = new Date().toISOString();

    // Ajouter JL
    await addDoc(practitionersCollection, {
      id: 'jl',
      name: 'JL',
      color: '#4D7EF9',
      createdAt: now,
      updatedAt: now
    });
    console.log('Added practitioner: JL');

    // Ajouter Jeanne
    await addDoc(practitionersCollection, {
      id: 'jeanne',
      name: 'Jeanne',
      color: '#FF69B4',
      createdAt: now,
      updatedAt: now
    });
    console.log('Added practitioner: Jeanne');

    console.log('Successfully initialized practitioners collection');
  } catch (error) {
    console.error('Error initializing practitioners:', error);
  }
}

// Exécuter l'initialisation
initPractitioners();
