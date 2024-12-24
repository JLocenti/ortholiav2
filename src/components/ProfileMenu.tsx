import React, { useRef, useEffect } from 'react';
import { User, Users, LogOut, Brain, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../types/user';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: HTMLElement | null;
  isMobile?: boolean;
}

export default function ProfileMenu({ isOpen, onClose, anchorRef, isMobile }: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === USER_ROLES.SUPER_ADMIN;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          event.target !== anchorRef) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const menuItems = [
    { icon: User, label: 'Profil', action: () => navigate('/app/settings') },
    { icon: Users, label: 'Édition', action: () => navigate('/app/patient-edit/practitioners') },
    { icon: Brain, label: 'Intelligence Artificielle', action: () => navigate('/app/ai-settings') },
    ...(isSuperAdmin ? [{ icon: Settings, label: 'Comptes', action: () => navigate('/app/accounts') }] : []),
    { icon: LogOut, label: 'Déconnexion', action: logout }
  ];

  const menuStyle = isMobile ? {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transform: 'translateY(0)',
    borderRadius: '1rem 1rem 0 0'
  } : {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    zIndex: 50,
    minWidth: '200px'
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity duration-200"
        style={{ zIndex: 40 }}
        onClick={onClose}
      />
      <div 
        ref={menuRef}
        style={menuStyle}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden"
      >
        {isMobile && (
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-2" />
        )}
        <div className="py-1" role="menu">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                onClose();
              }}
              className={`w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2
                ${index !== menuItems.length - 1 ? 'border-b dark:border-gray-700' : ''}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}