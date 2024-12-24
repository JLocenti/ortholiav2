import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { Patient } from '../types/view';
import { Question } from '../types/patient';
import { defaultQuestions } from '../constants/defaultQuestions';
import { Mic, Settings, FileText, Save } from 'lucide-react';
import VoiceDictation from './VoiceDictation';
import Modal from './Modal';
import OpenAIConfig from './OpenAIConfig';
import SelectionButton from './SelectionButton';

interface PatientDetailsModalProps {
  patient: Patient;
  onClose: () => void;
  isNewPatient?: boolean;
}

export default function PatientDetailsModal({ 
  patient, 
  onClose,
  isNewPatient = false 
}: PatientDetailsModalProps) {
  const navigate = useNavigate();
  const { updatePatient } = usePatients();
  const [error, setError] = useState<string | null>(null);
  const [showDictation, setShowDictation] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [patientData, setPatientData] = useState<Record<string, any>>(() => {
    const initialData = { ...patient };
    defaultQuestions
      .filter(q => q.type === 'radio' || q.type === 'multiple')
      .forEach(q => {
        if (!(q.id in initialData)) {
          initialData[q.id] = q.type === 'multiple' ? [] : '';
        }
      });
    return initialData;
  });

  const handleInputChange = (questionId: string, value: any) => {
    setPatientData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSelectionChange = (question: Question, value: string) => {
    let newValue;
    if (question.type === 'multiple') {
      const currentValues = Array.isArray(patientData[question.id]) ? patientData[question.id] : [];
      newValue = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
    } else {
      newValue = patientData[question.id] === value ? '' : value;
    }
    
    handleInputChange(question.id, newValue);
  };

  const handleDictationComplete = (analyzedData: Record<string, any>) => {
    setPatientData(prev => ({
      ...prev,
      ...analyzedData
    }));
    setShowDictation(false);
  };

  const handleSave = async () => {
    try {
      const timestamp = new Date().toISOString();
      const updatedData = {
        ...patientData,
        updatedAt: timestamp
      };

      await updatePatient(patient.id, updatedData);
      setError(null);
      onClose();
    } catch (err) {
      console.error('Error saving patient:', err);
      setError('Une erreur est survenue lors de la sauvegarde du patient');
    }
  };

  const handlePrescriptionClick = () => {
    onClose();
    navigate(`/app/patient-prescription/${patient.id}`);
  };

  const renderField = (question: Question) => {
    const value = patientData[question.id];

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            required
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            required
          />
        );

      case 'radio':
      case 'multiple':
        return (
          <div className="flex flex-wrap gap-2">
            {question.choices?.map(choice => (
              <SelectionButton
                key={choice.id}
                text={choice.text}
                isSelected={
                  question.type === 'multiple'
                    ? Array.isArray(value) && value.includes(choice.id)
                    : value === choice.id
                }
                color={choice.color}
                onClick={() => handleSelectionChange(question, choice.id)}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-h-[85vh] overflow-y-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Numéro de dossier
          </label>
          <input
            type="text"
            value={patientData.fileNumber || ''}
            onChange={(e) => handleInputChange('fileNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ex: 2024-001"
          />
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={handlePrescriptionClick}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Prescription"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDictation(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Dictée vocale"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Configuration OpenAI"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {defaultQuestions.map(question => (
          <div key={question.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {question.text}
              </h3>
              {question.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {question.description}
                </p>
              )}
            </div>

            {renderField(question)}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Enregistrer
        </button>
      </div>

      <Modal
        isOpen={showDictation}
        onClose={() => setShowDictation(false)}
        title="Dictée vocale"
      >
        <VoiceDictation onAnalysisComplete={handleDictationComplete} />
      </Modal>

      <Modal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Configuration OpenAI"
      >
        <OpenAIConfig />
      </Modal>
    </div>
  );
}