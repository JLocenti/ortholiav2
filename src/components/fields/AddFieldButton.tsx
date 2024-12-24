import React from 'react';
import { Plus } from 'lucide-react';

interface AddFieldButtonProps {
  onClick: () => void;
}

export default function AddFieldButton({ onClick }: AddFieldButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Ajouter un champ
    </button>
  );
}