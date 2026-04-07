'use client';

import { useRef, useCallback } from 'react';
import { WebHaptics } from 'web-haptics';

type HapticPreset = 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'soft' | 'rigid' | 'selection' | 'nudge';

let sharedInstance: WebHaptics | null = null;

function getInstance(): WebHaptics | null {
  if (typeof window === 'undefined') return null;
  if (!WebHaptics.isSupported) return null;
  if (!sharedInstance) {
    sharedInstance = new WebHaptics();
  }
  return sharedInstance;
}

export function useHaptic() {
  const lastTriggerRef = useRef(0);

  const tap = useCallback((preset: HapticPreset = 'light') => {
    const now = Date.now();
    if (now - lastTriggerRef.current < 50) return;
    lastTriggerRef.current = now;

    try {
      getInstance()?.trigger(preset);
    } catch {
      // Silently fail on unsupported devices
    }
  }, []);

  return { tap };
}

export function triggerHaptic(preset: HapticPreset = 'light') {
  try {
    getInstance()?.trigger(preset);
  } catch {
    // Silently fail
  }
}
