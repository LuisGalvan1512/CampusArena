'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fireCelebration } from '@/lib/confetti';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { GAME_CATALOG, type GameCode } from '@/lib/games';
import { getEffectiveStatus, formatCountdown, useNowTick } from '@/lib/registrationWindow';

const BracketView = dynamic(
  () => import('@/components/BracketView').then((m) => m.BracketView),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-12 text-[var(--text-muted)] gap-3">
        <div className="w-5 h-5 border-2 border-[#D9232E] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-wider">
          CARGANDO MOTOR DE LLAVES...
        </span>
      </div>
    ),
  }
);

const RegistrationWizardModal = dynamic(
  () => import('@/components/RegistrationWizardModal').then((m) => m.RegistrationWizardModal),
  { ssr: false }
);

const EditTournamentModal = dynamic(
  () => import('@/components/EditTournamentModal').then((m) => m.EditTournamentModal),
  { ssr: false }
);

const DeleteTournamentModal = dynamic(
  () => import('@/components/DeleteTournamentModal').then((m) => m.DeleteTournamentModal),
  { ssr: false }
);

import { AnimatedCounter } from '@/components/AnimatedCounter';
import { LivingBanner } from '@/components/LivingBanner';
import {
  GameDisciplineEmblem,
  LiveWaveformIcon,
  AegisTrophyIcon,
  BracketTreeIcon,
  CommandConsoleIcon,
} from '@/components/EsportsIcons';
import {
  Trophy,
  Swords,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Mail,
  UserCheck,
  GitBranch,
  Crown,
  ExternalLink,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';

interface TournamentDetail {
  id: string;
  name: string;
  slug: string;
  game_code: string;
  organization_name: string;
  campus_name: string;
  description_short: string;
  description_full: string;
  banner_url: string;
  rules_text: string;
  status:
    | 'DRAFT'
    | 'PUBLISHED'
    | 'REGISTRATION_OPEN'
    | 'REGISTRATION_CLOSED'
    | 'IN_PROGRESS'
    | 'FINISHED'
    | 'CANCELLED';
  max_slots: number;
  min_slots: number;
  current_participants: number;
  cost: number | string;
  currency: string;
  prize_pool: string;
  format: string;
  team_size?: number;
  stream_url?: string | null;
  stream_platform?: string | null;
  registration_open_at: string;
  registration_close_at: string;
  tournament_start_at: string;
  is_online: boolean;
  event_modality?: 'PRESENTIAL' | 'ONLINE' | 'HYBRID' | string;
  prize_distribution?: {
    first_place?: string;
    second_place?: string;
    third_place?: string;
  } | null;
  contact_email: string;
}

interface Participant {
  id: string;
  user_id?: string;
  competitor_name: string;
  nickname?: string | null;
  email?: string;
  avatar_url?: string | null;
  campus?: string;
  in_game_name: string;
  player_tag: string;
  trophies: number;
  level: number;
  team_name?: string | null;
  roster_members?: any;
  status: string;
  confirmed_at?: string;
}

function TournamentCountdown({ targetDate, status }: { targetDate: string; status: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPassed: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds: Math.floor((diff / 1000) % 60),
        isPassed: false,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (status === 'IN_PROGRESS') {
    return (
      <div className="p-4 rounded-sm bg-[#D9232E]/15 border border-[#D9232E]/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LiveWaveformIcon className="w-4 h-3.5 text-[#D9232E]" />
          <span className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-[#F4F2ED]">
            PARTIDAS EN DISPUTA
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-white bg-[#D9232E] px-2.5 py-0.5 rounded-sm uppercase">
          EN VIVO
        </span>
      </div>
    );
  }

  if (status === 'FINISHED') {
    return (
      <div className="p-4 rounded-sm bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-[#C5A059]" />
          <span className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-[#C5A059]">
            TORNEO CONCLUIDO
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#C5A059] uppercase font-bold">
          PODIO OFICIAL
        </span>
      </div>
    );
  }

  if (timeLeft.isPassed) {
    return (
      <div className="p-4 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#C5A059]" />
          <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">
            CHECK-IN ACTIVO
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#C5A059] font-bold uppercase">EN BREVE</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)]">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5 text-[#D9232E] font-bold">
          <span className="w-1.5 h-1.5 bg-[#D9232E] animate-pulse" />
          CUENTA REGRESIVA
        </span>
        <span>APERTURA DE ARENA</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'DÍAS', val: timeLeft.days },
          { label: 'HRS', val: timeLeft.hours },
          { label: 'MIN', val: timeLeft.minutes },
          { label: 'SEG', val: timeLeft.seconds },
        ].map((unit, idx) => (
          <div
            key={idx}
            className="bg-[var(--bg-card)] rounded-sm py-2.5 border border-[var(--border-card)]"
          >
            <span className="text-lg font-display font-bold text-[var(--text-primary)] block leading-none tabular-nums">
              {String(unit.val).padStart(2, '0')}
            </span>
            <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] block mt-1 tracking-[0.16em]">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TournamentDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isOrganizer } = useAuth();
  const canManage =
    isAuthenticated &&
    (isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER');

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedTeamRoster, setSelectedTeamRoster] = useState<Participant | null>(null);
  const [bracket, setBracket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'info' | 'rules' | 'prizes' | 'participants' | 'brackets'
  >('info');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [wizardInitialRegId, setWizardInitialRegId] = useState<string | null>(null);
  const [isBracketFullWidth, setIsBracketFullWidth] = useState(true);

  const nowMs = useNowTick([tournament?.registration_open_at, tournament?.registration_close_at], {
    fine: true,
  });

  const fetchTournament = useCallback(
    async (isInitial = false) => {
      if (!slug) return;
      if (isInitial) {
        setIsLoading(true);
      }
      const res = await api.get(`/tournaments/${slug}`);
      if (res.success && res.data) {
        setTournament(res.data);

        const partRes = await api.get(`/tournaments/${res.data.id}/participants`);
        if (partRes.success && Array.isArray(partRes.data)) {
          const seen = new Set<string>();
          const unique = partRes.data.filter((item: Participant) => {
            const key = item.user_id || item.id;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setParticipants(unique);
        }

        const bracketRes = await api.get(`/tournaments/${res.data.id}/bracket`);
        if (bracketRes.success && bracketRes.data) {
          setBracket(bracketRes.data);
        }
      }
      if (isInitial) {
        setIsLoading(false);
      }
    },
    [slug]
  );

  const [isCancellingPending, setIsCancellingPending] = useState(false);

  const fetchUserRegistrationStatus = async (tournamentId: string) => {
    if (!isAuthenticated) return;
    const res = await api.get('/registrations/me', { skipCache: true });
    if (res.success && Array.isArray(res.data)) {
      const regs = res.data.filter(
        (r: any) => r.tournament_id === tournamentId && r.status !== 'CANCELLED'
      );
      const activeReg =
        regs.find((r: any) => r.status === 'CONFIRMED') ||
        regs.find((r: any) => r.status === 'PAYMENT_UNDER_REVIEW') ||
        regs.find((r: any) => r.status === 'PENDING_PAYMENT') ||
        regs.find((r: any) => r.status === 'CORRECTION_REQUIRED') ||
        regs.find((r: any) => r.status === 'REJECTED');

      setUserRegistration(activeReg || null);
    } else {
      setUserRegistration(null);
    }
  };

  const handleCancelPendingRegistration = async (registrationId: string) => {
    if (
      !confirm(
        '¿Deseas cancelar esta solicitud de inscripción pendiente? Tu cuenta quedará libre para iniciar una nueva inscripción cuando gustes.'
      )
    ) {
      return;
    }
    setIsCancellingPending(true);
    const res = await api.post(`/registrations/${registrationId}/cancel`);
    if (res.success) {
      toast.info('Solicitud cancelada exitosamente.');
      setUserRegistration(null);
      if (tournament) {
        fetchUserRegistrationStatus(tournament.id);
      }
    } else {
      toast.error(res.error?.message || 'Error al cancelar la solicitud.');
    }
    setIsCancellingPending(false);
  };

  useEffect(() => {
    fetchTournament(true);
  }, [fetchTournament]);

  useEffect(() => {
    if (tournament && isAuthenticated) {
      fetchUserRegistrationStatus(tournament.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D9232E]" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          CARGANDO EXPEDIENTE DEL TORNEO...
        </p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="widescreen-container py-20 text-center space-y-4">
        <h2 className="font-display text-3xl font-bold uppercase text-[var(--text-primary)]">
          TORNEO NO ENCONTRADO
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          El torneo que buscas no existe o ha sido despublicado.
        </p>
        <Link
          href="/tournaments"
          className="btn-primary px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider inline-block"
        >
          VOLVER AL CATÁLOGO
        </Link>
      </div>
    );
  }

  const gameDef = GAME_CATALOG[tournament.game_code as GameCode];
  const startDate = new Date(tournament.tournament_start_at).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const closeDate = new Date(tournament.registration_close_at).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const openDate = new Date(tournament.registration_open_at).toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const effectiveStatus = getEffectiveStatus(tournament, nowMs);
  const registrationOpenMs = new Date(tournament.registration_open_at).getTime();
  const registrationCloseMs = new Date(tournament.registration_close_at).getTime();
  const isFull = tournament.current_participants >= tournament.max_slots;
  const isFreeTournament = Number(tournament.cost) === 0;

  const handleRegisterClick = () => {
    if (effectiveStatus !== 'REGISTRATION_OPEN') {
      toast.info(
        effectiveStatus === 'PUBLISHED'
          ? `Las inscripciones abren el ${openDate}.`
          : 'Las inscripciones de este torneo ya están cerradas.'
      );
      return;
    }
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setWizardInitialRegId(null);
    setIsWizardOpen(true);
  };

  const getStatusBadge = () => {
    switch (effectiveStatus) {
      case 'REGISTRATION_OPEN':
        return (
          <span className="px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.18em] bg-[#09090B]/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
            INSCRIPCIONES ABIERTAS
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.18em] bg-[#D9232E] text-white flex items-center gap-2">
            <LiveWaveformIcon className="w-3.5 h-3 text-white" />
            EN JUEGO • LLAVES ACTIVAS
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.18em] bg-[#09090B]/90 text-[#C5A059] border border-[#C5A059]/40">
            PRÓXIMAMENTE
          </span>
        );
      case 'REGISTRATION_CLOSED':
        return (
          <span className="px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.18em] bg-[#09090B]/90 text-amber-400 border border-amber-500/40">
            INSCRIPCIONES CERRADAS
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.18em] bg-[#09090B]/90 text-[#C5A059] border border-[#C5A059]/40 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            TORNEO CONCLUIDO
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-[0.18em] bg-[#09090B]/90 text-[#A3A19A]">
            {effectiveStatus}
          </span>
        );
    }
  };

  return (
    <div className="widescreen-container py-6 sm:py-8 space-y-8 pb-24">
      {/* Top Breadcrumb & Broadcast Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-secondary)] hover:text-[#D9232E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER AL CATÁLOGO DE TORNEOS</span>
        </Link>

        <div className="flex items-center gap-3 bg-[var(--bg-card)] px-4 py-2 rounded-sm border border-[var(--border-card)] text-xs font-mono">
          <LiveWaveformIcon className="w-4 h-3.5 text-[#D9232E]" />
          <span className="text-[var(--text-muted)] uppercase tracking-wider">SEÑAL:</span>
          <Link
            href="/live"
            className="font-bold text-emerald-400 hover:underline flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>{tournament.stream_platform || 'KICK'} EN VIVO</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          {tournament.team_size && tournament.team_size > 1 && (
            <>
              <span className="text-[var(--text-muted)]">|</span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/35 uppercase">
                ESCUADRAS {tournament.team_size}V{tournament.team_size}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ORGANIZER / ADMIN OPERATIONS DECK */}
      {canManage && (
        <div className="double-bezel">
          <div className="double-bezel-inner p-4 sm:p-5 bg-[#111116] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-sm bg-[#D9232E]/15 border border-[#D9232E]/40 text-[#D9232E] flex items-center justify-center shrink-0">
                <CommandConsoleIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#F4F2ED] uppercase tracking-[0.18em]">
                    CONSOLA DE OPERACIONES DEL TORNEO
                  </span>
                  <span className="px-2 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase tracking-wider bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">
                    {user?.role === 'ADMIN' ? 'ROOT ADMIN' : 'ORGANIZADOR OFICIAL'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Modifica parámetros en caliente, administra el árbol de llaves o reporta
                  marcadores arbitrales.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-primary py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-[0.14em] flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDITAR TORNEO</span>
              </button>

              <button
                onClick={() => setActiveTab('brackets')}
                className="btn-secondary py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-[0.14em] flex items-center gap-2 cursor-pointer"
              >
                <BracketTreeIcon className="w-3.5 h-3.5 text-[#D9232E]" />
                <span>ADMINISTRAR LLAVES</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="py-2.5 px-4 rounded-sm font-mono text-xs font-bold uppercase tracking-[0.14em] bg-[#D9232E]/15 hover:bg-[#D9232E]/25 text-[#D9232E] border border-[#D9232E]/35 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ELIMINAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. MONUMENTAL LIVING HERO BANNER */}
      <LivingBanner
        imageSrc={tournament.banner_url || gameDef?.bannerUrl || '/games/clash_royale_banner.jpg'}
        fallbackSrc={gameDef?.bannerUrl || '/games/clash_royale_banner.jpg'}
        alt={tournament.name}
        heightClassName="min-h-[380px] sm:min-h-[460px] flex flex-col justify-between"
        overlayVariant="stadium"
        telemetryTag={`ID // ${tournament.slug.toUpperCase().slice(0, 24)}`}
      >
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between h-full space-y-10">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="px-3.5 py-1.5 rounded-sm bg-[#09090B]/92 border border-[#F4F2ED]/15 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#F4F2ED] flex items-center gap-2.5">
              <GameDisciplineEmblem
                gameCode={tournament.game_code}
                className="w-4 h-4 text-[#D9232E]"
              />
              <span>{gameDef?.name || tournament.game_code}</span>
            </div>

            {getStatusBadge()}
          </div>

          {/* Bottom Title, Modality & Prize */}
          <div className="space-y-4 max-w-5xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F4F2ED] bg-[#09090B]/90 px-3.5 py-1.5 rounded-sm border border-[#F4F2ED]/15">
                <MapPin className="w-3.5 h-3.5 text-[#D9232E] shrink-0" />
                <span>
                  {tournament.event_modality === 'ONLINE' ||
                  (tournament.is_online && tournament.event_modality !== 'PRESENTIAL')
                    ? `${tournament.organization_name} • 100% REMOTO`
                    : tournament.event_modality === 'HYBRID'
                      ? `${tournament.organization_name} • SEDE ${tournament.campus_name.toUpperCase()} (HÍBRIDO)`
                      : `${tournament.organization_name} • SEDE ${tournament.campus_name.toUpperCase()} (PRESENCIAL)`}
                </span>
              </div>

              {tournament.prize_pool && (
                <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#C5A059] bg-[#09090B]/90 px-3.5 py-1.5 rounded-sm border border-[#C5A059]/40">
                  <AegisTrophyIcon className="w-3.5 h-3.5 text-[#C5A059] shrink-0" animated={false} />
                  <span>POZO: {tournament.prize_pool}</span>
                </div>
              )}
            </div>

            <h1 className="font-display text-[clamp(2.4rem,5.8vw,5.4rem)] font-bold text-[#F4F2ED] tracking-[-0.03em] leading-[0.92] uppercase">
              {tournament.name}
            </h1>
          </div>
        </div>
      </LivingBanner>

      {/* 2. MAIN CONTENT GRID */}
      <div
        className={`grid grid-cols-1 ${
          activeTab === 'brackets' && isBracketFullWidth ? 'lg:grid-cols-1' : 'lg:grid-cols-12'
        } gap-8 items-start`}
      >
        {/* LEFT COLUMN: ARCHITECTURAL TABS & DETAILS */}
        <div
          className={`${
            activeTab === 'brackets' && isBracketFullWidth ? 'lg:col-span-1' : 'lg:col-span-8'
          } space-y-6`}
        >
          {/* Architectural Tabs Deck */}
          <div className="flex items-center border-b border-[var(--border-card)] bg-[var(--bg-card)] overflow-x-auto no-scrollbar rounded-t-sm">
            {[
              { id: 'info', code: '01', label: 'EXPEDIENTE', icon: FileText },
              { id: 'brackets', code: '02', label: 'LLAVES & BRACKET', icon: GitBranch },
              { id: 'rules', code: '03', label: 'REGLAMENTO', icon: ShieldCheck },
              { id: 'prizes', code: '04', label: 'POZO & PREMIOS', icon: Trophy },
              {
                id: 'participants',
                code: '05',
                label: `INSCRITOS (${participants.length})`,
                icon: UserCheck,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer flex items-center gap-2.5 shrink-0 ${
                    isActive
                      ? 'text-[var(--text-primary)] bg-[#F4F2ED]/[0.03]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="text-[9px] text-[var(--text-muted)]">{tab.code}</span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D9232E]' : ''}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTournamentTabLaser"
                      className="absolute bottom-0 inset-x-0 h-[2px] bg-[#D9232E]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Tab: Brackets */}
              {activeTab === 'brackets' && (
                <div className="space-y-4">
                  <BracketView
                    tournamentId={tournament.id}
                    initialBracket={bracket}
                    onUpdate={() => fetchTournament(false)}
                    isFullWidth={isBracketFullWidth}
                    onToggleFullWidth={() => setIsBracketFullWidth(!isBracketFullWidth)}
                  />
                </div>
              )}

              {/* Tab 1: Info */}
              {activeTab === 'info' && (
                <div className="double-bezel">
                  <div className="double-bezel-inner p-6 sm:p-10 space-y-8">
                    <div className="space-y-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9232E]">
                        DESCRIPCIÓN OFICIAL
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[var(--text-primary)]">
                        ESPECIFICACIONES DE LA COMPETICIÓN
                      </h3>
                      <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                        {tournament.description_full}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[var(--border-card)]">
                      <div className="p-5 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] space-y-1.5">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          MODALIDAD DEL EVENTO
                        </p>
                        <p className="font-display text-lg font-bold uppercase text-[var(--text-primary)]">
                          {tournament.event_modality === 'ONLINE' ||
                          (tournament.is_online && tournament.event_modality !== 'PRESENTIAL')
                            ? '100% ONLINE / REMOTO'
                            : tournament.event_modality === 'HYBRID'
                              ? `HÍBRIDO (PREVIAS ONLINE • FINAL EN SEDE ${tournament.campus_name.toUpperCase()})`
                              : `100% PRESENCIAL (CAMPUS TECSUP ${tournament.campus_name.toUpperCase()})`}
                        </p>
                      </div>
                      <div className="p-5 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] space-y-1.5">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          FORMATO DE SERIE
                        </p>
                        <p className="font-display text-lg font-bold uppercase text-[var(--text-primary)]">
                          {tournament.format}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Rules */}
              {activeTab === 'rules' && (
                <div className="double-bezel">
                  <div className="double-bezel-inner p-6 sm:p-10 space-y-6">
                    <div className="flex items-center gap-2.5 text-[#D9232E]">
                      <ShieldCheck className="w-5 h-5" />
                      <h3 className="font-display text-2xl font-bold uppercase text-[var(--text-primary)]">
                        REGLAMENTO OFICIAL DE ARBITRAJE
                      </h3>
                    </div>
                    <div className="p-6 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-line">
                      {tournament.rules_text}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Prizes */}
              {activeTab === 'prizes' && (
                <div className="double-bezel">
                  <div className="double-bezel-inner p-6 sm:p-10 space-y-6">
                    <div className="flex items-center gap-2.5 text-[#C5A059]">
                      <AegisTrophyIcon className="w-6 h-6 text-[#C5A059]" />
                      <h3 className="font-display text-2xl font-bold uppercase text-[var(--text-primary)]">
                        DISTRIBUCIÓN DE POZO Y PREMIOS
                      </h3>
                    </div>

                    <div className="p-6 rounded-sm bg-[var(--bg-arena)] border border-[#C5A059]/35 space-y-1">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                        POZO TOTAL GARANTIZADO
                      </p>
                      <p className="font-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)] uppercase">
                        {tournament.prize_pool}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 font-mono text-xs">
                      <div className="flex items-center justify-between p-4 bg-[var(--bg-arena)] rounded-sm border border-[#C5A059]/40">
                        <span className="font-bold text-[var(--text-primary)] uppercase">
                          01 // CAMPEÓN INSTITUCIONAL (1ER PUESTO)
                        </span>
                        <span className="font-bold text-[#C5A059]">
                          {tournament.prize_distribution?.first_place || tournament.prize_pool}
                        </span>
                      </div>

                      {tournament.prize_distribution?.second_place && (
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)]">
                          <span className="font-bold text-[var(--text-primary)] uppercase">
                            02 // SUBCAMPEÓN (2DO PUESTO)
                          </span>
                          <span className="font-bold text-[var(--text-secondary)]">
                            {tournament.prize_distribution.second_place}
                          </span>
                        </div>
                      )}

                      {tournament.prize_distribution?.third_place && (
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)]">
                          <span className="font-bold text-[var(--text-primary)] uppercase">
                            03 // PODIO DE BRONCE (3ER PUESTO)
                          </span>
                          <span className="font-bold text-[var(--text-secondary)]">
                            {tournament.prize_distribution.third_place}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Confirmed Participants */}
              {activeTab === 'participants' && (
                <div className="double-bezel">
                  <div className="double-bezel-inner p-6 sm:p-10 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-5 h-5 text-[#D9232E]" />
                        <h3 className="font-display text-2xl font-bold uppercase text-[var(--text-primary)]">
                          {tournament.team_size && tournament.team_size > 1
                            ? 'ESCUADRAS CONFIRMADAS'
                            : 'COMPETIDORES CONFIRMADOS'}
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-[#C5A059] font-bold uppercase">
                        {tournament.current_participants} / {tournament.max_slots} CUPOS
                      </span>
                    </div>

                    {participants.length === 0 ? (
                      <div className="p-10 text-center bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] space-y-2">
                        <p className="font-display text-xl font-bold uppercase text-[var(--text-primary)]">
                          REGISTRO ABIERTO PARA EL PRIMER COMPETIDOR
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Los participantes aparecerán aquí una vez validado su cupo.
                        </p>
                      </div>
                    ) : tournament.team_size && tournament.team_size > 1 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {participants.map((p) => {
                          const emblem = p.roster_members?.team_emblem || '🛡️';
                          const membersCount =
                            1 +
                            (Array.isArray(p.roster_members?.members)
                              ? p.roster_members.members.length
                              : Array.isArray(p.roster_members)
                                ? p.roster_members.length
                                : 0);

                          return (
                            <div
                              key={p.id}
                              className="p-4 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] hover:border-[#D9232E]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-sm bg-[var(--bg-card)] border border-[var(--border-card)] text-2xl flex items-center justify-center shrink-0">
                                  {emblem}
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-display text-lg font-bold uppercase text-[var(--text-primary)] truncate">
                                      {p.team_name || 'Escuadra Competitiva'}
                                    </h4>
                                    <span className="px-2 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase bg-[var(--bg-card)] text-[#C5A059] border border-[#C5A059]/30">
                                      {membersCount} JUGADORES
                                    </span>
                                  </div>
                                  <p className="text-xs text-[var(--text-secondary)]">
                                    Capitán:{' '}
                                    <strong className="text-[var(--text-primary)]">
                                      {p.competitor_name}
                                    </strong>
                                  </p>
                                  <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                                    {p.email || 'correo@tecsup.edu.pe'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedTeamRoster(p)}
                                  className="btn-secondary py-2 px-3.5 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Users className="w-3.5 h-3.5 text-[#D9232E]" />
                                  <span>VER ROSTER</span>
                                </button>
                                <span className="px-2.5 py-1.5 rounded-sm font-mono text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  {p.status === 'CONFIRMED' ? 'CONFIRMADO' : 'ESPERA'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {participants.map((p) => (
                          <Link
                            key={p.id}
                            href={p.user_id ? `/profile/${p.user_id}` : '#'}
                            className="p-4 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] hover:border-[#D9232E]/50 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-sm bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden flex items-center justify-center shrink-0">
                                {p.avatar_url ? (
                                  <img
                                    src={p.avatar_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-bold text-[var(--text-primary)]">
                                    {p.competitor_name?.charAt(0) || 'C'}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#D9232E] transition-colors truncate uppercase">
                                  {p.competitor_name}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                                  {p.email || 'correo@tecsup.edu.pe'}
                                </p>
                                <p className="text-[10px] font-mono text-[#C5A059] uppercase">
                                  SEDE {p.campus || 'TECSUP'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                              <span className="px-2 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {p.status === 'CONFIRMED' ? 'CONFIRMADO' : 'ESPERA'}
                              </span>
                              <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)] pt-1">
                                DOSSIER &rarr;
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: ARCHITECTURAL REGISTRATION CONSOLE */}
        <div
          className={`${
            activeTab === 'brackets' && isBracketFullWidth ? 'lg:col-span-1' : 'lg:col-span-4'
          } space-y-6`}
        >
          <div className="double-bezel sticky top-24">
            <div className="double-bezel-inner p-6 sm:p-7 space-y-6">
              <div className="space-y-1 pb-4 border-b border-[var(--border-card)]">
                <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--text-muted)]">
                  DERECHO DE INSCRIPCIÓN
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-[var(--text-primary)] uppercase tabular-nums">
                    {tournament.cost !== undefined &&
                    tournament.cost !== null &&
                    Number(tournament.cost) > 0
                      ? `S/ ${Number(tournament.cost).toFixed(2)} ${tournament.currency || 'PEN'}`
                      : 'ENTRADA LIBRE'}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                    /{' '}
                    {tournament.team_size && Number(tournament.team_size) > 1
                      ? 'POR ESCUADRA'
                      : 'POR COMPETIDOR'}
                  </span>
                </div>
              </div>

              <TournamentCountdown
                targetDate={tournament.tournament_start_at}
                status={tournament.status}
              />

              {userRegistration ? (
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-sm border space-y-2.5 ${
                      userRegistration.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 border-emerald-500/35'
                        : userRegistration.status === 'REJECTED'
                          ? 'bg-[#D9232E]/10 border-[#D9232E]/35'
                          : 'bg-[#C5A059]/10 border-[#C5A059]/35'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider">
                      {userRegistration.status === 'CONFIRMED' ? (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>CUPO CONFIRMADO</span>
                        </div>
                      ) : userRegistration.status === 'PENDING_PAYMENT' ? (
                        <div className="flex items-center gap-2 text-[#C5A059]">
                          <Clock className="w-4 h-4" />
                          <span>PAGO PENDIENTE DE VOUCHER</span>
                        </div>
                      ) : userRegistration.status === 'CORRECTION_REQUIRED' ? (
                        <div className="flex items-center gap-2 text-[#C5A059]">
                          <AlertCircle className="w-4 h-4" />
                          <span>VOUCHER OBSERVADO</span>
                        </div>
                      ) : userRegistration.status === 'REJECTED' ? (
                        <div className="flex items-center gap-2 text-[#D9232E]">
                          <XCircle className="w-4 h-4" />
                          <span>VOUCHER RECHAZADO</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#C5A059]">
                          <Clock className="w-4 h-4" />
                          <span>COMPROBANTE EN AUDITORÍA</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {userRegistration.status === 'CONFIRMED'
                        ? 'Tu cupo en el cuadro de llaves está asegurado.'
                        : userRegistration.status === 'PENDING_PAYMENT'
                          ? 'Sube tu comprobante de pago o cancela la solicitud para recomenzar.'
                          : userRegistration.status === 'CORRECTION_REQUIRED'
                            ? userRegistration.payment?.reviews?.[0]?.public_observation ||
                              'El organizador solicitó corregir tu comprobante.'
                            : userRegistration.status === 'REJECTED'
                              ? userRegistration.payment?.reviews?.[0]?.public_observation ||
                                'Tu comprobante previo fue observado. Puedes adjuntar uno nuevo.'
                              : 'Tu comprobante está siendo verificado por el comité organizador.'}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <Link
                        href="/profile"
                        className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D9232E] hover:underline"
                      >
                        MI DOSSIER &rarr;
                      </Link>

                      {['PENDING_PAYMENT', 'CORRECTION_REQUIRED', 'REJECTED'].includes(
                        userRegistration.status
                      ) && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isCancellingPending}
                            onClick={() => handleCancelPendingRegistration(userRegistration.id)}
                            className="font-mono text-[10px] uppercase text-[var(--text-muted)] hover:text-[#D9232E] transition-colors cursor-pointer"
                          >
                            {isCancellingPending ? 'Cancelando...' : 'Cancelar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setWizardInitialRegId(userRegistration.id);
                              setIsWizardOpen(true);
                            }}
                            className="btn-primary py-1.5 px-3 text-[10px] font-mono font-bold uppercase cursor-pointer"
                          >
                            SUBIR VOUCHER
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : effectiveStatus === 'REGISTRATION_OPEN' ? (
                <div className="space-y-2">
                  {isFull && isFreeTournament ? (
                    <button
                      type="button"
                      disabled
                      className="btn-secondary w-full py-4 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                    >
                      <Users className="w-4 h-4" />
                      <span>CUPOS AGOTADOS</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRegisterClick}
                      className="btn-primary w-full py-4 text-xs font-mono font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Swords className="w-4 h-4" />
                      <span>
                        {isFull
                          ? 'CUPOS LLENOS • LISTA DE ESPERA'
                          : 'CONFIRMAR INSCRIPCIÓN AL TORNEO'}
                      </span>
                    </button>
                  )}
                  {registrationCloseMs - nowMs <= 72 * 60 * 60 * 1000 && (
                    <p
                      role="timer"
                      className="text-center text-[10px] font-mono font-bold uppercase text-[#C5A059] flex items-center justify-center gap-1.5 pt-1"
                    >
                      <Clock className="w-3 h-3" />
                      CIERRA EN {formatCountdown(registrationCloseMs - nowMs)}
                    </p>
                  )}
                </div>
              ) : effectiveStatus === 'PUBLISHED' ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="btn-secondary w-full py-4 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4 text-[#C5A059]" />
                    <span>APERTURA PRÓXIMAMENTE</span>
                  </button>
                  <p className="text-center font-mono text-[10px] uppercase text-[var(--text-secondary)]">
                    ABRE EL {openDate} ({formatCountdown(registrationOpenMs - nowMs)})
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('brackets')}
                  className="btn-secondary w-full py-4 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BracketTreeIcon className="w-4 h-4 text-[#D9232E]" />
                  <span>INSCRIPCIONES CERRADAS • VER LLAVES</span>
                </button>
              )}

              {/* Technical Checklist */}
              <div className="space-y-4 text-xs pt-2 border-t border-[var(--border-card)]">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#D9232E] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      FECHA DE INICIO
                    </p>
                    <p className="font-bold text-[var(--text-primary)] capitalize">{startDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      CIERRE DE REGISTRO
                    </p>
                    <p className="font-bold text-[var(--text-primary)]">{closeDate}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
                    <span className="text-[var(--text-muted)]">OCUPACIÓN DE ARENA</span>
                    <span className="font-bold text-[var(--text-primary)] tabular-nums">
                      <AnimatedCounter target={tournament.current_participants} /> /{' '}
                      {tournament.max_slots} CUPOS
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-arena)] overflow-hidden border border-[var(--border-card)]">
                    <motion.div
                      className="h-full bg-[#D9232E]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          100,
                          Math.round((tournament.current_participants / tournament.max_slots) * 100)
                        )}%`,
                      }}
                      transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      CONTACTO DE ARBITRAJE
                    </p>
                    <p className="font-mono text-xs text-[var(--text-secondary)] truncate">
                      {tournament.contact_email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Wizard Modal */}
      <RegistrationWizardModal
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setWizardInitialRegId(null);
        }}
        initialRegistrationId={wizardInitialRegId || undefined}
        initialStep={wizardInitialRegId ? 3 : 1}
        rejectionObservation={
          userRegistration?.payment?.reviews?.[0]?.public_observation || undefined
        }
        tournament={{
          id: tournament.id,
          name: tournament.name,
          game_code: tournament.game_code,
          cost: tournament.cost,
          currency: tournament.currency,
          prize_pool: tournament.prize_pool,
          rules_text: tournament.rules_text,
          team_size: tournament.team_size || 1,
          format: tournament.format,
        }}
        onSuccess={() => {
          fireCelebration();
          toast.success('¡Inscripción registrada con éxito!');
          fetchTournament();
          fetchUserRegistrationStatus(tournament.id);
        }}
      />

      {/* Edit Tournament Modal */}
      <EditTournamentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tournament={tournament}
        onSuccess={(updated) => {
          setTournament(updated);
          fetchTournament();
        }}
      />

      {/* Delete Tournament Modal */}
      <DeleteTournamentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        tournamentId={tournament.id}
        tournamentName={tournament.name}
      />

      {/* TEAM ROSTER LIGHTBOX MODAL */}
      {selectedTeamRoster && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedTeamRoster(null)}
        >
          <div
            className="relative max-w-lg w-full double-bezel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="double-bezel-inner p-6 space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-sm bg-[var(--bg-arena)] text-2xl flex items-center justify-center border border-[var(--border-card)]">
                    {selectedTeamRoster.roster_members?.team_emblem || '🛡️'}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-[var(--text-primary)]">
                      {selectedTeamRoster.team_name || 'Escuadra'}
                    </h3>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                      ROSTER OFICIAL DE ESCUADRA
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeamRoster(null)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-sm hover:bg-[var(--bg-arena)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Capitán */}
                <div className="p-3.5 bg-[var(--bg-arena)] rounded-sm border border-[#D9232E]/45 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-sm bg-[var(--bg-card)] text-[#D9232E] font-bold flex items-center justify-center border border-[var(--border-card)] overflow-hidden shrink-0">
                      {selectedTeamRoster.avatar_url ? (
                        <img
                          src={selectedTeamRoster.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{selectedTeamRoster.competitor_name?.charAt(0) || 'C'}</span>
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate uppercase">
                          {selectedTeamRoster.competitor_name}
                        </p>
                        <span className="px-1.5 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase bg-[#D9232E] text-white">
                          CAPITÁN
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
                        {selectedTeamRoster.email}
                      </p>
                    </div>
                  </div>

                  {selectedTeamRoster.user_id && (
                    <Link
                      href={`/profile/${selectedTeamRoster.user_id}`}
                      className="btn-secondary py-1.5 px-3 text-[10px] font-mono font-bold uppercase shrink-0 ml-2"
                    >
                      DOSSIER
                    </Link>
                  )}
                </div>

                {/* Compañeros */}
                {(() => {
                  const members = Array.isArray(selectedTeamRoster.roster_members?.members)
                    ? selectedTeamRoster.roster_members.members
                    : Array.isArray(selectedTeamRoster.roster_members)
                      ? selectedTeamRoster.roster_members
                      : [];

                  return members.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[var(--bg-arena)] rounded-sm border border-[var(--border-card)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-sm bg-[var(--bg-card)] text-[var(--text-secondary)] font-bold flex items-center justify-center border border-[var(--border-card)] shrink-0">
                          {m.name?.charAt(0) || 'J'}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[var(--text-primary)] truncate uppercase">
                              {m.name || `Compañero ${idx + 1}`}
                            </p>
                            <span className="px-1.5 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-card)]">
                              {m.role || `JUGADOR ${idx + 2}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
                            {m.email || 'correo@tecsup.edu.pe'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
