/**
 * Lectura Liviana - Theme Configuration
 *
 * Candlelight-inspired warm color palette
 * Single source of truth for all colors, fonts, and design tokens
 */

export const theme = {
  // Los valores viven como CSS variables en globals.css (única fuente de verdad).
  colors: {
    // Semantic colors
    background: 'var(--bg)',
    text: 'var(--text)',
    textMuted: 'var(--text-muted)',
    textSecondary: 'var(--text-secondary)',
    textTertiary: 'var(--text-tertiary)',

    // Word display colors
    wordFocal: 'var(--word-focal)',
    wordPrePost: 'var(--word-prepost)',

    // UI elements
    accent: 'var(--accent)',
    accentSecondary: 'var(--accent-secondary)',
    accentMuted: 'var(--accent-muted)',
    accentSubtle: 'var(--accent-subtle)',
    accentDim: 'var(--accent-dim)',
    accentFaint: 'var(--accent-faint)',

    border: 'var(--border)',
    borderLight: 'var(--border-light)',

    // Surfaces
    surface: 'var(--surface)',
    surfaceDark: 'var(--surface-dark)',
    surfaceDarker: 'var(--surface-darker)',
    surfaceFloat: 'var(--surface-float)',
    surfaceFloatHover: 'var(--surface-float-hover)',
    surfaceModal: 'var(--surface-modal)',
    surfaceControls: 'var(--surface-controls)',

    // Overlays
    overlay: 'var(--overlay)',
    notificationBg: 'var(--notification-bg)',
  },

  fonts: {
    default: 'var(--font-reading), sans-serif',
    dyslexic: "'OpenDyslexic', sans-serif",
    // Atkinson Hyperlegible solo trae 400/700; los intermedios se sintetizan
    weights: {
      light: 400,
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
    glow: '0 0 10px var(--glow)',
    controls: '0 10px 25px rgba(0, 0, 0, 0.35)',
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
