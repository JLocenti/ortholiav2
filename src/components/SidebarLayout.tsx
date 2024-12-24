import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, Home, FileText, Brain, Users, LogOut, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EditNavigation from './sidebar/EditNavigation';

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export default function SidebarLayout({ children, sidebar }: SidebarLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const isEditMode = location.pathname.includes('/app/patient-edit');

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const mainNavigationItems = [
    { icon: Home, path: '/app/home', label: 'Accueil' },
    { icon: FileText, path: '/app/patient-edit/practitioners', label: 'Édition' },
    { icon: Brain, path: '/app/ai-settings', label: 'I.A.' },
    { icon: Users, path: '/app/accounts', label: 'Comptes' },
  ];

  const handleProfileClick = () => {
    navigate('/app/settings');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full z-50 bg-gray-900 transition-all duration-300 flex flex-col",
          isExpanded ? "w-64" : "w-16"
        )}
      >
        {/* Section 1: Toggle */}
        <div className="absolute right-0 top-4 p-2">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Logo and Profile */}
        <div className="pt-16 pb-6 border-b border-gray-800">
          <div className={cn(
            "text-white font-bold transition-all duration-300 mb-6",
            isExpanded ? "px-6 text-xl" : "px-4 text-center text-base"
          )}>
            {isExpanded ? 'Ortholia' : 'O'}
          </div>

          {/* Profile Section */}
          <button
            onClick={handleProfileClick}
            className={cn(
              "w-full flex items-center transition-all",
              isExpanded ? "px-4" : "justify-center"
            )}
          >
            <img
              src={currentUser?.photo}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-[var(--theme-color)]"
            />
            {isExpanded && (
              <div className="ml-3 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser?.email}
                </p>
              </div>
            )}
          </button>
        </div>

        {/* Section 2: Navigation */}
        <div className="flex-1 py-6">
          {isEditMode ? (
            <>
              <div className="px-4 mb-4">
                <button
                  onClick={() => navigate('/app/home')}
                  className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                >
                  <Home className="w-4 h-4" />
                  {isExpanded && <span>Retour à l'accueil</span>}
                </button>
              </div>
              <EditNavigation isExpanded={isExpanded} />
            </>
          ) : (
            <>
              {/* Main Navigation - Expanded */}
              {isExpanded && (
                <div className="space-y-1">
                  {mainNavigationItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                          isActive 
                            ? "bg-[var(--theme-color)] text-white" 
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Main Navigation - Collapsed */}
              {!isExpanded && (
                <div className="flex flex-col items-center space-y-6">
                  {mainNavigationItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn(
                          "p-2 rounded-lg transition-colors w-10 h-10 flex items-center justify-center",
                          isActive 
                            ? "bg-[var(--theme-color)] text-white" 
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        )}
                        title={item.label}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Section 3: Logout */}
        <div className="py-4 px-3 border-t border-gray-800">
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors rounded-lg",
              isExpanded ? "px-4 py-2" : "justify-center p-2"
            )}
          >
            {isExpanded ? (
              <>
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </>
            ) : (
              <LogOut className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isExpanded ? "ml-64" : "ml-16"
        )}
      >
        {children}
      </div>
    </div>
  );
}