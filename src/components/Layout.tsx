import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './header/Header';
import ViewSwitcher from './ViewSwitcher';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;
  
  // Show ViewSwitcher only on view pages (home and custom views)
  const showViewSwitcher = path.startsWith('/app/') && 
    !path.includes('/settings') && 
    !path.includes('/patient-edit') && 
    !path.includes('/ai-settings') && 
    !path.includes('/accounts') &&
    !path.includes('/prescription');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
        {showViewSwitcher && <ViewSwitcher />}
      </div>

      <main 
        className={`
          ${showViewSwitcher ? 'pt-28' : 'pt-16'} 
          ${path.includes('/patient-edit') ? 'md:pl-64' : 'md:px-6'} 
          min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]
          w-full
          max-w-full
          overflow-x-hidden
        `}
      >
        {children}
      </main>
    </div>
  );
}