import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function SidebarProfileMenu({ onEditClick }: { onEditClick: () => void }) {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-medium',
      isActive 
        ? 'bg-[var(--theme-color)] text-white' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    );

  return (
    <div className="space-y-1">
      <NavLink to="/app/settings" className={navLinkClasses}>
        <User className="w-5 h-5" />
        <span>Profil</span>
      </NavLink>
    </div>
  );
}