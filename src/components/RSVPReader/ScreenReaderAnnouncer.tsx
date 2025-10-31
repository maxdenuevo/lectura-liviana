import { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

/**
 * Component to announce messages to screen readers
 * Uses aria-live regions for accessibility
 */
export default function ScreenReaderAnnouncer({ message, priority = 'polite' }: ScreenReaderAnnouncerProps) {
  const announceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && announceRef.current) {
      // Clear and then set to ensure announcement
      announceRef.current.textContent = '';
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={announceRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  );
}
