import React from 'react';
import { Trash2 } from 'lucide-react';
import { SpecialCase, POSITIONS } from '../types/prescription';
import { PrescriptionItem } from '../constants/prescriptionCategories';

interface SpecialCaseFormProps {
  specialCase: SpecialCase;
  onChange: (updates: Partial<SpecialCase>) => void;
  onRemove: () => void;
  toothRange: [number, number];
  bracketBrands: PrescriptionItem[];
  bracketTypes: PrescriptionItem[];
}

export default function SpecialCaseForm({
  specialCase,
  onChange,
  onRemove,
  toothRange,
  bracketBrands,
  bracketTypes
}: SpecialCaseFormProps) {
  const handlePositionToggle = (positionId: string) => {
    const newPositions = specialCase.positions.includes(positionId)
      ? specialCase.positions.filter(p => p !== positionId)
      : [...specialCase.positions, positionId];
    onChange({ positions: newPositions });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Numéro de dent
            </label>
            <input
              type="number"
              min={toothRange[0]}
              max={toothRange[1]}
              value={specialCase.toothNumber}
              onChange={(e) => onChange({ toothNumber: parseInt(e.target.value, 10) })}
              className="w-24 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Marque
            </label>
            <select
              value={specialCase.brand}
              onChange={(e) => onChange({ brand: e.target.value })}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
            >
              <option value="">Sélectionner</option>
              {bracketBrands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={specialCase.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
            >
              <option value="">Sélectionner</option>
              {bracketTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Positionnement
        </label>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map(position => (
            <button
              key={position.id}
              onClick={() => handlePositionToggle(position.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${specialCase.positions.includes(position.id)
                  ? 'bg-[var(--theme-color)] text-white'
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                }`}
            >
              {position.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}