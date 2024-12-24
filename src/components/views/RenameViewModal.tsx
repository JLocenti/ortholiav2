import React, { useState } from 'react';
import Modal from '../Modal';
import { FileText } from 'lucide-react';

interface RenameViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewName: string;
  onSubmit: (newName: string) => Promise<void>;
}

export default function RenameViewModal({
  isOpen,
  onClose,
  viewName,
  onSubmit
}: RenameViewModalProps) {
  const [newName, setNewName] = useState(viewName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(newName.trim());
      onClose();
    } catch (error) {
      console.error('Error renaming view:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renommer la vue">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="viewName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Nom de la vue
          </label>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="viewName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez le nouveau nom"
              autoFocus
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Renommer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}