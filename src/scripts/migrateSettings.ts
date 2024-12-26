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
import { config } from '../config/firebase';

// Initialize Firebase
initializeApp(config);
const db = getFirestore();

async function migrateSettings() {
  try {
    console.log('Starting settings migration...');

    // Get all theme settings
    const themeSettingsRef = collection(db, 'themeSettings');
    const themeSnapshot = await getDocs(themeSettingsRef);
    
    console.log(`Found ${themeSnapshot.size} theme settings to migrate`);

    // Migrate each theme setting to userSettings
    for (const themeDoc of themeSnapshot.docs) {
      const themeData = themeDoc.data();
      const userId = themeDoc.id; // Assuming the document ID is the userId

      console.log(`Migrating theme settings for user ${userId}`);

      // Get existing user settings if any
      const userSettingsRef = doc(db, 'userSettings', userId);
      const userSettingsQuery = query(collection(db, 'userSettings'), where('userId', '==', userId));
      const userSettingsSnapshot = await getDocs(userSettingsQuery);
      const existingUserSettings = userSettingsSnapshot.docs[0]?.data() || {};

      // Merge theme settings with user settings
      const updatedSettings = {
        ...existingUserSettings,
        userId,
        theme: {
          ...existingUserSettings.theme,
          darkMode: themeData.darkMode || false,
          primaryColor: themeData.primaryColor || '#0066cc',
        },
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
