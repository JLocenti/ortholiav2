const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');

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

const addGeneralFields = async () => {
  try {
    // Trouver la catégorie "Général"
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('name', '==', 'Général'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error('Catégorie "Général" non trouvée');
      return;
    }

    const generalCategory = querySnapshot.docs[0];
    const fieldsRef = collection(db, 'fields');

    const fieldsToAdd = [
      {
        text: 'Antécédents Médicaux',
        fieldType: 'textarea',
        categoryId: generalCategory.id,
        order: 1
      },
      {
        text: 'Antécédents Orthodontiques',
        fieldType: 'textarea',
        categoryId: generalCategory.id,
        order: 2
      },
      {
        text: 'Motifs et Doléances du Patient',
        fieldType: 'textarea',
        categoryId: generalCategory.id,
        order: 3
      },
      {
        text: 'Information(s) complémentaire(s)',
        fieldType: 'textarea',
        categoryId: generalCategory.id,
        order: 4
      }
    ];

    for (const field of fieldsToAdd) {
      await addDoc(fieldsRef, field);
      console.log(`Champ "${field.text}" ajouté avec succès`);
    }

    console.log('Tous les champs ont été ajoutés avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des champs:', error);
  }
};

// Exécuter le script
addGeneralFields();
