import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeletePrescriptionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  prescriptionName: string;
}

export default function DeletePrescriptionConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  prescriptionName
}: DeletePrescriptionConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>
          <h2 className="text-xl font-semibold">Supprimer la prescription</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Êtes-vous sûr de vouloir supprimer la prescription "{prescriptionName}" ? Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
