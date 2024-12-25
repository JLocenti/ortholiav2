import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

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

async function syncFieldsWithCategories() {
  try {
    console.log('Starting synchronization of fields with categories...');

    // First, check all fields
    const fieldsRef = collection(db, 'fields');
    const fieldsSnapshot = await getDocs(fieldsRef);
    console.log(`Total fields in database: ${fieldsSnapshot.size}`);
    
    // Log some sample fields to check their structure
    fieldsSnapshot.docs.slice(0, 3).forEach(doc => {
      console.log('Sample field:', {
        id: doc.id,
        ...doc.data()
      });
    });

    // Get all categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${categories.length} categories`);

    // For each category, find its fields and update the category
    for (const category of categories) {
      console.log(`Processing category: ${category.name} (${category.id})`);

      // Get all fields for this category
      const q = query(fieldsRef, where('categoryId', '==', category.id));
      const fieldsSnapshot = await getDocs(q);
      const fieldIds = fieldsSnapshot.docs.map(doc => doc.id);

      console.log(`Found ${fieldIds.length} fields for category ${category.name}`);

      // Update the category with the field IDs
      const categoryRef = doc(db, 'categories', category.id);
      await updateDoc(categoryRef, {
        fields: fieldIds,
        updatedAt: new Date().toISOString()
      });

      console.log(`Updated category ${category.name} with ${fieldIds.length} fields`);
    }

    console.log('Synchronization completed successfully');
  } catch (error) {
    console.error('Error during synchronization:', error);
    throw error;
  }
}

// Execute the migration
syncFieldsWithCategories().then(() => {
  console.log('Migration completed');
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
