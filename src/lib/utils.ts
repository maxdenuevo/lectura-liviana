export function calculateReadingTime(text: string, wpm: number): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil((words / wpm) * 60);
}

export function analyzeTextDifficulty(text: string): {
  score: number;
  level: 'easy' | 'medium' | 'hard';
  suggestedWpm: number;
} {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  
  const avgWordLength = words.reduce((acc, word) => acc + word.length, 0) / words.length;
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  
  // Flesch Reading Ease aproximado
  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * (avgWordLength / 4.7);
  
  let level: 'easy' | 'medium' | 'hard';
  let suggestedWpm: number;
  
  if (score >= 60) {
    level = 'easy';
    suggestedWpm = 400;
  } else if (score >= 30) {
    level = 'medium';
    suggestedWpm = 300;
  } else {
    level = 'hard';
    suggestedWpm = 200;
  }
  
  return { score, level, suggestedWpm };
}

export function getOptimalRecognitionPoint(word: string): number {
  const len = word.length;
  if (len <= 2) return 0;
  if (len <= 4) return 1;
  if (len <= 6) return 2;
  return Math.floor(len * 0.35);
}