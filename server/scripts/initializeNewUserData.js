import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

// Initialize Firebase Admin with environment variables
const serviceAccount = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function copyDefaultDocuments(collectionName, newUserId) {
  console.log(`Copying default ${collectionName} for user ${newUserId}...`);
  try {
    // Récupérer tous les documents par défaut
    const snapshot = await db.collection(collectionName)
      .where('isDefault', '==', true)
      .get();

    console.log(`Found ${snapshot.size} default ${collectionName} to copy`);
    
    const batch = db.batch();
    let batchCount = 0;
    const batches = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Créer un nouveau document avec les données modifiées
      const newDocRef = db.collection(collectionName).doc();
      const newData = {
        ...data,
        userId: newUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Supprimer isDefault du nouveau document
      delete newData.isDefault;
      
      batch.set(newDocRef, newData);
      batchCount++;
      console.log(`Preparing to copy ${collectionName} document ${doc.id}`);
      
      if (batchCount === 500) {
        batches.push(batch.commit());
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      batches.push(batch.commit());
    }
    
    await Promise.all(batches);
    console.log(`Successfully copied all default ${collectionName}`);
  } catch (error) {
    console.error(`Error copying default ${collectionName}:`, error);
    throw error;
  }
}

async function initializeNewUserData(newUserId) {
  if (!newUserId) {
    throw new Error('User ID is required');
  }

  console.log(`Initializing data for new user: ${newUserId}`);
  
  try {
    // Copier les catégories par défaut
    await copyDefaultDocuments('categories', newUserId);
    
    // Copier les champs par défaut
    await copyDefaultDocuments('fields', newUserId);
    
    // Copier les vues par défaut
    await copyDefaultDocuments('viewPreferences', newUserId);
    
    console.log('Successfully initialized all default data for new user');
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
}

// Pour tester avec un ID utilisateur spécifique
// initializeNewUserData('test_user_id');

// Exporter la fonction pour l'utiliser dans d'autres fichiers
export { initializeNewUserData };
