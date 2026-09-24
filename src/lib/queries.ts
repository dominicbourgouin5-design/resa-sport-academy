import { createClient } from './supabase/server';
import { getCurrentRegion, buildRegionFilter } from './regions-server';

// ─── Saison active ──────────────────────────────────────────
export async function getActiveSeason() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single();
  return data;
}

// ─── Catégories ─────────────────────────────────────────────
export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  return data ?? [];
}

// ─── Écoles ─────────────────────────────────────────────────
export async function getSchools() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('schools')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return data ?? [];
}

export async function getSchoolBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('schools')
    .select(`
      *,
      teams:teams(
        *,
        category:categories(*)
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}

// ─── Matchs ─────────────────────────────────────────────────
export async function getMatches(filters?: {
  seasonId?: string;
  categoryId?: string;
  status?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('matches')
    .select(`
      *,
      category:categories(*),
      home_team:teams!matches_home_team_id_fkey(
        id, name,
        school:schools(id, name, slug)
      ),
      away_team:teams!matches_away_team_id_fkey(
        id, name,
        school:schools(id, name, slug)
      )
    `)
    .order('match_date', { ascending: true });

  if (filters?.seasonId)   query = query.eq('season_id', filters.seasonId);
  if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters?.status)     query = query.eq('status', filters.status);
  if (filters?.limit)      query = query.limit(filters.limit);

  const { data } = await query;
  return data ?? [];
}

// ─── Classements ────────────────────────────────────────────
export async function getStandings(seasonId: string, categoryId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('standings')
    .select(`
      *,
      team:teams(
        id, name,
        school:schools(id, name, slug, logo_url)
      )
    `)
    .eq('season_id', seasonId)
    .eq('category_id', categoryId)
    .order('rank', { ascending: true });
  return data ?? [];
}

 

// ─── Sponsors ───────────────────────────────────────────────
export async function getSponsors() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return data ?? [];
}

// ─── Matchs par catégorie avec équipes ─────────────────────
export async function getMatchesByCategory(seasonId: string, categoryId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('matches')
    .select(`
      id, match_date, venue, status, home_score, away_score, phase, group_name,
      category:categories(id, code),
      home_team:teams!matches_home_team_id_fkey(
        id, name,
        school:schools(id, name, slug)
      ),
      away_team:teams!matches_away_team_id_fkey(
        id, name,
        school:schools(id, name, slug)
      )
    `)
    .eq('season_id', seasonId)
    .eq('category_id', categoryId)
    .order('match_date', { ascending: true });
  return data ?? [];
}

// ─── Actualité par slug ────────────────────────────────────
export async function getNewsBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  return data;
}

// ─── Top buteurs ────────────────────────────────────────────
export async function getTopScorers(seasonId: string, categoryId: string, limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('match_events')
    .select(`
      player_id,
      team_id,
      player:players(id, first_name, last_initial, position),
      team:teams!inner(
        id, season_id, category_id,
        school:schools(id, name, slug)
      )
    `)
    .eq('event_type', 'goal')
    .eq('team.season_id', seasonId)
    .eq('team.category_id', categoryId);

  if (!data) return [];

  const map = new Map<string, any>();
  for (const row of data as any[]) {
    const key = row.player_id;
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.goals += 1;
    } else {
      map.set(key, {
        player_id: key,
        first_name: row.player?.first_name,
        last_initial: row.player?.last_initial,
        position: row.player?.position,
        school: (row.team as any)?.school,
        goals: 1
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit);
}

// ─── Top passeurs ───────────────────────────────────────────
export async function getTopAssists(seasonId: string, categoryId: string, limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('match_events')
    .select(`
      player_id,
      player:players(id, first_name, last_initial),
      team:teams!inner(
        id, season_id, category_id,
        school:schools(id, name, slug)
      )
    `)
    .eq('event_type', 'assist')
    .eq('team.season_id', seasonId)
    .eq('team.category_id', categoryId);

  if (!data) return [];

  const map = new Map<string, any>();
  for (const row of data as any[]) {
    const key = row.player_id;
    if (!key) continue;
    const existing = map.get(key);
    if (existing) existing.assists += 1;
    else map.set(key, {
      player_id: key,
      first_name: row.player?.first_name,
      last_initial: row.player?.last_initial,
      school: (row.team as any)?.school,
      assists: 1
    });
  }
  return Array.from(map.values()).sort((a, b) => b.assists - a.assists).slice(0, limit);
}

// ─── Meilleurs joueurs (MVP) ────────────────────────────────
export async function getTopPlayers(seasonId: string, categoryId: string, limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('match_events')
    .select(`
      player_id,
      player:players(id, first_name, last_initial),
      team:teams!inner(
        id, season_id, category_id,
        school:schools(id, name, slug)
      )
    `)
    .eq('event_type', 'mvp')
    .eq('team.season_id', seasonId)
    .eq('team.category_id', categoryId);

  if (!data) return [];

  const map = new Map<string, any>();
  for (const row of data as any[]) {
    const key = row.player_id;
    if (!key) continue;
    const existing = map.get(key);
    if (existing) existing.mvp += 1;
    else map.set(key, {
      player_id: key,
      first_name: row.player?.first_name,
      last_initial: row.player?.last_initial,
      school: (row.team as any)?.school,
      mvp: 1
    });
  }
  return Array.from(map.values()).sort((a, b) => b.mvp - a.mvp).slice(0, limit);
}

// ─── Cartons (fair-play) ────────────────────────────────────
export async function getDiscipline(seasonId: string, categoryId: string, limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('match_events')
    .select(`
      player_id, event_type,
      player:players(id, first_name, last_initial),
      team:teams!inner(
        id, season_id, category_id,
        school:schools(id, name, slug)
      )
    `)
    .in('event_type', ['yellow_card', 'red_card'])
    .eq('team.season_id', seasonId)
    .eq('team.category_id', categoryId);

  if (!data) return [];

  const map = new Map<string, any>();
  for (const row of data as any[]) {
    const key = row.player_id;
    if (!key) continue;
    const existing = map.get(key) ?? {
      player_id: key,
      first_name: row.player?.first_name,
      last_initial: row.player?.last_initial,
      school: (row.team as any)?.school,
      yellow: 0, red: 0
    };
    if (row.event_type === 'yellow_card') existing.yellow += 1;
    else existing.red += 1;
    map.set(key, existing);
  }
  return Array.from(map.values())
    .sort((a, b) => (b.red * 3 + b.yellow) - (a.red * 3 + a.yellow))
    .slice(0, limit);
}

// ─── Joueurs d'une école (toutes équipes) ───────────────────
export async function getSchoolPlayers(schoolId: string, seasonId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('players')
    .select(`
      id, first_name, last_initial, jersey_number, position,
      team:teams!inner(
        id, school_id, season_id,
        category:categories(id, code, sort_order)
      )
    `)
    .eq('team.school_id', schoolId)
    .eq('team.season_id', seasonId)
    .order('jersey_number', { ascending: true });
  return data ?? [];
}


// ─── Statistiques globales (dynamiques) ────────────────────
export async function getGlobalStats() {
  const supabase = await createClient();

  const [schoolsRes, teamsRes, matchesRes, playersRes, categoriesRes, season] =
    await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      getActiveSeason()
    ]);

  // Mois entre le début et la fin de la saison
  let months = 6;
  if (season?.start_date && season?.end_date) {
    const s = new Date(season.start_date);
    const e = new Date(season.end_date);
    months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  }

  return {
    schools:    schoolsRes.count ?? 0,
    teams:      teamsRes.count ?? 0,
    matches:    matchesRes.count ?? 0,
    players:    playersRes.count ?? 0,
    categories: categoriesRes.count ?? 0,
    months,
    seasonYear: season?.start_date ? new Date(season.start_date).getFullYear() : 2026,
    season
  };
}



// ─── Stats admin ────────────────────────────────────────────
export async function getAdminStats() {
  const supabase = await createClient();

  const [schools, teams, matches, news, sponsors, regs, users, playedMatches] =
    await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('sponsors').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'played')
    ]);

  return {
    schools: schools.count ?? 0,
    teams: teams.count ?? 0,
    matches: matches.count ?? 0,
    playedMatches: playedMatches.count ?? 0,
    news: news.count ?? 0,
    sponsors: sponsors.count ?? 0,
    pendingRegistrations: regs.count ?? 0,
    users: users.count ?? 0
  };
}

// ─── Derniers événements d'audit ────────────────────────────
export async function getRecentAudit(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}


// ─── Notifications non lues ─────────────────────────────────
export async function getUnreadNotifications() {
  const { getCurrentProfile } = await import('./auth');
  const me = await getCurrentProfile();
  if (!me) return { count: 0, items: [] };

  const supabase = await createClient();
  const { data } = await supabase
    .from('notifications')
    .select('id, title, body, type, link, is_read, created_at')
    .eq('user_id', me.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(5);

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', me.id)
    .eq('is_read', false);

  return { count: count ?? 0, items: data ?? [] };
}

// ─── Toutes les notifications ───────────────────────────────
export async function getAllNotifications(limit = 50) {
  try {
    const { getCurrentProfile } = await import('./auth');
    const me = await getCurrentProfile();
    if (!me) return [];

    const supabase = await createClient();
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:profiles!notifications_sender_id_fkey(id, full_name, email)
      `)
      .eq('user_id', me.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data ?? [];
  } catch (err) {
    console.error('getAllNotifications error:', err);
    return [];
  }
}




// ─── Liste des utilisateurs actifs (hors soi-même) ─────────
export async function getActiveUsers() {
  const { getCurrentProfile } = await import('./auth');
  const me = await getCurrentProfile();
  if (!me) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('is_active', true)
    .neq('id', me.id)
    .order('full_name');

  return data ?? [];
}

// ─── Notifications envoyées par moi ─────────────────────────
export async function getSentNotifications(limit = 50) {
  try {
    const { getCurrentProfile } = await import('./auth');
    const me = await getCurrentProfile();
    if (!me) return [];

    const supabase = await createClient();
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        recipient:profiles!notifications_user_id_fkey(id, full_name, email)
      `)
      .eq('sender_id', me.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data ?? [];
  } catch (err) {
    console.error('getSentNotifications error:', err);
    return [];
  }
}




// ─── Coachs ─────────────────────────────────────────────────
export async function getCoaches() {
  const region = await getCurrentRegion();
  const filter = buildRegionFilter(region);

  const supabase = await createClient();
  let query = supabase
    .from('coaches')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('display_order');

  if (filter) query = query.or(filter);

  const { data } = await query;
  return data ?? [];
}

export async function getFeaturedCoaches(limit = 3) {
  const region = await getCurrentRegion();
  const filter = buildRegionFilter(region);

  const supabase = await createClient();
  let query = supabase
    .from('coaches')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('display_order')
    .limit(limit);

  if (filter) query = query.or(filter);

  const { data } = await query;
  return data ?? [];
}

export async function getCoachBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('coaches')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}

// ─── Programmes de training ─────────────────────────────────
export async function getTrainingPrograms() {
  const region = await getCurrentRegion();
  const filter = buildRegionFilter(region);

  const supabase = await createClient();
  let query = supabase
    .from('training_programs')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (filter) query = query.or(filter);

  const { data } = await query;
  return data ?? [];
}

export async function getTrainingProgramBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('training_programs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}



// ─── Demandes de training ───────────────────────────────────
export async function getTrainingRequests(limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('training_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getTrainingRequestById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('training_requests')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}



// ─── Témoignages d'un coach ─────────────────────────────────
export async function getCoachTestimonials(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('coach_testimonials')
    .select('*')
    .eq('coach_id', coachId)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('display_order');
  return data ?? [];
}

// ─── Médias d'un coach ──────────────────────────────────────
export async function getCoachMedia(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('coach_media')
    .select('*')
    .eq('coach_id', coachId)
    .eq('is_active', true)
    .order('display_order');
  return data ?? [];
}


// ─── Actualités ─────────────────────────────────────────────
export async function getNews(
  limit = 10,
  opts?: { storyType?: 'all' | 'standard' | 'player' | 'coach' }
) {
  const supabase = await createClient();
  let query = supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  const type = opts?.storyType ?? 'all';
  if (type === 'standard') {
    query = query.is('story_type', null);
  } else if (type === 'player' || type === 'coach') {
    query = query.eq('story_type', type);
  }

  const { data } = await query;
  return data ?? [];
}


// ─── Sponsor par slug ───────────────────────────────────────
export async function getSponsorBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sponsors')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}




// ═══════════════════════════════════════════════════════════
// CAMPS & TRYOUTS
// ═══════════════════════════════════════════════════════════

// ─── Liste des camps (filtrable) ────────────────────────────
export async function getCamps(opts?: {
  type?: 'camp' | 'tryout' | 'all';
  onlyUpcoming?: boolean;
}) {
  const region = await getCurrentRegion();
  const filter = buildRegionFilter(region);

  const supabase = await createClient();
  let query = supabase
    .from('camps')
    .select('*')
    .eq('is_active', true)
    .order('date_start', { ascending: true });

  const type = opts?.type ?? 'all';
  if (type === 'camp' || type === 'tryout') {
    query = query.eq('type', type);
  }

  if (opts?.onlyUpcoming) {
    const today = new Date().toISOString().slice(0, 10);
    query = query.gte('date_end', today);
  }

  if (filter) query = query.or(filter);

  const { data } = await query;
  return data ?? [];
}

// ─── Camp par slug ──────────────────────────────────────────
export async function getCampBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('camps')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}

// ─── Camp par id (admin) ────────────────────────────────────
export async function getCampById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('camps')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

// ─── Tous les camps (admin, y compris inactifs) ─────────────
export async function getAllCampsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('camps')
    .select('*')
    .order('date_start', { ascending: false });
  return data ?? [];
}

// ─── Inscriptions d'un camp ─────────────────────────────────
export async function getCampRegistrations(campId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('camp_registrations')
    .select('*')
    .eq('camp_id', campId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

// ─── Toutes les inscriptions (admin global) ─────────────────
export async function getAllCampRegistrations(limit = 200) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('camp_registrations')
    .select(`
      *,
      camp:camps(id, title_fr, title_en, slug, date_start, type)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}