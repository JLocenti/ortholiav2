const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
  }
];

async function initializeFields() {
  try {
    // Supprimer tous les fields existants
    const fieldsSnapshot = await db.collection('fields').get();
    const batch = db.batch();
    fieldsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Ajouter les nouveaux fields
    for (const field of initialFields) {
      await db.collection('fields').add(field);
    }

    console.log('Fields initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing fields:', error);
    process.exit(1);
  }
}

initializeFields();
