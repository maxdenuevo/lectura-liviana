/**
 * Lectura Liviana - Theme Configuration
 *
 * Candlelight-inspired warm color palette
 * Single source of truth for all colors, fonts, and design tokens
 */

export const theme = {
  colors: {
    // Primary candlelight palette
    candleBlack: '#0a0908',
    candleDark: '#22201c',
    candleAmber: '#f4a261',
    candleCream: '#fefae0',

    // Stone tones (current implementation)
    stone900: '#1c1917',
    stone200: '#e7e5e4',
    stone800: '#292524',

    // Amber/Orange highlights
    amber300: '#fcd34d',
    amber400: '#fbbf24',
    amber500: '#f59e0b',

    // Orange accents
    orange700: '#b45309',

    // Semantic colors
    background: '#1c1917',
    text: '#e7e5e4',
    textMuted: 'rgba(231, 229, 228, 0.4)',
    textSecondary: 'rgba(231, 229, 228, 0.6)',
    textTertiary: 'rgba(231, 229, 228, 0.8)',

    // Word display colors
    wordFocal: '#fcd34d',
    wordPrePost: 'rgba(252, 211, 77, 0.6)',

    // UI elements
    accent: '#fbbf24',
    accentMuted: 'rgba(251, 191, 36, 0.6)',
    accentSubtle: 'rgba(251, 191, 36, 0.2)',
    accentDim: 'rgba(251, 191, 36, 0.3)',

    border: 'rgba(180, 83, 9, 0.2)',
    borderLight: 'rgba(180, 83, 9, 0.3)',

    // Surfaces
    surfaceDark: 'rgba(0, 0, 0, 0.3)',
    surfaceDarker: 'rgba(0, 0, 0, 0.4)',
    surfaceFloat: 'rgba(28, 25, 23, 0.7)',
    surfaceFloatHover: 'rgba(28, 25, 23, 0.9)',
    surfaceModal: 'rgba(28, 25, 23, 0.95)',
    surfaceControls: 'rgba(28, 25, 23, 0.8)',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.6)',
    notificationBg: 'rgba(28, 25, 23, 0.9)',
  },

  fonts: {
    default: "'Inter', sans-serif",
    dyslexic: "'OpenDyslexic', serif",
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
    },
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    full: '9999px',
  },

  shadows: {
    glow: '0 0 10px rgba(244, 162, 97, 0.4)',
    controls: '0 10px 25px rgba(180, 83, 9, 0.1)',
  },

  transitions: {
    fast: '0.1s',
    normal: '0.2s',
    slow: '0.3s',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    controls: 40,
    modal: 50,
    notification: 50,
  },
} as const;

export type Theme = typeof theme;

// Helper to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  return color.includes('rgba')
    ? color.replace(/[\d.]+\)$/, `${opacity})`)
    : `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};
