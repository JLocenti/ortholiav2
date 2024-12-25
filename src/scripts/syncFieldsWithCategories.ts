import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  Query,
  or 
} from 'firebase/firestore';
import { Category } from '../types/category';
import { Field } from '../types/field';

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

interface FieldOrder {
  id: string;
  order: number;
}

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
    })) as Category[];

    console.log(`Found ${categories.length} categories`);

    // For each category, find its fields and update the category
    for (const category of categories) {
      console.log(`Processing category: ${category.name} (${category.id})`);

      // Get all fields for this category using both category and categoryId fields
      const fieldsQuery = query(
        fieldsRef,
        or(
          where('categoryId', '==', category.id),
          where('category', '==', category.id)
        )
      );

      const fieldsSnapshot = await getDocs(fieldsQuery);
      const fields = fieldsSnapshot.docs;

      // Sort fields by order if available
      const sortedFields = fields.sort((a, b) => {
        const orderA = a.data().order || 0;
        const orderB = b.data().order || 0;
        return orderA - orderB;
      });

      const fieldIds = sortedFields.map(doc => doc.id);
      const fieldsOrder: FieldOrder[] = sortedFields.map((doc, index) => ({
        id: doc.id,
        order: index
      }));

      console.log(`Found ${fieldIds.length} fields for category ${category.name}`);

      // Update the category with both fields and fieldsOrder
      const categoryRef = doc(db, 'categories', category.id);
      await updateDoc(categoryRef, {
        fields: fieldIds,
        fieldsOrder: fieldsOrder,
        updatedAt: new Date().toISOString()
      });

      console.log(`Updated category ${category.name} with ${fieldIds.length} fields and their order`);

      // Also update each field to ensure it uses categoryId
      for (const fieldDoc of sortedFields) {
        const fieldData = fieldDoc.data();
        if (fieldData.category !== undefined) {
          console.log(`Updating field ${fieldDoc.id} to use categoryId`);
          await updateDoc(doc(db, 'fields', fieldDoc.id), {
            categoryId: category.id,
            category: null,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    console.log('Synchronization completed successfully');
  } catch (error) {
    console.error('Error during synchronization:', error);
    throw error;
  }
}

// Auto-exécution avec gestion des erreurs
syncFieldsWithCategories()
  .catch((error: Error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Script terminé');
    process.exit(0);
  });
