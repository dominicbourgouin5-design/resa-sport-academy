// ═══════════════════════════════════════════════════════════
// Registre des colonnes pour l'export CSV par entité
// ═══════════════════════════════════════════════════════════

export type ColumnDef = {
  header: string;             // En-tête CSV
  key: string;                // Chemin dans l'objet (ex: 'school.name')
  format?: (val: any, row: any) => string; // Formatage optionnel
};

function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch { return ''; }
}

function fmtDateTime(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hh}:${mm}`;
  } catch { return ''; }
}

function getPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, k) => acc?.[k], obj);
}

export type EntityExportConfig = {
  table: string;
  label: string;
  orderBy?: { column: string; ascending?: boolean };
  dateColumn?: string; // Par défaut 'created_at'
  select?: string;     // Colonnes Supabase (avec relations)
  columns: ColumnDef[];
};

export const EXPORT_CONFIG: Record<string, EntityExportConfig> = {

  // ═══════════════════════════════════════════════════════════
  // MATCHS
  // ═══════════════════════════════════════════════════════════
  matchs: {
    table: 'matches',
    label: 'Matchs',
    dateColumn: 'match_date',
    orderBy: { column: 'match_date', ascending: false },
    select: `
      *,
      category:categories(code),
      home_team:teams!matches_home_team_id_fkey(name, school:schools(name)),
      away_team:teams!matches_away_team_id_fkey(name, school:schools(name))
    `,
    columns: [
      { header: 'Date match', key: 'match_date', format: (v) => fmtDate(v) },
      { header: 'Catégorie', key: 'category.code' },
      { header: 'Phase', key: 'phase' },
      { header: 'Statut', key: 'status' },
      { header: 'Équipe domicile', key: 'home_team.name' },
      { header: 'École domicile', key: 'home_team.school.name' },
      { header: 'Équipe extérieur', key: 'away_team.name' },
      { header: 'École extérieur', key: 'away_team.school.name' },
      { header: 'Score domicile', key: 'home_score' },
      { header: 'Score extérieur', key: 'away_score' },
      { header: 'Lieu', key: 'venue' },
      { header: 'Groupe', key: 'group_name' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // JOUEURS
  // ═══════════════════════════════════════════════════════════
  joueurs: {
    table: 'players',
    label: 'Joueurs',
    orderBy: { column: 'created_at', ascending: false },
    select: `
      *,
      team:teams(name, school:schools(name), category:categories(code))
    `,
    columns: [
      { header: 'Prénom', key: 'first_name' },
      { header: 'Initiale', key: 'last_initial' },
      { header: 'Numéro', key: 'jersey_number' },
      { header: 'Poste', key: 'position' },
      { header: 'Équipe', key: 'team.name' },
      { header: 'École', key: 'team.school.name' },
      { header: 'Catégorie', key: 'team.category.code' },
      { header: 'Créé le', key: 'created_at', format: (v) => fmtDateTime(v) }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // ÉCOLES
  // ═══════════════════════════════════════════════════════════
  ecoles: {
    table: 'schools',
    label: 'Écoles',
    orderBy: { column: 'name', ascending: true },
    columns: [
      { header: 'Nom', key: 'name' },
      { header: 'Slug', key: 'slug' },
      { header: 'Ville', key: 'city' },
      { header: 'Adresse', key: 'address' },
      { header: 'Contact', key: 'contact_name' },
      { header: 'Email contact', key: 'contact_email' },
      { header: 'Téléphone', key: 'contact_phone' },
      { header: 'Active', key: 'is_active', format: (v) => v ? 'Oui' : 'Non' },
      { header: 'Créé le', key: 'created_at', format: (v) => fmtDateTime(v) }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // ÉQUIPES
  // ═══════════════════════════════════════════════════════════
  equipes: {
    table: 'teams',
    label: 'Équipes',
    orderBy: { column: 'created_at', ascending: false },
    select: `
      *,
      school:schools(name),
      category:categories(code),
      season:seasons(name)
    `,
    columns: [
      { header: 'Nom', key: 'name' },
      { header: 'École', key: 'school.name' },
      { header: 'Catégorie', key: 'category.code' },
      { header: 'Saison', key: 'season.name' },
      { header: 'Active', key: 'is_active', format: (v) => v ? 'Oui' : 'Non' },
      { header: 'Créée le', key: 'created_at', format: (v) => fmtDateTime(v) }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // INSCRIPTIONS (ligue)
  // ═══════════════════════════════════════════════════════════
  inscriptions: {
    table: 'registrations',
    label: 'Inscriptions',
    orderBy: { column: 'created_at', ascending: false },
    select: `*, school:schools(name)`,
    columns: [
      { header: 'Date', key: 'created_at', format: (v) => fmtDateTime(v) },
      { header: 'Type', key: 'type' },
      { header: 'Statut', key: 'status' },
      { header: 'Nom contact', key: 'contact_name' },
      { header: 'Email', key: 'contact_email' },
      { header: 'Téléphone', key: 'contact_phone' },
      { header: 'École', key: 'school.name' },
      { header: 'Nom enfant', key: 'child_name' },
      { header: 'Âge enfant', key: 'child_age' },
      { header: 'Message', key: 'message' },
      { header: 'Notes admin', key: 'admin_notes' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // ACTUALITÉS
  // ═══════════════════════════════════════════════════════════
  actualites: {
    table: 'news',
    label: 'Actualités',
    dateColumn: 'published_at',
    orderBy: { column: 'published_at', ascending: false },
    columns: [
      { header: 'Titre FR', key: 'title_fr' },
      { header: 'Titre EN', key: 'title_en' },
      { header: 'Slug', key: 'slug' },
      { header: 'Type histoire', key: 'story_type' },
      { header: 'Publié', key: 'is_published', format: (v) => v ? 'Oui' : 'Non' },
      { header: 'Date publication', key: 'published_at', format: (v) => fmtDateTime(v) },
      { header: 'Auteur', key: 'author_name' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // SPONSORS
  // ═══════════════════════════════════════════════════════════
  sponsors: {
    table: 'sponsors',
    label: 'Sponsors',
    orderBy: { column: 'sort_order', ascending: true },
    columns: [
      { header: 'Nom', key: 'name' },
      { header: 'Slug', key: 'slug' },
      { header: 'Niveau', key: 'tier' },
      { header: 'Site web', key: 'website_url' },
      { header: 'Email', key: 'contact_email' },
      { header: 'Téléphone', key: 'contact_phone' },
      { header: 'Actif', key: 'is_active', format: (v) => v ? 'Oui' : 'Non' },
      { header: 'Ordre', key: 'sort_order' }
    ]
  }
};

// Utilitaires exportés
export function csvCell(v: any): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function csvRow(values: any[]): string {
  return values.map(csvCell).join(';');
}

export function buildCsv(
  config: EntityExportConfig,
  rows: any[]
): string {
  const headers = config.columns.map((c) => c.header);
  const lines: string[] = [csvRow(headers)];

  for (const row of rows) {
    const cells = config.columns.map((c) => {
      const raw = getPath(row, c.key);
      return c.format ? c.format(raw, row) : raw;
    });
    lines.push(csvRow(cells));
  }

  // BOM UTF-8 (Excel FR)
  return '\uFEFF' + lines.join('\r\n');
}

export { fmtDate, fmtDateTime, getPath };