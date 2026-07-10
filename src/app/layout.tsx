import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

// Fuente ultralegible del Braille Institute: la fuente de lectura y de UI
const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-reading",
});

export const metadata: Metadata = {
  title: "Lectura Liviana 🕯️ - RSVP Reader",
  description: "Herramienta de lectura rápida con método RSVP - Cálida y cómoda para la vista",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={atkinson.variable}>
      <body className={`${atkinson.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
