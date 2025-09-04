import { Link, useNavigate, useParams } from "react-router-dom";
import { getDocDb, deleteDocDb, type DocRow } from "../lib/docsRepo";
import styles from "./Detail.module.css";
import { useEffect, useState } from "react";
import AuthOnly from "../components/AuthOnly";

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getDocDb(id);
        if (mounted) setDoc(data);
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

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Delete this document?")) return;
    await deleteDocDb(id);
    navigate("/");
  }

  return (
    <main className={styles.page}>
      <div className={styles.paper}>
        <div className={styles.actions}>
          <Link to="/" className={`${styles.btn} ${styles.btnPink}`}>
            ← Back
          </Link>

          <AuthOnly>
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
          </AuthOnly>
        </div>

        <h1 style={{ margin: "8px 0 4px" }}>{doc.title}</h1>
        <div className={styles.meta}>
          {doc.tags.join(" • ")} • Updated{" "}
          {new Date(doc.updated_at).toLocaleDateString()}
        </div>

        <article
          style={{ lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: doc.content }}
        />
      </div>
    </main>
  );
}
