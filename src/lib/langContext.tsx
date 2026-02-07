'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode = 'ja' | 'en' | 'zh';

interface LangContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  languages: LanguageCode[];
}

const STORAGE_KEY = 'eqpad_lang';
const DEFAULT_LANG: LanguageCode = 'ja';
const SUPPORTED_LANGS: LanguageCode[] = ['ja', 'en', 'zh'];

const translations: Record<LanguageCode, Record<string, string>> = {
  ja: {
    title: '数式エディタ',
    showLatex: 'LaTeX表示',
    history: '履歴',
    editor: '数式エディタ',
    clearEditor: 'クリア',
    clearEditorTitle: '数式をクリア',
    output: '出力',
    coreButtons: 'コアボタン',
    templates: 'テンプレート',
    recentEquations: '最近の数式',
    copied: 'コピー済み',
    latex: 'LaTeX',
    latexExpanded: 'LaTeX (展開)',
    latexExpandedTitle: 'すべてのマクロを展開した可搬性の高い形式',
    copyMarkdown: 'Copy $$ Markdown',
    copyInline: 'Copy $ Inline',
    noHistory: 'まだ履歴はありません',
    historyCountSuffix: '件',
    clearAll: 'すべて削除',
    delete: '削除',
    language: '言語',
    collapse: '折りたたむ',
    expand: '展開する',
    footerTitle: 'EqPad — LaTeX数式エディタ',
    hintTab: 'Tab: 穴巡回',
    hintUndo: 'Ctrl+Z: 元に戻す',
    hintArrows: '矢印キー: 移動',
    'lang.ja': '日本語',
    'lang.en': 'English',
    'lang.zh': '中文',
    'time.justNow': 'たった今',
    'time.minutesAgo': '{minutes}分前',
    'time.hoursAgo': '{hours}時間前',
    'time.daysAgo': '{days}日前',
    'コア': 'コア',
    '高校': '高校',
    '大学': '大学',
    '構造': '構造',
    '解析': '解析',
    '関数': '関数',
    '比較・記号': '比較・記号',
    '形・装飾': '形・装飾',
    '構造体': '構造体',
    '微分・積分': '微分・積分',
    '数列': '数列',
    '確率・統計': '確率・統計',
    '三角関数': '三角関数',
    'ベクトル・図形': 'ベクトル・図形',
    '線形代数': '線形代数',
    '内積空間': '内積空間',
    '集合・論理': '集合・論理',
    '解析（大学）': '解析（大学）',
    'その他': 'その他',
  },
  en: {
    title: 'Equation Editor',
    showLatex: 'Show LaTeX',
    history: 'History',
    editor: 'Equation Editor',
    clearEditor: 'Clear',
    clearEditorTitle: 'Clear equation',
    output: 'Output',
    coreButtons: 'Core Buttons',
    templates: 'Templates',
    recentEquations: 'Recent equations',
    copied: 'Copied',
    latex: 'LaTeX',
    latexExpanded: 'LaTeX (expanded)',
    latexExpandedTitle: 'Portable format with all macros expanded',
    copyMarkdown: 'Copy $$ Markdown',
    copyInline: 'Copy $ Inline',
    noHistory: 'No history yet',
    historyCountSuffix: ' items',
    clearAll: 'Clear all',
    delete: 'Delete',
    language: 'Language',
    collapse: 'Collapse',
    expand: 'Expand',
    footerTitle: 'EqPad — LaTeX equation editor',
    hintTab: 'Tab: placeholder jump',
    hintUndo: 'Ctrl+Z: undo',
    hintArrows: 'Arrow keys: move',
    'lang.ja': 'Japanese',
    'lang.en': 'English',
    'lang.zh': 'Chinese',
    'time.justNow': 'just now',
    'time.minutesAgo': '{minutes}m ago',
    'time.hoursAgo': '{hours}h ago',
    'time.daysAgo': '{days}d ago',
    'コア': 'Core',
    '高校': 'High School',
    '大学': 'University',
    '構造': 'Structure',
    '解析': 'Analysis',
    '関数': 'Functions',
    '比較・記号': 'Comparison & Symbols',
    '形・装飾': 'Forms & Accents',
    '構造体': 'Structures',
    '微分・積分': 'Calculus',
    '数列': 'Sequences',
    '確率・統計': 'Probability & Stats',
    '三角関数': 'Trigonometry',
    'ベクトル・図形': 'Vectors & Geometry',
    '線形代数': 'Linear Algebra',
    '内積空間': 'Inner Product Spaces',
    '集合・論理': 'Sets & Logic',
    '解析（大学）': 'Advanced Analysis',
    'その他': 'Misc',
  },
  zh: {
    title: '公式编辑器',
    showLatex: '显示 LaTeX',
    history: '历史',
    editor: '公式编辑器',
    clearEditor: '清空',
    clearEditorTitle: '清空公式',
    output: '输出',
    coreButtons: '核心按钮',
    templates: '模板',
    recentEquations: '最近公式',
    copied: '已复制',
    latex: 'LaTeX',
    latexExpanded: 'LaTeX (展开)',
    latexExpandedTitle: '展开所有宏的可移植格式',
    copyMarkdown: '复制 $$ Markdown',
    copyInline: '复制 $ Inline',
    noHistory: '暂无历史',
    historyCountSuffix: '条',
    clearAll: '全部清除',
    delete: '删除',
    language: '语言',
    collapse: '折叠',
    expand: '展开',
    footerTitle: 'EqPad — LaTeX 公式编辑器',
    hintTab: 'Tab: 占位符跳转',
    hintUndo: 'Ctrl+Z: 撤销',
    hintArrows: '方向键: 移动',
    'lang.ja': '日语',
    'lang.en': '英语',
    'lang.zh': '中文',
    'time.justNow': '刚刚',
    'time.minutesAgo': '{minutes}分钟前',
    'time.hoursAgo': '{hours}小时前',
    'time.daysAgo': '{days}天前',
    'コア': '核心',
    '高校': '高中',
    '大学': '大学',
    '構造': '结构',
    '解析': '分析',
    '関数': '函数',
    '比較・記号': '比较与符号',
    '形・装飾': '形状与装饰',
    '構造体': '结构体',
    '微分・積分': '微分与积分',
    '数列': '数列',
    '確率・統計': '概率与统计',
    '三角関数': '三角函数',
    'ベクトル・図形': '向量与图形',
    '線形代数': '线性代数',
    '内積空間': '内积空间',
    '集合・論理': '集合与逻辑',
    '解析（大学）': '高等分析',
    'その他': '其他',
  },
};

const LangContext = createContext<LangContextValue | null>(null);

const isSupportedLang = (value: string | null | undefined): value is LanguageCode => {
  return value === 'ja' || value === 'en' || value === 'zh';
};

const normalizeLang = (value: string): LanguageCode | null => {
  const lowered = value.toLowerCase();
  if (lowered.startsWith('ja')) return 'ja';
  if (lowered.startsWith('en')) return 'en';
  if (lowered.startsWith('zh')) return 'zh';
  return null;
};

const detectBrowserLang = (): LanguageCode => {
  if (typeof navigator === 'undefined') return DEFAULT_LANG;
  const langs = navigator.languages && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];
  for (const lang of langs) {
    const normalized = normalizeLang(lang);
    if (normalized) return normalized;
  }
  return DEFAULT_LANG;
};

const format = (template: string, vars?: Record<string, string | number>): string => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
};

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const nextLang = isSupportedLang(stored) ? stored : detectBrowserLang();
    setLangState(nextLang);
    document.documentElement.lang = nextLang;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang, ready]);

  const setLang = useCallback((next: LanguageCode) => {
    setLangState(next);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const template = translations[lang]?.[key] ?? translations[DEFAULT_LANG]?.[key] ?? key;
    return format(template, vars);
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    languages: SUPPORTED_LANGS,
  }), [lang, setLang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within LangProvider');
  }
  return context;
}
