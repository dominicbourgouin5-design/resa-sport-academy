export type RegionCode = 'usa' | 'africa';
export type LocaleCode = 'fr' | 'en';

export type Region = {
  code: RegionCode;
  label: string;
  flag: string;
  shortLabel: string;
};

export const REGIONS: Region[] = [
  { code: 'africa', label: "Côte d'Ivoire · Africa", shortLabel: 'Africa', flag: '🇨🇮' },
  { code: 'usa',    label: 'United States',          shortLabel: 'USA',    flag: '🇺🇸' }
];

export const DEFAULT_REGION: RegionCode = 'africa';

// ─── Langue par défaut selon la région ──────────────────────
export const LOCALE_BY_REGION: Record<RegionCode, LocaleCode> = {
  africa: 'fr',
  usa: 'en'
};

export function getRegion(code: string | undefined | null): Region {
  return REGIONS.find((r) => r.code === code) ?? REGIONS[0];
}