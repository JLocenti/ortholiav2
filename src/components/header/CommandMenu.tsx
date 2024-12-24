import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, X, Clock } from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import PatientEditModal from '../modals/PatientEditModal';
import { defaultQuestions } from '../../constants/defaultQuestions';
import { Patient } from '../../types/view';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { patients, updatePatient } = usePatients();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const filteredPatients = query
    ? patients
        .filter(patient => 
          patient.fileNumber?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const handlePatientSelect = (fileNumber: string) => {
    const patient = patients.find(p => p.fileNumber === fileNumber);
    if (patient) {
      // Update recent searches
      const newRecent = [fileNumber, ...recentSearches.filter(s => s !== fileNumber)].slice(0, 3);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));

      // Set selected patient and close command menu
      setSelectedPatient(patient);
      onClose();
    }
  };

  const handlePatientUpdate = async (patientId: string, fieldId: string, value: any) => {
    try {
      await updatePatient(patientId, { [fieldId]: value });
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleCloseEditModal = () => {
    setSelectedPatient(null);
  };

  const activeQuestions = defaultQuestions.map(q => ({
    id: q.id,
    question: q
  }));

  if (!isOpen && !selectedPatient) return null;

  return (
    <>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un numéro de dossier..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div className="flex items-center gap-2">
                <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </kbd>
                <button onClick={onClose}>
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {/* Search Results */}
              {filteredPatients.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Résultats
                  </div>
                  {filteredPatients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient.fileNumber)}
                      className="w-full text-left px-2 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      {patient.fileNumber}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !query && (
                <div>
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recherches récentes
                  </div>
                  {recentSearches.map(fileNumber => (
                    <button
                      key={fileNumber}
                      onClick={() => handlePatientSelect(fileNumber)}
                      className="w-full text-left px-2 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      {fileNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {selectedPatient && (
        <PatientEditModal
          isOpen={true}
          onClose={handleCloseEditModal}
          patient={selectedPatient}
          fields={activeQuestions}
          onSave={handlePatientUpdate}
        />
      )}
    </>
  );
}