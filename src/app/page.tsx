'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { MathEditorHandle } from '@/components/MathEditor';
import Toolbar from '@/components/Toolbar';
import PackTabs from '@/components/PackTabs';
import OutputPanel from '@/components/OutputPanel';
import HistoryPanel from '@/components/HistoryPanel';
import { ButtonPack, HistoryEntry } from '@/types';
import { getHistory, addToHistory, removeFromHistory, clearHistory } from '@/lib/history';

import coreData from '@/data/core.json';
import highschoolData from '@/data/pack_highschool.json';
import universityData from '@/data/pack_university.json';

const MathEditor = dynamic(() => import('@/components/MathEditor'), { ssr: false });

const packs: ButtonPack[] = [highschoolData, universityData];

export default function Home() {
  const editorRef = useRef<MathEditorHandle>(null);
  const [latex, setLatex] = useState('');
  const [activePackIndex, setActivePackIndex] = useState(0);
  const [showLatex, setShowLatex] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistoryEntries(getHistory());
  }, []);

  const handleInsert = useCallback((snippetLatex: string) => {
    editorRef.current?.insertLatex(snippetLatex);
    editorRef.current?.focus();
  }, []);

  const handleChange = useCallback((newLatex: string) => {
    setLatex(newLatex);
  }, []);

  const getLatex = useCallback(() => {
    return editorRef.current?.getLatex() ?? latex;
  }, [latex]);

  const getLatexExpanded = useCallback(() => {
    return editorRef.current?.getLatexExpanded() ?? latex;
  }, [latex]);

  const handleSaveToHistory = useCallback((latexStr: string) => {
    const updated = addToHistory(latexStr);
    setHistoryEntries(updated);
  }, []);

  const handleRestore = useCallback((latexStr: string) => {
    editorRef.current?.setLatex(latexStr);
    setLatex(latexStr);
  }, []);

  const handleRemoveHistory = useCallback((id: string) => {
    const updated = removeFromHistory(id);
    setHistoryEntries(updated);
  }, []);

  const handleClearHistory = useCallback(() => {
    const updated = clearHistory();
    setHistoryEntries(updated);
  }, []);

  const handleClearEditor = useCallback(() => {
    editorRef.current?.setLatex('');
    setLatex('');
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">
              <span className="text-blue-500">Eq</span>Pad
            </h1>
            <span className="text-xs text-gray-300 hidden sm:inline">数式エディタ</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLatex(!showLatex)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                showLatex ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              LaTeX表示
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                showHistory ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <polyline points="12 6 12 12 16 14" strokeWidth="2" />
              </svg>
              履歴
              {historyEntries.length > 0 && (
                <span className="ml-0.5 bg-blue-400 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                  {historyEntries.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Editor Area */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50">
                <span className="text-xs font-medium text-gray-400">数式エディタ</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearEditor}
                    className="text-xs text-gray-300 hover:text-red-400 transition-colors px-2 py-1"
                    title="数式をクリア"
                  >
                    クリア
                  </button>
                </div>
              </div>
              <MathEditor
                ref={editorRef}
                onChange={handleChange}
                showLatexSource={showLatex}
              />
              {showLatex && latex && (
                <div className="px-5 pb-3">
                  <div className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-2 break-all select-all">
                    {latex}
                  </div>
                </div>
              )}
            </section>

            {/* Output Panel */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="text-xs font-medium text-gray-400 mb-3">出力</div>
              <OutputPanel getLatex={getLatex} getLatexExpanded={getLatexExpanded} onSaveToHistory={handleSaveToHistory} />
            </section>

            {/* Core Toolbar */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="text-xs font-medium text-gray-400 mb-3">コアボタン</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {(coreData as ButtonPack).categories.map((cat) => (
                  <div key={cat.name}>
                    <Toolbar categories={[cat]} onInsert={handleInsert} />
                  </div>
                ))}
              </div>
            </section>

            {/* Pack Tabs */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="text-xs font-medium text-gray-400 mb-3">テンプレート</div>
              <PackTabs
                packs={packs}
                activePackIndex={activePackIndex}
                onChangeTab={setActivePackIndex}
                onInsert={handleInsert}
              />
            </section>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <aside className="w-72 shrink-0 animate-fade-in hidden lg:block">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
                <div className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                  </svg>
                  最近の数式
                </div>
                <HistoryPanel
                  entries={historyEntries}
                  onRestore={handleRestore}
                  onRemove={handleRemoveHistory}
                  onClear={handleClearHistory}
                />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-300">
          <span>EqPad — LaTeX数式エディタ</span>
          <div className="flex items-center gap-4">
            <span>Tab: 穴巡回</span>
            <span>Ctrl+Z: 元に戻す</span>
            <span>矢印キー: 移動</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
