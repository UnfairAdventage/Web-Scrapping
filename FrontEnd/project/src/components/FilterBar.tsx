import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useSections } from '../hooks/useApi';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  section: string;
  onSectionChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  section,
  onSectionChange,
}) => {
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
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar películas y series..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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