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
import { getAuth, listUsers } from 'firebase/auth';
import { config } from '../config/firebase';

// Initialize Firebase
initializeApp(config);
const db = getFirestore();
const auth = getAuth();

async function migrateSettings() {
  try {
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

      // Merge all settings
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

// Run migration
migrateSettings().then(() => {
  console.log('Migration script finished');
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
