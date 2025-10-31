import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Lectura Liviana ⚡ - RSVP Reader",
  description: "Herramienta de lectura rápida con método RSVP - Cálida y cómoda para la vista",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="bg-stone-900">
      <head>
        <link
          rel="preload"
          href="/fonts/OpenDyslexic-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} bg-stone-900 text-stone-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}