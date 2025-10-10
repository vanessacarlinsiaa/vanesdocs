import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import styles from "./RichEditor.module.css";
import { uploadImageToSupabase } from "../lib/uploadImage";
import { uploadFileToSupabase } from "../lib/uploadFile";

type Props = {
  initialHTML: string;
  onChange: (html: string) => void;
};

const ZW = "\u2063";
const makeMarker = (id: string) => `${ZW}${id}${ZW}`;

function replaceParagraphContainingMarker(
  html: string,
  marker: string,
  replacementPHtml: string
) {
  const container = document.createElement("div");
  container.innerHTML = html;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let textNode: Text | null = null;
  while (walker.nextNode()) {
    const n = walker.currentNode as Text;
    if (n.nodeValue && n.nodeValue.includes(marker)) {
      textNode = n;
      break;
    }
  }
  if (!textNode) return html;

  let el: HTMLElement | null = textNode.parentElement;
  while (el && el.tagName !== "P") el = el.parentElement;
  if (!el) return html;

  const temp = document.createElement("div");
  temp.innerHTML = replacementPHtml.trim();
  const newP = temp.firstElementChild;
  if (!newP) return html;

  el.replaceWith(newP);
  return container.innerHTML;
}

export default function RichEditor({ initialHTML, onChange }: Props) {
  const hiddenImage = useRef<HTMLInputElement>(null);
  const hiddenDoc = useRef<HTMLInputElement>(null);
  const syncingRef = useRef(false);

  async function handleFilesToImage(files: File[] | FileList) {
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const file of imgs) {
      const url = await uploadImageToSupabase(file);
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }

  async function handleFilesToDocs(files: File[] | FileList) {
    const docs = Array.from(files).filter((f) => !f.type.startsWith("image/"));
    for (const file of docs) {
      const id = "t-" + Math.random().toString(36).slice(2);
      const marker = makeMarker(id);
      const pretty = file.name;

      editor
        ?.chain()
        .focus()
        .insertContent(`<p>📎 ${pretty} <em>(uploading…)</em>${marker}</p>`)
        .run();

      try {
        const { url, name } = await uploadFileToSupabase(file);

        const html = editor!.getHTML();
        const replacement = `<p><a data-vd-file="1" href="${url}" target="_blank" rel="noopener">📎 ${name}</a></p>`;
        const next = replaceParagraphContainingMarker(
          html,
          marker,
          replacement
        );

        syncingRef.current = true;
        editor!.commands.setContent(next, { emitUpdate: false });
        Promise.resolve().then(() => (syncingRef.current = false));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const html = editor!.getHTML();
        const replacement = `<p style="color:crimson">❌ Gagal upload: ${pretty} — ${msg}</p>`;
        const next = replaceParagraphContainingMarker(
          html,
          marker,
          replacement
        );

        syncingRef.current = true;
        editor!.commands.setContent(next, { emitUpdate: false });
        Promise.resolve().then(() => (syncingRef.current = false));
        console.error("[upload file] error", msg);
      }
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5] } }),
      Image.configure({
        inline: false,
        HTMLAttributes: { style: "max-width:100%;height:auto;" },
      }),
      Placeholder.configure({
        placeholder:
          "Tulis dokumen di sini… Ketik '/' untuk perintah (H1, bullet, image, file)…",
      }),
    ],
    content: initialHTML || "<p></p>",
    autofocus: "end",
    onUpdate: ({ editor }) => {
      if (syncingRef.current) return;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: styles.prose },
      handlePaste: (_v, e) => {
        const files = e.clipboardData?.files;
        if (!files || !files.length) return false;
        const imgs = Array.from(files).filter((f) =>
          f.type.startsWith("image/")
        );
        const docs = Array.from(files).filter(
          (f) => !f.type.startsWith("image/")
        );
        if (!imgs.length && !docs.length) return false;
        e.preventDefault();
        if (imgs.length) void handleFilesToImage(imgs);
        if (docs.length) void handleFilesToDocs(docs);
        return true;
      },
      handleDrop: (_v, e) => {
        const files = e.dataTransfer?.files;
        if (!files || !files.length) return false;
        const imgs = Array.from(files).filter((f) =>
          f.type.startsWith("image/")
        );
        const docs = Array.from(files).filter(
          (f) => !f.type.startsWith("image/")
        );
        if (!imgs.length && !docs.length) return false;
        e.preventDefault();
        if (imgs.length) void handleFilesToImage(imgs);
        if (docs.length) void handleFilesToDocs(docs);
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = initialHTML || "<p></p>";
    if (incoming !== current) {
      syncingRef.current = true;
      editor.commands.setContent(incoming, { emitUpdate: false });
      Promise.resolve().then(() => (syncingRef.current = false));
    }
  }, [initialHTML, editor]);

  function insertImageFromPicker() {
    const input = hiddenImage.current;
    if (!input) return;
    input.value = "";
    input.click();
  }
  async function onPickedImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length) {
      await handleFilesToImage(e.target.files);
      e.currentTarget.value = "";
    }
  }

  function insertDocFromPicker() {
    const input = hiddenDoc.current;
    if (!input) return;
    input.value = "";
    input.click();
  }
  async function onPickedDocs(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length) {
      try {
        await handleFilesToDocs(files);
      } finally {
        e.currentTarget.value = "";
      }
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? styles.active : ""}
          type="button"
        >
          B
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? styles.active : ""}
          type="button"
        >
          <i>I</i>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive("bulletList") ? styles.active : ""}
          type="button"
        >
          • List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive("orderedList") ? styles.active : ""}
          type="button"
        >
          1. List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={editor?.isActive("codeBlock") ? styles.active : ""}
          type="button"
        >
          {"< >"}
        </button>
        <button
          onClick={() => editor?.chain().focus().setHeading({ level: 1 }).run()}
          className={
            editor?.isActive("heading", { level: 1 }) ? styles.active : ""
          }
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor?.chain().focus().setHeading({ level: 2 }).run()}
          className={
            editor?.isActive("heading", { level: 2 }) ? styles.active : ""
          }
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().setHeading({ level: 3 }).run()}
          className={
            editor?.isActive("heading", { level: 3 }) ? styles.active : ""
          }
          type="button"
        >
          H3
        </button>
        <button
          onClick={() => editor?.chain().focus().setHeading({ level: 4 }).run()}
          className={
            editor?.isActive("heading", { level: 4 }) ? styles.active : ""
          }
          type="button"
        >
          H4
        </button>
        <button
          onClick={() => editor?.chain().focus().setHeading({ level: 5 }).run()}
          className={
            editor?.isActive("heading", { level: 5 }) ? styles.active : ""
          }
          type="button"
        >
          H5
        </button>
        <button onClick={insertImageFromPicker} type="button">
          🖼️ Image
        </button>
        <button onClick={insertDocFromPicker} type="button">
          📎 File
        </button>

        <input
          ref={hiddenImage}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={onPickedImages}
        />
        <input
          ref={hiddenDoc}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.md"
          multiple
          style={{ display: "none" }}
          onChange={onPickedDocs}
        />
      </div>

      <div className={styles.editorBox}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
