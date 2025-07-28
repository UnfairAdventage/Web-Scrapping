/**
 * Cliente base para llamadas a la API
 * 
 * Centraliza la configuración y funciones base para todas las llamadas a la API
 */

// Configuración base de la API
export const API_BASE_URL = import.meta.env.DEV
  ? `http://${window.location.hostname}:1234/api`
  : '/api';

// Tipos base para respuestas de API
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Cliente base para llamadas a la API
export const apiClient = {
  /**
   * Realiza una petición GET a la API
   */
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Construye una URL con parámetros de consulta
   */
  buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }
};

// Función helper para manejar errores de API
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido en la API';
}; 