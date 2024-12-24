import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  ArrowLeft,
  Users,
  ClipboardList,
  Scissors,
  Brain,
  Activity,
  Bone,
  Stethoscope,
  FileText,
  ScrollText,
  HeartPulse,
  GripVertical,
  Settings2
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { CategoryReorderMode } from './CategoryReorderMode';
import { categoryService } from '../../services/categoryService';

export const getCategoryIcon = (category: { id: string; icon?: string }) => {
  // Si une icône est définie dans la base de données, l'utiliser
  if (category.icon && (Icons as any)[category.icon]) {
    return (Icons as any)[category.icon];
  }

  // Fallback sur les icônes par défaut
  switch (category.id) {
    case 'practitioners':
      return Users;
    case 'general':
      return ClipboardList;
    case 'clinical':
      return Stethoscope;
    case 'functional':
      return Brain;
    case 'skeletal':
      return Bone;
    case 'dental':
      return Scissors;
    case 'treatment':
      return HeartPulse;
    default:
      return FileText;
  }
};

interface EditNavigationProps {
  isExpanded: boolean;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

function EditNavigation({ isExpanded, activeCategory, onCategoryChange }: EditNavigationProps) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [isReorderMode, setIsReorderMode] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    if (!isReorderMode) {
      onCategoryChange(categoryId);
    }
  };

  const handleReorder = async (newOrder: any[]) => {
    try {
      await categoryService.updateCategoriesOrder(newOrder);
    } catch (error) {
      console.error('Error updating categories order:', error);
    }
  };

  return (
    <div className="py-6">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/home')}
              className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              Édition
            </h2>
          </div>
          <button
            onClick={() => setIsReorderMode(!isReorderMode)}
            className={cn(
              "p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors",
              isReorderMode && "text-white bg-gray-800"
            )}
            title={isReorderMode ? "Quitter le mode réorganisation" : "Réorganiser les catégories"}
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isReorderMode ? (
        <CategoryReorderMode 
          categories={categories.filter(c => c.id !== 'practitioners')}
          onReorder={handleReorder}
        />
      ) : (
        <>
          {/* Praticiens Section */}
          <div className="mb-2">
            <button
              onClick={() => handleCategoryClick('practitioners')}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-2 text-sm font-medium transition-colors relative",
                "hover:text-white hover:bg-gray-800/50",
                {
                  "text-white bg-gray-800/75": 'practitioners' === activeCategory,
                  "text-gray-400": 'practitioners' !== activeCategory
                }
              )}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Praticiens</span>
            </button>
          </div>

          {/* Other Categories */}
          <div className="space-y-2">
            {categories
              .filter(category => category.id !== 'practitioners')
              .map(category => {
                const IconComponent = getCategoryIcon(category);
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-2 text-sm font-medium transition-colors relative",
                      "hover:text-white hover:bg-gray-800/50",
                      {
                        "text-white bg-gray-800/75": category.id === activeCategory,
                        "text-gray-400": category.id !== activeCategory
                      }
                    )}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{category.name}</span>
                  </button>
                );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface EditSidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function EditSidebar({ activeCategory, onCategoryChange }: EditSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-900 text-white border-r border-gray-800">
      <EditNavigation 
        isExpanded={isExpanded} 
        activeCategory={activeCategory} 
        onCategoryChange={onCategoryChange}
      />
    </aside>
  );
}
