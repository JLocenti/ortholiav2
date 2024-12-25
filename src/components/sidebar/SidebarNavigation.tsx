import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { FileText, Stethoscope, Activity, Bone, CircleDot } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SidebarNavigation() {
  const { categories } = useCategories();

  const getIconForCategory = (categoryId: string) => {
    switch (categoryId) {
      case 'general':
        return <FileText className="h-5 w-5" />;
      case 'medical':
        return <Stethoscope className="h-5 w-5" />;
      case 'vital':
        return <Activity className="h-5 w-5" />;
      case 'physical':
        return <Bone className="h-5 w-5" />;
      default:
        return <CircleDot className="h-5 w-5" />;
    }
  };

  return (
    <nav className="grid items-start gap-2">
      {categories.map(category => (
        <NavLink
          key={category.id}
          to={`/app/patient-edit/${category.id}`}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              isActive && 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50'
            )
          }
        >
          {getIconForCategory(category.id)}
          {category.name}
        </NavLink>
      ))}
    </nav>
  );
}