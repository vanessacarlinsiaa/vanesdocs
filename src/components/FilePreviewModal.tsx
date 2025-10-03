import { useEffect, useMemo } from "react";
import styles from "./FilePreviewModal.module.css";

type Props = {
  open: boolean;
  url: string | null;
  name?: string | null;
  mime?: string | null;
  onClose: () => void;
};

function hasExt(url: string, exts: string[]) {
  return new RegExp(`\\.(${exts.join("|")})(\\?.*)?$`, "i").test(url);
}

const isImage = (url: string, mime?: string | null) =>
  (!!mime && mime.startsWith("image/")) ||
  hasExt(url, ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]);

const isPdf = (url: string, mime?: string | null) =>
  mime === "application/pdf" || hasExt(url, ["pdf"]);

const isOffice = (url: string) =>
  hasExt(url, ["doc", "docx", "xls", "xlsx", "ppt", "pptx"]);

export default function FilePreviewModal({
  open,
  url,
  name,
  mime,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const viewerSrc = useMemo(() => {
    if (!url) return null;

    if (isPdf(url, mime)) {
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
        url
      )}`;
    }

    if (isOffice(url)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
    }

    if (isImage(url, mime)) return null;

    return undefined;
  }, [url, mime]);

  if (!open || !url) return null;

  const fileName = name || url.split("/").pop() || "file";
  const canImage = viewerSrc === null && isImage(url, mime);
  const canIframe = typeof viewerSrc === "string";

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.title} title={fileName}>
            📎 {fileName}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className={styles.body}>
          {canImage && (
            <img src={url} alt={fileName} className={styles.previewImage} />
          )}

          {canIframe && (
            <iframe
              src={viewerSrc!}
              className={styles.previewFrame}
              title={fileName}
            />
          )}

          {!canImage && viewerSrc === undefined && (
            <div className={styles.fallbackBox}>
              <div className={styles.fileIcon}>📄</div>
              <div className={styles.fallbackText}>
                Preview tidak didukung untuk file ini.
              </div>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <a className={styles.primaryBtn} href={url} download={fileName}>
            ⬇️ Download
          </a>
          <a
            className={styles.secondaryBtn}
            href={url}
            target="_blank"
            rel="noopener"
          >
            Buka di tab baru
          </a>
        </footer>
      </div>
    </div>
  );
}
