import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Vérifier que toutes les variables d'environnement nécessaires sont présentes
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function migrateSettings(email, password) {
  try {
    console.log('Signing in...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Successfully signed in');

    console.log('Starting settings migration...');

    // Get all theme settings
    const themeSettingsRef = collection(db, 'themeSettings');
    const themeSnapshot = await getDocs(themeSettingsRef);
    
    console.log(`Found ${themeSnapshot.size} theme settings to migrate`);

    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
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

      // Get existing user settings if any
      const userSettingsRef = doc(db, 'userSettings', userId);
      const userSettingsQuery = query(collection(db, 'userSettings'), where('userId', '==', userId));
      const userSettingsSnapshot = await getDocs(userSettingsQuery);
      const existingUserSettings = userSettingsSnapshot.docs[0]?.data() || {};

      // Get current auth user
      const currentUser = auth.currentUser;
      
      // Merge all settings
      const updatedSettings = {
        ...existingUserSettings,
        userId,
        profile: {
          ...existingUserSettings.profile,
          displayName: currentUser?.displayName || user.displayName || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          photoURL: currentUser?.photoURL || user.photoURL || '',
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
      await setDoc(userSettingsRef, updatedSettings);
      
      // Delete old theme settings
      await deleteDoc(themeDoc.ref);

      console.log(`Successfully migrated settings for user ${userId}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Check if email and password are provided as command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Please provide email and password as arguments:');
  console.error('node migrate-user-settings-auth.mjs <email> <password>');
  process.exit(1);
}

// Run migration
migrateSettings(email, password).then(() => {
  console.log('Migration script finished');
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
