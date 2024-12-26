import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Construire l'objet de configuration à partir des variables d'environnement
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

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

async function migrateSettings() {
  try {
    console.log('Starting settings migration...');

    // Get all theme settings
    const themeSnapshot = await db.collection('themeSettings').get();
    console.log(`Found ${themeSnapshot.size} theme settings to migrate`);

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = new Map();
    usersSnapshot.forEach(doc => {
      users.set(doc.id, doc.data());
    });

    console.log(`Found ${users.size} users to process`);

    // Migrate each theme setting to userSettings
    for (const themeDoc of themeSnapshot.docs) {
      const themeData = themeDoc.data();
      const userId = themeDoc.id;
      const user = users.get(userId);

      if (!user) {
        console.log(`No user found for theme settings ${userId}, skipping...`);
        continue;
      }

      console.log(`Migrating settings for user ${userId}`);

      try {
        // Get Firebase Auth user
        const authUser = await auth.getUser(userId);
        
        // Get existing user settings if any
        const userSettingsDoc = await db.collection('userSettings')
          .where('userId', '==', userId)
          .get();
        
        const existingUserSettings = userSettingsDoc.empty ? {} : userSettingsDoc.docs[0].data();

        // Merge all settings
        const updatedSettings = {
          ...existingUserSettings,
          userId,
          profile: {
            ...existingUserSettings.profile,
            displayName: authUser.displayName || user.displayName || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            photoURL: authUser.photoURL || user.photoURL || '',
            company: user.company || '',
            phone: user.phone || '',
            address: user.address || ''
          },
          theme: {
            ...existingUserSettings.theme,
            darkMode: themeData.darkMode || false,
            primaryColor: themeData.primaryColor || '#0066cc',
          },
          createdAt: existingUserSettings.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save merged settings
        await db.collection('userSettings').doc(userId).set(updatedSettings);
        
        // Delete old theme settings
        await themeDoc.ref.delete();

        console.log(`Successfully migrated settings for user ${userId}`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log(`Auth user not found for ${userId}, using only Firestore data`);
          // Continue with only Firestore data
          const updatedSettings = {
            ...existingUserSettings,
            userId,
            profile: {
              ...existingUserSettings.profile,
              displayName: user.displayName || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              photoURL: user.photoURL || '',
              company: user.company || '',
              phone: user.phone || '',
              address: user.address || ''
            },
            theme: {
              ...existingUserSettings.theme,
              darkMode: themeData.darkMode || false,
              primaryColor: themeData.primaryColor || '#0066cc',
            },
            createdAt: existingUserSettings.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await db.collection('userSettings').doc(userId).set(updatedSettings);
          await themeDoc.ref.delete();
          
          console.log(`Successfully migrated settings for user ${userId} (without auth data)`);
        } else {
          console.error(`Error processing user ${userId}:`, error);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Run migration
migrateSettings().then(() => {
  console.log('Migration script finished');
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
