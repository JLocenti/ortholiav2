import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import Fuse from 'fuse.js';
import { Patient } from '../types/view';

interface PatientSearchProps {
  patients: Patient[];
  onPatientSelect: (patient: Patient | null) => void;
}

const RECENT_SEARCHES_KEY = 'recentPatientSearches';
const MAX_RECENT_SEARCHES = 3;

export default function PatientSearch({ patients = [], onPatientSelect }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Patient[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuseRef = useRef<Fuse<Patient>>();

  // Initialize Fuse and load recent searches
  useEffect(() => {
    if (patients && patients.length > 0) {
      fuseRef.current = new Fuse(patients, {
        keys: ['fileNumber'],
        threshold: 0.3,
        distance: 100,
        includeScore: true,
        shouldSort: true,
        findAllMatches: true,
        minMatchCharLength: 1
      });
    }

    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (savedSearches) {
      const parsedSearches = JSON.parse(savedSearches);
      const validSearches = parsedSearches.filter((search: any) => 
        patients.some(p => p.id === search.id)
      );
      setRecentSearches(validSearches);
    }
  }, [patients]);

  // Handle search term changes
  useEffect(() => {
    if (searchTerm) {
      const normalizedTerm = searchTerm.trim().toLowerCase();
      
      // Direct matches for file numbers
      const directMatches = patients.filter(patient => {
        if (!patient.fileNumber) return false;
        return patient.fileNumber.toLowerCase().includes(normalizedTerm);
      });

      // Fuzzy search for additional matches
      const fuseMatches = fuseRef.current?.search(normalizedTerm)
        .map(result => result.item)
        .filter(item => !directMatches.some(dm => dm.id === item.id)) || [];

      setResults([...directMatches, ...fuseMatches].slice(0, 3));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [searchTerm, patients]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToRecentSearches = (patient: Patient) => {
    const newRecent = [
      patient,
      ...recentSearches.filter(p => p.id !== patient.id)
    ].slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(newRecent);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  };

  const handlePatientSelect = (patient: Patient) => {
    setSearchTerm('');
    setIsOpen(false);
    setIsFocused(false);
    addToRecentSearches(patient);
    onPatientSelect(patient);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchTerm || recentSearches.length > 0) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onPatientSelect(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`
        relative flex items-center transition-all duration-200
        ${isFocused ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}
        rounded-xl shadow-sm
      `}>
        <Search className={`
          absolute left-3 w-5 h-5 transition-colors duration-200
          ${isFocused ? 'text-[var(--theme-color)]' : 'text-gray-400'}
        `} />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          placeholder="Rechercher un numéro de dossier..."
          className="w-full pl-11 pr-10 py-3 bg-transparent border-none placeholder-gray-400 text-gray-900 dark:text-white focus:ring-0 focus:outline-none text-base"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || recentSearches.length > 0) && (
        <div className="absolute left-0 right-0 mt-2 overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Search Results */}
          {results.length > 0 && (
            <div className="py-2">
              {results.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {patient.fileNumber || '-'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchTerm && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recherches récentes
              </div>
              {recentSearches.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {patient.fileNumber || '-'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}