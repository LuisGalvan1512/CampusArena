'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  Crown,
  UserCheck,
  UserX,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Swords,
  RefreshCw,
  VolumeX,
  Volume2,
  Ban,
  Clock,
  Trash2,
  RotateCcw,
  Scale,
  X,
  FileText,
  AlertTriangle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { LivingBanner } from '@/components/LivingBanner';
import { CommandConsoleIcon } from '@/components/EsportsIcons';

interface ManagedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  avatar_url?: string | null;
  created_at: string;
  last_login_at?: string | null;
  profile?: {
    nickname?: string | null;
    career?: string | null;
    cycle?: number | null;
  } | null;
  _count?: {
    registrations?: number;
  };
  active_sanction?: {
    id: string;
    type: 'MUTE' | 'BAN_TEMPORARY' | 'BAN_PERMANENT';
    reason: string;
    starts_at: string;
    ends_at?: string | null;
    pending_appeals_count?: number;
  } | null;
}

interface SanctionAppeal {
  id: string;
  sanction_id: string;
  user_id: string;
  appeal_text: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_response?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  nickname?: string | null;
  sanction_type: 'MUTE' | 'BAN_TEMPORARY' | 'BAN_PERMANENT';
  sanction_reason: string;
  sanction_starts_at: string;
  sanction_ends_at?: string | null;
  sanction_status: string;
}

export default function AdminOrganizersPage() {
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'USERS' | 'APPEALS'>('USERS');

  // Users state
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ORGANIZER' | 'ADMIN'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Appeals state
  const [appealsList, setAppealsList] = useState<SanctionAppeal[]>([]);
  const [isLoadingAppeals, setIsLoadingAppeals] = useState(false);
  const [appealFilter, setAppealFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>(
    'PENDING'
  );

  // Sanction Modal state
  const [selectedUserForSanction, setSelectedUserForSanction] = useState<ManagedUser | null>(null);
  const [sanctionType, setSanctionType] = useState<'MUTE' | 'BAN_TEMPORARY' | 'BAN_PERMANENT'>(
    'MUTE'
  );
  const [sanctionDurationDays, setSanctionDurationDays] = useState<number>(3);
  const [sanctionReason, setSanctionReason] = useState<string>('');
  const [isSubmittingSanction, setIsSubmittingSanction] = useState(false);

  // Appeal Review Modal state
  const [selectedAppealForReview, setSelectedAppealForReview] = useState<SanctionAppeal | null>(
    null
  );
  const [appealAction, setAppealAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [appealAdminResponse, setAppealAdminResponse] = useState<string>('');
  const [isSubmittingAppealReview, setIsSubmittingAppealReview] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (!isAdmin && user?.email !== 'luis.galvan@tecsup.edu.pe') {
        router.push('/profile');
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, user, router]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
    if (roleFilter !== 'ALL') queryParams.set('role', roleFilter);

    const res = await api.get<{ users: ManagedUser[] }>(`/admin/users?${queryParams.toString()}`);
    if (res.success && res.data?.users) {
      setUsersList(res.data.users);
    }
    setIsLoadingUsers(false);
  };

  const loadAppeals = async () => {
    setIsLoadingAppeals(true);
    const queryParams = new URLSearchParams();
    if (appealFilter !== 'ALL') queryParams.set('status', appealFilter);

    const res = await api.get<SanctionAppeal[]>(
      `/admin/users/moderation/appeals?${queryParams.toString()}`
    );
    if (res.success && Array.isArray(res.data)) {
      setAppealsList(res.data);
    }
    setIsLoadingAppeals(false);
  };

  useEffect(() => {
    if (isAuthenticated && (isAdmin || user?.email === 'luis.galvan@tecsup.edu.pe')) {
      if (activeTab === 'USERS') {
        loadUsers();
      } else {
        loadAppeals();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, roleFilter, activeTab, appealFilter]);

  const handleRoleChange = async (
    targetUser: ManagedUser,
    newRole: 'STUDENT' | 'ORGANIZER' | 'ADMIN'
  ) => {
    if (targetUser.email === 'luis.galvan@tecsup.edu.pe' && newRole !== 'ADMIN') {
      alert('No puedes cambiar el rol del Super Administrador principal.');
      return;
    }

    const actionName =
      newRole === 'ORGANIZER'
        ? 'ascender a Organizador'
        : newRole === 'STUDENT'
          ? 'cambiar a Estudiante'
          : 'hacer Administrador';
    if (!confirm(`¿Confirmas ${actionName} a ${targetUser.first_name} ${targetUser.last_name}?`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    setFeedback(null);

    const res = await api.patch(`/admin/users/${targetUser.id}/role`, { role: newRole });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `¡Rol de ${targetUser.first_name} actualizado a ${
          newRole === 'ORGANIZER'
            ? 'Organizador'
            : newRole === 'ADMIN'
              ? 'Administrador'
              : 'Estudiante'
        }!`,
      });
      loadUsers();
    } else {
      setFeedback({
        type: 'error',
        message: res.error?.message || 'Error al actualizar el rol del usuario.',
      });
    }

    setActionLoadingId(null);
  };

  const handleOpenSanctionModal = (targetUser: ManagedUser) => {
    setSelectedUserForSanction(targetUser);
    setSanctionType('MUTE');
    setSanctionDurationDays(3);
    setSanctionReason('');
  };

  const handleApplySanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForSanction) return;
    if (!sanctionReason.trim()) {
      alert('Por favor describe el motivo de la sanción.');
      return;
    }

    setIsSubmittingSanction(true);
    const res = await api.post(`/admin/users/${selectedUserForSanction.id}/sanctions`, {
      type: sanctionType,
      reason: sanctionReason.trim(),
      duration_days: sanctionType !== 'BAN_PERMANENT' ? sanctionDurationDays : undefined,
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Sanción aplicada exitosamente a ${selectedUserForSanction.first_name}.`,
      });
      setSelectedUserForSanction(null);
      loadUsers();
    } else {
      alert(res.error?.message || 'Error al aplicar sanción.');
    }
    setIsSubmittingSanction(false);
  };

  const handleRevokeSanction = async (targetUser: ManagedUser) => {
    if (!targetUser.active_sanction) return;
    if (
      !confirm(
        `¿Deseas levantar la sanción activa (${targetUser.active_sanction.type}) a ${targetUser.first_name} ${targetUser.last_name}?`
      )
    ) {
      return;
    }

    setActionLoadingId(targetUser.id);
    const res = await api.post(
      `/admin/users/sanctions/${targetUser.active_sanction.id}/revoke`,
      {
        revoke_reason: 'Levantada anticipadamente por administrador',
      }
    );

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Sanción levantada para ${targetUser.first_name}.`,
      });
      loadUsers();
    } else {
      alert(res.error?.message || 'Error al revocar sanción.');
    }
    setActionLoadingId(null);
  };

  const handleToggleUserStatus = async (targetUser: ManagedUser) => {
    if (targetUser.email === 'luis.galvan@tecsup.edu.pe') {
      alert('No puedes desactivar al Super Administrador principal.');
      return;
    }

    const isCurrentlyInactive = targetUser.status === 'INACTIVE';
    const confirmMsg = isCurrentlyInactive
      ? `¿Reactivar la cuenta de ${targetUser.first_name} ${targetUser.last_name}?`
      : `¿Desactivar la cuenta de ${targetUser.first_name} ${targetUser.last_name}? El usuario no podrá iniciar sesión.`;

    if (!confirm(confirmMsg)) return;

    setActionLoadingId(targetUser.id);
    const res = isCurrentlyInactive
      ? await api.post(`/admin/users/${targetUser.id}/restore`, {})
      : await api.delete(`/admin/users/${targetUser.id}`);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: isCurrentlyInactive
          ? 'Cuenta reactivada correctamente.'
          : 'Cuenta desactivada correctamente.',
      });
      loadUsers();
    } else {
      alert(res.error?.message || 'Error al modificar estado del usuario.');
    }
    setActionLoadingId(null);
  };

  const handleOpenAppealReview = (appeal: SanctionAppeal, action: 'APPROVE' | 'REJECT') => {
    setSelectedAppealForReview(appeal);
    setAppealAction(action);
    setAppealAdminResponse(
      action === 'APPROVE'
        ? 'Apelación aprobada tras revisión.'
        : 'La sanción se mantiene vigente.'
    );
  };

  const handleSubmitAppealReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppealForReview) return;

    setIsSubmittingAppealReview(true);
    const res = await api.patch(
      `/admin/users/moderation/appeals/${selectedAppealForReview.id}`,
      {
        action: appealAction,
        admin_response: appealAdminResponse.trim(),
      }
    );

    if (res.success) {
      setFeedback({
        type: 'success',
        message:
          appealAction === 'APPROVE'
            ? 'Apelación aprobada y sanción levantada.'
            : 'Apelación rechazada.',
      });
      setSelectedAppealForReview(null);
      loadAppeals();
    } else {
      alert(res.error?.message || 'Error al procesar apelación.');
    }
    setIsSubmittingAppealReview(false);
  };

  const totalStudents = usersList.filter((u) => u.role === 'STUDENT').length;
  const totalOrganizers = usersList.filter((u) => u.role === 'ORGANIZER').length;
  const totalSanctioned = usersList.filter((u) => u.active_sanction).length;

  if (authLoading || (!isAdmin && user?.email !== 'luis.galvan@tecsup.edu.pe')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D9232E]" />
        <p className="text-xs font-mono-data uppercase tracking-widest text-[var(--text-secondary)]">
          Validando privilegios Root...
        </p>
      </div>
    );
  }

  return (
    <div className="widescreen-container py-6 sm:py-10 space-y-8">
      {/* 1. LIVING HERO BANNER */}
      <LivingBanner
        imageSrc="/assets/banner_command_center.jpg"
        videoSrc="/steam/admin_card_bg.webm"
        alt="Control Root Campus Arena"
        telemetryTag="ROOT // CONTROL DE ROLES, SANCIONES Y TRIBUNAL"
        minHeightClass="min-h-[300px] sm:min-h-[340px]"
      >
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 flex items-center gap-1.5 uppercase tracking-[0.18em]">
                <Crown className="w-3.5 h-3.5" />
                ADMINISTRACIÓN ROOT
              </span>
              <span className="px-2.5 py-1 rounded-sm bg-[#070709]/85 border border-white/15 text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)]">
                Tecsup — Sede Central
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-[0.95]">
              Control de Usuarios, Roles y Moderación.
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
              Operador Root:{' '}
              <strong className="text-white font-semibold">
                {user?.first_name} {user?.last_name}
              </strong>
              . Asigna privilegios de organizador, aplica sanciones disciplinarias graduales y
              resuelve apelaciones estudiantiles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard/organizer"
              className="btn-primary py-3 px-5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <CommandConsoleIcon className="w-4 h-4" />
              Consola de Torneos &rarr;
            </Link>
          </div>
        </div>
      </LivingBanner>

      {/* 2. TELEMETRY MONOLITHS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] block">
                01 // ORGANIZADORES ACTIVOS
              </span>
              <p className="font-display text-4xl font-extrabold text-[var(--text-primary)] tabular-nums">
                {totalOrganizers}
              </p>
              <p className="text-[11px] font-mono-data text-[#D9232E]">
                Habilitados para crear y arbitrar torneos
              </p>
            </div>
            <span className="monolith-numeral text-5xl select-none">01</span>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] block">
                02 // ALUMNOS COMPETIDORES
              </span>
              <p className="font-display text-4xl font-extrabold text-[var(--text-primary)] tabular-nums">
                {totalStudents}
              </p>
              <p className="text-[11px] font-mono-data text-[var(--text-secondary)]">
                Verificados con @tecsup.edu.pe
              </p>
            </div>
            <span className="monolith-numeral text-5xl select-none">02</span>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] block">
                03 // SANCIONES VIGENTES
              </span>
              <p className="font-display text-4xl font-extrabold text-[#C5A059] tabular-nums">
                {totalSanctioned}
              </p>
              <p className="text-[11px] font-mono-data text-[#C5A059]/80">
                Silenciados o suspendidos
              </p>
            </div>
            <span className="monolith-numeral text-5xl select-none">03</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-sm flex items-start gap-3 text-xs font-semibold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400'
              : 'bg-[#D9232E]/10 border border-[#D9232E]/35 text-[#D9232E]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-[var(--border-card)] gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-5 py-3.5 text-xs font-mono-data uppercase tracking-widest font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'USERS'
              ? 'border-[#D9232E] text-[var(--text-primary)] bg-white/[0.03]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users className="w-4 h-4 shrink-0 text-[#D9232E]" />
          01 // Directorio y Moderación
        </button>

        <button
          onClick={() => setActiveTab('APPEALS')}
          className={`px-5 py-3.5 text-xs font-mono-data uppercase tracking-widest font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'APPEALS'
              ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/5'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Scale className="w-4 h-4 text-[#C5A059] shrink-0" />
          02 // Bandeja de Apelaciones
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY & MODERATION */}
      {activeTab === 'USERS' && (
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#070709] border border-[var(--border-card)] flex items-center justify-center text-[#D9232E]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)] uppercase tracking-tight">
                    Directorio Institucional de Usuarios
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Asigna roles de organizador o aplica sanciones disciplinarias
                  </p>
                </div>
              </div>

              <button
                onClick={loadUsers}
                className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                title="Refrescar lista"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  placeholder="Buscar por nombre, apodo o correo @tecsup.edu.pe..."
                  className="input-arena pl-10 text-xs w-full"
                />
              </div>

              {/* Role buttons */}
              <div className="flex items-center gap-1 bg-[#070709] p-1 rounded-sm border border-[var(--border-card)] shrink-0 overflow-x-auto max-w-full">
                {(['ALL', 'STUDENT', 'ORGANIZER', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-sm text-[11px] font-mono-data uppercase tracking-wider font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      roleFilter === r
                        ? 'bg-[#D9232E] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {r === 'ALL'
                      ? 'Todos'
                      : r === 'STUDENT'
                        ? 'Estudiantes'
                        : r === 'ORGANIZER'
                          ? 'Organizadores'
                          : 'Admins'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {isLoadingUsers ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#D9232E] mx-auto" />
                <p className="text-xs font-mono-data uppercase tracking-widest text-[var(--text-secondary)]">
                  Cargando directorio...
                </p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="py-16 text-center bg-[#070709] rounded-sm border border-[var(--border-card)] space-y-2">
                <p className="text-sm font-bold text-[var(--text-primary)] uppercase">
                  No se encontraron usuarios
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Intenta con otro término de búsqueda o filtro de rol.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[var(--border-card)] bg-[#070709] text-[10px] font-mono-data font-bold text-[var(--text-muted)] uppercase tracking-[0.18em]">
                      <th className="py-3.5 px-4">Usuario / Competidor</th>
                      <th className="py-3.5 px-4">Nivel de Acceso</th>
                      <th className="py-3.5 px-4">Estado / Sanción</th>
                      <th className="py-3.5 px-4">Registro</th>
                      <th className="py-3.5 px-4 text-right">Acciones de Moderación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-card)] text-xs">
                    {usersList.map((u) => {
                      const isMainSuperAdmin = u.email === 'luis.galvan@tecsup.edu.pe';
                      const isActionLoading = actionLoadingId === u.id;
                      const sanction = u.active_sanction;
                      const isInactive = u.status === 'INACTIVE';

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-white/[0.02] transition-colors ${
                            isInactive ? 'opacity-50' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <Link
                              href={`/profile/${u.id}`}
                              className="flex items-center gap-3 group cursor-pointer"
                              title="Click para ver perfil del competidor"
                            >
                              <div className="w-9 h-9 rounded-sm bg-[#070709] border border-[var(--border-card)] group-hover:border-[#D9232E] flex items-center justify-center font-mono-data font-bold text-[var(--text-primary)] text-xs shrink-0 transition-colors">
                                {u.first_name[0]}
                                {u.last_name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-[var(--text-primary)] group-hover:text-[#D9232E] transition-colors flex items-center gap-1.5">
                                  {u.profile?.nickname ? (
                                    <>
                                      <span className="text-[var(--text-primary)] group-hover:text-[#D9232E]">
                                        {u.profile.nickname}
                                      </span>
                                      <span className="text-[11px] text-[var(--text-muted)] font-normal">
                                        ({u.first_name} {u.last_name})
                                      </span>
                                    </>
                                  ) : (
                                    `${u.first_name} ${u.last_name}`
                                  )}
                                  {isMainSuperAdmin && (
                                    <span
                                      title="Super Administrador Principal"
                                      className="text-[#C5A059]"
                                    >
                                      👑
                                    </span>
                                  )}
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#D9232E] transition-opacity" />
                                </p>
                                <p className="text-[11px] font-mono-data text-[var(--text-secondary)]">
                                  {u.email}
                                </p>
                              </div>
                            </Link>
                          </td>

                          <td className="py-4 px-4">
                            {u.role === 'ADMIN' ? (
                              <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data uppercase font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/35 inline-flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                ADMIN ROOT
                              </span>
                            ) : u.role === 'ORGANIZER' ? (
                              <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data uppercase font-bold bg-[#D9232E]/15 text-[#D9232E] border border-[#D9232E]/35 inline-flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                ORGANIZADOR
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data uppercase font-bold bg-[#070709] text-[var(--text-secondary)] border border-[var(--border-card)]">
                                ESTUDIANTE
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {isInactive ? (
                              <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-white/5 text-[var(--text-muted)] border border-white/10">
                                DESACTIVADO
                              </span>
                            ) : sanction ? (
                              <div className="flex flex-col gap-0.5">
                                {sanction.type === 'MUTE' ? (
                                  <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/35 inline-flex items-center gap-1 w-fit">
                                    <VolumeX className="w-3 h-3" />
                                    SILENCIADO
                                  </span>
                                ) : sanction.type === 'BAN_TEMPORARY' ? (
                                  <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-[#D9232E]/15 text-[#D9232E] border border-[#D9232E]/35 inline-flex items-center gap-1 w-fit">
                                    <Clock className="w-3 h-3" />
                                    SUSPENDIDO
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-[#D9232E]/30 text-white border border-[#D9232E] inline-flex items-center gap-1 w-fit">
                                    <Ban className="w-3 h-3" />
                                    BANEADO PERM.
                                  </span>
                                )}
                                <p
                                  className="text-[10px] text-[var(--text-secondary)] truncate max-w-[180px]"
                                  title={sanction.reason}
                                >
                                  Motivo: {sanction.reason}
                                </p>
                              </div>
                            ) : (
                              <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                ACTIVO
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 font-mono-data text-[11px] text-[var(--text-secondary)]">
                            {new Date(u.created_at).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="py-4 px-4 text-right">
                            {isMainSuperAdmin ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] font-mono-data uppercase text-[var(--text-muted)]">
                                  Inmutable
                                </span>
                                <Link
                                  href={`/profile/${u.id}`}
                                  className="p-1.5 rounded-sm bg-[#070709] hover:bg-white/5 text-[var(--text-secondary)] hover:text-white border border-[var(--border-card)] transition-colors inline-flex items-center"
                                  title="Ver perfil público"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            ) : isActionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#D9232E] inline-block" />
                            ) : (
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                <Link
                                  href={`/profile/${u.id}`}
                                  className="px-2.5 py-1.5 rounded-sm text-[10px] font-mono-data uppercase font-bold bg-[#070709] text-[var(--text-secondary)] hover:text-white border border-[var(--border-card)] transition-all flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Perfil
                                </Link>

                                {u.role === 'STUDENT' ? (
                                  <button
                                    onClick={() => handleRoleChange(u, 'ORGANIZER')}
                                    className="px-2.5 py-1.5 rounded-sm text-[10px] font-mono-data uppercase font-bold bg-[#D9232E]/15 text-[#D9232E] hover:bg-[#D9232E] hover:text-white border border-[#D9232E]/35 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <UserCheck className="w-3 h-3" />
                                    + Organizador
                                  </button>
                                ) : u.role === 'ORGANIZER' ? (
                                  <button
                                    onClick={() => handleRoleChange(u, 'STUDENT')}
                                    className="px-2.5 py-1.5 rounded-sm text-[10px] font-mono-data uppercase font-bold bg-[#070709] text-[var(--text-secondary)] hover:text-[#D9232E] border border-[var(--border-card)] transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <UserX className="w-3 h-3" />
                                    Alumno
                                  </button>
                                ) : null}

                                {sanction ? (
                                  <button
                                    onClick={() => handleRevokeSanction(u)}
                                    className="px-2.5 py-1.5 rounded-sm text-[10px] font-mono-data uppercase font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/35 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                    Levantar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenSanctionModal(u)}
                                    className="px-2.5 py-1.5 rounded-sm text-[10px] font-mono-data uppercase font-bold bg-[#C5A059]/15 text-[#C5A059] hover:bg-[#C5A059] hover:text-black border border-[#C5A059]/35 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <VolumeX className="w-3 h-3" />
                                    Sancionar
                                  </button>
                                )}

                                {isInactive ? (
                                  <button
                                    onClick={() => handleToggleUserStatus(u)}
                                    className="p-1.5 rounded-sm bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors cursor-pointer"
                                    title="Reactivar cuenta"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleUserStatus(u)}
                                    className="p-1.5 rounded-sm bg-[#070709] text-[var(--text-muted)] hover:text-[#D9232E] border border-[var(--border-card)] transition-colors cursor-pointer"
                                    title="Desactivar cuenta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPEALS INBOX */}
      {activeTab === 'APPEALS' && (
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#C5A059]/15 border border-[#C5A059]/35 flex items-center justify-center text-[#C5A059]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)] uppercase tracking-tight">
                    Tribunal de Apelaciones Estudiantiles
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Evalúa los descargos presentados por estudiantes sancionados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#070709] p-1 rounded-sm border border-[var(--border-card)] shrink-0">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setAppealFilter(s)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-mono-data uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                      appealFilter === s
                        ? 'bg-[#C5A059] text-black'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {s === 'PENDING'
                      ? 'Pendientes'
                      : s === 'APPROVED'
                        ? 'Aprobadas'
                        : s === 'REJECTED'
                          ? 'Rechazadas'
                          : 'Todas'}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingAppeals ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#C5A059] mx-auto" />
                <p className="text-xs font-mono-data uppercase tracking-widest text-[var(--text-secondary)]">
                  Cargando expedientes de apelación...
                </p>
              </div>
            ) : appealsList.length === 0 ? (
              <div className="py-16 text-center bg-[#070709] rounded-sm border border-[var(--border-card)] space-y-2">
                <p className="text-sm font-bold text-[var(--text-primary)] uppercase">
                  Sin apelaciones en esta bandeja
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Cuando un estudiante sancionado envíe un descargo aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appealsList.map((appeal) => {
                  const isPending = appeal.status === 'PENDING';
                  return (
                    <div
                      key={appeal.id}
                      className="p-5 rounded-sm bg-[#070709] border border-[var(--border-card)] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-card)] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text-primary)] text-sm">
                              {appeal.nickname
                                ? `${appeal.nickname} (${appeal.first_name} ${appeal.last_name})`
                                : `${appeal.first_name} ${appeal.last_name}`}
                            </span>
                            <span className="text-xs font-mono-data text-[var(--text-secondary)]">
                              {appeal.email}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono-data text-[var(--text-muted)]">
                            Enviada: {new Date(appeal.created_at).toLocaleString('es-PE')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-[#D9232E]/15 text-[#D9232E] border border-[#D9232E]/35">
                            {appeal.sanction_type}
                          </span>
                          {appeal.status === 'PENDING' ? (
                            <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/35">
                              PENDIENTE
                            </span>
                          ) : appeal.status === 'APPROVED' ? (
                            <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/35">
                              APROBADA
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono-data font-bold bg-white/5 text-[var(--text-muted)] border border-white/10">
                              RECHAZADA
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs bg-[#0D0D10] p-3.5 rounded-sm border border-[var(--border-card)]">
                        <strong className="text-[var(--text-primary)]">
                          Motivo original de la sanción:
                        </strong>{' '}
                        <span className="text-[var(--text-secondary)]">
                          {appeal.sanction_reason}
                        </span>
                      </div>

                      <div className="text-xs bg-[#C5A059]/5 p-4 rounded-sm border border-[#C5A059]/25 space-y-1">
                        <p className="text-[#C5A059] font-mono-data uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Descargo del Estudiante:
                        </p>
                        <p className="text-[var(--text-primary)] leading-relaxed italic">
                          &ldquo;{appeal.appeal_text}&rdquo;
                        </p>
                      </div>

                      {appeal.admin_response && (
                        <div className="text-xs bg-[#0D0D10] p-3.5 rounded-sm border border-[var(--border-card)] text-[var(--text-secondary)]">
                          <strong className="text-[var(--text-primary)]">
                            Resolución Administrativa:
                          </strong>{' '}
                          {appeal.admin_response}
                        </div>
                      )}

                      {isPending && (
                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            onClick={() => handleOpenAppealReview(appeal, 'REJECT')}
                            className="px-4 py-2 rounded-sm text-xs font-mono-data uppercase font-bold bg-[#D9232E]/10 hover:bg-[#D9232E]/20 text-[#D9232E] border border-[#D9232E]/30 transition-all cursor-pointer"
                          >
                            Rechazar Apelación
                          </button>
                          <button
                            onClick={() => handleOpenAppealReview(appeal, 'APPROVE')}
                            className="btn-primary py-2 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprobar y Levantar Sanción
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SANCTION MODAL */}
      {selectedUserForSanction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="double-bezel max-w-lg w-full">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[#C5A059]/15 border border-[#C5A059]/35 text-[#C5A059] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[var(--text-primary)] uppercase">
                      Aplicar Sanción Disciplinaria
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {selectedUserForSanction.first_name} {selectedUserForSanction.last_name} (
                      {selectedUserForSanction.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserForSanction(null)}
                  className="p-1.5 rounded-sm text-[var(--text-secondary)] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplySanction} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono-data uppercase tracking-widest font-bold text-[var(--text-secondary)]">
                    Tipo de Sanción:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSanctionType('MUTE')}
                      className={`p-3 rounded-sm border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        sanctionType === 'MUTE'
                          ? 'bg-[#C5A059]/15 border-[#C5A059] text-[#C5A059] font-bold'
                          : 'bg-[#070709] border-[var(--border-card)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>Silencio (Mute)</span>
                      <span className="text-[10px] font-normal text-[var(--text-muted)]">
                        Bloquea posts y comentarios
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSanctionType('BAN_TEMPORARY')}
                      className={`p-3 rounded-sm border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        sanctionType === 'BAN_TEMPORARY'
                          ? 'bg-[#D9232E]/15 border-[#D9232E] text-[#D9232E] font-bold'
                          : 'bg-[#070709] border-[var(--border-card)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Baneo Temporal</span>
                      <span className="text-[10px] font-normal text-[var(--text-muted)]">
                        Suspende juego en torneos
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSanctionType('BAN_PERMANENT')}
                      className={`p-3 rounded-sm border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        sanctionType === 'BAN_PERMANENT'
                          ? 'bg-[#D9232E]/30 border-[#D9232E] text-white font-bold'
                          : 'bg-[#070709] border-[var(--border-card)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                      <span>Baneo Permanente</span>
                      <span className="text-[10px] font-normal text-[var(--text-muted)]">
                        Expulsión definitiva
                      </span>
                    </button>
                  </div>
                </div>

                {sanctionType !== 'BAN_PERMANENT' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest font-bold text-[var(--text-secondary)]">
                      Duración de la Sanción:
                    </label>
                    <div className="flex gap-2">
                      {[1, 3, 7, 15, 30].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setSanctionDurationDays(days)}
                          className={`flex-1 py-2 rounded-sm text-xs font-mono-data font-bold border transition-all cursor-pointer ${
                            sanctionDurationDays === days
                              ? 'bg-[#D9232E] border-[#D9232E] text-white'
                              : 'bg-[#070709] border-[var(--border-card)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-mono-data uppercase tracking-widest font-bold text-[var(--text-secondary)]">
                    Motivo Oficial:
                  </label>
                  <textarea
                    value={sanctionReason}
                    onChange={(e) => setSanctionReason(e.target.value)}
                    placeholder="Describe detalladamente la causa de la sanción..."
                    rows={3}
                    required
                    className="input-arena w-full text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-card)]">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForSanction(null)}
                    className="btn-secondary px-4 py-2 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSanction}
                    className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingSanction ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Confirmar Sanción
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* APPEAL REVIEW MODAL */}
      {selectedAppealForReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="double-bezel max-w-lg w-full">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                <h3 className="font-display text-base font-bold text-[var(--text-primary)] uppercase">
                  {appealAction === 'APPROVE'
                    ? 'Aprobar Apelación y Levantar Sanción'
                    : 'Rechazar Apelación'}
                </h3>
                <button
                  onClick={() => setSelectedAppealForReview(null)}
                  className="p-1.5 rounded-sm text-[var(--text-secondary)] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#070709] p-3.5 rounded-sm border border-[var(--border-card)] text-xs space-y-1">
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Estudiante:</strong>{' '}
                  {selectedAppealForReview.first_name} {selectedAppealForReview.last_name} (
                  {selectedAppealForReview.email})
                </p>
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Sanción:</strong>{' '}
                  {selectedAppealForReview.sanction_type} ({selectedAppealForReview.sanction_reason})
                </p>
                <p className="text-[#C5A059] italic pt-1">
                  &ldquo;{selectedAppealForReview.appeal_text}&rdquo;
                </p>
              </div>

              <form onSubmit={handleSubmitAppealReview} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono-data uppercase tracking-widest font-bold text-[var(--text-secondary)]">
                    Resolución Administrativa:
                  </label>
                  <textarea
                    value={appealAdminResponse}
                    onChange={(e) => setAppealAdminResponse(e.target.value)}
                    rows={3}
                    className="input-arena w-full text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-card)]">
                  <button
                    type="button"
                    onClick={() => setSelectedAppealForReview(null)}
                    className="btn-secondary px-4 py-2 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAppealReview}
                    className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingAppealReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {appealAction === 'APPROVE'
                      ? 'Aprobar y Levantar Sanción'
                      : 'Confirmar Rechazo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
