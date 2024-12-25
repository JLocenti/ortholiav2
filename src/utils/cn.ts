import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine et fusionne les classes CSS avec tailwind-merge
 * @param inputs Les classes CSS à combiner
 * @returns Les classes CSS fusionnées
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
