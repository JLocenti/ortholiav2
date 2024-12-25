import React from 'react';
import { Question } from '../types/patient';
import SelectionButton from './SelectionButton';

interface EditableCellProps {
  value: any;
  question: Question;
  onChange: (value: any) => void;
  inline?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function EditableCell({ 
  value, 
  question, 
  onChange, 
  inline = false,
  onClick 
}: EditableCellProps) {
  const renderValue = () => {
    if (!value) return '-';
    if (!question) return value;

    if (!question) {
      console.error('Question is undefined');
      return 'Error: Question is undefined';
    }

    // Pour les champs radio et multiple, on veut afficher le texte des choix
    if (question.type === 'radio') {
      // Si la valeur est un objet avec un champ text, l'utiliser directement
      if (typeof value === 'object' && value?.text) {
        return (
          <div className="pointer-events-none">
            <SelectionButton
              text={value.text}
              isSelected={true}
              color={value.color || '#4D7EF9'}
              onClick={() => {}}
              className="opacity-100"
              filled={true}
            />
          </div>
        );
      }

      // Chercher le choix correspondant à l'ID
      const choice = question.choices?.find(c => c.id === value || c.text === value);
      if (!choice) return '-';

      return (
        <div className="pointer-events-none">
          <SelectionButton
            text={choice.text}
            isSelected={true}
            color={choice.color || '#4D7EF9'}
            onClick={() => {}}
            className="opacity-100"
            filled={true}
          />
        </div>
      );
    }

    if (question.type === 'multiple') {
      if (!Array.isArray(value) || value.length === 0) return '-';

      const selectedChoices = value.map(v => {
        // Si la valeur est un objet avec un champ text, l'utiliser directement
        if (typeof v === 'object' && v?.text) {
          return v;
        }
        // Sinon, chercher dans les choix de la question
        return question.choices?.find(choice => 
          choice.id === v || choice.text === v
        );
      }).filter(Boolean);

      return (
        <div className="flex flex-wrap gap-2 pointer-events-none">
          {selectedChoices.map((choice, index) => (
            <SelectionButton
              key={index}
              text={choice.text}
              isSelected={true}
              color={choice.color || '#4D7EF9'}
              onClick={() => {}}
              className="opacity-100"
              filled={true}
            />
          ))}
        </div>
      );
    }

    if (question.type === 'textarea') {
      return (
        <div className="max-h-20 overflow-hidden text-ellipsis">
          {value}
        </div>
      );
    }

    return value;
  };

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  if (inline) {
    if (!question) {
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        />
      );
    }

    if (question.type === 'multiple' || question.type === 'radio') {
      const selectedValues = question.type === 'multiple' 
        ? (Array.isArray(value) ? value : [])
        : [value];

      return (
        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          {question.choices?.map(choice => (
            <SelectionButton
              key={choice.id}
              text={choice.text}
              isSelected={selectedValues.includes(choice.id)}
              color={choice.color || '#4D7EF9'}
              onClick={(e) => {
                e.stopPropagation();
                if (question.type === 'multiple') {
                  const newValues = selectedValues.includes(choice.id)
                    ? selectedValues.filter(v => v !== choice.id)
                    : [...selectedValues, choice.id];
                  handleChange(newValues);
                } else {
                  handleChange(choice.id);
                }
              }}
            />
          ))}
        </div>
      );
    }

    if (question.type === 'textarea') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          rows={4}
        />
      );
    }

    return (
      <input
        type={question.type === 'number' ? 'number' : 'text'}
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
      />
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      className="relative cursor-pointer min-h-[24px] hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1 -m-1 transition-colors"
      onClick={handleClick}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as any);
        }
      }}
    >
      {renderValue()}
    </div>
  );
}