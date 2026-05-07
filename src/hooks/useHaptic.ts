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

function vibrateFallback(preset: HapticPreset) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  const ms =
    preset === 'heavy' || preset === 'error'
      ? 28
      : preset === 'medium' || preset === 'warning'
        ? 18
        : 12;
  try {
    navigator.vibrate(ms);
  } catch {
    // ignore
  }
}

export function useHaptic() {
  const lastTriggerRef = useRef(0);

  const tap = useCallback((preset: HapticPreset = 'light') => {
    const now = Date.now();
    if (now - lastTriggerRef.current < 50) return;
    lastTriggerRef.current = now;

    try {
      const haptics = getInstance();
      if (haptics) {
        haptics.trigger(preset);
        return;
      }
    } catch {
      // Fall through to Vibration API
    }

    vibrateFallback(preset);
  }, []);

  return { tap };
}

export function triggerHaptic(preset: HapticPreset = 'light') {
  try {
    const haptics = getInstance();
    if (haptics) {
      haptics.trigger(preset);
      return;
    }
  } catch {
    // Fall through
  }
  vibrateFallback(preset);
}
