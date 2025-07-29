/**
 * Hooks para manejo de series
 * 
 * Incluye hooks para obtener datos de series y episodios
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { SeriesData, Episode, CatalogItem } from '../../types';

// Tipos específicos para series
export interface SeriesInfo {
  titulo?: string;
  imagen_poster?: string;
  fecha_estreno?: string;
  generos?: string[];
  sinopsis?: string;
}

export interface SeriesApiResponse {
  temporadas: Record<string, any[]>;
  info?: SeriesInfo;
  titulo?: string;
  url?: string;
}

// Funciones de API para series
export const seriesApi = {
  /**
   * Obtiene datos completos de una serie
   */
  async getSeriesData(slug: string): Promise<SeriesData> {
    const data = await apiClient.get<SeriesApiResponse>(`/serie/${slug}`);
    
    const episodes: Episode[] = [];
    
    if (data.temporadas) {
      Object.entries(data.temporadas).forEach(([seasonNum, seasonEpisodes]) => {
        if (Array.isArray(seasonEpisodes)) {
          (seasonEpisodes as any[]).forEach((episode) => {
            episodes.push({
              season: parseInt(seasonNum),
              episode: episode.episodio ?? episode.episode ?? 0,
              title: episode.titulo || episode.title || '',
              date: episode.fecha || episode.date || '',
              url: episode.url,
              image: episode.imagen || episode.image || ''
            });
          });
        }
      });
    }
    
    const info = data.info || {};
    const seriesInfo: CatalogItem = {
      id: slug,
      slug,
      title: info.titulo || data.titulo || `Serie ${slug}`,
      alt: `Alt text for ${slug}`,
      image: info.imagen_poster || episodes[0]?.image || '',
      year: info.fecha_estreno || '',
      genres: Array.isArray(info.generos) ? info.generos : [],
      language: 'Latino',
      url: data.url || `https://sololatino.net/series/${slug}/`,
      type: 'series',
      sinopsis: info.sinopsis || '',
      tituloReal: info.titulo || ''
    };
    
    return {
      info: seriesInfo,
      episodes
    };
  }
};

// Hooks de React Query para series
export const useSeriesData = (slug: string) => {
  return useQuery({
    queryKey: ['series', slug],
    queryFn: () => seriesApi.getSeriesData(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para cachear datos de series y evitar fetches duplicados
export const useCachedSeriesData = (slug: string, passedData?: any) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['series', slug],
    queryFn: () => seriesApi.getSeriesData(slug),
    enabled: !!slug && !passedData, // Solo hacer fetch si no hay datos pasados
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    data: passedData || data,
    isLoading: !passedData && isLoading,
    error: !passedData && error
  };
}; 