import { useState } from 'react';
import { extractEpubText, isEpubFile, type EpubBook } from '@/lib/epubParser';

interface TextLoaderResult {
  urlInput: string;
  isLoadingUrl: boolean;
  epubProgress: number;
  epubStatus: string;
  setUrlInput: (url: string) => void;
  loadFromUrl: () => Promise<void>;
  loadFromFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface UseTextLoaderConfig {
  onTextLoaded: (text: string, title?: string, epubData?: EpubBook) => void;
  onError: (message: string) => void;
}

/**
 * Custom hook to handle loading text from various sources
 * - URL (via API)
 * - File upload (.txt, .md, .epub)
 */
export function useTextLoader({ onTextLoaded, onError }: UseTextLoaderConfig): TextLoaderResult {
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [epubProgress, setEpubProgress] = useState(0);
  const [epubStatus, setEpubStatus] = useState('');

  const loadFromUrl = async () => {
    if (!urlInput.trim()) return;

    setIsLoadingUrl(true);
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() })
      });

      const data = await response.json();

      if (data.success) {
        onTextLoaded(data.content, data.title);
        setUrlInput(''); // Clear input on success
      } else {
        // Show error with hint if available
        const errorMsg = data.hint ? `${data.error}\n${data.hint}` : data.error;
        onError(errorMsg || 'Error al cargar URL');
      }
    } catch (error) {
      onError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const loadFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check if it's an EPUB file
      if (isEpubFile(file.name)) {
        // Reset progress
        setEpubProgress(0);
        setEpubStatus('Iniciando...');

        // Process EPUB file with progress tracking
        const epubBook = await extractEpubText(file, (progress, status) => {
          setEpubProgress(progress);
          setEpubStatus(status);
        });

        // Load the full text along with EPUB metadata
        onTextLoaded(epubBook.fullText, epubBook.metadata.title, epubBook);

        // Reset progress after completion
        setTimeout(() => {
          setEpubProgress(0);
          setEpubStatus('');
        }, 1000);
      } else {
        // Process regular text file (.txt, .md)
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            onTextLoaded(content, file.name);
          }
        };
        reader.onerror = () => {
          onError('Error al leer el archivo');
        };
        reader.readAsText(file);
      }
    } catch (error) {
      setEpubProgress(0);
      setEpubStatus('');
      onError(
        error instanceof Error
          ? error.message
          : 'Error al procesar el archivo'
      );
    }

    // Reset input to allow loading the same file again
    e.target.value = '';
  };

  return {
    urlInput,
    isLoadingUrl,
    epubProgress,
    epubStatus,
    setUrlInput,
    loadFromUrl,
    loadFromFile,
  };
}
