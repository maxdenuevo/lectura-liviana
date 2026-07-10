import { useEffect, useRef } from 'react';
import { saveProgress } from '@/lib/db';

const SAVE_INTERVAL = 2000;

/**
 * Persiste la posición de lectura del libro activo en IndexedDB.
 * Guardado throttled (~2s) mientras avanza + flush al pausar,
 * al ocultar la pestaña y al salir de la página.
 */
export function useReadingProgress(
  bookId: string | null,
  currentIndex: number,
  isPlaying: boolean
) {
  const latest = useRef({ bookId, currentIndex });
  const lastSavedIndex = useRef(-1);
  const timer = useRef<NodeJS.Timeout | null>(null);

  latest.current = { bookId, currentIndex };

  // Guardado throttled mientras cambia la posición
  useEffect(() => {
    if (!bookId || currentIndex === lastSavedIndex.current) return;

    if (timer.current) return; // ya hay un guardado agendado

    timer.current = setTimeout(() => {
      timer.current = null;
      const { bookId: id, currentIndex: index } = latest.current;
      if (id && index !== lastSavedIndex.current) {
        lastSavedIndex.current = index;
        saveProgress(id, index);
      }
    }, SAVE_INTERVAL);
  }, [bookId, currentIndex]);

  // Flush inmediato al pausar
  useEffect(() => {
    if (isPlaying) return;
    const { bookId: id, currentIndex: index } = latest.current;
    if (id && index !== lastSavedIndex.current) {
      lastSavedIndex.current = index;
      saveProgress(id, index);
    }
  }, [isPlaying]);

  // Flush al ocultar la pestaña o salir
  useEffect(() => {
    const flush = () => {
      const { bookId: id, currentIndex: index } = latest.current;
      if (id && index !== lastSavedIndex.current) {
        lastSavedIndex.current = index;
        saveProgress(id, index);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  // Al cambiar de libro, no arrastrar el índice guardado del anterior
  useEffect(() => {
    lastSavedIndex.current = -1;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, [bookId]);
}
