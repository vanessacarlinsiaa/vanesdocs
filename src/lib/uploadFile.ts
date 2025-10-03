import { supa } from "./supa";

function ext(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1) : "bin";
}

export async function uploadFileToSupabase(file: File, userId?: string) {
  const folder = userId ?? "public";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext(
    file.name
  )}`;
  const path = `${folder}/${filename}`;

  const { error } = await supa.storage
    .from("vd-files")
    .upload(path, file, { upsert: false });
  if (error) throw error;

  const { data } = supa.storage.from("vd-files").getPublicUrl(path);
  return {
    url: data.publicUrl,
    name: file.name,
    mime: file.type || "application/octet-stream",
  };
}
