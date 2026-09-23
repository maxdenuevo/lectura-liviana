# Lectura Liviana

Una herramienta web minimalista para lectura rápida a través del método de Presentación Visual Serial Rápida (RSVP).
Diseñada para ser rápida, accesible y cómoda para la vista, especialmente en condiciones de poca luz.

## Características Principales

### **Lectura RSVP Optimizada**

Muestra las palabras una por una en un punto focal fijo con resaltado del Punto de Reconocimiento Óptimo (ORP) para eliminar el movimiento ocular y maximizar la velocidad de lectura.

### **Velocidad Ajustable**

Controla las Palabras Por Minuto (PPM) con un deslizador intuitivo, desde 100 hasta 1000 PPM, adaptándose a tu nivel de comodidad.

### **Tema Cálido**

Diseñado con una paleta de colores cálidos (naranjas y tonos piedra) que reduce la fatiga visual durante la lectura nocturna y crea una experiencia acogedora.

### **Soporte para Dislexia**

Incluye la fuente `OpenDyslexic` especialmente diseñada para personas con dislexia, que se puede activar o desactivar con un solo clic.

### **Múltiples Fuentes de Texto**

- **Texto directo**: Pega tu contenido directamente en el área designada
- **Archivos locales**: Carga archivos .txt, .md y .epub desde tu dispositivo
- **EPUBs avanzado**: Soporte completo para libros electrónicos en formato EPUB
  - Indicador de progreso en tiempo real durante procesamiento
  - Preview de metadatos del libro (título, autor, editorial, fecha, descripción)
  - Selector de capítulos para saltar directamente a cualquier sección
  - Extracción automática de estructura y contenido
- **URLs**: Extrae automáticamente el contenido principal de artículos en línea
- **Ejemplo integrado**: Prueba la herramienta con Frankenstein de Mary Shelley (dominio público)

### **Dos Modos de Lectura**

- **Palabra a palabra (RSVP)**: una palabra centrada con resaltado del punto focal
- **Guiado**: el texto fluye en párrafos y un foco cálido avanza por grupos de 1 a 5 palabras, reduciendo las regresiones. Ambos modos comparten velocidad, posición y saltos.

### **Biblioteca y Lectura sin Conexión**

Los textos cargados se guardan en el navegador (IndexedDB) con su posición de lectura, para retomar donde quedaste. La app es instalable como PWA y funciona sin conexión.

### **Pausas Inteligentes**

El lector añade pausas automáticas más largas para comas (1.3x), puntos y comas (1.5x), y puntos finales (2x), mejorando el ritmo natural y la comprensión.

### **Parsing Avanzado de Texto**

Reconoce Markdown y HTML y conserva su estructura: títulos, listas (con viñetas, numeradas y de tareas), citas, tablas y bloques de código. Los marcadores desaparecen del texto, pero el énfasis se mantiene: las **negritas**, *cursivas* y el `código` inline se muestran como tales, tanto en el modo palabra a palabra como en el guiado.

Está pensado para notas de Obsidian: entiende frontmatter YAML, `[[wikilinks]]` con alias, embeds, `==resaltados==`, comentarios `%%` y callouts. Un `<br>` o un `<u>` sueltos en una nota no la convierten en HTML; solo se lee como documento HTML cuando hay tags de bloque reales.

### **Experiencia de Usuario Pulida**

- **Onboarding amigable**: Sugerencias al primer uso con opción de cargar ejemplo
- **Ayuda descubrible**: Presiona `?` para ver todos los atajos de teclado
- **Retroalimentación visual**: Indicadores de gestos en móvil
- **Animaciones suaves**: Transiciones optimizadas que no causan saltos visuales
- **Anuncios de pantalla**: Compatible con lectores de pantalla

### **Controles Completos**

**Atajos de Teclado:**

- `Barra Espaciadora`: Iniciar/Pausar la lectura
- `R`: Reiniciar desde el principio
- `←/→`: Retroceso/Avance fino
- `Shift+←/→`: Salto grande
- `↑/↓`: Ajustar velocidad (±25 PPM)
- `C`: Abrir/Cerrar configuración
- `M`: Cambiar modo (palabra a palabra / guiado)
- `Escape`: Pausar lectura / Cerrar menús
- `?`: Mostrar ayuda de atajos de teclado
- `Doble click` en espacio vacío: Pantalla completa

**Gestos Táctiles (Móvil):**

- **Tap**: Iniciar/Pausar
- **Doble tap**: Abrir configuración
- **Swipe horizontal**: Salto grande adelante/atrás
- **Swipe vertical**: Ajustar velocidad

## Seguridad

Este proyecto implementa múltiples capas de protección para garantizar una experiencia segura:

### **Protección SSRF (Server-Side Request Forgery)**
- Validación estricta de URLs antes de hacer requests
- Bloqueo de IPs privadas (RFC 1918: 10.x.x.x, 192.168.x.x, 172.16-31.x.x)
- Protección contra localhost y metadata endpoints (169.254.169.254)
- Solo permite protocolos HTTP/HTTPS

### **Sanitización de Contenido (XSS)**
- DOMPurify para sanitizar HTML antes del parsing
- Lista blanca de tags HTML permitidos
- Remoción automática de scripts y event handlers
- Protección contra inyección de código malicioso

### **Rate Limiting y DoS**
- Límite de 10 requests por minuto por IP
- Tamaño máximo de respuesta: 5MB
- Cache limitado a 100 entries con política LRU
- Protección contra ReDoS con límites de texto

### **Security Headers**
- Content-Security-Policy restrictivo
- X-Frame-Options: DENY (previene clickjacking)
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- Permissions-Policy para APIs sensibles

### **Validación de Redirects**
- Validación de URLs de redirect antes de seguirlas
- Máximo 1 redirect permitido por request
- Prevención de redirect loops y ataques

## Stack Tecnológico

- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS v4**: Styling utility-first con sintaxis moderna
- **Framer Motion**: Animaciones fluidas y transiciones
- **@mozilla/readability**: Extracción inteligente de contenido web
- **JSZip**: Procesamiento de archivos EPUB (formato ZIP)
- **DOMPurify**: Sanitización de HTML para prevenir XSS
- **OpenDyslexic**: Fuente especializada para dislexia

## Puesta en Marcha Local

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. **Clona el repositorio:**

```bash
git clone https://github.com/maxdenuevo/lectura-liviana.git
cd LecturaLiviana
```

2. **Instala las dependencias:**

`npm install`

3. **Inicia la aplicación:**

`npm start`

La aplicación se abrirá automáticamente en http://localhost:3000.

### Bóveda local (puente con vida.txt)

La app puede abrir directamente un `.md`, `.txt` o `.epub` de una carpeta local — pensado para la bóveda Obsidian de la carrera — a través de la ruta `/api/vault`, que **solo existe cuando el server corre en local** con la variable de entorno definida:

```bash
# .env.local (ignorado por git)
LECTURA_VAULT_DIR="/Users/max/Desktop/UDP/UDP Vault"
```

Contrato: `http://localhost:3000/#vault=<ruta relativa a la bóveda, URL-encoded>`. Al montar, la app pide `GET /api/vault?path=…&strip=anki` (con `strip=anki` se corta el bloque final `## Para Anki` de los markdown), guarda el texto en la biblioteca con el id estable `vault:<ruta>` y lo abre; volver a abrir la misma ruta reanuda el progreso. La ruta rechaza todo lo que quede fuera de `LECTURA_VAULT_DIR` y cualquier extensión que no sea `.md`, `.txt` o `.epub`. En Vercel no hay variable → 404 y el hash se ignora con un aviso.

### Comandos disponibles

```bash
npm run dev      # Servidor de desarrollo con Turbopack
npm run build    # Construir para producción
npm run start    # Ejecutar build de producción
npm run lint     # Verificar código con ESLint
```

## Arquitectura

El proyecto está organizado con una arquitectura modular para facilitar el mantenimiento:

```
src/
├── app/                    # App router de Next.js
│   ├── api/fetch-url/     # Endpoint para cargar URLs (con protección SSRF)
│   ├── icon0.svg          # Favicon (campfire de Phosphor en color candlelight)
│   ├── icon1.png          # Favicon PNG para navegadores sin soporte SVG (Safari)
│   ├── manifest.ts        # Manifest de la PWA (íconos en public/icons)
│   ├── sw.ts              # Service worker (Serwist) para lectura sin conexión
│   └── layout.tsx         # Layout principal con security headers
├── components/
│   ├── Library/           # Biblioteca de textos guardados
│   └── RSVPReader/        # Componente principal modularizado
│       ├── index.tsx                # Orquestador principal
│       ├── WordDisplay.tsx          # Presentación palabra a palabra
│       ├── GuidedDisplay.tsx        # Modo guiado (texto en flujo con foco móvil)
│       ├── ControlBar.tsx           # Controles de reproducción
│       ├── ConfigModal.tsx          # Panel de configuración
│       ├── ShortcutsHelp.tsx        # Ayuda de atajos
│       ├── FirstVisitHints.tsx      # Sugerencias iniciales
│       ├── GestureFeedback.tsx      # Retroalimentación táctil
│       ├── EpubMetadataPreview.tsx  # Preview de metadatos de EPUB
│       ├── ChapterSelector.tsx      # Navegación por capítulos
│       └── types.ts                 # Tipos compartidos
├── hooks/                  # Custom hooks
│   ├── useRSVPEngine.ts            # Lógica del motor RSVP
│   ├── useTextLoader.ts            # Carga de archivos/URLs
│   ├── useKeyboardShortcuts.ts     # Atajos de teclado
│   ├── useTouchGestures.ts         # Gestos táctiles
│   ├── usePreferences.ts           # Persistencia local
│   ├── useLibrary.ts               # Biblioteca en IndexedDB
│   ├── useReadingProgress.ts       # Guardado de posición de lectura
│   ├── useFocusTrap.ts             # Accesibilidad de modales
│   └── useBodyScrollLock.ts        # Bloqueo de scroll bajo modales
└── lib/                    # Utilidades
    ├── theme.ts                    # Sistema de diseño
    ├── textParser.ts               # Detección de formato, bloques Markdown/HTML y sanitización
    ├── inlineMarkdown.ts           # Énfasis inline (negrita, cursiva, código, links, sintaxis Obsidian)
    ├── htmlText.ts                 # Extracción de texto desde HTML por regex
    ├── guidedChunks.ts             # Agrupación de palabras para el modo guiado
    ├── fullscreen.ts               # Pantalla completa con fallback WebKit
    ├── db.ts                       # Esquema IndexedDB de la biblioteca
    └── epubParser.ts               # Extracción completa de EPUB (metadatos, capítulos, progreso)
```

## Características de Accesibilidad

- **Diseño responsivo:** Funciona perfectamente en dispositivos móviles y desktop
- **Soporte para lectores de pantalla:** Etiquetas ARIA, navegación por teclado, y anuncios dinámicos
- **Alto contraste:** Paleta de colores optimizada para legibilidad
- **Reducción de movimiento:** Respeta `prefers-reduced-motion` del sistema
- **Tipografía adaptativa:** Tamaños de fuente que escalan según el dispositivo
- **Focus trap en modales:** Navegación por teclado accesible en diálogos
- **Fuente especializada:** OpenDyslexic para usuarios con dislexia
