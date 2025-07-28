/**
 * Hooks principales de la aplicación
 * 
 * Este archivo centraliza todas las exportaciones de hooks
 * organizados por categorías: api, ui, utils
 */

// API Hooks - Hooks relacionados con llamadas a la API
export * from './api/api-client';
export * from './api/catalog';
export * from './api/search';
export * from './api/series';
export * from './api/movies';
export * from './api/anime';

// UI Hooks - Hooks para componentes de interfaz
export * from './ui/use-modal';
export * from './ui/use-pagination';

// Utils Hooks - Hooks utilitarios reutilizables
export * from './utils/use-debounce';
export * from './utils/use-local-storage';