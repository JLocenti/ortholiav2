import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

async function checkAuth(email: string, password: string) {
  try {
    // 1. Test de connexion
    console.log('1. Test de connexion...');
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Connexion réussie');
    console.log('ID utilisateur:', userCredential.user.uid);
    
    // 2. Vérification des documents
    console.log('\n2. Vérification des documents...');
    const collections = [
      'categories',
      'fields',
      'patients',
      'practitioners',
      'themeSettings',
      'userSettings',
      'viewPreferences'
    ];
    
    for (const collectionName of collections) {
      console.log(`\nCollection: ${collectionName}`);
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      if (querySnapshot.empty) {
        console.log('❌ Collection vide');
        continue;
      }
      
      // Afficher les userId de chaque document
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`Document ${doc.id}:`);
        console.log('- userId:', data.userId);
      });
    }
    
  } catch (error: any) {
    console.error('Erreur:', error.message);
    if (error.code) {
      console.error('Code erreur:', error.code);
    }
  }
}

// Pour utiliser le script:
// import { checkAuth } from './scripts/checkAuth';
// checkAuth('votre@email.com', 'votreMotDePasse');
