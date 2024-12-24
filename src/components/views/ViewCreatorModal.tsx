import React, { useState } from 'react';
import Modal from '../Modal';
import { SwitchComponent as Switch } from '../Switch';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Icons from 'lucide-react';
import { viewIcons } from '../../constants/viewIcons';
import { useViews } from '../../context/ViewContext';

interface ViewCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewCreatorModal({ isOpen, onClose }: ViewCreatorModalProps) {
  const { createViewPreference } = useViews();
  const [viewName, setViewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('FileText');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) return;

    try {
      await createViewPreference(viewName, selectedIcon);
      onClose();
    } catch (error) {
      console.error('Error creating view:', error);
      alert('Une erreur est survenue lors de la création de la vue');
    }
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle vue">
        <div>Chargement...</div>
      </Modal>
    );
  }

  const practitionerCategory = categories.find(cat => cat.name === 'practitioner');
  const lastModifiedCategory = categories.find(cat => cat.name === 'lastModified');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle vue">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="viewName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nom de la vue
          </label>
          <input
            type="text"
            id="viewName"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Entrez le nom de la vue"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="w-full flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-300"
          >
            {React.createElement(Icons[selectedIcon as keyof typeof Icons], { className: "w-5 h-5" })}
            <span className="text-gray-500">Choisir une icône</span>
          </button>

          {showIconPicker && (
            <div className="relative">
              <div className="absolute top-full mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl grid grid-cols-6 gap-2 z-10">
                {viewIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      setSelectedIcon(iconName);
                      setShowIconPicker(false);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-900 dark:text-gray-300"
                  >
                    {React.createElement(Icons[iconName as keyof typeof Icons], { className: "w-5 h-5" })}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {/* Ligne pour la catégorie praticien */}
          {practitionerCategory && (
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Switch
                  checked={selectedFields.includes(practitionerCategory.id)}
                  onChange={() => toggleField(practitionerCategory.id)}
                />
                <span className="font-medium text-gray-900 dark:text-gray-300">Praticiens</span>
              </div>
            </div>
          )}

          {/* Ligne pour la date de dernière modification */}
          {lastModifiedCategory && (
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Switch
                  checked={selectedFields.includes(lastModifiedCategory.id)}
                  onChange={() => toggleField(lastModifiedCategory.id)}
                />
                <span className="font-medium text-gray-900 dark:text-gray-300">Date de dernière modification</span>
              </div>
            </div>
          )}

          {/* Liste des autres items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Switch
                  checked={selectedFields.includes(item.id)}
                  onChange={() => toggleField(item.id)}
                />
                <span className="font-medium text-gray-900 dark:text-gray-300">{item.text}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}
