-- ═══════════════════════════════════════════════════════════════════════
-- RENFORCEMENT COMPÉTITION — Règles Ligue Scolaire Primaire RESA
-- ═══════════════════════════════════════════════════════════════════════
-- 1. Vue normalisée des résultats (played + forfeits)
-- 2. Recalcul complet : barème + forfaits + fair-play + 6 critères
-- 3. Fonction pour forfait général (3 forfaits)
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────
-- 1. VUE — Résultats effectifs (normalise played / forfeit_home / forfeit_away)
-- ───────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_match_effective_results AS
SELECT
  m.id            AS match_id,
  m.season_id,
  m.category_id,
  m.home_team_id,
  m.away_team_id,
  m.group_name,
  m.status,
  CASE
    WHEN m.status = 'played'         THEN m.home_score
    WHEN m.status = 'forfeit_home'   THEN 0   -- home a fait forfait
    WHEN m.status = 'forfeit_away'   THEN 3   -- away a fait forfait
    ELSE NULL
  END AS home_effective,
  CASE
    WHEN m.status = 'played'         THEN m.away_score
    WHEN m.status = 'forfeit_home'   THEN 3
    WHEN m.status = 'forfeit_away'   THEN 0
    ELSE NULL
  END AS away_effective
FROM matches m;

COMMENT ON VIEW public.v_match_effective_results IS
  'Normalise les résultats : played → scores réels, forfeit_home → 0-3, forfeit_away → 3-0. Les autres statuts ont des valeurs NULL (ignorés dans les calculs).';

-- ───────────────────────────────────────────────────────────────────────
-- 2. FONCTION PRINCIPALE — Recalcul classement
-- ───────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recalculate_standings(
  p_season_id uuid,
  p_category_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cfg season_categories%rowtype;
BEGIN
  -- Config de la saison/catégorie (points_win, points_draw)
  SELECT * INTO v_cfg
  FROM season_categories
  WHERE season_id = p_season_id AND category_id = p_category_id;

  -- Vider les standings actuels
  DELETE FROM standings
  WHERE season_id = p_season_id AND category_id = p_category_id;

  -- ═══════════════════════════════════════════════════════════════════
  -- Insertion des stats agrégées par équipe
  -- ═══════════════════════════════════════════════════════════════════
  WITH team_matches AS (
    SELECT
      t.id AS team_id,
      t.group_name,
      r.match_id,
      r.home_team_id,
      r.away_team_id,
      r.home_effective,
      r.away_effective,
      CASE WHEN r.home_team_id = t.id THEN r.home_effective ELSE r.away_effective END AS gf,
      CASE WHEN r.home_team_id = t.id THEN r.away_effective ELSE r.home_effective END AS ga,
      CASE
        WHEN r.home_team_id = t.id AND r.home_effective > r.away_effective THEN 1
        WHEN r.away_team_id = t.id AND r.away_effective > r.home_effective THEN 1
        ELSE 0
      END AS is_win,
      CASE WHEN r.home_effective = r.away_effective THEN 1 ELSE 0 END AS is_draw,
      CASE
        WHEN r.home_team_id = t.id AND r.home_effective < r.away_effective THEN 1
        WHEN r.away_team_id = t.id AND r.away_effective < r.home_effective THEN 1
        ELSE 0
      END AS is_loss
    FROM teams t
    LEFT JOIN v_match_effective_results r
      ON r.season_id = p_season_id
      AND r.category_id = p_category_id
      AND r.home_effective IS NOT NULL
      AND (r.home_team_id = t.id OR r.away_team_id = t.id)
    WHERE t.season_id = p_season_id
      AND t.category_id = p_category_id
  ),
  fair_play AS (
    SELECT
      me.team_id,
      (-1 * COUNT(*) FILTER (WHERE me.event_type = 'yellow_card')
       -3 * COUNT(*) FILTER (WHERE me.event_type = 'red_card'))::int AS score
    FROM match_events me
    JOIN matches m ON m.id = me.match_id
    WHERE m.season_id = p_season_id
      AND m.category_id = p_category_id
      AND m.status IN ('played', 'forfeit_home', 'forfeit_away')
    GROUP BY me.team_id
  )
  INSERT INTO standings (
    season_id, category_id, team_id, group_name,
    played, won, drawn, lost,
    goals_for, goals_against, points, fair_play_score
  )
  SELECT
    p_season_id,
    p_category_id,
    tm.team_id,
    tm.group_name,
    COUNT(tm.match_id) FILTER (WHERE tm.home_effective IS NOT NULL)::int,
    COALESCE(SUM(tm.is_win), 0)::int,
    COALESCE(SUM(tm.is_draw), 0)::int,
    COALESCE(SUM(tm.is_loss), 0)::int,
    COALESCE(SUM(tm.gf) FILTER (WHERE tm.home_effective IS NOT NULL), 0)::int,
    COALESCE(SUM(tm.ga) FILTER (WHERE tm.home_effective IS NOT NULL), 0)::int,
    (COALESCE(SUM(tm.is_win), 0) * v_cfg.points_win
     + COALESCE(SUM(tm.is_draw), 0) * v_cfg.points_draw)::int,
    COALESCE(fp.score, 0)::int
  FROM team_matches tm
  LEFT JOIN fair_play fp ON fp.team_id = tm.team_id
  GROUP BY tm.team_id, tm.group_name, fp.score;

  -- ───────────────────────────────────────────────────────────────────
  -- Calcul de goal_diff
  -- ───────────────────────────────────────────────────────────────────
  UPDATE standings
  SET goal_diff = goals_for - goals_against
  WHERE season_id = p_season_id AND category_id = p_category_id;

  -- ───────────────────────────────────────────────────────────────────
  -- Calcul du rang (6 critères de départage)
  --   1. Pts
  --   2. Confrontation directe (H2H)
  --   3. Différence de buts
  --   4. Meilleure attaque (BP)
  --   5. Fair-play (le plus discipliné gagne → score le plus proche de 0)
  --   6. (5e ex aequo = ROW_NUMBER stable)
  -- ───────────────────────────────────────────────────────────────────
  WITH base AS (
    SELECT * FROM standings
    WHERE season_id = p_season_id AND category_id = p_category_id
  ),
  h2h AS (
    SELECT
      b1.team_id,
      COALESCE(SUM(
        CASE
          WHEN r.home_team_id = b1.team_id AND r.home_effective > r.away_effective THEN v_cfg.points_win
          WHEN r.away_team_id = b1.team_id AND r.away_effective > r.home_effective THEN v_cfg.points_win
          WHEN r.home_effective = r.away_effective THEN v_cfg.points_draw
          ELSE 0
        END
      ), 0)::int AS h2h_points
    FROM base b1
    JOIN base b2
      ON b2.points = b1.points
      AND b2.team_id != b1.team_id
    LEFT JOIN v_match_effective_results r
      ON r.season_id = p_season_id
      AND r.category_id = p_category_id
      AND r.home_effective IS NOT NULL
      AND (
        (r.home_team_id = b1.team_id AND r.away_team_id = b2.team_id)
        OR
        (r.away_team_id = b1.team_id AND r.home_team_id = b2.team_id)
      )
    GROUP BY b1.team_id
  ),
  ranked AS (
    SELECT
      b.id,
      ROW_NUMBER() OVER (
        ORDER BY
          b.points DESC,
          COALESCE(h.h2h_points, 0) DESC,
          b.goal_diff DESC,
          b.goals_for DESC,
          b.fair_play_score DESC
      ) AS rk
    FROM base b
    LEFT JOIN h2h h ON h.team_id = b.team_id
  )
  UPDATE standings s
  SET rank = r.rk
  FROM ranked r
  WHERE s.id = r.id;
END;
$function$;

COMMENT ON FUNCTION public.recalculate_standings(uuid, uuid) IS
  'Recalcule le classement d''une catégorie/saison : barème (V=3/N=1/D=0), gestion forfaits (3-0 administratif), fair-play (-1 jaune, -3 rouge), tri 6 critères (Pts, H2H, Diff, BP, Fair-play).';

-- ───────────────────────────────────────────────────────────────────────
-- 3. FORFAIT GÉNÉRAL — Règle des 3 forfaits
-- ───────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.declare_general_forfeit(
  p_school_id uuid,
  p_season_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_teams    uuid[];
  v_affected int := 0;
  v_recalcs  jsonb := '[]'::jsonb;
  v_row      record;
BEGIN
  -- Récupère les équipes de cette école dans cette saison
  SELECT ARRAY_AGG(id) INTO v_teams
  FROM teams
  WHERE school_id = p_school_id AND season_id = p_season_id;

  IF v_teams IS NULL OR array_length(v_teams, 1) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Aucune équipe pour cette école dans cette saison.');
  END IF;

  -- Bascule tous ses matchs (hors cancelled) en forfait 3-0 pour l'adversaire
  UPDATE matches
  SET
    status = CASE
      WHEN home_team_id = ANY(v_teams) THEN 'forfeit_home'::match_status
      ELSE 'forfeit_away'::match_status
    END,
    home_score = CASE WHEN home_team_id = ANY(v_teams) THEN 0 ELSE 3 END,
    away_score = CASE WHEN home_team_id = ANY(v_teams) THEN 3 ELSE 0 END,
    updated_at = now()
  WHERE season_id = p_season_id
    AND (home_team_id = ANY(v_teams) OR away_team_id = ANY(v_teams))
    AND status NOT IN ('cancelled');

  GET DIAGNOSTICS v_affected = ROW_COUNT;

  -- Recalcul par catégorie impactée
  FOR v_row IN
    SELECT DISTINCT season_id, category_id
    FROM matches
    WHERE season_id = p_season_id
      AND (home_team_id = ANY(v_teams) OR away_team_id = ANY(v_teams))
  LOOP
    PERFORM recalculate_standings(v_row.season_id, v_row.category_id);
    v_recalcs := v_recalcs || jsonb_build_object('category_id', v_row.category_id);
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'matches_affected', v_affected,
    'categories_recalculated', v_recalcs
  );
END;
$function$;

COMMENT ON FUNCTION public.declare_general_forfeit(uuid, uuid) IS
  'Déclare une école en forfait général : bascule tous ses matchs en 3-0 (forfait) et recalcule le classement. À appeler manuellement par un admin (après 3 forfaits constatés).';

-- ───────────────────────────────────────────────────────────────────────
-- 4. INDEX DE PERFORMANCE
-- ───────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_standings_season_cat
  ON standings (season_id, category_id);

CREATE INDEX IF NOT EXISTS idx_match_events_team_type
  ON match_events (team_id, event_type);

CREATE INDEX IF NOT EXISTS idx_matches_season_cat_status
  ON matches (season_id, category_id, status);

-- ───────────────────────────────────────────────────────────────────────
-- 5. TEST — Recalcul immédiat sur la saison active
-- ───────────────────────────────────────────────────────────────────────
-- (décommente pour tester)
-- SELECT recalculate_standings(
--   (SELECT id FROM seasons WHERE is_active = true),
--   (SELECT id FROM categories WHERE code = 'U11' LIMIT 1)
-- );