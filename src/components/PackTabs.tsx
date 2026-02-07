'use client';

import React, { useState } from 'react';
import { ButtonPack } from '@/types';
import Toolbar from './Toolbar';

interface PackTabsProps {
  packs: ButtonPack[];
  activePackIndex: number;
  onChangeTab: (index: number) => void;
  onInsert: (latex: string) => void;
}

export default function PackTabs({ packs, activePackIndex, onChangeTab, onInsert }: PackTabsProps) {
  const activePack = packs[activePackIndex];
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {packs.map((pack, i) => (
          <button
            key={pack.label}
            className={`px-4 py-1.5 text-sm rounded-full transition-all duration-150 font-medium ${
              i === activePackIndex
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChangeTab(i)}
          >
            {pack.label}
          </button>
        ))}
        <button
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setExpanded(!expanded)}
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9" strokeWidth="2" />
          </svg>
          {expanded ? '折りたたむ' : '展開する'}
        </button>
      </div>
      {expanded && activePack && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {activePack.categories.map((cat) => (
            <div key={cat.name}>
              <Toolbar categories={[cat]} onInsert={onInsert} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
