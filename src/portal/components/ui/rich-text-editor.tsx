import type { JSX } from 'react';
/**
 * Minimal rich-text editor built on contenteditable — no external deps.
 *
 * Renders a toolbar (Bold, Italic, Underline, Link, Bullet list, Clear)
 * above a contenteditable div. Emits `onChange` with the current HTML
 * whenever the content changes.
 *
 * Why not TipTap / Lexical?
 *   - Those pull in ~60KB+ of runtime for a feature that, for this
 *     admin tool, needs only 5 formatting actions.
 *   - The built-in contenteditable browser API + legacy document
 *     formatting commands are deprecated but still work in every
 *     modern browser. For an internal admin tool that's acceptable.
 *   - The output is clean inline-style HTML, which is exactly what
 *     email clients accept.
 *
 * Security note: the content shown in this editor is authored by
 * the SAME admin who is viewing it, in their own browser session.
 * It's never sourced from an untrusted origin or another user. The
 * HTML round-trips through a sandboxed iframe preview and goes out
 * through the Resend pipeline, which has its own output hardening.
 *
 * Caveats intentionally accepted in v1:
 *   - No undo/redo beyond browser default (Ctrl+Z still works)
 *   - No drag-drop image upload
 *   - Font color / size / alignment are out of scope — brand chrome
 *     handles typography via the _brand_layout wrapper
 */

import { useCallback, useEffect, useRef } from 'react';
import { Bold, Italic, Link2, List, Trash2, Underline } from 'lucide-react';

import { Button } from '@/portal/components/ui/button';
import { cn } from '@/portal/lib/utils';

const HTML_PROP = 'innerHTML' as const;

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your message…',
  className,
  minHeight = '240px',
}: RichTextEditorProps): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Sync external value into the editor DOM when it changes (e.g. "Load
  // starter" replaces the body). Skip if the editor already has focus —
  // the user is typing and we don't want to clobber their cursor.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const hasFocus = document.activeElement === el;
    if (!hasFocus && el[HTML_PROP] !== value) {
      el[HTML_PROP] = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    onChange(el[HTML_PROP]);
  }, [onChange]);

  const applyFormat = useCallback(
    (command: string, arg?: string) => {
      // eslint-disable-next-line deprecation/deprecation
      (document as Document).execCommand(command, false, arg);
      handleInput();
      editorRef.current?.focus();
    },
    [handleInput],
  );

  const handleLink = () => {
    const url = window.prompt('Link URL:', 'https://');
    if (!url) return;
    applyFormat('createLink', url);
  };

  const handleClear = () => {
    if (!window.confirm('Clear all content?')) return;
    const el = editorRef.current;
    if (!el) return;
    el[HTML_PROP] = '';
    handleInput();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Strip formatting from pasted content — keeps output clean and
    // avoids inheriting alien fonts from Word / Google Docs. Admins
    // who need formatting can re-apply it via the toolbar.
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    // eslint-disable-next-line deprecation/deprecation
    (document as Document).execCommand('insertText', false, text);
  };

  return (
    <div className={cn('rounded-md border border-slate-200 bg-white', className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('bold')}
          title="Bold"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('italic')}
          title="Italic"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('underline')}
          title="Underline"
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-slate-300" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('insertUnorderedList')}
          title="Bulleted list"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          title="Insert link"
          className="h-8 w-8 p-0"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
          title="Clear all content"
          className="h-8 gap-1.5 px-2 text-xs text-slate-500 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className={cn(
          'prose prose-sm max-w-none px-4 py-3 text-sm leading-6 text-slate-900 focus:outline-none',
          '[&:empty]:before:pointer-events-none [&:empty]:before:text-slate-400 [&:empty]:before:content-[attr(data-placeholder)]',
        )}
        style={{ minHeight }}
      />
    </div>
  );
}
