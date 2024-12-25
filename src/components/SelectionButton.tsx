import React from 'react';
import { clsx } from 'clsx';

interface SelectionButtonProps {
  text: string;
  color?: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export default function SelectionButton({
  text,
  color = '#4D7EF9',
  isSelected,
  onClick,
  className
}: SelectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "border-2 hover:opacity-90",
        isSelected
          ? 'text-white'
          : 'text-gray-700 dark:text-gray-200 bg-transparent',
        className
      )}
      style={{
        backgroundColor: isSelected ? color : 'transparent',
        borderColor: color,
      }}
    >
      {text}
    </button>
  );
}