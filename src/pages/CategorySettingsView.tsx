import React from 'react';
import NavigationHeader from '../components/NavigationHeader';
import ResetDataButton from '../components/ResetDataButton';

export default function CategorySettingsView() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <NavigationHeader title="Gestion des Catégories" />
        <ResetDataButton />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Aucune catégorie définie
        </p>
      </div>
    </div>
  );
}