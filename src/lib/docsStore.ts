// src/lib/docsStore.ts
export type ImageItem = {
  id: string;
  name: string;
  dataUrl: string; // base64
  caption?: string;
};

export type Doc = {
  id: string;
  title: string;
  tags: string[];
  content: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  images?: ImageItem[];
};

const KEY = "vanesdocs_docs";

// --- seed awal dari sample (jalan sekali) ---
import { docs as sampleDocs } from "../data/docs.sample";

function readRaw(): Doc[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Doc[];
  } catch {
    return [];
  }
}

function writeRaw(list: Doc[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function ensureSeed() {
  const current = readRaw();
  if (current.length === 0) {
    writeRaw(sampleDocs);
  }
}

export function getAllDocs(): Doc[] {
  ensureSeed();
  return readRaw().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getDocById(id: string): Doc | undefined {
  ensureSeed();
  return readRaw().find((d) => d.id === id);
}

export function upsertDoc(
  input: Omit<Doc, "createdAt" | "updatedAt"> & Partial<Doc>
) {
  const list = readRaw();
  const now = new Date().toISOString();

  const idx = list.findIndex((d) => d.id === input.id);
  if (idx >= 0) {
    const createdAt = list[idx].createdAt;
    list[idx] = {
      ...list[idx],
      ...input,
      tags: Array.isArray(input.tags) ? input.tags : list[idx].tags,
      images: Array.isArray(input.images) ? input.images : list[idx].images,
      updatedAt: now,
      createdAt,
    };
  } else {
    const newDoc: Doc = {
      id: input.id!,
      title: input.title ?? "(Untitled)",
      tags: input.tags ?? [],
      content: input.content ?? "",
      images: input.images ?? [],
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newDoc);
  }
  writeRaw(list);
}

export function deleteDoc(id: string) {
  const list = readRaw().filter((d) => d.id !== id);
  writeRaw(list);
}
