import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onTogglePlay: () => void;
  onRestart: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onToggleConfig: () => void;
  onCloseConfig: () => void;
  onShowHelp?: () => void;
  isModalOpen?: boolean; // Track if any modal is open
}

/**
 * Custom hook to manage keyboard shortcuts for RSVP reader
 *
 * Shortcuts:
 * - Space: Play/Pause
 * - R: Restart
 * - Arrow Right: Skip forward
 * - Arrow Left: Skip backward
 * - Arrow Up: Increase speed
 * - Arrow Down: Decrease speed
 * - C: Toggle config
 * - Escape: Close config (if open) or Pause reading
 * - ?: Show help
 */
export function useKeyboardShortcuts({
  onTogglePlay,
  onRestart,
  onSpeedUp,
  onSpeedDown,
  onSkipForward,
  onSkipBackward,
  onToggleConfig,
  onCloseConfig,
  onShowHelp,
  isModalOpen = false,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      // Allow browser shortcuts like cmd+r, ctrl+r, cmd+shift+r, etc.
      if (e.metaKey || e.ctrlKey) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          onTogglePlay();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onRestart();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSkipForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onSkipBackward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onSpeedUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onSpeedDown();
          break;
        case 'Escape':
          e.preventDefault();
          // If modal is open, close it. Otherwise, pause reading
          if (isModalOpen) {
            onCloseConfig();
          } else {
            onTogglePlay();
          }
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          onToggleConfig();
          break;
        case '?':
          e.preventDefault();
          onShowHelp?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onTogglePlay, onRestart, onSpeedUp, onSpeedDown, onSkipForward, onSkipBackward, onToggleConfig, onCloseConfig, onShowHelp]);
}
