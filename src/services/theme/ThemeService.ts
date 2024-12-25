import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
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

  async getThemeSettings(userId: string): Promise<ThemeSettings | null> {
    try {
      const docRef = doc(db, 'themeSettings', userId);
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
      
      await this.updateThemeSettings(userId, defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error getting theme settings:', error);
      return null;
    }
  }

  async updateThemeSettings(userId: string, settings: ThemeSettings): Promise<void> {
    try {
      const docRef = doc(db, 'themeSettings', userId);
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating theme settings:', error);
      throw error;
    }
  }
}

export const themeService = ThemeService.getInstance();