import React from 'react';
import { cn } from '../lib/utils';

interface SelectionPillProps {
  text: string;
  isSelected: boolean;
  color?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function SelectionPill({
  text,
  isSelected,
  color = '#4F46E5',
  onClick,
  className,
  disabled = false
}: SelectionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative px-6 py-2 text-base font-medium transition-all duration-200",
        "rounded-[16px]",
        isSelected ? "text-white" : "text-gray-400",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        backgroundColor: isSelected ? '#4D7EF9' : 'transparent',
        boxShadow: isSelected ? '0 2px 12px rgba(77, 126, 249, 0.25)' : 'none',
        border: '2px solid #4D7EF9',
      }}
    >
      {text}
    </button>
  );
}
