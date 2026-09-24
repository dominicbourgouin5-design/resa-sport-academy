import { cookies } from 'next/headers';

const COOKIE_REGION = 'resa_region';

export type ServerRegion = 'africa' | 'usa';

/**
 * Lit la région actuelle depuis le cookie.
 * Retourne null si aucun cookie → pas de filtrage (visiteur neutre).
 */
export async function getCurrentRegion(): Promise<ServerRegion | null> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(COOKIE_REGION)?.value;
    if (value === 'africa' || value === 'usa') return value;
    return null;
  } catch {
    return null;
  }
}

/**
 * Construit le filtre Supabase pour filtrer par région.
 * Retourne null si pas de filtre à appliquer.
 */
export function buildRegionFilter(region: ServerRegion | null): string | null {
  if (!region) return null;
  return `region.eq.${region},region.eq.both`;
}