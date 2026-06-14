import { locationOptions, occupationOptions } from '@/types/user';

const OCCUPATION_SET = new Set<string>(occupationOptions);
const LOCATION_SET = new Set<string>(locationOptions);

export function parseStoredLocation(stored: string | undefined | null): string {
  if (!stored?.trim()) return '';
  const trimmed = stored.trim();
  if (LOCATION_SET.has(trimmed)) return trimmed;
  if (/macau/i.test(trimmed)) return 'Macau';
  if (/hong\s*kong|hk\b/i.test(trimmed)) return 'Hong Kong';
  return '';
}

export function parseStoredOccupation(stored: string | undefined | null): {
  select: string;
  other: string;
} {
  if (!stored?.trim()) return { select: '', other: '' };
  const trimmed = stored.trim();
  if (OCCUPATION_SET.has(trimmed)) {
    return { select: trimmed, other: '' };
  }
  return { select: 'Other', other: trimmed };
}

export function resolveOccupationForSave(select: string, other: string): string {
  if (select === 'Other') {
    const trimmed = other.trim();
    return trimmed || 'Other';
  }
  return select;
}
