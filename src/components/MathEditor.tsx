'use client';

import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface MathEditorHandle {
  getLatex: () => string;
  getLatexExpanded: () => string;
  setLatex: (latex: string) => void;
  insertLatex: (latex: string) => void;
  focus: () => void;
}

interface MathEditorProps {
  initialLatex?: string;
  onChange?: (latex: string) => void;
  showLatexSource?: boolean;
}

const MathEditor = forwardRef<MathEditorHandle, MathEditorProps>(
  ({ initialLatex = '', onChange, showLatexSource = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mfRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getLatex: () => {
        return mfRef.current?.getValue('latex') ?? '';
      },
      getLatexExpanded: () => {
        return mfRef.current?.getValue('latex-expanded') ?? '';
      },
      setLatex: (latex: string) => {
        if (mfRef.current) {
          mfRef.current.setValue(latex);
        }
      },
      insertLatex: (snippet: string) => {
        if (mfRef.current) {
          // Replace #0, #1, etc. with placeholders
          const latexWithPlaceholders = snippet.replace(/#\d+/g, '\\placeholder{}');
          mfRef.current.insert(latexWithPlaceholders, {
            insertionMode: 'insertAfter',
            selectionMode: 'placeholder',
            focus: true,
          });
        }
      },
      focus: () => {
        mfRef.current?.focus();
      },
    }));

    const handleInput = useCallback(() => {
      if (mfRef.current && onChange) {
        onChange(mfRef.current.getValue('latex'));
      }
    }, [onChange]);

    useEffect(() => {
      let mf: any = null;
      let isMounted = true;

      const init = async () => {
        const mathlive = await import('mathlive');
        if (!isMounted || !containerRef.current) return;

        // Set font directory to public folder before creating elements
        mathlive.MathfieldElement.fontsDirectory = '/fonts';

        // Create math-field element
        mf = new mathlive.MathfieldElement();
        mf.style.width = '100%';
        mf.style.minHeight = '80px';
        mf.style.fontSize = '24px';
        mf.style.padding = '16px';
        mf.style.border = 'none';
        mf.style.outline = 'none';
        mf.style.background = 'transparent';

        // MathLive config
        mf.smartFence = true;
        mf.smartSuperscript = false;
        mf.smartMode = false;
        mf.virtualKeyboardMode = 'off';

        if (initialLatex) {
          mf.setValue(initialLatex);
        }

        mf.addEventListener('input', handleInput);

        // Handle Tab navigating out of mathfield when no more placeholders
        mf.addEventListener('move-out', (evt: Event) => {
          const detail = (evt as CustomEvent).detail;
          if (detail?.direction === 'forward' || detail?.direction === 'downward') {
            // Move focus to next focusable element after the editor
            mf.blur();
          }
        });

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(mf);
        mfRef.current = mf;
      };

      init();

      return () => {
        isMounted = false;
        if (mf) {
          mf.removeEventListener('input', handleInput);
        }
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <div className="math-editor-wrapper">
        <div
          ref={containerRef}
          className="math-editor-container min-h-[120px] flex items-center justify-center cursor-text"
          onClick={() => mfRef.current?.focus()}
        />
        {showLatexSource && (
          <div className="mt-2 px-4 pb-3">
            <div className="text-xs text-gray-400 font-mono bg-gray-50 rounded px-3 py-2 break-all select-all">
              {mfRef.current?.getValue('latex-expanded') || ''}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MathEditor.displayName = 'MathEditor';
export default MathEditor;
