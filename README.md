# Lectura Liviana ⚡

Una herramienta web minimalista para lectura rápida a través del método de Presentación Visual Serial Rápida (RSVP).
Diseñada para ser rápida, accesible y cómoda para la vista, especialmente en condiciones de poca luz.

## Características Principales

- Lectura RSVP: Muestra las palabras una por una en un punto focal fijo para eliminar el movimiento ocular y aumentar la velocidad de lectura.

- Velocidad Ajustable: Controla las Palabras Por Minuto (PPM) con un deslizador intuitivo, desde 50 hasta 1200 PPM.

- Tema Cálido (Dark Mode): Diseñado con una paleta de colores cálidos (naranjas y tonos piedra) para reducir la fatiga visual durante la lectura nocturna.

- Soporte para Dislexia: Incluye la fuente `OpenDyslexic` que se puede activar o desactivar con un solo clic.

- Múltiples Fuentes de Texto:

  - Pega texto directamente en el área designada.

  - Carga archivos locales (.txt, .md).

  - Extrae el texto principal de artículos en línea pegando una URL.

- Pausas Inteligentes: El lector añade pausas automáticas más largas para comas y puntos, mejorando el ritmo y la comprensión.

- Atajos de Teclado: Controla la aplicación sin mover las manos del teclado:

`Barra Espaciadora` : Iniciar / Pausar la lectura.

`R`: Reiniciar la lectura desde el principio.

`Flecha Derecha` / `Izquierda`: Aumentar / Disminuir las PPM.

Stack Tecnológico

- React: Para construir la interfaz de usuario interactiva.

- Tailwind CSS: Para un diseño rápido, responsivo y personalizable.

- Readability.js: Para extraer el contenido relevante de las URLs.

## Puesta en Marcha Local

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

Clona el repositorio:

```
    git clone https://github.com/maxdenuevo/LecturaLiviana.git
    cd lector-ligero
```

Instala las dependencias:

`npm install`

Inicia la aplicación:

`npm start`

La aplicación se abrirá automáticamente en http://localhost:3000.
