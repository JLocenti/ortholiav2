import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import NavigationHeader from '../components/NavigationHeader';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { currentUser } = useAuth();
  const { isDark, toggleTheme, themeColor, setThemeColor } = useTheme();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleColorSelect = (color: string) => {
    setThemeColor(color);
    setShowColorPicker(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <NavigationHeader title="Paramètres" />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Profil
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Email: {currentUser.email}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Thème
            </h2>
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {isDark ? 'Mode Clair' : 'Mode Sombre'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}