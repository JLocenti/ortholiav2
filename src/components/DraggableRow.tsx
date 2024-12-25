import React, { useState } from 'react';
import { Patient } from '../types/view';
import { Search } from 'lucide-react';
import PatientSummary from './PatientSummary';

interface DraggableRowProps {
  patient: Patient;
  index: number;
  isSelected: boolean;
  formatDate: (dateString?: string) => string;
  onPatientClick: (patient: Patient) => void;
  onSelect: (patientId: string) => void;
  columns: { id: string; name: string }[];
}

export default function DraggableRow({
  patient,
  isSelected,
  formatDate,
  onPatientClick,
  onSelect,
  columns
}: DraggableRowProps) {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <>
      <tr
        className={`group transition-all duration-200 ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 p-4 w-12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(patient.id)}
            className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-opacity ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:opacity-100'
            }`}
          />
        </td>
        {columns.map(column => (
          <td
            key={column.id}
            className={`p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ${
              column.id === 'fileNumber'
                ? 'sticky left-12 z-10 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
                : ''
            }`}
          >
            {column.id === 'fileNumber' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSummary(true)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group-hover:opacity-100"
                  title="Voir la synthèse"
                >
                  <Search className="w-4 h-4 text-gray-400 hover:text-[var(--theme-color)] dark:text-gray-500 dark:hover:text-[var(--theme-color)]" />
                </button>
                <button
                  onClick={() => onPatientClick(patient)}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-[var(--theme-color)]"
                >
                  {patient.fileNumber || '-'}
                </button>
              </div>
            ) : column.id === 'updatedAt' ? (
              formatDate(patient.updatedAt)
            ) : (
              patient[column.id] || '-'
            )}
          </td>
        ))}
      </tr>

      {showSummary && (
        <PatientSummary 
          patient={patient} 
          onClose={() => setShowSummary(false)} 
        />
      )}
    </>
  );
}