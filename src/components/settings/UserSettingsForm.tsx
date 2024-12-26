import React, { useState, useEffect, useRef } from 'react';
import { Mail, User, Building, Phone, MapPin, Upload } from 'lucide-react';
import { useUserSettings } from '../../hooks/useUserSettings';
import { UserProfile, UserTheme } from '../../services/userSettings/UserSettingsService';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, updateProfile as updateAuthProfile } from 'firebase/auth';
import { Switch } from '../ui/switch';

const THEME_COLORS = [
  '#0066cc', // Bleu Ortholia
  '#6B21A8', // Violet
  '#059669', // Vert émeraude
  '#DC2626', // Rouge
  '#D97706'  // Orange
];

export default function UserSettingsForm() {
  const { settings, loading, updateProfile, updateTheme } = useUserSettings();
  const [profile, setProfile] = useState<UserProfile>({});
  const [theme, setTheme] = useState<UserTheme>({
    darkMode: false,
    primaryColor: '#0066cc'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    // Toujours initialiser avec les données de Firebase Auth
    const user = auth.currentUser;
    if (user) {
      const [firstName = '', lastName = ''] = (user.displayName || '').split(' ');
      setProfile({
        firstName,
        lastName,
        email: user.email || '',
        photoURL: user.photoURL || '',
        ...(settings?.profile || {})
      });
      setTheme(settings?.theme || { darkMode: false, primaryColor: '#0066cc' });
    }
  }, [settings, auth.currentUser]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleDarkModeToggle = async (checked: boolean) => {
    const newTheme = { ...theme, darkMode: checked };
    setTheme(newTheme);
    try {
      await updateTheme(newTheme);
    } catch (err) {
      console.error('Error updating theme:', err);
      setError('Erreur lors de la mise à jour du thème');
    }
  };

  const handleColorSelect = async (color: string) => {
    const newTheme = { ...theme, primaryColor: color };
    setTheme(newTheme);
    try {
      await updateTheme(newTheme);
      document.documentElement.style.setProperty('--theme-color', color);
    } catch (err) {
      console.error('Error updating theme color:', err);
      setError('Erreur lors de la mise à jour de la couleur du thème');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setError(null);

    try {
      const storage = getStorage();
      const userId = auth.currentUser?.uid;
      
      if (!userId) throw new Error('Utilisateur non connecté');

      const photoRef = ref(storage, `profile-photos/${userId}/${file.name}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);

      // Mettre à jour Firebase Auth et les paramètres utilisateur
      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, { photoURL });
      }
      await updateProfile({ ...profile, photoURL });
      setProfile(prev => ({ ...prev, photoURL }));
    } catch (err) {
      console.error('Erreur lors de l\'upload de la photo:', err);
      setError('Erreur lors de l\'upload de la photo. Veuillez réessayer.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Mettre à jour Firebase Auth
      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, {
          displayName: `${profile.firstName} ${profile.lastName}`,
          photoURL: profile.photoURL
        });
      }
      // Mettre à jour les paramètres utilisateur
      await updateProfile(profile);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Section Thème */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Thème</h2>
        
        <div className="space-y-6">
          {/* Mode Sombre Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Mode Sombre
            </label>
            <Switch
              checked={theme.darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          {/* Sélecteur de Couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Couleur du Thème
            </label>
            <div className="flex gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    theme.primaryColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Sélectionner la couleur ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section Profil */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Profil</h2>
        
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo de profil */}
            <div className="col-span-full flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profile.photoURL || '/default-avatar.png'}
                  alt="Photo de profil"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Changer la photo
              </button>
              {uploadLoading && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>}
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Prénom *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName || ''}
                  onChange={handleProfileChange}
                  required
                  placeholder="Votre prénom"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nom *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName || ''}
                  onChange={handleProfileChange}
                  required
                  placeholder="Votre nom"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email *
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  name="email"
                  value={profile.email || ''}
                  onChange={handleProfileChange}
                  required
                  placeholder="nom@exemple.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Entreprise
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="company"
                  value={profile.company || ''}
                  onChange={handleProfileChange}
                  placeholder="Nom de votre entreprise"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Building className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Téléphone
              </label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleProfileChange}
                  placeholder="Votre numéro de téléphone"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Adresse */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Adresse
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="address"
                  value={profile.address || ''}
                  onChange={handleProfileChange}
                  placeholder="Votre adresse"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}
