'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { PngOptions } from '@/types';
import { useLang } from '@/lib/langContext';

interface OutputPanelProps {
  getLatex: () => string;
  getLatexExpanded: () => string;
  onSaveToHistory: (latex: string) => void;
}

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
    <polyline points="7 10 12 15 17 10" strokeWidth="2" />
    <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" strokeWidth="2" />
  </svg>
);

export default function OutputPanel({ getLatex, getLatexExpanded, onSaveToHistory }: OutputPanelProps) {
  const [copiedBtn, setCopiedBtn] = useState<string | null>(null);
  const { t } = useLang();
  const pngOptions: PngOptions = useMemo(() => ({
    scale: 3,
    padding: 'large',
    background: 'white',
  }), []);

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

      // Render math in a real DOM element.
      // html2canvas re-implements CSS rendering directly on Canvas,
      // so it avoids the SVG foreignObject taint (SecurityError).
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.padding = `${pad}px`;
      container.style.display = 'inline-block';
      container.style.fontSize = '32px';
      container.style.color = '#000000';
      if (pngOptions.background === 'white') {
        container.style.background = '#ffffff';
      }
      container.innerHTML = mathlive.convertLatexToMarkup(latex);
      document.body.appendChild(container);

      // Wait for KaTeX web-fonts to finish loading
      await document.fonts.ready;

      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(container, {
        scale: pngOptions.scale,
        backgroundColor: pngOptions.background === 'white' ? '#ffffff' : null,
        logging: false,
      });

      document.body.removeChild(container);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `equation_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      onSaveToHistory(latex);
    } catch (err) {
      console.error('PNG download failed:', err);
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
          {copiedBtn === 'latex' ? t('copied') : t('latex')}
        </button>
        <button className={btnClass('latex-expanded')} onClick={copyLatexExpanded} title={t('latexExpandedTitle')}>
          {copiedBtn === 'latex-expanded' ? <CheckIcon /> : <CopyIcon />}
          {copiedBtn === 'latex-expanded' ? t('copied') : t('latexExpanded')}
        </button>
        <button className={btnClass('markdown')} onClick={copyMarkdown}>
          {copiedBtn === 'markdown' ? <CheckIcon /> : <CopyIcon />}
          {copiedBtn === 'markdown' ? t('copied') : t('copyMarkdown')}
        </button>
        <button className={btnClass('inline')} onClick={copyInlineMarkdown}>
          {copiedBtn === 'inline' ? <CheckIcon /> : <CopyIcon />}
          {copiedBtn === 'inline' ? t('copied') : t('copyInline')}
        </button>
        <button className={btnClass('png')} onClick={downloadPng}>
          <DownloadIcon />
          PNG
        </button>
      </div>
    </div>
  );
}
