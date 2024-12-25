import React, { useState } from 'react';
import { Question } from '../types/patient';
import { useFields } from '../hooks/useFields';
import { useFieldsOrder } from '../hooks/useFieldsOrder';
import { FieldsReorderMode } from './fields/FieldsReorderMode';
import { Settings2 } from 'lucide-react';

interface FieldsManagerProps {
  categoryId: string;
}

export const FieldsManager: React.FC<FieldsManagerProps> = ({ categoryId }) => {
  const { fields: fieldsData, loading: isLoading, addField, deleteField } = useFields(categoryId);
  const { fields: orderedFields, loading: orderLoading, reorderFields } = useFieldsOrder(categoryId);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [newField, setNewField] = useState<Partial<Question>>({
    text: '',
    type: 'text',
    description: '',
    required: false,
    choices: []
  });

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addField(newField);
      setNewField({
        text: '',
        type: 'text',
        description: '',
        required: false,
        choices: []
      });
    } catch (error) {
      console.error('Error adding field:', error);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce champ ?')) {
      try {
        await deleteField(fieldId);
      } catch (error) {
        console.error('Error deleting field:', error);
      }
    }
  };

  const handleOptionChange = (value: string) => {
    setNewField(prev => ({
      ...prev,
      choices: value.split(',').map((text, index) => ({
        id: `choice_${Date.now()}_${index}`,
        text: text.trim(),
        color: '#000000'
      }))
    }));
  };

  if (isLoading || orderLoading) return <div>Chargement...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des champs</h2>
        <button
          onClick={() => setIsReorderMode(!isReorderMode)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isReorderMode 
              ? "bg-gray-700 text-white" 
              : "hover:bg-gray-700/50 text-gray-400 hover:text-white"
          )}
          title={isReorderMode ? "Quitter le mode réorganisation" : "Réorganiser les champs"}
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {isReorderMode ? (
        <FieldsReorderMode 
          fields={orderedFields}
          onReorder={reorderFields}
        />
      ) : (
        <>
          <form onSubmit={handleAddField} className="mb-8 space-y-4">
            <div>
              <label className="block mb-2">Nom du champ</label>
              <input
                type="text"
                value={newField.text || ''}
                onChange={e => setNewField(prev => ({ ...prev, text: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Description</label>
              <input
                type="text"
                value={newField.description || ''}
                onChange={e => setNewField(prev => ({ ...prev, description: e.target.value }))}
                className="form-input"
              />
            </div>

            <div>
              <label className="block mb-2">Type</label>
              <select
                value={newField.type}
                onChange={e => setNewField(prev => ({ ...prev, type: e.target.value }))}
                className="form-select"
                required
              >
                <option value="text">Texte</option>
                <option value="long_text">Texte long</option>
                <option value="number">Nombre</option>
                <option value="date">Date</option>
                <option value="single">Choix unique</option>
                <option value="multiple">Choix multiple</option>
              </select>
            </div>

            {(newField.type === 'single' || newField.type === 'multiple') && (
              <div>
                <label className="block mb-2">Options (séparées par des virgules)</label>
                <input
                  type="text"
                  value={newField.choices?.map(c => c.text).join(', ') || ''}
                  onChange={e => handleOptionChange(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            )}

            <div>
              <label className="block mb-2">
                <input
                  type="checkbox"
                  checked={newField.required || false}
                  onChange={e => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  className="form-checkbox mr-2"
                />
                Obligatoire
              </label>
            </div>

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Ajouter le champ
            </button>
          </form>

          <div className="space-y-4">
            {fieldsData.map(field => (
              <div key={field.id} className="border p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{field.text}</h3>
                    <p className="text-gray-600">{field.description}</p>
                    <p>Type: {field.type}</p>
                    {field.choices && field.choices.length > 0 && (
                      <p>Options: {field.choices.map(c => c.text).join(', ')}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
