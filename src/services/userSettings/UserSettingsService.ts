import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Firestore 
} from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';
import { db } from '../../config/firebase';

export interface UserTheme {
  darkMode: boolean;
  primaryColor: string;
}

export interface UserProfile {
  displayName?: string;
  photoURL?: string;
  company?: string;
  address?: string;
}

export interface UserSettings {
  userId: string;
  theme: UserTheme;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

class UserSettingsService {
  private static instance: UserSettingsService | null = null;
  private db: Firestore;
  private readonly COLLECTION_NAME = 'userSettings';

  private constructor() {
    this.db = db;
  }

  static getInstance(): UserSettingsService {
    if (!UserSettingsService.instance) {
      UserSettingsService.instance = new UserSettingsService();
    }
    return UserSettingsService.instance;
  }

  async getUserSettings(): Promise<UserSettings | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('No authenticated user');
      return null;
    }

    const docRef = doc(this.db, this.COLLECTION_NAME, user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Create default settings if none exist
      const defaultSettings: UserSettings = {
        userId: user.uid,
        theme: {
          darkMode: false,
          primaryColor: '#0066cc'
        },
        profile: {
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.updateUserSettings(defaultSettings);
      return defaultSettings;
    }

    return docSnap.data() as UserSettings;
  }

  subscribeToUserSettings(callback: (settings: UserSettings | null) => void) {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('No authenticated user for subscription');
      callback(null);
      return () => {};
    }

    const docRef = doc(this.db, this.COLLECTION_NAME, user.uid);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserSettings);
      } else {
        this.getUserSettings().then(settings => callback(settings));
      }
    }, (error) => {
      console.error('Error in user settings subscription:', error);
      callback(null);
    });
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const docRef = doc(this.db, this.COLLECTION_NAME, user.uid);
    const currentSettings = await this.getUserSettings();
    
    const updatedSettings: UserSettings = {
      ...(currentSettings || {
        userId: user.uid,
        theme: {
          darkMode: false,
          primaryColor: '#0066cc'
        },
        profile: {},
        createdAt: new Date().toISOString(),
      }),
      ...settings,
      updatedAt: new Date().toISOString()
    } as UserSettings;

    // Update Firebase Auth profile if relevant fields are present
    if (settings.profile) {
      const { displayName, photoURL } = settings.profile;
      if (displayName !== undefined || photoURL !== undefined) {
        await updateProfile(user, {
          displayName: displayName || user.displayName || null,
          photoURL: photoURL || user.photoURL || null
        });
      }
    }

    await setDoc(docRef, updatedSettings);
  }

  async updateTheme(theme: Partial<UserTheme>): Promise<void> {
    await this.updateUserSettings({
      theme: {
        ...(await this.getUserSettings()).theme,
        ...theme
      }
    });
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    await this.updateUserSettings({
      profile: {
        ...(await this.getUserSettings()).profile,
        ...profile
      }
    });
  }
}

export const userSettingsService = UserSettingsService.getInstance();
