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

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
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
  const [showSettings, setShowSettings] = useState(false);

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
    let delay = (60000 / wpm);
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
      setShowSettings(false);
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
        setShowSettings(false);
      }
    } catch {
      setText("Error al cargar el contenido.");
    } finally {
      setIsLoadingUrl(false);
      setUrl('');
    }
  };

  // --- Atajos de teclado ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      
      if (e.code === 'Space') { 
        e.preventDefault(); 
        handlePlayPause(); 
      }
      if (e.code === 'KeyR') handleRestart();
      if (e.code === 'ArrowRight') handleWpmChange(wpm + 10);
      if (e.code === 'ArrowLeft') handleWpmChange(wpm - 10);
      if (e.code === 'ArrowUp') setCurrentIndex((i) => Math.max(0, i - 1));
      if (e.code === 'ArrowDown') setCurrentIndex((i) => Math.min(words.length - 1, i + 1));
      if (e.code === 'Escape') setShowSettings(false);
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePlayPause, handleRestart, wpm, words.length]);

  // --- Focal letter ---
  const getFocusedWord = (chunk: string) => {
    if (!chunk) return { pre: '', focal: '', post: '' };
    const word = chunk.split(' ')[0];
    let pivotIndex: number;
    
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

  const currentParts = getFocusedWord(words[currentIndex]);
  const fontClass = useDyslexicFont ? 'font-opendyslexic' : 'font-sans';
  
  // --- Animación inteligente: reducir duración con alta velocidad ---
  const animationDuration = wpm > 600 ? 0.05 : wpm > 400 ? 0.1 : 0.15;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-stone-900 text-stone-200 p-4 ${fontClass}`}>
      
      {/* Display de palabras - Sin animación si es muy rápido */}
      <div className="w-full max-w-4xl h-48 bg-stone-800 rounded-lg flex items-center justify-center mb-8 shadow-2xl border border-stone-700 overflow-hidden">
        {wpm > 800 ? (
          // Sin animación para velocidades extremas
          <p className="text-5xl md:text-7xl font-semibold tracking-wider text-center px-4">
            <span className="text-stone-200">{currentParts.pre}</span>
            <span className="text-orange-400 font-bold">{currentParts.focal}</span>
            <span className="text-stone-200">{currentParts.post}</span>
            {chunkSize > 1 && <span className="text-stone-300"> {words[currentIndex]?.split(' ').slice(1).join(' ')}</span>}
          </p>
        ) : (
          // Con animación para velocidades normales
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: animationDuration }}
              className="text-5xl md:text-7xl font-semibold tracking-wider text-center px-4"
            >
              <span className="text-stone-200">{currentParts.pre}</span>
              <span className="text-orange-400 font-bold">{currentParts.focal}</span>
              <span className="text-stone-200">{currentParts.post}</span>
              {chunkSize > 1 && <span className="text-stone-300"> {words[currentIndex]?.split(' ').slice(1).join(' ')}</span>}
            </motion.p>
          </AnimatePresence>
        )}
      </div>

      {/* Controles principales - minimalistas */}
      <div className="flex items-center space-x-6 mb-8">
        <button 
          onClick={handlePlayPause} 
          className="p-5 bg-orange-600 hover:bg-orange-700 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button 
          onClick={handleRestart} 
          className="p-4 bg-stone-700 hover:bg-stone-600 rounded-full transition-all duration-200 shadow-lg"
        >
          <RestartIcon />
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className="p-4 bg-stone-700 hover:bg-stone-600 rounded-full transition-all duration-200 shadow-lg"
        >
          <SettingsIcon />
        </button>
      </div>

      {/* Slider de velocidad - siempre visible */}
      <div className="w-full max-w-md mb-6">
        <label className="block text-center mb-3 text-lg font-medium text-orange-400">{wpm} PPM</label>
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

      {/* Indicador de progreso - minimalista */}
      <div className="text-sm text-stone-500 mb-4">
        {words.length > 0 && `${currentIndex + 1} / ${words.length}`}
      </div>

      {/* Panel de configuración - colapsable */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-4xl bg-stone-800 rounded-lg p-6 mb-4 border border-stone-700"
          >
            {/* Chunk Size */}
            <div className="mb-6">
              <label className="block text-center mb-2 text-stone-300">Palabras por grupo: {chunkSize}</label>
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
            <div className="flex items-center space-x-2 mb-4">
              <input 
                type="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="URL de artículo..." 
                className="flex-grow p-3 bg-stone-800 border border-stone-700 rounded-lg focus:border-orange-600"
              />
              <button 
                onClick={handleFetchUrl} 
                disabled={isLoadingUrl} 
                className="py-3 px-6 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg transition-all duration-200"
              >
                {isLoadingUrl ? 'Cargando...' : 'Leer'}
              </button>
            </div>

            {/* Archivo */}
            <input 
              type="file" 
              accept=".txt,.md" 
              onChange={handleFileLoad} 
              className="hidden" 
              id="file-upload" 
            />
            <label 
              htmlFor="file-upload" 
              className="bg-stone-700 hover:bg-stone-600 py-3 px-6 rounded-lg mb-4 cursor-pointer inline-block transition-all duration-200"
            >
              📁 Cargar Archivo
            </label>

            {/* Textarea */}
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              className="w-full h-32 p-4 bg-stone-800 border border-stone-700 rounded-lg resize-none focus:border-orange-600" 
              placeholder="Escribe o pega tu texto aquí..."
            />

            {/* Toggle fuente dislexia */}
            <div className="mt-4 flex items-center justify-center space-x-3">
              <label className="text-stone-300">OpenDyslexic</label>
              <input 
                type="checkbox" 
                checked={useDyslexicFont} 
                onChange={() => setUseDyslexicFont((v) => !v)}
              />
              {useDyslexicFont && (
                <span className="text-orange-400 text-sm">✓ Activa</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atajos de teclado - discretos */}
      {!showSettings && (
        <div className="text-xs text-stone-600 text-center">
          <kbd className="px-2 py-1 bg-stone-800 rounded">Espacio</kbd> Play/Pausa • 
          <kbd className="px-2 py-1 bg-stone-800 rounded mx-1">R</kbd> Reiniciar • 
          <kbd className="px-2 py-1 bg-stone-800 rounded">←→</kbd> Velocidad
        </div>
      )}
    </div>
  );
}