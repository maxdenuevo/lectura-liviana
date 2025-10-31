import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ShortcutsHelpProps {
  showHelp: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: 'desktop' | 'mobile';
}

const shortcuts: Shortcut[] = [
  { keys: ['Espacio'], description: 'Iniciar/Pausar lectura', category: 'desktop' },
  { keys: ['R'], description: 'Reiniciar desde el principio', category: 'desktop' },
  { keys: ['←', '→'], description: 'Retroceder/Adelantar palabras', category: 'desktop' },
  { keys: ['↑', '↓'], description: 'Ajustar velocidad (±25 ppm)', category: 'desktop' },
  { keys: ['C'], description: 'Abrir/Cerrar configuración', category: 'desktop' },
  { keys: ['Esc'], description: 'Pausar lectura / Cerrar menús', category: 'desktop' },
  { keys: ['?'], description: 'Mostrar esta ayuda', category: 'desktop' },
  { keys: ['Tap'], description: 'Iniciar/Pausar lectura', category: 'mobile' },
  { keys: ['Doble tap'], description: 'Abrir configuración', category: 'mobile' },
  { keys: ['Swipe →', 'Swipe ←'], description: 'Adelantar/Retroceder palabras', category: 'mobile' },
  { keys: ['Swipe ↑', 'Swipe ↓'], description: 'Ajustar velocidad', category: 'mobile' },
];

export default function ShortcutsHelp({ showHelp, onClose }: ShortcutsHelpProps) {
  const desktopShortcuts = shortcuts.filter(s => s.category === 'desktop');
  const mobileShortcuts = shortcuts.filter(s => s.category === 'mobile');
  useBodyScrollLock(showHelp);

  return (
    <AnimatePresence mode="wait">
      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.md,
            zIndex: theme.zIndex.modal + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            willChange: 'opacity',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              maxWidth: '32rem',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: theme.colors.surfaceModal,
              willChange: 'transform, opacity',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: theme.fonts.weights.light,
                    color: theme.colors.accent,
                    margin: 0,
                  }}
                >
                  Atajos de Teclado
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    fontSize: '2rem',
                    color: theme.colors.textMuted,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `color ${theme.transitions.normal} ease`,
                    padding: 0,
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.text}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textMuted}
                  aria-label="Cerrar ayuda"
                >
                  ×
                </button>
              </div>

              {/* Desktop shortcuts */}
              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: theme.fonts.weights.medium,
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.md,
                    marginTop: 0,
                  }}
                >
                  Teclado
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                  {desktopShortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.sm,
                        backgroundColor: theme.colors.surfaceDark,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {shortcut.description}
                      </span>
                      <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                        {shortcut.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: theme.borderRadius.sm,
                              backgroundColor: theme.colors.surfaceDarker,
                              border: `1px solid ${theme.colors.border}`,
                              fontSize: '0.75rem',
                              fontWeight: theme.fonts.weights.medium,
                              color: theme.colors.accent,
                              fontFamily: 'monospace',
                            }}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile shortcuts */}
              <div className="md:hidden">
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: theme.fonts.weights.medium,
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.md,
                    marginTop: 0,
                  }}
                >
                  Gestos Táctiles
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                  {mobileShortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.sm,
                        backgroundColor: theme.colors.surfaceDark,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {shortcut.description}
                      </span>
                      <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                        {shortcut.keys.map((key, keyIdx) => (
                          <span
                            key={keyIdx}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: theme.borderRadius.sm,
                              backgroundColor: theme.colors.surfaceDarker,
                              fontSize: '0.75rem',
                              fontWeight: theme.fonts.weights.medium,
                              color: theme.colors.accent,
                            }}
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer tip */}
              <div
                style={{
                  marginTop: theme.spacing.md,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.surfaceDark,
                  borderLeft: `3px solid ${theme.colors.accent}`,
                }}
              >
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: theme.colors.textSecondary,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: theme.colors.accent }}>Tip:</strong> Presiona{' '}
                  <kbd
                    style={{
                      padding: '0.125rem 0.375rem',
                      borderRadius: theme.borderRadius.sm,
                      backgroundColor: theme.colors.surfaceDarker,
                      fontSize: '0.625rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    ?
                  </kbd>{' '}
                  en cualquier momento para ver esta ayuda.
                </p>
              </div>

              <div
                style={{
                  marginTop: theme.spacing.md,
                  paddingTop: theme.spacing.md,
                  borderTop: `1px solid ${theme.colors.border}`,
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: theme.colors.textTertiary,
                    margin: 0,
                  }}
                >
                  Hecho por{' '}
                  <a
                    href="http://maxdenuevo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.colors.accent,
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.amber300}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.accent}
                  >
                    maxdenuevo
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
