import React, { useState } from 'react';
import Modal from '../Modal';
import { useCategories } from '../../hooks/useCategories';
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import EditFieldForm from '../EditFieldForm';

interface VisibleFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategorySection {
  id: string;
  name: string;
  isOpen: boolean;
}

interface Field {
  id: string;
  name: string;
  isVisible: boolean;
}

export default function VisibleFieldsModal({ isOpen, onClose }: VisibleFieldsModalProps) {
  const { categories } = useCategories();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map(cat => [cat.id, false]))
  );
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fields] = useState<Record<string, Field[]>>({
    general: [
      { id: 'field1', name: 'Champ exemple 1', isVisible: true },
      { id: 'field2', name: 'Champ exemple 2', isVisible: false },
    ],
    clinical: [
      { id: 'field3', name: 'Champ exemple 3', isVisible: true },
    ],
    // Ajoutez d'autres catégories au besoin
  });

  const toggleSection = (categoryId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleEditClick = (fieldId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingField(fieldId);
  };

  const handleEditSubmit = (value: string) => {
    // Implémentez la logique de sauvegarde ici
    setEditingField(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gérer les champs visibles"
    >
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.id} className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(category.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <category.icon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-white">{category.name}</span>
              </div>
              {expandedSections[category.id] ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections[category.id] && (
              <div className="p-4 bg-gray-900 border-t border-gray-700">
                <div className="space-y-3">
                  {(fields[category.id] || []).map(field => (
                    <div key={field.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-800">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          id={field.id}
                          checked={field.isVisible}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {editingField === field.id ? (
                          <EditFieldForm
                            initialValue={field.name}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditingField(null)}
                            fieldName="Nom du champ"
                          />
                        ) : (
                          <label
                            htmlFor={field.id}
                            className="text-sm text-gray-300 flex-1"
                          >
                            {field.name}
                          </label>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleEditClick(field.id, e)}
                        className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  );
}
