'use client';

import { useEffect, useState } from 'react';

/**
 * True only after the component has mounted on the client.
 * Use to gate UI that depends on localStorage, Nhost session, or window size
 * so the first client render matches SSR HTML.
 */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
