import React from 'react';
import { ArchPrescription, UnitPrescription } from '../types/prescription';
import { defaultPrescriptionCategories } from '../constants/prescriptionCategories';

interface ArchPrescriptionProps {
  title: string;
  prescription: ArchPrescription;
  onChange: (updates: Partial<ArchPrescription>) => void;
  toothRange: [number, number];
  defaultBrand?: string;
}

export default function ArchPrescriptionComponent({
  title,
  prescription,
  onChange,
  defaultBrand
}: ArchPrescriptionProps) {
  const bracketBrands = defaultPrescriptionCategories.find(c => c.id === 'bracket_brand')?.items || [];
  const bracketTypes = defaultPrescriptionCategories.find(c => c.id === 'bracket_type')?.items || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marque des BK
            </label>
            <select
              value={prescription.brand}
              onChange={(e) => onChange({ brand: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner une marque</option>
              {bracketBrands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de Bracket
            </label>
            <select
              value={prescription.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner un type</option>
              {bracketTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}