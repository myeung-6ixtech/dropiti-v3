'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useHaptic } from '@/hooks/useHaptic';

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

const PULL_THRESHOLD = 80;
const RESISTANCE = 2.5;

export default function PullToRefreshWrapper({
  onRefresh,
  children,
  disabled = false,
  className = '',
}: PullToRefreshWrapperProps) {
  const { tap } = useHaptic();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const canPull = useCallback(() => {
    if (disabled || isRefreshing) return false;
    return window.scrollY <= 0;
  }, [disabled, isRefreshing]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!canPull()) return;
      touchStartY.current = e.touches[0].clientY;
      isDragging.current = false;
    },
    [canPull],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!canPull()) return;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY <= 0) {
        if (isDragging.current) {
          setPullDistance(0);
          isDragging.current = false;
        }
        return;
      }
      isDragging.current = true;
      const dampened = deltaY / RESISTANCE;
      setPullDistance(dampened);

      if (dampened >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD) {
        tap('medium');
      }
    },
    [canPull, pullDistance, tap],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      tap('success');
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, onRefresh, tap]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: isRefreshing ? 48 : pullDistance > 10 ? Math.min(pullDistance, 60) : 0 }}
        >
          <div
            className={`w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
              opacity: progress,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
