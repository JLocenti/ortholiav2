import React, { useState, useRef } from 'react';
import { Moon, Sun, Palette, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import EmailChangeForm from '../components/EmailChangeForm';
import ColorPicker from '../components/ColorPicker';
import NavigationHeader from '../components/NavigationHeader';

export default function Settings() {
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { currentUser, updateUserProfile } = useAuth();
  const { isDark, toggleTheme, themeColor, setThemeColor } = useTheme();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleProfileUpdate = async (field: string, value: string) => {
    try {
      await updateUserProfile({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [field]: 'Erreur lors de la mise à jour' }));
    }
  };

  const handleColorSelect = (color: string) => {
    setThemeColor(color);
    setShowColorPicker(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convertir le fichier en Data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          await updateUserProfile({ photo: reader.result });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrors(prev => ({ ...prev, photo: 'Erreur lors de la mise à jour de la photo' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <NavigationHeader title="Paramètres" />

      {/* Profil */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <User className="w-5 h-5" />
          Profil
        </h2>

        <div className="space-y-6">
          {/* Photo de profil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photo de profil
            </label>
            <div className="flex items-center gap-4">
              <div 
                className="relative cursor-pointer group"
                onClick={handlePhotoClick}
              >
                <img
                  src={currentUser.photo}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover transition-opacity group-hover:opacity-75"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                    Modifier
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
            {errors.photo && (
              <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
            )}
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={currentUser.firstName}
                onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={currentUser.lastName}
                onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="flex gap-4">
              <input
                type="email"
                value={currentUser.email}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              />
              <button
                onClick={() => setShowEmailChangeModal(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Changer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apparence */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5" />
          Apparence
        </h2>

        <div className="space-y-6">
          {/* Mode sombre */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mode sombre
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isDark ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Couleur du thème */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Couleur du thème
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Bleu', value: '#3B82F6' },
                { name: 'Violet', value: '#8B5CF6' },
                { name: 'Rose', value: '#EC4899' },
                { name: 'Orange', value: '#F97316' },
                { name: 'Vert', value: '#22C55E' }
              ].map(color => (
                <button
                  key={color.value}
                  onClick={() => setThemeColor(color.value)}
                  className={`relative w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none group overflow-hidden ${
                    themeColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
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
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEmailChangeModal}
        onClose={() => setShowEmailChangeModal(false)}
        title="Changer d'adresse email"
      >
        <EmailChangeForm onClose={() => setShowEmailChangeModal(false)} />
      </Modal>

      <Modal
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        title="Choisir une couleur personnalisée"
      >
        <ColorPicker
          selectedColor={themeColor}
          onSelect={handleColorSelect}
        />
      </Modal>
    </div>
  );
}