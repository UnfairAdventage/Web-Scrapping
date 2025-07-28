/**
 * Hook para manejo de localStorage
 * 
 * Proporciona una interfaz segura y tipada para localStorage
 * con manejo de errores y serialización automática
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para manejar valores en localStorage
 * @param key - La clave en localStorage
 * @param initialValue - El valor inicial si no existe en localStorage
 * @returns [valor, setter, remove] - El valor actual, función para actualizar y función para remover
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para establecer el valor
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permitir que value sea una función para que tengamos la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Función para remover el valor
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Escuchar cambios en otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook para manejar un valor booleano en localStorage
 * @param key - La clave en localStorage
 * @param initialValue - El valor inicial (por defecto false)
 * @returns [valor, setter, toggle, remove] - El valor actual, funciones para actualizar, toggle y remover
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean = false
): [boolean, (value: boolean) => void, () => void, () => void] {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  const toggle = useCallback(() => {
    setValue(!value);
  }, [value, setValue]);

  return [value, setValue, toggle, removeValue];
}

/**
 * Hook para manejar un array en localStorage
 * @param key - La clave en localStorage
 * @param initialValue - El array inicial
 * @returns [array, setter, add, remove, clear] - El array actual y funciones para manipularlo
 */
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
): [T[], (value: T[]) => void, (item: T) => void, (item: T) => void, () => void] {
  const [array, setArray, removeValue] = useLocalStorage(key, initialValue);

  const add = useCallback((item: T) => {
    setArray(prev => [...prev, item]);
  }, [setArray]);

  const remove = useCallback((item: T) => {
    setArray(prev => prev.filter(i => i !== item));
  }, [setArray]);

  const clear = useCallback(() => {
    removeValue();
  }, [removeValue]);

  return [array, setArray, add, remove, clear];
} 