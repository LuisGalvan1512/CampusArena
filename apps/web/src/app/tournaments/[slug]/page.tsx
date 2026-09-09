'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { RegistrationWizardModal } from '@/components/RegistrationWizardModal';
import { BracketView } from '@/components/BracketView';
import { CertificateModal } from '@/components/CertificateModal';
import { EditTournamentModal } from '@/components/EditTournamentModal';
import { DeleteTournamentModal } from '@/components/DeleteTournamentModal';
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
  Award,
  ExternalLink,
  Edit3,
  Trash2,
  Settings,
  Sparkles
} from 'lucide-react';

interface TournamentDetail {
  id: string;
  name: string;
  slug: string;
  game_code: 'CLASH_ROYALE' | 'BRAWL_STARS';
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
  registration_open_at: string;
  registration_close_at: string;
  tournament_start_at: string;
  is_online: boolean;
  contact_email: string;
}

interface Participant {
  id: string;
  competitor_name: string;
  in_game_name: string;
  player_tag: string;
  trophies: number;
  level: number;
  status: string;
}

export default function TournamentDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isOrganizer } = useAuth();
  const canManage = isAuthenticated && (isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER');

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [bracket, setBracket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'rules' | 'prizes' | 'participants' | 'brackets'>('info');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userRegistration, setUserRegistration] = useState<any>(null);

  const fetchTournament = async () => {
    if (!slug) return;
    setIsLoading(true);
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
    setIsLoading(false);
  };

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
    fetchTournament();
  }, [slug]);

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
        <h2 className="text-2xl font-bold text-white">Torneo no encontrado</h2>
        <p className="text-sm text-[#8E92A4]">El torneo que buscas no existe o ha sido despublicado.</p>
        <Link href="/tournaments" className="btn-primary px-6 py-2.5 text-sm inline-block">
          Volver a Torneos
        </Link>
      </div>
    );
  }

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
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8E92A4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo de Torneos
        </Link>

        {/* Live Stream Bar */}
        <div className="flex items-center gap-2 bg-[#15161E] px-3.5 py-1.5 rounded-full border border-white/10 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#E63946] animate-ping" />
          <span className="text-[#8E92A4]">Transmisión:</span>
          <a
            href="https://kick.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            Kick Live <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-[#5A5E73]">•</span>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#A8DADC] hover:underline flex items-center gap-1"
          >
            TikTok Live <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ORGANIZER / ADMIN MANAGEMENT TOOLBAR */}
      {canManage && (
        <div className="arena-card p-4 sm:p-5 bg-gradient-to-r from-[#1D3557]/40 via-[#15161E] to-[#E63946]/20 border border-amber-500/40 rounded-2xl shadow-xl space-y-3">
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
                className="btn-secondary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer border-white/20 text-white"
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
      <div className="relative rounded-2xl overflow-hidden arena-card border border-white/10 shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full bg-[#0B0C10]">
          <img
            src={tournament.banner_url}
            alt={tournament.name}
            className="w-full h-full object-cover object-center opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15161E] via-[#15161E]/60 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md ${
              isClash ? 'bg-[#E63946] text-white' : 'bg-[#457B9D] text-white'
            }`}>
              {isClash ? <Swords className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4" />}
              <span>{isClash ? 'Clash Royale' : 'Brawl Stars'}</span>
            </div>

            {getStatusBadge()}
          </div>

          {/* Bottom Title & Organization */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2 z-10">
            <div className="flex items-center gap-2 text-xs text-[#A8DADC]">
              <MapPin className="w-4 h-4 text-[#457B9D]" />
              <span>{tournament.organization_name} • {tournament.campus_name} (Presencial & Online)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {tournament.name}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: TABS & DETAILS (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs header */}
          <div className="flex items-center gap-2 sm:gap-3 border-b border-white/10 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'info'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Información
            </button>

            <button
              onClick={() => setActiveTab('brackets')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'brackets'
                  ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Brackets & Llaves
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'rules'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#E63946]" />
              Reglamento
            </button>

            <button
              onClick={() => setActiveTab('prizes')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'prizes'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Premios
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'participants'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#A8DADC]" />
              Participantes ({participants.length})
            </button>
          </div>

          {/* Tab: Brackets */}
          {activeTab === 'brackets' && (
            <div className="space-y-4">
              <BracketView
                tournamentId={tournament.id}
                initialBracket={bracket}
                onUpdate={fetchTournament}
              />
            </div>
          )}

          {/* Tab 1: Info */}
          {activeTab === 'info' && (
            <div className="arena-card p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Acerca de este Torneo</h3>
                <p className="text-sm text-[#8E92A4] leading-relaxed whitespace-pre-line">
                  {tournament.description_full}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/5 space-y-1">
                  <p className="text-xs text-[#8E92A4]">Modalidad del Evento</p>
                  <p className="text-sm font-bold text-white">Presencial (Campus Tecsup) & Online</p>
                </div>
                <div className="p-4 bg-[#0B0C10] rounded-xl border border-white/5 space-y-1">
                  <p className="text-xs text-[#8E92A4]">Formato Deportivo</p>
                  <p className="text-sm font-bold text-white">{tournament.format}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Rules */}
          {activeTab === 'rules' && (
            <div className="arena-card p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#E63946]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Reglamento Oficial de Competición</h3>
              </div>
              <div className="p-5 bg-[#0B0C10] rounded-xl border border-white/5 text-xs text-[#8E92A4] leading-relaxed font-mono whitespace-pre-line">
                {tournament.rules_text}
              </div>
            </div>
          )}

          {/* Tab 3: Prizes */}
          {activeTab === 'prizes' && (
            <div className="arena-card p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-400">
                <Trophy className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Premios & Reconocimientos</h3>
              </div>
              
              <div className="p-6 rounded-xl bg-gradient-to-r from-[#1D3557]/40 to-[#E63946]/20 border border-white/10 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#A8DADC]">Pozo Acumulado Oficial</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-400">{tournament.prize_pool}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-[#0B0C10] rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    🥇 1er Lugar (Campeón Institucional)
                  </span>
                  <span className="font-bold text-amber-400">Trofeo + 60% del pozo</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#0B0C10] rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    🥈 2do Lugar (Subcampeón)
                  </span>
                  <span className="font-bold text-slate-300">Medalla de Plata + 30%</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#0B0C10] rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    🥉 3er Lugar
                  </span>
                  <span className="font-bold text-amber-600">Medalla de Bronce + 10%</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Confirmed Participants */}
          {activeTab === 'participants' && (
            <div className="arena-card p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#A8DADC]" />
                  <h3 className="text-lg font-bold text-white">Competidores Confirmados</h3>
                </div>
                <span className="text-xs text-[#8E92A4]">
                  {tournament.current_participants} de {tournament.max_slots} cupos
                </span>
              </div>

              {participants.length === 0 ? (
                <div className="p-8 text-center bg-[#0B0C10] rounded-xl border border-white/5 space-y-2">
                  <p className="text-sm font-bold text-white">Sé el primer competidor en inscribirte</p>
                  <p className="text-xs text-[#8E92A4]">Los participantes aparecerán aquí una vez validado su pago.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {participants.map((p) => (
                    <div key={p.id} className="p-3.5 bg-[#0B0C10] rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">{p.in_game_name}</p>
                        <p className="text-[11px] text-[#8E92A4] font-mono">{p.player_tag}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status === 'CONFIRMED' ? 'Confirmado' : 'Lista de Espera'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: TECHNICAL SHEET & INSCRIPTION (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="arena-card p-6 space-y-6 shadow-2xl sticky top-24">
            
            <div className="space-y-1 pb-4 border-b border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8E92A4]">Inscripción</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {Number(tournament.cost) === 0 ? 'Gratis' : `S/ ${tournament.cost}`}
                </span>
                <span className="text-xs text-[#8E92A4]">/ por competidor</span>
              </div>
            </div>

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
                    className="text-[11px] font-bold text-white hover:underline inline-block pt-1"
                  >
                    Ver en Mi Perfil &rarr;
                  </Link>
                </div>

                {/* Button to view Official Diploma */}
                {userRegistration.status === 'CONFIRMED' && (
                  <button
                    onClick={() => setIsCertificateOpen(true)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 hover:border-amber-400 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <Award className="w-4 h-4" />
                    Ver Mi Diploma Oficial Tecsup
                  </button>
                )}
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
                  <p className="font-semibold text-white">Inicio del Torneo</p>
                  <p className="text-[#8E92A4] capitalize">{startDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#457B9D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Cierre de Inscripciones</p>
                  <p className="text-[#8E92A4]">{closeDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Cupos Disponibles</p>
                  <p className="text-[#8E92A4]">
                    {tournament.current_participants} inscritos de {tournament.max_slots} cupos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#A8DADC] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Organización y Soporte</p>
                  <p className="text-[#8E92A4] truncate">{tournament.contact_email}</p>
                </div>
              </div>

            </div>

            {/* Requirements note */}
            <div className="pt-4 border-t border-white/5 text-[11px] text-[#5A5E73] space-y-1">
              <p>⚠️ <strong>Requisito:</strong> Debes tener tu Player Tag de {isClash ? 'Clash Royale' : 'Brawl Stars'} vinculado en tu perfil.</p>
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
        }}
        onSuccess={() => {
          fetchTournament();
          fetchUserRegistrationStatus(tournament.id);
        }}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        studentName={user ? `${user.first_name} ${user.last_name}` : 'Luis Galvan'}
        inGameName={userRegistration?.in_game_name || 'ArenaKing_0RL'}
        playerTag={userRegistration?.player_tag || '#0RLVVQVY'}
        career="Diseño y Desarrollo de Software"
        tournamentName={tournament.name}
        gameName={isClash ? 'Clash Royale' : 'Brawl Stars'}
        rankTitle="Participante Oficial Destacado"
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

    </div>
  );
}
