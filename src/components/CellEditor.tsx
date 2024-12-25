import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types/patient';
import { Save } from 'lucide-react';
import SelectionButton from './SelectionButton';
import Modal from './Modal';

interface CellEditorProps {
  value: any;
  question: Question;
  onSave: (value: any) => void;
  onClose: () => void;
}

export default function CellEditor({ value, question, onSave, onClose }: CellEditorProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (newValue: any) => {
    setCurrentValue(newValue);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onSave(currentValue);
    onClose();
  };

  if (question.type === 'multiple' || question.type === 'radio') {
    const selectedValues = question.type === 'multiple' 
      ? (Array.isArray(currentValue) ? currentValue : [])
      : [currentValue];

    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title={question.text}
      >
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          {question.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {question.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {question.choices?.map(choice => (
              <SelectionButton
                key={choice.id}
                text={choice.text}
                isSelected={selectedValues.includes(choice.id)}
                color={choice.color}
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

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  if (question.type === 'text' || question.type === 'textarea') {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title={question.text}
      >
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          {question.type === 'textarea' ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={currentValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white resize-none"
              placeholder={`Saisir ${question.text.toLowerCase()}...`}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={currentValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder={`Saisir ${question.text.toLowerCase()}...`}
            />
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
}