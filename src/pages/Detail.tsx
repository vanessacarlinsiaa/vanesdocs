import { Link, useNavigate, useParams } from "react-router-dom";
import { getDocById, deleteDoc } from "../lib/docsStore";
import styles from "./Detail.module.css";

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = id ? getDocById(id) : undefined;

  if (!doc) {
    return (
      <main className={styles.page}>
        <div className={styles.paper}>
          <p>Dokumen tidak ditemukan.</p>
          <Link to="/" className={`${styles.btn} ${styles.btnPink}`}>
            ← Kembali ke daftar
          </Link>
        </div>
      </main>
    );
  }

  function handleDelete() {
    if (!id) return;
    if (!confirm("Hapus dokumen ini?")) return;
    deleteDoc(id);
    navigate("/");
  }

  return (
    <main className={styles.page}>
      <div className={styles.paper}>
        {/* Actions */}
        <div className={styles.actions}>
          <Link to="/" className={`${styles.btn} ${styles.btnPink}`}>
            ← Back
          </Link>
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
        </div>

        {/* Title & meta */}
        <h1 style={{ margin: "8px 0 4px" }}>{doc.title}</h1>
        <div className={styles.meta}>
          {doc.tags.join(" • ")} • Updated{" "}
          {new Date(doc.updatedAt).toLocaleDateString()}
        </div>

        {/* Content */}
        <article
          style={{ lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: doc.content }}
        />

        {/* Optional gallery */}
        {doc.images?.length ? (
          <section className={styles.gallery}>
            {doc.images.map((img) => (
              <figure key={img.id} style={{ margin: 0 }}>
                <img
                  src={img.dataUrl}
                  alt={img.caption || img.name}
                  className={styles.img}
                />
                {(img.caption || img.name) && (
                  <figcaption className={styles.caption}>
                    {img.caption || img.name}
                  </figcaption>
                )}
              </figure>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
