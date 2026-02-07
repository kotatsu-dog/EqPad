'use client';

import React, { useState, useCallback } from 'react';
import { PngOptions } from '@/types';

interface OutputPanelProps {
  getLatex: () => string;
  getLatexExpanded: () => string;
  onSaveToHistory: (latex: string) => void;
}

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
    <polyline points="7 10 12 15 17 10" strokeWidth="2" />
    <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" strokeWidth="2" />
  </svg>
);

export default function OutputPanel({ getLatex, getLatexExpanded, onSaveToHistory }: OutputPanelProps) {
  const [copiedBtn, setCopiedBtn] = useState<string | null>(null);
  const [pngOptions, setPngOptions] = useState<PngOptions>({
    scale: 2,
    padding: 'medium',
    background: 'transparent',
  });
  const [showOptions, setShowOptions] = useState(false);

  const flashCopied = useCallback((btnId: string) => {
    setCopiedBtn(btnId);
    setTimeout(() => setCopiedBtn(null), 2000);
  }, []);

  const copyLatex = useCallback(async () => {
    const latex = getLatex();
    if (!latex.trim()) return;
    await navigator.clipboard.writeText(latex);
    onSaveToHistory(latex);
    flashCopied('latex');
  }, [getLatex, onSaveToHistory, flashCopied]);

  const copyLatexExpanded = useCallback(async () => {
    const latex = getLatexExpanded();
    if (!latex.trim()) return;
    await navigator.clipboard.writeText(latex);
    onSaveToHistory(latex);
    flashCopied('latex-expanded');
  }, [getLatexExpanded, onSaveToHistory, flashCopied]);

  const copyMarkdown = useCallback(async () => {
    const latex = getLatexExpanded();
    if (!latex.trim()) return;
    await navigator.clipboard.writeText(`$$\n${latex}\n$$`);
    onSaveToHistory(latex);
    flashCopied('markdown');
  }, [getLatexExpanded, onSaveToHistory, flashCopied]);

  const copyInlineMarkdown = useCallback(async () => {
    const latex = getLatexExpanded();
    if (!latex.trim()) return;
    await navigator.clipboard.writeText(`$${latex}$`);
    onSaveToHistory(latex);
    flashCopied('inline');
  }, [getLatexExpanded, onSaveToHistory, flashCopied]);

  const downloadPng = useCallback(async () => {
    const latex = getLatexExpanded();
    if (!latex.trim()) return;

    try {
      const mathlive = await import('mathlive');
      const paddingMap = { small: 8, medium: 16, large: 32 };
      const pad = paddingMap[pngOptions.padding];

      // Create a temporary container with the rendered math
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.padding = `${pad}px`;
      container.style.background = pngOptions.background === 'white' ? '#ffffff' : 'transparent';
      container.style.display = 'inline-block';
      container.style.fontSize = '32px';
      container.innerHTML = mathlive.convertLatexToMarkup(latex);
      document.body.appendChild(container);

      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(container, {
        pixelRatio: pngOptions.scale,
        backgroundColor: pngOptions.background === 'white' ? '#ffffff' : 'transparent',
      });

      document.body.removeChild(container);

      const link = document.createElement('a');
      link.download = `equation_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      onSaveToHistory(latex);
    } catch (err) {
      console.error('PNG download failed:', err);
    }
  }, [getLatexExpanded, pngOptions, onSaveToHistory]);

  const downloadSvg = useCallback(async () => {
    const latex = getLatexExpanded();
    if (!latex.trim()) return;

    try {
      const mathlive = await import('mathlive');
      const paddingMap = { small: 8, medium: 16, large: 32 };
      const pad = paddingMap[pngOptions.padding];

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.padding = `${pad}px`;
      container.style.background = pngOptions.background === 'white' ? '#ffffff' : 'transparent';
      container.style.display = 'inline-block';
      container.style.fontSize = '32px';
      container.innerHTML = mathlive.convertLatexToMarkup(latex);
      document.body.appendChild(container);

      const { toSvg } = await import('html-to-image');
      const dataUrl = await toSvg(container);

      document.body.removeChild(container);

      const link = document.createElement('a');
      link.download = `equation_${Date.now()}.svg`;
      link.href = dataUrl;
      link.click();
      onSaveToHistory(latex);
    } catch (err) {
      console.error('SVG download failed:', err);
    }
  }, [getLatexExpanded, pngOptions, onSaveToHistory]);

  const btnClass = (id: string) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      copiedBtn === id
        ? 'bg-green-500 text-white'
        : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
    }`;

  return (
    <div className="output-panel space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={btnClass('latex')} onClick={copyLatex}>
          {copiedBtn === 'latex' ? <CheckIcon /> : <CopyIcon />}
          {copiedBtn === 'latex' ? 'コピー済み' : 'LaTeX'}
        </button>
        <button className={btnClass('latex-expanded')} onClick={copyLatexExpanded} title="すべてのマクロを展開した可搬性の高い形式">
          {copiedBtn === 'latex-expanded' ? <CheckIcon /> : <CopyIcon />}
          {copiedBtn === 'latex-expanded' ? 'コピー済み' : 'LaTeX (展開)'}
        </button>
        <button className={btnClass('markdown')} onClick={copyMarkdown}>
          {copiedBtn === 'markdown' ? <CheckIcon /> : <CopyIcon />}
          {copiedBtn === 'markdown' ? 'コピー済み' : 'Copy $$ Markdown'}
        </button>
        <button className={btnClass('inline')} onClick={copyInlineMarkdown}>
          {copiedBtn === 'inline' ? <CheckIcon /> : <CopyIcon />}
          {copiedBtn === 'inline' ? 'コピー済み' : 'Copy $ Inline'}
        </button>
        <button className={btnClass('png')} onClick={downloadPng}>
          <DownloadIcon />
          PNG
        </button>
        <button className={btnClass('svg')} onClick={downloadSvg}>
          <DownloadIcon />
          SVG
        </button>
        <button
          className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => setShowOptions(!showOptions)}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4" strokeWidth="2" />
          </svg>
          画像設定
        </button>
      </div>

      {showOptions && (
        <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">解像度:</span>
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                className={`px-2 py-1 rounded-md ${
                  pngOptions.scale === s ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setPngOptions((o) => ({ ...o, scale: s }))}
              >
                {s}x
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">余白:</span>
            {(['small', 'medium', 'large'] as const).map((p) => (
              <button
                key={p}
                className={`px-2 py-1 rounded-md capitalize ${
                  pngOptions.padding === p ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setPngOptions((o) => ({ ...o, padding: p }))}
              >
                {p === 'small' ? '小' : p === 'medium' ? '中' : '大'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">背景:</span>
            <button
              className={`px-2 py-1 rounded-md ${
                pngOptions.background === 'transparent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setPngOptions((o) => ({ ...o, background: 'transparent' }))}
            >
              透過
            </button>
            <button
              className={`px-2 py-1 rounded-md ${
                pngOptions.background === 'white'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setPngOptions((o) => ({ ...o, background: 'white' }))}
            >
              白
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
