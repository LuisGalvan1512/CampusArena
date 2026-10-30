'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { GAME_CATALOG, GAME_BANNER_PRESETS, GAME_LIST, type GameCode } from '@/lib/games';
import { EditTournamentModal } from '@/components/EditTournamentModal';
import { LivingBanner } from '@/components/LivingBanner';
import {
  GameDisciplineEmblem,
  CommandConsoleIcon,
  AegisTrophyIcon,
  BracketTreeIcon,
  LiveWaveformIcon,
} from '@/components/EsportsIcons';
import { sounds } from '@/lib/sound';
import {
  Trophy,
  Swords,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  QrCode,
  ExternalLink,
  ArrowRight,
  Eye,
  Image as ImageIcon,
  Edit3,
  MapPin,
  Crown,
  X,
} from 'lucide-react';

interface PendingPayment {
  payment_id: string;
  registration_id: string;
  tournament_id: string;
  tournament_name: string;
  tournament_slug: string;
  game_code: string;
  competitor_name: string;
  competitor_email: string;
  in_game_name: string;
  player_tag: string;
  career: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  operation_reference?: string;
  evidence_url?: string;
  submitted_at: string;
}

interface ManagedTournament {
  id: string;
  name: string;
  slug: string;
  game_code: string;
  status: string;
  current_participants: number;
  max_slots: number;
  cost: number;
  currency?: string;
  prize_pool: string;
  campus_name?: string;
  event_modality?: string;
  is_online?: boolean;
  banner_url?: string;
  format?: string;
  rules_text?: string;
  prize_distribution?: {
    first_place?: string;
    second_place?: string;
    third_place?: string;
  };
}

export default function OrganizerDashboardPage() {
  const { isAdmin } = useAuth();

  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [tournaments, setTournaments] = useState<ManagedTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Create Tournament Studio Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTourName, setNewTourName] = useState('');
  const [newTourGame, setNewTourGame] = useState<string>('CLASH_ROYALE');
  const [newTourCampus, setNewTourCampus] = useState<string>('Lima');
  const [newTourEventModality, setNewTourEventModality] = useState<
    'PRESENTIAL' | 'ONLINE' | 'HYBRID'
  >('PRESENTIAL');
  const [newTourCost, setNewTourCost] = useState(5.0);
  const [newTourSlots, setNewTourSlots] = useState(16);
  const [newTourTeamSize, setNewTourTeamSize] = useState<number>(1);
  const [newTourStreamPlatform, setNewTourStreamPlatform] = useState<string>('KICK');
  const [newTourStreamUrl, setNewTourStreamUrl] = useState<string>('lusen15');
  const [newTourPrize, setNewTourPrize] = useState('S/ 400 + Trofeo');
  const [newTourPrize1, setNewTourPrize1] = useState('100% del pozo acumulado');
  const [newTourPrize2, setNewTourPrize2] = useState('Medalla de Plata');
  const [newTourPrize3, setNewTourPrize3] = useState('Medalla de Bronce');
  const [newTourBanner, setNewTourBanner] = useState('');
  const [newTourSeriesFormat, setNewTourSeriesFormat] = useState(
    'Semis BO3 • Final BO5 (Previas BO1)'
  );
  const [newTourDesc, setNewTourDesc] = useState(
    'Torneo de eliminación directa para estudiantes de Tecsup.'
  );
  const [newTourRules, setNewTourRules] = useState(
    '1. Formato 1vs1 BO3.\n2. Baneo de 1 carta/brawler por mutuo acuerdo.\n3. Desconexiones: 30 segundos de espera.'
  );
  const [newTourRegOpen, setNewTourRegOpen] = useState(() => new Date().toISOString().slice(0, 16));
  const [newTourRegClose, setNewTourRegClose] = useState(() =>
    new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 16)
  );
  const [newTourStart, setNewTourStart] = useState(() =>
    new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 16)
  );
  const [viewingVoucherUrl, setViewingVoucherUrl] = useState<string | null>(null);

  // Edit Tournament Modal State
  const [editingTour, setEditingTour] = useState<ManagedTournament | null>(null);

  const fetchData = async () => {
    setIsLoading(true);

    const paymentsRes = await api.get('/admin/payments/pending');
    if (paymentsRes.success && Array.isArray(paymentsRes.data)) {
      setPendingPayments(paymentsRes.data);
    }

    const tourRes = await api.get('/tournaments?limit=50');
    if (tourRes.success && tourRes.data?.items) {
      setTournaments(tourRes.data.items);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprovePayment = async (paymentId: string) => {
    setActionLoading(paymentId);
    setFeedback(null);

    const res = await api.post(`/payments/${paymentId}/approve`, {
      decision: 'APPROVE',
      public_observation: 'Comprobante y monto verificados exitosamente.',
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.data?.message || '¡Pago aprobado y cupo confirmado!',
      });
      fetchData();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Error al aprobar el pago.' });
    }

    setActionLoading(null);
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm('¿Estás seguro de rechazar este comprobante de pago?')) return;

    setActionLoading(paymentId);
    setFeedback(null);

    const res = await api.post(`/payments/${paymentId}/reject`, {
      decision: 'REJECT',
      public_observation: 'Comprobante no válido o número de operación no encontrado.',
    });

    if (res.success) {
      setFeedback({ type: 'success', message: 'Comprobante rechazado.' });
      fetchData();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Error al rechazar el pago.' });
    }

    setActionLoading(null);
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('creating-tour');

    const defaultBanner = GAME_BANNER_PRESETS[newTourGame] || '/games/clash_royale_banner.jpg';
    const bannerUrl = newTourBanner.trim() || defaultBanner;
    const modalityStr = newTourTeamSize > 1 ? `${newTourTeamSize} vs ${newTourTeamSize}` : '1 vs 1';
    const formatStr = `${modalityStr} (${newTourSeriesFormat})`;

    const res = await api.post('/tournaments', {
      name: newTourName,
      game_code: newTourGame,
      organization_name: 'Tecsup',
      campus_name: newTourCampus,
      event_modality: newTourEventModality,
      is_online: newTourEventModality === 'ONLINE',
      description_short: newTourDesc,
      description_full: `${newTourDesc} Competencia de esports de Tecsup con premios en efectivo.`,
      banner_url: bannerUrl,
      rules_text: newTourRules,
      max_slots: Number(newTourSlots),
      min_slots: 4,
      team_size: Number(newTourTeamSize),
      stream_platform: newTourStreamPlatform,
      stream_url: newTourStreamUrl.trim() || null,
      format: formatStr,
      cost: Number(newTourCost),
      currency: 'PEN',
      prize_pool: newTourPrize,
      prize_distribution: {
        first_place: newTourPrize1.trim() || undefined,
        second_place: newTourPrize2.trim() || undefined,
        third_place: newTourPrize3.trim() || undefined,
      },
      registration_open_at: new Date(newTourRegOpen).toISOString(),
      registration_close_at: new Date(newTourRegClose).toISOString(),
      tournament_start_at: new Date(newTourStart).toISOString(),
      contact_email: 'esports@tecsup.edu.pe',
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `¡Torneo "${newTourName}" creado y publicado exitosamente!`,
      });
      setIsCreateModalOpen(false);
      setNewTourName('');
      fetchData();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Error al crear el torneo.' });
    }

    setActionLoading(null);
  };

  const openEditModal = (t: ManagedTournament) => {
    setEditingTour(t);
  };

  const totalConfirmedParticipants = tournaments.reduce(
    (acc, t) => acc + (Number(t.current_participants) || 0),
    0
  );

  const previewBannerUrl =
    newTourBanner.trim() || GAME_BANNER_PRESETS[newTourGame] || '/games/clash_royale_banner.jpg';
  const previewGameDef = GAME_CATALOG[newTourGame as GameCode];

  return (
    <div className="widescreen-container py-6 sm:py-10 space-y-10 pb-24">
      {/* 1. MONUMENTAL LIVING BROADCAST OPERATIONS BANNER */}
      <LivingBanner
        imageSrc="/assets/banner_command_center.jpg"
        alt="Consola de Operaciones y Arbitraje"
        heightClassName="min-h-[340px] sm:min-h-[400px] flex flex-col justify-between"
        overlayVariant="console"
        telemetryTag="OPS // CONSOLA DE ORGANIZADOR"
      >
        <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-between h-full space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-sm bg-[#09090B]/90 border border-[#D9232E]/40 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9232E]">
              <CommandConsoleIcon className="w-3.5 h-3.5" />
              <span>MODO ORGANIZADOR & ARBITRAJE OFICIAL</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isAdmin && (
                <Link
                  href="/admin/organizers"
                  className="px-4 py-2.5 rounded-sm bg-[#C5A059]/15 border border-[#C5A059]/45 text-[#C5A059] hover:bg-[#C5A059]/25 font-mono text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-2 transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  <span>PANEL ROOT ADMIN</span>
                </Link>
              )}

              <button
                onClick={() => {
                  sounds.playLaunchWoosh();
                  setIsCreateModalOpen(true);
                }}
                className="btn-primary px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center gap-2.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>LANZAR NUEVO TORNEO</span>
              </button>
            </div>
          </div>

          <div className="max-w-4xl space-y-3">
            <h1 className="font-display text-[clamp(2.4rem,5.8vw,5.4rem)] font-bold text-[#F4F2ED] tracking-[-0.03em] leading-[0.92] uppercase">
              CENTRO DE CONTROL <span className="text-[#D9232E]">DEPORTIVO.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#A3A19A] max-w-2xl leading-relaxed">
              Auditoría centralizada de comprobantes Yape/Plin, creación de torneos con vista previa
              en vivo, sorteo de llaves y supervisión de partidas en las tres sedes.
            </p>
          </div>
        </div>
      </LivingBanner>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div
          className={`p-4 rounded-sm flex items-start gap-3 font-mono text-xs font-bold uppercase tracking-wider animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
              : 'bg-[#D9232E]/15 border border-[#D9232E]/40 text-[#D9232E]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. TELEMETRY MONOLITHS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            idx: '01',
            label: 'VOUCHERS EN AUDITORÍA',
            val: pendingPayments.length,
            sub: 'PENDIENTES DE APROBACIÓN YAPE/PLIN',
            color: pendingPayments.length > 0 ? 'text-[#C5A059]' : 'text-emerald-400',
          },
          {
            idx: '02',
            label: 'TORNEOS GESTIONADOS',
            val: tournaments.length,
            sub: 'PUBLICADOS EN CARTELERA OFICIAL',
            color: 'text-[var(--text-primary)]',
          },
          {
            idx: '03',
            label: 'INSCRITOS CONFIRMADOS',
            val: totalConfirmedParticipants,
            sub: 'COMPETIDORES Y ESCUADRAS ACTIVAS',
            color: 'text-[#D9232E]',
          },
          {
            idx: '04',
            label: 'CIRCUITO AUTORIZADO',
            val: 'TECSUP',
            sub: 'LIMA • AREQUIPA • NORTE',
            color: 'text-[#C5A059]',
          },
        ].map((item) => (
          <div key={item.idx} className="double-bezel">
            <div className="double-bezel-inner p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <span className="monolith-numeral text-6xl font-bold absolute top-2 right-3">
                {item.idx}
              </span>
              <div className="space-y-1 relative z-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] block">
                  {item.label}
                </span>
                <p className={`font-display text-4xl font-bold uppercase tabular-nums ${item.color}`}>
                  {item.val}
                </p>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-secondary)] pt-3 border-t border-[var(--border-card)] mt-3">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. INBOX: BANDEJA DE AUDITORÍA DE PAGOS YAPE / PLIN */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-sm bg-[#C5A059]/15 border border-[#C5A059]/35 text-[#C5A059] flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                  01 // AUDITORÍA FINANCIERA
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[var(--text-primary)]">
                  BANDEJA DE COMPROBANTES YAPE & PLIN
                </h2>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/35 self-start sm:self-center">
              {pendingPayments.length} POR VALIDAR
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#D9232E] mx-auto" />
              <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                SINCRONIZANDO COMPROBANTES...
              </p>
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="p-10 text-center bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-display text-xl font-bold uppercase text-[var(--text-primary)]">
                BANDEJA DE PAGOS AL DÍA
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                No existen vouchers pendientes de revisión en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((p) => {
                const game = GAME_CATALOG[p.game_code as GameCode];
                return (
                  <div
                    key={p.payment_id}
                    className="p-5 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] space-y-4 hover:border-[#D9232E]/50 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-primary)] bg-[var(--bg-card)] px-2.5 py-1 rounded-sm border border-[var(--border-card)] flex items-center gap-1.5">
                            <GameDisciplineEmblem
                              gameCode={p.game_code}
                              className="w-3.5 h-3.5 text-[#D9232E]"
                            />
                            {game?.name || p.game_code}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#C5A059] px-2.5 py-1 rounded-sm bg-[#C5A059]/10 border border-[#C5A059]/30">
                            {p.amount > 0
                              ? `S/ ${p.amount.toFixed(2)} PEN (${p.method})`
                              : 'INSCRIPCIÓN GRATUITA'}
                          </span>
                        </div>

                        <h3 className="font-display text-xl font-bold uppercase text-[var(--text-primary)]">
                          {p.competitor_name}
                        </h3>

                        <p className="text-xs text-[var(--text-secondary)]">
                          Torneo:{' '}
                          <strong className="text-[var(--text-primary)]">
                            {p.tournament_name}
                          </strong>{' '}
                          • {p.career}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleApprovePayment(p.payment_id)}
                          disabled={actionLoading === p.payment_id}
                          className="px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading === p.payment_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>APROBAR CUPO</span>
                        </button>

                        <button
                          onClick={() => handleRejectPayment(p.payment_id)}
                          disabled={actionLoading === p.payment_id}
                          className="px-3.5 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider bg-[#D9232E]/15 text-[#D9232E] hover:bg-[#D9232E]/25 border border-[#D9232E]/35 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>RECHAZAR</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-[var(--bg-card)] rounded-sm border border-[var(--border-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] font-mono">
                        <QrCode className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>
                          REF OPERACIÓN:{' '}
                          <strong className="text-[var(--text-primary)]">
                            {p.operation_reference || 'N/A'}
                          </strong>
                        </span>
                      </div>

                      {p.evidence_url && (
                        <button
                          type="button"
                          onClick={() => setViewingVoucherUrl(p.evidence_url || null)}
                          className="font-mono text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>INSPECCIONAR CAPTURA DE PAGO</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. GESTOR DE TORNEOS ACTIVOS */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-sm bg-[#D9232E]/15 border border-[#D9232E]/35 text-[#D9232E] flex items-center justify-center shrink-0">
                <BracketTreeIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9232E]">
                  02 // OPERACIONES DEPORTIVAS
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[var(--text-primary)]">
                  TORNEOS DE LA ORGANIZACIÓN ({tournaments.length})
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>NUEVO TORNEO</span>
              </button>
              <Link
                href="/tournaments"
                className="btn-secondary px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>CATÁLOGO PÚBLICO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t) => {
              const game = GAME_CATALOG[t.game_code as GameCode];
              const pct = Math.min(
                100,
                Math.round((t.current_participants / Math.max(1, t.max_slots)) * 100)
              );
              return (
                <div
                  key={t.id}
                  className="p-5 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] hover:border-[#F4F2ED]/25 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-secondary)] flex items-center gap-1.5">
                        <GameDisciplineEmblem
                          gameCode={t.game_code}
                          className="w-3.5 h-3.5 text-[#D9232E]"
                        />
                        {game?.name || t.game_code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase tracking-wider ${
                          t.status === 'IN_PROGRESS'
                            ? 'bg-[#D9232E] text-white'
                            : t.status === 'REGISTRATION_OPEN'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35'
                              : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-card)]'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold uppercase text-[var(--text-primary)] line-clamp-1">
                      {t.name}
                    </h3>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)]">
                        <span>OCUPACIÓN DE CUPOS</span>
                        <span className="font-bold text-[var(--text-primary)] tabular-nums">
                          {t.current_participants} / {t.max_slots}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-card)] border border-[var(--border-card)]">
                        <div className="h-full bg-[#D9232E]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] pt-1">
                      <span className="text-[#C5A059] font-bold truncate max-w-[180px]">
                        {t.prize_pool}
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {t.cost && Number(t.cost) > 0
                          ? `S/ ${Number(t.cost).toFixed(2)}`
                          : 'ENTRADA LIBRE'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-card)] grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="btn-secondary py-2 px-3 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>PARÁMETROS</span>
                    </button>

                    <Link
                      href={`/tournaments/${t.slug}`}
                      className="btn-primary py-2 px-3 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <span>LLAVES & SCORE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ====================================================================
          STUDIO MODAL: CREATE TOURNAMENT WITH LIVE WIDESCREEN PREVIEW
          ==================================================================== */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-6xl max-h-[92vh] double-bezel flex flex-col">
            <div className="double-bezel-inner flex flex-col max-h-[90vh] overflow-hidden">
              {/* Top Studio Header */}
              <div className="px-6 py-4 border-b border-[var(--border-card)] bg-[var(--bg-arena)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-[#D9232E] text-white flex items-center justify-center">
                    <CommandConsoleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9232E] block">
                      ESTUDIO DE CREACIÓN DE COMPETICIÓN
                    </span>
                    <h3 className="font-display text-xl font-bold uppercase text-[var(--text-primary)]">
                      PUBLICAR NUEVO TORNEO OFICIAL
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-sm bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 2-Column Studio Body (Left: Form, Right: Live Preview) */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: CONFIGURATION FORM (7 Cols) */}
                <form
                  id="create-tournament-form"
                  onSubmit={handleCreateTournament}
                  className="lg:col-span-7 space-y-6"
                >
                  {/* Visual Discipline Picker */}
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      01 // SELECCIONA LA DISCIPLINA OFICIAL
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {GAME_LIST.map((g) => {
                        const active = newTourGame === g.code;
                        return (
                          <button
                            key={g.code}
                            type="button"
                            onClick={() => {
                              sounds.playWoodClick();
                              setNewTourGame(g.code);
                            }}
                            className={`p-3 rounded-sm border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                              active
                                ? 'bg-[#D9232E]/15 border-[#D9232E] text-[var(--text-primary)]'
                                : 'bg-[var(--bg-arena)] border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            <GameDisciplineEmblem
                              gameCode={g.code}
                              className={`w-4 h-4 shrink-0 ${active ? 'text-[#D9232E]' : 'text-[var(--text-muted)]'}`}
                            />
                            <span className="font-mono text-[11px] font-bold uppercase truncate">
                              {g.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tournament Name */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      02 // TÍTULO OFICIAL DEL TORNEO
                    </label>
                    <input
                      type="text"
                      required
                      value={newTourName}
                      onChange={(e) => setNewTourName(e.target.value)}
                      placeholder="Ej. Copa Nacional Inter-Sedes Dota 2 — Apertura 2026"
                      className="input-arena font-display text-base font-bold"
                    />
                  </div>

                  {/* Slots, Team Size, Modality & Campus */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          TAMAÑO DE LLAVE (CUPOS)
                        </label>
                        <span className="font-mono text-[10px] text-[#C5A059] font-bold">
                          {newTourTeamSize > 1
                            ? `${newTourSlots} ESCUADRAS`
                            : `${newTourSlots} COMPETIDORES`}
                        </span>
                      </div>
                      <select
                        value={newTourSlots}
                        onChange={(e) => setNewTourSlots(Number(e.target.value))}
                        className="input-arena text-xs font-mono"
                      >
                        <option value={8}>8 CUPOS (CUARTOS DE FINAL)</option>
                        <option value={16}>16 CUPOS (OCTAVOS DE FINAL)</option>
                        <option value={32}>32 CUPOS (DIECISEISAVOS)</option>
                        <option value={64}>64 CUPOS (GRAN ABIERTO)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        FORMATO DE EQUIPO
                      </label>
                      <select
                        value={newTourTeamSize}
                        onChange={(e) => {
                          const size = Number(e.target.value);
                          setNewTourTeamSize(size);
                          if (size > 1) {
                            setNewTourRules(
                              `1. Modalidad ${size} vs ${size}.\n2. El capitán inscribe a la escuadra completa.\n3. Desconexiones: 3 minutos de pausa técnica.`
                            );
                          } else {
                            setNewTourRules(
                              '1. Formato 1vs1 BO3.\n2. Baneo de 1 carta/personaje por mutuo acuerdo.\n3. Desconexiones: 30 segundos de espera.'
                            );
                          }
                        }}
                        className="input-arena text-xs font-mono"
                      >
                        <option value={1}>1 VS 1 (INDIVIDUAL / SOLOS)</option>
                        <option value={2}>2 VS 2 (DÚOS)</option>
                        <option value={3}>3 VS 3 (TRÍOS / BRAWL STARS)</option>
                        <option value={4}>4 VS 4 (ESCUADRAS L4D2 / FORTNITE)</option>
                        <option value={5}>5 VS 5 (EQUIPOS DOTA 2)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        MODALIDAD DEL EVENTO
                      </label>
                      <select
                        value={newTourEventModality}
                        onChange={(e) => setNewTourEventModality(e.target.value as any)}
                        className="input-arena text-xs font-mono"
                      >
                        <option value="PRESENTIAL">100% PRESENCIAL (CAMPUS TECSUP)</option>
                        <option value="ONLINE">100% VIRTUAL / REMOTO</option>
                        <option value="HYBRID">HÍBRIDO (PREVIAS ONLINE • FINAL PRESENCIAL)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        SEDE ORGANIZADORA
                      </label>
                      <select
                        value={newTourCampus}
                        onChange={(e) => setNewTourCampus(e.target.value)}
                        className="input-arena text-xs font-mono"
                      >
                        <option value="Lima">SEDE LIMA (SANTA ANITA)</option>
                        <option value="Arequipa">SEDE AREQUIPA</option>
                        <option value="Trujillo">SEDE NORTE (TRUJILLO)</option>
                      </select>
                    </div>
                  </div>

                  {/* Cost & Prize Pool */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        INSCRIPCIÓN (PEN — 0 PARA GRATUITO)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={newTourCost}
                        onChange={(e) => setNewTourCost(Number(e.target.value))}
                        className="input-arena font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        POZO TOTAL GARANTIZADO
                      </label>
                      <input
                        type="text"
                        required
                        value={newTourPrize}
                        onChange={(e) => setNewTourPrize(e.target.value)}
                        placeholder="Ej. S/ 500 + Trofeo Oficial"
                        className="input-arena font-mono"
                      />
                    </div>
                  </div>

                  {/* Prize Distribution */}
                  <div className="space-y-3 p-4 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)]">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C5A059] flex items-center gap-2">
                      <AegisTrophyIcon className="w-4 h-4 text-[#C5A059]" animated={false} />
                      <span>DESGLOSE DE PREMIOS POR PUESTO</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        value={newTourPrize1}
                        onChange={(e) => setNewTourPrize1(e.target.value)}
                        placeholder="1er Puesto"
                        className="input-arena text-xs"
                      />
                      <input
                        type="text"
                        value={newTourPrize2}
                        onChange={(e) => setNewTourPrize2(e.target.value)}
                        placeholder="2do Puesto"
                        className="input-arena text-xs"
                      />
                      <input
                        type="text"
                        value={newTourPrize3}
                        onChange={(e) => setNewTourPrize3(e.target.value)}
                        placeholder="3er Puesto"
                        className="input-arena text-xs"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3 p-4 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)]">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)] flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#D9232E]" />
                      <span>CRONOGRAMA OFICIAL</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] uppercase text-[var(--text-muted)]">
                          APERTURA REGISTRO
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={newTourRegOpen}
                          onChange={(e) => setNewTourRegOpen(e.target.value)}
                          className="input-arena text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] uppercase text-[var(--text-muted)]">
                          CIERRE REGISTRO
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={newTourRegClose}
                          onChange={(e) => setNewTourRegClose(e.target.value)}
                          className="input-arena text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] uppercase text-[var(--text-muted)]">
                          INICIO DE PARTIDAS
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={newTourStart}
                          onChange={(e) => setNewTourStart(e.target.value)}
                          className="input-arena text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Banner Preset Selector + Custom URL */}
                  <div className="space-y-3 p-4 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)]">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)] flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-[#D9232E]" />
                        <span>DIRECCIÓN DE ARTE / BANNER DEL TORNEO</span>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'ARTE DEL JUEGO', url: '' },
                        { label: 'ESTADIO ARENA', url: '/assets/arena_hero_stage.jpg' },
                        { label: 'TÚNEL PRO STAGE', url: '/assets/banner_stadium_tunnel.jpg' },
                        { label: 'SALA DE CONTROL', url: '/assets/banner_command_center.jpg' },
                        { label: 'TROFEO CAMPEÓN', url: '/assets/arena_trophy_pedestal.jpg' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setNewTourBanner(preset.url)}
                          className={`px-2.5 py-1 rounded-sm font-mono text-[9px] font-bold uppercase border cursor-pointer ${
                            newTourBanner === preset.url
                              ? 'bg-[#D9232E] text-white border-[#D9232E]'
                              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-card)]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={newTourBanner}
                      onChange={(e) => setNewTourBanner(e.target.value)}
                      placeholder={
                        GAME_BANNER_PRESETS[newTourGame] || '/games/clash_royale_banner.jpg'
                      }
                      className="input-arena text-xs font-mono"
                    />
                  </div>

                  {/* Series Format & Stream */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] uppercase text-[var(--text-muted)]">
                        FORMATO DE SERIES
                      </label>
                      <select
                        value={newTourSeriesFormat}
                        onChange={(e) => setNewTourSeriesFormat(e.target.value)}
                        className="input-arena text-xs"
                      >
                        <option value="Semis BO3 • Final BO5 (Previas BO1)">
                          Previas BO1 • Semis BO3 • Final BO5
                        </option>
                        <option value="Todas las rondas BO3">Todas las rondas BO3</option>
                        <option value="Previas BO3 • Gran Final BO5">
                          Previas BO3 • Gran Final BO5
                        </option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] uppercase text-[var(--text-muted)]">
                        PLATAFORMA STREAM
                      </label>
                      <select
                        value={newTourStreamPlatform}
                        onChange={(e) => setNewTourStreamPlatform(e.target.value)}
                        className="input-arena text-xs font-mono"
                      >
                        <option value="KICK">KICK</option>
                        <option value="YOUTUBE">YOUTUBE</option>
                        <option value="TIKTOK">TIKTOK LIVE</option>
                        <option value="TWITCH">TWITCH</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] uppercase text-[var(--text-muted)]">
                        CANAL / USUARIO STREAM
                      </label>
                      <input
                        type="text"
                        value={newTourStreamUrl}
                        onChange={(e) => setNewTourStreamUrl(e.target.value)}
                        placeholder="lusen15"
                        className="input-arena text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Description & Rules */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        RESUMEN EJECUTIVO
                      </label>
                      <input
                        type="text"
                        required
                        value={newTourDesc}
                        onChange={(e) => setNewTourDesc(e.target.value)}
                        className="input-arena text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        REGLAMENTO OFICIAL DE COMPETICIÓN
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={newTourRules}
                        onChange={(e) => setNewTourRules(e.target.value)}
                        className="input-arena resize-none text-xs font-mono"
                      />
                    </div>
                  </div>
                </form>

                {/* RIGHT COLUMN: REAL-TIME ARCHITECTURAL PREVIEW (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="sticky top-0 space-y-4">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059]">
                      <span className="flex items-center gap-2">
                        <LiveWaveformIcon className="w-4 h-3.5 text-[#D9232E]" />
                        VISTA PREVIA EN TIEMPO REAL
                      </span>
                      <span>CARTELERA PÚBLICA</span>
                    </div>

                    {/* Live Preview Monolith Card */}
                    <div className="double-bezel">
                      <div className="double-bezel-inner overflow-hidden">
                        <div className="h-[2px] w-full bg-[#D9232E]" />
                        <div className="relative h-56 w-full bg-[#070709] overflow-hidden">
                          <img
                            src={previewBannerUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover opacity-85 contrast-[1.06]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-[#0D0D10]/30 to-black/40" />

                          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-sm bg-[#09090B]/90 border border-[#F4F2ED]/15 font-mono text-[10px] font-bold uppercase text-[#F4F2ED] flex items-center gap-2">
                              <GameDisciplineEmblem
                                gameCode={newTourGame}
                                className="w-3.5 h-3.5 text-[#D9232E]"
                              />
                              {previewGameDef?.name || newTourGame}
                            </span>
                            <span className="px-2.5 py-1 rounded-sm bg-[#09090B]/90 border border-emerald-500/40 font-mono text-[10px] font-bold uppercase text-emerald-400">
                              INSCRIPCIONES
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between">
                            <span className="px-3 py-1 rounded-sm bg-[#09090B]/90 border border-[#C5A059]/40 font-mono text-[11px] font-bold text-[#C5A059] uppercase">
                              {newTourPrize || 'S/ 400 + Trofeo'}
                            </span>
                            <span className="px-2.5 py-1 rounded-sm bg-[#09090B]/90 border border-[#F4F2ED]/15 font-mono text-[10px] font-bold text-[#F4F2ED]">
                              {Number(newTourCost) === 0
                                ? 'ENTRADA LIBRE'
                                : `S/. ${Number(newTourCost).toFixed(2)}`}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-[#D9232E]" />
                              SEDE {newTourCampus.toUpperCase()}
                            </span>
                            <span>
                              {newTourTeamSize > 1
                                ? `${newTourTeamSize} VS ${newTourTeamSize}`
                                : '1 VS 1'}
                            </span>
                          </div>

                          <h4 className="font-display text-2xl font-bold uppercase text-[var(--text-primary)]">
                            {newTourName.trim() || `COPA OFICIAL ${previewGameDef?.name || ''}`}
                          </h4>

                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                            {newTourDesc}
                          </p>

                          <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between font-mono text-[10px] uppercase text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#C5A059]" />0 / {newTourSlots}{' '}
                              CUPOS
                            </span>
                            <span className="text-[#D9232E] font-bold">
                              {newTourEventModality === 'ONLINE'
                                ? '100% ONLINE'
                                : newTourEventModality === 'HYBRID'
                                  ? 'HÍBRIDO'
                                  : 'PRESENCIAL'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Studio Submit Bar */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="btn-secondary py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-center cursor-pointer"
                      >
                        CANCELAR
                      </button>
                      <button
                        type="submit"
                        form="create-tournament-form"
                        disabled={actionLoading === 'creating-tour'}
                        className="btn-primary py-3.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading === 'creating-tour' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>PUBLICANDO...</span>
                          </>
                        ) : (
                          <>
                            <Trophy className="w-4 h-4" />
                            <span>PUBLICAR TORNEO</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TOURNAMENT MODAL */}
      {editingTour && (
        <EditTournamentModal
          isOpen={!!editingTour}
          onClose={() => setEditingTour(null)}
          tournament={editingTour}
          onSuccess={() => {
            fetchData();
            setFeedback({ type: 'success', message: '¡Torneo actualizado exitosamente!' });
          }}
        />
      )}

      {/* VOUCHER INSPECTION LIGHTBOX MODAL */}
      {viewingVoucherUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setViewingVoucherUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full double-bezel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="double-bezel-inner p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                <h4 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C5A059] flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  AUDITORÍA DE COMPROBANTE DE PAGO
                </h4>
                <button
                  onClick={() => setViewingVoucherUrl(null)}
                  className="p-1 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-auto rounded-sm bg-black/70 border border-[var(--border-card)] flex items-center justify-center p-2">
                <img
                  src={viewingVoucherUrl}
                  alt="Comprobante en alta resolución"
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                <span>Verifica monto, fecha y número de operación con tu app de Yape/Plin.</span>
                <a
                  href={viewingVoucherUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-3.5 py-2 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ABRIR ORIGINAL</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
