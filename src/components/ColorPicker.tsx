import React, { useState } from 'react';
import { Brush } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const presetColors = [
    { name: 'Bleu', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Rose', value: '#EC4899' },
    { name: 'Rouge', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Jaune', value: '#F59E0B' },
    { name: 'Vert', value: '#10B981' },
    { name: 'Émeraude', value: '#34D399' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Bleu clair', value: '#0EA5E9' },
    { name: 'Gris', value: '#6B7280' }
  ];

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onSelect(newColor);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-2">
        {presetColors.map(color => (
          <button
            key={color.value}
            onClick={() => onSelect(color.value)}
            className={`relative w-8 h-8 rounded-lg transition-transform hover:scale-110 focus:outline-none group overflow-hidden ${
              selectedColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
            }`}
            title={color.name}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: color.value }}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        ))}
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <Brush className="w-4 h-4" />
            Couleur personnalisée
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code hexadécimal
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="#000000"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
                <div
                  className="absolute right-3 top-2 w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: customColor }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}