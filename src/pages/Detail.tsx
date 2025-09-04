import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getDocDb, deleteDocDb } from "../lib/docsRepo";
import { useAuth } from "../lib/auth";
import styles from "./Detail.module.css";

type Doc = {
  id: string;
  title: string;
  tags: string[];
  content: string;
  updated_at: string;
};

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuth();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getDocDb(id);
        if (mounted) setDoc(data ?? null);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
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
    try {
      await deleteDocDb(id);
      navigate("/");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <main style={{ padding: 16 }}>Loading…</main>;
  if (err) return <main style={{ padding: 16 }}>Error: {err}</main>;
  if (!doc) return <main style={{ padding: 16 }}>Document not found.</main>;

  return (
    <main className={styles.page}>
      <div className={styles.paper}>
        <div className={styles.actions}>
          <Link to="/" className={`${styles.btn} ${styles.btnPink}`}>
            ← Back
          </Link>
          {user && (
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
        </div>

        <h1 style={{ margin: "8px 0" }}>{doc.title}</h1>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
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
