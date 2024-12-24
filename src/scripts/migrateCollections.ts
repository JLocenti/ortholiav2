import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';

async function migrateCollections() {
  try {
    console.log('Starting migration...');
    const batch = writeBatch(db);

    // Migrate fields collection
    const fieldsCollection = collection(db, 'fields');
    const fieldsSnapshot = await getDocs(fieldsCollection);
    
    console.log(`Found ${fieldsSnapshot.docs.length} fields to migrate`);
    
    for (const doc of fieldsSnapshot.docs) {
      const data = doc.data();
      const itemsCollection = collection(db, 'items');
      const newDoc = doc(itemsCollection);
      
      batch.set(newDoc, {
        ...data,
        id: newDoc.id,
        type: 'field',
        category: data.category || 'fields',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      });
    }

    console.log('Committing batch write...');
    await batch.commit();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

migrateCollections().then(() => {
  console.log('Migration script finished');
}).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
