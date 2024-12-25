import React from 'react';
import { cn } from '../lib/utils';

interface MultiSelectionButtonProps {
  text: string;
  isSelected: boolean;
  color?: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export default function MultiSelectionButton({
  text,
  isSelected,
  color = 'var(--theme-color)',
  onClick,
  className
}: MultiSelectionButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
        "hover:bg-opacity-10 hover:bg-current",
        className
      )}
      style={{
        color: isSelected ? '#fff' : color,
        backgroundColor: isSelected ? color : 'transparent',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: color,
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <span className="relative z-10">{text}</span>
      {isSelected && (
        <span 
          className="absolute inset-0 rounded-lg opacity-20 bg-white"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}
    </button>
  );
}
