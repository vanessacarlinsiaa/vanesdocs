import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import styles from "./RichEditor.module.css";
import { uploadImageToSupabase } from "../lib/uploadImage";

type Props = {
  initialHTML: string;
  onChange: (html: string) => void;
};

export default function RichEditor({ initialHTML, onChange }: Props) {
  const [slashOpen, setSlashOpen] = useState(false);
  const hiddenFile = useRef<HTMLInputElement>(null);
  const syncingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({
        inline: false,
        HTMLAttributes: { style: "max-width:100%;height:auto;" },
      }),
      Placeholder.configure({
        placeholder:
          "Tulis dokumen di sini… Ketik '/' untuk perintah (H1, bullet, image)…",
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
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files;
        if (!files || !files.length) return false;
        const images = Array.from(files).filter((f) =>
          f.type.startsWith("image/")
        );
        if (!images.length) return false;
        event.preventDefault();
        void handleFilesToImage(images);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || !files.length) return false;
        const images = Array.from(files).filter((f) =>
          f.type.startsWith("image/")
        );
        if (!images.length) return false;
        event.preventDefault();
        void handleFilesToImage(images);
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
      Promise.resolve().then(() => {
        syncingRef.current = false;
      });
    }
  }, [initialHTML, editor]);

  async function handleFilesToImage(files: File[] | FileList) {
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const file of imgs) {
      const url = await uploadImageToSupabase(file);
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }

  function insertImageFromPicker() {
    const input = hiddenFile.current;
    if (!input) return;
    input.value = "";
    input.click();
  }

  async function onPickedFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length) {
      await handleFilesToImage(e.target.files);
      setSlashOpen(false);
    }
  }

  function runThenClose(fn: () => void) {
    fn();
    setSlashOpen(false);
    editor?.chain().focus().run();
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
        <button onClick={insertImageFromPicker} type="button">
          🖼️ Image
        </button>
        <input
          ref={hiddenFile}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={onPickedFiles}
        />
      </div>

      <div className={styles.editorBox}>
        <EditorContent editor={editor} />

        {slashOpen && (
          <div
            className={styles.slashMenu}
            onMouseLeave={() => setSlashOpen(false)}
          >
            <div
              className={styles.item}
              onClick={() =>
                runThenClose(() => editor?.chain().focus().setParagraph().run())
              }
            >
              Paragraph
            </div>
            <div
              className={styles.item}
              onClick={() =>
                runThenClose(() =>
                  editor?.chain().focus().setHeading({ level: 1 }).run()
                )
              }
            >
              H1
            </div>
            <div
              className={styles.item}
              onClick={() =>
                runThenClose(() =>
                  editor?.chain().focus().setHeading({ level: 2 }).run()
                )
              }
            >
              H2
            </div>
            <div
              className={styles.item}
              onClick={() =>
                runThenClose(() =>
                  editor?.chain().focus().toggleBulletList().run()
                )
              }
            >
              Bullet List
            </div>
            <div
              className={styles.item}
              onClick={() =>
                runThenClose(() =>
                  editor?.chain().focus().toggleOrderedList().run()
                )
              }
            >
              Numbered List
            </div>
            <div className={styles.item} onClick={insertImageFromPicker}>
              Insert Image…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
