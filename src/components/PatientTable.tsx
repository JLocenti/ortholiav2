import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Patient } from '../types/view';
import { Question, Category } from '../types/patient';
import { patientService } from '../services/patientService';
import Modal from './Modal';
import PatientEditModal from './modals/PatientEditModal';
import CreatePatientModal from './modals/CreatePatientModal';
import ColumnVisibilityModal from './modals/ColumnVisibilityModal';
import { cn } from '../lib/utils';
import { Trash2, X, Search } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import FieldDisplay from './fields/FieldDisplay';
import SelectionButton from './SelectionButton';
import Tooltip from './common/Tooltip';
import { useCategories } from '../hooks/useCategories';

interface PatientTableProps {
  patients: Patient[];
  fields: Question[];
  showLastModified: boolean;
  onPatientSelect: (patient: Patient | null) => void;
  onToggleColumnVisibility: (columnId: string) => void;
  showColumnVisibilityModal: boolean;
  onCloseColumnVisibilityModal: () => void;
  columnVisibility: Record<string, boolean>;
  currentView?: any;
  practitioners?: any[];
  onTogglePractitioner?: (practitionerId: string) => void;
}

export default function PatientTable({
  patients = [],
  fields: initialFields = [],
  showLastModified,
  onPatientSelect,
  onToggleColumnVisibility,
  showColumnVisibilityModal,
  onCloseColumnVisibilityModal,
  columnVisibility,
  currentView,
  practitioners = [],
  onTogglePractitioner
}: PatientTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<{ patient: Patient; focusedField?: string } | null>(null);
  const [showSummaryForPatient, setShowSummaryForPatient] = useState<Patient | null>(null);
  const [fields, setFields] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [patientFields, setPatientFields] = useState<Record<string, any>>({});
  const [practitionersData, setPractitioners] = useState<Record<string, any>>({});
  const tableRef = useRef<HTMLDivElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { categories: allCategories } = useCategories();

  useEffect(() => {
    setCategories(allCategories);
  }, [allCategories]);

  useEffect(() => {
    async function fetchFields() {
      try {
        // Charger les praticiens
        const practitionersCollection = collection(db, 'practitioners');
        const practitionersSnapshot = await getDocs(practitionersCollection);
        const practitionersData: Record<string, any> = {};
        practitionersSnapshot.forEach(doc => {
          practitionersData[doc.id] = { id: doc.id, ...doc.data() };
        });
        setPractitioners(practitionersData);

        // Charger les catégories
        const categoriesCollection = collection(db, 'categories');
        const categoriesQuery = query(categoriesCollection, orderBy('order'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);

        // Charger tous les champs
        const fieldsCollection = collection(db, 'fields');
        const fieldsSnapshot = await getDocs(fieldsCollection);
        const fieldsData = fieldsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: doc.data().type || 'text',
          text: doc.data().name || doc.data().text || '',
          category: doc.data().categoryId || 'general'
        })) as Question[];
        setFields(fieldsData);

        // Charger les valeurs des champs pour chaque patient
        const patientFieldsData: Record<string, any> = {};
        for (const patient of patients) {
          const patientFields: Record<string, any> = {};
          fieldsData.forEach(field => {
            patientFields[field.id] = patient.fields?.[field.id] || null;
          });
          patientFieldsData[patient.id] = patientFields;
        }
        setPatientFields(patientFieldsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchFields();
  }, [patients]);

  // Trier les patients par date de dernière modification
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA; // Tri décroissant (plus récent en premier)
    });
  }, [patients]);

  const columns = useMemo(() => {
    // Grouper les champs par catégorie
    const fieldsByCategory = fields.reduce((acc, field) => {
      const categoryId = field.category || 'general';
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(field);
      return acc;
    }, {} as Record<string, Question[]>);

    // Obtenir les catégories triées par leur ordre
    const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Créer les colonnes de base
    const baseColumns = [
      {
        id: 'practitioner',
        name: 'Praticien',
        minWidth: 120,
        fixed: false,
        visible: columnVisibility['practitioner'] !== false
      },
      {
        id: 'lastModified',
        name: 'Dernière modification',
        minWidth: 180,
        fixed: false,
        visible: showLastModified && columnVisibility['lastModified'] !== false
      }
    ];

    // Créer les colonnes pour chaque champ, en respectant l'ordre des catégories et des champs
    const fieldColumns = sortedCategories.flatMap(category => {
      const categoryFields = fieldsByCategory[category.id] || [];
      
      // Trier les champs selon fieldsOrder de la catégorie
      const sortedFields = categoryFields.map(field => {
        const orderInfo = category.fieldsOrder?.find(f => f.id === field.id);
        return {
          field,
          order: orderInfo?.order || 0
        };
      }).sort((a, b) => a.order - b.order);

      return sortedFields.map(({ field }) => ({
        id: field.id,
        name: field.text,
        minWidth: 150,
        fixed: false,
        visible: columnVisibility[field.id] === true
      }));
    });

    const allColumns = [...baseColumns, ...fieldColumns];
    
    // Ne retourner que les colonnes visibles
    return allColumns.filter(column => column.visible);
  }, [fields, categories, columnVisibility, showLastModified]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectedRows(checked ? sortedPatients.map(p => p.id) : []);
  };

  const handleSelectRow = (patientId: string) => {
    setSelectedRows(prev => 
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleCellClick = (patient: Patient, fieldId: string) => {
    setEditingPatient({ patient, focusedField: fieldId });
  };

  const handleDelete = async () => {
    try {
      for (const patientId of selectedRows) {
        await patientService.deletePatient(patientId);
      }
      setSelectedRows([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting patients:', error);
    }
  };

  const handleCellChange = async (patientId: string, fieldId: string, value: any) => {
    try {
      await patientService.updatePatient(patientId, { [fieldId]: value });
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    // Si la date est invalide, retourner le timestamp original
    if (isNaN(date.getTime())) {
      return dateString;
    }

    // Tableau des mois en français
    const mois = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];

    const jour = date.getDate();
    const moisStr = mois[date.getMonth()];
    const annee = date.getFullYear();
    const heures = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Si c'est aujourd'hui
    const aujourdhui = new Date();
    if (date.toDateString() === aujourdhui.toDateString()) {
      return `Aujourd'hui à ${heures}:${minutes}`;
    }

    // Si c'est hier
    const hier = new Date(aujourdhui);
    hier.setDate(hier.getDate() - 1);
    if (date.toDateString() === hier.toDateString()) {
      return `Hier à ${heures}:${minutes}`;
    }

    // Pour les autres dates
    return `${jour} ${moisStr} ${annee} à ${heures}:${minutes}`;
  };

  const renderPractitioner = (practitionerId: string) => {
    // Chercher le praticien dans la liste des praticiens
    const practitioner = practitionersData[practitionerId];

    if (!practitioner) return '-';

    return (
      <span 
        className="px-2 py-1 rounded text-white" 
        style={{ backgroundColor: practitioner.color || 'var(--theme-color)' }}
      >
        {practitioner.name || '-'}
      </span>
    );
  };

  const renderCellContent = (patient: Patient, field: any) => {
    // Pour les champs spéciaux stockés directement dans le patient
    if (field.id === 'practitioner') {
      return renderPractitioner(patient.practitioner);
    }
    if (field.id === 'lastModified') {
      return formatDate(patient.updatedAt);
    }

    // Pour les autres champs, chercher dans patientFields
    const patientFieldValues = patientFields[patient.id] || {};
    const value = patient.fields?.[field.id];

    // Trouver le champ correspondant
    const fieldConfig = fields.find(f => f.id === field.id);

    if (!fieldConfig) {
      return value || '-';
    }

    // Pour les champs avec choix (comme la classe squelettique)
    if (fieldConfig.type === 'radio' || fieldConfig.type === 'multiple') {
      const choices = fieldConfig.choices || [];
      
      // Pour les choix multiples
      if (fieldConfig.type === 'multiple' && Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map(choiceId => {
              const choice = choices.find(c => c.id === choiceId);
              if (!choice) return null;
              return (
                <span
                  key={choiceId}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${choice.color || '#4D7EF9'}20`,
                    color: choice.color || '#4D7EF9'
                  }}
                >
                  {choice.text || choice.name}
                </span>
              );
            })}
          </div>
        );
      }
      
      // Pour les choix uniques (radio)
      const choice = choices.find(c => c.id === value);
      if (choice) {
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${choice.color || '#4D7EF9'}20`,
              color: choice.color || '#4D7EF9'
            }}
          >
            {choice.text || choice.name}
          </span>
        );
      }
    }

    return value || '-';
  };

  const handleToggleColumn = (columnId: string) => {
    onToggleColumnVisibility(columnId);
  };

  const allColumns = useMemo(() => {
    const baseColumns = [
      {
        id: 'fileNumber',
        name: 'N° Dossier',
        fixed: true,
        canHide: false
      },
      {
        id: 'practitioner',
        name: 'Praticien',
        fixed: false,
        canHide: true
      },
      {
        id: 'lastModified',
        name: 'Dernière modification',
        fixed: false,
        canHide: true
      }
    ];

    const fieldColumns = fields.map(field => ({
      id: field.id,
      name: field.text,
      fixed: false,
      canHide: true
    }));

    return [...baseColumns, ...fieldColumns];
  }, [fields]);

  const handleSavePatient = async (updatedData: Partial<Patient>) => {
    if (!editingPatient) return;

    try {
      console.log('Updating patient with data:', updatedData); // Debug log
      
      // S'assurer que toutes les données sont présentes
      const completeData = {
        ...editingPatient.patient,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };

      // Mettre à jour dans Firebase
      await patientService.updatePatient(editingPatient.patient.id, completeData);

      // Mettre à jour l'état local
      const updatedPatients = patients.map((p) =>
        p.id === editingPatient.patient.id
          ? {
              ...p,
              ...completeData
            }
          : p
      );
      // setPatients(updatedPatients); // Commented out because setPatients is not defined

      // Ne plus fermer la modal automatiquement
      // setEditingPatient(null);
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  return (
    <div className="relative overflow-x-auto p-1">
      {/* Boutons d'action */}
      <div className="mb-1 flex justify-start items-center">
        <div className="flex space-x-2">
          {selectedRows.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Supprimer ({selectedRows.length})
            </button>
          )}
        </div>
      </div>

      {/* Bouton flottant nouveau patient */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-color)]"
        aria-label="Nouveau patient"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
      </button>

      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-auto max-h-[calc(100vh-11rem)]">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-30">
              <tr>
                {/* Groupe des colonnes fixes */}
                <th 
                  scope="col" 
                  className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-700"
                  style={{ width: 'fit-content', minWidth: '200px' }}
                >
                  <div className="flex items-center h-full">
                    <div className="w-12 p-4 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === patients.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className={cn(
                      "flex-1 px-6 py-3 cursor-pointer select-none",
                      "min-h-[4rem] h-16",
                      "text-gray-700 dark:text-gray-200 font-semibold",
                      "flex items-center justify-center"
                    )}>
                      <div className="text-center text-sm uppercase tracking-wider">N° Dossier</div>
                    </div>
                  </div>
                </th>
                {/* Autres colonnes */}
                {columns
                  .filter(column => column.visible && column.id !== 'fileNumber')
                  .map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      className={cn(
                        "px-6 py-3 cursor-pointer select-none whitespace-normal sticky top-0",
                        "min-h-[4rem] h-16",
                        "text-white dark:text-white font-semibold",
                        "text-center",
                        {
                          "min-w-[150px]": column.id === "practitioner",
                          "min-w-[180px]": column.id === "lastModified",
                          "min-w-[200px]": column.id === "medicalHistory" || column.id === "firstMenstruation" || column.id === "additionalInfo" || column.id === "motives"
                        }
                      )}
                      onClick={() => handleToggleColumn(column.id)}
                    >
                      <Tooltip text={column.name}>
                        <div className="flex items-center justify-center h-full">
                          <div className="line-clamp-2 text-center">{column.name}</div>
                        </div>
                      </Tooltip>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
              {sortedPatients.map((patient) => (
                <tr key={patient.id}>
                  {/* Groupe des colonnes fixes */}
                  <td 
                    className="sticky left-0 z-20 bg-white dark:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                  >
                    <div className="flex items-center">
                      <div className="w-12 px-2 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(patient.id)}
                          onChange={() => handleSelectRow(patient.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div className="flex-1 px-2 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPatient({ patient, focusedField: "prescription" });
                              }}
                              className="w-5 h-5 flex items-center justify-center text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded"
                            >
                              P
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPatient({ patient, focusedField: "treatment" });
                              }}
                              className="w-5 h-5 flex items-center justify-center text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                            >
                              T
                            </button>
                          </div>
                          <span
                            onClick={() => setEditingPatient({ patient })}
                            className="cursor-pointer hover:text-[var(--theme-color)]"
                          >
                            {patient.fileNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Autres colonnes */}
                  {columns
                    .filter(column => column.visible && column.id !== 'fileNumber')
                    .map((column) => (
                      <td
                        key={column.id}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white cursor-pointer text-center"
                        onClick={() => handleCellClick(patient, column.id)}
                      >
                        {renderCellContent(patient, column)}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmer la suppression"
        >
          <p className="text-gray-500 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer {selectedRows.length} patient(s) ?
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </Modal>
      )}

      {editingPatient && (
        <PatientEditModal
          isOpen={true}
          onClose={() => setEditingPatient(null)}
          patient={editingPatient.patient}
          focusedField={editingPatient.focusedField}
          fields={fields}
          categories={categories}
          practitioners={practitionersData}
          onSave={handleSavePatient}
          columnVisibility={columnVisibility}
        />
      )}

      {/* Modal de visibilité des colonnes */}
      <ColumnVisibilityModal
        isOpen={showColumnVisibilityModal}
        onClose={onCloseColumnVisibilityModal}
        columns={allColumns.map(column => ({
          id: column.id,
          name: column.name,
          visible: columnVisibility[column.id] ?? true,
          canHide: column.canHide
        }))}
        onToggleColumn={onToggleColumnVisibility}
        columnVisibility={columnVisibility}
        currentView={currentView}
        practitioners={practitioners}
        onTogglePractitioner={onTogglePractitioner}
      />

      <CreatePatientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        columnVisibility={columnVisibility}
      />
    </div>
  );
}