import React, { useState } from 'react';
import { type EpubChapter } from '@/lib/epubParser';
import { theme } from '@/lib/theme';

interface ChapterSelectorProps {
  chapters: EpubChapter[];
  onChapterSelect: (chapter: EpubChapter) => void;
}

export default function ChapterSelector({ chapters, onChapterSelect }: ChapterSelectorProps) {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const handleChapterClick = (chapter: EpubChapter) => {
    onChapterSelect(chapter);
  };

  return (
    <div>
      <h4
        style={{
          fontSize: '0.875rem',
          fontWeight: theme.fonts.weights.medium,
          color: theme.colors.textMuted,
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Capítulos ({chapters.length})
      </h4>

      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        {chapters.map((chapter) => (
          <button
            key={chapter.index}
            onClick={() => handleChapterClick(chapter)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: '1px solid rgba(251, 191, 36, 0.1)',
              backgroundColor: 'transparent',
              color: theme.colors.text,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Chapter Number */}
            <span
              style={{
                minWidth: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.25rem',
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                color: theme.colors.accent,
                fontSize: '0.75rem',
                fontWeight: theme.fonts.weights.medium,
              }}
            >
              {chapter.index + 1}
            </span>

            {/* Chapter Title */}
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {chapter.title}
            </span>

            {/* Arrow Icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: 0.5,
              }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: theme.colors.textMuted,
          textAlign: 'center',
        }}
      >
        Haz clic en un capítulo para comenzar a leer
      </div>
    </div>
  );
}
