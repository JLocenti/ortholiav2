import React from 'react';
import { clsx } from 'clsx';

interface SelectionButtonProps {
  text: string;
  isSelected: boolean;
  color?: string;
  onClick: () => void;
  className?: string;
  filled?: boolean;
}

const SelectionButton = ({ text, isSelected, color = '#4D7EF9', onClick, className = '', filled = false }: SelectionButtonProps) => {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all',
        isSelected ? 'text-white' : 'text-blue-800 hover:text-blue-900',
        isSelected ? '' : 'hover:bg-blue-100',
        className
      )}
      style={{ 
        backgroundColor: isSelected ? color : `${color}20`,
        borderColor: color,
      }}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

interface Field {
  id: string;
  type: string;
  text: string;
  name?: string;
  description?: string;
  choices?: any[];
  color?: string;
  required?: boolean;
}

interface FieldDisplayProps {
  field: Field;
  value: any;
  practitioners?: Record<string, any>;
  onChange?: (value: any) => void;
  className?: string;
  showLabel?: boolean;
}

const FieldDisplay = ({ field, value, practitioners = {}, onChange, className = '', showLabel = true }: FieldDisplayProps) => {
  const isReadOnly = !onChange;

  // Affichage du texte
  if (field.type === 'short_text' || field.type === 'long_text') {
    return (
      <div className={clsx('space-y-1', className)}>
        {showLabel && <span className="text-gray-900 dark:text-gray-100">{field.text}</span>}
        <div className={clsx(
          'text-gray-900 dark:text-gray-100',
          field.type === 'long_text' ? 'whitespace-pre-wrap' : 'truncate'
        )}>
          {value || ''}
        </div>
      </div>
    );
  }

  // Pour les champs texte
  if (field.type === 'text') {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={isReadOnly}
        className={clsx(
          "w-full px-3 py-2 rounded-md",
          "border border-gray-300 dark:border-gray-600",
          "bg-white dark:bg-gray-700",
          "text-gray-900 dark:text-white",
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          isReadOnly && "opacity-75 cursor-not-allowed"
        )}
        placeholder="Saisir une valeur..."
      />
    );
  }

  // Pour les praticiens
  if (field.type === 'practitioner') {
    const practitionersList = Object.values(practitioners);
    return (
      <div className="flex flex-wrap gap-2">
        {practitionersList.map(practitioner => (
          <SelectionButton
            key={practitioner.id}
            text={practitioner.name}
            isSelected={value === practitioner.id}
            color={practitioner.color || '#4D7EF9'}
            onClick={() => !isReadOnly && onChange?.(practitioner.id)}
            filled={value === practitioner.id}
          />
        ))}
      </div>
    );
  }

  // Pour les choix multiples
  if (field.type === 'multiple') {
    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <div className="flex flex-wrap gap-2">
        {(field.choices || []).map(choice => (
          <SelectionButton
            key={choice.id}
            text={choice.text || choice.name}
            isSelected={selectedValues.includes(choice.id)}
            color={choice.color || '#4D7EF9'}
            onClick={() => {
              if (isReadOnly) return;
              const newValue = selectedValues.includes(choice.id)
                ? selectedValues.filter(v => v !== choice.id)
                : [...selectedValues, choice.id];
              onChange?.(newValue);
            }}
            filled={selectedValues.includes(choice.id)}
          />
        ))}
      </div>
    );
  }

  // Pour les choix uniques (radio)
  if (field.type === 'radio' || field.choices) {
    return (
      <div className="flex flex-wrap gap-2">
        {(field.choices || []).map(choice => (
          <SelectionButton
            key={choice.id}
            text={choice.text || choice.name}
            isSelected={value === choice.id}
            color={choice.color || '#4D7EF9'}
            onClick={() => !isReadOnly && onChange?.(choice.id)}
            filled={value === choice.id}
          />
        ))}
      </div>
    );
  }

  // Fallback pour les valeurs simples
  if (!value && value !== 0) {
    return <span className="text-gray-400">-</span>;
  }

  return <span>{value}</span>;
};

export default FieldDisplay;
