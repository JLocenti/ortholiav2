import React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../lib/utils';

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  className?: string;
}

export default function IconSelector({ selectedIcon, onSelect, className }: IconSelectorProps) {
  // Groupes d'icônes par catégorie
  const iconGroups = {
    medical: [
      'Stethoscope',
      'FirstAid',
      'Thermometer',
      'HeartPulse',
      'Activity',
      'Pulse',
      'Brain',
      'Microscope',
      'Pill',
      'Syringe',
      'Tablets',
      'Bandage',
      'Lungs',
      'Heart',
      'CircleDot', // Pour représenter une dent
      'Bone',
      'Cross',
      'BadgeAlert', // Pour les urgences
      'Gauge', // Pour les mesures
      'Eye',
      'Ear'
    ],
    admin: [
      'ClipboardList',
      'ClipboardCheck',
      'ClipboardSignature',
      'FileText',
      'FilePlus',
      'FileCheck',
      'Files',
      'FolderOpen',
      'Calendar',
      'CalendarDays',
      'CalendarClock',
      'Clock',
      'Timer',
      'AlarmClock',
      'Mail',
      'Phone',
      'MessageSquare',
      'Bell',
      'Search',
      'Printer'
    ],
    patient: [
      'User',
      'UserPlus',
      'UserCheck',
      'Users',
      'UserCog',
      'Baby',
      'PersonStanding',
      'Smile', // Pour l'orthodontie
      'ScrollText', // Pour les prescriptions
      'ClipboardList',
      'ListChecks',
      'CheckSquare',
      'History',
      'BadgePlus',
      'BadgeCheck',
      'BadgeInfo'
    ],
    analysis: [
      'BarChart',
      'LineChart',
      'PieChart',
      'TrendingUp',
      'Gauge',
      'Ruler',
      'Scale',
      'Microscope',
      'Scan',
      'ZoomIn',
      'Focus',
      'Target',
      'Crosshair'
    ]
  };

  // Aplatir tous les groupes d'icônes en une seule liste
  const allIcons = Object.values(iconGroups).flat();

  return (
    <div className="space-y-6">
      {Object.entries(iconGroups).map(([groupName, icons]) => (
        <div key={groupName} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {groupName === 'admin' ? 'Administration' : 
             groupName === 'medical' ? 'Médical' : 
             groupName === 'patient' ? 'Patients' : 
             'Analyses'}
          </h3>
          <div className={cn("grid grid-cols-8 gap-2", className)}>
            {icons.map(iconName => {
              const Icon = Icons[iconName as keyof typeof Icons];
              return (
                <button
                  key={iconName}
                  onClick={() => onSelect(iconName)}
                  className={cn(
                    "p-3 rounded-lg transition-colors hover:scale-110 group",
                    selectedIcon === iconName
                      ? "bg-[var(--theme-color)] text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                  title={iconName}
                >
                  {Icon && (
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        {iconName}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}