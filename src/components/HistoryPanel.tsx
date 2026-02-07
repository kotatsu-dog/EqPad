'use client';

import React, { useEffect, useRef } from 'react';
import { HistoryEntry } from '@/types';
import { useLang } from '@/lib/langContext';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onRestore: (latex: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function HistoryItem({ entry, onRestore, onRemove }: { entry: HistoryEntry; onRestore: (latex: string) => void; onRemove: (id: string) => void }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const { t } = useLang();

  useEffect(() => {
    if (rendered.current || !previewRef.current) return;
    rendered.current = true;

    const render = async () => {
      try {
        const mathlive = await import('mathlive');
        // mathlive-static.css handles @font-face for convertLatexToMarkup()
        if (typeof document !== 'undefined' && document.fonts) {
          await document.fonts.ready;
        }
        if (previewRef.current) {
          previewRef.current.innerHTML = mathlive.convertLatexToMarkup(entry.latex);
        }
      } catch {
        if (previewRef.current) {
          previewRef.current.textContent = entry.latex;
        }
      }
    };
    render();
  }, [entry.latex]);

  const timeAgo = (ts: number): string => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('time.justNow');
    if (mins < 60) return t('time.minutesAgo', { minutes: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('time.hoursAgo', { hours });
    const days = Math.floor(hours / 24);
    return t('time.daysAgo', { days });
  };

  return (
    <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onRestore(entry.latex)}
    >
      <div
        ref={previewRef}
        className="flex-1 text-sm overflow-hidden max-h-[40px] pointer-events-none"
        style={{ fontSize: '14px' }}
      />
      <span className="text-[10px] text-gray-300 whitespace-nowrap">{timeAgo(entry.timestamp)}</span>
      <button
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1"
        onClick={(e) => { e.stopPropagation(); onRemove(entry.id); }}
        title={t('delete')}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}

export default function HistoryPanel({ entries, onRestore, onRemove, onClear }: HistoryPanelProps) {
  const { t } = useLang();
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-300">
        {t('noHistory')}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{entries.length}{t('historyCountSuffix')}</span>
        <button
          className="text-xs text-gray-300 hover:text-red-400 transition-colors"
          onClick={onClear}
        >
          {t('clearAll')}
        </button>
      </div>
      {entries.map((entry) => (
        <HistoryItem
          key={entry.id}
          entry={entry}
          onRestore={onRestore}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
