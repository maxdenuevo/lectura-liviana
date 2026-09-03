/**
 * Pantalla completa con fallback WebKit (Safari de escritorio sigue sin
 * exponer la API sin prefijo en todos los casos).
 */

interface WebKitDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

interface WebKitElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

export function isFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as WebKitDocument;
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

export async function toggleFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;
  const doc = document as WebKitDocument;
  const root = document.documentElement as WebKitElement;

  try {
    if (isFullscreen()) {
      await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
    } else {
      await (root.requestFullscreen?.() ?? root.webkitRequestFullscreen?.());
    }
  } catch {
    // El navegador puede negarse (iframe sin permiso, gesto no válido): no es un error para el usuario
  }
}
