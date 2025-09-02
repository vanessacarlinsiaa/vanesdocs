import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import { getAllDocs } from "../lib/docsStore";
import { extractPreview } from "../lib/extractPreview";

export default function Home() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const all = getAllDocs(); // baca setiap render; cukup untuk SPA kecil

  const results = useMemo(() => {
    if (!q.trim()) return all;
    const fuse = new Fuse(all, {
      keys: ["title", "tags", "content"],
      threshold: 0.3,
      ignoreLocation: true,
    });
    return fuse.search(q).map((r) => r.item);
  }, [q, all]);

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
            fontSize: "40px",
            fontWeight: "900",
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
              style={{ fontWeight: 700, textDecoration: "none", color: "#111" }}
            >
              {d.title}
            </Link>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              {d.tags.join(" • ")} • Updated{" "}
              {new Date(d.updatedAt).toLocaleDateString()}
              {"  "}•{" "}
              <Link to={`/doc/${d.id}/edit`} style={{ fontSize: 12 }}>
                Edit
              </Link>
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
