import { useEffect, useRef } from 'react';
import type Vditor from 'vditor';

import styles from './vditor-editor.module.css';

interface VditorEditorProps {
  initialValue?: string;
  syncKey?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function VditorEditor({ initialValue, syncKey, placeholder, onChange }: VditorEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Vditor | null>(null);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) {
      return;
    }

    let disposed = false;

    const initEditor = async () => {
      const [{ default: VditorConstructor }] = await Promise.all([
        import('vditor'),
        import('vditor/dist/index.css'),
      ]);

      if (!containerRef.current || editorRef.current || disposed) {
        return;
      }

      const editor = new VditorConstructor(containerRef.current, {
        mode: 'sv',
        minHeight: 420,
        cache: {
          enable: false,
        },
        placeholder: placeholder ?? '请输入 Markdown 正文内容',
        toolbarConfig: {
          pin: true,
        },
        after: () => {
          editor.setValue(initialValue ?? '');
        },
        input: (markdown: string) => {
          onChange(markdown);
        },
      });

      editorRef.current = editor;
    };

    initEditor();

    return () => {
      disposed = true;
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [initialValue, onChange, placeholder]);

  useEffect(() => {
    if (!syncKey) {
      return;
    }

    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const value = initialValue ?? '';
    const currentValue = editor.getValue();
    if (currentValue !== value) {
      editor.setValue(value);
    }
  }, [initialValue, syncKey]);

  return <div className={styles.editor} ref={containerRef} />;
}
