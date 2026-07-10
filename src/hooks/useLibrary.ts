import { useState, useEffect, useCallback } from 'react';
import {
  listBooks,
  listProgress,
  getBook,
  getProgress,
  addBook,
  touchBook,
  deleteBook,
  type StoredBook,
  type BookSummary,
  type BookSource,
  type BookProgress,
} from '@/lib/db';

export interface LibraryEntry extends BookSummary {
  /** Posición guardada (índice de palabra), 0 si nunca se leyó */
  savedIndex: number;
}

interface UseLibraryConfig {
  onBookOpened: (book: StoredBook, initialIndex: number) => void;
  onError: (message: string) => void;
}

/**
 * Biblioteca multi-libro en IndexedDB con reanudación de posición.
 * Al montar: migra el `savedText` legado de localStorage y reabre el último libro.
 */
export function useLibrary({ onBookOpened, onError }: UseLibraryConfig) {
  const [books, setBooks] = useState<LibraryEntry[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  const refreshBooks = useCallback(async () => {
    const [summaries, progressMap] = await Promise.all([listBooks(), listProgress()]);
    setBooks(
      summaries.map(summary => ({
        ...summary,
        savedIndex: progressMap.get(summary.id)?.currentIndex ?? 0,
      }))
    );
    return summaries;
  }, []);

  const openBook = useCallback(async (id: string) => {
    try {
      const book = await getBook(id);
      if (!book) {
        onError('El libro ya no está en la biblioteca');
        await refreshBooks();
        return;
      }
      const progress: BookProgress | undefined = await getProgress(id);
      setActiveBookId(id);
      touchBook(id).then(refreshBooks);
      onBookOpened(book, progress?.currentIndex ?? 0);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'No se pudo abrir el libro');
    }
  }, [onBookOpened, onError, refreshBooks]);

  const addBookToLibrary = useCallback(async (
    book: {
      title: string;
      author?: string;
      source: BookSource;
      fullText: string;
      metadata?: StoredBook['metadata'];
      chapters?: StoredBook['chapters'];
    },
    { open = true }: { open?: boolean } = {}
  ): Promise<StoredBook | null> => {
    try {
      const wordCount = book.fullText.trim() ? book.fullText.trim().split(/\s+/).length : 0;
      const stored = await addBook({ ...book, wordCount });
      await refreshBooks();
      if (open) {
        setActiveBookId(stored.id);
        onBookOpened(stored, 0);
      }
      return stored;
    } catch (error) {
      onError(error instanceof Error ? error.message : 'No se pudo guardar el libro');
      return null;
    }
  }, [onBookOpened, onError, refreshBooks]);

  const removeBook = useCallback(async (id: string) => {
    try {
      await deleteBook(id);
      if (activeBookId === id) {
        setActiveBookId(null);
      }
      await refreshBooks();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'No se pudo borrar el libro');
    }
  }, [activeBookId, onError, refreshBooks]);

  /** El texto del textarea dejó de corresponder a un libro guardado */
  const detachActiveBook = useCallback(() => {
    setActiveBookId(null);
  }, []);

  // Carga inicial: migración del savedText legado + reabrir el último libro
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Migración one-shot desde localStorage (límite 5MB, QuotaExceededError silencioso)
        const legacyText = localStorage.getItem('savedText');
        if (legacyText && legacyText.trim()) {
          const wordCount = legacyText.trim().split(/\s+/).length;
          await addBook({
            title: 'Texto guardado',
            source: 'paste',
            fullText: legacyText,
            wordCount,
          });
          localStorage.removeItem('savedText');
        }

        const summaries = await refreshBooks();
        if (cancelled) return;

        // Reanudar el último libro abierto
        if (summaries.length > 0) {
          const lastBook = await getBook(summaries[0].id);
          const progress = lastBook ? await getProgress(lastBook.id) : undefined;
          if (!cancelled && lastBook) {
            setActiveBookId(lastBook.id);
            onBookOpened(lastBook, progress?.currentIndex ?? 0);
          }
        }
      } catch (error) {
        console.error('Error inicializando la biblioteca:', error);
      } finally {
        if (!cancelled) setIsLibraryLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    books,
    activeBookId,
    isLibraryLoaded,
    openBook,
    addBookToLibrary,
    removeBook,
    detachActiveBook,
    refreshBooks,
  };
}
