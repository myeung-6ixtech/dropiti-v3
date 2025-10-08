'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollDirection {
  direction: 'up' | 'down' | null;
  isScrolling: boolean;
  scrollY: number;
}

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance to trigger direction change
  debounceMs?: number; // Debounce delay for scroll events
  hideOnScrollDown?: boolean; // Whether to hide nav on scroll down
  showOnScrollUp?: boolean; // Whether to show nav on scroll up
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}) => {
  const {
    threshold = 10,
    debounceMs = 100,
    hideOnScrollDown = true,
    showOnScrollUp = true,
  } = options;

  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>({
    direction: null,
    isScrolling: false,
    scrollY: 0,
  });

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if we're at the bottom of the page
    const atBottom = currentScrollY + windowHeight >= documentHeight - 10;
    setIsAtBottom(atBottom);

    // Calculate scroll direction
    const scrollDifference = Math.abs(currentScrollY - lastScrollY);
    
    if (scrollDifference < threshold) {
      return; // Not enough scroll to determine direction
    }

    let newDirection: 'up' | 'down' | null = null;
    
    if (currentScrollY > lastScrollY) {
      newDirection = 'down';
    } else if (currentScrollY < lastScrollY) {
      newDirection = 'up';
    }

    setScrollDirection({
      direction: newDirection,
      isScrolling: true,
      scrollY: currentScrollY,
    });

    // Update visibility based on scroll direction
    if (newDirection === 'down' && hideOnScrollDown && !atBottom) {
      setIsVisible(false);
    } else if (newDirection === 'up' && showOnScrollUp) {
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);

    // Clear existing idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Set new idle timer - show nav after 2 seconds of idle
    idleTimerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Reset scrolling state after debounce
    setTimeout(() => {
      setScrollDirection(prev => ({
        ...prev,
        isScrolling: false,
      }));
    }, debounceMs);
  }, [lastScrollY, threshold, debounceMs, hideOnScrollDown, showOnScrollUp]);

  // Throttled scroll handler for better performance
  useEffect(() => {
    let ticking = false;

    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [handleScroll]);

  // Show nav when at bottom of page
  useEffect(() => {
    if (isAtBottom) {
      setIsVisible(true);
    }
  }, [isAtBottom]);

  // Initialize scroll position
  useEffect(() => {
    setLastScrollY(window.scrollY);
  }, []);

  return {
    direction: scrollDirection.direction,
    isScrolling: scrollDirection.isScrolling,
    scrollY: scrollDirection.scrollY,
    isVisible,
    isAtBottom,
    setIsVisible, // Allow manual control
  };
};
