import { supa } from "./supa";

export type DocRow = {
  id: string;
  title: string;
  tags: string[];
  content: string;
  created_at: string;
  updated_at: string;
};

export async function listDocs(): Promise<DocRow[]> {
  const { data, error } = await supa
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getDocDb(id: string): Promise<DocRow | null> {
  const { data, error } = await supa
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDocDb(d: {
  id: string;
  title: string;
  tags: string[];
  content: string;
}) {
  const { error } = await supa.from("documents").upsert({
    id: d.id,
    title: d.title,
    tags: d.tags,
    content: d.content,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteDocDb(id: string) {
  const { error } = await supa.from("documents").delete().eq("id", id);
  if (error) throw error;
}
