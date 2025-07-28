/**
 * Hooks para búsqueda de contenido
 * 
 * Incluye hooks para búsqueda básica y búsqueda profunda
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { CatalogItem } from '../../types';

// Funciones de API para búsqueda
export const searchApi = {
  /**
   * Búsqueda básica en el catálogo
   */
  async searchCatalog(query: string): Promise<CatalogItem[]> {
    const data = await apiClient.get<any>('/search', { q: query });
    
    return (data.resultados as any[]).map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      alt: item.alt,
      image: item.image,
      year: item.year,
      genres: item.genres,
      language: item.language,
      url: item.url,
      type: item.type
    }));
  },

  /**
   * Búsqueda profunda en el catálogo
   */
  async deepSearchCatalog(query: string): Promise<CatalogItem[]> {
    const data = await apiClient.get<any>('/deep-search', { query });
    
    return (data as any[]).map((item) => ({
      id: item.slug || item.url,
      slug: item.slug || item.url,
      title: item.titulo || item.title || item.nombre || '',
      alt: item.alt || '',
      image: item.imagen || item.image || '',
      year: item.año || item.year || '',
      genres: Array.isArray(item.generos)
        ? item.generos
        : Array.isArray(item.genres)
          ? item.genres
          : typeof item.generos === 'string' && item.generos.trim() !== ''
            ? item.generos.split(',').map((g: string) => g.trim())
            : typeof item.genres === 'string' && item.genres.trim() !== ''
              ? item.genres.split(',').map((g: string) => g.trim())
              : [],
      language: item.idioma || item.language || 'Latino',
      url: item.url,
      type:
        item.tipo === 'pelicula' || item.type === 'movie'
          ? 'movie'
          : item.tipo === 'serie' || item.type === 'series'
            ? 'series'
            : 'anime'
    }));
  }
};

// Hooks de React Query para búsqueda
export const useCatalogSearch = (query: string) => {
  return useQuery({
    queryKey: ['catalog-search', query],
    queryFn: () => searchApi.searchCatalog(query),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useDeepSearchCatalog = (query: string) => {
  return useQuery({
    queryKey: ['deep-search-catalog', query],
    queryFn: () => searchApi.deepSearchCatalog(query),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}; 