import React, { useState } from 'react';
import { Category } from '../types/patient';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../types/user';

interface CategoryEditorProps {
  category: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
}

export default function CategoryEditor({ category, onSave, onCancel }: CategoryEditorProps) {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === USER_ROLES.SUPER_ADMIN;
  const [formData, setFormData] = useState<Category>({
    ...category
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom de la catégorie
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          required
          disabled={!isSuperAdmin}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          rows={3}
          required
          disabled={!isSuperAdmin}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-600">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        {isSuperAdmin && (
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Enregistrer
          </button>
        )}
      </div>
    </form>
  );
}