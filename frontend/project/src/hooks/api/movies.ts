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
    const data = await apiClient.get<MovieApiResponse>(`/pelicula/${slug}`);
    const player = data.player || data;
    
    // Adaptar a los nuevos campos del backend
    return {
      player_url: player.player_url,
      source: player.source,
      format: player.format,
      sinopsis: data.info?.sinopsis || '',
      tituloReal: data.info?.titulo || '',
      fecha_estreno: data.info?.fecha_estreno || '',
      generos: data.info?.generos || [],
      imagen_poster: data.info?.imagen_poster || ''
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

export const usePlayerData = (url: string) => {
  return useQuery({
    queryKey: ['player', url],
    queryFn: () => moviesApi.getPlayerData(url),
    enabled: !!url,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}; 