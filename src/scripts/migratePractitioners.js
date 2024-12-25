import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { addPractitioner } from '../services/practitionerService';

async function migratePractitioners() {
  try {
    // 1. Récupérer tous les praticiens de la collection items
    const itemsCollection = collection(db, 'items');
    const q = query(itemsCollection, where('categoryId', '==', 'practitioners'));
    const querySnapshot = await getDocs(q);

    console.log(`Found ${querySnapshot.size} practitioners to migrate`);

    // 2. Migrer chaque praticien vers la nouvelle collection
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      await addPractitioner({
        name: data.name,
        color: data.color || '#4D7EF9',
        categoryId: 'practitioners'
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
