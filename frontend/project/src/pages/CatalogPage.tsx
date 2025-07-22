import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCatalog, useDeepSearchCatalog } from '../hooks/useApi';
import CatalogGrid from '../components/CatalogGrid';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertCircle } from 'lucide-react';

interface CatalogPageProps {
  section?: string;
}

const CatalogPage: React.FC<CatalogPageProps> = ({ section: sectionProp = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derivar valores de la URL
  const page = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);
  // Si hay prop section, úsala, si no, usa la de la URL
  const section = useMemo(() => sectionProp || searchParams.get('section') || '', [sectionProp, searchParams]);
  const search = useMemo(() => searchParams.get('search') || '', [searchParams]);

  const { data, isLoading, error, refetch } = useCatalog(page, section, search);
  const [deepResults, setDeepResults] = useState<any[] | null>(null);
  const [deepQuery, setDeepQuery] = useState<string>('');
  const { data: deepData, isLoading: deepLoading, error: deepError } = useDeepSearchCatalog(deepQuery);

  const handleDeepSearch = useCallback((query: string) => {
    setDeepQuery(query);
    setDeepResults(null); // Limpia resultados previos
  }, []);

  useEffect(() => {
    if (deepData) {
      setDeepResults(deepData);
    }
  }, [deepData]);

  // Si el usuario cambia la búsqueda normal, resetea la búsqueda profunda
  useEffect(() => {
    setDeepQuery('');
    setDeepResults(null);
  }, [search, section, page]);

  // Preload de la primera imagen del catálogo (LCP)
  useEffect(() => {
    if (data?.items && data.items.length > 0) {
      const firstImg = data.items[0].image;
      if (firstImg) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = firstImg;
        document.head.appendChild(link);
        return () => {
          document.head.removeChild(link);
        };
      }
    }
  }, [data]);

  // Handlers optimizados
  const handlePageChange = useCallback((newPage: number) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (newPage > 1) {
        params.set('page', newPage.toString());
      } else {
        params.delete('page');
      }
      return params;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  const handleSectionChange = useCallback((newSection: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (newSection) {
        params.set('section', newSection);
      } else {
        params.delete('section');
      }
      params.delete('page'); // reset page
      return params;
    });
  }, [setSearchParams]);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (newSearch) {
        params.set('search', newSearch);
      } else {
        params.delete('search');
      }
      params.delete('page'); // reset page
      return params;
    });
  }, [setSearchParams]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error al cargar el catálogo</h2>
          <p className="text-gray-400 mb-4">
            No se pudo cargar el contenido. Por favor, inténtalo de nuevo.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Catálogo</h1>
        <p className="text-gray-400">Descubre películas y series en español latino</p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        section={section}
        onSectionChange={handleSectionChange}
        onDeepSearch={handleDeepSearch}
      />

      {deepQuery ? (
        deepLoading ? (
          <CatalogGrid items={[]} loading={true} />
        ) : deepError ? (
          <div className="text-red-500 text-center my-8">Error en búsqueda profunda</div>
        ) : (
          <CatalogGrid items={deepResults || []} />
        )
      ) : isLoading ? (
        <CatalogGrid items={[]} loading={true} />
      ) : (
        <>
          <CatalogGrid items={data?.items || []} />
          {data?.pagination && (
            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
              loading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CatalogPage;