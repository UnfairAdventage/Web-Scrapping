import React, { useState, useEffect } from 'react';
import { Search, Filter, ScanSearch } from 'lucide-react';
import { useSections } from '../hooks/useApi';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  section: string;
  onSectionChange: (value: string) => void;
  onDeepSearch?: (query: string) => void; // Nueva prop opcional
}

const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  section,
  onSectionChange,
  onDeepSearch,
}) => {
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(inputValue);
    }, 400); // 400 ms debounce
    return () => clearTimeout(handler);
  }, [inputValue, onSearchChange]);

  const { data: sectionsData, isLoading: sectionsLoading } = useSections();
  
  // Map the sections from the API response
  const sections = [
    { value: '', label: 'Todos' },
    ...(sectionsData?.map(s => ({ 
      value: s.nombre, 
      label: s.nombre === 'Peliculas d' ? 'Películas Destacadas' : 
             s.nombre === 'K-Dram' ? 'K-Drama' : 
             s.nombre === 'Apple T' ? 'Apple TV+' : 
             s.nombre === 'HBO Ma' ? 'HBO Max' : 
             s.nombre 
    })) || [])
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1 flex items-center gap-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Buscar películas y series..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {/* Botón de Búsqueda profunda */}
        {onDeepSearch && (
          <button
            type="button"
            onClick={() => onDeepSearch(inputValue)}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ScanSearch />
          </button>
        )}
      </div>

      {/* Section Filter */}
      <div className="relative">
        <label htmlFor="section-select" className="sr-only">Filtrar por sección</label>
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <select
          id="section-select"
          aria-label="Filtrar por sección"
          value={section}
          onChange={(e) => onSectionChange(e.target.value)}
          disabled={sectionsLoading}
          className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
        >
          {sections.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;