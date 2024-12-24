import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitch() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-300 focus:outline-none
          ${isDark ? 'bg-blue-600' : 'bg-gray-400'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
            transition-transform duration-300
            ${isDark ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <span className="text-sm text-gray-200">
        {isDark ? 'Mode Sombre' : 'Mode Clair'}
      </span>
    </div>
  );
}