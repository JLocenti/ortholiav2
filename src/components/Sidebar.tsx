import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useViews } from '../context/ViewContext';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { SidebarProfileMenu } from './sidebar/SidebarProfileMenu';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { SidebarProfile } from './sidebar/SidebarProfile';

export default function Sidebar() {
  const { views } = useViews();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = location.pathname.includes('/app/patient-edit');

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleBackClick = () => {
    if (isEditMode) {
      navigate('/app/home');
    } else if (showProfileMenu) {
      setShowProfileMenu(false);
    }
  };

  const handleEditClick = () => {
    navigate('/app/patient-edit/practitioners');
    setShowProfileMenu(false);
  };

  return (
    <div className="flex flex-col h-full text-gray-300">
      <SidebarHeader 
        showProfileMenu={showProfileMenu}
        isEditMode={isEditMode}
        onBackClick={handleBackClick} 
      />

      <div className="flex-1 overflow-y-auto px-2">
        {showProfileMenu && !isEditMode ? (
          <SidebarProfileMenu onEditClick={handleEditClick} />
        ) : (
          <SidebarNavigation views={views} isEditMode={isEditMode} />
        )}
      </div>

      {!isEditMode && (
        <div className="p-4 border-t border-gray-800">
          <SidebarFooter />
          <SidebarProfile onProfileClick={handleProfileClick} />
        </div>
      )}
    </div>
  );
}