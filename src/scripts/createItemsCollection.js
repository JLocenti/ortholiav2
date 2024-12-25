import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

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

async function createItemsCollection() {
  try {
    console.log('Creating items collection...');
    
    // Create a reference to the items collection
    const itemsCollection = collection(db, 'items');
    
    // Create a new document
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

    console.log('Items collection created successfully');
    console.log('Created document with ID:', newDoc.id);
    
  } catch (error) {
    console.error('Error creating items collection:', error);
    throw error;
  }
}

createItemsCollection().then(() => {
  console.log('Creation script finished');
  process.exit(0);
}).catch(error => {
  console.error('Creation failed:', error);
  process.exit(1);
});
