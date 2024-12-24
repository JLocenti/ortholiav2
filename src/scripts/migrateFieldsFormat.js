import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAinUtEWeYx8eAZtcHFDcPSvaH0wHbxbX0",
    authDomain: "ortholia-144f3.firebaseapp.com",
    projectId: "ortholia-144f3",
    storageBucket: "ortholia-144f3.firebasestorage.app",
    messagingSenderId: "911841482671",
    appId: "1:911841482671:web:c9b7625d4d56a39665415a",
    measurementId: "G-BNG4WDH4RP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateFieldsFormat() {
  try {
    console.log('Starting migration of fields format...');

    // Get all fields
    const fieldsRef = collection(db, 'fields');
    const fieldsSnapshot = await getDocs(fieldsRef);
    const fields = fieldsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${fields.length} fields to process`);

    // Process each field
    for (const field of fields) {
      console.log(`Processing field: ${field.text} (${field.id})`);

      const updates = {};
      let needsUpdate = false;

      // If field has 'category' but no 'categoryId'
      if (field.category && !field.categoryId) {
        console.log(`Field ${field.id} has 'category' but no 'categoryId', updating...`);
        updates.categoryId = field.category;
        needsUpdate = true;
      }

      // If field has both 'category' and 'categoryId', ensure they match
      if (field.category && field.categoryId && field.category !== field.categoryId) {
        console.log(`Field ${field.id} has mismatched category IDs, fixing...`);
        updates.categoryId = field.category;
        needsUpdate = true;
      }

      // If updates are needed, apply them
      if (needsUpdate) {
        const fieldRef = doc(db, 'fields', field.id);
        await updateDoc(fieldRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        console.log(`Updated field ${field.id}`);
      } else {
        console.log(`No updates needed for field ${field.id}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Execute the migration
migrateFieldsFormat().then(() => {
  console.log('Migration completed');
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
