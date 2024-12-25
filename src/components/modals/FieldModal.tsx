import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Field, Choice } from '../../types/field';
import { Plus, X, Palette, Paintbrush } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Trash2, Link } from 'lucide-react';

// Couleurs prédéfinies dans une grille 6x2
const PRESET_COLORS = [
  '#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#EF4444', '#F97316',
  '#FCD34D', '#10B981', '#34D399', '#06B6D4', '#3B82F6', '#6B7280'
];

interface ChoiceInput {
  text: string;
  color: string;
}

interface FieldModalProps {
  field: Field | null;
  onClose: () => void;
  onSave: (data: Partial<Field>) => void;
}

const predefinedColors = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Rose
  '#EF4444', // Rouge
  '#F97316', // Orange
  '#10B981', // Vert
  '#3B82F6', // Bleu
  '#6B7280', // Gris
];

export default function FieldModal({ field, onClose, onSave }: FieldModalProps) {
  const [text, setText] = useState(field?.text || '');
  const [description, setDescription] = useState(field?.description || '');
  const [type, setType] = useState<Field['type']>(field?.type || 'text');
  const [required, setRequired] = useState(field?.required || false);
  const [choices, setChoices] = useState<ChoiceInput[]>(
    field?.choices?.map(c => ({ text: c.text, color: c.color })) || [{ text: '', color: PRESET_COLORS[0] }]
  );
  const [activeColorPicker, setActiveColorPicker] = useState<number | null>(null);

  useEffect(() => {
    if (field) {
      setText(field.text);
      setType(field.type);
      setRequired(field.required || false);
      setChoices(field.choices?.map(c => ({ text: c.text, color: c.color })) || [{ text: '', color: PRESET_COLORS[0] }]);
    }
  }, [field]);

  const handleAddChoice = () => {
    setChoices(prev => [...prev, { text: '', color: PRESET_COLORS[prev.length % PRESET_COLORS.length] }]);
    setActiveColorPicker(null);
  };

  const updateChoice = (index: number, updates: Partial<ChoiceInput>) => {
    setChoices(prev => {
      const newChoices = [...prev];
      newChoices[index] = { ...newChoices[index], ...updates };
      return newChoices;
    });
    setActiveColorPicker(null);
  };

  const removeChoice = (index: number) => {
    setChoices(prev => prev.filter((_, i) => i !== index));
    setActiveColorPicker(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!text.trim()) {
        alert('Le texte du champ est requis');
        return;
      }

      const fieldData = {
        text: text.trim(),
        description: description.trim(),
        type,
        required,
        choices: type === 'radio' || type === 'multiple' ? choices.map((c, i) => ({
          id: field?.choices?.[i]?.id || `choice_${Date.now()}_${i}`,
          text: c.text,
          color: c.color
        })) : undefined,
        updatedAt: new Date().toISOString()
      };

      console.log('Saving field with data:', fieldData);
      await onSave(fieldData);
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={field ? 'Modifier le champ' : 'Nouveau champ'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Texte et Type sur la même ligne */}
        <div className="flex space-x-4">
          {/* Texte */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Texte
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* Type */}
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Field['type'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="short_text">Texte court</option>
              <option value="long_text">Texte long</option>
              <option value="radio">Choix unique</option>
              <option value="multiple">Choix multiples</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            rows={3}
          />
        </div>

        {/* Choix et Couleurs */}
        {(type === 'radio' || type === 'multiple') && (
          <div className="space-y-3">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => updateChoice(index, { text: e.target.value })}
                    placeholder="Texte du choix"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="grid grid-cols-6 grid-rows-2 gap-1 w-fit">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateChoice(index, { color })}
                        className={cn(
                          "w-7 h-7 rounded-lg transition-transform hover:scale-110",
                          choice.color === color ? "ring-2 ring-white" : ""
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => removeChoice(index)}
                    className="p-2 text-gray-400 hover:text-gray-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddChoice}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 w-full"
            >
              Nouveau choix
            </button>
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
            Champ requis
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {field ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
