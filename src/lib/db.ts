import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { EpubMetadata, EpubChapter } from './epubParser';

/**
 * Persistencia de la biblioteca en IndexedDB.
 * `books` guarda el libro completo; `progress` la posición de lectura por libro,
 * en un store separado para que el guardado frecuente no reescriba blobs de MB.
 */

export type BookSource = 'epub' | 'file' | 'url' | 'paste';

export interface StoredBook {
  id: string;
  title: string;
  author?: string;
  source: BookSource;
  addedAt: number;
  lastOpenedAt: number;
  wordCount: number;
  metadata?: EpubMetadata;
  chapters?: EpubChapter[];
  fullText: string;
}

/** Versión liviana para listar la biblioteca sin cargar los textos completos */
export type BookSummary = Omit<StoredBook, 'fullText' | 'chapters'>;

export interface BookProgress {
  bookId: string;
  currentIndex: number;
  updatedAt: number;
}

interface LibraryDB extends DBSchema {
  books: {
    key: string;
    value: StoredBook;
    indexes: { 'by-lastOpenedAt': number };
  };
  progress: {
    key: string;
    value: BookProgress;
  };
}

const DB_NAME = 'lectura-liviana';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LibraryDB>> | null = null;

function getDB(): Promise<IDBPDatabase<LibraryDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LibraryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const books = db.createObjectStore('books', { keyPath: 'id' });
        books.createIndex('by-lastOpenedAt', 'lastOpenedAt');
        db.createObjectStore('progress', { keyPath: 'bookId' });
      },
    });
  }
  return dbPromise;
}

function wrapError(action: string, error: unknown): Error {
  const detail = error instanceof Error ? error.message : String(error);
  return new Error(`No se pudo ${action}: ${detail}`);
}

export async function listBooks(): Promise<BookSummary[]> {
  try {
    const db = await getDB();
    const books = await db.getAll('books');
    return books
      .map((book): BookSummary => ({
        id: book.id,
        title: book.title,
        author: book.author,
        source: book.source,
        addedAt: book.addedAt,
        lastOpenedAt: book.lastOpenedAt,
        wordCount: book.wordCount,
        metadata: book.metadata,
      }))
      .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
  } catch (error) {
    throw wrapError('listar la biblioteca', error);
  }
}

export async function getBook(id: string): Promise<StoredBook | undefined> {
  try {
    const db = await getDB();
    return await db.get('books', id);
  } catch (error) {
    throw wrapError('abrir el libro', error);
  }
}

export async function addBook(
  book: Omit<StoredBook, 'id' | 'addedAt' | 'lastOpenedAt'>
): Promise<StoredBook> {
  try {
    const db = await getDB();
    const now = Date.now();
    const stored: StoredBook = {
      ...book,
      id: crypto.randomUUID(),
      addedAt: now,
      lastOpenedAt: now,
    };
    await db.put('books', stored);
    return stored;
  } catch (error) {
    throw wrapError('guardar el libro', error);
  }
}

export async function touchBook(id: string): Promise<void> {
  try {
    const db = await getDB();
    const book = await db.get('books', id);
    if (book) {
      book.lastOpenedAt = Date.now();
      await db.put('books', book);
    }
  } catch (error) {
    // No crítico: solo afecta el orden de la biblioteca
    console.warn('No se pudo actualizar lastOpenedAt:', error);
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(['books', 'progress'], 'readwrite');
    await Promise.all([
      tx.objectStore('books').delete(id),
      tx.objectStore('progress').delete(id),
      tx.done,
    ]);
  } catch (error) {
    throw wrapError('borrar el libro', error);
  }
}

export async function saveProgress(bookId: string, currentIndex: number): Promise<void> {
  try {
    const db = await getDB();
    await db.put('progress', { bookId, currentIndex, updatedAt: Date.now() });
  } catch (error) {
    // El guardado de progreso corre en segundo plano: log, no toast
    console.warn('No se pudo guardar el progreso:', error);
  }
}

export async function getProgress(bookId: string): Promise<BookProgress | undefined> {
  try {
    const db = await getDB();
    return await db.get('progress', bookId);
  } catch (error) {
    console.warn('No se pudo leer el progreso:', error);
    return undefined;
  }
}

export async function listProgress(): Promise<Map<string, BookProgress>> {
  try {
    const db = await getDB();
    const all = await db.getAll('progress');
    return new Map(all.map(p => [p.bookId, p]));
  } catch (error) {
    console.warn('No se pudo leer los progresos:', error);
    return new Map();
  }
}
