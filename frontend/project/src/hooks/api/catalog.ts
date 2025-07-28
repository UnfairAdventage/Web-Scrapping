/**
 * Hooks para manejo del catálogo de contenido
 * 
 * Incluye hooks para obtener secciones y listado de contenido
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { CatalogItem } from '../../types';

// Tipos específicos para catálogo
export interface CatalogResponse {
  items: CatalogItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface Section {
  nombre: string;
}

// Funciones de API para catálogo
export const catalogApi = {
  /**
   * Obtiene las secciones disponibles
   */
  async getSections(): Promise<Section[]> {
    const data = await apiClient.get<{ secciones: string[] }>('/secciones');
    return data.secciones.map((nombre: string) => ({ nombre }));
  },

  /**
   * Obtiene el catálogo con filtros opcionales
   */
  async getCatalog(
    page: number = 1, 
    section?: string, 
    search?: string
  ): Promise<CatalogResponse> {
    const params: Record<string, string | number> = { pagina: page };
    
    if (section && section !== '') {
      params.seccion = section;
    }
    
    if (search && search !== '') {
      params.busqueda = search;
    }

    const data = await apiClient.get<any>('/listado', params);
    
    // Mapear los campos reales del backend
    const items: CatalogItem[] = (data.resultados as any[]).map((item) => ({
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

    return {
      items,
      pagination: {
        currentPage: page,
        totalPages: 10000,
        totalItems: data.total_items || items.length * 5,
        itemsPerPage: 20
      }
    };
  }
};

// Hooks de React Query para catálogo
export const useSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: catalogApi.getSections,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

export const useCatalog = (page: number, section?: string, search?: string) => {
  return useQuery({
    queryKey: ['catalog', page, section, search],
    queryFn: () => catalogApi.getCatalog(page, section, search),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}; 