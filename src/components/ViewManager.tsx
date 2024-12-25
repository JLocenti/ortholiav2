import React, { useState } from 'react';
import { Plus, Settings, Layout, FileText, Users, Calendar, Folder, Database, ChartBar, List } from 'lucide-react';
import Modal from './Modal';
import { useViews } from '../context/ViewContext';
import { View, ViewField } from '../types/view';
import { useViewPreferences } from '../context/ViewPreferencesContext';
import { Switch } from './ui/switch';

const AVAILABLE_ICONS = [
  { icon: FileText, name: 'Document' },
  { icon: Users, name: 'Utilisateurs' },
  { icon: Calendar, name: 'Calendrier' },
  { icon: Folder, name: 'Dossier' },
  { icon: Database, name: 'Base de données' },
  { icon: ChartBar, name: 'Graphique' },
  { icon: List, name: 'Liste' },
  { icon: Layout, name: 'Layout' },
];

const DEFAULT_FIELDS = [
  { id: 'fileNumber', name: 'Numéro de dossier', type: 'text' },
  { id: 'lastName', name: 'Nom', type: 'text' },
  { id: 'firstName', name: 'Prénom', type: 'text' },
  { id: 'birthDate', name: 'Date de naissance', type: 'date' },
  { id: 'gender', name: 'Genre', type: 'select' },
  { id: 'phone', name: 'Téléphone', type: 'text' },
  { id: 'email', name: 'Email', type: 'email' },
  { id: 'address', name: 'Adresse', type: 'textarea' },
  { id: 'lastVisit', name: 'Dernière visite', type: 'date' },
  { id: 'nextVisit', name: 'Prochaine visite', type: 'date' },
  { id: 'notes', name: 'Notes', type: 'textarea' },
  { id: 'status', name: 'Statut', type: 'select' },
];

export default function ViewManager() {
  const { views, addView, updateView, addFieldToView } = useViews();
  const { updateColumnVisibility } = useViewPreferences();
  const [isNewViewModalOpen, setIsNewViewModalOpen] = useState(false);
  const [isEditViewModalOpen, setIsEditViewModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<View | null>(null);
  const [newViewData, setNewViewData] = useState({ 
    name: '', 
    icon: 'FileText',
    fields: DEFAULT_FIELDS.map(field => ({ ...field, enabled: true }))
  });

  const handleAddView = async (e: React.FormEvent) => {
    e.preventDefault();
    const view = await addView({
      name: newViewData.name,
      icon: newViewData.icon,
      fields: newViewData.fields.filter(field => field.enabled)
    });
    
    setIsNewViewModalOpen(false);
    setNewViewData({ 
      name: '', 
      icon: 'FileText',
      fields: DEFAULT_FIELDS.map(field => ({ ...field, enabled: true }))
    });
  };

  const handleFieldToggle = (fieldId: string) => {
    setNewViewData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
      )
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Vues</h2>
        <button
          onClick={() => setIsNewViewModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Vue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {views.map(view => {
          const IconComponent = AVAILABLE_ICONS.find(i => i.name === view.icon)?.icon || FileText;
          return (
            <div key={view.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  <h3 className="font-medium">{view.name}</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedView(view);
                    setIsEditViewModalOpen(true);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {view.fields.map(field => (
                  <div key={field.id} className="text-sm text-gray-600 dark:text-gray-400">
                    {field.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal pour nouvelle vue */}
      <Modal
        isOpen={isNewViewModalOpen}
        onClose={() => setIsNewViewModalOpen(false)}
        title="Créer une nouvelle vue"
      >
        <form onSubmit={handleAddView} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de la vue
            </label>
            <input
              type="text"
              value={newViewData.name}
              onChange={e => setNewViewData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icône
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map(({ icon: Icon, name }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setNewViewData(prev => ({ ...prev, icon: name }))}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
                    newViewData.icon === name
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 dark:bg-blue-900 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Champs à afficher
            </label>
            <div className="max-h-[40vh] overflow-y-auto space-y-2">
              {newViewData.fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {field.name}
                  </span>
                  <Switch
                    checked={field.enabled}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                    className="ml-4"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsNewViewModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Créer
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal pour éditer une vue */}
      {selectedView && (
        <Modal
          isOpen={isEditViewModalOpen}
          onClose={() => {
            setIsEditViewModalOpen(false);
            setSelectedView(null);
          }}
          title={`Modifier ${selectedView.name}`}
        >
          {/* Contenu du modal d'édition */}
        </Modal>
      )}
    </div>
  );
}