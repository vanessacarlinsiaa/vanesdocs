export function extractPreview(html: string, max = 160): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  const blocks = Array.from(
    div.querySelectorAll("p, li, blockquote, pre, h1, h2, h3")
  );
  const firstText =
    blocks
      .map((el) => (el.textContent || "").trim())
      .find((t) => t.length > 0) || (div.textContent || "").trim(); // fallback total text

  if (!firstText) return "";
  return firstText.length > max ? firstText.slice(0, max) + "…" : firstText;
}
