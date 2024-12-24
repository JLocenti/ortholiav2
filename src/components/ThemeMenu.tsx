import React, { useRef, useEffect } from 'react';
import { Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const themeColors = [
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Vert', value: '#22C55E' }
];

export default function ThemeMenu({ isOpen, onClose }: ThemeMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme, themeColor, setThemeColor } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
      style={{ 
        position: 'fixed',
        zIndex: 9999,
        isolation: 'isolate'
      }}
    >
      <div className="relative p-4 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Mode</h3>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {isDark ? 'Mode sombre' : 'Mode clair'}
            </span>
            <div className={`w-8 h-4 rounded-full relative ${isDark ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`absolute w-3 h-3 rounded-full bg-white top-0.5 transition-all duration-200 ${isDark ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Couleur du thème</h3>
          <div className="grid grid-cols-5 gap-2">
            {themeColors.map(color => (
              <button
                key={color.value}
                onClick={() => setThemeColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 ${
                  themeColor === color.value ? 'border-blue-500 dark:border-blue-400' : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}