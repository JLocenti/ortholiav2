#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateToNewStructure() {
  try {
    console.log('Starting migration...');

    // 1. Migrer les items vers fields
    console.log('Migrating items to fields...');
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    const fields = [];

    for (const itemDoc of itemsSnapshot.docs) {
      const item = itemDoc.data();
      console.log('Processing item:', item);

      const field = {
        id: item.id || itemDoc.id,
        name: item.text || '',
        type: item.fieldType || item.type || 'text',
        choices: item.choices || [],
        required: item.required || false,
        order: item.order || 0,
        categoryId: item.category || 'general',  // Catégorie par défaut
        description: item.description || ''
      };

      console.log('Created field:', field);

      // Créer le nouveau document dans la collection fields
      await setDoc(doc(db, 'fields', field.id), field);
      fields.push(field);
      console.log(`Migrated field: ${field.name}`);
    }

    // 2. Migrer les valeurs des patients
    console.log('Migrating patient values...');
    const patientsSnapshot = await getDocs(collection(db, 'patients'));
    const patientItemsSnapshot = await getDocs(collection(db, 'patientItems'));

    // Créer un map des valeurs par patient
    const patientValuesMap = {};
    patientItemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!patientValuesMap[data.patientId]) {
        patientValuesMap[data.patientId] = {};
      }
      if (data.value !== undefined && data.value !== null) {
        patientValuesMap[data.patientId][data.itemId] = data.value;
      }
    });

    // Mettre à jour chaque patient avec ses valeurs
    for (const patientDoc of patientsSnapshot.docs) {
      const patient = patientDoc.data();
      const patientId = patientDoc.id;
      const values = patientValuesMap[patientId] || {};

      const updatedPatient = {
        ...patient,
        values: values,
        updatedAt: new Date().toISOString()
      };

      delete updatedPatient.items; // Supprimer l'ancien champ items s'il existe

      await setDoc(doc(db, 'patients', patientId), updatedPatient);
      console.log(`Updated patient: ${patient.fileNumber || patientId}`);
    }

    // 3. Nettoyer les anciennes données
    console.log('Cleaning up old data...');
    const patientItemsCollection = collection(db, 'patientItems');
    const itemsCollection = collection(db, 'items');

    // Supprimer tous les documents de patientItems
    for (const doc of patientItemsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Supprimer tous les documents de items
    for (const doc of itemsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Exécuter la migration
migrateToNewStructure().then(() => {
  console.log('Migration script finished');
  process.exit(0);
}).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
