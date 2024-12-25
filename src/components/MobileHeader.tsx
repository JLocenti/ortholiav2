import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Search } from 'lucide-react';

interface MobileHeaderProps {
  onProfileClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function MobileHeader({ onProfileClick }: MobileHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/app/settings')) return 'Paramètres';
    if (path.startsWith('/app/patient-edit')) return 'Édition Patient';
    if (path.startsWith('/app/prescription')) return 'Prescription';
    if (path.startsWith('/app/ai-settings')) return 'Intelligence Artificielle';
    if (path.startsWith('/app/accounts')) return 'Comptes';
    return '';
  };

  const handleBack = () => {
    navigate('/app/home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b dark:border-gray-700">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              {location.pathname !== '/app/home' && (
                <button
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {location.pathname === '/app/home' && (
                <button
                  onClick={() => navigate('/search')}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Search className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={onProfileClick}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--theme-color)]"
              >
                <img
                  src={currentUser?.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}