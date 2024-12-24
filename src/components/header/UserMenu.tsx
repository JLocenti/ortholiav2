import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Brain, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserMenuProps {
  onClose: () => void;
}

export default function UserMenu({ onClose }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { icon: User, label: 'Profil', path: '/app/settings' },
    { icon: FileText, label: 'Édition', path: '/app/patient-edit/practitioners' },
    { icon: Settings, label: 'Compte', path: '/app/accounts' },
    { icon: Brain, label: 'I.A.', path: '/app/ai-settings' }
  ];

  const handleClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => handleClick(item.path)}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </button>
      ))}
      
      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
      
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>
    </div>
  );
}