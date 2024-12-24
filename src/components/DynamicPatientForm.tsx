import React, { useState } from 'react';
import SelectionButton from './SelectionButton';

interface DynamicPatientFormProps {
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
}

export default function DynamicPatientForm({ onSubmit, onCancel }: DynamicPatientFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex-1 overflow-y-auto px-6 -mx-6">
        <div className="space-y-6 pb-24">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Numéro de dossier
            </label>
            <input
              type="text"
              value={formData.fileNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, fileNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="ex: 2024-001"
              required
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-color)] border border-transparent rounded-lg hover:opacity-90"
        >
          Créer le patient
        </button>
      </div>
    </form>
  );
}