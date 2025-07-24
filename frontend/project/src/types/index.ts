export interface CatalogItem {
  id: string;
  slug: string;
  title: string;
  alt: string;
  image: string;
  year: string;
  genres: string[];
  language: string;
  url: string;
  type: 'movie' | 'series' | 'anime';
  sinopsis?: string; // Nuevo campo opcional
  tituloReal?: string; // Nuevo campo opcional para el título extraído
}

export interface Episode {
  season: number;
  episode: number;
  title: string;
  date: string;
  url: string;
  image: string;
}

export interface PlayerData {
  player_url: string;
  source: string;
  format: 'iframe';
}

export interface SeriesData {
  info: CatalogItem;
  episodes: Episode[];
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}