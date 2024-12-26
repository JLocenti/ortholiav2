import React from 'react';
import { useAuth } from '../context/AuthContext';
import NavigationHeader from '../components/NavigationHeader';
import UserSettingsForm from '../components/settings/UserSettingsForm';

export default function Settings() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <NavigationHeader title="Paramètres" />
      <UserSettingsForm />
    </div>
  );
}