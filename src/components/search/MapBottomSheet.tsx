'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { triggerHaptic } from '@/hooks/useHaptic';

interface MapBottomSheetProps {
  children: ReactNode;
}

const PEEK_HEIGHT = 140;
const EXPANDED_RATIO = 0.85;
const DRAG_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.4;

type Snap = 'peek' | 'expanded';

function snapToHeight(snap: Snap, vh: number): number {
  return snap === 'peek' ? PEEK_HEIGHT : vh * EXPANDED_RATIO;
}

export default function MapBottomSheet({ children }: MapBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<Snap>('peek');
  const [vh, setVh] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  const [isDragging, setIsDragging] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(PEEK_HEIGHT);

  const dragState = useRef({
    startY: 0,
    startHeight: 0,
    lastY: 0,
    lastTime: 0,
    velocity: 0,
    isScrolling: false,
  });

  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setSheetHeight(snapToHeight(snap, vh));
  }, [snap, vh]);

  const shouldIntercept = useCallback((): boolean => {
    const el = contentRef.current;
    if (!el) return true;
    return el.scrollTop <= 0;
  }, []);

  const handleDragStart = useCallback(
    (clientY: number) => {
      dragState.current = {
        startY: clientY,
        startHeight: sheetHeight,
        lastY: clientY,
        lastTime: Date.now(),
        velocity: 0,
        isScrolling: false,
      };
    },
    [sheetHeight],
  );

  const handleDragMove = useCallback(
    (clientY: number) => {
      const ds = dragState.current;
      const now = Date.now();
      const dt = now - ds.lastTime;
      if (dt > 0) {
        ds.velocity = (ds.lastY - clientY) / dt;
      }
      ds.lastY = clientY;
      ds.lastTime = now;

      const delta = ds.startY - clientY;
      const newHeight = Math.max(PEEK_HEIGHT, Math.min(vh * EXPANDED_RATIO, ds.startHeight + delta));
      setSheetHeight(newHeight);
      setIsDragging(true);
    },
    [vh],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    triggerHaptic('light');
    const ds = dragState.current;

    if (Math.abs(ds.velocity) > VELOCITY_THRESHOLD) {
      setSnap(ds.velocity > 0 ? 'expanded' : 'peek');
      return;
    }

    const mid = (PEEK_HEIGHT + vh * EXPANDED_RATIO) / 2;
    if (Math.abs(sheetHeight - snapToHeight(snap, vh)) > DRAG_THRESHOLD) {
      setSnap(sheetHeight > mid ? 'expanded' : 'peek');
    } else {
      setSheetHeight(snapToHeight(snap, vh));
    }
  }, [snap, sheetHeight, vh]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!shouldIntercept()) {
        dragState.current.isScrolling = true;
        return;
      }
      handleDragStart(e.touches[0].clientY);
    },
    [handleDragStart, shouldIntercept],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (dragState.current.isScrolling) {
        if (shouldIntercept() && contentRef.current?.scrollTop === 0) {
          dragState.current.isScrolling = false;
          handleDragStart(e.touches[0].clientY);
        }
        return;
      }
      e.preventDefault();
      handleDragMove(e.touches[0].clientY);
    },
    [handleDragMove, handleDragStart, shouldIntercept],
  );

  const handleTouchEnd = useCallback(() => {
    if (dragState.current.isScrolling) {
      dragState.current.isScrolling = false;
      return;
    }
    handleDragEnd();
  }, [handleDragEnd]);

  const handleHandleTap = useCallback(() => {
    if (isDragging) return;
    setSnap(snap === 'peek' ? 'expanded' : 'peek');
  }, [snap, isDragging]);

  return (
    <div
      ref={sheetRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        height: `${sheetHeight}px`,
        transition: isDragging ? 'none' : 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        touchAction: snap === 'expanded' && !shouldIntercept() ? 'pan-y' : 'none',
      }}
      className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing"
        onClick={handleHandleTap}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="overflow-y-auto overscroll-contain px-3 pb-[env(safe-area-inset-bottom,0px)]"
        style={{
          height: `calc(100% - 28px)`,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </div>
  );
}
