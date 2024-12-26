import { useState, useEffect } from 'react';
import { userSettingsService, UserSettings, UserTheme, UserProfile } from '../services/userSettings/UserSettingsService';

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = userSettingsService.subscribeToUserSettings((newSettings) => {
      setSettings(newSettings);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateTheme = async (theme: Partial<UserTheme>) => {
    try {
      await userSettingsService.updateTheme(theme);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      await userSettingsService.updateProfile(profile);
    } catch (err) {
      setError(err.message);
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
