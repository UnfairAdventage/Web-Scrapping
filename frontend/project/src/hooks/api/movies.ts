/**
 * Hooks para manejo de películas
 * 
 * Incluye hooks para obtener datos de películas y reproductores
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { PlayerData } from '../../types';

// Tipos específicos para películas
export interface MovieInfo {
  sinopsis?: string;
  titulo?: string;
  fecha_estreno?: string;
  generos?: string[];
  imagen_poster?: string;
}

export interface MoviePlayerResponse extends PlayerData {
  sinopsis?: string;
  tituloReal?: string;
  fecha_estreno?: string;
  generos?: string[];
  imagen_poster?: string;
}

export interface MovieApiResponse {
  player: PlayerData;
  info?: MovieInfo;
}

// Funciones de API para películas
export const moviesApi = {
  /**
   * Obtiene datos del reproductor de una película
   */
  async getMoviePlayer(slug: string): Promise<MoviePlayerResponse> {
    const data = await apiClient.get<any>(`/pelicula/${slug}`);
    
    // La respuesta del API tiene esta estructura:
    // { encontrado_en, info: { titulo, sinopsis, ... }, player: { player_url, ... } }
    const player = data.player || {};
    const info = data.info || {};
    
    return {
      player_url: player.player_url || '',
      source: player.source || '',
      format: player.format || '',
      sinopsis: info.sinopsis || '',
      tituloReal: info.titulo || '',
      fecha_estreno: info.fecha_estreno || '',
      generos: info.generos || [],
      imagen_poster: info.imagen_poster || ''
    };
  },

  /**
   * Obtiene datos del reproductor desde una URL
   */
  async getPlayerData(url: string): Promise<PlayerData> {
    const data = await apiClient.get<any>('/iframe_player', { url });
    const player = data.player || data;
    
    return {
      player_url: player.player_url,
      source: player.source,
      format: player.format
    };
  }
};

// Hooks de React Query para películas
export const useMoviePlayer = (slug: string, type?: 'movie' | 'anime' | 'series') => {
  return useQuery({
    queryKey: ['movie-player', slug, type],
    queryFn: () => moviesApi.getMoviePlayer(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
};

// Hook para cachear datos de películas y evitar fetches duplicados
export const useCachedMovieData = (slug: string, passedData?: any) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movie-player', slug],
    queryFn: () => moviesApi.getMoviePlayer(slug),
    enabled: !!slug && !passedData, // Solo hacer fetch si no hay datos pasados
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  return {
    data: passedData || data,
    isLoading: !passedData && isLoading,
    error: !passedData && error
  };
};

export const usePlayerData = (url: string) => {
  return useQuery({
    queryKey: ['player', url],
    queryFn: () => moviesApi.getPlayerData(url),
    enabled: !!url,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}; 