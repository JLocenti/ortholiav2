import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Field } from '../../types/field';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FieldsReorderModeProps {
  fields: Field[];
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
}

export function FieldsReorderMode({ fields, onReorder }: FieldsReorderModeProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="fields">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-1"
          >
            {fields.map((field, index) => (
              <Draggable 
                key={field.id} 
                draggableId={field.id} 
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
                    <div className="flex flex-col">
                      <span className="font-medium">{field.text}</span>
                      {field.description && (
                        <span className="text-xs text-gray-500">{field.description}</span>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
