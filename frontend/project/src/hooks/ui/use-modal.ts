/**
 * Hook para manejo de modales
 * 
 * Proporciona una interfaz consistente para abrir, cerrar y manejar
 * el estado de modales en la aplicación
 */

import { useState, useCallback, useEffect } from 'react';

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook básico para manejo de modales
 * @param initialOpen - Estado inicial del modal (por defecto false)
 * @returns Objeto con estado y funciones para manejar el modal
 */
export function useModal(initialOpen: boolean = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

/**
 * Hook para modal con datos
 * @param initialData - Datos iniciales del modal
 * @returns Objeto con estado, datos y funciones para manejar el modal
 */
export function useModalWithData<T>(initialData?: T) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(initialData);

  const open = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(undefined);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData
  };
}

/**
 * Hook para modal con confirmación
 * @returns Objeto con estado y funciones para modal de confirmación
 */
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const open = useCallback((msg: string, confirmCallback: () => void) => {
    setMessage(msg);
    setOnConfirm(() => confirmCallback);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setMessage('');
    setOnConfirm(null);
  }, []);

  const confirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    close();
  }, [onConfirm, close]);

  return {
    isOpen,
    message,
    open,
    close,
    confirm
  };
}

/**
 * Hook para modal con escape key
 * @param initialOpen - Estado inicial del modal
 * @returns Objeto con estado y funciones para manejar el modal
 */
export function useModalWithEscape(initialOpen: boolean = false): UseModalReturn {
  const modal = useModal(initialOpen);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modal.isOpen) {
        modal.close();
      }
    };

    if (modal.isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modal.isOpen, modal.close]);

  return modal;
} 