import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EmailChangeFormProps {
  onClose: () => void;
}

type Step = 'password' | 'new-email' | 'verify-old' | 'verify-new' | 'complete';

export default function EmailChangeForm({ onClose }: EmailChangeFormProps) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<Step>('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    newEmail: '',
    oldEmailCode: '',
    newEmailCode: ''
  });

  const handlePasswordVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ici, vérifier le mot de passe avec Firebase
      // await verifyPassword(formData.password);
      setStep('new-email');
    } catch (err) {
      setError('Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEmailSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Vérifier si l'email est déjà utilisé
      // await checkEmailAvailability(formData.newEmail);
      
      // Envoyer les codes de vérification
      // await sendVerificationCodes(currentUser.email, formData.newEmail);
      
      setStep('verify-old');
    } catch (err) {
      setError('Cette adresse email est déjà utilisée');
    } finally {
      setLoading(false);
    }
  };

  const handleOldEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Vérifier le code envoyé à l'ancienne adresse
      // await verifyOldEmailCode(formData.oldEmailCode);
      setStep('verify-new');
    } catch (err) {
      setError('Code de vérification incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Vérifier le code envoyé à la nouvelle adresse
      // await verifyNewEmailCode(formData.newEmailCode);
      
      // Mettre à jour l'email
      // await updateUserEmail(formData.newEmail);
      
      setStep('complete');
    } catch (err) {
      setError('Code de vérification incorrect');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'password':
        return (
          <form onSubmit={handlePasswordVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmez votre mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Continuer'
                )}
              </button>
            </div>
          </form>
        );

      case 'new-email':
        return (
          <form onSubmit={handleNewEmailSubmission} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouvelle adresse email
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  value={formData.newEmail}
                  onChange={e => setFormData(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('password')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Envoyer les codes'
                )}
              </button>
            </div>
          </form>
        );

      case 'verify-old':
        return (
          <form onSubmit={handleOldEmailVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code envoyé à {currentUser?.email}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={formData.oldEmailCode}
                  onChange={e => setFormData(prev => ({ ...prev, oldEmailCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('new-email')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Vérifier'
                )}
              </button>
            </div>
          </form>
        );

      case 'verify-new':
        return (
          <form onSubmit={handleNewEmailVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code envoyé à {formData.newEmail}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={formData.newEmailCode}
                  onChange={e => setFormData(prev => ({ ...prev, newEmailCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('verify-old')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmer le changement'
                )}
              </button>
            </div>
          </form>
        );

      case 'complete':
        return (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Email mis à jour avec succès
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Votre nouvelle adresse email est maintenant {formData.newEmail}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {renderStep()}
    </div>
  );
}