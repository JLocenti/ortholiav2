const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Configuration Firebase (copié depuis src/config/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyAinUtEWeYx8eAZtcHFDcPSvaH0wHbxbX0",
  authDomain: "ortholia-144f3.firebaseapp.com",
  projectId: "ortholia-144f3",
  storageBucket: "ortholia-144f3.firebasestorage.app",
  messagingSenderId: "911841482671",
  appId: "1:911841482671:web:c9b7625d4d56a39665415a",
  measurementId: "G-BNG4WDH4RP"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addInitialPractitioners() {
  try {
    const practitionersCollection = collection(db, 'practitioners');
    const now = new Date().toISOString();

    // Ajouter JL
    const jlDoc = await addDoc(practitionersCollection, {
      name: 'JL',
      color: '#4D7EF9',
      createdAt: now,
      updatedAt: now
    });
    console.log('Added JL with ID:', jlDoc.id);

    // Ajouter Jeanne
    const jeanneDoc = await addDoc(practitionersCollection, {
      name: 'Jeanne',
      color: '#FF69B4',
      createdAt: now,
      updatedAt: now
    });
    console.log('Added Jeanne with ID:', jeanneDoc.id);

    console.log('Successfully added initial practitioners');
    process.exit(0);
  } catch (error) {
    console.error('Error adding practitioners:', error);
    process.exit(1);
  }
}

// Exécuter la fonction
addInitialPractitioners();
