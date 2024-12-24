import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateViewPreferences() {
  try {
    // 1. Récupérer tous les fields
    const fieldsCollection = collection(db, 'fields');
    const fieldsSnapshot = await getDocs(fieldsCollection);
    const fields = fieldsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 2. Récupérer toutes les vues existantes
    const viewPrefsCollection = collection(db, 'viewPreferences');
    const viewsSnapshot = await getDocs(viewPrefsCollection);
    const existingViews = viewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 3. Pour chaque vue existante
    for (const view of existingViews) {
      const columns = fields.map((field, index) => {
        // Chercher si une préférence existe déjà pour ce field
        const existingColumn = view.columns?.find(col => col.fieldId === field.id);
        
        return {
          fieldId: field.id,
          visible: existingColumn?.visible ?? true, // Garder la visibilité existante ou true par défaut
          order: existingColumn?.order ?? index // Garder l'ordre existant ou utiliser l'index
        };
      });

      // Mettre à jour la vue avec les colonnes complètes
      const viewRef = doc(db, 'viewPreferences', view.id);
      await updateDoc(viewRef, {
        columns,
        updatedAt: Timestamp.now()
      });
      
      console.log(`Updated view: ${view.name}`);
    }

    // 4. Si aucune vue n'existe, créer la vue par défaut
    if (existingViews.length === 0) {
      const defaultColumns = fields.map((field, index) => ({
        fieldId: field.id,
        visible: true,
        order: index
      }));

      const newView = await addDoc(viewPrefsCollection, {
        name: 'Accueil',
        icon: 'Home',
        columns: defaultColumns,
        isDefault: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('Created default view: Accueil');
    }

    console.log('ViewPreferences update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating viewPreferences:', error);
    process.exit(1);
  }
}

// Exécuter la mise à jour
updateViewPreferences();
