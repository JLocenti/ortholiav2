import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

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
