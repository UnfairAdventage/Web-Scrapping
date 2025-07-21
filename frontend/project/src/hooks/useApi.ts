import { useQuery } from '@tanstack/react-query';
import { CatalogItem, Episode, PlayerData, SeriesData } from '../types';

const API_BASE_URL = `http://${window.location.hostname}:1234/api`;

// Siempre usa los nombres de sección que devuelve la API
export const fetchSections = async (): Promise<{ nombre: string }[]> => {
  const response = await fetch(`${API_BASE_URL}/secciones`);
  if (!response.ok) {
    throw new Error('Failed to fetch sections');
  }
  const data = await response.json();
  // Devuelve como array de objetos para selectores
  return data.secciones.map((nombre: string) => ({ nombre }));
};

// API functions for Flask backend
const api = {
  getSections: fetchSections,

  getCatalog: async (page: number = 1, section?: string, search?: string): Promise<{
    items: CatalogItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    let url = `${API_BASE_URL}/listado?pagina=${page}`;
    // section debe venir de la API y usarse tal cual
    if (section && section !== '') {
      url += `&seccion=${encodeURIComponent(section)}`;
    }
    if (search && search !== '') {
      url += `&busqueda=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch catalog');
    }
    const data = await response.json();
    // Mapear los campos reales del backend
    const items: CatalogItem[] = (data.resultados as any[]).map((item) => ({
      id: item.slug || item.url,
      slug: item.slug || item.url,
      title: item.titulo || item.title || item.nombre || '',
      alt: item.alt || '',
      image: item.imagen || item.image || '',
      year: item.año || item.year || '',
      genres: item.generos || item.genres || '',
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
        totalPages: data.total_paginas || 5,
        totalItems: data.total_items || items.length * 5,
        itemsPerPage: 20
      }
    };
  },

  getSeriesData: async (slug: string): Promise<SeriesData> => {
    const response = await fetch(`${API_BASE_URL}/serie/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch series data');
    }
    const data = await response.json();
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
    const seriesInfo: CatalogItem = {
      id: slug,
      slug,
      title: data.info?.titulo || data.titulo || `Serie ${slug}`,
      alt: `Alt text for ${slug}`,
      image: data.imagen || episodes[0]?.image || 'https://images.pexels.com/photos/1500000/pexels-photo-1500000.jpeg?auto=compress&cs=tinysrgb&w=400&h=600',
      year: data.año || data.year || '2023',
      genres: data.generos || data.genres || 'Drama, Acción',
      language: 'Latino',
      url: data.url || `https://sololatino.net/series/${slug}/`,
      type: 'series',
      sinopsis: data.info?.sinopsis || '',
      tituloReal: data.info?.titulo || ''
    };
    return {
      info: seriesInfo,
      episodes
    };
  },

  getMoviePlayer: async (slug: string): Promise<PlayerData & { sinopsis?: string; tituloReal?: string; fecha_estreno?: string; generos?: string[]; imagen_poster?: string }> => {
    const response = await fetch(`${API_BASE_URL}/pelicula/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch movie player');
    }
    const data = await response.json();
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

  getPlayerData: async (url: string): Promise<PlayerData> => {
    const response = await fetch(`${API_BASE_URL}/iframe_player?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch player data');
    }
    const data = await response.json();
    const player = data.player || data;
    return {
      player_url: player.player_url,
      source: player.source,
      format: player.format
    };
  },

  searchCatalog: async (query: string): Promise<CatalogItem[]> => {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search catalog');
    }
    const data = await response.json();
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

  getAnimeData: async (slug: string): Promise<SeriesData> => {
    const response = await fetch(`${API_BASE_URL}/anime/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch anime data');
    }
    const data = await response.json();
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
    const animeInfo: CatalogItem = {
      id: slug,
      slug,
      title: data.info?.titulo || data.titulo || `Anime ${slug}`,
      alt: `Alt text for ${slug}`,
      image: data.imagen || episodes[0]?.image || 'https://images.pexels.com/photos/1500000/pexels-photo-1500000.jpeg?auto=compress&cs=tinysrgb&w=400&h=600',
      year: data.año || data.year || '2023',
      genres: data.generos || data.genres || 'Anime',
      language: 'Latino',
      url: data.url || `https://sololatino.net/animes/${slug}/`,
      type: 'anime',
      sinopsis: data.info?.sinopsis || '',
      tituloReal: data.info?.titulo || ''
    };
    return {
      info: animeInfo,
      episodes
    };
  }
};

// Custom hooks for React Query
export const useSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: api.getSections,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCatalog = (page: number, section?: string, search?: string) => {
  return useQuery({
    queryKey: ['catalog', page, section, search],
    queryFn: () => api.getCatalog(page, section, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCatalogSearch = (query: string) => {
  return useQuery({
    queryKey: ['catalog-search', query],
    queryFn: () => api.searchCatalog(query),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useSeriesData = (slug: string) => {
  return useQuery({
    queryKey: ['series', slug],
    queryFn: () => api.getSeriesData(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMoviePlayer = (slug: string, type?: 'movie' | 'anime' | 'series') => {
  return useQuery({
    queryKey: ['movie-player', slug, type],
    queryFn: () => api.getMoviePlayer(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const usePlayerData = (url: string) => {
  return useQuery({
    queryKey: ['player', url],
    queryFn: () => api.getPlayerData(url),
    enabled: !!url,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useAnimeData = (slug: string) => {
  return useQuery({
    queryKey: ['anime', slug],
    queryFn: () => api.getAnimeData(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};