import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc } from 'firebase/firestore';

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

async function migratePractitioners() {
  try {
    // 1. Récupérer tous les praticiens de la collection items
    const itemsCollection = collection(db, 'items');
    const q = query(itemsCollection, where('categoryId', '==', 'practitioners'));
    const querySnapshot = await getDocs(q);

    console.log(`Found ${querySnapshot.size} practitioners to migrate`);

    // 2. Migrer chaque praticien vers la nouvelle collection
    const practitionersCollection = collection(db, 'practitioners');
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const now = new Date().toISOString();
      
      await addDoc(practitionersCollection, {
        name: data.name,
        color: data.color || '#4D7EF9',
        categoryId: 'practitioners',
        createdAt: now,
        updatedAt: now
      });
      
      console.log(`Migrated practitioner: ${data.name}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Exécuter la migration
migratePractitioners();
