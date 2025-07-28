/**
 * Hook para manejo de paginación
 * 
 * Proporciona una interfaz consistente para manejar paginación
 * con navegación, límites y cálculos automáticos
 */

import { useState, useMemo, useCallback } from 'react';

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface UsePaginationReturn {
  // Estado actual
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Funciones de navegación
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  
  // Información calculada
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startItem: number;
  endItem: number;
  pageNumbers: number[];
  
  // Configuración
  setItemsPerPage: (itemsPerPage: number) => void;
  reset: () => void;
}

/**
 * Hook básico para paginación
 * @param initialState - Estado inicial de la paginación
 * @returns Objeto con estado y funciones para manejar la paginación
 */
export function usePagination(initialState: Partial<PaginationState> = {}): UsePaginationReturn {
  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 20
  } = initialState;

  const [state, setState] = useState<PaginationState>({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage
  });

  // Funciones de navegación
  const goToPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }));
  }, []);

  const nextPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.totalPages)
    }));
  }, []);

  const prevPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1)
    }));
  }, []);

  const goToFirst = useCallback(() => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const goToLast = useCallback(() => {
    setState(prev => ({ ...prev, currentPage: prev.totalPages }));
  }, []);

  const setItemsPerPage = useCallback((newItemsPerPage: number) => {
    setState(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Reset a la primera página
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20
    });
  }, []);

  // Valores calculados
  const hasNextPage = useMemo(() => state.currentPage < state.totalPages, [state.currentPage, state.totalPages]);
  const hasPrevPage = useMemo(() => state.currentPage > 1, [state.currentPage]);
  const startItem = useMemo(() => (state.currentPage - 1) * state.itemsPerPage + 1, [state.currentPage, state.itemsPerPage]);
  const endItem = useMemo(() => Math.min(state.currentPage * state.itemsPerPage, state.totalItems), [state.currentPage, state.itemsPerPage, state.totalItems]);

  // Generar array de números de página para mostrar
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (state.totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si hay pocas
      for (let i = 1; i <= state.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la página actual
      const start = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(state.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [state.currentPage, state.totalPages]);

  return {
    // Estado
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalItems: state.totalItems,
    itemsPerPage: state.itemsPerPage,
    
    // Funciones
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    setItemsPerPage,
    reset,
    
    // Calculados
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
    pageNumbers
  };
}

/**
 * Hook para paginación con actualización automática
 * @param paginationData - Datos de paginación desde la API
 * @returns Objeto con estado y funciones para manejar la paginación
 */
export function usePaginationWithData(paginationData: Partial<PaginationState> = {}) {
  const pagination = usePagination();
  
  // Actualizar paginación cuando cambien los datos
  const updatePagination = useCallback((data: Partial<PaginationState>) => {
    pagination.goToPage(data.currentPage || 1);
    // Nota: En una implementación real, necesitarías actualizar el estado
    // de la paginación con los nuevos datos de la API
  }, [pagination]);

  return {
    ...pagination,
    updatePagination
  };
} 