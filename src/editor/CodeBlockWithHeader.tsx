// src/editor/CodeBlockWithHeader.tsx
import { useEffect, useRef, useState } from "react";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import lowlight, { SUPPORTED_LANGS } from "./lowlight";
import styles from "../components/RichEditor.module.css";

type LangOption = (typeof SUPPORTED_LANGS)[number];

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [onClose]);
  return ref;
}

function CodeBlockComponent(props: NodeViewProps) {
  const lang: string =
    (props.node?.attrs as { language?: string })?.language || "plaintext";

  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const setLanguage = (value: string) => {
    props.updateAttributes({ language: value });
    props.editor.commands.focus();
    setOpen(false);
  };

  return (
    <NodeViewWrapper className={styles.codeBlockWrap}>
      <div className={styles.codeHeader}>
        <div className={styles.codeLeft} ref={menuRef}>
          <span className={styles.codeBadge}>CODE</span>

          {/* Dropdown Button */}
          <button
            type="button"
            className={styles.langTrigger}
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            title="Language"
          >
            {lang || "plaintext"} ▾
          </button>

          {open && (
            <div role="menu" className={styles.langMenu}>
              <button
                role="menuitem"
                className={styles.langItem}
                onClick={() => setLanguage("plaintext")}
                type="button"
              >
                Plain text
              </button>
              {SUPPORTED_LANGS.map((l: LangOption) => (
                <button
                  key={l.value}
                  role="menuitem"
                  className={styles.langItem}
                  onClick={() => setLanguage(l.value)}
                  type="button"
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NOTE: NodeViewContent harus "div" (default). Jangan pakai as="code". */}
      <pre className={styles.codePre} data-language={lang}>
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  );
}

const CodeBlockWithHeader = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: "plaintext",
}).extend({
  // Simpan bahasa ke HTML agar viewer bisa styling & highlight
  addAttributes() {
    return {
      language: {
        default: null as string | null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-language"),
        renderHTML: (attrs: { language?: string | null }) =>
          attrs.language ? { "data-language": attrs.language } : {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
});

export default CodeBlockWithHeader;
