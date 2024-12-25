import React from 'react';
import { Trash2 } from 'lucide-react';
import { Choice } from '../../types/patient';
import ColorPicker from '../ColorPicker';

interface ChoicesListProps {
  choices: Choice[];
  onUpdate: (choices: Choice[]) => void;
  onDelete: (choiceId: string) => void;
}

export default function ChoicesList({ choices, onUpdate, onDelete }: ChoicesListProps) {
  const handleChoiceChange = (choiceId: string, field: keyof Choice, value: string) => {
    const updatedChoices = choices.map(choice =>
      choice.id === choiceId ? { ...choice, [field]: value } : choice
    );
    onUpdate(updatedChoices);
  };

  return (
    <div className="space-y-2">
      {choices.map(choice => (
        <div key={choice.id} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg group">
          <input
            type="text"
            value={choice.text}
            onChange={(e) => handleChoiceChange(choice.id, 'text', e.target.value)}
            className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            placeholder="Texte du choix"
          />
          
          <ColorPicker
            selectedColor={choice.color}
            onSelect={(color) => handleChoiceChange(choice.id, 'color', color)}
          />
          
          <button
            onClick={() => onDelete(choice.id)}
            className="p-1.5 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}