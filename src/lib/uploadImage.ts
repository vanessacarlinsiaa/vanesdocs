import { supa } from "./supa";

function getExt(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop() : "png";
}

export async function uploadImageToSupabase(file: File, userId?: string) {
  const folder = userId ?? "public";
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${getExt(file)}`;
  const path = `${folder}/${filename}`;

  const { error } = await supa.storage
    .from("vd-images")
    .upload(path, file, { upsert: false });
  if (error) throw error;

  const { data } = supa.storage.from("vd-images").getPublicUrl(path);
  return data.publicUrl;
}
