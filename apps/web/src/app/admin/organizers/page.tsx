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
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Swords, 
  ArrowRight,
  GraduationCap,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ManagedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
  avatar_url?: string | null;
  created_at: string;
  last_login_at?: string | null;
  profile?: {
    career?: string | null;
    cycle?: number | null;
  } | null;
  _count?: {
    registrations?: number;
  };
}

export default function AdminOrganizersPage() {
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ORGANIZER' | 'ADMIN'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  useEffect(() => {
    if (isAuthenticated && (isAdmin || user?.email === 'luis.galvan@tecsup.edu.pe')) {
      loadUsers();
    }
  }, [isAuthenticated, isAdmin, roleFilter]);

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

  // Stats
  const totalStudents = usersList.filter(u => u.role === 'STUDENT').length;
  const totalOrganizers = usersList.filter(u => u.role === 'ORGANIZER').length;
  const totalAdmins = usersList.filter(u => u.role === 'ADMIN').length;

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
                Panel Super Admin
              </span>
              <span className="text-xs text-[#8E92A4]">Tecsup — Sede Central</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Gestión de Organizadores y Alumnos
            </h1>
            <p className="text-sm text-[#8E92A4] max-w-2xl">
              Bienvenido, <strong className="text-white font-bold">{user?.first_name} {user?.last_name}</strong>. Aquí puedes designar a otros estudiantes de Tecsup como organizadores oficiales para que puedan crear y gestionar torneos y llaves.
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
        
        <div className="arena-card p-5 border-amber-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-[#8E92A4] font-semibold uppercase">Super Administradores</p>
            <p className="text-3xl font-black text-white">{totalAdmins}</p>
            <p className="text-[10px] text-amber-400">Control total del sistema</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
        </div>

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

      {/* 3. SEARCH & TABLE OF USERS */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#A8DADC]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Directorio de Usuarios de Tecsup</h2>
              <p className="text-xs text-[#8E92A4]">Asigna roles de organizador a los estudiantes que coordinarán torneos</p>
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
              placeholder="Buscar por nombre, apellido o correo @tecsup.edu.pe..."
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
                  <th className="py-3 px-4">Usuario / Correo</th>
                  <th className="py-3 px-4">Carrera / Ciclo</th>
                  <th className="py-3 px-4">Rol Actual</th>
                  <th className="py-3 px-4">Fecha Registro</th>
                  <th className="py-3 px-4 text-right">Acciones de Administrador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {usersList.map((u) => {
                  const isMainSuperAdmin = u.email === 'luis.galvan@tecsup.edu.pe';
                  const isActionLoading = actionLoadingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      
                      {/* Name & Email */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#457B9D] p-0.5 shrink-0">
                            <div className="w-full h-full bg-[#0B0C10] rounded-[10px] flex items-center justify-center font-bold text-white text-xs">
                              {u.first_name[0]}{u.last_name[0]}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-white flex items-center gap-1.5">
                              {u.first_name} {u.last_name}
                              {isMainSuperAdmin && (
                                <span title="Super Administrador Principal" className="text-amber-400">👑</span>
                              )}
                            </p>
                            <p className="text-[11px] font-mono text-[#8E92A4]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Career / Cycle */}
                      <td className="py-4 px-4 text-[#8E92A4]">
                        <p className="text-white font-medium">{u.profile?.career || 'Tecsup'}</p>
                        <p className="text-[10px]">{u.profile?.cycle ? `${u.profile.cycle}° Ciclo` : 'Alumno regular'}</p>
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
                          <span className="text-[11px] font-semibold text-[#5A5E73]">
                            Super Admin Principal
                          </span>
                        ) : isActionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white inline-block" />
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {u.role === 'STUDENT' ? (
                              <button
                                onClick={() => handleRoleChange(u, 'ORGANIZER')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E63946]/20 text-[#E63946] hover:bg-[#E63946] hover:text-white border border-[#E63946]/30 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Hacer Organizador
                              </button>
                            ) : u.role === 'ORGANIZER' ? (
                              <button
                                onClick={() => handleRoleChange(u, 'STUDENT')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-[#8E92A4] hover:bg-[#E63946]/20 hover:text-[#E63946] border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                Quitar Organizador
                              </button>
                            ) : null}
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
  );
}
