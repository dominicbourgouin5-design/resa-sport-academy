import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase avec la clé service_role.
 * ⚠️ À n'utiliser QUE côté serveur (Server Actions, API Routes).
 * ⚠️ Ne JAMAIS importer ce fichier dans un composant client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante'
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}