import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

async function updatePatientsUserId() {
  try {
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);
    
    console.log(`Found ${snapshot.size} patients`);
    
    for (const docSnapshot of snapshot.docs) {
      const patientData = docSnapshot.data();
      console.log(`Patient ${docSnapshot.id}:`, patientData);
      
      // Si le patient n'a pas de userId, on peut soit :
      // 1. L'assigner à un utilisateur spécifique
      // 2. Le supprimer
      // 3. Le marquer comme "legacy"
      
      if (!patientData.userId) {
        console.log(`Patient ${docSnapshot.id} n'a pas de userId`);
        // Décommenter et modifier la ligne suivante pour assigner les patients à un utilisateur spécifique
        // await updateDoc(doc(db, 'patients', docSnapshot.id), { userId: 'USER_ID_HERE' });
      }
    }
    
    console.log('Mise à jour terminée');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des patients:', error);
  }
}

updatePatientsUserId();
