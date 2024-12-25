import React, { useRef, useEffect, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { useTableScroll } from '../../hooks/useTableScroll';

interface DraggableColumnProps {
  id: string;
  name: string;
  width: number;
  isFixed?: boolean;
  isDragged: boolean;
  isDropTarget: boolean;
  onDragStart: (columnId: string) => void;
  onDragEnd: () => void;
  onDragOver: (columnId: string) => void;
  onDrop: (columnId: string) => void;
  onResize: (columnId: string, e: React.MouseEvent<HTMLDivElement>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function DraggableColumn({
  id,
  name,
  width,
  isFixed,
  isDragged,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onResize,
  containerRef
}: DraggableColumnProps) {
  const columnRef = useRef<HTMLTableHeaderCellElement>(null);
  const { startScrolling, stopScrolling } = useTableScroll(containerRef);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLTableHeaderCellElement>) => {
    if (isFixed) return;

    const dragImage = columnRef.current?.cloneNode(true) as HTMLElement;
    if (dragImage) {
      dragImage.style.opacity = '0.6';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.backgroundColor = 'white';
      dragImage.style.padding = '8px';
      dragImage.style.borderRadius = '4px';
      dragImage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      dragImage.style.width = `${width}px`;
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, dragImage.offsetWidth / 2, dragImage.offsetHeight / 2);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }

    e.dataTransfer.effectAllowed = 'move';
    onDragStart(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableHeaderCellElement>) => {
    e.preventDefault();
    if (isFixed) return;
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const thresholdX = rect.left + (rect.width * 0.5);
    const position = mouseX < thresholdX ? 'before' : 'after';
    setDragPosition(position);

    if (mouseX < rect.left + 100) {
      startScrolling('left');
    } else if (mouseX > rect.right - 100) {
      startScrolling('right');
    } else {
      stopScrolling();
    }

    onDragOver(id);
  };

  const handleDragEnd = () => {
    stopScrolling();
    setDragPosition(null);
    onDragEnd();
  };

  return (
    <th
      ref={columnRef}
      draggable={!isFixed}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={(e) => {
        e.preventDefault();
        if (isFixed) return;
        stopScrolling();
        setDragPosition(null);
        onDrop(id);
      }}
      style={{ width: `${width}px`, minWidth: `${width}px` }}
      className={`
        group relative p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 
        whitespace-nowrap border-b dark:border-gray-700
        ${isFixed ? 'sticky left-12 z-20 bg-white dark:bg-gray-800' : ''}
        ${isDragged ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        {!isFixed && (
          <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
        )}
        {name}
      </div>

      {/* Resize handle */}
      {!isFixed && (
        <div
          className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 opacity-0 group-hover:opacity-100"
          onMouseDown={(e) => onResize(id, e)}
        />
      )}

      {isDropTarget && dragPosition && (
        <div
          className={`
            absolute inset-y-0 w-1 bg-blue-500
            transition-transform duration-150 ease-out
            ${dragPosition === 'before' ? '-left-0.5' : '-right-0.5'}
          `}
        />
      )}
    </th>
  );
}