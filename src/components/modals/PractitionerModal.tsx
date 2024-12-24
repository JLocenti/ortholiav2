import React, { useState } from 'react';
import Modal from '../Modal';
import { Practitioner } from '../../types/practitioner';

interface PractitionerModalProps {
  practitioner: Practitioner | null;
  onClose: () => void;
  onSave: (data: Partial<Practitioner>) => void;
}

const predefinedColors = [
  '#6B7AFF', // Bleu clair
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Rose
  '#EF4444', // Rouge
  '#F97316', // Orange foncé
  '#F59E0B', // Orange clair
  '#10B981', // Vert émeraude
  '#34D399', // Vert menthe
  '#06B6D4', // Cyan
  '#3B82F6', // Bleu
  '#6B7280', // Gris
];

export default function PractitionerModal({ practitioner, onClose, onSave }: PractitionerModalProps) {
  const [name, setName] = useState(practitioner?.name || '');
  const [color, setColor] = useState(practitioner?.color || predefinedColors[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Le nom du praticien est requis');
      return;
    }

    onSave({
      name: name.trim(),
      color,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={practitioner ? 'Modifier le praticien' : 'Nouveau praticien'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex space-x-4">
          {/* Nom du praticien */}
          <div className="flex-1">
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

          {/* Sélection de couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur
            </label>
            <div className="grid grid-cols-6 grid-rows-2 gap-1 w-fit">
              {predefinedColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-7 h-7 rounded-lg transition-transform ${
                    color === presetColor ? "ring-2 ring-white" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
