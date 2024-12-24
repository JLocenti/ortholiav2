import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PatientTable from '../components/PatientTable';
import { useViews } from '../context/ViewContext';
import { usePatients } from '../context/PatientContext';
import { usePractitioners } from '../context/PractitionerContext';
import Modal from '../components/Modal';
import ViewEditor from '../components/ViewEditor';
import { Patient } from '../types/view';
import CreatePatientModal from '../components/modals/CreatePatientModal';
import DynamicPatientForm from '../components/DynamicPatientForm';

export default function AdminView() {
  const { viewId = 'home' } = useParams();
  const navigate = useNavigate();
  const { viewPreferences, isLoading } = useViews();
  const { patients: initialPatients, addPatient, loading } = usePatients();
  const { practitioners: allPractitioners } = usePractitioners();
  const currentView = viewPreferences?.find(v => v.id === viewId);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeColumns, setActiveColumns] = useState<string[]>([]);
  const [showLastModified, setShowLastModified] = useState(
    currentView?.settings?.showLastModified ?? true
  );
  const [showColumnVisibilityModal, setShowColumnVisibilityModal] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [showViewEditor, setShowViewEditor] = useState(false);

  // État pour gérer les praticiens visibles
  const [visiblePractitioners, setVisiblePractitioners] = useState<string[]>([]);
  const [showPractitionerColumn, setShowPractitionerColumn] = useState(false);

  useEffect(() => {
    if (!isLoading && viewPreferences.length > 0) {
      // Si nous sommes sur la vue 'home' et qu'il y a des vues disponibles,
      // rediriger vers la première vue
      if (viewId === 'home') {
        navigate(`/app/${viewPreferences[0].id}`, { replace: true });
      }
    }
  }, [viewId, viewPreferences, isLoading, navigate]);

  useEffect(() => {
    if (currentView) {
      setShowLastModified(currentView.settings?.showLastModified ?? true);
    }
  }, [currentView]);

  useEffect(() => {
    if (initialPatients) {
      setPatients(initialPatients);
    }
  }, [initialPatients]);

  useEffect(() => {
    if (currentView?.columns) {
      const visibilityMap = currentView.columns.reduce((acc, col) => ({
        ...acc,
        [col.fieldId]: col.visible
      }), {});
      setColumnVisibility(visibilityMap);
      
      // Mettre à jour activeColumns en fonction des colonnes visibles
      const visibleColumns = currentView.columns
        .filter(col => col.visible)
        .map(col => col.fieldId);
      setActiveColumns(visibleColumns);
    }
  }, [currentView]);

  // Charger l'état initial des praticiens depuis la vue
  useEffect(() => {
    if (currentView?.settings) {
      setShowPractitionerColumn(currentView.settings.showPractitioner ?? false);
      setVisiblePractitioners(currentView.settings.visiblePractitioners ?? []);
    }
  }, [currentView]);

  const handleCreatePatient = async (data: any) => {
    try {
      await addPatient(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const handleToggleColumnVisibility = async (columnId: string) => {
    try {
      if (!currentView) return;

      const isCurrentlyVisible = columnVisibility[columnId];
      const newVisibility = !isCurrentlyVisible;

      // Mise à jour immédiate de l'interface utilisateur
      setColumnVisibility(prev => ({
        ...prev,
        [columnId]: newVisibility
      }));

      // Pour les autres colonnes
      const updatedColumns = currentView.columns.map(col => 
        col.fieldId === columnId ? { ...col, visible: newVisibility } : col
      );

      await viewPreferencesService.updateViewPreference(currentView.id, {
        columns: updatedColumns
      });

      // Mettre à jour les colonnes actives
      if (newVisibility) {
        setActiveColumns(prev => [...prev, columnId]);
      } else {
        setActiveColumns(prev => prev.filter(id => id !== columnId));
      }
    } catch (error) {
      console.error('Error updating column visibility:', error);
      // Restaurer l'état précédent en cas d'erreur
      setColumnVisibility(prev => ({
        ...prev,
        [columnId]: !prev[columnId]
      }));
    }
  };

  // Gérer la visibilité de la colonne praticien
  const handlePractitionerColumnToggle = async () => {
    if (!currentView) return;

    const newShowPractitioner = !showPractitionerColumn;
    setShowPractitionerColumn(newShowPractitioner);

    // Si on active la colonne, on active tous les praticiens
    const newVisiblePractitioners = newShowPractitioner ? allPractitioners.map(p => p.id) : [];
    setVisiblePractitioners(newVisiblePractitioners);

    // Mettre à jour dans Firestore
    await viewPreferencesService.updateViewSettings(currentView.id, {
      ...currentView.settings,
      showPractitioner: newShowPractitioner,
      visiblePractitioners: newVisiblePractitioners
    });
  };

  // Gérer la visibilité d'un praticien individuel
  const handlePractitionerToggle = async (practitionerId: string) => {
    if (!currentView) return;

    const newVisiblePractitioners = visiblePractitioners.includes(practitionerId)
      ? visiblePractitioners.filter(id => id !== practitionerId)
      : [...visiblePractitioners, practitionerId];

    setVisiblePractitioners(newVisiblePractitioners);

    // Mettre à jour dans Firestore
    await viewPreferencesService.updateViewSettings(currentView.id, {
      ...currentView.settings,
      visiblePractitioners: newVisiblePractitioners
    });
  };

  const filteredPatients = useMemo(() => {
    if (!showPractitionerColumn || visiblePractitioners.length === 0) {
      return patients;
    }

    return patients.filter(patient => 
      patient.practitioner && visiblePractitioners.includes(patient.practitioner)
    );
  }, [patients, showPractitionerColumn, visiblePractitioners]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--theme-color)]"></div>
      </div>
    );
  }

  if (!currentView) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Vue non trouvée
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            La vue que vous recherchez n'existe pas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PatientTable
        patients={filteredPatients}
        fields={currentView?.columns?.map(col => ({
          id: col.fieldId,
          text: col.name || '',
          type: 'text'
        })) || []}
        showLastModified={showLastModified}
        onPatientSelect={setSelectedPatient}
        onToggleColumnVisibility={handleToggleColumnVisibility}
        showColumnVisibilityModal={showColumnVisibilityModal}
        onCloseColumnVisibilityModal={() => setShowColumnVisibilityModal(false)}
        columnVisibility={columnVisibility}
        currentView={currentView}
        practitioners={allPractitioners}
        onTogglePractitioner={handlePractitionerToggle}
        onPractitionerColumnToggle={handlePractitionerColumnToggle}
        showPractitionerColumn={showPractitionerColumn}
      />

      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title="Détails du patient"
        >
          <DynamicPatientForm
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        </Modal>
      )}

      {showCreateModal && (
        <CreatePatientModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          visibleFields={currentView?.columns.filter(col => col.visible).map(col => col.fieldId) || []}
          viewId={viewId}
          onSubmit={handleCreatePatient}
        />
      )}

      {showViewEditor && (
        <Modal
          isOpen={showViewEditor}
          onClose={() => setShowViewEditor(false)}
          title="Éditer la vue"
        >
          <ViewEditor
            view={currentView}
            onClose={() => setShowViewEditor(false)}
            onFieldsUpdate={handleFieldsUpdate}
            onNewField={handleAddNewField}
          />
        </Modal>
      )}
    </div>
  );
}