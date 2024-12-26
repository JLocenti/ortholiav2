import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import { ThemeSettings } from '../../types/theme';

export class ThemeService {
  private static instance: ThemeService | null = null;

  private constructor() {}

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  async getThemeSettings(): Promise<ThemeSettings | null> {
    try {
      const { currentUser } = getAuth();
      if (!currentUser) {
        throw new Error('User must be authenticated to get theme settings');
      }

      const docRef = doc(db, 'themeSettings', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ThemeSettings;
      }
      
      // Return default settings if none exist
      const defaultSettings: ThemeSettings = {
        isDark: true,
        themeColor: '#3B82F6',
        updatedAt: new Date()
      };
      
      await this.updateThemeSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error getting theme settings:', error);
      return null;
    }
  }

  async updateThemeSettings(settings: ThemeSettings): Promise<void> {
    try {
      const { currentUser } = getAuth();
      if (!currentUser) {
        throw new Error('User must be authenticated to update theme settings');
      }

      const docRef = doc(db, 'themeSettings', currentUser.uid);
      await setDoc(docRef, {
        ...settings,
        userId: currentUser.uid,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating theme settings:', error);
      throw error;
    }
  }
}

export const themeService = ThemeService.getInstance();