'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Iconos SVG para los controles ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);

const RestartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>
);

export default function RSVPReader() {
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(300);
  const [chunkSize, setChunkSize] = useState(1);
  const [useDyslexicFont, setUseDyslexicFont] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [url, setUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // --- Cargar configuración desde localStorage al montar ---
  useEffect(() => {
    setText(localStorage.getItem('text') || 
      "Pega tu texto o carga un archivo. La presentación visual en serie rápida (RSVP) muestra las palabras de forma secuencial.");
    setWpm(Number(localStorage.getItem('wpm')) || 300);
    setChunkSize(Number(localStorage.getItem('chunkSize')) || 1);
    setUseDyslexicFont(localStorage.getItem('dyslexic') === 'true');
  }, []);

  // --- Split into chunks ---
  const words = useMemo(() => {
    const arr = text.trim().split(/\s+/).filter(Boolean);
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize).join(' '));
    }
    return chunks;
  }, [text, chunkSize]);

  // --- Save prefs ---
  useEffect(() => localStorage.setItem('wpm', wpm.toString()), [wpm]);
  useEffect(() => localStorage.setItem('chunkSize', chunkSize.toString()), [chunkSize]);
  useEffect(() => localStorage.setItem('dyslexic', useDyslexicFont.toString()), [useDyslexicFont]);
  useEffect(() => localStorage.setItem('text', text), [text]);

  // --- Timer con setTimeout ---
  useEffect(() => {
    if (!isPlaying || currentIndex >= words.length) return;
    const currentChunk = words[currentIndex];
    let delay = (60000 / wpm); // base ms per word
    if (currentChunk.endsWith(',')) delay *= 1.5;
    else if (/[.;:!?]$/.test(currentChunk)) delay *= 2;

    const timer = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, words, wpm]);

  // --- Handlers ---
  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!words.length) return;
    if (currentIndex >= words.length) setCurrentIndex(0);
    setIsPlaying((p) => !p);
  }, [words.length, currentIndex]);

  const handleWpmChange = (val: number) => setWpm(Math.max(10, val));
  const handleChunkChange = (val: number) => setChunkSize(Math.max(1, Math.min(3, val)));

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string || '');
      handleRestart();
    };
    reader.readAsText(file);
  };

  const handleFetchUrl = async () => {
    if (!url.startsWith('http')) return alert('URL inválida.');
    setIsLoadingUrl(true);
    
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setText("Error: " + data.error);
      } else {
        setText((data.title || "Artículo") + "\n\n" + (data.content || "Sin contenido"));
        handleRestart();
      }
    } catch {
      setText("Error al cargar el contenido.");
    } finally {
      setIsLoadingUrl(false);
      setUrl('');
    }
  };

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); handlePlayPause(); }
      if (e.code === 'KeyR') handleRestart();
      if (e.code === 'ArrowRight') handleWpmChange(wpm + 10);
      if (e.code === 'ArrowLeft') handleWpmChange(wpm - 10);
      if (e.code === 'ArrowUp') setCurrentIndex((i) => Math.max(0, i - 1));
      if (e.code === 'ArrowDown') setCurrentIndex((i) => Math.min(words.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePlayPause, handleRestart, wpm, words.length]);

  // --- Focal letter ---
  const getFocusedWord = (chunk: string) => {
    if (!chunk) return { pre: '', focal: '', post: '' };
    const word = chunk.split(' ')[0]; // focus first word in chunk
    let pivotIndex;
    if (word.length <= 1) pivotIndex = 0;
    else if (word.length <= 5) pivotIndex = 1;
    else if (word.length <= 9) pivotIndex = 2;
    else if (word.length <= 13) pivotIndex = 3;
    else pivotIndex = 4;
    return {
      pre: word.slice(0, pivotIndex),
      focal: word.slice(pivotIndex, pivotIndex + 1),
      post: word.slice(pivotIndex + 1)
    };
  };
  
  const currentParts = getFocusedWord(words[currentIndex] || '');
  
  // ✅ CORRECCIÓN: usar la misma clase que en el CSS
  const fontClass = useDyslexicFont ? 'font-opendyslexic' : 'font-sans';

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-stone-900 text-stone-200 p-4 ${fontClass}`}>
      {/* Word display */}
      <div className="w-full max-w-4xl h-48 bg-stone-800 rounded-lg flex items-center justify-center mb-8 shadow-lg border border-stone-700 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="text-5xl md:text-7xl font-semibold tracking-wider text-center"
          >
            {currentParts.pre}
            <span className="text-orange-400">{currentParts.focal}</span>
            {currentParts.post}
            {chunkSize > 1 && " " + (words[currentIndex]?.split(' ').slice(1).join(' ') || '')}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={handlePlayPause} 
          className="p-4 bg-orange-600 rounded-full hover:bg-orange-700 transition-colors"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button 
          onClick={handleRestart} 
          className="p-4 bg-stone-700 rounded-full hover:bg-stone-600 transition-colors"
        >
          <RestartIcon />
        </button>
        <button 
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} 
          className="p-4 bg-stone-700 rounded-full hover:bg-stone-600 transition-colors"
        >
          ⏮
        </button>
        <button 
          onClick={() => setCurrentIndex((i) => Math.min(words.length - 1, i + 1))} 
          className="p-4 bg-stone-700 rounded-full hover:bg-stone-600 transition-colors"
        >
          ⏭
        </button>
      </div>

      {/* Sliders */}
      <div className="w-full max-w-md mb-4">
        <label className="block text-center mb-2">{wpm} PPM</label>
        <input 
          type="range" 
          min="50" 
          max="1200" 
          step="10" 
          value={wpm} 
          onChange={(e) => handleWpmChange(Number(e.target.value))} 
          className="w-full"
        />
      </div>
      <div className="w-full max-w-md mb-4">
        <label className="block text-center mb-2">Chunk Size: {chunkSize}</label>
        <input 
          type="range" 
          min="1" 
          max="3" 
          step="1" 
          value={chunkSize} 
          onChange={(e) => handleChunkChange(Number(e.target.value))} 
          className="w-full"
        />
      </div>

      {/* URL input */}
      <div className="w-full max-w-xl flex items-center space-x-2 mb-4">
        <input 
          type="url" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="URL de artículo..." 
          className="flex-grow p-2 bg-stone-800 border border-stone-700 rounded focus:border-orange-600 focus:outline-none"
        />
        <button 
          onClick={handleFetchUrl} 
          disabled={isLoadingUrl} 
          className="py-2 px-4 bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {isLoadingUrl ? 'Cargando...' : 'Leer'}
        </button>
      </div>

      {/* File & textarea */}
      <input 
        type="file" 
        accept=".txt,.md" 
        onChange={handleFileLoad} 
        className="hidden" 
        id="file-upload" 
      />
      <label 
        htmlFor="file-upload" 
        className="bg-stone-700 py-2 px-4 rounded mb-2 cursor-pointer inline-block hover:bg-stone-600 transition-colors"
      >
        Cargar Archivo
      </label>
      
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        className="w-full max-w-4xl h-40 p-4 bg-stone-800 border border-stone-700 rounded-lg resize-none focus:border-orange-600 focus:outline-none" 
        placeholder="Escribe o pega tu texto aquí..."
      />

      {/* Dyslexic font toggle */}
      <div className="mt-4">
        <label className="mr-2">OpenDyslexic</label>
        <input 
          type="checkbox" 
          checked={useDyslexicFont} 
          onChange={() => setUseDyslexicFont((v) => !v)}
        />
      </div>
    </div>
  );
}
