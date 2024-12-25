import React, { useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

interface IconSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

const commonIcons = [
  'Activity', 'AlertCircle', 'Archive', 'ArrowRight', 'Award', 'Bookmark',
  'Calendar', 'Check', 'CheckCircle', 'Clipboard', 'Clock', 'File',
  'FileText', 'Filter', 'Flag', 'Folder', 'Heart', 'Home', 'Image',
  'Info', 'Link', 'List', 'Lock', 'Mail', 'Map', 'MessageCircle',
  'Moon', 'Music', 'Package', 'Phone', 'PieChart', 'Pin', 'Plus',
  'Power', 'Radio', 'Save', 'Search', 'Settings', 'Share', 'Shield',
  'ShoppingCart', 'Star', 'Sun', 'Tag', 'Terminal', 'ThumbsUp',
  'Tool', 'Trash', 'Trophy', 'User', 'Users', 'Video', 'Volume2',
  'Wifi', 'ZoomIn',
  // Icônes médicales
  'Stethoscope', 'Heart', 'Brain', 'Bone', 'Activity', 'Thermometer',
  'Cross', 'FirstAid', 'Pill', 'Syringe', 'Microscope', 'HeartPulse',
  'Bandage', 'Virus', 'Bacteria', 'DNA', 'Hospital', 'Ambulance'
];

export function IconSelectorModal({ isOpen, onClose, onSelect, currentIcon }: IconSelectorModalProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedIcon, setSelectedIcon] = React.useState(currentIcon);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Empêcher le scroll du body quand le modal est ouvert
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIcons = commonIcons.filter(icon => 
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    onSelect(iconName);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999999] bg-black/50 flex items-start justify-center pt-24" style={{ isolation: 'isolate' }}>
      <div 
        ref={modalRef}
        className="bg-gray-900 w-[400px] sm:w-[540px] max-h-[calc(100vh-120px)] flex flex-col shadow-xl rounded-lg"
        style={{ isolation: 'isolate' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">Sélectionner une icône</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher une icône..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-auto rounded-lg bg-gray-800/50 p-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {filteredIcons.map((iconName) => {
                const Icon = (LucideIcons as any)[iconName];
                return Icon ? (
                  <button
                    key={iconName}
                    onClick={() => handleSelect(iconName)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-gray-400",
                      "hover:bg-gray-700 hover:text-gray-100",
                      selectedIcon === iconName && "bg-gray-700 text-gray-100"
                    )}
                    title={iconName}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs mt-1 text-center truncate w-full">
                      {iconName}
                    </span>
                  </button>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
