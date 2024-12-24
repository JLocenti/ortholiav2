import React, { useState } from 'react';
import { Field } from '../../types/field';
import { CategoryId } from '../sidebar/EditSidebar';
import { Plus, X } from 'lucide-react';

interface FieldFormProps {
  categoryId: CategoryId;
  onSubmit: (field: Partial<Field>) => void;
  onCancel: () => void;
  initialData?: Field;
}

export default function FieldForm({ categoryId, onSubmit, onCancel, initialData }: FieldFormProps) {
  const [text, setText] = useState(initialData?.text || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fieldType, setFieldType] = useState(initialData?.type || 'text');
  const [required, setRequired] = useState(initialData?.required || false);
  const [choices, setChoices] = useState<string[]>(initialData?.choices || []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newChoiceText, setNewChoiceText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        text,
        description,
        type: fieldType,
        required,
        choices: fieldType === 'radio' || fieldType === 'multiple' ? choices : [],
        categoryId,
        order: initialData?.order || 0,
      });
    } catch (error) {
      console.error('Error submitting field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChoice = () => {
    if (!newChoiceText.trim()) return;
    setChoices(prev => [...prev, newChoiceText.trim()]);
    setNewChoiceText('');
    setIsAddingNew(false);
  };

  const handleUpdateChoice = (index: number, newText: string) => {
    setChoices(prev => {
      const newChoices = [...prev];
      newChoices[index] = newText;
      return newChoices;
    });
  };

  const handleRemoveChoice = (index: number) => {
    setChoices(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">
          Texte
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Entrez le texte du champ"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Description optionnelle"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Type de champ
        </label>
        <select
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="text">Texte</option>
          <option value="number">Nombre</option>
          <option value="radio">Choix unique</option>
          <option value="multiple">Choix multiple</option>
          <option value="textarea">Zone de texte</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500"
        />
        <label className="ml-2 text-sm text-gray-300">
          Champ requis
        </label>
      </div>

      {(fieldType === 'radio' || fieldType === 'multiple') && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Options de sélection
          </label>
          
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center justify-between gap-4 p-2 bg-gray-800 rounded-lg">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => handleUpdateChoice(index, e.target.value)}
                    className="flex-1 bg-gray-700 text-white rounded-md px-2 py-1"
                    autoFocus
                    onBlur={() => setEditingIndex(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setEditingIndex(null);
                      }
                    }}
                  />
                ) : (
                  <span 
                    className="text-white cursor-pointer flex-1"
                    onClick={() => setEditingIndex(index)}
                  >
                    {choice}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveChoice(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {isAddingNew ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newChoiceText}
                  onChange={(e) => setNewChoiceText(e.target.value)}
                  className="flex-1 bg-gray-700 text-white rounded-md px-2 py-1"
                  placeholder="Entrez une option"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChoice();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une option</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}