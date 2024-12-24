import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface VisibilityToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function VisibilityToggle({ checked, onCheckedChange, disabled }: VisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        ${checked 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80 cursor-pointer'}
      `}
    >
      {checked ? (
        <>
          <Eye className="w-4 h-4" />
          Visible
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4" />
          Masqué
        </>
      )}
    </button>
  );
}
