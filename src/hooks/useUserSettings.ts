import { useState, useEffect } from 'react';
import { userSettingsService, UserSettings, UserTheme, UserProfile } from '../services/userSettings/UserSettingsService';
import { getAuth } from 'firebase/auth';

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeSettings = async () => {
      setLoading(true);
      try {
        // Attendre que l'utilisateur soit authentifié
        if (!auth.currentUser) {
          setSettings(null);
          return;
        }

        // Charger les paramètres initiaux
        const initialSettings = await userSettingsService.getUserSettings();
        setSettings(initialSettings);

        // S'abonner aux changements
        unsubscribe = userSettingsService.subscribeToUserSettings((newSettings) => {
          setSettings(newSettings);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error initializing settings:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    initializeSettings();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth.currentUser]);

  const updateTheme = async (theme: Partial<UserTheme>) => {
    try {
      setError(null);
      await userSettingsService.updateTheme(theme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      setError(null);
      await userSettingsService.updateProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateTheme,
    updateProfile
  };
}
