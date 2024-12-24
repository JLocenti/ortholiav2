import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProfileProps {
  onProfileClick: () => void;
}

export function SidebarProfile({ onProfileClick }: SidebarProfileProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/settings');
    onProfileClick();
  };

  return (
    <button
      onClick={handleClick}
      className="mt-4 pt-4 border-t border-gray-800 w-full"
    >
      <div className="flex items-center gap-3 px-4 hover:bg-gray-800 p-2 rounded-lg transition-colors">
        <img
          src={currentUser?.photo}
          alt="Profile"
          className="w-8 h-8 rounded-full border-2 border-[var(--theme-color)]"
        />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-white truncate">
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {currentUser?.email}
          </p>
        </div>
      </div>
    </button>
  );
}