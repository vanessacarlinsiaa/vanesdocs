import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteDoc, getDocById, upsertDoc } from "../lib/docsStore";
import type { ImageItem } from "../lib/docsStore";
import RichEditor from "../components/RichEditor"; // pakai import biasa

function genIdFromTitle(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const suffix = Date.now().toString(36);
  return slug ? `${slug}-${suffix}` : `doc-${suffix}`;
}

export default function AddEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const editing = Boolean(id);
  const existing = useMemo(() => (id ? getDocById(id) : undefined), [id]);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [tags, setTags] = useState(existing ? existing.tags.join(", ") : "");
  const [content, setContent] = useState(existing?.content ?? "");
  const [images, setImages] = useState<ImageItem[]>(existing?.images ?? []);

  // render editor setelah mount → menghindari blank putih
  const [editorReady, setEditorReady] = useState(false);
  useEffect(() => {
    setEditorReady(true);
  }, []);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setTags(existing.tags.join(", "));
      setContent(existing.content);
      setImages(existing.images ?? []);
    } else if (!editing) {
      setTitle("");
      setTags("");
      setContent("");
      setImages([]);
    }
  }, [editing, id]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editing && id) {
      upsertDoc({
        id,
        title: title.trim() || "(Untitled)",
        tags: cleanTags,
        content,
        images,
      });
      navigate(`/doc/${id}`);
    } else {
      const newId = genIdFromTitle(title);
      upsertDoc({
        id: newId,
        title: title.trim() || "(Untitled)",
        tags: cleanTags,
        content,
        images,
      });
      navigate(`/doc/${newId}`);
    }
  }

  function onDelete() {
    if (!id) return;
    if (!confirm("Hapus dokumen ini?")) return;
    deleteDoc(id);
    navigate("/");
  }

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          to="/"
          style={{
            fontSize: 14,
            padding: "8px 14px",
            borderRadius: 6,
            background: "#fff0f6", // pink lembut
            color: "#555",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>
      </div>
      <h1 style={{ margin: "8px 0" }}>
        {editing ? "Edit Document" : "New Document"}
      </h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Input title..."
            required
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 8,
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>
            Tags (separate with commas)
          </span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Healthcheck, Dynatrace…"
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 8,
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>Document Contents</span>
          {!editorReady ? (
            <div
              style={{
                padding: 12,
                border: "1px solid #eee",
                borderRadius: 8,
                background: "#fff0f6",
                color: "#444",
              }}
            >
              Loading editor…
            </div>
          ) : (
            <RichEditor
              initialHTML={content}
              onChange={(html) => setContent(html)}
            />
          )}
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #fff3fa",
              background: "#fff3fa",
              color: "#555",
              cursor: "pointer",
            }}
          >
            {editing ? "Save Changes" : "Save"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={onDelete}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #fff3fa",
                background: "#fff3fa",
                color: "#e11",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
