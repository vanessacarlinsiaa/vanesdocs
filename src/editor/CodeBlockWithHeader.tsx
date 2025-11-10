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
  const [dropUp, setDropUp] = useState(false);
  const [menuLeft, setMenuLeft] = useState(0);
  const menuRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const recomputeMenuPos = () => {
    if (!triggerRef.current || !headerRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const h = headerRef.current.getBoundingClientRect();

    setMenuLeft(t.left - h.left);

    const spaceBelow = window.innerHeight - t.bottom;
    const estimatedMenu = 280;
    setDropUp(spaceBelow < estimatedMenu);
  };

  useEffect(() => {
    if (!open) return;
    recomputeMenuPos();
    const onReflow = () => recomputeMenuPos();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setLanguage = (value: string) => {
    props.updateAttributes({ language: value });
    props.editor.commands.focus();
    setOpen(false);
  };

  const wrapClass = `${styles.codeBlockWrap} ${
    open ? styles.codeBlockWrapOpen : ""
  }`;

  return (
    <NodeViewWrapper className={wrapClass}>
      <div className={styles.codeHeader} ref={headerRef}>
        <div className={styles.codeLeft} ref={menuRef}>
          <span className={styles.codeBadge}>CODE</span>

          <button
            ref={triggerRef}
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
            <div
              role="menu"
              className={`${styles.langMenu} ${
                dropUp ? styles.langMenuDropUp : ""
              }`}
              style={{ left: menuLeft }}
            >
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
