import React, { useState } from 'react';
import { Button, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableViewIcon from '@mui/icons-material/TableView';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useViewPreferences } from '../context/ViewPreferencesContext';
import { ViewPreferences } from '../types/viewPreferences';

interface ViewSelectorProps {
  onViewChange: (view: ViewPreferences) => void;
  currentViewId: string | null;
}

const iconComponents = {
  'Layout': DashboardIcon,
  'List': ViewListIcon,
  'Grid': ViewModuleIcon,
  'Table': TableViewIcon,
};

export const ViewSelector: React.FC<ViewSelectorProps> = ({ onViewChange, currentViewId }) => {
  const { viewPreferences, createViewPreference, updateViewName, updateViewIcon } = useViewPreferences();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedView, setSelectedView] = useState<ViewPreferences | null>(null);
  const [isNewViewDialogOpen, setIsNewViewDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewIcon, setNewViewIcon] = useState('Layout');

  const handleViewClick = (view: ViewPreferences) => {
    onViewChange(view);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, view: ViewPreferences) => {
    event.stopPropagation();
    setSelectedView(view);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedView(null);
  };

  const handleNewViewClick = () => {
    setIsNewViewDialogOpen(true);
    setAnchorEl(null);
  };

  const handleCreateView = async () => {
    if (newViewName.trim()) {
      await createViewPreference({
        name: newViewName,
        icon: newViewIcon,
        columns: viewPreferences[0]?.columns || [],
      });
      setIsNewViewDialogOpen(false);
      setNewViewName('');
      setNewViewIcon('Layout');
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconComponents[iconName as keyof typeof iconComponents] || DashboardIcon;
    return <IconComponent />;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', overflow: 'auto', maxWidth: 'calc(100% - 48px)' }}>
        {viewPreferences.map((view) => (
          <div
            key={view.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Button
              variant={view.id === currentViewId ? 'contained' : 'outlined'}
              onClick={() => handleViewClick(view)}
              startIcon={getIconComponent(view.icon)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {view.name}
            </Button>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, view)}
              style={{ padding: '4px' }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </div>
        ))}
      </div>

      <IconButton onClick={handleNewViewClick} color="primary">
        <AddIcon />
      </IconButton>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          // Logique pour renommer
          handleMenuClose();
        }}>
          Renommer
        </MenuItem>
        <MenuItem onClick={() => {
          // Logique pour changer l'icône
          handleMenuClose();
        }}>
          Changer l'icône
        </MenuItem>
        {!selectedView?.isDefault && (
          <MenuItem onClick={() => {
            // Logique pour supprimer
            handleMenuClose();
          }}>
            Supprimer
          </MenuItem>
        )}
      </Menu>

      <Dialog open={isNewViewDialogOpen} onClose={() => setIsNewViewDialogOpen(false)}>
        <DialogTitle>Nouvelle Vue</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la vue"
            fullWidth
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Icône</InputLabel>
            <Select
              value={newViewIcon}
              label="Icône"
              onChange={(e) => setNewViewIcon(e.target.value)}
            >
              <MenuItem value="Layout">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DashboardIcon /> Layout
                </div>
              </MenuItem>
              <MenuItem value="List">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ViewListIcon /> List
                </div>
              </MenuItem>
              <MenuItem value="Grid">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ViewModuleIcon /> Grid
                </div>
              </MenuItem>
              <MenuItem value="Table">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TableViewIcon /> Table
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewViewDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateView} variant="contained">Créer</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
