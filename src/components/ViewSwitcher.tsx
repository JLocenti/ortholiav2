import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useViews } from '../context/ViewContext';
import Modal from './Modal';
import ViewCreatorModal from './views/ViewCreatorModal';
import RenameViewModal from './views/RenameViewModal';
import ColumnVisibilityModal from './modals/ColumnVisibilityModal';
import DeleteViewConfirmationModal from './modals/DeleteViewConfirmationModal';
import { cn } from '../lib/utils';
import { usePractitioners } from '../context/PractitionerContext';
import { fieldService } from '../services/fieldService';

interface ViewMenuProps {
  viewId: string;
  viewName: string;
  isOpen: boolean;
  isFirstTab: boolean;
  onClose: () => void;
  onRename: () => void;
  onToggleFields: () => void;
  onChangeIcon: () => void;
  onDelete: () => void;
}

function ViewMenu({ 
  viewId, 
  viewName, 
  isOpen, 
  isFirstTab, 
  onClose, 
  onRename, 
  onToggleFields,
  onChangeIcon,
  onDelete
}: ViewMenuProps) {
  if (!isOpen) return null;

  return (
    <div className={cn(
      "absolute top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[99]",
      isFirstTab ? "left-0" : "right-0"
    )}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRename();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <Icons.PenSquare className="w-4 h-4" />
        Renommer la vue
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFields();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <Icons.EyeOff className="w-4 h-4" />
        Gérer les colonnes
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChangeIcon();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <Icons.Settings className="w-4 h-4" />
        Changer l'icône
      </button>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <Icons.Trash2 className="w-4 h-4" />
        Supprimer la vue
      </button>
    </div>
  );
};

const IconSelector = ({ onSelect, onClose }: { onSelect: (icon: string) => void, onClose: () => void }) => {
  const icons = [
    // Personnes et genre
    { name: 'User', component: Icons.User },
    { name: 'CircleUser', component: Icons.CircleUser },
    { name: 'UserSquare', component: Icons.UserSquare },
    { name: 'Users', component: Icons.Users },
    { name: 'Baby', component: Icons.Baby },
    { name: 'PersonStanding', component: Icons.PersonStanding },
    { name: 'UserPlus', component: Icons.UserPlus },
    { name: 'UserCheck', component: Icons.UserCheck },
    { name: 'UserX', component: Icons.UserX },
    { name: 'UserMinus', component: Icons.UserMinus },
    { name: 'UserCog', component: Icons.UserCog },

    // Médical et dentaire
    { name: 'Heart', component: Icons.Heart },
    { name: 'HeartPulse', component: Icons.HeartPulse },
    { name: 'Brain', component: Icons.Brain },
    { name: 'Skull', component: Icons.Skull },
    { name: 'Activity', component: Icons.Activity },
    { name: 'Cross', component: Icons.Cross },

    // Équipement médical
    { name: 'Stethoscope', component: Icons.Stethoscope },
    { name: 'Thermometer', component: Icons.Thermometer },
    { name: 'Syringe', component: Icons.Syringe },
    { name: 'TestTube', component: Icons.TestTube },
    { name: 'TestTubes', component: Icons.TestTubes },
    { name: 'Pill', component: Icons.Pill },

    // Documents et dossiers
    { name: 'FileText', component: Icons.FileText },
    { name: 'Files', component: Icons.Files },
    { name: 'FileCheck', component: Icons.FileCheck },
    { name: 'FileSearch', component: Icons.FileSearch },
    { name: 'FileEdit', component: Icons.FileEdit },
    { name: 'Folder', component: Icons.Folder },
    { name: 'FolderOpen', component: Icons.FolderOpen },
    { name: 'FolderPlus', component: Icons.FolderPlus },
    { name: 'FolderSearch', component: Icons.FolderSearch },

    // Temps et rendez-vous
    { name: 'Calendar', component: Icons.Calendar },
    { name: 'CalendarCheck', component: Icons.CalendarCheck },
    { name: 'CalendarDays', component: Icons.CalendarDays },
    { name: 'Clock', component: Icons.Clock },
    { name: 'Timer', component: Icons.Timer },
    { name: 'History', component: Icons.History },

    // Communication
    { name: 'Mail', component: Icons.Mail },
    { name: 'Phone', component: Icons.Phone },
    { name: 'MessageCircle', component: Icons.MessageCircle },
    { name: 'MessageSquare', component: Icons.MessageSquare },
    { name: 'BellRing', component: Icons.BellRing },
    { name: 'Send', component: Icons.Send },

    // Navigation et recherche
    { name: 'Home', component: Icons.Home },
    { name: 'Search', component: Icons.Search },
    { name: 'Star', component: Icons.Star },
    { name: 'Map', component: Icons.Map },
    { name: 'Navigation', component: Icons.Navigation },
    { name: 'Globe', component: Icons.Globe },

    // États et notifications
    { name: 'CheckCircle', component: Icons.CheckCircle },
    { name: 'CircleDot', component: Icons.CircleDot },
    { name: 'AlertCircle', component: Icons.AlertCircle },
    { name: 'Info', component: Icons.Info },
    { name: 'HelpCircle', component: Icons.HelpCircle },
    { name: 'Award', component: Icons.Award },

    // Sécurité et accès
    { name: 'Lock', component: Icons.Lock },
    { name: 'Unlock', component: Icons.Unlock },
    { name: 'Key', component: Icons.Key },
    { name: 'Shield', component: Icons.Shield },
    { name: 'Eye', component: Icons.Eye },

    // Édition et paramètres
    { name: 'Edit', component: Icons.Edit },
    { name: 'Pencil', component: Icons.Pencil },
    { name: 'Settings', component: Icons.Settings },
    { name: 'Sliders', component: Icons.Sliders },
    { name: 'Filter', component: Icons.Filter },
    { name: 'Plus', component: Icons.Plus }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-[400px] max-h-[500px] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Choisir une icône</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            type="button"
          >
            <Icons.X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {icons.map(({ name, component: Icon }) => (
            <button
              key={name}
              onClick={() => {
                onSelect(name);
                onClose();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center"
              type="button"
            >
              <Icon className="h-6 w-6" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default function ViewSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { viewPreferences, isLoading, updateViewPreference, deleteView } = useViews();
  const { practitioners } = usePractitioners();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [renamingView, setRenamingView] = useState<{ id: string; name: string } | null>(null);
  const [togglingFieldsForView, setTogglingFieldsForView] = useState<string | null>(null);
  const [changingIconForView, setChangingIconForView] = useState<{ id: string; icon: string } | null>(null);
  const [deletingView, setDeletingView] = useState<{ id: string; name: string } | null>(null);
  const [menuOpenForView, setMenuOpenForView] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);

  const currentViewId = location.pathname.split('/').pop() || '';
  const currentView = viewPreferences.find(v => v.id === currentViewId);

  const handleRenameSubmit = async (newName: string) => {
    if (!renamingView) return;
    
    try {
      await updateViewPreference(renamingView.id, { name: newName });
      setRenamingView(null);
    } catch (error) {
      console.error('Error renaming view:', error);
    }
  };

  const handleIconChange = async (iconName: string) => {
    if (!changingIconForView) return;
    
    try {
      await updateViewPreference(changingIconForView.id, { icon: iconName });
      setChangingIconForView(null);
    } catch (error) {
      console.error('Error changing icon:', error);
    }
  };

  const handleToggleColumn = async (columnId: string) => {
    if (!currentView) return;

    try {
      const updatedColumns = currentView.columns.map(col => 
        col.fieldId === columnId ? { ...col, visible: !col.visible } : col
      );

      await updateViewPreference(currentView.id, { columns: updatedColumns });
    } catch (error) {
      console.error('Error toggling column:', error);
    }
  };

  const handleTogglePractitioner = async (practitionerId: string) => {
    if (!currentView) return;

    try {
      const currentPractitioners = currentView.settings?.visiblePractitioners || [];
      const newPractitioners = currentPractitioners.includes(practitionerId)
        ? currentPractitioners.filter(id => id !== practitionerId)
        : [...currentPractitioners, practitionerId];

      await updateViewPreference(currentView.id, {
        settings: {
          ...currentView.settings,
          visiblePractitioners: newPractitioners
        }
      });
    } catch (error) {
      console.error('Error toggling practitioner:', error);
    }
  };

  const handleDeleteView = async (viewId: string, viewName: string) => {
    setDeletingView({ id: viewId, name: viewName });
  };

  const confirmDeleteView = async () => {
    if (!deletingView) return;

    try {
      await deleteView(deletingView.id);
      navigate('/app');
    } catch (error) {
      console.error('Error deleting view:', error);
    } finally {
      setDeletingView(null);
    }
  };

  useEffect(() => {
    const loadFields = async () => {
      const allFields = await fieldService.getAllFields();
      setFields(allFields);
    };
    loadFields();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenForView && !(event.target as HTMLElement).closest('.view-menu-container')) {
        setMenuOpenForView(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpenForView]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="relative border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {[...viewPreferences]
            .sort((a, b) => {
              const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
              const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
              return dateA - dateB;  // Plus anciennes à gauche
            })
            .map((view, index) => {
            let IconComponent = Icons.FileText; // Icône par défaut
            if (view.icon && Icons[view.icon as keyof typeof Icons]) {
              IconComponent = Icons[view.icon as keyof typeof Icons];
            }
            const isActive = currentViewId === view.id;

            return (
              <div key={view.id} className="relative view-menu-container">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate(`/app/${view.id}`)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px",
                      isActive
                        ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-300 border-transparent hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm">{view.name}</span>
                  </button>
                  {isActive && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenForView(menuOpenForView === view.id ? null : view.id);
                      }}
                      className="ml-1 cursor-pointer px-2 py-3"
                    >
                      <Icons.ChevronDown className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <ViewMenu
                  viewId={view.id}
                  viewName={view.name}
                  isOpen={menuOpenForView === view.id}
                  isFirstTab={index === 0}
                  onClose={() => setMenuOpenForView(null)}
                  onRename={() => setRenamingView({ id: view.id, name: view.name })}
                  onToggleFields={() => setTogglingFieldsForView(view.id)}
                  onChangeIcon={() => setChangingIconForView({ id: view.id, icon: view.icon })}
                  onDelete={() => handleDeleteView(view.id, view.name)}
                />
              </div>
            );
          })}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent -mb-px"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Nouvelle vue</span>
          </button>
        </div>
      </div>

      <ViewCreatorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {renamingView && (
        <RenameViewModal
          isOpen={true}
          onClose={() => setRenamingView(null)}
          viewId={renamingView.id}
          currentName={renamingView.name}
          onSubmit={handleRenameSubmit}
        />
      )}

      {togglingFieldsForView && currentView && (
        <ColumnVisibilityModal
          isOpen={true}
          onClose={() => setTogglingFieldsForView(null)}
          viewId={togglingFieldsForView}
          columns={currentView.columns.map(col => {
            const field = fields.find(f => f.id === col.fieldId);
            return {
              id: col.fieldId,
              name: field?.text || field?.description || col.fieldId,
              visible: col.visible
            };
          })}
          onToggleColumn={handleToggleColumn}
          columnVisibility={Object.fromEntries(
            currentView.columns.map(col => [col.fieldId, col.visible ?? false])
          )}
          practitioners={practitioners}
          onTogglePractitioner={handleTogglePractitioner}
          showPractitionerColumn={currentView.settings?.showPractitioner ?? false}
          currentView={currentView}
        />
      )}

      {changingIconForView && (
        <IconSelector
          onSelect={(icon) => handleIconChange(icon)}
          onClose={() => setChangingIconForView(null)}
        />
      )}

      {deletingView && (
        <DeleteViewConfirmationModal
          isOpen={true}
          onClose={() => setDeletingView(null)}
          onConfirm={confirmDeleteView}
          viewName={deletingView.name}
        />
      )}
    </div>
  );
}