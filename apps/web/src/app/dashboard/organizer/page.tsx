'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { GAME_CATALOG, GAME_BANNER_PRESETS } from '@/lib/games';
import { EditTournamentModal } from '@/components/EditTournamentModal';
import { 
  Trophy, 
  Swords, 
  Gamepad2, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Calendar, 
  QrCode, 
  ExternalLink, 
  ShieldCheck, 
  Flame, 
  ArrowRight, 
  Eye, 
  Image as ImageIcon, 
  Edit3, 
  MapPin,
  Crown
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
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [tournaments, setTournaments] = useState<ManagedTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Create Tournament Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTourName, setNewTourName] = useState('');
  const [newTourGame, setNewTourGame] = useState<string>('CLASH_ROYALE');
  const [newTourCampus, setNewTourCampus] = useState<string>('Lima');
  const [newTourEventModality, setNewTourEventModality] = useState<'PRESENTIAL' | 'ONLINE' | 'HYBRID'>('PRESENTIAL');
  const [newTourCost, setNewTourCost] = useState(5.00);
  const [newTourSlots, setNewTourSlots] = useState(16);
  const [newTourTeamSize, setNewTourTeamSize] = useState<number>(1);
  const [newTourStreamPlatform, setNewTourStreamPlatform] = useState<string>('KICK');
  const [newTourStreamUrl, setNewTourStreamUrl] = useState<string>('lusen15');
  const [newTourPrize, setNewTourPrize] = useState('S/ 400 + Trofeo Oficial');
  const [newTourPrize1, setNewTourPrize1] = useState('100% del pozo acumulado');
  const [newTourPrize2, setNewTourPrize2] = useState('Medalla de Plata');
  const [newTourPrize3, setNewTourPrize3] = useState('Medalla de Bronce');
  const [newTourBanner, setNewTourBanner] = useState('');
  const [newTourSeriesFormat, setNewTourSeriesFormat] = useState('Semis BO3 • Final BO5 (Previas BO1)');
  const [newTourDesc, setNewTourDesc] = useState('Torneo oficial de eliminación directa para estudiantes.');
  const [newTourRules, setNewTourRules] = useState('1. Formato 1vs1 BO3.\n2. Baneo de 1 carta/brawler por mutuo acuerdo.\n3. Desconexiones: 30 segundos de espera.');
  const [newTourRegOpen, setNewTourRegOpen] = useState(() => new Date().toISOString().slice(0, 16));
  const [newTourRegClose, setNewTourRegClose] = useState(() => new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 16));
  const [newTourStart, setNewTourStart] = useState(() => new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 16));
  const [viewingVoucherUrl, setViewingVoucherUrl] = useState<string | null>(null);

  // Edit Tournament Modal State
  const [editingTour, setEditingTour] = useState<ManagedTournament | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Fetch pending payments
    const paymentsRes = await api.get('/admin/payments/pending');
    if (paymentsRes.success && Array.isArray(paymentsRes.data)) {
      setPendingPayments(paymentsRes.data);
    }

    // 2. Fetch tournaments
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
      setFeedback({ type: 'success', message: res.data?.message || '¡Pago aprobado y cupo confirmado!' });
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
      description_full: `${newTourDesc} Competencia oficial con certificación deportiva y premios en efectivo.`,
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
      setFeedback({ type: 'success', message: `¡Torneo "${newTourName}" creado y publicado exitosamente!` });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. HEADER HERO */}
      <div className="relative arena-card p-6 sm:p-8 overflow-hidden bg-[#111520] border border-[var(--border-card)]">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/15 text-xs font-bold text-[#E63946] border border-[#E63946]/30 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Panel de Administración y Arbitraje
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              Dashboard del Organizador
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Gestión centralizada de inscripciones, aprobación de comprobantes de pago de Yape/Plin y control de torneos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isAdmin && (
              <Link
                href="/admin/organizers"
                className="btn-secondary px-4 py-3 text-xs flex items-center gap-2 border-amber-500/40 text-amber-500 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 font-bold transition-all"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                Gestión de Organizadores
              </Link>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary px-5 py-3 text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E63946]/20"
            >
              <Plus className="w-4 h-4" />
              Crear Nuevo Torneo
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-start gap-3 text-xs font-semibold animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946]'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="arena-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs uppercase font-bold tracking-wider">Pagos por Revisar</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)]">{pendingPayments.length}</p>
          <p className="text-[11px] text-[var(--text-muted)]">Vouchers pendientes de validación</p>
        </div>

        <div className="arena-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs uppercase font-bold tracking-wider">Torneos Activos</span>
            <Swords className="w-4 h-4 text-[#E63946]" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)]">{tournaments.length}</p>
          <p className="text-[11px] text-[var(--text-muted)]">Competencias oficiales en curso</p>
        </div>

        <div className="arena-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs uppercase font-bold tracking-wider">Sede Organizadora</span>
            <Trophy className="w-4 h-4 text-[#457B9D]" />
          </div>
          <p className="text-xl font-black text-[var(--text-primary)] truncate">Tecsup Lima</p>
          <p className="text-[11px] text-[var(--text-muted)]">Organización autorizada</p>
        </div>
      </div>

      {/* 3. INBOX: BANDEJA DE PAGOS EN VIVO */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)]">Bandeja de Pagos y Comprobantes</h2>
              <p className="text-xs text-[var(--text-secondary)]">Valida los vouchers de Yape/Plin para asegurar cupos en los brackets</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
            {pendingPayments.length} pendientes
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#E63946] mx-auto" />
            <p className="text-xs text-[var(--text-secondary)]">Cargando comprobantes...</p>
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="p-8 text-center bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-[var(--text-primary)]">Bandeja al día</p>
            <p className="text-xs text-[var(--text-secondary)]">No hay comprobantes pendientes de validación en este momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map((p) => (
              <div 
                key={p.payment_id}
                className="p-5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-4 hover:border-[#E63946]/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8DADC] bg-[var(--bg-card)] px-2 py-0.5 rounded border border-[var(--border-card)]">
                        {p.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars'}
                      </span>
                      <span className="text-xs font-black text-amber-500 dark:text-amber-400">
                        {p.amount > 0 ? `S/ ${p.amount.toFixed(2)} PEN (${p.method})` : 'Inscripción Gratuita'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                      {p.competitor_name} • <span className="text-[#A8DADC]">{p.in_game_name}</span> ({p.player_tag})
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)]">
                      Torneo: <strong className="text-[var(--text-primary)]">{p.tournament_name}</strong> • {p.career}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleApprovePayment(p.payment_id)}
                      disabled={actionLoading === p.payment_id}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {actionLoading === p.payment_id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Aprobar Cupo
                    </button>

                    <button
                      onClick={() => handleRejectPayment(p.payment_id)}
                      disabled={actionLoading === p.payment_id}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20 border border-[#E63946]/30 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazar
                    </button>
                  </div>
                </div>

                {/* Evidence link & reference info */}
                <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <QrCode className="w-3.5 h-3.5 text-[#457B9D]" />
                    <span>Operación: <strong className="text-[var(--text-primary)] font-mono">{p.operation_reference || 'N/A'}</strong></span>
                  </div>

                  {p.evidence_url && (
                    <button
                      type="button"
                      onClick={() => setViewingVoucherUrl(p.evidence_url || null)}
                      className="text-xs font-bold text-[#A8DADC] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspeccionar Voucher
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. GESTOR DE TORNEOS ACTIVOS */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#457B9D]/20 text-[#457B9D] flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)]">Torneos de la Organización</h2>
              <p className="text-xs text-[var(--text-secondary)]">Administración deportiva y supervisión de llaves</p>
            </div>
          </div>

          <Link
            href="/tournaments"
            className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            Ver Catálogo Público
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="p-5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A8DADC] uppercase tracking-wider">
                    {t.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {t.status}
                  </span>
                </div>

                <h3 className="text-base font-black text-[var(--text-primary)] line-clamp-1">{t.name}</h3>
                
                <p className="text-xs text-[var(--text-secondary)]">
                  {t.current_participants} de {t.max_slots} cupos ocupados • Premio: <strong className="text-amber-500 dark:text-amber-400">{t.prize_pool}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">
                  {Number(t.cost) === 0 ? 'Gratuito' : `S/ ${t.cost} PEN`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(t)}
                    className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#A8DADC]" />
                    Editar
                  </button>

                  <Link
                    href={`/tournaments/${t.slug}`}
                    className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                  >
                    Gestionar & Brackets
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CREATE TOURNAMENT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg arena-card p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E63946]">
                Asistente Deportivo
              </span>
              <h3 className="text-xl font-black text-[var(--text-primary)]">Lanzar Nuevo Torneo Oficial</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Configura los parámetros del torneo para publicarlo en la cartelera universitaria.
              </p>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Nombre del Torneo
                </label>
                <input
                  type="text"
                  required
                  value={newTourName}
                  onChange={(e) => setNewTourName(e.target.value)}
                  placeholder="Ej. Copa Primavera Clash Royale 2026"
                  className="input-arena"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Disciplina Oficial
                  </label>
                  <select
                    value={newTourGame}
                    onChange={(e) => setNewTourGame(e.target.value)}
                    className="input-arena"
                  >
                    {Object.values(GAME_CATALOG).map((g) => (
                      <option key={g.code} value={g.code} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Cupos Máximos
                    </label>
                    <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold">
                      {newTourTeamSize > 1 ? `${newTourSlots} Equipos (${newTourSlots * newTourTeamSize} Jugadores)` : `${newTourSlots} Jugadores`}
                    </span>
                  </div>
                  <select
                    value={newTourSlots}
                    onChange={(e) => setNewTourSlots(Number(e.target.value))}
                    className="input-arena"
                  >
                    <option value={8} className="bg-[var(--bg-card)] text-[var(--text-primary)]">8 {newTourTeamSize > 1 ? `Equipos (${8 * newTourTeamSize} Jugadores • Cuartos)` : 'Jugadores (Cuartos)'}</option>
                    <option value={16} className="bg-[var(--bg-card)] text-[var(--text-primary)]">16 {newTourTeamSize > 1 ? `Equipos (${16 * newTourTeamSize} Jugadores • Octavos)` : 'Jugadores (Octavos)'}</option>
                    <option value={32} className="bg-[var(--bg-card)] text-[var(--text-primary)]">32 {newTourTeamSize > 1 ? `Equipos (${32 * newTourTeamSize} Jugadores)` : 'Jugadores'}</option>
                    <option value={64} className="bg-[var(--bg-card)] text-[var(--text-primary)]">64 {newTourTeamSize > 1 ? `Equipos (${64 * newTourTeamSize} Jugadores)` : 'Jugadores'}</option>
                  </select>
                </div>
              </div>

              {/* Event Modality & Campus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Modalidad del Evento
                  </label>
                  <select
                    value={newTourEventModality}
                    onChange={(e) => setNewTourEventModality(e.target.value as any)}
                    className="input-arena"
                  >
                    <option value="PRESENTIAL" className="bg-[var(--bg-card)] text-[var(--text-primary)]">📍 100% Presencial (Campus Tecsup)</option>
                    <option value="ONLINE" className="bg-[var(--bg-card)] text-[var(--text-primary)]">🌐 100% Virtual / Remoto</option>
                    <option value="HYBRID" className="bg-[var(--bg-card)] text-[var(--text-primary)]">⚡ Híbrido (Previas Online • Final Presencial)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Sede Tecsup
                  </label>
                  <select
                    value={newTourCampus}
                    onChange={(e) => setNewTourCampus(e.target.value)}
                    className="input-arena"
                  >
                    <option value="Lima" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Sede Lima (Santa Anita)</option>
                    <option value="Arequipa" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Sede Arequipa</option>
                    <option value="Trujillo" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Sede Trujillo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Costo de Inscripción (PEN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={newTourCost}
                    onChange={(e) => setNewTourCost(Number(e.target.value))}
                    className="input-arena"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Pozo Acumulado Oficial
                  </label>
                  <input
                    type="text"
                    required
                    value={newTourPrize}
                    onChange={(e) => setNewTourPrize(e.target.value)}
                    placeholder="Ej. Pozo (S/.9 por equipo) o S/ 500"
                    className="input-arena"
                  />
                </div>
              </div>

              {/* Manual Prize Breakdown per Place */}
              <div className="space-y-3 p-4 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    Distribución de Premios por Puesto
                  </label>
                  <span className="text-[10px] text-[var(--text-secondary)]">100% manual y configurable</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">🥇</span>
                    <input
                      type="text"
                      value={newTourPrize1}
                      onChange={(e) => setNewTourPrize1(e.target.value)}
                      placeholder="Premio 1er Lugar (Ej. 100% del pozo acumulado, Trofeo + S/ 300, etc.)"
                      className="input-arena text-xs flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">🥈</span>
                    <input
                      type="text"
                      value={newTourPrize2}
                      onChange={(e) => setNewTourPrize2(e.target.value)}
                      placeholder="Premio 2do Lugar (Opcional, dejar vacío si no aplica)"
                      className="input-arena text-xs flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">🥉</span>
                    <input
                      type="text"
                      value={newTourPrize3}
                      onChange={(e) => setNewTourPrize3(e.target.value)}
                      placeholder="Premio 3er Lugar (Opcional, dejar vacío si no aplica)"
                      className="input-arena text-xs flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Fechas & Horarios Oficiales */}
              <div className="space-y-3 p-4 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)]">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A8DADC] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#457B9D]" />
                  Fechas & Horarios de Competición
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[var(--text-primary)]">Inicio Inscripciones</label>
                    <input
                      type="datetime-local"
                      required
                      value={newTourRegOpen}
                      onChange={(e) => setNewTourRegOpen(e.target.value)}
                      className="input-arena text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[var(--text-primary)]">Cierre Inscripciones</label>
                    <input
                      type="datetime-local"
                      required
                      value={newTourRegClose}
                      onChange={(e) => setNewTourRegClose(e.target.value)}
                      className="input-arena text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[var(--text-primary)]">Inicio del Torneo</label>
                    <input
                      type="datetime-local"
                      required
                      value={newTourStart}
                      onChange={(e) => setNewTourStart(e.target.value)}
                      className="input-arena text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Modalidad Competitiva
                  </label>
                  <select
                    value={newTourTeamSize}
                    onChange={(e) => {
                      const size = Number(e.target.value);
                      setNewTourTeamSize(size);
                      if (size > 1) {
                        setNewTourRules(`1. Modalidad ${size} vs ${size}.\n2. El capitán inscribe a la escuadra completa.\n3. Desconexiones: 3 minutos de pausa técnica.`);
                      } else {
                        setNewTourRules('1. Formato 1vs1 BO3.\n2. Baneo de 1 carta/personaje por mutuo acuerdo.\n3. Desconexiones: 30 segundos de espera.');
                      }
                    }}
                    className="input-arena"
                  >
                    <option value={1} className="bg-[var(--bg-card)] text-[var(--text-primary)]">1 vs 1 (Individual / Solos)</option>
                    <option value={2} className="bg-[var(--bg-card)] text-[var(--text-primary)]">2 vs 2 (Dúos)</option>
                    <option value={3} className="bg-[var(--bg-card)] text-[var(--text-primary)]">3 vs 3 (Tríos / Brawl Stars)</option>
                    <option value={4} className="bg-[var(--bg-card)] text-[var(--text-primary)]">4 vs 4 (Escuadras L4D2 / Fortnite)</option>
                    <option value={5} className="bg-[var(--bg-card)] text-[var(--text-primary)]">5 vs 5 (Equipos Dota 2 / CS2)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Estructura de Series por Ronda
                  </label>
                  <select
                    value={newTourSeriesFormat}
                    onChange={(e) => setNewTourSeriesFormat(e.target.value)}
                    className="input-arena"
                  >
                    <option value="Semis BO3 • Final BO5 (Previas BO1)" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Semis BO3 • Final BO5 (Previas BO1)</option>
                    <option value="Semis BO3 • Final BO5 (Previas BO3)" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Semis BO3 • Final BO5 (Previas BO3)</option>
                    <option value="Todas las rondas BO3" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Todas las rondas al Mejor de 3 (BO3)</option>
                    <option value="Previas BO3 • Gran Final BO5" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Previas BO3 • Gran Final BO5</option>
                    <option value="Rondas BO1 • Gran Final BO3" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Rondas BO1 • Gran Final BO3</option>
                  </select>
                </div>
              </div>

              {/* Banner Selector with Preview */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Banner Oficial del Torneo
                  </label>
                  <span className="text-[10px] text-[var(--text-secondary)]">URL directa de imagen</span>
                </div>
                <input
                  type="url"
                  value={newTourBanner}
                  onChange={(e) => setNewTourBanner(e.target.value)}
                  placeholder={GAME_BANNER_PRESETS[newTourGame] || '/games/clash_royale_banner.jpg'}
                  className="input-arena text-xs font-mono"
                />
                <div className="flex items-center gap-3">
                  <div className="h-16 w-32 rounded-lg overflow-hidden border border-[var(--border-card)] shrink-0 bg-black/40">
                    <img
                      src={newTourBanner.trim() || GAME_BANNER_PRESETS[newTourGame] || '/games/clash_royale_banner.jpg'}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] space-y-1">
                    <p className="text-[var(--text-primary)] font-semibold">Previsualización del Banner</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Si dejas este campo vacío, se usará la imagen oficial por defecto del juego ({newTourGame}).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Plataforma Stream
                  </label>
                  <select
                    value={newTourStreamPlatform}
                    onChange={(e) => setNewTourStreamPlatform(e.target.value)}
                    className="input-arena"
                  >
                    <option value="KICK" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Kick</option>
                    <option value="YOUTUBE" className="bg-[var(--bg-card)] text-[var(--text-primary)]">YouTube</option>
                    <option value="TIKTOK" className="bg-[var(--bg-card)] text-[var(--text-primary)]">TikTok Live</option>
                    <option value="TWITCH" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Twitch</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Canal o URL Stream
                  </label>
                  <input
                    type="text"
                    value={newTourStreamUrl}
                    onChange={(e) => setNewTourStreamUrl(e.target.value)}
                    placeholder="Ej. lusen15"
                    className="input-arena"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  required
                  value={newTourDesc}
                  onChange={(e) => setNewTourDesc(e.target.value)}
                  className="input-arena"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Reglamento Oficial
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTourRules}
                  onChange={(e) => setNewTourRules(e.target.value)}
                  className="input-arena resize-none text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary py-2.5 text-xs text-center cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'creating-tour'}
                  className="btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === 'creating-tour' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      Publicar Torneo
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT TOURNAMENT MODAL (Comprehensive 4-section modal) */}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setViewingVoucherUrl(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl overflow-hidden p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#A8DADC]" />
                Comprobante Oficial de Pago
              </h4>
              <button 
                onClick={() => setViewingVoucherUrl(null)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)] transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-[65vh] overflow-auto rounded-xl bg-black/60 border border-[var(--border-card)] flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={viewingVoucherUrl} 
                alt="Comprobante en alta resolución" 
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
              <span>Verifica monto, fecha y número de operación con tu app de Yape/Plin.</span>
              <a 
                href={viewingVoucherUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Pestaña nueva
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
