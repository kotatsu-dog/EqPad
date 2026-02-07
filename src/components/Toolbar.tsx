'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useLang } from '@/lib/langContext';
import { ButtonCategory, ButtonDef } from '@/types';

interface ToolbarProps {
  categories: ButtonCategory[];
  onInsert: (latex: string) => void;
}

// Global promise to ensure fonts are loaded once
let fontsReadyPromise: Promise<void> | null = null;
function ensureFontsReady(): Promise<void> {
  if (fontsReadyPromise) return fontsReadyPromise;
  fontsReadyPromise = (async () => {
    // mathlive-static.css provides @font-face rules for convertLatexToMarkup()
    // fontsDirectory is only for MathfieldElement shadow DOM (set in MathEditor)
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }
  })();
  return fontsReadyPromise;
}

function ToolbarButton({ btn, onInsert }: { btn: ButtonDef; onInsert: (latex: string) => void }) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [fallback, setFallback] = useState(false);
  const useTextIcon = btn.iconType === 'text';

  useEffect(() => {
    if (useTextIcon) return; // Text icons don't need MathLive rendering
    let cancelled = false;

    const renderIcon = async () => {
      try {
        await ensureFontsReady();
        const mathlive = await import('mathlive');
        if (cancelled || !iconRef.current) return;
        const html = mathlive.convertLatexToMarkup(btn.icon);
        iconRef.current.innerHTML = html;
      } catch {
        if (!cancelled) setFallback(true);
      }
    };
    renderIcon();

    return () => { cancelled = true; };
  }, [btn.icon, useTextIcon]);

  return (
    <button
      className="toolbar-btn group relative flex items-center justify-center min-w-[44px] h-[44px] px-2 rounded-lg
                 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300
                 transition-all duration-150 text-sm"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onInsert(btn.latex)}
      title={`${btn.label}${btn.shortcut ? ` (${btn.shortcut})` : ''}`}
    >
      {useTextIcon ? (
        <span className="text-gray-700 text-lg leading-none pointer-events-none select-none">
          {btn.icon}
        </span>
      ) : (
        <span
          ref={iconRef}
          className="btn-icon text-gray-700 leading-none pointer-events-none"
          style={{ fontSize: '20px' }}
        >
          {fallback ? btn.label : ''}
        </span>
      )}
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity bg-white px-1 rounded shadow z-10">
        {btn.label}
      </span>
    </button>
  );
}

export default function Toolbar({ categories, onInsert }: ToolbarProps) {
  const grouped = useMemo(() => categories, [categories]);
  const { t } = useLang();

  return (
    <div className="toolbar space-y-2">
      {grouped.map((cat) => (
        <div key={cat.name}>
          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1 px-1">
            {t(cat.name) || cat.name}
          </div>
          <div className="flex flex-wrap gap-1">
            {cat.buttons.map((btn) => (
              <ToolbarButton key={btn.label} btn={btn} onInsert={onInsert} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
