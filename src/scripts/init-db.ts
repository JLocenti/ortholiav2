import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAinUtEWeYx8eAZtcHFDcPSvaH0wHbxbX0",
  authDomain: "ortholia-144f3.firebaseapp.com",
  projectId: "ortholia-144f3",
  storageBucket: "ortholia-144f3.firebasestorage.app",
  messagingSenderId: "911841482671",
  appId: "1:911841482671:web:c9b7625d4d56a39665415a"
};

async function initDb() {
  console.log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    console.log('Creating items collection...');
    const itemsRef = collection(db, 'items');
    const docRef = doc(itemsRef);

    await setDoc(docRef, {
      id: docRef.id,
      type: 'field',
      category: 'fields',
      text: 'Initial Field',
      description: 'Initial field to create items collection',
      fieldType: 'text',
      required: false,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Successfully created items collection with initial document:', docRef.id);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initDb();
