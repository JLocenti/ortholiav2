import { useState, useRef, useEffect } from 'react';

interface Column {
  id: string;
  minWidth?: number;
  fixed?: boolean;
}

export function useColumnResize(columns: Column[]) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    return columns.reduce((acc, col) => ({
      ...acc,
      [col.id]: col.minWidth || 100
    }), {});
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleResizeStart = (columnId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const column = e.currentTarget.parentElement;
    if (!column) return;

    setIsResizing(true);
    resizingRef.current = {
      column: columnId,
      startX: e.clientX,
      startWidth: columnWidths[columnId] || 100
    };
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !resizingRef.current) return;

    const diff = e.clientX - resizingRef.current.startX;
    const column = columns.find(c => c.id === resizingRef.current?.column);
    if (!column) return;

    const minWidth = column.minWidth || 80;
    const newWidth = Math.max(minWidth, resizingRef.current.startWidth + diff);

    setColumnWidths(prev => ({
      ...prev,
      [resizingRef.current!.column]: newWidth
    }));
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    resizingRef.current = null;
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing]);

  return {
    columnWidths,
    isResizing,
    handleResizeStart,
    setColumnWidths
  };
}