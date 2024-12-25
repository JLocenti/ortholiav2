import React, { useState } from 'react';
import { ChevronDown, Edit2, Eye, EyeOff, Check } from 'lucide-react';
import { useViewPreferences } from '../context/ViewPreferencesContext';
import { ViewPreferences } from '../types/viewPreferences';

interface ViewSelectorProps {
  currentView: ViewPreferences;
  onViewChange: (view: ViewPreferences) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentView.name);
  const { viewPreferences, updateViewName } = useViewPreferences();

  const handleToggle = () => setIsOpen(!isOpen);

  const handleViewSelect = (view: ViewPreferences) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedName(currentView.name);
  };

  const handleNameChange = async () => {
    if (editedName.trim() !== currentView.name) {
      await updateViewName(currentView.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameChange();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(currentView.name);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameChange}
              onKeyDown={handleKeyDown}
              className="bg-gray-700 text-white px-2 py-1 rounded"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span>{currentView.name}</span>
              <button
                onClick={handleEditClick}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="py-2">
            {viewPreferences.map((view) => (
              <button
                key={view.id}
                onClick={() => handleViewSelect(view)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                  view.id === currentView.id ? 'bg-gray-700' : ''
                }`}
              >
                <span className="flex-1">{view.name}</span>
                {view.id === currentView.id && (
                  <Check className="w-4 h-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
