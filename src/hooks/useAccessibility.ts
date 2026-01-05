import { useEffect, useRef, useCallback } from 'react';

export const useFocusTrap = (isOpen: boolean, onClose?: () => void) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!containerRef.current) return;

    const allDialogs = document.querySelectorAll('[role="dialog"]');
    const topmostDialog = allDialogs[allDialogs.length - 1];

    // Only intercept keys if THIS modal is the topmost one
    if (topmostDialog !== containerRef.current) return;

    // 1. Handle Escape
    if (e.key === 'Escape' && onClose) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
      return;
    }

    // 2. Handle Tab
    if (e.key === 'Tab') {
      const isFocusOutside = !containerRef.current.contains(document.activeElement);
      if (isFocusOutside) {
        e.preventDefault();
        const focusable = containerRef.current.querySelectorAll('button, input, select, a');
        if (focusable[0]) (focusable[0] as HTMLElement).focus();
        return;
      }
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Use capture phase to handle events before they bubble
      document.addEventListener('keydown', handleKeyDown, true);
      // Optional: Focus first element on open
      const focusableElements = containerRef.current?.querySelectorAll('button, input, select');
      if (focusableElements?.[0]) (focusableElements[0] as HTMLElement).focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleKeyDown]);

  return containerRef;
};

export const useFocusReturn = (isOpen: boolean) => {
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
    } else {
      if (lastFocusedElement.current) {
        const el = lastFocusedElement.current;
        // Delay to ensure child is gone and parent is visible
        setTimeout(() => {
          el.focus();
          // If focus didn't land (e.g. element gone), focus the first modal button
          if (document.activeElement !== el) {
            const topmost = document.querySelectorAll('[role="dialog"]');
            const last = topmost[topmost.length - 1] as HTMLElement;
            last?.querySelector('button')?.focus();
          }
        }, 50);
      }
    }
  }, [isOpen]);
};

