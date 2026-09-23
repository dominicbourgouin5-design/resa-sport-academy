'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { addMatchEvent, deleteMatchEvent } from './actions';

const EVENT_LABELS: Record<string, string> = {
  goal: 'But',
  assist: 'Passe décisive',
  yellow_card: 'Carton jaune',
  red_card: 'Carton rouge',
  mvp: 'MVP'
};

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  assist: '🎯',
  yellow_card: '🟨',
  red_card: '🟥',
  mvp: '⭐'
};

export default function EventsEditor({
  match,
  players,
  events
}: {
  match: any;
  players: any[];
  events: any[];
}) {
  const [busy, startTransition] = useTransition();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'goal' | 'assist' | 'yellow_card' | 'red_card' | 'mvp'>('goal');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [minute, setMinute] = useState<string>('');

  const homeTeam = match.home_team as any;
  const awayTeam = match.away_team as any;
  const homeTeamPlayers = players.filter((p) => p.team_id === homeTeam?.id);
  const awayTeamPlayers = players.filter((p) => p.team_id === awayTeam?.id);

  // Compteurs
  const countEvent = (teamId: string, type: string) =>
    events.filter((e) => e.team_id === teamId && e.event_type === type).length;

  const homeGoals = countEvent(homeTeam?.id, 'goal');
  const awayGoals = countEvent(awayTeam?.id, 'goal');
  const scoreMismatch =
    match.status === 'played' &&
    (homeGoals !== match.home_score || awayGoals !== match.away_score);

  const openForm = (teamId: string, type: typeof selectedType) => {
    setSelectedTeam(teamId);
    setSelectedType(type);
    setSelectedPlayer('');
    setMinute('');
  };

  const closeForm = () => {
    setSelectedTeam(null);
    setSelectedPlayer('');
    setMinute('');
  };

  const handleAdd = () => {
    if (!selectedTeam || !selectedPlayer) return;
    startTransition(async () => {
      await addMatchEvent(
        match.id,
        selectedTeam,
        selectedPlayer,
        selectedType,
        minute ? Number(minute) : undefined
      );
      closeForm();
    });
  };

  const handleDelete = (eventId: string) => {
    startTransition(async () => {
      await deleteMatchEvent(eventId, match.id);
    });
  };

  return (
    <div className="mx-auto max-w-5xl">

      {/* Fil d'ariane */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/matchs" className="hover:text-resa-red">
          Matchs
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          Événements
        </span>
      </div>

      {/* Header match */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-6 py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
            {match.category?.code} ·{' '}
            {new Date(match.match_date).toLocaleDateString('fr-FR', {
              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
            })}
          </div>
          <h1 className="mt-1 font-display text-2xl font-black text-resa-navy">
            Saisie des événements
          </h1>
        </div>

        {/* Score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
              Domicile
            </div>
            <div className="mt-1 text-base font-bold text-resa-navy">
              {homeTeam?.school?.name}
            </div>
          </div>
          <div className="font-display text-3xl font-black text-resa-navy">
            {match.home_score ?? 0} - {match.away_score ?? 0}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
              Extérieur
            </div>
            <div className="mt-1 text-base font-bold text-resa-navy">
              {awayTeam?.school?.name}
            </div>
          </div>
        </div>

        {/* Alerte cohérence */}
        {scoreMismatch && (
          <div className="border-t border-amber-200 bg-amber-50 px-6 py-3 text-[12px] text-amber-800">
            ⚠️ <strong>Cohérence à vérifier</strong> — Événements saisis : {homeGoals} - {awayGoals}.
            Score officiel : {match.home_score} - {match.away_score}.
            Ajoutez ou supprimez les buts manquants pour aligner.
          </div>
        )}
      </div>

      {/* 2 colonnes */}
      <div className="grid gap-5 md:grid-cols-2">
        <TeamColumn
          title="Domicile"
          team={homeTeam}
          players={homeTeamPlayers}
          events={events.filter((e) => e.team_id === homeTeam?.id)}
          busy={busy}
          onAdd={(type) => openForm(homeTeam.id, type)}
          onDelete={handleDelete}
        />
        <TeamColumn
          title="Extérieur"
          team={awayTeam}
          players={awayTeamPlayers}
          events={events.filter((e) => e.team_id === awayTeam?.id)}
          busy={busy}
          onAdd={(type) => openForm(awayTeam.id, type)}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal ajout */}
      {selectedTeam && (
        <AddEventModal
          team={
            selectedTeam === homeTeam.id ? homeTeam : awayTeam
          }
          type={selectedType}
          players={selectedTeam === homeTeam.id ? homeTeamPlayers : awayTeamPlayers}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
          minute={minute}
          setMinute={setMinute}
          onCancel={closeForm}
          onSubmit={handleAdd}
          busy={busy}
        />
      )}
    </div>
  );
}

// ─── Colonne équipe ─────────────────────────────────────────
function TeamColumn({
  title, team, players, events, busy, onAdd, onDelete
}: {
  title: string;
  team: any;
  players: any[];
  events: any[];
  busy: boolean;
  onAdd: (type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'mvp') => void;
  onDelete: (id: string) => void;
}) {
  // Grouper par type
  const goals = events.filter((e) => e.event_type === 'goal');
  const assists = events.filter((e) => e.event_type === 'assist');
  const yellows = events.filter((e) => e.event_type === 'yellow_card');
  const reds = events.filter((e) => e.event_type === 'red_card');
  const mvps = events.filter((e) => e.event_type === 'mvp');

  const getPlayerName = (id: string) => {
    const p = players.find((pl) => pl.id === id);
    return p ? `${p.first_name} ${p.last_initial ?? ''}` : '—';
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <header className="border-b border-black/5 px-5 py-3">
        <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
          {title}
        </div>
        <div className="mt-0.5 text-sm font-bold text-resa-navy">
          {team?.school?.name}
        </div>
      </header>

      <div className="space-y-4 p-5">
        {/* Buts */}
        <Section icon="⚽" label="Buts" count={goals.length} onAdd={() => onAdd('goal')} disabled={busy}>
          {goals.length === 0 ? (
            <Empty>Aucun but saisi.</Empty>
          ) : (
            goals.map((e) => (
              <EventRow
                key={e.id}
                label={getPlayerName(e.player_id)}
                minute={e.minute}
                onDelete={() => onDelete(e.id)}
                disabled={busy}
              />
            ))
          )}
        </Section>

        {/* Passes */}
        <Section icon="🎯" label="Passes décisives" count={assists.length} onAdd={() => onAdd('assist')} disabled={busy}>
          {assists.length === 0 ? (
            <Empty>Aucune passe saisie.</Empty>
          ) : (
            assists.map((e) => (
              <EventRow
                key={e.id}
                label={getPlayerName(e.player_id)}
                minute={e.minute}
                onDelete={() => onDelete(e.id)}
                disabled={busy}
              />
            ))
          )}
        </Section>

        {/* Cartons */}
        <Section icon="🟨" label="Cartons jaunes" count={yellows.length} onAdd={() => onAdd('yellow_card')} disabled={busy}>
          {yellows.length === 0 ? (
            <Empty>Aucun carton.</Empty>
          ) : (
            yellows.map((e) => (
              <EventRow
                key={e.id}
                label={getPlayerName(e.player_id)}
                minute={e.minute}
                onDelete={() => onDelete(e.id)}
                disabled={busy}
              />
            ))
          )}
        </Section>

        <Section icon="🟥" label="Cartons rouges" count={reds.length} onAdd={() => onAdd('red_card')} disabled={busy}>
          {reds.length === 0 ? (
            <Empty>Aucun carton.</Empty>
          ) : (
            reds.map((e) => (
              <EventRow
                key={e.id}
                label={getPlayerName(e.player_id)}
                onDelete={() => onDelete(e.id)}
                disabled={busy}
              />
            ))
          )}
        </Section>

        {/* MVP */}
        <Section icon="⭐" label="MVP" count={mvps.length} onAdd={() => onAdd('mvp')} disabled={busy}>
          {mvps.length === 0 ? (
            <Empty>Aucun MVP désigné.</Empty>
          ) : (
            mvps.map((e) => (
              <EventRow
                key={e.id}
                label={getPlayerName(e.player_id)}
                onDelete={() => onDelete(e.id)}
                disabled={busy}
              />
            ))
          )}
        </Section>
      </div>
    </section>
  );
}

function Section({
  icon, label, count, onAdd, disabled, children
}: {
  icon: string;
  label: string;
  count: number;
  onAdd: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-resa-navy">
            {label}
          </span>
          {count > 0 && (
            <span className="rounded-full bg-resa-navy/10 px-1.5 py-0.5 text-[9px] font-bold text-resa-navy">
              {count}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="rounded-full bg-resa-gray px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-resa-navy transition hover:bg-resa-red hover:text-white disabled:opacity-40"
        >
          + Ajouter
        </button>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function EventRow({
  label, minute, onDelete, disabled
}: {
  label: string;
  minute?: number | null;
  onDelete: () => void;
  disabled: boolean;
}) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-black/5 bg-resa-gray/40 px-3 py-1.5">
      <div className="min-w-0 flex-1 text-[12px] font-medium text-resa-navy">
        {label}
      </div>
      {minute != null && (
        <div className="shrink-0 text-[10px] text-resa-text/50">
          {minute}′
        </div>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="shrink-0 rounded text-red-500 opacity-0 transition group-hover:opacity-100 disabled:opacity-30"
        title="Supprimer"
      >
        ✕
      </button>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-black/10 px-3 py-2 text-center text-[11px] italic text-resa-text/40">
      {children}
    </p>
  );
}

// ─── Modal d'ajout ──────────────────────────────────────────
function AddEventModal({
  team, type, players, selectedPlayer, setSelectedPlayer,
  minute, setMinute, onCancel, onSubmit, busy
}: any) {
  const requiresMinute = type === 'goal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl anim-fade-up">
        <div className="border-b border-black/5 px-5 py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Ajouter un événement
          </div>
          <div className="mt-1 text-sm font-bold text-resa-navy">
            {EVENT_ICONS[type]} {EVENT_LABELS[type]} — {team?.school?.name}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Joueur */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              Joueur <span className="text-resa-red">*</span>
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            >
              <option value="">— Sélectionner un joueur —</option>
              {players.map((p: any) => (
                <option key={p.id} value={p.id}>
                  #{p.jersey_number ?? '—'} — {p.first_name} {p.last_initial ?? ''}
                </option>
              ))}
            </select>
          </div>

          {/* Minute */}
          {requiresMinute && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Minute du but
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="Ex : 23"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/5 bg-resa-gray/30 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-black/5 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedPlayer || busy}
            className="rounded-full bg-resa-red px-5 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-40"
          >
            {busy ? 'Enregistrement…' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}