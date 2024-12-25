import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SpecialCase, POSITIONS } from '../types/prescription';
import { defaultPrescriptionCategories } from '../constants/prescriptionCategories';

interface SpecialCasesSectionProps {
  specialCases: (SpecialCase & { arch: 'maxillary' | 'mandibular' })[];
  onAddCase: (arch: 'maxillary' | 'mandibular') => void;
  onDeleteCase: (arch: 'maxillary' | 'mandibular', caseId: string) => void;
  onUpdateCase: (arch: 'maxillary' | 'mandibular', caseId: string, updates: Partial<SpecialCase>) => void;
}

export default function SpecialCasesSection({
  specialCases,
  onAddCase,
  onDeleteCase,
  onUpdateCase
}: SpecialCasesSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newToothNumber, setNewToothNumber] = useState('');
  const [newBracket, setNewBracket] = useState<Partial<SpecialCase>>({
    toothNumber: 0,
    brand: '',
    type: '',
    positions: []
  });
  const bracketBrands = defaultPrescriptionCategories.find(c => c.id === 'bracket_brand')?.items || [];
  const bracketTypes = defaultPrescriptionCategories.find(c => c.id === 'bracket_type')?.items || [];

  const handleAddBracket = () => {
    const toothNumber = parseInt(newToothNumber);
    if (!toothNumber) return;

    const arch = toothNumber >= 11 && toothNumber <= 28 ? 'maxillary' : 
                toothNumber >= 31 && toothNumber <= 48 ? 'mandibular' : null;

    if (arch) {
      onAddCase(arch);
      setShowAddModal(false);
      setNewToothNumber('');
      setNewBracket({
        toothNumber: 0,
        brand: '',
        type: '',
        positions: []
      });
    }
  };

  const getArchLabel = (toothNumber: number) => {
    if (toothNumber >= 11 && toothNumber <= 28) return 'Maxillaire';
    if (toothNumber >= 31 && toothNumber <= 48) return 'Mandibule';
    return '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Cas Particuliers ({specialCases.length})
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--theme-color)] hover:bg-opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Bracket
        </button>
      </div>

      <div className="space-y-4">
        {specialCases.map((specialCase) => (
          <div 
            key={specialCase.id}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dent {specialCase.toothNumber} ({specialCase.arch === 'maxillary' ? 'Maxillaire' : 'Mandibule'})
              </span>
              <button
                onClick={() => onDeleteCase(specialCase.arch, specialCase.id)}
                className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Marque des BK
                </label>
                <select
                  value={specialCase.brand}
                  onChange={(e) => onUpdateCase(specialCase.arch, specialCase.id, { brand: e.target.value })}
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
                  value={specialCase.type}
                  onChange={(e) => onUpdateCase(specialCase.arch, specialCase.id, { type: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner</option>
                  {bracketTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Positions
              </label>
              <div className="flex flex-wrap gap-2">
                {POSITIONS.map(position => (
                  <button
                    key={position.id}
                    onClick={() => {
                      const newPositions = specialCase.positions.includes(position.id)
                        ? specialCase.positions.filter(p => p !== position.id)
                        : [...specialCase.positions, position.id];
                      onUpdateCase(specialCase.arch, specialCase.id, { positions: newPositions });
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      specialCase.positions.includes(position.id)
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
        ))}

        {specialCases.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun cas particulier
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">
                Dent {newToothNumber} {newToothNumber && `(${getArchLabel(parseInt(newToothNumber))})`}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Numéro de dent
                </label>
                <input
                  type="number"
                  min="11"
                  max="48"
                  value={newToothNumber}
                  onChange={(e) => setNewToothNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  placeholder="11-28 pour maxillaire, 31-48 pour mandibule"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marque des BK
                </label>
                <div className="relative">
                  <select
                    value={newBracket.brand}
                    onChange={(e) => setNewBracket(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white appearance-none"
                  >
                    <option value="">Sélectionner</option>
                    {bracketBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de Bracket
                </label>
                <div className="relative">
                  <select
                    value={newBracket.type}
                    onChange={(e) => setNewBracket(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white appearance-none"
                  >
                    <option value="">Sélectionner</option>
                    {bracketTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Positions
                </label>
                <div className="flex flex-wrap gap-2">
                  {POSITIONS.map(position => (
                    <button
                      key={position.id}
                      onClick={() => {
                        const newPositions = newBracket.positions?.includes(position.id)
                          ? newBracket.positions.filter(p => p !== position.id)
                          : [...(newBracket.positions || []), position.id];
                        setNewBracket(prev => ({ ...prev, positions: newPositions }));
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        newBracket.positions?.includes(position.id)
                          ? 'bg-[var(--theme-color)] text-white'
                          : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      {position.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddBracket}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-color)] rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}