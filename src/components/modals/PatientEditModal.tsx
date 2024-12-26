import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Patient } from '../../types/database';
import { Question, Category } from '../../types/patient';
import { PatientPrescription, UnitPrescription } from '../../types/prescription';
import Modal from '../Modal';
import { cn } from '../../lib/utils';
import { Menu } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { X, Trash2 } from 'lucide-react';
import DeletePrescriptionConfirmationModal from './DeletePrescriptionConfirmationModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const predefinedColors = [
  '#4287f5', // blue
  '#f54242', // red
  '#42f554', // green
  '#f5a442', // orange
  '#9b42f5', // purple
  '#f542e6', // pink
  '#42f5e6', // cyan
  '#f5e642', // yellow
];

interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  focusedField?: string;
  fields: Question[];
  categories: Category[];
  practitioners: Record<string, any>;
  allowMultiplePractitioners?: boolean;
  onSave: (updatedPatient: Partial<Patient>) => Promise<boolean>;
  columnVisibility: Record<string, boolean>;
}

interface Position {
  id: string;
  name: string;
  color: string;
}

interface Choice {
  id: string;
  text: string;
  color: string;
}

const TEETH_ROWS = [
  ['11', '12', '13', '14', '15', '16', '17'],
  ['21', '22', '23', '24', '25', '26', '27'],
  ['31', '32', '33', '34', '35', '36', '37'],
  ['41', '42', '43', '44', '45', '46', '47']
];

const PatientEditModal: React.FC<PatientEditModalProps> = ({
  isOpen,
  onClose,
  patient,
  focusedField,
  fields: initialFields,
  categories,
  practitioners,
  allowMultiplePractitioners = false,
  onSave,
  columnVisibility
}) => {
  const [localFormData, setLocalFormData] = useState<any>(null);
  const [debouncedFormData, setDebouncedFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldsData, setFieldsData] = useState<Record<string, Question>>({});
  const [fields, setFields] = useState<Question[]>([]);
  const [isSimplePrescriptionOpen, setIsSimplePrescriptionOpen] = useState(false);

  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [positions, setPositions] = useState<Choice[]>([]);
  const [bracketBrands, setBracketBrands] = useState<Choice[]>([]);
  const [bracketTypes, setBracketTypes] = useState<Choice[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedBracketBrand, setSelectedBracketBrand] = useState<string>('');
  const [selectedTorqueType, setSelectedTorqueType] = useState<string>('');
  const [prescriptions, setPrescriptions] = useState<Record<string, PatientPrescription>>(
    patient.prescriptions || {
      'default': {
        name: 'Prescription 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        maxillary: {
          bracketBrand: '',
          torqueType: '',
          position: ''
        },
        mandibular: {
          bracketBrand: '',
          torqueType: '',
          position: ''
        },
        unitPrescriptions: []
      }
    }
  );
  const [debouncedPrescriptions, setDebouncedPrescriptions] = useState<Record<string, PatientPrescription>>(
    patient.prescriptions || {}
  );
  const [activePrescriptionId, setActivePrescriptionId] = useState<string>(
    Object.keys(patient.prescriptions || { 'default': null })[0] || 'default'
  );
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [existingPrescriptionIds, setExistingPrescriptionIds] = useState<string[]>([]);

  const [deletingPrescriptionId, setDeletingPrescriptionId] = useState<string | null>(null);

  const focusedFieldRef = React.useRef<HTMLDivElement>(null);

  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollHorizontal = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // Ajustez selon vos besoins
      const currentScroll = scrollContainerRef.current.scrollLeft;
      
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' 
          ? currentScroll - scrollAmount 
          : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const loadFieldsData = async () => {
      try {
        const fieldsCollection = collection(db, 'fields');
        const fieldsSnapshot = await getDocs(fieldsCollection);
        const fieldsMap: Record<string, Question> = {};
        
        fieldsSnapshot.forEach((doc) => {
          const fieldData = doc.data();
          console.log('Field data from Firebase:', doc.id, fieldData);
          
          // Ensure choices are properly structured
          if (fieldData.choices && Array.isArray(fieldData.choices)) {
            fieldData.choices = fieldData.choices.map((choice: any, index: number) => {
              if (typeof choice === 'string') {
                return {
                  id: `choice_${index}`,
                  text: choice,
                  color: predefinedColors[index % predefinedColors.length]
                };
              }
              return {
                id: choice.id || `choice_${index}`,
                text: choice.text,
                color: choice.color || predefinedColors[index % predefinedColors.length]
              };
            });
          } else {
            fieldData.choices = [];
          }
          
          fieldsMap[doc.id] = fieldData as Question;
          console.log('Processed field:', doc.id, fieldsMap[doc.id]);
        });
        
        setFieldsData(fieldsMap);
      } catch (error) {
        console.error('Error loading fields:', error);
      }
    };

    if (isOpen) {
      loadFieldsData();
    }
  }, [isOpen]);

  useEffect(() => {
    const loadFieldChoices = async () => {
      try {
        const fieldsSnapshot = await getDocs(collection(db, 'fields'));
        const fields = fieldsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const positionsField = fields.find(field => field.text === 'Positions possibles');
        if (positionsField) {
          setPositions(positionsField.choices || []);
        }

        const bracketsField = fields.find(field => field.text === 'Marques de brackets');
        if (bracketsField) {
          setBracketBrands(bracketsField.choices || []);
        }

        const torqueField = fields.find(field => field.text === 'Types de torque');
        if (torqueField) {
          setBracketTypes(torqueField.choices || []);
        }
      } catch (error) {
        console.error('Error loading field choices:', error);
      }
    };

    if (isOpen) {
      loadFieldChoices();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Utiliser tous les champs sans filtrage
      setFields(initialFields);
    }
  }, [isOpen, initialFields]);

  useEffect(() => {
    if (isOpen) {
      const initialData = {
        fileNumber: patient.fileNumber || '',
        practitioner: patient.practitioner || (allowMultiplePractitioners ? [] : ''),
        ...patient.fields
      };
      setLocalFormData(initialData);
      setDebouncedFormData(initialData);
    }
  }, [patient, allowMultiplePractitioners]);

  useEffect(() => {
    if (!debouncedFormData) return;

    const timer = setTimeout(() => {
      saveChanges(debouncedFormData);
    }, 1000);

    return () => clearTimeout(timer);
  }, [debouncedFormData]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const updatedPatient: Partial<Patient> = {
        ...patient,
        prescriptions: prescriptions,
        updatedAt: new Date().toISOString()
      };

      onSave(updatedPatient).catch(error => {
        console.error('Erreur lors de la sauvegarde des prescriptions:', error);
        // En cas d'erreur, revenir aux prescriptions précédentes
        setPrescriptions(patient.prescriptions || {});
        setDebouncedPrescriptions(patient.prescriptions || {});
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [debouncedPrescriptions]);

  useEffect(() => {
    if (patient.prescriptions) {
      setExistingPrescriptionIds(Object.keys(patient.prescriptions));
    }
  }, [patient.prescriptions]);

  useEffect(() => {
    const hasFormChanges = JSON.stringify(localFormData) !== JSON.stringify({
      fileNumber: patient.fileNumber || '',
      practitioner: patient.practitioner || (allowMultiplePractitioners ? [] : ''),
      ...patient.fields
    });

    const hasPrescriptionChanges = JSON.stringify(prescriptions) !== JSON.stringify(patient.prescriptions || {});

    setHasChanges(hasFormChanges || hasPrescriptionChanges);
  }, [localFormData, prescriptions, patient, allowMultiplePractitioners]);

  const saveChanges = async (formData: any) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const updatedPatient: Partial<Patient> = {
        fileNumber: formData.fileNumber,
        practitioner: formData.practitioner,
        fields: { ...formData },
        updatedAt: new Date().toISOString()
      };

      await onSave(updatedPatient);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBasicInfoChange = (field: string, value: string) => {
    handleFieldChange(field, value);
  };

  const handlePractitionerChange = (practitionerId: string, allowMultiple: boolean) => {
    setLocalFormData(prev => {
      let newPractitioner;
      
      if (allowMultiple) {
        const currentPractitioners = Array.isArray(prev.practitioner) ? prev.practitioner : [];
        newPractitioner = currentPractitioners.includes(practitionerId)
          ? currentPractitioners.filter(id => id !== practitionerId)
          : [...currentPractitioners, practitionerId];
      } else {
        newPractitioner = prev.practitioner === practitionerId ? '' : practitionerId;
      }

      const newFormData = {
        ...prev,
        practitioner: newPractitioner
      };

      // Debounce la sauvegarde
      setDebouncedFormData(newFormData);
      return newFormData;
    });
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    const newFormData = {
      ...localFormData,
      [fieldId]: value
    };

    // Mettre à jour immédiatement l'affichage
    setLocalFormData(newFormData);
    
    // Debounce la sauvegarde
    setDebouncedFormData(newFormData);
  };

  const renderField = (field: Question) => {
    const fieldId = `field-${field.id}`;
    const value = localFormData?.[field.id] ?? '';
    
    return (
      <div 
        key={field.id} 
        id={fieldId}
        className="space-y-2"
      >
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          {field.text}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.type === 'short_text' ? (
          <input
            id={fieldId}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            autoFocus={focusedField === field.id}
          />
        ) : field.type === 'long_text' ? (
          <textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            autoFocus={focusedField === field.id}
          />
        ) : field.type === 'text' ? (
          <input
            id={fieldId}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            autoFocus={focusedField === field.id}
          />
        ) : field.type === 'radio' ? (
          <div className="flex flex-wrap gap-2">
            {field.choices?.map((choice) => {
              const isSelected = value === choice.id;
              return (
                <label key={choice.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`field_${field.id}`}
                    value={choice.id}
                    checked={isSelected}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm",
                      isSelected ? "text-white" : "bg-opacity-10 hover:bg-opacity-20"
                    )}
                    style={{
                      backgroundColor: isSelected ? choice.color : 'transparent',
                      color: isSelected ? 'white' : choice.color,
                      border: `2px solid ${choice.color}`,
                    }}
                  >
                    {choice.text}
                  </div>
                </label>
              );
            })}
          </div>
        ) : field.type === 'multiple' ? (
          <div className="flex flex-wrap gap-2">
            {field.choices?.map((choice) => {
              const values = Array.isArray(value) ? value : [];
              const isSelected = values.includes(choice.id);
              return (
                <label key={choice.id} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name={`field_${field.id}`}
                    value={choice.id}
                    checked={isSelected}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...values, choice.id]
                        : values.filter(v => v !== choice.id);
                      handleFieldChange(field.id, newValues);
                    }}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm",
                      isSelected ? "text-white" : "bg-opacity-10 hover:bg-opacity-20"
                    )}
                    style={{
                      backgroundColor: isSelected ? choice.color : 'transparent',
                      color: isSelected ? 'white' : choice.color,
                      border: `2px solid ${choice.color}`,
                    }}
                  >
                    {choice.text}
                  </div>
                </label>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const renderContent = () => {
    const category = categories.find(c => c.id === activeTab);
    if (!category) return null;

    // Si c'est la catégorie prescription, afficher l'interface de prescription
    if (category.name.toLowerCase() === 'prescription') {
      const activePrescription = prescriptions[activePrescriptionId];
      if (!activePrescription) return null;  // Protection contre les prescriptions non définies

      const modalTitle = (
        <div className="flex items-center space-x-4">
          <span>Prescription</span>
          <div className="flex items-center">
            {Object.keys(prescriptions).length > 3 && (
              <button 
                onClick={() => scrollHorizontal('left')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide flex space-x-2 pb-2 mx-2"
              style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch' 
              }}
            >
              <div className="flex space-x-2">
                {Object.entries(prescriptions).map(([id, prescription]) => (
                  <button
                    key={id}
                    onClick={() => setActivePrescriptionId(id)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                      activePrescriptionId === id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    )}
                  >
                    {prescription.name || `Prescription ${Object.keys(prescriptions).indexOf(id) + 1}`}
                    {/* Bouton de suppression */}
                    {Object.keys(prescriptions).length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Empêche de changer l'onglet actif
                          handleDeletePrescription(id);
                        }}
                        className="ml-2 p-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </button>
                ))}
                
                {/* Bouton Ajouter une prescription */}
                <button
                  onClick={() => {
                    const newId = `prescription_${Date.now()}`;
                    setPrescriptions(prev => ({
                      ...prev,
                      [newId]: {
                        name: `Prescription ${Object.keys(prev).length + 1}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        maxillary: { bracketBrand: '', torqueType: '', position: '' },
                        mandibular: { bracketBrand: '', torqueType: '', position: '' },
                        unitPrescriptions: []
                      }
                    }));
                    setActivePrescriptionId(newId);
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors whitespace-nowrap"
                >
                  + Ajouter une prescription
                </button>
              </div>
            </div>
            {Object.keys(prescriptions).length > 3 && (
              <button 
                onClick={() => scrollHorizontal('right')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      );

      return (
        <div className="space-y-6">
          {modalTitle}
          <div className="grid grid-cols-2 gap-6">
            {/* Arcade Maxillaire */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Arcade Maxillaire</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Marque de brackets <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={activePrescription.maxillary.bracketBrand}
                    onChange={(e) => {
                      const newPrescriptions = {
                        ...prescriptions,
                        [activePrescriptionId]: {
                          ...prescriptions[activePrescriptionId],
                          maxillary: {
                            ...prescriptions[activePrescriptionId].maxillary,
                            bracketBrand: e.target.value
                          },
                          updatedAt: new Date().toISOString()
                        }
                      };
                      setPrescriptions(newPrescriptions);
                      setDebouncedPrescriptions(newPrescriptions);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Sélectionner une marque</option>
                    {bracketBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.text}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type de torque <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={activePrescription.maxillary.torqueType}
                    onChange={(e) => {
                      const newPrescriptions = {
                        ...prescriptions,
                        [activePrescriptionId]: {
                          ...prescriptions[activePrescriptionId],
                          maxillary: {
                            ...prescriptions[activePrescriptionId].maxillary,
                            torqueType: e.target.value
                          },
                          updatedAt: new Date().toISOString()
                        }
                      };
                      setPrescriptions(newPrescriptions);
                      setDebouncedPrescriptions(newPrescriptions);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Sélectionner un type</option>
                    {bracketTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Arcade Mandibulaire */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Arcade Mandibulaire</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Marque de brackets <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={activePrescription.mandibular.bracketBrand}
                    onChange={(e) => {
                      const newPrescriptions = {
                        ...prescriptions,
                        [activePrescriptionId]: {
                          ...prescriptions[activePrescriptionId],
                          mandibular: {
                            ...prescriptions[activePrescriptionId].mandibular,
                            bracketBrand: e.target.value
                          },
                          updatedAt: new Date().toISOString()
                        }
                      };
                      setPrescriptions(newPrescriptions);
                      setDebouncedPrescriptions(newPrescriptions);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Sélectionner une marque</option>
                    {bracketBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.text}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type de torque <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={activePrescription.mandibular.torqueType}
                    onChange={(e) => {
                      const newPrescriptions = {
                        ...prescriptions,
                        [activePrescriptionId]: {
                          ...prescriptions[activePrescriptionId],
                          mandibular: {
                            ...prescriptions[activePrescriptionId].mandibular,
                            torqueType: e.target.value
                          },
                          updatedAt: new Date().toISOString()
                        }
                      };
                      setPrescriptions(newPrescriptions);
                      setDebouncedPrescriptions(newPrescriptions);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Sélectionner un type</option>
                    {bracketTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section des prescriptions unitaires */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Prescriptions unitaires</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Sélection des dents */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sélection des dents <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-7 gap-1">
                    {TEETH_ROWS.map((row, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        {row.map(tooth => (
                          <button
                            key={tooth}
                            onClick={() => handleToothClick(tooth)}
                            className={cn(
                              "p-2 text-sm rounded-md border",
                              selectedTeeth.includes(tooth)
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            {tooth}
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Sélection de la position */}
                <div className="flex flex-col space-y-2">
                  <label className="block text-sm font-medium mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {positions.map((position) => (
                      <label key={position.id} className="cursor-pointer">
                        <input
                          type="radio"
                          checked={selectedPosition === position.id}
                          onChange={() => setSelectedPosition(position.id)}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm",
                            selectedPosition === position.id
                              ? "text-white"
                              : "bg-opacity-10 hover:bg-opacity-20"
                          )}
                          style={{
                            backgroundColor: selectedPosition === position.id ? position.color : 'transparent',
                            color: selectedPosition === position.id ? 'white' : position.color,
                            border: `2px solid ${position.color}`
                          }}
                        >
                          {position.text}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nouveaux menus déroulants pour brackets et torque */}
              <div className="grid grid-cols-2 gap-4">
                {/* Marques de brackets */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Marque de brackets <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBracketBrand}
                    onChange={(e) => setSelectedBracketBrand(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Sélectionner une marque</option>
                    {bracketBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.text}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Types de torque */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type de torque <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTorqueType}
                    onChange={(e) => setSelectedTorqueType(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Sélectionner un type</option>
                    {bracketTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={handleAddUnitPrescription}
                  className={cn(
                    "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                    "text-white bg-indigo-600 hover:bg-indigo-700"
                  )}
                >
                  {existingPrescriptionIds.includes(activePrescriptionId)
                    ? "Modifier la prescription"
                    : "Ajouter la prescription"
                  }
                </button>
              </div>

              {/* Liste des prescriptions unitaires */}
              <div className="space-y-2">
                {Object.entries(
                  activePrescription.unitPrescriptions.reduce((acc, curr) => {
                    if (!acc[curr.position]) {
                      acc[curr.position] = [];
                    }
                    acc[curr.position].push(curr.tooth);
                    return acc;
                  }, {} as Record<string, string[]>)
                ).map(([position, teeth], index) => (
                  <div
                    key={`${position}-${index}`}
                    className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">
                        Dents {teeth.sort().join(', ')} : {getPositionText(position)}
                      </span>
                      {activePrescription.unitPrescriptions.find(p => p.position === position)?.bracketBrand && (
                        <span className="text-sm font-medium">
                          Bracket: {bracketBrands.find(b => b.id === activePrescription.unitPrescriptions.find(p => p.position === position)?.bracketBrand)?.text}
                        </span>
                      )}
                      {activePrescription.unitPrescriptions.find(p => p.position === position)?.torqueType && (
                        <span className="text-sm font-medium">
                          Torque: {bracketTypes.find(t => t.id === activePrescription.unitPrescriptions.find(p => p.position === position)?.torqueType)?.text}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveUnitPrescription(position)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                      title="Supprimer cette prescription"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pour les autres catégories, afficher les champs normalement
    return (
      <div className="space-y-6">
        {fields
          .filter(field => field.category === category.id)
          .map(field => renderField(field))}
      </div>
    );
  };

  const handleToothClick = (tooth: string) => {
    if (selectedTeeth.includes(tooth)) {
      setSelectedTeeth(prev => prev.filter(t => t !== tooth));
    } else {
      setSelectedTeeth(prev => [...prev, tooth]);
    }
  };

  const handlePositionSelect = (position: string) => {
    setSelectedPosition(position);
  };

  const handleAddUnitPrescription = () => {
    // Si tous les champs sont vides, on n'ajoute pas de prescription unitaire
    if (!selectedTeeth.length && !selectedPosition && !selectedBracketBrand && !selectedTorqueType) {
      return;
    }

    const newPrescription = {
      tooth: selectedTeeth.join(', '),
      position: selectedPosition,
      bracketBrand: selectedBracketBrand,
      torqueType: selectedTorqueType
    };

    const newPrescriptions = {
      ...prescriptions,
      [activePrescriptionId]: {
        ...prescriptions[activePrescriptionId],
        unitPrescriptions: [...prescriptions[activePrescriptionId].unitPrescriptions, newPrescription],
        updatedAt: new Date().toISOString()
      }
    };

    setPrescriptions(newPrescriptions);
    setDebouncedPrescriptions(newPrescriptions);

    setHasChanges(true);
    setSelectedTeeth([]);
    setSelectedPosition('');
    setSelectedBracketBrand('');
    setSelectedTorqueType('');
  };

  const handleRemoveUnitPrescription = (position: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prescription unitaire ?')) {
      const newPrescriptions = {
        ...prescriptions,
        [activePrescriptionId]: {
          ...prescriptions[activePrescriptionId],
          unitPrescriptions: prescriptions[activePrescriptionId].unitPrescriptions.filter(
            p => p.position !== position
          ),
          updatedAt: new Date().toISOString()
        }
      };

      setPrescriptions(newPrescriptions);
      setDebouncedPrescriptions(newPrescriptions);

      setHasChanges(true); // Marquer qu'il y a eu des changements
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingPrescriptionId(id);
    setEditingName(name);
  };

  const handleFinishEdit = (id: string) => {
    const newPrescriptions = {
      ...prescriptions,
      [id]: {
        ...prescriptions[id],
        name: editingName,
        updatedAt: new Date().toISOString()
      }
    };

    setPrescriptions(newPrescriptions);
    setDebouncedPrescriptions(newPrescriptions);

    setEditingPrescriptionId(null);
    setEditingName('');
  };

  const handleDeletePrescription = (id: string) => {
    setDeletingPrescriptionId(id);
  };

  const confirmDeletePrescription = async () => {
    if (deletingPrescriptionId) {
      try {
        // Mettre à jour l'état local
        const newPrescriptions = { ...prescriptions };
        delete newPrescriptions[deletingPrescriptionId];
        
        setPrescriptions(newPrescriptions);
        setDebouncedPrescriptions(newPrescriptions);
        setHasChanges(true);
        
        // Supprimer de Firestore
        const fieldsCollection = collection(db, 'fields');
        const fieldsSnapshot = await getDocs(fieldsCollection);
        
        fieldsSnapshot.forEach(async (fieldDoc) => {
          const fieldData = fieldDoc.data();
          if (fieldData.prescriptions && fieldData.prescriptions[deletingPrescriptionId]) {
            const fieldDocRef = doc(db, 'fields', fieldDoc.id);
            
            // Supprimer spécifiquement cette prescription
            const updatedPrescriptions = { ...fieldData.prescriptions };
            delete updatedPrescriptions[deletingPrescriptionId];
            
            await updateDoc(fieldDocRef, {
              prescriptions: updatedPrescriptions
            });
          }
        });
        
        // Si la prescription supprimée était active, activer une autre
        if (deletingPrescriptionId === activePrescriptionId) {
          const remainingIds = Object.keys(newPrescriptions);
          if (remainingIds.length > 0) {
            setActivePrescriptionId(remainingIds[0]);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la prescription :", error);
        // Optionnel : afficher un message d'erreur à l'utilisateur
      }
    }
  };

  const getPositionText = (position: string) => {
    const positionChoice = positions.find(p => p.id === position);
    return positionChoice ? positionChoice.text : '';
  };

  const navigateToPrescription = () => {
    const prescriptionCategory = categories.find(cat => 
      cat.name.toLowerCase() === 'prescription'
    );
    if (prescriptionCategory) {
      setActiveTab(prescriptionCategory.id);
    }
  };

  const canAddPrescription = () => {
    return true; // Toujours permettre l'ajout de prescription
  };

  const handlePrescriptionClick = () => {
    const prescriptionCategory = categories.find(cat => 
      cat.name.toLowerCase() === 'prescription'
    );
    if (prescriptionCategory) {
      setActiveTab(prescriptionCategory.id);
    }
  };

  useEffect(() => {
    if (isOpen && !activeTab && categories.length > 0) {
      // Définir l'onglet actif seulement s'il n'y en a pas déjà un
      if (focusedField === "prescription") {
        const prescriptionCategory = categories.find(cat => 
          cat.name.toLowerCase() === 'prescription'
        );
        if (prescriptionCategory) {
          setActiveTab(prescriptionCategory.id);
        }
      } else if (focusedField === "treatment") {
        const treatmentCategory = categories.find(cat => 
          cat.name.toLowerCase() === 'traitement'
        );
        if (treatmentCategory) {
          setActiveTab(treatmentCategory.id);
        }
      } else if (focusedField) {
        const field = initialFields.find(f => f.id === focusedField);
        if (field && field.category) {
          setActiveTab(field.category);
          // Attendre que le DOM soit mis à jour
          setTimeout(() => {
            const element = document.getElementById(`field-${focusedField}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      } else {
        setActiveTab(categories[0].id);
      }
    }
  }, [isOpen, categories, focusedField, initialFields]);

  useEffect(() => {
    if (!isOpen) {
      setLocalFormData(null);
      setDebouncedFormData(null);
      setHasChanges(false);
    } else {
      const initialData = {
        fileNumber: patient.fileNumber || '',
        practitioner: patient.practitioner || (allowMultiplePractitioners ? [] : ''),
        ...patient.fields
      };
      setLocalFormData(initialData);
      setDebouncedFormData(initialData);
    }
  }, [isOpen, patient, allowMultiplePractitioners]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Patient {patient.fileNumber}
          {isSaving && <span className="ml-2 text-sm text-gray-500">Enregistrement...</span>}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Informations de base fixes en haut */}
      <div className="pt-6 px-4">
        <div className="flex items-center space-x-12 pb-6">
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              N° Dossier
            </label>
            <input
              id="field-fileNumber"
              type="text"
              value={localFormData?.fileNumber || ''}
              onChange={(e) => handleBasicInfoChange('fileNumber', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-white dark:focus:ring-white"
              autoFocus={focusedField === 'fileNumber'}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Praticien
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(practitioners).map((practitioner) => (
                    <label key={practitioner.id} className="cursor-pointer">
                      <input
                        type="radio"
                        checked={localFormData?.practitioner === practitioner.id}
                        onChange={() => handlePractitionerChange(practitioner.id, allowMultiplePractitioners)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm",
                          localFormData?.practitioner === practitioner.id
                            ? "text-white"
                            : "bg-opacity-10 hover:bg-opacity-20"
                        )}
                        style={{
                          backgroundColor: localFormData?.practitioner === practitioner.id ? practitioner.color : 'transparent',
                          color: localFormData?.practitioner === practitioner.id ? 'white' : practitioner.color,
                          border: `2px solid ${practitioner.color}`,
                        }}
                      >
                        {practitioner.name}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  type="button"
                  onClick={handlePrescriptionClick}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Prescription
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const treatmentCategory = categories.find(cat => 
                      cat.name.toLowerCase() === 'traitement'
                    );
                    if (treatmentCategory) {
                      setActiveTab(treatmentCategory.id);
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Traitement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* En-tête avec les onglets */}
      <div className="pt-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto px-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={cn(
                "py-2 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === category.id
                  ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {renderContent()}
      </div>

      {/* Modale de confirmation de suppression */}
      {deletingPrescriptionId && (
        <DeletePrescriptionConfirmationModal
          isOpen={true}
          onClose={() => setDeletingPrescriptionId(null)}
          onConfirm={confirmDeletePrescription}
          prescriptionName={prescriptions[deletingPrescriptionId]?.name || ''}
        />
      )}
    </Modal>
  );
};

export default PatientEditModal;