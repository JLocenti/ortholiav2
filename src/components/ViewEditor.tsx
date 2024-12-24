import React, { useState, useEffect } from 'react';
import { View, ViewField } from '../types/view';
import { useViews } from '../context/ViewContext';
import { SwitchComponent as Switch } from './Switch';
import { GripVertical, PenSquare, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { viewIcons } from '../constants/viewIcons';
import { cn } from '../lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ViewEditorProps {
  view: View;
  onClose: () => void;
  onFieldsUpdate?: (fields: string[], showLastModified: boolean) => void;
  onNewField?: (fieldId: string) => void;
}

export default function ViewEditor({ view, onClose, onFieldsUpdate, onNewField }: ViewEditorProps) {
  const { updateView } = useViews();
  const [activeFields, setActiveFields] = useState<string[]>(
    view.fields.map(f => f.id)
  );
  const [showLastModified, setShowLastModified] = useState(
    view.settings?.showLastModified ?? true
  );
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [viewName, setViewName] = useState(view.name);
  const [selectedIcon, setSelectedIcon] = useState(view.icon);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupérer les catégories spéciales (praticien et date de modification)
        const categoriesCollection = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const specialCategories = categoriesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(cat => ['practitioner', 'lastModified'].includes(cat.name));

        // Récupérer tous les items sauf les praticiens
        const itemsCollection = collection(db, 'items');
        const itemsSnapshot = await getDocs(itemsCollection);
        const itemsList = itemsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(item => 
            item.text && 
            item.text.trim() !== '' && 
            item.category !== 'practitioner'
          );
        
        setCategories(specialCategories);
        setItems(itemsList);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSave = async () => {
    await updateView(view.id, {
      ...view,
      name: viewName,
      icon: selectedIcon,
      settings: {
        ...view.settings,
        showLastModified
      }
    });
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    setShowIconPicker(false);
    handleSave();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewName(e.target.value);
  };

  const handleNameBlur = () => {
    if (viewName !== view.name) {
      handleSave();
    }
  };

  const handleToggleLastModified = async () => {
    const newValue = !showLastModified;
    setShowLastModified(newValue);
    
    await updateView(view.id, {
      ...view,
      settings: {
        ...view.settings,
        showLastModified: newValue
      }
    });

    onFieldsUpdate?.(activeFields, newValue);
  };

  const handleFieldToggle = async (fieldId: string) => {
    const isActive = activeFields.includes(fieldId);
    let newActiveFields;

    if (isActive) {
      newActiveFields = activeFields.filter(id => id !== fieldId);
    } else {
      newActiveFields = [...activeFields, fieldId];
      onNewField?.(fieldId);
    }

    setActiveFields(newActiveFields);
    onFieldsUpdate?.(newActiveFields, showLastModified);

    await updateView(view.id, {
      ...view,
      fields: newActiveFields.map(id => ({
        id,
        order: view.fields.find(f => f.id === id)?.order || 0
      }))
    });
  };

  const IconComponent = Icons[selectedIcon as keyof typeof Icons] || Icons.FileText;

  if (loading) {
    return (
      <div className="p-4">
        <div>Chargement...</div>
      </div>
    );
  }

  const practitionerCategory = categories.find(cat => cat.name === 'practitioner');
  const lastModifiedCategory = categories.find(cat => cat.name === 'lastModified');

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="p-2 hover:bg-gray-700/50 rounded-lg"
          >
            <IconComponent className="w-6 h-6 text-gray-300" />
          </button>
          <input
            type="text"
            value={viewName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            className="bg-transparent border-none focus:outline-none text-xl font-semibold text-gray-300"
          />
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-400">
          <X className="w-6 h-6" />
        </button>
      </div>

      {showIconPicker && (
        <div className="relative">
          <div className="absolute top-0 left-0 mt-2 p-2 bg-gray-800 border border-gray-700 rounded-xl grid grid-cols-6 gap-2 z-10">
            {viewIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => handleIconSelect(iconName)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                {React.createElement(Icons[iconName as keyof typeof Icons], { className: "w-5 h-5 text-gray-300" })}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {/* Ligne pour la catégorie praticien */}
        {practitionerCategory && (
          <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4">
              <Switch
                checked={activeFields.includes(practitionerCategory.id)}
                onChange={() => handleFieldToggle(practitionerCategory.id)}
              />
              <span className="font-medium text-gray-300">Praticiens</span>
            </div>
          </div>
        )}

        {/* Ligne pour la date de dernière modification */}
        {lastModifiedCategory && (
          <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4">
              <Switch
                checked={activeFields.includes(lastModifiedCategory.id)}
                onChange={() => handleFieldToggle(lastModifiedCategory.id)}
              />
              <span className="font-medium text-gray-300">Date de dernière modification</span>
            </div>
          </div>
        )}

        {/* Liste des autres items */}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Switch
                checked={activeFields.includes(item.id)}
                onChange={() => handleFieldToggle(item.id)}
              />
              <span className="font-medium text-gray-300">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}