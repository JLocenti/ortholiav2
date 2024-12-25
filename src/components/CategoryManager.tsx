import React, { useState } from 'react';
import { Edit2, Save, X, Settings } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types/patient';
import Modal from './Modal';
import IconSelector from './IconSelector';

interface CategoryManagerProps {
  category: Category;
  onDelete: () => void;
}

export default function CategoryManager({ category, onDelete }: CategoryManagerProps) {
  const { updateCategory } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(category.name);
  const [editedDescription, setEditedDescription] = useState(category.description);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(category.icon);

  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.FileText;
  const isPractitionersCategory = category.id === 'practitioners';

  const handleSave = async () => {
    try {
      await updateCategory(category.id, {
        name: editedName,
        description: editedDescription,
        icon: selectedIcon
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleCancel = () => {
    setEditedName(category.name);
    setEditedDescription(category.description);
    setSelectedIcon(category.icon);
    setIsEditing(false);
  };

  const handleIconSelect = async (iconName: string) => {
    setSelectedIcon(iconName);
    try {
      await updateCategory(category.id, { icon: iconName });
      setShowIconSelector(false);
    } catch (error) {
      console.error('Error updating category icon:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom de la catégorie
          </label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-600 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-600 dark:text-white"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-3">
          <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIconSelector(true)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Changer l'icône"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Modifier"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          {!isPractitionersCategory && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
              title="Supprimer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showIconSelector}
        onClose={() => setShowIconSelector(false)}
        title="Choisir une icône"
      >
        <IconSelector
          selectedIcon={selectedIcon}
          onSelect={handleIconSelect}
        />
      </Modal>
    </>
  );
}