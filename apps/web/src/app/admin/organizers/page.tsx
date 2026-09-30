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
  ExternalLink
} from 'lucide-react';

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

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'USERS' | 'APPEALS'>('USERS');

  // Users state
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ORGANIZER' | 'ADMIN'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Appeals state
  const [appealsList, setAppealsList] = useState<SanctionAppeal[]>([]);
  const [isLoadingAppeals, setIsLoadingAppeals] = useState(false);
  const [appealFilter, setAppealFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');

  // Sanction Modal state
  const [selectedUserForSanction, setSelectedUserForSanction] = useState<ManagedUser | null>(null);
  const [sanctionType, setSanctionType] = useState<'MUTE' | 'BAN_TEMPORARY' | 'BAN_PERMANENT'>('MUTE');
  const [sanctionDurationDays, setSanctionDurationDays] = useState<number>(3);
  const [sanctionReason, setSanctionReason] = useState<string>('');
  const [isSubmittingSanction, setIsSubmittingSanction] = useState(false);

  // Appeal Review Modal state
  const [selectedAppealForReview, setSelectedAppealForReview] = useState<SanctionAppeal | null>(null);
  const [appealAction, setAppealAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [appealAdminResponse, setAppealAdminResponse] = useState<string>('');
  const [isSubmittingAppealReview, setIsSubmittingAppealReview] = useState(false);

  // Redirect if not Admin
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

    const res = await api.get<SanctionAppeal[]>(`/admin/users/moderation/appeals?${queryParams.toString()}`);
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
  }, [isAuthenticated, isAdmin, roleFilter, activeTab, appealFilter]);

  // Handle Role Change
  const handleRoleChange = async (targetUser: ManagedUser, newRole: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => {
    if (targetUser.email === 'luis.galvan@tecsup.edu.pe' && newRole !== 'ADMIN') {
      alert('No puedes cambiar el rol del Super Administrador principal.');
      return;
    }

    const actionName = newRole === 'ORGANIZER' ? 'ascender a Organizador' : newRole === 'STUDENT' ? 'cambiar a Estudiante' : 'hacer Administrador';
    if (!confirm(`¿Confirmas ${actionName} a ${targetUser.first_name} ${targetUser.last_name}?`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    setFeedback(null);

    const res = await api.patch(`/admin/users/${targetUser.id}/role`, { role: newRole });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `¡Rol de ${targetUser.first_name} actualizado a ${newRole === 'ORGANIZER' ? 'Organizador' : newRole === 'ADMIN' ? 'Administrador' : 'Estudiante'}!`,
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

  // Open Sanction Modal
  const handleOpenSanctionModal = (targetUser: ManagedUser) => {
    setSelectedUserForSanction(targetUser);
    setSanctionType('MUTE');
    setSanctionDurationDays(3);
    setSanctionReason('');
  };

  // Submit Sanction
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

  // Revoke Sanction
  const handleRevokeSanction = async (targetUser: ManagedUser) => {
    if (!targetUser.active_sanction) return;
    if (!confirm(`¿Deseas levantar la sanción activa (${targetUser.active_sanction.type}) a ${targetUser.first_name} ${targetUser.last_name}?`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    const res = await api.post(`/admin/users/sanctions/${targetUser.active_sanction.id}/revoke`, {
      revoke_reason: 'Levantada anticipadamente por administrador',
    });

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

  // Soft Delete / Restore User
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
        message: isCurrentlyInactive ? 'Cuenta reactivada correctamente.' : 'Cuenta desactivada correctamente.',
      });
      loadUsers();
    } else {
      alert(res.error?.message || 'Error al modificar estado del usuario.');
    }
    setActionLoadingId(null);
  };

  // Review Appeal
  const handleOpenAppealReview = (appeal: SanctionAppeal, action: 'APPROVE' | 'REJECT') => {
    setSelectedAppealForReview(appeal);
    setAppealAction(action);
    setAppealAdminResponse(action === 'APPROVE' ? 'Apelación aprobada tras revisión.' : 'La sanción se mantiene vigente.');
  };

  const handleSubmitAppealReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppealForReview) return;

    setIsSubmittingAppealReview(true);
    const res = await api.patch(`/admin/users/moderation/appeals/${selectedAppealForReview.id}`, {
      action: appealAction,
      admin_response: appealAdminResponse.trim(),
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: appealAction === 'APPROVE' ? 'Apelación aprobada y sanción levantada.' : 'Apelación rechazada.',
      });
      setSelectedAppealForReview(null);
      loadAppeals();
    } else {
      alert(res.error?.message || 'Error al procesar apelación.');
    }
    setIsSubmittingAppealReview(false);
  };

  // Stats
  const totalStudents = usersList.filter(u => u.role === 'STUDENT').length;
  const totalOrganizers = usersList.filter(u => u.role === 'ORGANIZER').length;
  const totalSanctioned = usersList.filter(u => u.active_sanction).length;

  if (authLoading || (!isAdmin && user?.email !== 'luis.galvan@tecsup.edu.pe')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
        <p className="text-xs text-[#8E92A4]">Validando privilegios de administrador...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. HERO HEADER */}
      <div className="arena-card p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 to-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                Panel de Administración y Moderación
              </span>
              <span className="text-xs text-[#8E92A4]">Tecsup — Sede Central</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Control de Usuarios, Sanciones y Apelaciones
            </h1>
            <p className="text-sm text-[#8E92A4] max-w-2xl">
              Bienvenido, <strong className="text-white font-bold">{user?.first_name} {user?.last_name}</strong>. Gestiona los roles de organizadores, aplica sanciones disciplinarias graduales (silencios y baneos) y evalúa apelaciones de la comunidad estudiantil.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/organizer"
              className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2 shadow-lg shadow-[#E63946]/20 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              Panel de Torneos &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="arena-card p-5 border-[#E63946]/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-[#8E92A4] font-semibold uppercase">Organizadores Asignados</p>
            <p className="text-3xl font-black text-white">{totalOrganizers}</p>
            <p className="text-[10px] text-[#E63946]">Pueden crear y arbitrar torneos</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E63946]/20 text-[#E63946] flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="arena-card p-5 border-[#457B9D]/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-[#8E92A4] font-semibold uppercase">Alumnos Competidores</p>
            <p className="text-3xl font-black text-white">{totalStudents}</p>
            <p className="text-[10px] text-[#A8DADC]">Registrados con @tecsup.edu.pe</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#457B9D]/20 text-[#A8DADC] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="arena-card p-5 border-amber-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-[#8E92A4] font-semibold uppercase">Usuarios con Sanción Activa</p>
            <p className="text-3xl font-black text-amber-400">{totalSanctioned}</p>
            <p className="text-[10px] text-amber-400/80">Silenciados o suspendidos temporalmente</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-start gap-3 text-xs font-semibold animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946]'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'USERS'
              ? 'border-[#E63946] text-white bg-white/5 rounded-t-xl'
              : 'border-transparent text-[#8E92A4] hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Directorio y Moderación
        </button>

        <button
          onClick={() => setActiveTab('APPEALS')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'APPEALS'
              ? 'border-amber-400 text-amber-300 bg-amber-500/5 rounded-t-xl'
              : 'border-transparent text-[#8E92A4] hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-400" />
          Bandeja de Apelaciones
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY & MODERATION */}
      {activeTab === 'USERS' && (
        <div className="arena-card p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#A8DADC]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Directorio de Usuarios y Moderación</h2>
                <p className="text-xs text-[#8E92A4]">Asigna roles o aplica sanciones de silencio y baneo</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadUsers}
                className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                title="Refrescar lista"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#5A5E73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                placeholder="Buscar por nombre, apodo o correo @tecsup.edu.pe..."
                className="input-arena pl-10 text-xs w-full"
              />
            </div>

            {/* Role pills */}
            <div className="flex items-center gap-1.5 bg-[#0B0C10] p-1 rounded-xl border border-white/10 shrink-0">
              {(['ALL', 'STUDENT', 'ORGANIZER', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    roleFilter === r
                      ? 'bg-[#E63946] text-white shadow-md'
                      : 'text-[#8E92A4] hover:text-white'
                  }`}
                >
                  {r === 'ALL' ? 'Todos' : r === 'STUDENT' ? 'Estudiantes' : r === 'ORGANIZER' ? 'Organizadores' : 'Admins'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {isLoadingUsers ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#E63946] mx-auto" />
              <p className="text-xs text-[#8E92A4]">Cargando usuarios registrados...</p>
            </div>
          ) : usersList.length === 0 ? (
            <div className="py-16 text-center bg-[#0B0C10] rounded-xl border border-white/5 space-y-2">
              <p className="text-sm font-bold text-white">No se encontraron usuarios</p>
              <p className="text-xs text-[#8E92A4]">Intenta con otro término de búsqueda o filtro de rol.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold text-[#8E92A4] uppercase tracking-wider">
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Estado / Sanción</th>
                    <th className="py-3 px-4">Registro</th>
                    <th className="py-3 px-4 text-right">Acciones de Moderación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {usersList.map((u) => {
                    const isMainSuperAdmin = u.email === 'luis.galvan@tecsup.edu.pe';
                    const isActionLoading = actionLoadingId === u.id;
                    const sanction = u.active_sanction;
                    const isInactive = u.status === 'INACTIVE';

                    return (
                      <tr key={u.id} className={`hover:bg-white/[0.02] transition-colors ${isInactive ? 'opacity-50' : ''}`}>
                        
                        {/* Name, Nickname & Email */}
                        <td className="py-4 px-4">
                          <Link 
                            href={`/profile/${u.id}`}
                            className="flex items-center gap-3 group cursor-pointer"
                            title="Click para ver perfil del competidor"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#457B9D] p-0.5 shrink-0 group-hover:scale-105 transition-transform">
                              <div className="w-full h-full bg-[#0B0C10] rounded-[10px] flex items-center justify-center font-bold text-white text-xs">
                                {u.first_name[0]}{u.last_name[0]}
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-[#E63946] transition-colors flex items-center gap-1.5">
                                {u.profile?.nickname ? (
                                  <>
                                    <span className="text-[#A8DADC] group-hover:text-white">{u.profile.nickname}</span>
                                    <span className="text-[11px] text-[#8E92A4] font-normal">({u.first_name} {u.last_name})</span>
                                  </>
                                ) : (
                                  `${u.first_name} ${u.last_name}`
                                )}
                                {isMainSuperAdmin && (
                                  <span title="Super Administrador Principal" className="text-amber-400">👑</span>
                                )}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#E63946] transition-opacity" />
                              </p>
                              <p className="text-[11px] font-mono text-[#8E92A4]">{u.email}</p>
                            </div>
                          </Link>
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-4">
                          {u.role === 'ADMIN' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              ADMIN
                            </span>
                          ) : u.role === 'ORGANIZER' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 inline-flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              ORGANIZADOR
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-[#8E92A4] border border-white/10">
                              ESTUDIANTE
                            </span>
                          )}
                        </td>

                        {/* Status / Sanction Status */}
                        <td className="py-4 px-4">
                          {isInactive ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                              DESACTIVADO
                            </span>
                          ) : sanction ? (
                            <div className="flex flex-col gap-0.5">
                              {sanction.type === 'MUTE' ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1 w-fit">
                                  <VolumeX className="w-3 h-3" />
                                  SILENCIADO
                                </span>
                              ) : sanction.type === 'BAN_TEMPORARY' ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 inline-flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3" />
                                  SUSPENDIDO
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600/30 text-red-200 border border-red-600/50 inline-flex items-center gap-1 w-fit">
                                  <Ban className="w-3 h-3" />
                                  BANEADO PERM.
                                </span>
                              )}
                              <p className="text-[10px] text-[#8E92A4] truncate max-w-[180px]" title={sanction.reason}>
                                Motivo: {sanction.reason}
                              </p>
                              {sanction.ends_at && (
                                <p className="text-[9px] text-amber-400/80">
                                  Expira: {new Date(sanction.ends_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              ACTIVO
                            </span>
                          )}
                        </td>

                        {/* Registration Date */}
                        <td className="py-4 px-4 text-[#8E92A4]">
                          {new Date(u.created_at).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          {isMainSuperAdmin ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[11px] font-semibold text-[#5A5E73]">
                                Inmutable
                              </span>
                              <Link
                                href={`/profile/${u.id}`}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A8DADC] hover:text-white border border-white/10 transition-colors inline-flex items-center gap-1"
                                title="Ver perfil público"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          ) : isActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white inline-block" />
                          ) : (
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              
                              {/* Ver Perfil Button */}
                              <Link
                                href={`/profile/${u.id}`}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 text-[#A8DADC] hover:bg-white/10 hover:text-white border border-white/10 transition-all flex items-center gap-1"
                                title="Ver perfil de competidor"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Perfil
                              </Link>

                              {/* Role Button */}
                              {u.role === 'STUDENT' ? (
                                <button
                                  onClick={() => handleRoleChange(u, 'ORGANIZER')}
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#E63946]/20 text-[#E63946] hover:bg-[#E63946] hover:text-white border border-[#E63946]/30 transition-all cursor-pointer flex items-center gap-1"
                                  title="Dar permisos de organizador"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  Organizador
                                </button>
                              ) : u.role === 'ORGANIZER' ? (
                                <button
                                  onClick={() => handleRoleChange(u, 'STUDENT')}
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 text-[#8E92A4] hover:bg-[#E63946]/20 hover:text-[#E63946] border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                                  title="Quitar permisos de organizador"
                                >
                                  <UserX className="w-3 h-3" />
                                  Alumno
                                </button>
                              ) : null}

                              {/* Sanction Actions */}
                              {sanction ? (
                                <button
                                  onClick={() => handleRevokeSanction(u)}
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                                  title="Levantar sanción y restaurar privilegios"
                                >
                                  <Volume2 className="w-3 h-3" />
                                  Levantar
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenSanctionModal(u)}
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
                                  title="Silenciar o banear cuenta"
                                >
                                  <VolumeX className="w-3 h-3" />
                                  Sancionar
                                </button>
                              )}

                              {/* Deactivate / Restore Button */}
                              {isInactive ? (
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors cursor-pointer"
                                  title="Reactivar cuenta"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className="p-1.5 rounded-lg bg-white/5 text-[#8E92A4] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
      )}

      {/* TAB 2: APPEALS INBOX */}
      {activeTab === 'APPEALS' && (
        <div className="arena-card p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Bandeja de Apelaciones de Estudiantes</h2>
                <p className="text-xs text-[#8E92A4]">Revisa los descargos de alumnos sancionados y decide si levantar la sanción</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-[#0B0C10] p-1 rounded-xl border border-white/10 shrink-0">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setAppealFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    appealFilter === s
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-[#8E92A4] hover:text-white'
                  }`}
                >
                  {s === 'PENDING' ? 'Pendientes' : s === 'APPROVED' ? 'Aprobadas' : s === 'REJECTED' ? 'Rechazadas' : 'Todas'}
                </button>
              ))}
            </div>
          </div>

          {/* Appeals List */}
          {isLoadingAppeals ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs text-[#8E92A4]">Cargando solicitudes de apelación...</p>
            </div>
          ) : appealsList.length === 0 ? (
            <div className="py-16 text-center bg-[#0B0C10] rounded-xl border border-white/5 space-y-2">
              <p className="text-sm font-bold text-white">No hay apelaciones en esta categoría</p>
              <p className="text-xs text-[#8E92A4]">Cuando un alumno sancionado envíe su descargo, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appealsList.map((appeal) => {
                const isPending = appeal.status === 'PENDING';

                return (
                  <div key={appeal.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {appeal.nickname ? `${appeal.nickname} (${appeal.first_name} ${appeal.last_name})` : `${appeal.first_name} ${appeal.last_name}`}
                          </span>
                          <span className="text-xs font-mono text-[#8E92A4]">{appeal.email}</span>
                        </div>
                        <p className="text-[11px] text-[#5A5E73]">
                          Enviada el: {new Date(appeal.created_at).toLocaleString('es-PE')}
                        </p>
                      </div>

                      {/* Sanction Details Badge */}
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          {appeal.sanction_type}
                        </span>
                        {appeal.status === 'PENDING' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PENDIENTE DE REVISIÓN
                          </span>
                        ) : appeal.status === 'APPROVED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            APROBADA
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                            RECHAZADA
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sanction Context */}
                    <div className="text-xs bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                      <p className="text-[#8E92A4]">
                        <strong className="text-white">Motivo original de la sanción:</strong> {appeal.sanction_reason}
                      </p>
                    </div>

                    {/* Student Appeal Text */}
                    <div className="text-xs bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-1">
                      <p className="text-amber-400 font-bold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Descargo / Explicación del Estudiante:
                      </p>
                      <p className="text-[#A8DADC] leading-relaxed italic">
                        "{appeal.appeal_text}"
                      </p>
                    </div>

                    {/* Admin Response if already reviewed */}
                    {appeal.admin_response && (
                      <div className="text-xs bg-white/5 p-3 rounded-xl border border-white/5 text-[#8E92A4]">
                        <strong className="text-white">Respuesta del Administrador:</strong> {appeal.admin_response}
                      </div>
                    )}

                    {/* Review Actions */}
                    {isPending && (
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => handleOpenAppealReview(appeal, 'REJECT')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                        >
                          Rechazar Apelación
                        </button>
                        <button
                          onClick={() => handleOpenAppealReview(appeal, 'APPROVE')}
                          className="btn-primary py-2 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
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
      )}

      {/* SANCTION MODAL */}
      {selectedUserForSanction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="arena-card p-6 sm:p-8 max-w-lg w-full space-y-5 border-amber-500/30">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Aplicar Sanción Disciplinaria</h3>
                  <p className="text-xs text-[#8E92A4]">
                    A: {selectedUserForSanction.first_name} {selectedUserForSanction.last_name} ({selectedUserForSanction.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForSanction(null)}
                className="p-1 rounded-lg text-[#8E92A4] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySanction} className="space-y-4 text-xs">
              
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="font-bold text-white">Tipo de Sanción:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSanctionType('MUTE')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      sanctionType === 'MUTE'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/10 text-[#8E92A4] hover:text-white'
                    }`}
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>Silencio (Mute)</span>
                    <span className="text-[10px] font-normal text-[#8E92A4]">Bloquea crear posts y comentarios en el foro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSanctionType('BAN_TEMPORARY')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      sanctionType === 'BAN_TEMPORARY'
                        ? 'bg-[#E63946]/20 border-[#E63946] text-[#E63946] font-bold'
                        : 'bg-white/5 border-white/10 text-[#8E92A4] hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Baneo Temporal</span>
                    <span className="text-[10px] font-normal text-[#8E92A4]">Suspende inscripción y juego en torneos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSanctionType('BAN_PERMANENT')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      sanctionType === 'BAN_PERMANENT'
                        ? 'bg-red-600/30 border-red-500 text-red-300 font-bold'
                        : 'bg-white/5 border-white/10 text-[#8E92A4] hover:text-white'
                    }`}
                  >
                    <Ban className="w-4 h-4" />
                    <span>Baneo Permanente</span>
                    <span className="text-[10px] font-normal text-[#8E92A4]">Expulsión definitiva de la plataforma</span>
                  </button>
                </div>
              </div>

              {/* Duration (if not permanent) */}
              {sanctionType !== 'BAN_PERMANENT' && (
                <div className="space-y-2">
                  <label className="font-bold text-white">Duración de la Sanción:</label>
                  <div className="flex gap-2">
                    {[1, 3, 7, 15, 30].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setSanctionDurationDays(days)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          sanctionDurationDays === days
                            ? 'bg-white/20 border-white text-white'
                            : 'bg-white/5 border-white/10 text-[#8E92A4] hover:text-white'
                        }`}
                      >
                        {days} {days === 1 ? 'día' : 'días'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <label className="font-bold text-white">Motivo / Razón de la sanción:</label>
                <textarea
                  value={sanctionReason}
                  onChange={(e) => setSanctionReason(e.target.value)}
                  placeholder="Explica detalladamente la causa (ej. Lenguaje ofensivo en post, inasistencia injustificada a final de torneo, etc.)..."
                  rows={3}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedUserForSanction(null)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSanction}
                  className="btn-primary px-5 py-2 flex items-center gap-1.5"
                >
                  {isSubmittingSanction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Confirmar Sanción
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* APPEAL REVIEW MODAL */}
      {selectedAppealForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="arena-card p-6 sm:p-8 max-w-lg w-full space-y-5 border-amber-500/30">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">
                {appealAction === 'APPROVE' ? 'Aprobar Apelación y Levantar Sanción' : 'Rechazar Apelación'}
              </h3>
              <button
                onClick={() => setSelectedAppealForReview(null)}
                className="p-1 rounded-lg text-[#8E92A4] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-xs space-y-1">
              <p className="text-[#8E92A4]"><strong className="text-white">Estudiante:</strong> {selectedAppealForReview.first_name} {selectedAppealForReview.last_name} ({selectedAppealForReview.email})</p>
              <p className="text-[#8E92A4]"><strong className="text-white">Sanción aplicada:</strong> {selectedAppealForReview.sanction_type} ({selectedAppealForReview.sanction_reason})</p>
              <p className="text-[#A8DADC] italic pt-1">"{selectedAppealForReview.appeal_text}"</p>
            </div>

            <form onSubmit={handleSubmitAppealReview} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-white">Nota / Respuesta administrativa al alumno (Opcional):</label>
                <textarea
                  value={appealAdminResponse}
                  onChange={(e) => setAppealAdminResponse(e.target.value)}
                  placeholder="Mensaje que se enviará al alumno notificando la resolución..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedAppealForReview(null)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAppealReview}
                  className={`btn-primary px-5 py-2 flex items-center gap-1.5 ${
                    appealAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {isSubmittingAppealReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {appealAction === 'APPROVE' ? 'Aprobar y Levantar Sanción' : 'Confirmar Rechazo'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

