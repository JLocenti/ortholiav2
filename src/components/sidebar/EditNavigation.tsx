import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { FileText, Stethoscope, Activity, Bone, CircleDot, ArrowLeft, Plus, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EditNavigationProps {
  isExpanded: boolean;
}

export default function EditNavigation({ isExpanded }: EditNavigationProps) {
  const navigate = useNavigate();
  const { categories } = useCategories();

  const getIconForCategory = (categoryId: string) => {
    switch (categoryId) {
      case 'general':
        return <FileText className="h-5 w-5" />;
      case 'medical':
        return <Stethoscope className="h-5 w-5" />;
      case 'vital':
        return <Activity className="h-5 w-5" />;
      case 'physical':
        return <Bone className="h-5 w-5" />;
      default:
        return <CircleDot className="h-5 w-5" />;
    }
  };

  return (
    <div className="py-6">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/home')}
            className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-white">
            Édition
          </h2>
        </div>
      </div>

      {/* Praticiens Section */}
      <div className="space-y-2 mb-6">
        <NavLink
          to="/app/patient-edit/practitioners"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors relative group mx-2",
            isActive 
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          )}
        >
          <Users className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium truncate flex-grow">
            Praticiens
          </span>
        </NavLink>

        <button
          onClick={() => navigate('/app/add-practitioner')}
          className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors mx-2 bg-blue-600 text-white w-full"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            Ajouter un praticien
          </span>
        </button>
      </div>

      {/* Other Categories */}
      <div className="space-y-2">
        {categories
          .filter(category => category.id !== 'practitioners')
          .map(category => (
            <NavLink
              key={category.id}
              to={`/app/patient-edit/${category.id}`}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors relative group",
                isExpanded ? "mx-2" : "mx-auto w-10 h-10 justify-center",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {getIconForCategory(category.id)}
              {isExpanded && (
                <span className="text-sm font-medium truncate">
                  {category.name}
                </span>
              )}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {category.name}
                </div>
              )}
            </NavLink>
          ))}
      </div>
    </div>
  );
}