import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Puente local con la bóveda (vida.txt → lectura-liviana).
 *
 * GET /api/vault?path=<ruta relativa a LECTURA_VAULT_DIR>&strip=anki
 *
 * Solo existe cuando el server corre en local con LECTURA_VAULT_DIR definido
 * (.env.local). En Vercel no hay env → 404 y la app ignora el hash #vault=.
 * Sirve únicamente .md / .txt / .epub que estén DENTRO del directorio
 * (anti path traversal). `strip=anki` corta el bloque final "## Para Anki"
 * de los markdown: el quiz vive en vida.txt, no hay que leerlo en RSVP.
 */

const MAX_BYTES = 20 * 1024 * 1024;
const EXTENSIONES: Record<string, string> = {
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.epub': 'application/epub+zip',
};

function stripAnki(md: string): string {
  const idx = md.search(/^## Para Anki\s*$/m);
  return idx >= 0 ? md.slice(0, idx).trimEnd() + '\n' : md;
}

export async function GET(request: Request) {
  const dir = process.env.LECTURA_VAULT_DIR;
  if (!dir) {
    return NextResponse.json({ error: 'Bóveda no disponible en este entorno' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('path') ?? '';
  if (!raw) {
    return NextResponse.json({ error: 'Falta path' }, { status: 400 });
  }

  const base = path.resolve(dir);
  const target = path.resolve(base, raw);
  // dentro del directorio, sin escapar por ../ ni por rutas absolutas
  if (target !== base && !target.startsWith(base + path.sep)) {
    return NextResponse.json({ error: 'Ruta fuera de la bóveda' }, { status: 400 });
  }

  const ext = path.extname(target).toLowerCase();
  const contentType = EXTENSIONES[ext];
  if (!contentType) {
    return NextResponse.json({ error: 'Solo .md, .txt o .epub' }, { status: 415 });
  }

  let stat;
  try {
    stat = await fs.stat(target);
  } catch {
    return NextResponse.json({ error: 'No existe' }, { status: 404 });
  }
  if (!stat.isFile()) {
    return NextResponse.json({ error: 'No es un archivo' }, { status: 404 });
  }
  if (stat.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Archivo demasiado grande' }, { status: 413 });
  }

  const headers = { 'Content-Type': contentType, 'Cache-Control': 'no-store' };

  if (ext === '.epub') {
    const buffer = await fs.readFile(target);
    return new NextResponse(new Uint8Array(buffer), { status: 200, headers });
  }

  let text = await fs.readFile(target, 'utf-8');
  if (ext === '.md' && searchParams.get('strip') === 'anki') {
    text = stripAnki(text);
  }
  return new NextResponse(text, { status: 200, headers });
}
