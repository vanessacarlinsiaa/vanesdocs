import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteDocDb, getDocDb, upsertDocDb } from "../lib/docsRepo";
import RichEditor from "../components/RichEditor";
import styles from "./Detail.module.css";
import { sha256 } from "../lib/hash";

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

type LoadedDoc = {
  id: string;
  title: string;
  tags: string[];
  content: string;
  locked?: boolean;
  lockHash?: string;
};

export default function AddEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [loadedDoc, setLoadedDoc] = useState<LoadedDoc | null>(null);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(editing);
  const [err, setErr] = useState<string | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  const [locked, setLocked] = useState(false);
  const [lockPass, setLockPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);

  useEffect(() => {
    setEditorReady(true);
  }, []);

  useEffect(() => {
    let mounted = true;

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
          setLoadedDoc(d as LoadedDoc);
          setTitle(d.title);
          setTags(d.tags.join(", "));
          setContent(d.content);
          setLocked(Boolean(d.locked));

          setLockPass("");
          setConfirmPass("");
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
    setFormErr(null);

    try {
      const cleanTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const theId = editing && id ? id : genIdFromTitle(title || "untitled");

      let lockHash: string | undefined = undefined;

      if (locked) {
        const isNewlyLocked = !editing || !loadedDoc?.locked;
        if (isNewlyLocked) {
          if (!lockPass || !confirmPass) {
            setFormErr("Please enter and confirm the password.");
            return;
          }
          if (lockPass !== confirmPass) {
            setFormErr("Passwords do not match.");
            return;
          }
          lockHash = await sha256(lockPass);
        } else {
          if (lockPass || confirmPass) {
            if (lockPass !== confirmPass) {
              setFormErr("Passwords do not match.");
              return;
            }
            lockHash = await sha256(lockPass);
          } else {
            lockHash = loadedDoc?.lockHash;
          }
        }
      } else {
        lockHash = undefined;
      }

      await upsertDocDb({
        id: theId,
        title: title.trim() || "(Untitled)",
        tags: cleanTags,
        content,
        locked,
        lockHash,
        lockedAt: locked ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      });

      setLockPass("");
      setConfirmPass("");

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

  const requirePass = locked && (!editing || !loadedDoc?.locked);

  return (
    <main className={styles.page}>
      <div className={styles.paper}>
        <div className={styles.actions}>
          <Link to="/" className={`${styles.btn} ${styles.btnPink}`}>
            ← Back
          </Link>
        </div>

        <h1 className={styles.title}>
          {editing ? "Edit Document" : "New Document"}
        </h1>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Input title..."
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span>Tags (separate with commas)</span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Healthcheck, Dynatrace…"
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span>Document Contents</span>
            {!editorReady ? (
              <div className={styles.editorLoading}>Loading editor…</div>
            ) : (
              <RichEditor
                key={id || "new"}
                initialHTML={loadedDoc?.content || ""}
                onChange={(html) => setContent(html)}
              />
            )}
          </label>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
            <label
              className={styles.label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <input
                type="checkbox"
                checked={locked}
                onChange={(e) => {
                  setLocked(e.target.checked);
                  setFormErr(null);
                }}
              />
              <span>Lock with password</span>
            </label>

            {locked && (
              <div
                style={{ display: "grid", gap: 8, marginTop: 8, maxWidth: 420 }}
              >
                <input
                  type="password"
                  placeholder="Enter password / PIN"
                  value={lockPass}
                  onChange={(e) => setLockPass(e.target.value)}
                  className={styles.input}
                  required={requirePass}
                />
                <input
                  type="password"
                  placeholder="Confirm password / PIN"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className={styles.input}
                  required={requirePass}
                />
                {formErr && (
                  <small style={{ color: "crimson" }}>{formErr}</small>
                )}
                <small style={{ opacity: 0.7 }}>
                  We only store the <i>hash</i> of your password, not the
                  password itself.
                </small>
              </div>
            )}
          </div>

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
