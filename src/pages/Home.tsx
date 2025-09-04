import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listDocs } from "../lib/docsRepo";
import { useAuth } from "../lib/auth";

type Doc = {
  id: string;
  title: string;
  tags: string[];
  content: string;
  updated_at: string;
};

export default function Home() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const user = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listDocs();
        if (mounted) setDocs(data);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <main style={{ padding: 16 }}>Loading…</main>;
  if (err) return <main style={{ padding: 16 }}>Error: {err}</main>;

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h2>Latest Documents</h2>
      {docs.length === 0 && <p>No documents yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {docs.map((doc) => (
          <li
            key={doc.id}
            style={{
              marginBottom: 16,
              borderBottom: "1px solid #eee",
              paddingBottom: 12,
            }}
          >
            <Link
              to={`/doc/${doc.id}`}
              style={{ fontSize: 18, fontWeight: 600, textDecoration: "none" }}
            >
              {doc.title}
            </Link>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {doc.tags.join(" • ")} • Updated{" "}
              {new Date(doc.updated_at).toLocaleDateString()}
            </div>
            {/* edit hanya muncul kalau login */}
            {user && (
              <Link
                to={`/doc/${doc.id}/edit`}
                style={{ fontSize: 12, color: "purple", marginLeft: 8 }}
              >
                Edit
              </Link>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
