import React from 'react';
import { Switch } from '../ui/switch';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { categoryService } from '../../services/categoryService';
import { GripVertical } from 'lucide-react';
import type { Category } from '../../types/category';
import { useCategories } from '../../hooks/useCategories';

interface CategorySectionProps {
  category: Category;
  fields: Record<string, { id: string; text: string }>;
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  loading: boolean;
  onOrderChange?: () => void;
}

export default function CategorySection({ 
  category, 
  fields,
  columnVisibility, 
  onToggleColumn, 
  loading: globalLoading,
  onOrderChange
}: CategorySectionProps) {
  const { categories, setCategories } = useCategories();

  // Trier les champs selon fieldsOrder
  const categoryFields = (category.fields || [])
    .map(fieldId => {
      const field = fields[fieldId];
      const orderInfo = category.fieldsOrder?.find(f => f.id === fieldId);
      return field ? {
        ...field,
        order: orderInfo?.order || 0
      } : null;
    })
    .filter((field): field is (typeof field & { order: number }) => field !== null)
    .sort((a, b) => a.order - b.order);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newOrder = Array.from(categoryFields);
    const [removed] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, removed);

    // Créer le nouvel ordre des champs
    const fieldsOrder = newOrder.map((field, index) => ({
      id: field.id,
      order: index
    }));

    try {
      // Mettre à jour l'état local immédiatement
      const updatedCategories = categories.map(cat => {
        if (cat.id === category.id) {
          return {
            ...cat,
            fieldsOrder
          };
        }
        return cat;
      });
      setCategories(updatedCategories);

      // Notifier le parent du changement d'ordre
      onOrderChange?.();

      // Mettre à jour la base de données
      await categoryService.updateFieldsOrder(category.id, fieldsOrder);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre des champs:', error);
      // En cas d'erreur, on pourrait revenir à l'état précédent
      // mais comme nous avons un système de souscription en temps réel,
      // la mise à jour sera automatique si nécessaire
    }
  };

  if (categoryFields.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Aucun champ pour cette catégorie
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={category.id}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1"
            >
              {categoryFields.map((field, index) => (
                <Draggable
                  key={field.id}
                  draggableId={field.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        flex items-center justify-between py-2 px-2 
                        border border-gray-200 dark:border-gray-700 
                        bg-white dark:bg-gray-800 rounded-md
                        ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/50' : ''}
                      `}
                      style={{
                        ...provided.draggableProps.style,
                        left: snapshot.isDragging ? provided.draggableProps.style?.left : undefined,
                      }}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div
                          {...provided.dragHandleProps}
                          className="mr-2 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {field.text}
                        </span>
                      </div>
                      <Switch
                        checked={columnVisibility[field.id] ?? false}
                        onCheckedChange={() => onToggleColumn(field.id)}
                        disabled={globalLoading}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
