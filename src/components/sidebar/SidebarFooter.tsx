import React from 'react';
import { LogOut, PenSquare, Brain, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SidebarFooter() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleEditClick = () => {
    navigate('/app/patient-edit/practitioners');
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleEditClick}
        className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
      >
        <PenSquare className="w-5 h-5" />
        <span className="font-medium">Édition</span>
      </button>

      <button
        onClick={() => navigate('/app/ai-settings')}
        className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
      >
        <Brain className="w-5 h-5" />
        <span className="font-medium">I.A.</span>
      </button>

      {isSuperAdmin && (
        <button
          onClick={() => navigate('/app/accounts')}
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Comptes</span>
        </button>
      )}

      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Déconnexion</span>
      </button>
    </div>
  );
}