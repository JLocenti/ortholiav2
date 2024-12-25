import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { themeService } from '../services/theme/ThemeService';
import type { ThemeSettings } from '../types/theme';

interface ThemeContextType {
  isDark: boolean;
  themeColor: string;
  toggleTheme: () => void;
  setThemeColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [themeColor, setThemeColorState] = useState(() => {
    return localStorage.getItem('themeColor') || '#3B82F6';
  });

  useEffect(() => {
    const loadThemeSettings = async () => {
      if (!currentUser?.id) return;

      try {
        const settings = await themeService.getThemeSettings(currentUser.id);
        if (settings) {
          setIsDark(settings.isDark);
          setThemeColorState(settings.themeColor);
          
          localStorage.setItem('theme', settings.isDark ? 'dark' : 'light');
          localStorage.setItem('themeColor', settings.themeColor);
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
      }
    };

    loadThemeSettings();
  }, [currentUser?.id]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.style.setProperty('--theme-color', themeColor);

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    localStorage.setItem('themeColor', themeColor);

    if (currentUser?.id) {
      const saveThemeSettings = async () => {
        try {
          const settings: ThemeSettings = {
            isDark,
            themeColor,
            updatedAt: new Date()
          };
          await themeService.updateThemeSettings(currentUser.id, settings);
        } catch (error) {
          console.error('Error saving theme settings:', error);
        }
      };
      saveThemeSettings();
    }
  }, [isDark, themeColor, currentUser?.id]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ isDark, themeColor, toggleTheme, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}