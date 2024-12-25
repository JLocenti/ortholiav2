import React, { useState } from 'react';
import { Plus, Palette, PenSquare, Trash2 } from 'lucide-react';
import { usePractitioners } from '../hooks/usePractitioners';
import Modal from '../components/Modal';
import ColorPicker from '../components/ColorPicker';

export default function PractitionersView() {
  const { practitioners, savePractitioner, deletePractitioner } = usePractitioners();
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPractitioner, setNewPractitioner] = useState({ name: '', color: '#3B82F6' });
  const [editingPractitioner, setEditingPractitioner] = useState<{ id: string; name: string } | null>(null);

  const handleColorChange = async (practitionerId: string, color: string) => {
    const practitioner = practitioners.find(p => p.id === practitionerId);
    if (practitioner) {
      await savePractitioner({ ...practitioner, color });
      setShowColorPicker(null);
    }
  };

  const handleAddPractitioner = async () => {
    if (!newPractitioner.name.trim()) return;

    const id = `practitioner_${Date.now()}`;
    await savePractitioner({
      id,
      name: newPractitioner.name,
      color: newPractitioner.color
    });

    setNewPractitioner({ name: '', color: '#3B82F6' });
    setShowAddModal(false);
  };

  const handleUpdateName = async (id: string, newName: string) => {
    const practitioner = practitioners.find(p => p.id === id);
    if (practitioner) {
      await savePractitioner({ ...practitioner, name: newName });
      setEditingPractitioner(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce praticien ?')) {
      await deletePractitioner(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Praticiens
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--theme-color)] rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Ajouter un praticien
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {practitioners.map(practitioner => (
            <div
              key={practitioner.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {editingPractitioner?.id === practitioner.id ? (
                <input
                  type="text"
                  value={editingPractitioner.name}
                  onChange={(e) => setEditingPractitioner({ ...editingPractitioner, name: e.target.value })}
                  onBlur={() => handleUpdateName(practitioner.id, editingPractitioner.name)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateName(practitioner.id, editingPractitioner.name)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">
                  {practitioner.name}
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowColorPicker(practitioner.id)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Changer la couleur"
                >
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-600"
                    style={{ backgroundColor: practitioner.color }}
                  />
                </button>
                <button
                  onClick={() => setEditingPractitioner({ id: practitioner.id, name: practitioner.name })}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Modifier le nom"
                >
                  <PenSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(practitioner.id)}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {practitioners.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Aucun praticien
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de praticien */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un praticien"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAddPractitioner(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du praticien
            </label>
            <input
              type="text"
              value={newPractitioner.name}
              onChange={(e) => setNewPractitioner({ ...newPractitioner, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Entrez le nom du praticien"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: newPractitioner.color }}
              />
              <ColorPicker
                selectedColor={newPractitioner.color}
                onSelect={(color) => setNewPractitioner({ ...newPractitioner, color })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-color)] border border-transparent rounded-lg hover:opacity-90"
            >
              Ajouter
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de sélection de couleur */}
      {showColorPicker && (
        <Modal
          isOpen={true}
          onClose={() => setShowColorPicker(null)}
          title="Choisir une couleur"
        >
          <ColorPicker
            selectedColor={practitioners.find(p => p.id === showColorPicker)?.color || '#3B82F6'}
            onSelect={(color) => handleColorChange(showColorPicker, color)}
          />
        </Modal>
      )}
    </div>
  );
}