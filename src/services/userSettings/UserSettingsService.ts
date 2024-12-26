import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Firestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';
import { db } from '../../config/firebase';

export interface UserTheme {
  darkMode: boolean;
  primaryColor: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  photoURL?: string;
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

  private async createDefaultSettings(
    userId: string, 
    firstName: string = '', 
    lastName: string = '', 
    email: string = '',
    additionalProfileData: Partial<UserProfile> = {}
  ): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      userId,
      theme: {
        darkMode: false,
        primaryColor: '#4F46E5'
      },
      profile: {
        firstName,
        lastName,
        email,
        company: '',
        phone: '',
        address: '',
        photoURL: '',
        ...additionalProfileData
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(this.db, this.COLLECTION_NAME, userId);
    await setDoc(docRef, defaultSettings);

    return defaultSettings;
  }

  async getUserSettings(): Promise<UserSettings | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('No authenticated user');
      return null;
    }

    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Créer des paramètres par défaut avec toutes les données disponibles
        return this.createDefaultSettings(user.uid, user.displayName?.split(' ')[0] || '', user.displayName?.split(' ')[1] || '', user.email);
      }

      const settings = docSnap.data() as UserSettings;
      
      // Vérifier que les paramètres appartiennent bien à l'utilisateur actuel
      if (settings.userId !== user.uid) {
        console.warn('User settings mismatch, creating new default settings');
        return this.createDefaultSettings(user.uid, user.displayName?.split(' ')[0] || '', user.displayName?.split(' ')[1] || '', user.email);
      }

      // S'assurer qu'aucun champ n'est undefined
      settings.profile = {
        firstName: settings.profile?.firstName || '',
        lastName: settings.profile?.lastName || '',
        email: user.email || settings.profile?.email || '',
        company: settings.profile?.company || '',
        phone: settings.profile?.phone || '',
        address: settings.profile?.address || '',
        photoURL: user.photoURL || settings.profile?.photoURL || ''
      };

      return settings;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return null;
    }
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
    
    return onSnapshot(docRef, async (doc) => {
      if (doc.exists()) {
        const settings = doc.data() as UserSettings;
        
        // Vérifier que les paramètres appartiennent bien à l'utilisateur actuel
        if (settings.userId === user.uid) {
          callback(settings);
        } else {
          const newSettings = await this.createDefaultSettings(user.uid, user.displayName?.split(' ')[0] || '', user.displayName?.split(' ')[1] || '', user.email);
          callback(newSettings);
        }
      } else {
        const newSettings = await this.createDefaultSettings(user.uid, user.displayName?.split(' ')[0] || '', user.displayName?.split(' ')[1] || '', user.email);
        callback(newSettings);
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

    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, user.uid);
      const docSnap = await getDoc(docRef);
      
      let baseSettings: UserSettings;
      if (!docSnap.exists()) {
        baseSettings = await this.createDefaultSettings(user.uid, user.displayName?.split(' ')[0] || '', user.displayName?.split(' ')[1] || '', user.email);
      } else {
        baseSettings = docSnap.data() as UserSettings;
      }

      const updatedSettings: UserSettings = {
        ...baseSettings,
        ...settings,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, updatedSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  async updateTheme(theme: Partial<UserTheme>): Promise<void> {
    const currentSettings = await this.getUserSettings();
    if (!currentSettings) {
      throw new Error('No user settings found');
    }

    await this.updateUserSettings({
      theme: {
        ...currentSettings.theme,
        ...theme
      }
    });
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Mettre à jour le profil Firebase Auth si nécessaire
    if (profile.firstName || profile.lastName || profile.photoURL) {
      await updateProfile(user, {
        displayName: `${profile.firstName} ${profile.lastName}`,
        photoURL: profile.photoURL
      });
    }

    const currentSettings = await this.getUserSettings();
    if (!currentSettings) {
      throw new Error('No user settings found');
    }

    await this.updateUserSettings({
      profile: {
        ...currentSettings.profile,
        ...profile
      }
    });
  }
}

export const userSettingsService = UserSettingsService.getInstance();
