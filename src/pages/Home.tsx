import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import { listDocs, type DocRow } from "../lib/docsRepo";
import { extractPreview } from "../lib/extractPreview";
import AuthOnly from "../components/AuthOnly";

export default function Home() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";

  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listDocs();
        if (mounted) setDocs(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg || "Failed to load documents");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return docs;
    const withSearchText = docs.map((d) => ({
      ...d,
      searchText: (
        new DOMParser().parseFromString(d.content, "text/html").body
          .textContent || ""
      ).trim(),
    }));
    const fuse = new Fuse(withSearchText, {
      keys: ["title", "tags", "searchText"],
      threshold: 0.3,
      ignoreLocation: true,
    });
    return fuse.search(q).map((r) => r.item);
  }, [q, docs]);

  if (loading) return <main style={{ padding: 16 }}>Loading…</main>;
  if (err) return <main style={{ padding: 16 }}>Error: {err}</main>;

  return (
    <main style={{ padding: "16px", maxWidth: 900, margin: "0 auto" }}>
      {q ? (
        <p style={{ margin: "6px 0 12px" }}>
          Result for: <strong>{q}</strong> • {results.length} document
        </p>
      ) : (
        <p
          style={{
            margin: "6px 0 12px",
            opacity: 0.8,
            fontSize: "30px",
            fontWeight: "800",
          }}
        >
          Newest Document
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {results.map((d) => (
          <li
            key={d.id}
            style={{ padding: "14px 0", borderBottom: "1px solid #eee" }}
          >
            <Link
              to={`/doc/${d.id}`}
              style={{
                fontWeight: 700,
                fontSize: "18px",
                textDecoration: "none",
                color: "#111",
              }}
            >
              {d.title}
            </Link>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 6 }}>
              {d.tags.join(" • ")} • Updated{" "}
              {new Date(d.updated_at).toLocaleDateString()}
              <AuthOnly>
                {" • "}
                <Link to={`/doc/${d.id}/edit`} style={{ fontSize: 12 }}>
                  Edit
                </Link>
              </AuthOnly>
            </div>
            <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
              {extractPreview(d.content, 160)}
            </p>
          </li>
        ))}
        {results.length === 0 && (
          <li style={{ padding: "16px 0" }}>Document not found.</li>
        )}
      </ul>
    </main>
  );
}
