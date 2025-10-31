// Shared types for RSVPReader components

export interface WordParts {
  pre: string;
  focal: string;
  post: string;
}

export type WordType = 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'list-item' | 'code' | 'blockquote';

export interface EnrichedWord {
  text: string;
  type: WordType;
  sectionTitle?: string; // For breadcrumbs (optional future feature)
}

export interface RSVPReaderProps {
  // Future: can accept initial text, wpm, etc.
}
