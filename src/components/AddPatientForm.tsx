import React, { useState } from 'react';
import { Patient, patientFields } from '../types/patient';

interface AddPatientFormProps {
  onSubmit: (patient: Omit<Patient, 'id'>) => void;
  onCancel: () => void;
}

export default function AddPatientForm({ onSubmit, onCancel }: AddPatientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    treatment: '',
    practitioner: '',
    firstWaveDate: '',
    plannedTreatment: '',
    medicalHistory: '',
    payment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(patientFields).map(([field, label]) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <input
            type={field === 'firstWaveDate' ? 'date' : 'text'}
            value={formData[field as keyof typeof formData]}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              [field]: e.target.value
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      ))}

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
}