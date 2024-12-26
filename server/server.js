import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
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

// Route pour initialiser un nouvel utilisateur
app.post('/api/initialize-user', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Copier les documents par défaut pour le nouvel utilisateur
    async function copyDefaultDocuments(collectionName) {
      console.log(`Copying default ${collectionName} for user ${userId}...`);
      const snapshot = await db.collection(collectionName)
        .where('isDefault', '==', true)
        .get();

      const batch = db.batch();
      snapshot.forEach(doc => {
        const data = doc.data();
        const newDocRef = db.collection(collectionName).doc();
        const newData = {
          ...data,
          isDefault: false,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        batch.set(newDocRef, newData);
      });

      await batch.commit();
      console.log(`Finished copying ${collectionName}`);
    }

    // Copier les documents par défaut pour chaque collection
    await copyDefaultDocuments('categories');
    await copyDefaultDocuments('fields');
    await copyDefaultDocuments('questions');

    res.json({ success: true });
  } catch (error) {
    console.error('Error initializing user data:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
