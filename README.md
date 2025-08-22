# Lectura Liviana

Una herramienta web minimalista para lectura rápida a través del método de Presentación Visual Serial Rápida (RSVP).
Diseñada para ser rápida, accesible y cómoda para la vista, especialmente en condiciones de poca luz.

## Características Principales

### **Lectura RSVP Optimizada**

Muestra las palabras una por una en un punto focal fijo con resaltado del Punto de Reconocimiento Óptimo (ORP) para eliminar el movimiento ocular y maximizar la velocidad de lectura.

### ⚡ **Velocidad Ajustable**

Controla las Palabras Por Minuto (PPM) con un deslizador intuitivo, desde 100 hasta 1000 PPM, adaptándose a tu nivel de comodidad.

### **Tema Cálido**

Diseñado con una paleta de colores cálidos (naranjas y tonos piedra) que reduce la fatiga visual durante la lectura nocturna y crea una experiencia acogedora.

### **Soporte para Dislexia**

Incluye la fuente `OpenDyslexic` especialmente diseñada para personas con dislexia, que se puede activar o desactivar con un solo clic.

### **Múltiples Fuentes de Texto**

- **Texto directo**: Pega tu contenido directamente en el área designada
- **Archivos locales**: Carga archivos .txt y .md desde tu dispositivo
- **URLs**: Extrae automáticamente el contenido principal de artículos en línea

### **Pausas Inteligentes**

El lector añade pausas automáticas más largas para comas (1.3x), puntos y comas (1.5x), y puntos finales (2x), mejorando el ritmo natural y la comprensión.

### **Controles Completos**

**Atajos de Teclado:**

- `Barra Espaciadora`: Iniciar/Pausar la lectura
- `R`: Reiniciar desde el principio
- `←/→`: Disminuir/Aumentar velocidad (±25 PPM)
- `C`: Abrir/Cerrar configuración
- `Escape`: Cerrar menús

**Gestos Táctiles (Móvil):**

- **Tap**: Iniciar/Pausar
- **Swipe horizontal**: Ajustar velocidad
- **Swipe vertical**: Abrir configuración

## Stack Tecnológico

- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para mayor robustez
- **Framer Motion**: Animaciones fluidas y transiciones
- **Tailwind CSS**: Styling utility-first
- **@mozilla/readability**: Extracción inteligente de contenido web
- **OpenDyslexic**: Fuente especializada para dislexia

## Puesta en Marcha Local

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. **Clona el repositorio:**

```bash
git clone https://github.com/maxdenuevo/LecturaLiviana.git
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

## Características de Accesibilidad

- **Diseño responsivo:** Funciona perfectamente en dispositivos móviles y desktop
- **Soporte para lectores de pantalla:** Etiquetas ARIA y navegación por teclado
- **Alto contraste:** Paleta de colores optimizada para legibilidad
- **Reducción de movimiento:** Respeta las preferencias del usuario
- **Tipografía adaptativa:** Tamaños de fuente que escalan según el dispositivo
