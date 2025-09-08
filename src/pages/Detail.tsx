import { Link, useNavigate, useParams } from "react-router-dom";
import { getDocDb, deleteDocDb, type DocRow } from "../lib/docsRepo";
import styles from "./Detail.module.css";
import { useEffect, useState } from "react";
import AuthOnly from "../components/AuthOnly";
import { sha256 } from "../lib/hash";

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [unlocked, setUnlockedState] = useState(false);
  const [tryPass, setTryPass] = useState("");
  const [unlockErr, setUnlockErr] = useState<string | null>(null);

  const isUnlocked = (id: string) =>
    sessionStorage.getItem(`unlock:${id}`) === "1";
  const markUnlocked = (id: string) =>
    sessionStorage.setItem(`unlock:${id}`, "1");

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getDocDb(id);
        if (mounted && data) {
          setDoc(data);
          if (isUnlocked(data.id)) setUnlockedState(true);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Delete this document?")) return;
    await deleteDocDb(id);
    navigate("/");
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!doc?.lockHash) return;
    const hash = await sha256(tryPass);
    if (hash === doc.lockHash) {
      setUnlockedState(true);
      markUnlocked(doc.id);
      setTryPass("");
      setUnlockErr(null);
    } else {
      setUnlockErr("Wrong Password, Please try again.");
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.paper}>Loading…</div>
      </main>
    );
  }

  if (err || !doc) {
    return (
      <main className={styles.page}>
        <div className={styles.paper}>
          <p>Document not found.</p>
          <Link to="/" className={`${styles.btn} ${styles.btnPink}`}>
            ← Back to list
          </Link>
        </div>
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

          {/* Edit/Delete hanya muncul kalau login DAN dokumen sudah unlock */}
          <AuthOnly>
            {(!doc.locked || unlocked) && (
              <>
                <Link
                  to={`/doc/${doc.id}/edit`}
                  className={`${styles.btn} ${styles.btnPink}`}
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className={`${styles.btn} ${styles.btnDanger}`}
                >
                  Delete
                </button>
              </>
            )}
          </AuthOnly>
        </div>

        <h1 style={{ margin: "8px 0 4px" }}>
          {doc.title} {doc.locked && "🔒"}
        </h1>
        <div className={styles.meta}>
          {doc.tags.join(" • ")} • Updated{" "}
          {new Date(doc.updated_at).toLocaleDateString()}
        </div>

        {/* Kalau dokumen locked dan belum unlock → tampilkan form unlock */}
        {doc.locked && !unlocked ? (
          <div style={{ marginTop: 20 }}>
            <h2>🔒 This document is locked</h2>
            <form
              onSubmit={handleUnlock}
              style={{ display: "grid", gap: 8, maxWidth: 320 }}
            >
              <input
                type="password"
                placeholder="Enter password"
                value={tryPass}
                onChange={(e) => setTryPass(e.target.value)}
                className={styles.input}
                autoFocus
                required
              />
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPink}`}
              >
                Unlock
              </button>
              {unlockErr && <div style={{ color: "crimson" }}>{unlockErr}</div>}
            </form>
          </div>
        ) : (
          <article
            style={{ lineHeight: 1.7, marginTop: 16 }}
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        )}
      </div>
    </main>
  );
}
