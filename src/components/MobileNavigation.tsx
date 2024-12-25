import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useViews } from '../context/ViewContext';

export default function MobileNavigation() {
  const location = useLocation();
  const { views } = useViews();
  
  const isEditMode = location.pathname.startsWith('/app/patient-edit');
  const isPrescriptionMode = location.pathname.startsWith('/app/prescription');
  const isSettingsMode = location.pathname.startsWith('/app/settings') || 
                        location.pathname.startsWith('/app/ai-settings') ||
                        location.pathname.startsWith('/app/accounts');

  const getNavigationItems = () => {
    if (isSettingsMode) {
      return [
        { id: 'profile', name: 'Profil', path: '/app/settings', icon: 'User' },
        { id: 'edit', name: 'Édition', path: '/app/patient-edit/practitioners', icon: 'FileText' },
        { id: 'ai', name: 'IA', path: '/app/ai-settings', icon: 'Brain' },
        { id: 'accounts', name: 'Comptes', path: '/app/accounts', icon: 'Users' }
      ];
    }

    if (isEditMode || isPrescriptionMode) {
      return views.map(view => ({
        id: view.id,
        name: view.name,
        path: `/app/patient-edit/${view.id}`,
        icon: view.icon
      }));
    }

    return views.slice(0, 4).map(view => ({
      id: view.id,
      name: view.name,
      path: `/app/${view.id}`,
      icon: view.icon
    }));
  };

  const items = getNavigationItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t dark:border-gray-700 z-40 pb-safe">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        {items.map(item => {
          const IconComponent = Icons[item.icon as keyof typeof Icons] || Icons.FileText;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`
                flex flex-col items-center justify-center w-14 h-14
                relative rounded-2xl transition-all duration-200
                ${isActive ? 'text-[var(--theme-color)] scale-110' : 'text-gray-500 dark:text-gray-400'}
              `}
            >
              <IconComponent className={`w-6 h-6 transition-transform duration-200 ${
                isActive ? 'scale-110' : ''
              }`} />
              {isActive && (
                <div className="absolute -inset-1 bg-[var(--theme-color)]/10 dark:bg-[var(--theme-color)]/20 rounded-2xl -z-10" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}