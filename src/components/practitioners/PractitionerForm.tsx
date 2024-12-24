import React, { useState, useEffect } from 'react';
import { Practitioner } from '../../types/practitioner';

interface PractitionerFormProps {
  initialData?: Practitioner;
  onSubmit: (data: { name: string; color: string }) => void;
  onCancel: () => void;
}

const DEFAULT_COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

export default function PractitionerForm({ initialData, onSubmit, onCancel }: PractitionerFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || DEFAULT_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ name, color });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Nom du praticien
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Couleur
        </label>
        <div className="grid grid-cols-7 gap-2">
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full ${
                color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'En cours...' : (initialData ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </form>
  );
}
