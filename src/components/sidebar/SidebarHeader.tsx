import React from 'react';
import { useParams } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';

interface SidebarHeaderProps {
  showProfileMenu: boolean;
  isEditMode: boolean;
  onBackClick: () => void;
}

export function SidebarHeader({ showProfileMenu, isEditMode, onBackClick }: SidebarHeaderProps) {
  const { categoryId } = useParams();
  const { categories } = useCategories();

  const currentCategory = categoryId ? 
    categories.find(c => c.id === categoryId) : null;

  return (
    <div className="p-4">
      {(showProfileMenu || isEditMode) ? (
        <div className="flex items-center gap-3">
          <button
            onClick={onBackClick}
            className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {currentCategory ? currentCategory.name : 'Ortholia'}
          </h1>
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-white">Ortholia</h1>
      )}
    </div>
  );
}