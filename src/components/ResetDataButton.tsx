import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { firestoreService } from '../services/firestore';
import Modal from './Modal';

export default function ResetDataButton() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await firestoreService.deleteAllData();
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error resetting data:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
      >
        <RefreshCw className="w-4 h-4" />
        Réinitialiser les données
      </button>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Réinitialiser les données"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Cette action va supprimer toutes les catégories et questions existantes et les remplacer par les valeurs par défaut. Cette action est irréversible.
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isResetting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Réinitialiser'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}