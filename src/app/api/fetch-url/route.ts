import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Usar proxy CORS
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const response = await fetch(proxyUrl + encodeURIComponent(url));
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Error al obtener contenido');
    }

    // Extraer texto básico
    const textContent = data.contents.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50000);
    
    return NextResponse.json({
      title: 'Artículo cargado',
      content: textContent
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al cargar el contenido' }, 
      { status: 500 }
    );
  }
}
