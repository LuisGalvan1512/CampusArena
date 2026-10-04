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

// Dynamic imports for code-splitting heavy modals and interactive bracket
const BracketView = dynamic(
  () => import('@/components/BracketView').then((m) => m.BracketView),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-12 text-[var(--text-muted)] gap-3">
        <div className="w-5 h-5 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Cargando llaves y bracket interactivo...</span>
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
import { ScrollParallaxImage } from '@/components/ScrollParallaxImage';
import { 
  Trophy, 
  Swords, 
  Gamepad2, 
  Calendar, 
  MapPin, 
  Users, 
  ShieldCheck, 
  FileText, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mail, 
  UserCheck, 
  GitBranch,
  Flame,
  Crown,
  Tv,
  ExternalLink,
  Edit3,
  Trash2,
  Settings,
  Sparkles,
  X
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
  status: 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
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
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isPassed: boolean }>({
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
      const seconds = Math.floor((diff % 1000) / 1000);

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
      <div className="p-3.5 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/30 flex items-center justify-between shadow-lg shadow-[#E63946]/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-[#E63946]">Partidas en Disputa</span>
        </div>
        <span className="text-[11px] font-mono font-bold text-white bg-[#E63946] px-2.5 py-0.5 rounded-md shadow-sm">
          EN VIVO
        </span>
      </div>
    );
  }

  if (status === 'FINISHED') {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">Torneo Concluido</span>
        </div>
        <span className="text-[11px] font-mono text-amber-300 font-semibold">Podio Definido</span>
      </div>
    );
  }

  if (timeLeft.isPassed) {
    return (
      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-blue-400">Comenzando en breve...</span>
        </div>
        <span className="text-[10px] font-mono text-blue-300 font-bold">Check-in Activo</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-inner">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5 text-[#E63946] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse" />
          Cuenta Regresiva
        </span>
        <span className="text-[var(--text-secondary)]">Hora de Apertura</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {[
          { label: 'DÍAS', val: timeLeft.days },
          { label: 'HORAS', val: timeLeft.hours },
          { label: 'MIN', val: timeLeft.minutes },
          { label: 'SEG', val: timeLeft.seconds },
        ].map((unit, idx) => (
          <div key={idx} className="bg-white/5 rounded-xl py-2 border border-white/5 shadow-sm">
            <span className="text-base font-black font-mono text-white block leading-none tracking-tight">
              {String(unit.val).padStart(2, '0')}
            </span>
            <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] block mt-1 tracking-wider">
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
  const canManage = isAuthenticated && (isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER');

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedTeamRoster, setSelectedTeamRoster] = useState<Participant | null>(null);
  const [bracket, setBracket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'rules' | 'prizes' | 'participants' | 'brackets'>('info');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [isBracketFullWidth, setIsBracketFullWidth] = useState(true);

  const fetchTournament = useCallback(async (isInitial = false) => {
    if (!slug) return;
    if (isInitial) {
      setIsLoading(true);
    }
    const res = await api.get(`/tournaments/${slug}`);
    if (res.success && res.data) {
      setTournament(res.data);
      
      // Fetch participants list
      const partRes = await api.get(`/tournaments/${res.data.id}/participants`);
      if (partRes.success && partRes.data) {
        setParticipants(partRes.data);
      }

      // Fetch bracket
      const bracketRes = await api.get(`/tournaments/${res.data.id}/bracket`);
      if (bracketRes.success && bracketRes.data) {
        setBracket(bracketRes.data);
      }
    }
    if (isInitial) {
      setIsLoading(false);
    }
  }, [slug]);

  const fetchUserRegistrationStatus = async (tournamentId: string) => {
    if (!isAuthenticated) return;
    const res = await api.get('/registrations/me');
    if (res.success && Array.isArray(res.data)) {
      const reg = res.data.find((r: any) => r.tournament_id === tournamentId);
      if (reg) {
        setUserRegistration(reg);
      }
    }
  };

  useEffect(() => {
    fetchTournament(true);
  }, [fetchTournament]);

  useEffect(() => {
    if (tournament && isAuthenticated) {
      fetchUserRegistrationStatus(tournament.id);
    }
  }, [tournament, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
        <p className="text-xs text-[#8E92A4]">Cargando detalles del torneo...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Torneo no encontrado</h2>
        <p className="text-sm text-[var(--text-secondary)]">El torneo que buscas no existe o ha sido despublicado.</p>
        <Link href="/tournaments" className="btn-primary px-6 py-2.5 text-sm inline-block">
          Volver a Torneos
        </Link>
      </div>
    );
  }

  const gameDef = GAME_CATALOG[tournament.game_code as GameCode];
  const isClash = tournament.game_code === 'CLASH_ROYALE';
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

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setIsWizardOpen(true);
  };

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'REGISTRATION_OPEN':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Inscripciones Abiertas
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            En Juego • Brackets Activos
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#457B9D]/20 text-[#A8DADC] border border-[#457B9D]/30">
            Próximamente
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            Torneo Concluido
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-[#8E92A4]">
            {tournament.status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back navigation & Live stream bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link 
          href="/tournaments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo de Torneos
        </Link>

        {/* Live Stream Bar */}
        <div className="flex items-center gap-2.5 bg-[var(--bg-card)] px-4 py-1.5 rounded-full border border-[var(--border-card)] text-xs shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#E63946] animate-ping" />
          <span className="text-[var(--text-secondary)]">Transmisión:</span>
          <Link
            href="/live"
            className="font-bold text-emerald-500 dark:text-emerald-400 hover:underline flex items-center gap-1.5 transition-colors"
          >
            <span>{tournament.stream_platform || 'KICK'} en Vivo</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          {tournament.team_size && tournament.team_size > 1 && (
            <>
              <span className="text-[var(--text-secondary)]">•</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 dark:text-indigo-300 border border-indigo-500/30">
                Escuadras {tournament.team_size}v{tournament.team_size}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ORGANIZER / ADMIN MANAGEMENT TOOLBAR */}
      {canManage && (
        <div className="arena-card p-4 sm:p-5 bg-gradient-to-r from-indigo-500/10 via-[var(--bg-card)] to-[#E63946]/10 border border-amber-500/40 rounded-2xl shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Panel de Gestión de Torneo
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {user?.role === 'ADMIN' ? '👑 Super Admin' : '🛡️ Organizador Oficial'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8E92A4]">
                  Tienes privilegios para editar este torneo, gestionar brackets, participantes o eliminarlo en caso de excepción.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#E63946]/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar Torneo
              </button>

              <button
                onClick={() => {
                  setActiveTab('brackets');
                }}
                className="btn-secondary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#E63946]" />
                Brackets & Llaves
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="py-2 px-3.5 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 hover:border-red-500 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Torneo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden arena-card border border-white/10 shadow-2xl">
        <div className="relative h-72 sm:h-96 w-full bg-[#0B0C10] overflow-hidden">
          <ScrollParallaxImage
            src={tournament.banner_url || gameDef?.bannerUrl || '/games/clash_royale_banner.jpg'}
            alt={tournament.name}
            fallbackSrc={gameDef?.bannerUrl || '/games/clash_royale_banner.jpg'}
            scaleRange={[1.0, 1.15]}
            yRange={[-25, 25]}
            containerClassName="w-full h-full"
            className="opacity-80 transition-opacity duration-500"
          />
          {/* Ambient Game Light Bleed with Sapphire Accent */}
          <div 
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-45 pointer-events-none"
            style={{ backgroundColor: gameDef?.color || '#E63946' }}
          />
          <div 
            className="absolute top-1/2 -right-16 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none bg-[#2563EB]"
          />

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/50 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-card)]/80 via-transparent to-[var(--bg-card)]/40" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 gap-2">
            <div 
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-md text-white border border-white/20 ring-1 ring-black/30"
              style={{ backgroundColor: gameDef?.color ? `${gameDef.color}E6` : '#E63946' }}
            >
              {gameDef?.logoUrl ? (
                <img src={gameDef.logoUrl} alt={gameDef.name} className="w-5 h-5 object-contain filter drop-shadow" />
              ) : isClash ? (
                <Swords className="w-4 h-4" />
              ) : (
                <Gamepad2 className="w-4 h-4" />
              )}
              <span>{gameDef?.name || tournament.game_code}</span>
            </div>

            {getStatusBadge()}
          </div>

          {/* Bottom Title, Modality & Prize */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3 z-10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#A8DADC] bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-[#457B9D] shrink-0" />
                <span>
                  {tournament.event_modality === 'ONLINE' || (tournament.is_online && tournament.event_modality !== 'PRESENTIAL')
                    ? `${tournament.organization_name} • 100% Online / Remoto`
                    : tournament.event_modality === 'HYBRID'
                    ? `${tournament.organization_name} • Sede ${tournament.campus_name} (Híbrido)`
                    : `${tournament.organization_name} • Sede ${tournament.campus_name} (Presencial)`}
                </span>
              </div>

              {tournament.prize_pool && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full backdrop-blur-md border border-amber-400/30">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Premio: {tournament.prize_pool}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {tournament.name}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className={`grid grid-cols-1 ${activeTab === 'brackets' && isBracketFullWidth ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-8 items-start`}>
        
        {/* LEFT COLUMN: TABS & DETAILS */}
        <div className={`${activeTab === 'brackets' && isBracketFullWidth ? 'lg:col-span-1' : 'lg:col-span-8'} space-y-6`}>
          
          {/* Modern Tabs header with Framer Motion spring indicator */}
          <div className="relative flex items-center gap-1 sm:gap-2 p-1.5 rounded-2xl arena-card overflow-x-auto scrollbar-hide border border-[var(--border-card)]">
            {[
              { id: 'info', label: 'Información', icon: FileText },
              { id: 'brackets', label: 'Brackets & Llaves', icon: GitBranch },
              { id: 'rules', label: 'Reglamento', icon: ShieldCheck },
              { id: 'prizes', label: 'Premios', icon: Trophy },
              { id: 'participants', label: `Participantes (${participants.length})`, icon: UserCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 z-10 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTournamentTabPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D62839] shadow-md shadow-[#E63946]/30 z-[-1]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content animated container */}
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
            <div className="arena-card p-6 sm:p-8 space-y-6 animate-in fade-in border border-[var(--border-card)]">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Acerca de este Torneo</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {tournament.description_full}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-card)]">
                <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-1">
                  <p className="text-xs text-[var(--text-muted)]">Modalidad del Evento</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    {tournament.event_modality === 'ONLINE' || (tournament.is_online && tournament.event_modality !== 'PRESENTIAL') ? (
                      <>
                        <span className="text-blue-500">🌐</span>
                        <span>100% Online / Virtual</span>
                      </>
                    ) : tournament.event_modality === 'HYBRID' ? (
                      <>
                        <span className="text-amber-500">⚡</span>
                        <span>Híbrido (Previas Online • Final Presencial en Tecsup {tournament.campus_name})</span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-500">📍</span>
                        <span>100% Presencial (Campus Tecsup {tournament.campus_name})</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-1">
                  <p className="text-xs text-[var(--text-muted)]">Formato Deportivo</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{tournament.format}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Rules */}
          {activeTab === 'rules' && (
            <div className="arena-card p-6 sm:p-8 space-y-6 animate-in fade-in border border-[var(--border-card)]">
              <div className="flex items-center gap-2 text-[#E63946]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Reglamento Oficial de Competición</h3>
              </div>
              <div className="p-5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] text-xs text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-line">
                {tournament.rules_text}
              </div>
            </div>
          )}

          {/* Tab 3: Prizes */}
          {activeTab === 'prizes' && (
            <div className="arena-card p-6 sm:p-8 space-y-6 animate-in fade-in border border-[var(--border-card)]">
              <div className="flex items-center gap-2 text-amber-500">
                <Trophy className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Premios & Reconocimientos</h3>
              </div>
              
              <div className="p-6 rounded-xl bg-gradient-to-r from-[#1D3557]/40 to-[#E63946]/20 border border-[var(--border-card)] space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#A8DADC]">Pozo Acumulado Oficial</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">{tournament.prize_pool}</p>
              </div>

              <div className="space-y-3 pt-2">
                {tournament.prize_distribution?.first_place ? (
                  <div className="flex items-center justify-between p-3.5 bg-[var(--bg-arena)] rounded-xl border border-amber-500/30 text-xs">
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                      🥇 1er Lugar (Campeón Institucional)
                    </span>
                    <span className="font-bold text-amber-500 dark:text-amber-400">{tournament.prize_distribution.first_place}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-[var(--bg-arena)] rounded-xl border border-amber-500/30 text-xs">
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                      🥇 1er Lugar (Campeón Institucional)
                    </span>
                    <span className="font-bold text-amber-500 dark:text-amber-400">{tournament.prize_pool}</span>
                  </div>
                )}

                {tournament.prize_distribution?.second_place && (
                  <div className="flex items-center justify-between p-3.5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] text-xs">
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                      🥈 2do Lugar (Subcampeón)
                    </span>
                    <span className="font-bold text-[var(--text-secondary)]">{tournament.prize_distribution.second_place}</span>
                  </div>
                )}

                {tournament.prize_distribution?.third_place && (
                  <div className="flex items-center justify-between p-3.5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] text-xs">
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                      🥉 3er Lugar
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">{tournament.prize_distribution.third_place}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Confirmed Participants */}
          {activeTab === 'participants' && (
            <div className="arena-card p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-sky-500 dark:text-[#A8DADC]" />
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {tournament.team_size && tournament.team_size > 1 ? 'Equipos y Escuadras Confirmadas' : 'Competidores Confirmados'}
                  </h3>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">
                  {tournament.current_participants} de {tournament.max_slots} cupos ocupados
                </span>
              </div>

              {participants.length === 0 ? (
                <div className="p-8 text-center bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-2">
                  <p className="text-sm font-bold text-[var(--text-primary)]">Sé el primer competidor o equipo en inscribirte</p>
                  <p className="text-xs text-[var(--text-secondary)]">Los participantes aparecerán aquí una vez validado su cupo.</p>
                </div>
              ) : tournament.team_size && tournament.team_size > 1 ? (
                /* --- TEAM TOURNAMENT PARTICIPANTS VIEW --- */
                <div className="grid grid-cols-1 gap-3.5">
                  {participants.map((p) => {
                    const emblem = p.roster_members?.team_emblem || '🐉';
                    const membersCount = 1 + (Array.isArray(p.roster_members?.members) ? p.roster_members.members.length : Array.isArray(p.roster_members) ? p.roster_members.length : 0);

                    return (
                      <div
                        key={p.id}
                        className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-2xl flex items-center justify-center shrink-0 shadow-inner">
                            {emblem}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-[var(--text-primary)] truncate">
                                {p.team_name || 'Escuadra Competitiva'}
                              </h4>
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {membersCount} Jugadores
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">
                              Capitán: <strong className="text-[var(--text-primary)]">{p.competitor_name}</strong>
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
                            className="btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-300 hover:text-[var(--text-primary)]"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Ver Integrantes
                          </button>
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {p.status === 'CONFIRMED' ? 'Confirmado' : 'Espera'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* --- INDIVIDUAL TOURNAMENT PARTICIPANTS VIEW --- */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {participants.map((p) => (
                    <Link
                      key={p.id}
                      href={p.user_id ? `/profile/${p.user_id}` : '#'}
                      className="p-3.5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] hover:border-[#E63946]/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Foto de perfil a la izquierda */}
                        <div className="w-11 h-11 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden flex items-center justify-center shrink-0">
                          {p.avatar_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {p.competitor_name?.charAt(0) || 'C'}
                            </span>
                          )}
                        </div>

                        {/* A la derecha: Nombre, abajo correo, y tag de juego */}
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#E63946] transition-colors truncate">
                            {p.competitor_name}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                            {p.email || 'correo@tecsup.edu.pe'}
                          </p>
                          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono">
                            {p.in_game_name} ({p.player_tag})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.status === 'CONFIRMED' ? 'Confirmado' : 'Espera'}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] flex items-center gap-0.5 pt-1">
                          Ver Perfil &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: TECHNICAL SHEET & INSCRIPTION */}
        <div className={`${activeTab === 'brackets' && isBracketFullWidth ? 'lg:col-span-1' : 'lg:col-span-4'} space-y-6`}>
          
          <div className="arena-card p-6 space-y-6 shadow-2xl sticky top-24 border border-[var(--border-card)]">
            
            <div className="space-y-1 pb-4 border-b border-[var(--border-card)]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Inscripción</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[var(--text-primary)]">
                  {Number(tournament.cost) === 0 ? 'Gratis' : `S/ ${tournament.cost}`}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">/ por competidor</span>
              </div>
            </div>

            {/* Live Competition Countdown Box */}
            <TournamentCountdown 
              targetDate={tournament.tournament_start_at} 
              status={tournament.status} 
            />

            {/* Inscription Status Alert if Already Registered */}
            {userRegistration ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {userRegistration.status === 'CONFIRMED'
                        ? '¡Inscripción Confirmada!'
                        : 'Solicitud en Revisión'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                    {userRegistration.status === 'CONFIRMED'
                      ? 'Tu cupo oficial en el bracket está asegurado.'
                      : 'Tu comprobante de pago está siendo verificado por el organizador.'}
                  </p>
                  <Link
                    href="/profile"
                    className="text-[11px] font-bold text-emerald-400 hover:underline inline-block pt-1"
                  >
                    Ver en Mi Perfil &rarr;
                  </Link>
                </div>
              </div>
            ) : tournament.status === 'REGISTRATION_OPEN' ? (
              <button
                onClick={handleRegisterClick}
                className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#E63946]/30"
              >
                <Swords className="w-4 h-4" />
                Inscribirme al Torneo
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('brackets')}
                className="btn-secondary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <GitBranch className="w-4 h-4 text-[#E63946]" />
                Inscripciones Cerradas • Ver Brackets
              </button>
            )}

            {/* Technical Checklist */}
            <div className="space-y-3.5 text-xs">
              
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Inicio del Torneo</p>
                  <p className="text-[var(--text-secondary)] capitalize">{startDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#457B9D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Cierre de Inscripciones</p>
                  <p className="text-[var(--text-secondary)]">{closeDate}</p>
                </div>
              </div>

              {/* Animated Live Capacity Bar */}
              <div className="space-y-2 pt-1 border-t border-[var(--border-card)]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-semibold text-[var(--text-primary)]">Cupos Disponibles</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                    <AnimatedCounter target={tournament.current_participants} /> / {tournament.max_slots}
                  </div>
                </div>
                <div className="w-full h-2 bg-[var(--bg-arena)] dark:bg-black/50 rounded-full overflow-hidden border border-[var(--border-card)]">
                  <motion.div 
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((tournament.current_participants / tournament.max_slots) * 100))}%` }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    style={{ 
                      background: tournament.current_participants >= tournament.max_slots 
                        ? '#E63946' 
                        : 'linear-gradient(90deg, #10B981, #059669)',
                    }}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <Mail className="w-4 h-4 text-[#A8DADC] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Organización y Soporte</p>
                  <p className="text-[var(--text-secondary)] truncate">{tournament.contact_email}</p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Registration Wizard Modal */}
      <RegistrationWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        tournament={{
          id: tournament.id,
          name: tournament.name,
          game_code: tournament.game_code,
          cost: tournament.cost,
          currency: tournament.currency,
          prize_pool: tournament.prize_pool,
          rules_text: tournament.rules_text,
          team_size: tournament.team_size || 1,
        }}
        onSuccess={() => {
          fireCelebration();
          toast.success('¡Inscripción registrada con éxito!');
          fetchTournament();
          fetchUserRegistrationStatus(tournament.id);
        }}
      />

      {/* Edit Tournament Modal (Organizers & Admin) */}
      <EditTournamentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tournament={tournament}
        onSuccess={(updated) => {
          setTournament(updated);
          fetchTournament();
        }}
      />

      {/* Delete Tournament Modal (Organizers & Admin) */}
      <DeleteTournamentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        tournamentId={tournament.id}
        tournamentName={tournament.name}
      />

      {/* OVER-EXPOSED TEAM ROSTER LIGHTBOX MODAL */}
      {selectedTeamRoster && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedTeamRoster(null)}
        >
          <div 
            className="relative max-w-lg w-full arena-card bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-2xl flex items-center justify-center border border-indigo-500/30">
                  {selectedTeamRoster.roster_members?.team_emblem || '🐉'}
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {selectedTeamRoster.team_name || 'Escuadra Oficial'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Integrantes oficiales de la escuadra
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamRoster(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-arena)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {/* Capitán */}
              <div className="p-3.5 bg-[var(--bg-arena)] rounded-xl border border-indigo-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 dark:text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30 overflow-hidden shrink-0">
                    {selectedTeamRoster.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={selectedTeamRoster.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{selectedTeamRoster.competitor_name?.charAt(0) || 'C'}</span>
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {selectedTeamRoster.competitor_name}
                      </p>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 dark:text-indigo-300 border border-indigo-500/30">
                        Capitán
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">{selectedTeamRoster.email}</p>
                    <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono">
                      Tag: {selectedTeamRoster.player_tag} ({selectedTeamRoster.in_game_name})
                    </p>
                  </div>
                </div>

                {selectedTeamRoster.user_id && (
                  <Link
                    href={`/profile/${selectedTeamRoster.user_id}`}
                    className="btn-secondary py-1 px-2.5 text-[10px] shrink-0 ml-2"
                  >
                    Ver Perfil
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
                  <div key={idx} className="p-3.5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] font-bold flex items-center justify-center border border-[var(--border-card)] shrink-0">
                        {m.name?.charAt(0) || 'J'}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{m.name || `Compañero ${idx + 1}`}</p>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-card)]">
                            {m.role || `Jugador ${idx + 2}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">{m.email || 'correo@tecsup.edu.pe'}</p>
                        {m.player_tag && (
                          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono">Tag: {m.player_tag}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
