import React, { useState } from 'react';
import { Search, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CommandMenu from './CommandMenu';
import UserMenu from './UserMenu';
import PatientSearch from '../PatientSearch';
import { usePatients } from '../../context/PatientContext';

export default function Header() {
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser } = useAuth();
  const { patients } = usePatients();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandMenu(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-16 flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2" onClick={() => navigate('/app/home')} role="button">
          <span className="text-xl font-bold text-gray-900 dark:text-white">Ortholia</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <button
            onClick={() => setShowCommandMenu(true)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Rechercher un numéro de dossier...</span>
            <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
              <Command className="w-3 h-3" />
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--theme-color)]"
          >
            <img
              src={currentUser?.photo}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          {showUserMenu && (
            <UserMenu onClose={() => setShowUserMenu(false)} />
          )}
        </div>
      </div>

      {/* Command Menu Modal */}
      <CommandMenu 
        isOpen={showCommandMenu} 
        onClose={() => setShowCommandMenu(false)} 
      />
    </div>
  );
}