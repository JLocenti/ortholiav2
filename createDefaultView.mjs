import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPPXfEKSBXPOIbXOBTXXFpzQJPdvLrXHU",
  authDomain: "ortholia-v4.firebaseapp.com",
  projectId: "ortholia-v4",
  storageBucket: "ortholia-v4.appspot.com",
  messagingSenderId: "1012990305390",
  appId: "1:1012990305390:web:6c6d2c3d0b1f7c2f7f4c4f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Default fields
const defaultFields = [
  { id: 'firstName', text: 'Prénom' },
  { id: 'lastName', text: 'Nom' },
  { id: 'birthDate', text: 'Date de naissance' },
  { id: 'email', text: 'Email' },
  { id: 'phone', text: 'Téléphone' }
];

async function createDefaultView() {
  try {
    const viewPrefsCollection = collection(db, 'viewPreferences');
    
    // Create default columns from fields
    const defaultColumns = defaultFields.map((field, index) => ({
      id: field.id,
      visible: true,
      order: index
    }));

    // Create the default view
    await addDoc(viewPrefsCollection, {
      name: 'Accueil',
      icon: 'Home',
      columns: defaultColumns,
      isDefault: true,
      settings: {
        showLastModified: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Default view created successfully');
  } catch (error) {
    console.error('Error creating default view:', error);
  }
}

createDefaultView();
