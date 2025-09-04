import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteDocDb, getDocDb, upsertDocDb } from "../lib/docsRepo";
import RichEditor from "../components/RichEditor";
import styles from "./Detail.module.css";

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

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

export default function AddEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(editing);
  const [err, setErr] = useState<string | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    setEditorReady(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    // kalau route /doc/new → jangan fetch apa2
    if (!editing || !id) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      try {
        setLoading(true);
        const d = await getDocDb(id);
        if (mounted && d) {
          setTitle(d.title);
          setTags(d.tags.join(", "));
          setContent(d.content);
        }
      } catch (e: unknown) {
        setErr(errorMessage(e) || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [editing, id]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const cleanTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const theId = editing && id ? id : genIdFromTitle(title || "untitled");

      await upsertDocDb({
        id: theId,
        title: title.trim() || "(Untitled)",
        tags: cleanTags,
        content,
      });
      navigate(`/doc/${theId}`);
    } catch (e: unknown) {
      setErr(errorMessage(e) || "Failed to save");
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocDb(id);
      navigate("/");
    } catch (e: unknown) {
      setErr(errorMessage(e) || "Failed to delete");
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.paper}>Loading…</div>
      </main>
    );
  }

  if (err) {
    return (
      <main className={styles.page}>
        <div className={styles.paper}>Error: {err}</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.paper}>
        <div className={styles.actions}>
          <Link to="/" className={`${styles.btn} ${styles.btnPink}`}>
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
            <span style={{ fontSize: 13, opacity: 0.8 }}>
              Document Contents
            </span>
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

          <div className={styles.actions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPink}`}>
              {editing ? "Save Changes" : "Save"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={onDelete}
                className={`${styles.btn} ${styles.btnDanger}`}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
