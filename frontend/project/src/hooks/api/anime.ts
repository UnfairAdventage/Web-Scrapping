/**
 * Hooks para manejo de anime
 * 
 * Incluye hooks para obtener datos de anime y episodios
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { SeriesData, Episode, CatalogItem } from '../../types';

// Tipos específicos para anime
export interface AnimeInfo {
  titulo?: string;
  imagen_poster?: string;
  fecha_estreno?: string;
  generos?: string[];
  sinopsis?: string;
}

export interface AnimeApiResponse {
  temporadas: Record<string, any[]>;
  info?: AnimeInfo;
  titulo?: string;
  url?: string;
}

// Funciones de API para anime
export const animeApi = {
  /**
   * Obtiene datos completos de un anime
   */
  async getAnimeData(slug: string): Promise<SeriesData> {
    const data = await apiClient.get<AnimeApiResponse>(`/anime/${slug}`);
    
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
    const animeInfo: CatalogItem = {
      id: slug,
      slug,
      title: info.titulo || data.titulo || `Anime ${slug}`,
      alt: `Alt text for ${slug}`,
      image: info.imagen_poster || episodes[0]?.image || '',
      year: info.fecha_estreno || '',
      genres: Array.isArray(info.generos) ? info.generos : [],
      language: 'Latino',
      url: data.url || `https://sololatino.net/animes/${slug}/`,
      type: 'anime',
      sinopsis: info.sinopsis || '',
      tituloReal: info.titulo || ''
    };
    
    return {
      info: animeInfo,
      episodes
    };
  }
};

// Hooks de React Query para anime
export const useAnimeData = (slug: string) => {
  return useQuery({
    queryKey: ['anime', slug],
    queryFn: () => animeApi.getAnimeData(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}; 