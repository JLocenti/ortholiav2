import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Initialiser Firebase Admin
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

// Vérifier que toutes les variables d'environnement nécessaires sont présentes
const requiredEnvVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_CLIENT_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

// Vérifier les utilisateurs Firebase Auth
async function checkUsers() {
  console.log('\n1. Vérification des utilisateurs Firebase Auth:');
  try {
    const listUsersResult = await auth.listUsers();
    listUsersResult.users.forEach((userRecord) => {
      console.log('User:', userRecord.toJSON());
    });
  } catch (error) {
    console.log('Error listing users:', error);
  }
}

// Vérifier les documents Firestore
async function checkDocuments() {
  console.log('\n2. Vérification des documents Firestore:');
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
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log('Collection vide');
      continue;
    }

    snapshot.docs.forEach(doc => {
      console.log(`Document ${doc.id}:`);
      console.log(doc.data());
    });
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🔍 Début de la vérification...');
    
    await checkUsers();
    await checkDocuments();
    
    console.log('\n✅ Vérification terminée');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
main();
