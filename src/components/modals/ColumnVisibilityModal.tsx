import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../Modal';
import { useViews } from '../../context/ViewContext';
import { viewPreferencesService } from '../../services/viewPreferencesService';
import { useCategories } from '../../hooks/useCategories';
import { useAllFields } from '../../hooks/useAllFields';
import { VisibilityToggle } from '../ui/visibility-toggle';
import CategorySection from './CategorySection';

interface Column {
  id: string;
  label: string;
}

interface ColumnVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  onToggleColumn: (columnId: string) => void;
  columnVisibility: Record<string, boolean>;
  practitioners?: Array<{ id: string; name: string; color: string }>;
  onTogglePractitioner?: (practitionerId: string) => void;
  onPractitionerColumnToggle?: () => void;
  showPractitionerColumn?: boolean;
  currentView?: {
    settings?: {
      showLastModified?: boolean;
      showPractitioner?: boolean;
      visiblePractitioners?: string[];
    };
  };
  viewId?: string;
}

export default function ColumnVisibilityModal({
  isOpen,
  onClose,
  columns,
  onToggleColumn,
  columnVisibility,
  practitioners = [],
  onTogglePractitioner,
  onPractitionerColumnToggle,
  showPractitionerColumn,
  currentView,
  viewId
}: ColumnVisibilityModalProps) {
  const { updateLocalView } = useViews();
  const { categories } = useCategories();
  const { fields: allFields, loading: fieldsLoading } = useAllFields();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleOrderChange = () => {
    // Forcer une mise à jour du composant
    setForceUpdate(prev => prev + 1);
  };

  // Sections de base (Praticiens et Dernière modification)
  const baseSections = [
    {
      id: 'practitioners',
      name: 'Praticiens',
      content: (
        <div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Afficher la colonne praticiens
            </span>
            <VisibilityToggle
              checked={showPractitionerColumn}
              onCheckedChange={() => handleToggleSettings('showPractitioner')}
              disabled={loading}
            />
          </div>

          {showPractitionerColumn && practitioners.length > 0 && (
            <div className="mt-2 space-y-2">
              {practitioners.map((practitioner) => (
                <div
                  key={practitioner.id}
                  className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 pl-6"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: practitioner.color }}
                    />
                    {practitioner.name}
                  </span>
                  <VisibilityToggle
                    checked={currentView?.settings?.visiblePractitioners?.includes(practitioner.id) ?? false}
                    onCheckedChange={() => onTogglePractitioner?.(practitioner.id)}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'lastModified',
      name: 'Dernière modification',
      content: (
        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Afficher la date de dernière modification
          </span>
          <VisibilityToggle
            checked={currentView?.settings?.showLastModified ?? false}
            onCheckedChange={() => handleToggleSettings('showLastModified')}
            disabled={loading}
          />
        </div>
      )
    }
  ];

  const categorySections = useMemo(() => {
    return categories
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(category => ({
        id: category.id,
        name: category.name,
        content: (
          <CategorySection
            key={category.id}
            category={category}
            fields={allFields}
            columnVisibility={columnVisibility}
            onToggleColumn={onToggleColumn}
            loading={loading}
            onOrderChange={handleOrderChange}
          />
        )
      }));
  }, [categories, allFields, columnVisibility, onToggleColumn, loading, forceUpdate]);

  const handleToggleSettings = async (setting: string) => {
    if (!currentView || !viewId) return;

    try {
      setLoading(true);
      setError(null);

      const newSettings = {
        ...currentView.settings,
        [setting]: !currentView.settings?.[setting]
      };

      await viewPreferencesService.updateViewSettings(viewId, newSettings);
      updateLocalView(viewId, { settings: newSettings });

      if (setting === 'showPractitioner' && onPractitionerColumnToggle) {
        onPractitionerColumnToggle();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Erreur lors de la mise à jour des paramètres');
    } finally {
      setLoading(false);
    }
  };

  // Combiner les sections de base avec les catégories
  const allSections = [...baseSections, ...categorySections];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gérer les colonnes"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto space-y-6">
          {allSections.map((section) => (
            <div key={section.id}>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                {section.name}
              </h3>
              {section.content}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
