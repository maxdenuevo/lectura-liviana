import { useEffect } from 'react';

/**
 * Hook to lock body scroll and compensate for scrollbar width
 * Delays application to sync with animation start, preventing visual jumps
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Get original values
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Delay scroll lock to sync with animation start
    const rafId = requestAnimationFrame(() => {
      // Apply scroll lock with scrollbar compensation
      document.body.style.overflow = 'hidden';

      // Only add padding if there's actually a scrollbar
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    });

    // Cleanup: restore original values and cancel RAF if unmounted early
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
