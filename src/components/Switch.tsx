import React from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
}

export const SwitchComponent = ({ checked, onChange }: SwitchProps) => {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-color)]
        ${checked 
          ? 'bg-[var(--theme-color)]' 
          : 'bg-gray-300 dark:bg-gray-600'
        }
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </HeadlessSwitch>
  );
};