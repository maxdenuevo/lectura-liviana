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

### **Pausas Inteligentes**

El lector añade pausas automáticas más largas para comas (1.3x), puntos y comas (1.5x), y puntos finales (2x), mejorando el ritmo natural y la comprensión.

### **Parsing Avanzado de Texto**

Reconoce y procesa formato Markdown y HTML, eliminando automáticamente la sintaxis de marcado (negritas, itálicas, hipervínculos) para una lectura fluida sin distracciones.

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
- `←/→`: Disminuir/Aumentar velocidad (±25 PPM)
- `C`: Abrir/Cerrar configuración
- `Escape`: Pausar lectura / Cerrar menús
- `?`: Mostrar ayuda de atajos de teclado

**Gestos Táctiles (Móvil):**

- **Tap**: Iniciar/Pausar
- **Swipe horizontal**: Ajustar velocidad
- **Swipe vertical**: Abrir configuración

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
│   └── layout.tsx         # Layout principal con security headers
├── components/
│   └── RSVPReader/        # Componente principal modularizado
│       ├── index.tsx                # Orquestador principal
│       ├── WordDisplay.tsx          # Presentación de palabras
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
│   ├── useFocusTrap.ts             # Accesibilidad de modales
│   └── useReducedMotion.ts         # Detección de preferencias
└── lib/                    # Utilidades
    ├── theme.ts                    # Sistema de diseño
    ├── textParser.ts               # Parsing y sanitización de HTML/Markdown
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
