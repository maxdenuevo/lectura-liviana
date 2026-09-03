import type { SVGProps } from 'react';

/**
 * Íconos de Phosphor (https://phosphoricons.com, MIT) en variante duotone,
 * inline para no sumar dependencias. Heredan el color del texto.
 */

interface IconProps extends SVGProps<SVGSVGElement> {
  /** Tamaño en px o unidad CSS; por defecto 1em para acompañar el texto */
  size?: number | string;
}

function Svg({ size = '1em', children, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Fogata: identidad de la app (mismo glifo que el favicon) */
export function CampfireIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M128,32S76,64,76,108a52,52,0,0,0,52,52,24,24,0,0,1-24-24c0-24,24-40,24-40s24,16,24,40a24,24,0,0,1-24,24,52,52,0,0,0,52-52C180,64,128,32,128,32Z"
        opacity="0.2"
      />
      <path
        d="M180,108a52,52,0,0,1-104,0c0-44,52-76,52-76S180,64,180,108Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
      <line x1="40" y1="168" x2="216" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
      <line x1="216" y1="168" x2="40" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
      <path
        d="M152,136a24,24,0,0,1-48,0c0-24,24-40,24-40S152,112,152,136Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </Svg>
  );
}

/** Mano saludando: bienvenida al primer uso */
export function HandWavingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M184,213.27A80,80,0,0,1,74.7,184l-40-69.32a20,20,0,0,1,34.64-20L55.08,70A20,20,0,0,1,89.73,50l6.92,12h0a20,20,0,0,1,34.64-20l30,52A20,20,0,0,1,196,74l17.31,30A80,80,0,0,1,184,213.27Z"
        opacity="0.2"
      />
      <path d="M220.17,100,202.86,70a28,28,0,0,0-38.24-10.25,27.69,27.69,0,0,0-9,8.34L138.2,38a28,28,0,0,0-48.48,0A28,28,0,0,0,48.15,74l1.59,2.76A27.67,27.67,0,0,0,38,80.41a28,28,0,0,0-10.24,38.25l40,69.32a87.47,87.47,0,0,0,53.43,41,88.56,88.56,0,0,0,22.92,3,88,88,0,0,0,76.06-132Zm-6.66,62.64A72,72,0,0,1,81.62,180l-40-69.32a12,12,0,0,1,20.78-12L81.63,132a8,8,0,1,0,13.85-8L62,66A12,12,0,1,1,82.78,54L114,108a8,8,0,1,0,13.85-8L103.57,58h0a12,12,0,1,1,20.78-12l33.42,57.9a48,48,0,0,0-5.54,60.6,8,8,0,0,0,13.24-9A32,32,0,0,1,172.78,112a8,8,0,0,0,2.13-10.4L168.23,90A12,12,0,1,1,189,78l17.31,30A71.56,71.56,0,0,1,213.51,162.62ZM184.25,31.71A8,8,0,0,1,194,26a59.62,59.62,0,0,1,36.53,28l.33.57a8,8,0,1,1-13.85,8l-.33-.57a43.67,43.67,0,0,0-26.8-20.5A8,8,0,0,1,184.25,31.71ZM80.89,237a8,8,0,0,1-11.23,1.33A119.56,119.56,0,0,1,40.06,204a8,8,0,0,1,13.86-8,103.67,103.67,0,0,0,25.64,29.72A8,8,0,0,1,80.89,237Z" />
    </Svg>
  );
}
