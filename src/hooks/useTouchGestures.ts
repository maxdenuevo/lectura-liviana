import { useRef } from 'react';

interface TouchGesturesConfig {
  onTap: () => void;
  onDoubleTap: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}

const SWIPE_THRESHOLD = 50; // Minimum distance for swipe
const TAP_THRESHOLD = 10; // Maximum movement for tap
const DOUBLE_TAP_DELAY = 300; // Maximum time between taps for double tap (ms)

/**
 * Custom hook to handle touch gestures for mobile
 *
 * Gestures:
 * - Tap: Play/Pause
 * - Double Tap: Toggle config
 * - Swipe Right: Skip forward
 * - Swipe Left: Skip backward
 * - Swipe Up: Increase speed
 * - Swipe Down: Decrease speed
 */
export function useTouchGestures({
  onTap,
  onDoubleTap,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: TouchGesturesConfig) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const lastTapTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Detect tap (very small movement)
    if (absX < TAP_THRESHOLD && absY < TAP_THRESHOLD) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.current;

      if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 0) {
        // Double tap detected
        onDoubleTap();
        lastTapTime.current = 0; // Reset to prevent triple tap
      } else {
        // Single tap - wait to see if double tap follows
        lastTapTime.current = now;
        setTimeout(() => {
          // If still the last tap after delay, execute single tap
          if (lastTapTime.current === now) {
            onTap();
          }
        }, DOUBLE_TAP_DELAY);
      }
      return;
    }

    // Horizontal swipe
    if (absX > absY && absX > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
    // Vertical swipe
    else if (absY > SWIPE_THRESHOLD) {
      if (deltaY > 0) {
        onSwipeDown();
      } else {
        onSwipeUp();
      }
    }
  };

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}
