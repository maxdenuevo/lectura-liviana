import React from 'react';
import { type EpubBook } from '@/lib/epubParser';
import { theme } from '@/lib/theme';

interface EpubMetadataPreviewProps {
  epubData: EpubBook;
}

export default function EpubMetadataPreview({ epubData }: EpubMetadataPreviewProps) {
  const { metadata, chapters } = epubData;

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '0.75rem',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        marginBottom: '1rem',
      }}
    >
      {/* Book Title */}
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: theme.fonts.weights.medium,
          color: theme.colors.accent,
          marginBottom: '0.75rem',
          lineHeight: '1.4',
        }}
      >
        {metadata.title}
      </h3>

      {/* Metadata Grid */}
      <div
        style={{
          display: 'grid',
          gap: '0.5rem',
          fontSize: '0.875rem',
        }}
      >
        {metadata.author && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: theme.colors.textMuted, minWidth: '4rem' }}>Autor:</span>
            <span style={{ color: theme.colors.text }}>{metadata.author}</span>
          </div>
        )}

        {metadata.publisher && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: theme.colors.textMuted, minWidth: '4rem' }}>Editorial:</span>
            <span style={{ color: theme.colors.text }}>{metadata.publisher}</span>
          </div>
        )}

        {metadata.date && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: theme.colors.textMuted, minWidth: '4rem' }}>Fecha:</span>
            <span style={{ color: theme.colors.text }}>{metadata.date}</span>
          </div>
        )}

        {metadata.language && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: theme.colors.textMuted, minWidth: '4rem' }}>Idioma:</span>
            <span style={{ color: theme.colors.text }}>{metadata.language}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ color: theme.colors.textMuted, minWidth: '4rem' }}>Capítulos:</span>
          <span style={{ color: theme.colors.text }}>{chapters.length}</span>
        </div>
      </div>

      {/* Description */}
      {metadata.description && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: `1px solid ${theme.colors.accentSubtle}`,
          }}
        >
          <p
            style={{
              fontSize: '0.8125rem',
              color: theme.colors.textMuted,
              lineHeight: '1.5',
              margin: 0,
            }}
          >
            {metadata.description}
          </p>
        </div>
      )}
    </div>
  );
}
