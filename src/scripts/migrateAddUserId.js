#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SUPER_ADMIN_ID = 'pu9kerKqjyUbalsUO1OfQNVwGui2';

async function migrateAddUserId() {
  try {
    console.log('Starting userId migration...');

    // Collections à mettre à jour
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
      console.log(`Processing collection: ${collectionName}`);
      const snapshot = await getDocs(collection(db, collectionName));
      
      for (const document of snapshot.docs) {
        const data = document.data();
        
        // Ajouter userId et mettre à jour updatedAt
        const updatedData = {
          ...data,
          userId: SUPER_ADMIN_ID,
          updatedAt: new Date().toISOString()
        };

        // Mettre à jour le document
        await setDoc(doc(db, collectionName, document.id), updatedData);
        console.log(`Updated document in ${collectionName}: ${document.id}`);
      }
      
      console.log(`Finished processing collection: ${collectionName}`);
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Exécuter la migration
migrateAddUserId()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
