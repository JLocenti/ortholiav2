import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SUPER_ADMIN_ID = 'pu9kerKqjyUbalsUO1OfQNVwGui2';

const collections = [
  'categories',
  'fields',
  'patients',
  'practitioners',
  'themeSettings',
  'userSettings',
  'viewPreferences'
];

async function migrateCollection(collectionName: string) {
  console.log(`Migrating collection: ${collectionName}`);
  const querySnapshot = await getDocs(collection(db, collectionName));
  
  const updates = querySnapshot.docs.map(async (document) => {
    const docRef = doc(db, collectionName, document.id);
    try {
      await updateDoc(docRef, {
        userId: SUPER_ADMIN_ID,
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated document ${document.id} in ${collectionName}`);
    } catch (error) {
      console.error(`Error updating document ${document.id} in ${collectionName}:`, error);
    }
  });

  await Promise.all(updates);
  console.log(`Finished migrating collection: ${collectionName}`);
}

export async function migrateUserId() {
  try {
    console.log('Starting migration...');
    
    for (const collectionName of collections) {
      await migrateCollection(collectionName);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateUserId()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
