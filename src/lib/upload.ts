import { createClient } from './supabase/client';

export type UploadFolder =
  | 'covers'         // Images de couverture d'articles
  | 'logos/schools'  // Logos d'écoles
  | 'logos/teams'    // Logos d'équipes
  | 'players';       // Photos de joueurs

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function uploadImage(
  file: File,
  folder: UploadFolder
): Promise<{ url: string; path: string }> {
  // Validations
  if (!ACCEPTED.includes(file.type)) {
    throw new Error('Format non supporté. Utilisez JPG, PNG, WebP ou AVIF.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Fichier trop volumineux (5 Mo maximum).');
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder}/${name}`;

  const { error } = await supabase.storage
    .from('resa-media')
    .upload(path, file, {
      cacheControl: '31536000', // 1 an
      upsert: false
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('resa-media').getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteImage(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from('resa-media').remove([path]);
  if (error) throw new Error(error.message);
}

/** Extrait le path d'une URL publique Supabase Storage */
export function getPathFromUrl(url: string): string | null {
  const marker = '/resa-media/';
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : null;
}