'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  User, 
  Trophy, 
  GraduationCap, 
  ShieldCheck,
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Swords, 
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ProfileData {
  biography: string | null;
  career: string | null;
  cycle: number | null;
  avatar_url: string | null;
}

interface UserRegistration {
  id: string;
  tournament_id: string;
  tournament_name: string;
  tournament_slug: string;
  game_code: string;
  banner_url: string;
  tournament_start_at: string;
  prize_pool: string;
  player_tag: string;
  in_game_name: string;
  status: 'PENDING_PAYMENT' | 'PAYMENT_UNDER_REVIEW' | 'CORRECTION_REQUIRED' | 'CONFIRMED' | 'WAITLISTED' | 'REJECTED' | 'CANCELLED';
  payment: {
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    operation_reference?: string;
  } | null;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData>({
    biography: '',
    career: '',
    cycle: 1,
    avatar_url: null,
  });

  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load profile data and registrations
  const loadFullProfile = async () => {
    const res = await api.get('/profile/me');
    if (res.success && res.data) {
      if (res.data.profile) {
        setProfile({
          biography: res.data.profile.biography || '',
          career: res.data.profile.career || 'Diseño y Desarrollo de Software',
          cycle: res.data.profile.cycle || 4,
          avatar_url: res.data.profile.avatar_url,
        });
      }
    }

    // Load registrations
    const regRes = await api.get('/registrations/me');
    if (regRes.success && Array.isArray(regRes.data)) {
      setRegistrations(regRes.data);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFullProfile();
    }
  }, [isAuthenticated]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    const res = await api.patch('/profile/me', {
      biography: profile.biography,
      career: profile.career,
      cycle: Number(profile.cycle),
    });

    if (res.success) {
      setFeedback({ type: 'success', message: '¡Perfil académico actualizado correctamente!' });
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Error al guardar los cambios.' });
    }

    setIsSaving(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
        <p className="text-xs text-[#8E92A4]">Cargando tu perfil de competidor...</p>
      </div>
    );
  }

  const getRegistrationBadge = (status: UserRegistration['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Cupo Confirmado
          </span>
        );
      case 'PAYMENT_UNDER_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pago en Revisión
          </span>
        );
      case 'WAITLISTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#457B9D]/20 text-[#A8DADC] border border-[#457B9D]/30">
            Lista de Espera
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[#8E92A4]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. HEADER HERO */}
      <div className="relative arena-card p-8 sm:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#E63946] via-[#1D3557] to-[#457B9D] p-1 shadow-xl">
              <div className="w-full h-full bg-[#0B0C10] rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                {user.first_name[0]}{user.last_name[0]}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 uppercase">
                  Competidor
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8E92A4]">{user.email}</p>
              <div className="flex items-center gap-2 pt-1 text-xs text-[#A8DADC]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cuenta Verificada en Supabase Cloud</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0C10] px-5 py-3 rounded-xl border border-white/10 text-right">
            <p className="text-xs text-[#8E92A4]">Representando a</p>
            <p className="text-sm font-bold text-white">Tecsup — Sede Lima</p>
          </div>
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

      {/* 2. MEDALLERO DE HONOR & LEGADO */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Medallero de Honor & Insignias</h2>
              <p className="text-xs text-[#8E92A4]">Reconocimientos oficiales ganados en torneos universitarios</p>
            </div>
          </div>

          <Link
            href="/ranking"
            className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 text-amber-400"
          >
            <Trophy className="w-3.5 h-3.5" />
            Ver Ranking General
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Badge 1: Oro */}
          <div className="p-4 rounded-xl bg-[#0B0C10] border border-amber-500/30 text-center space-y-2 relative group hover:border-amber-500/60 transition-all">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-amber-500/20">
              🥇
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-white">Campeón Tecsup</p>
              <p className="text-[10px] text-amber-400 font-semibold">1er Lugar Copa 2026</p>
            </div>
          </div>

          {/* Badge 2: Invicto */}
          <div className="p-4 rounded-xl bg-[#0B0C10] border border-[#E63946]/30 text-center space-y-2 relative group hover:border-[#E63946]/60 transition-all">
            <div className="w-12 h-12 rounded-full bg-[#E63946]/20 text-[#E63946] flex items-center justify-center mx-auto text-2xl shadow-lg shadow-[#E63946]/20">
              🔥
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-white">Racha Imparable</p>
              <p className="text-[10px] text-[#E63946] font-semibold">5 Victorias Seguidas</p>
            </div>
          </div>

          {/* Badge 3: Maestro de Mazos */}
          <div className="p-4 rounded-xl bg-[#0B0C10] border border-[#457B9D]/30 text-center space-y-2 relative group hover:border-[#457B9D]/60 transition-all">
            <div className="w-12 h-12 rounded-full bg-[#457B9D]/20 text-[#A8DADC] flex items-center justify-center mx-auto text-2xl shadow-lg shadow-[#457B9D]/20">
              ⚔️
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-white">Estratega Royale</p>
              <p className="text-[10px] text-[#A8DADC] font-semibold">+7,000 Copas</p>
            </div>
          </div>

          {/* Badge 4: Veterano */}
          <div className="p-4 rounded-xl bg-[#0B0C10] border border-emerald-500/30 text-center space-y-2 relative group hover:border-emerald-500/60 transition-all">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/20">
              🛡️
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-white">Competidor Oficial</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Perfil Tecsup Verificado</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MIS TORNEOS E INSCRIPCIONES */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/20 text-[#E63946] flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Mis Torneos e Inscripciones</h2>
              <p className="text-xs text-[#8E92A4]">Tus competencias activas y estado de validación de pagos</p>
            </div>
          </div>

          <Link
            href="/tournaments"
            className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            Explorar Torneos
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="p-8 text-center bg-[#0B0C10] rounded-xl border border-white/5 space-y-3">
            <p className="text-sm font-bold text-white">Aún no estás inscrito en ningún torneo</p>
            <p className="text-xs text-[#8E92A4] max-w-sm mx-auto">
              Explora el catálogo de torneos de Tecsup, inscribe tu cuenta de juego y asegura tu lugar en el bracket oficial.
            </p>
            <Link
              href="/tournaments"
              className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              Ver Torneos Disponibles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="p-5 bg-[#0B0C10] rounded-xl border border-white/10 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#A8DADC] uppercase tracking-wider">
                      {reg.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars'}
                    </span>
                    {getRegistrationBadge(reg.status)}
                  </div>

                  <h3 className="text-base font-extrabold text-white line-clamp-1">
                    {reg.tournament_name}
                  </h3>

                  <p className="text-xs text-[#8E92A4]">
                    Jugador: <span className="text-white font-semibold">{reg.in_game_name}</span> ({reg.player_tag})
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#8E92A4]">
                    <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
                    <span>
                      {new Date(reg.tournament_start_at).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/tournaments/${reg.tournament_slug}`}
                    className="text-xs font-bold text-[#A8DADC] hover:text-white flex items-center gap-1"
                  >
                    Ver Torneo &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. INFORMACIÓN ACADÉMICA & DEL COMPETIDOR */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#457B9D]/20 text-[#457B9D] flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Información Académica y de Competidor</h2>
            <p className="text-xs text-[#8E92A4]">Datos validados para torneos interuniversitarios Tecsup</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                Nombres
              </label>
              <input
                type="text"
                disabled
                value={user.first_name}
                className="input-arena opacity-60 cursor-not-allowed bg-black/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                Apellidos
              </label>
              <input
                type="text"
                disabled
                value={user.last_name}
                className="input-arena opacity-60 cursor-not-allowed bg-black/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                Carrera Profesional
              </label>
              <input
                type="text"
                value={profile.career || ''}
                onChange={(e) => setProfile({ ...profile, career: e.target.value })}
                placeholder="Ej. Diseño y Desarrollo de Software"
                className="input-arena"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
                Ciclo Actual
              </label>
              <select
                value={profile.cycle || 1}
                onChange={(e) => setProfile({ ...profile, cycle: Number(e.target.value) })}
                className="input-arena bg-[#15161E]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                  <option key={c} value={c}>
                    {c}° Ciclo
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E92A4]">
              Biografía del Competidor
            </label>
            <textarea
              value={profile.biography || ''}
              onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
              rows={4}
              placeholder="Escribe sobre tu estilo de juego, roles favoritos o trayectoria competitiva en la arena..."
              className="input-arena resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary py-2.5 px-8 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando cambios...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Actualizar Datos Académicos
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
