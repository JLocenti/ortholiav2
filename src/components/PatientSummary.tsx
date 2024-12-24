import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../types/patient';
import { ClipboardCopy, PenSquare, X, ClipboardList, Stethoscope, Activity, Bone, CircleDot, FileText } from 'lucide-react';
import PatientEditModal from './modals/PatientEditModal';
import { usePatients } from '../context/PatientContext';
import { usePrescription } from '../context/PrescriptionContext';
import { SpecialCase } from '../types/prescription';

interface PatientSummaryProps {
  patient: Patient;
  onClose: () => void;
}

const CATEGORY_ICONS = {
  general: ClipboardList,
  clinical: Stethoscope,
  functional: Activity,
  skeletal: Bone,
  dental: CircleDot
};

export default function PatientSummary({ patient, onClose }: PatientSummaryProps) {
  const navigate = useNavigate();
  const { updatePatient } = usePatients();
  const { getPatientPrescription, updatePatientPrescription } = usePrescription();
  const [editingField, setEditingField] = useState<{ fieldId: string } | null>(null);
  const [localPatient, setLocalPatient] = React.useState(patient);
  const [prescription, setPrescription] = React.useState(null);

  React.useEffect(() => {
    const loadPrescription = async () => {
      try {
        const data = await getPatientPrescription(patient.id);
        setPrescription(data || null);
      } catch (error) {
        console.error('Error loading prescription:', error);
      }
    };
    loadPrescription();
  }, [patient.id, getPatientPrescription]);

  const renderValue = (questionId: string, value: any) => {
    return value || '-';
  };

  const handleCopySection = async (categoryId: string) => {
    const category = patient.categories.find(c => c.id === categoryId);
    
    let text = `${category?.name}\n\n`;
    category.fields.forEach(field => {
      const value = localPatient.fields[categoryId][field.id];
      if (value) {
        text += `${field.id}: ${renderValue(field.id, value)}\n`;
      }
    });

    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEditField = (fieldId: string) => {
    setEditingField({ fieldId });
  };

  const handleSaveField = async (patientId: string, fieldId: string, value: any) => {
    try {
      await updatePatient(patientId, { [fieldId]: value });
      
      setLocalPatient(prev => ({
        ...prev,
        [fieldId]: value,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handlePrescriptionChange = async (arch: 'maxillary' | 'mandibular', updates: any) => {
    if (!prescription) return;
    
    const updatedPrescription = {
      ...prescription,
      [arch]: {
        ...prescription[arch],
        ...updates
      }
    };

    try {
      await updatePatientPrescription(patient.id, updatedPrescription);
      setPrescription(updatedPrescription);
    } catch (error) {
      console.error('Error updating prescription:', error);
    }
  };

  const renderPrescriptionSection = () => {
    if (!prescription) return null;

    const bracketBrands = prescription.bracketBrands || [];
    const bracketTypes = prescription.bracketTypes || [];

    const renderArchSettings = (arch: 'maxillary' | 'mandibular', title: string) => (
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{title}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Marque des BK
            </label>
            <select
              value={prescription[arch].brand}
              onChange={(e) => handlePrescriptionChange(arch, { brand: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
            >
              <option value="">Sélectionner</option>
              {bracketBrands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Type de Bracket
            </label>
            <select
              value={prescription[arch].type}
              onChange={(e) => handlePrescriptionChange(arch, { type: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
            >
              <option value="">Sélectionner</option>
              {bracketTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );

    const allSpecialCases = [
      ...prescription.maxillary.specialCases.map(sc => ({ ...sc, arch: 'maxillary' as const })),
      ...prescription.mandibular.specialCases.map(sc => ({ ...sc, arch: 'mandibular' as const }))
    ].sort((a, b) => a.toothNumber - b.toothNumber);

    return (
      <div className="space-y-6">
        {renderArchSettings('maxillary', 'Maxillaire')}
        {renderArchSettings('mandibular', 'Mandibule')}
        
        {allSpecialCases.length > 0 && (
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Cas Particuliers ({allSpecialCases.length})
            </h4>
            <div className="space-y-4">
              {allSpecialCases.map((specialCase) => (
                <div 
                  key={specialCase.id}
                  className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dent {specialCase.toothNumber} ({specialCase.arch === 'maxillary' ? 'Maxillaire' : 'Mandibule'})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Marque:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {bracketBrands.find(b => b.id === specialCase.brand)?.name || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {bracketTypes.find(t => t.id === specialCase.type)?.name || '-'}
                      </span>
                    </div>
                  </div>
                  {specialCase.positions.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Positions:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {specialCase.positions.map(position => (
                          <span
                            key={position}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                          >
                            {position}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, icon: React.ReactNode, content: React.ReactNode, onCopy?: () => void) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
            title="Copier la section"
          >
            <ClipboardCopy className="w-4 h-4" />
          </button>
        )}
      </div>
      {content}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-4 sm:inset-8 md:inset-16 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Synthèse : {localPatient.fileNumber || '-'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div className="space-y-8">
            {prescription && (
              <div key="prescription">
                {renderSection(
                  "Prescription",
                  <FileText className="w-5 h-5 text-[var(--theme-color)]" />,
                  renderPrescriptionSection()
                )}
              </div>
            )}

            {patient.categories.map(category => {
              const Icon = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS];

              return (
                <div key={category.id}>
                  {renderSection(
                    category.name,
                    Icon && <Icon className="w-5 h-5 text-[var(--theme-color)]" />,
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(category.fields).map(([fieldId, value]) => (
                        <div
                          key={fieldId}
                          className="bg-white dark:bg-gray-700 p-4 rounded-lg"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {fieldId}
                            </div>
                            <button
                              onClick={() => handleEditField(fieldId)}
                              className="p-1.5 text-gray-400 hover:text-[var(--theme-color)] dark:text-gray-500 dark:hover:text-[var(--theme-color)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                              title="Modifier"
                            >
                              <PenSquare className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white mt-1">
                            {renderValue(fieldId, value)}
                          </div>
                        </div>
                      ))}
                    </div>,
                    () => handleCopySection(category.id)
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {editingField && (
          <PatientEditModal
            isOpen={true}
            onClose={() => setEditingField(null)}
            patient={localPatient}
            fields={patient.categories.flatMap(category => Object.keys(category.fields).map(fieldId => ({ id: fieldId, question: fieldId })))}
            onSave={async (patientId, fieldId, value) => {
              await handleSaveField(patientId, fieldId, value);
              setEditingField(null);
            }}
            focusedFieldId={editingField.fieldId}
          />
        )}
      </div>
    </div>
  );
}