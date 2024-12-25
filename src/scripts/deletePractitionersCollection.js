const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhqvFGJ_aHlHHD1oFpDiXtfmGZbkgTvWU",
  authDomain: "ortholia-v4.firebaseapp.com",
  projectId: "ortholia-v4",
  storageBucket: "ortholia-v4.appspot.com",
  messagingSenderId: "1093517699694",
  appId: "1:1093517699694:web:5e1a19a98e1f8e9e2f0a0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deletePractitionersCollection() {
  try {
    console.log('Starting deletion of practitioners collection...');
    
    // Get all documents from practitioners collection
    const practitionersCollection = collection(db, 'practitioners');
    const snapshot = await getDocs(practitionersCollection);
    
    // Delete each document
    for (const document of snapshot.docs) {
      console.log(`Deleting practitioner document: ${document.id}`);
      await deleteDoc(doc(db, 'practitioners', document.id));
    }
    
    console.log('Successfully deleted all practitioners documents');
  } catch (error) {
    console.error('Error deleting practitioners collection:', error);
    throw error;
  }
}

// Execute the deletion
deletePractitionersCollection();
