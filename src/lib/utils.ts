import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hexToRgba(hex: string, alpha: number = 1) {
  // Remove the hash if it exists
  hex = hex.replace('#', '');

  // Parse the hex values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Return the rgba value
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}