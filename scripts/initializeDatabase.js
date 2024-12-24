import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(
  await readFile(new URL('../serviceAccountKey.json', import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const initialFields = [
  {
    name: "Classe squelettique",
    category: "Diagnostic",
    type: "single",
    options: ["Classe I", "Classe II", "Classe III"]
  },
  {
    name: "Date de consultation",
    category: "Informations générales",
    type: "date"
  },
  {
    name: "Motif de consultation",
    category: "Informations générales",
    type: "text"
  },
  {
    name: "Symptômes",
    category: "Diagnostic",
    type: "multiple",
    options: ["Douleurs ATM", "Bruxisme", "Céphalées", "Troubles du sommeil"]
  },
  {
    name: "Traitement orthodontique",
    category: "Antécédents",
    type: "single",
    options: ["Oui", "Non"]
  },
  {
    name: "Notes",
    category: "Informations générales",
    type: "text"
  }
];

async function updatePatientStructure(patientId, patientData) {
  const updatedData = {
    fileNumber: patientData.fileNumber || '',
    practitionerId: patientData.practitioner || '',
    createdAt: patientData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return db.collection('patients').doc(patientId).update(updatedData);
}

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // 1. Créer la collection fields
    console.log('Creating fields...');
    const fieldsCollection = db.collection('fields');
    for (const field of initialFields) {
      await fieldsCollection.add(field);
    }
    console.log('Fields created successfully');

    // 2. Mettre à jour la structure des patients existants
    console.log('Updating existing patients...');
    const patientsSnapshot = await db.collection('patients').get();
    const updatePromises = patientsSnapshot.docs.map(doc => 
      updatePatientStructure(doc.id, doc.data())
    );
    await Promise.all(updatePromises);
    console.log('Patients updated successfully');

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
