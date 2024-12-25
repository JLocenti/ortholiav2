import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAinUtEWeYx8eAZtcHFDcPSvaH0wHbxbX0",
  authDomain: "ortholia-144f3.firebaseapp.com",
  projectId: "ortholia-144f3",
  storageBucket: "ortholia-144f3.firebasestorage.app",
  messagingSenderId: "911841482671",
  appId: "1:911841482671:web:c9b7625d4d56a39665415a",
  measurementId: "G-BNG4WDH4RP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createCategories = async () => {
  try {
    const categoriesRef = collection(db, 'categories');
    const currentDate = new Date().toISOString();

    const categories = [
      {
        name: 'Praticiens',
        order: 1,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        name: 'Général',
        order: 2,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        name: 'Signes Cliniques',
        order: 3,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        name: 'Diagnostic Fonctionnel',
        order: 4,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        name: 'Diagnostic Squelettique',
        order: 5,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        name: 'Diagnostic Dentaire',
        order: 6,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        name: 'Traitement',
        order: 7,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        name: 'Prescription',
        order: 8,
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];

    const categoryIds = {};

    for (const category of categories) {
      const docRef = await addDoc(categoriesRef, category);
      console.log(`Catégorie "${category.name}" créée avec l'ID: ${docRef.id}`);
      categoryIds[category.name] = docRef.id;
    }

    console.log('Toutes les catégories ont été créées avec succès');
    console.log('IDs des catégories:', categoryIds);
    
    return categoryIds;
  } catch (error) {
    console.error('Erreur lors de la création des catégories:', error);
    throw error;
  }
};

// Exécuter le script
createCategories();
