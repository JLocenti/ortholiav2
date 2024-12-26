import React, { useState, useEffect, useRef } from 'react';
import { Mail, User, Building, Phone, MapPin, Upload } from 'lucide-react';
import { useUserSettings } from '../../hooks/useUserSettings';
import { UserProfile, UserTheme } from '../../services/userSettings/UserSettingsService';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

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

  useEffect(() => {
    if (settings) {
      setProfile(settings.profile || {});
      setTheme(settings.theme || { darkMode: false, primaryColor: '#0066cc' });
    }
  }, [settings]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked } = e.target;
    setTheme(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : prev[name]
    }));
  };

  const handleColorSelect = (color: string) => {
    setTheme(prev => ({
      ...prev,
      primaryColor: color
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setError(null);

    try {
      const storage = getStorage();
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      
      if (!userId) throw new Error('Utilisateur non connecté');

      const photoRef = ref(storage, `profile-photos/${userId}/${file.name}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);

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
    try {
      await updateProfile(profile);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  const handleThemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTheme(theme);
    } catch (err) {
      console.error('Error updating theme:', err);
      setError('Erreur lors de la mise à jour du thème');
    }
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Profil</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Photo */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={profile.photoURL || '/default-avatar.png'}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadLoading ? 'Upload en cours...' : 'Changer la photo'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prénom *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="firstName"
                  required
                  value={profile.firstName || ''}
                  onChange={handleProfileChange}
                  placeholder="Votre prénom"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="lastName"
                  required
                  value={profile.lastName || ''}
                  onChange={handleProfileChange}
                  placeholder="Votre nom"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Entreprise
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="company"
                  value={profile.company || ''}
                  onChange={handleProfileChange}
                  placeholder="Nom de votre entreprise"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Building className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Téléphone
              </label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleProfileChange}
                  placeholder="Votre numéro de téléphone"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Address */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="address"
                  value={profile.address || ''}
                  onChange={handleProfileChange}
                  placeholder="Votre adresse"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Enregistrer le profil
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Thème</h2>
        <form onSubmit={handleThemeSubmit} className="space-y-4">
          <div className="flex items-center mb-4">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                name="darkMode"
                checked={theme.darkMode}
                onChange={handleThemeChange}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2">Mode sombre</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleur principale
            </label>
            <div className="flex space-x-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    theme.primaryColor === color ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Enregistrer le thème
          </button>
        </form>
      </div>
    </div>
  );
}
