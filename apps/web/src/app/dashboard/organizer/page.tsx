'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
  Eye
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
}

export default function OrganizerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [tournaments, setTournaments] = useState<ManagedTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Create Tournament Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTourName, setNewTourName] = useState('');
  const [newTourGame, setNewTourGame] = useState<'CLASH_ROYALE' | 'BRAWL_STARS'>('CLASH_ROYALE');
  const [newTourCost, setNewTourCost] = useState(5.00);
  const [newTourSlots, setNewTourSlots] = useState(16);
  const [newTourPrize, setNewTourPrize] = useState('S/ 400 + Trofeo Oficial');
  const [newTourDesc, setNewTourDesc] = useState('Torneo oficial de eliminación directa para estudiantes.');
  const [newTourRules, setNewTourRules] = useState('1. Formato 1vs1 BO3.\n2. Baneo de 1 carta/brawler por mutuo acuerdo.\n3. Desconexiones: 30 segundos de espera.');

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

    const bannerUrl = newTourGame === 'CLASH_ROYALE'
      ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80';

    const res = await api.post('/tournaments', {
      name: newTourName,
      game_code: newTourGame,
      organization_name: 'Tecsup',
      campus_name: 'Lima',
      description_short: newTourDesc,
      description_full: `${newTourDesc} Competencia oficial con certificación deportiva y premios en efectivo.`,
      banner_url: bannerUrl,
      rules_text: newTourRules,
      max_slots: Number(newTourSlots),
      min_slots: 4,
      cost: Number(newTourCost),
      currency: 'PEN',
      prize_pool: newTourPrize,
      registration_open_at: new Date().toISOString(),
      registration_close_at: new Date(Date.now() + 15 * 86400000).toISOString(),
      tournament_start_at: new Date(Date.now() + 18 * 86400000).toISOString(),
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. HEADER HERO */}
      <div className="relative arena-card p-8 sm:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/15 text-xs font-bold text-[#E63946] border border-[#E63946]/30 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Panel de Administración y Arbitraje
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Dashboard del Organizador
            </h1>

            <p className="text-xs sm:text-sm text-[#8E92A4]">
              Gestión centralizada de inscripciones, aprobación de comprobantes de pago de Yape/Plin y control de torneos.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary px-5 py-3 text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E63946]/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Crear Nuevo Torneo
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-start gap-3 text-xs font-semibold animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946]'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="arena-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#8E92A4]">
            <span className="text-xs uppercase font-bold tracking-wider">Pagos por Revisar</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">{pendingPayments.length}</p>
          <p className="text-[11px] text-[#5A5E73]">Vouchers pendientes de validación</p>
        </div>

        <div className="arena-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#8E92A4]">
            <span className="text-xs uppercase font-bold tracking-wider">Torneos Activos</span>
            <Swords className="w-4 h-4 text-[#E63946]" />
          </div>
          <p className="text-3xl font-black text-white">{tournaments.length}</p>
          <p className="text-[11px] text-[#5A5E73]">Competencias oficiales en curso</p>
        </div>

        <div className="arena-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#8E92A4]">
            <span className="text-xs uppercase font-bold tracking-wider">Sede Organizadora</span>
            <Trophy className="w-4 h-4 text-[#457B9D]" />
          </div>
          <p className="text-xl font-black text-white truncate">Tecsup Lima</p>
          <p className="text-[11px] text-[#5A5E73]">Organización autorizada</p>
        </div>
      </div>

      {/* 3. INBOX: BANDEJA DE PAGOS EN VIVO */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Bandeja de Pagos y Comprobantes</h2>
              <p className="text-xs text-[#8E92A4]">Valida los vouchers de Yape/Plin para asegurar cupos en los brackets</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            {pendingPayments.length} pendientes
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#E63946] mx-auto" />
            <p className="text-xs text-[#8E92A4]">Cargando comprobantes...</p>
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="p-8 text-center bg-[#0B0C10] rounded-xl border border-white/5 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Bandeja al día</p>
            <p className="text-xs text-[#8E92A4]">No hay comprobantes pendientes de validación en este momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map((p) => (
              <div 
                key={p.payment_id}
                className="p-5 bg-[#0B0C10] rounded-xl border border-white/10 space-y-4 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8DADC] bg-white/5 px-2 py-0.5 rounded">
                        {p.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars'}
                      </span>
                      <span className="text-xs font-black text-amber-400">
                        {p.amount > 0 ? `S/ ${p.amount.toFixed(2)} PEN (${p.method})` : 'Inscripción Gratuita'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white">
                      {p.competitor_name} • <span className="text-[#A8DADC]">{p.in_game_name}</span> ({p.player_tag})
                    </h3>

                    <p className="text-xs text-[#8E92A4]">
                      Torneo: <strong className="text-white">{p.tournament_name}</strong> • {p.career}
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
                <div className="p-3 bg-[#15161E] rounded-lg border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#8E92A4]">
                    <QrCode className="w-3.5 h-3.5 text-[#457B9D]" />
                    <span>Operación: <strong className="text-white font-mono">{p.operation_reference || 'N/A'}</strong></span>
                  </div>

                  {p.evidence_url && (
                    <a
                      href={p.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#A8DADC] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver Captura del Voucher
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. GESTOR DE TORNEOS ACTIVOS */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#457B9D]/20 text-[#457B9D] flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Torneos de la Organización</h2>
              <p className="text-xs text-[#8E92A4]">Administración deportiva y supervisión de llaves</p>
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
              className="p-5 bg-[#0B0C10] rounded-xl border border-white/10 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A8DADC] uppercase tracking-wider">
                    {t.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {t.status}
                  </span>
                </div>

                <h3 className="text-base font-black text-white line-clamp-1">{t.name}</h3>
                
                <p className="text-xs text-[#8E92A4]">
                  {t.current_participants} de {t.max_slots} cupos ocupados • Premio: <strong className="text-amber-400">{t.prize_pool}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[#8E92A4]">
                  {Number(t.cost) === 0 ? 'Gratuito' : `S/ ${t.cost} PEN`}
                </span>

                <Link
                  href={`/tournaments/${t.slug}`}
                  className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                >
                  Gestionar & Brackets
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CREATE TOURNAMENT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg arena-card p-6 sm:p-8 bg-[#15161E] border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E63946]">
                Asistente Deportivo
              </span>
              <h3 className="text-xl font-black text-white">Lanzar Nuevo Torneo Oficial</h3>
              <p className="text-xs text-[#8E92A4]">
                Configura los parámetros del torneo para publicarlo en la cartelera universitaria.
              </p>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                    Disciplina Oficial
                  </label>
                  <select
                    value={newTourGame}
                    onChange={(e) => setNewTourGame(e.target.value as any)}
                    className="input-arena bg-[#0B0C10]"
                  >
                    <option value="CLASH_ROYALE">Clash Royale</option>
                    <option value="BRAWL_STARS">Brawl Stars</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                    Cupos Máximos
                  </label>
                  <select
                    value={newTourSlots}
                    onChange={(e) => setNewTourSlots(Number(e.target.value))}
                    className="input-arena bg-[#0B0C10]"
                  >
                    <option value={8}>8 Competidores (Cuartos)</option>
                    <option value={16}>16 Competidores (Octavos)</option>
                    <option value={32}>32 Competidores</option>
                    <option value={64}>64 Competidores</option>
                    <option value={128}>128 Competidores</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                    Pozo de Premios
                  </label>
                  <input
                    type="text"
                    required
                    value={newTourPrize}
                    onChange={(e) => setNewTourPrize(e.target.value)}
                    placeholder="S/ 500 + Trofeo"
                    className="input-arena"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
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

    </div>
  );
}
