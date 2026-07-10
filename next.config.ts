import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import crypto from "crypto";

// Nueva revisión por build para que el documento precacheado se actualice
const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // El documento raíz no entra al precache de App Router por defecto;
  // sin esto el fallback offline no tiene qué servir
  additionalPrecacheEntries: [{ url: "/", revision }],
  // El SW solo corre en producción; en dev (turbopack) queda deshabilitado
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplicar estos headers a todas las rutas
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js necesita unsafe-inline/eval en dev
              // Fuentes self-hosteadas vía next/font: no se necesita Google Fonts
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.allorigins.win",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
