import React from 'react';
import { Plus } from 'lucide-react';
import { Choice } from '../../types/patient';
import ChoicesList from './ChoicesList';

interface ChoicesManagerProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

export default function ChoicesManager({ choices, onChange }: ChoicesManagerProps) {
  const addChoice = () => {
    const newChoice: Choice = {
      id: `choice_${Date.now()}`,
      text: '',
      color: '#3B82F6'
    };
    onChange([...choices, newChoice]);
  };

  const deleteChoice = (choiceId: string) => {
    onChange(choices.filter(choice => choice.id !== choiceId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Choix disponibles
        </label>
        <button
          type="button"
          onClick={addChoice}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un choix
        </button>
      </div>

      {choices.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Aucun choix défini. Cliquez sur "Ajouter un choix" pour commencer.
        </p>
      ) : (
        <ChoicesList
          choices={choices}
          onUpdate={onChange}
          onDelete={deleteChoice}
        />
      )}
    </div>
  );
}