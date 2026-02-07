import { HistoryEntry } from '@/types';

const STORAGE_KEY = 'eqpad_history';
const MAX_ENTRIES = 20;

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addToHistory(latex: string): HistoryEntry[] {
  if (!latex.trim()) return getHistory();
  const entries = getHistory();
  // Avoid duplicates of the same latex
  const filtered = entries.filter((e) => e.latex !== latex);
  const newEntry: HistoryEntry = {
    id: crypto.randomUUID(),
    latex,
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromHistory(id: string): HistoryEntry[] {
  const entries = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export function clearHistory(): HistoryEntry[] {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}
