import { supa } from "./supa";

export type DocRow = {
  id: string;
  title: string;
  tags: string[];
  content: string;
  created_at: string;
  updated_at: string;

  locked?: boolean;
  lockHash?: string;
  lockedAt?: string | null;
};

export type DocUpsert = Omit<DocRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export async function listDocs(): Promise<DocRow[]> {
  const { data, error } = await supa
    .from("documents")
    .select(
      "id,title,tags,content,created_at,updated_at,locked,lockHash,lockedAt"
    )
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data as DocRow[]) ?? [];
}

export async function getDocDb(id: string): Promise<DocRow | null> {
  const { data, error } = await supa
    .from("documents")
    .select(
      "id,title,tags,content,created_at,updated_at,locked,lockHash,lockedAt"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as DocRow) ?? null;
}

export async function upsertDocDb(row: DocUpsert): Promise<void> {
  const now = new Date().toISOString();

  const payload: DocUpsert = {
    ...row,
    created_at: row.created_at ?? now,
    updated_at: row.updated_at ?? now,
  };

  const { error } = await supa.from("documents").upsert(payload);
  if (error) throw new Error(error.message);
}

export async function deleteDocDb(id: string): Promise<void> {
  const { error } = await supa.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
