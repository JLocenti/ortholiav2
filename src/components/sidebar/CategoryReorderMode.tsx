import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Category } from '../../types/category';
import { GripVertical, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCategoryIcon } from './EditSidebar';
import { IconSelectorModal } from '../modals/IconSelectorModal';
import { categoryService } from '../../services/categoryService';

interface CategoryReorderModeProps {
  categories: Category[];
  onReorder: (newOrder: Category[]) => void;
}

const reorder = (list: Category[], startIndex: number, endIndex: number): Category[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export function CategoryReorderMode({ categories, onReorder }: CategoryReorderModeProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedCategories = reorder(
      categories,
      result.source.index,
      result.destination.index
    );

    // Mettre à jour l'ordre de chaque catégorie
    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      order: index
    }));

    onReorder(updatedCategories);
  };

  const handleIconChange = async (iconName: string) => {
    if (!selectedCategory) return;

    try {
      await categoryService.updateCategoryIcon(selectedCategory.id, iconName);
      
      // Mettre à jour l'état local des catégories
      const updatedCategories = categories.map(cat => 
        cat.id === selectedCategory.id 
          ? { ...cat, icon: iconName }
          : cat
      );
      onReorder(updatedCategories); // Met à jour l'état local

      setIsIconSelectorOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'icône:', error);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1"
            >
              {categories.map((category, index) => {
                const IconComponent = getCategoryIcon(category);
                return (
                  <Draggable 
                    key={category.id} 
                    draggableId={category.id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-2 text-sm font-medium transition-colors relative group",
                          "hover:text-white hover:bg-gray-800/50",
                          snapshot.isDragging && "bg-gray-800/75 text-white",
                          !snapshot.isDragging && "text-gray-400"
                        )}
                      >
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsIconSelectorOpen(true);
                          }}
                          className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
                          title="Modifier l'icône"
                        >
                          <IconComponent className="w-5 h-5 flex-shrink-0" />
                        </button>
                        <span className="truncate">{category.name}</span>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <IconSelectorModal
        isOpen={isIconSelectorOpen}
        onClose={() => {
          setIsIconSelectorOpen(false);
          setSelectedCategory(null);
        }}
        onSelect={handleIconChange}
        currentIcon={selectedCategory?.icon}
      />
    </>
  );
}
