import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useViews } from '../context/ViewContext';
import { ColumnPreference } from '../types/view';
import { Switch } from '@headlessui/react';
import { defaultQuestions } from '../constants/defaultQuestions';
import { IconPicker } from './IconPicker';
import { toast } from 'react-toastify';

interface ViewCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ViewCreatorModal({ isOpen, onClose }: ViewCreatorModalProps) {
  const { createViewPreference, refreshViews } = useViews();
  const [isLoading, setIsLoading] = useState(false);
  const [viewName, setViewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Home');
  const [showLastModified, setShowLastModified] = useState(true);
  const [activeColumns, setActiveColumns] = useState<string[]>([]);

  const defaultColumns: ColumnPreference[] = defaultQuestions.map(question => ({
    id: question.id,
    visible: false
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) {
      toast.error('Le nom de la vue est requis');
      return;
    }

    setIsLoading(true);
    try {
      const viewId = await createViewPreference(viewName, selectedIcon);
      if (!viewId) {
        throw new Error('Erreur lors de la création de la vue');
      }
      
      await refreshViews();
      toast.success('Vue créée avec succès');
      onClose();
    } catch (error) {
      console.error('Error creating view:', error);
      toast.error('Erreur lors de la création de la vue');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleField = (fieldId: string) => {
    setActiveColumns(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 w-full shadow-xl">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
            Nouvelle vue
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="viewName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom de la vue
              </label>
              <input
                type="text"
                id="viewName"
                value={viewName}
                onChange={e => setViewName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Entrez le nom de la vue"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icône
              </label>
              <IconPicker selectedIcon={selectedIcon} onSelectIcon={setSelectedIcon} disabled={isLoading} />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Date de dernière modification
                  </span>
                </span>
                <Switch
                  checked={showLastModified}
                  onChange={setShowLastModified}
                  disabled={isLoading}
                  className={`${
                    showLastModified ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span className="sr-only">Afficher la date de dernière modification</span>
                  <span
                    className={`${
                      showLastModified ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Colonnes à afficher
              </h3>
              {defaultColumns.map(col => (
                <div key={col.id} className="flex items-center justify-between">
                  <span className="flex flex-grow flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {defaultQuestions.find(q => q.id === col.id)?.text}
                    </span>
                  </span>
                  <Switch
                    checked={activeColumns.includes(col.id)}
                    onChange={() => toggleField(col.id)}
                    disabled={isLoading}
                    className={`${
                      activeColumns.includes(col.id) ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span className="sr-only">
                      Activer {defaultQuestions.find(q => q.id === col.id)?.text}
                    </span>
                    <span
                      className={`${
                        activeColumns.includes(col.id) ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Création...' : 'Créer la vue'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
