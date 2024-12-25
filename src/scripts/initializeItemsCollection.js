import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

async function initializeItemsCollection() {
  try {
    console.log('Initializing items collection...');
    
    // Create a reference to the items collection
    const itemsCollection = collection(db, 'items');
    
    // Create a new document with a sample field
    const newDoc = doc(itemsCollection);
    
    // Initialize with a sample item
    await setDoc(newDoc, {
      id: newDoc.id,
      type: 'field',
      category: 'fields',
      text: 'Sample Field',
      description: 'This is a sample field to initialize the items collection',
      fieldType: 'text',
      required: false,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Items collection initialized successfully');
    console.log('Created document with ID:', newDoc.id);
    
  } catch (error) {
    console.error('Error initializing items collection:', error);
    throw error;
  }
}

initializeItemsCollection().then(() => {
  console.log('Initialization script finished');
  process.exit(0);
}).catch(error => {
  console.error('Initialization failed:', error);
  process.exit(1);
});
