"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadSingleKudosImage(
  userId: string,
  file: File,
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createClient();
  const extensionSafeName = sanitizeFileName(file.name);
  const objectPath = `${userId}/${crypto.randomUUID()}-${extensionSafeName}`;

  const { error } = await supabase.storage
    .from("kudos-images")
    .upload(objectPath, file, { upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("kudos-images").getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function uploadKudosImages(
  userId: string,
  files: File[],
): Promise<string[]> {
  const uploaded = await Promise.all(files.map((file) => uploadSingleKudosImage(userId, file)));
  return uploaded.filter((url): url is string => Boolean(url));
}
