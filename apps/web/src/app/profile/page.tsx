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
  ArrowRight,
  VolumeX,
  AlertTriangle,
  Scale,
  X,
  Send,
  FileText,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Eye,
  Mail,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { fireCelebration } from '@/lib/confetti';
import { HolographicCard } from '@/components/HolographicCard';
import { sounds } from '@/lib/sound';

export const SYSTEM_AVATARS = [
  { id: 'fox', name: 'Tecsup Cyber Fox', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TecsupFox&backgroundColor=b6e3f4,c0aede,d1d4f9' },
  { id: 'ninja', name: 'Cyber Ninja', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ShadowNinja&backgroundColor=b6e3f4,ffd5dc' },
  { id: 'mecha', name: 'Mecha Titan', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MechaTitan&backgroundColor=ffd5dc,ffdfbf' },
  { id: 'pixel', name: 'Pixel Warrior', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=GamerPro' },
  { id: 'samurai', name: 'Cyber Samurai', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CyberSamurai&backgroundColor=c0aede,d1d4f9' },
  { id: 'valkyrie', name: 'Neon Valkyrie', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ValkyrieNeon' },
  { id: 'hacker', name: 'Glitch Hacker', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GlitchHacker' },
  { id: 'champion', name: 'Golden Champion', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=TecsupChampion' },
  { id: 'sorcerer', name: 'Arcane Mage', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ArcaneMage' },
  { id: 'eagle', name: 'Tecsup Eagle', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TecsupEagle' },
  { id: 'punk', name: 'Cyber Punk', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=CyberPunk' },
  { id: 'esports', name: 'Esports Pro', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TecsupEsports' },
];

interface ProfileData {
  nickname?: string | null;
  campus?: string | null;
  biography: string | null;
  career: string | null;
  cycle: number | null;
  avatar_url: string | null;
}

export function capitalizeWords(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface Medal {
  id: string;
  tournament_id: string;
  tournament_name: string;
  tournament_slug: string;
  game_code: string;
  campus_name: string;
  banner_url?: string;
  completed_at: string;
  place: string;
  rank: number;
  medal_type: 'GOLD' | 'SILVER' | 'BRONZE' | 'HONOR' | 'PARTICIPANT';
  title: string;
  emoji: string;
  badge_color: string;
}

export interface LegacySummary {
  tournaments_played: number;
  championships: number;
  silver_medals: number;
  bronze_medals: number;
  total_medals: number;
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
  team_name?: string | null;
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
    nickname: '',
    campus: 'Lima',
    biography: '',
    career: '',
    cycle: 1,
    avatar_url: null,
  });

  const [medals, setMedals] = useState<Medal[]>([]);
  const [legacySummary, setLegacySummary] = useState<LegacySummary>({
    tournaments_played: 0,
    championships: 0,
    silver_medals: 0,
    bronze_medals: 0,
    total_medals: 0,
  });

  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Academic role & conditions (Estudiante 1-6 ciclos, Docente, Egresado)
  const [academicRole, setAcademicRole] = useState<'ESTUDIANTE' | 'DOCENTE' | 'EGRESADO'>('ESTUDIANTE');

  // Avatar selector state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'SYSTEM' | 'CUSTOM'>('SYSTEM');
  const [selectedSystemAvatar, setSelectedSystemAvatar] = useState<string | null>(null);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // Gamer Banner Theme State (Steam-style Profile Backgrounds)
  type BannerTheme = 'cyberpunk' | 'carbon' | 'aurora' | 'gold' | 'obsidian' | 'retro' | 'matrix' | 'arena';
  const [bannerTheme, setBannerTheme] = useState<BannerTheme>('cyberpunk');
  const [showBannerModal, setShowBannerModal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('campus_arena_banner_theme') as BannerTheme;
    if (savedTheme) {
      setBannerTheme(savedTheme);
    }
  }, []);

  const handleSelectBannerTheme = (theme: BannerTheme) => {
    setBannerTheme(theme);
    localStorage.setItem('campus_arena_banner_theme', theme);
    sounds.playSuccess();
    fireCelebration();
    toast.success('¡Fondo de perfil actualizado correctamente!');
    setShowBannerModal(false);
  };

  // Sanctions and appeals state
  const [userSanctions, setUserSanctions] = useState<any[]>([]);
  const [userAppeals, setUserAppeals] = useState<any[]>([]);
  const [appealModalSanction, setAppealModalSanction] = useState<any | null>(null);
  const [appealText, setAppealText] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

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
        const rawCycle = res.data.profile.cycle;
        const careerStr = res.data.profile.career || '';
        
        // Infer institutional condition
        if (careerStr.toLowerCase().includes('docente') || careerStr.toLowerCase().includes('profesor') || rawCycle === -1) {
          setAcademicRole('DOCENTE');
        } else if (careerStr.toLowerCase().includes('egresado') || rawCycle === 0) {
          setAcademicRole('EGRESADO');
        } else {
          setAcademicRole('ESTUDIANTE');
        }

        setProfile({
          nickname: res.data.profile.nickname || '',
          campus: res.data.profile.campus || 'Lima',
          biography: res.data.profile.biography || '',
          career: careerStr || 'Diseño y Desarrollo de Software',
          cycle: rawCycle !== undefined && rawCycle !== null ? rawCycle : 1,
          avatar_url: res.data.profile.avatar_url || null,
        });
      }
      if (Array.isArray(res.data.medals)) {
        setMedals(res.data.medals);
      }
      if (res.data.legacy_summary) {
        setLegacySummary(res.data.legacy_summary);
      }
    }

    // Load registrations
    const regRes = await api.get('/registrations/me');
    if (regRes.success && Array.isArray(regRes.data)) {
      setRegistrations(regRes.data);
    }

    // Load sanctions and appeals
    const sancRes = await api.get<{ active_sanctions: any[]; appeals: any[] }>('/profile/me/sanctions');
    if (sancRes.success && sancRes.data) {
      setUserSanctions(sancRes.data.active_sanctions || []);
      setUserAppeals(sancRes.data.appeals || []);
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

    const cycleToSave = academicRole === 'ESTUDIANTE' ? Number(profile.cycle || 1) : 0;

    const res = await api.patch('/profile/me', {
      nickname: profile.nickname?.trim() || undefined,
      campus: profile.campus || 'Lima',
      biography: profile.biography,
      career: profile.career,
      cycle: cycleToSave,
      avatar_url: profile.avatar_url || undefined,
    });

    if (res.success) {
      sounds.playSuccess();
      fireCelebration();
      toast.success('¡Datos académicos y perfil actualizados correctamente!');
      setFeedback({ type: 'success', message: '¡Datos académicos y perfil actualizados correctamente!' });
      if (user && profile.avatar_url) {
        user.avatar_url = profile.avatar_url;
      }
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Error al guardar los cambios.' });
    }

    setIsSaving(false);
  };

  const handleSaveAvatar = async (avatarUrlToSave: string | null) => {
    setIsSavingAvatar(true);
    const res = await api.patch('/profile/me', {
      avatar_url: avatarUrlToSave || '',
    });

    if (res.success) {
      sounds.playSuccess();
      toast.success('¡Foto de perfil actualizada correctamente!');
      setProfile((prev) => ({ ...prev, avatar_url: avatarUrlToSave }));
      setShowAvatarModal(false);
      setFeedback({ type: 'success', message: '¡Foto de perfil actualizada correctamente!' });
      if (user) {
        user.avatar_url = avatarUrlToSave;
      }
    } else {
      alert(res.error?.message || 'Error al actualizar la foto de perfil.');
    }
    setIsSavingAvatar(false);
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealModalSanction || !appealText.trim()) return;

    setIsSubmittingAppeal(true);
    const res = await api.post('/profile/me/appeals', {
      sanction_id: appealModalSanction.id,
      appeal_text: appealText.trim(),
    });

    if (res.success) {
      setFeedback({ type: 'success', message: '¡Tu apelación fue enviada con éxito y será revisada por los administradores!' });
      setAppealModalSanction(null);
      setAppealText('');
      loadFullProfile();
    } else {
      alert(res.error?.message || 'Error al enviar la apelación.');
    }
    setIsSubmittingAppeal(false);
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
      <HolographicCard 
        className={`p-8 sm:p-10 relative overflow-hidden transition-all duration-500 ${
          bannerTheme === 'cyberpunk' ? 'banner-cyberpunk' :
          bannerTheme === 'carbon' ? 'banner-carbon' :
          bannerTheme === 'aurora' ? 'banner-aurora' :
          bannerTheme === 'gold' ? 'banner-gold' :
          bannerTheme === 'retro' ? 'banner-retro' :
          bannerTheme === 'matrix' ? 'banner-matrix' :
          bannerTheme === 'arena' ? 'banner-arena' :
          'banner-obsidian'
        }`} 
        glowColor={
          bannerTheme === 'gold' ? 'rgba(245, 158, 11, 0.35)' :
          bannerTheme === 'aurora' ? 'rgba(16, 185, 129, 0.3)' :
          bannerTheme === 'carbon' ? 'rgba(148, 163, 184, 0.25)' :
          bannerTheme === 'retro' ? 'rgba(168, 85, 247, 0.3)' :
          bannerTheme === 'matrix' ? 'rgba(16, 185, 129, 0.3)' :
          bannerTheme === 'arena' ? 'rgba(230, 57, 70, 0.35)' :
          bannerTheme === 'obsidian' ? 'rgba(59, 130, 246, 0.25)' :
          'rgba(230, 57, 70, 0.3)'
        }
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* AVATAR WITH CAMERA EDIT BADGE */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#E63946] via-[#1D3557] to-[#457B9D] p-1 shadow-xl shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.nickname || 'Avatar'}
                    className="w-full h-full object-cover rounded-[14px] bg-[var(--bg-arena)]"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--bg-arena)] rounded-[14px] flex items-center justify-center text-3xl font-black text-[var(--text-primary)]">
                    {(profile.nickname || user.first_name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedSystemAvatar(profile.avatar_url);
                  setCustomAvatarInput(profile.avatar_url?.startsWith('http') ? profile.avatar_url : '');
                  setShowAvatarModal(true);
                }}
                title="Cambiar foto de perfil"
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#E63946] hover:bg-[#ff4353] text-white shadow-lg border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {profile.nickname || capitalizeWords(user.first_name)}
                </h1>

                {/* Institutional Academic Badge */}
                {academicRole === 'DOCENTE' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    👨‍🏫 Docente Tecsup
                  </span>
                ) : academicRole === 'EGRESADO' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    🎓 Egresado Tecsup
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    📚 {profile.cycle || 1}° Ciclo (Tecsup)
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 uppercase">
                  Competidor
                </span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                {capitalizeWords(`${user.first_name} ${user.last_name}`)}
              </p>
              <p className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 pt-0.5">
                <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                <span>{user.email}</span>
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-secondary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Cuenta Institucional Verificada</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowBannerModal(true);
                }}
                className="btn-secondary px-3.5 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-[#E63946]/50 shrink-0"
                title="Personalizar fondo de perfil estilo Steam"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Fondo de Perfil</span>
              </button>

              <Link
                href={`/profile/${user.id}`}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-600 dark:text-emerald-300 hover:text-[var(--text-primary)] border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all group shrink-0"
                title="Ver cómo ven tu perfil los demás competidores"
              >
                <Eye className="w-4 h-4 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Vista Visitante</span>
              </Link>
            </div>

            <div className="bg-[var(--bg-arena)] px-4 py-2.5 rounded-xl border border-[var(--border-card)] text-left sm:text-right">
              <p className="text-[10px] text-[var(--text-muted)] leading-none">Representando a</p>
              <p className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-start sm:justify-end gap-1.5 mt-1">
                <span>Tecsup — Sede {profile.campus || 'Lima'}</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              </p>
            </div>
          </div>
        </div>
      </HolographicCard>

      {/* SANCTIONS & APPEALS ALERT BANNER */}
      {userSanctions.length > 0 && (
        <div className="space-y-3">
          {userSanctions.map((sanction) => {
            const pendingAppeal = userAppeals.find(a => a.sanction_id === sanction.id && a.status === 'PENDING');
            const rejectedAppeal = userAppeals.find(a => a.sanction_id === sanction.id && a.status === 'REJECTED');

            const isMute = sanction.type === 'MUTE';
            const isTempBan = sanction.type === 'BAN_TEMPORARY';
            const endStr = sanction.ends_at ? `hasta el ${new Date(sanction.ends_at).toLocaleDateString()}` : 'de forma permanente';

            return (
              <div 
                key={sanction.id}
                className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    {isMute ? <VolumeX className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {isMute ? 'Cuenta Silenciada en la Comunidad' : isTempBan ? 'Suspensión Competitiva Temporal' : 'Suspensión de Cuenta'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {endStr}
                      </span>
                    </div>
                    <p className="text-xs text-[#A8DADC]">
                      <strong className="text-white">Motivo:</strong> {sanction.reason}
                    </p>
                    {isMute && (
                      <p className="text-[11px] text-[#8E92A4]">
                        No puedes publicar posts ni comentar en el foro durante este periodo.
                      </p>
                    )}
                    {isTempBan && (
                      <p className="text-[11px] text-[#8E92A4]">
                        No puedes inscribirte a torneos oficiales durante este periodo.
                      </p>
                    )}
                    {rejectedAppeal && (
                      <p className="text-[11px] text-red-400 pt-1">
                        Tu apelación previa fue rechazada: "{rejectedAppeal.admin_response || 'Sanción confirmada'}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {pendingAppeal ? (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Apelación en Revisión
                    </span>
                  ) : (
                    <button
                      onClick={() => setAppealModalSanction(sanction)}
                      className="btn-primary py-2 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Enviar Apelación
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)]">Medallero de Honor & Insignias</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Reconocimientos oficiales ganados en torneos culminados de Campus Arena
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Medals Counter Badges */}
            <div className="flex items-center gap-2 text-xs bg-[var(--bg-arena)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] font-mono text-[var(--text-primary)]">
              <span title="Medallas de Oro">🥇 {legacySummary.championships}</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span title="Medallas de Plata">🥈 {legacySummary.silver_medals}</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span title="Medallas de Bronce">🥉 {legacySummary.bronze_medals}</span>
            </div>

            <Link
              href="/ranking"
              className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 text-amber-500 dark:text-amber-400 shrink-0"
            >
              <Trophy className="w-3.5 h-3.5" />
              Ranking
            </Link>
          </div>
        </div>

        {/* Dynamic Medals List or Clean Empty State */}
        {medals.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-[var(--bg-arena)] rounded-2xl border border-[var(--border-card)] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500/70 dark:text-amber-400/70 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🏅
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                Sin medallas oficiales aún
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Las medallas de <strong>Oro (1° Lugar)</strong>, <strong>Plata (2° Lugar)</strong> y <strong>Bronce (3° Lugar)</strong> se asignan automáticamente a tu perfil una vez que el torneo en el que participas culmina oficialmente (estado <span className="text-emerald-500 dark:text-emerald-400 font-bold">FINALIZADO</span>) según tu posición en las llaves del bracket.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/tournaments"
                className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-xs shadow-lg shadow-[#E63946]/20"
              >
                <Swords className="w-3.5 h-3.5" />
                Explorar Torneos Oficiales
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medals.map((medal) => (
              <Link
                key={medal.id}
                href={`/tournaments/${medal.tournament_slug}`}
                onMouseEnter={() => sounds.playClick()}
                className={`p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden flex flex-col justify-between shine-sheen ${
                  medal.medal_type === 'GOLD'
                    ? 'border-amber-400/60 hover:border-amber-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 bg-gradient-to-b from-amber-500/15 via-[var(--bg-card)] to-[var(--bg-arena)]'
                    : medal.medal_type === 'SILVER'
                    ? 'border-slate-300/60 hover:border-slate-200 shadow-lg shadow-slate-400/10 hover:shadow-slate-300/25 bg-gradient-to-b from-slate-400/15 via-[var(--bg-card)] to-[var(--bg-arena)]'
                    : medal.medal_type === 'BRONZE'
                    ? 'border-amber-700/60 hover:border-amber-600 shadow-lg shadow-amber-800/10 hover:shadow-amber-700/25 bg-gradient-to-b from-amber-700/15 via-[var(--bg-card)] to-[var(--bg-arena)]'
                    : medal.medal_type === 'HONOR'
                    ? 'border-blue-500/50 hover:border-blue-400 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 bg-gradient-to-b from-blue-500/15 via-[var(--bg-card)] to-[var(--bg-arena)]'
                    : 'border-emerald-500/40 hover:border-emerald-400 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 bg-gradient-to-b from-emerald-500/15 via-[var(--bg-card)] to-[var(--bg-arena)]'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors" />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform ${
                      medal.medal_type === 'GOLD' ? 'bg-gradient-to-tr from-amber-500/30 to-amber-200/20 border border-amber-400/50 shadow-amber-500/20' :
                      medal.medal_type === 'SILVER' ? 'bg-gradient-to-tr from-slate-400/30 to-slate-200/20 border border-slate-300/50 shadow-slate-400/20' :
                      medal.medal_type === 'BRONZE' ? 'bg-gradient-to-tr from-amber-800/30 to-amber-600/20 border border-amber-600/50 shadow-amber-800/20' :
                      'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                    }`}>
                      {medal.emoji}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      medal.medal_type === 'GOLD'
                        ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/40'
                        : medal.medal_type === 'SILVER'
                        ? 'bg-slate-300/20 text-slate-700 dark:text-slate-200 border-slate-300/40'
                        : medal.medal_type === 'BRONZE'
                        ? 'bg-amber-700/20 text-amber-600 dark:text-amber-400 border-amber-700/40'
                        : medal.medal_type === 'HONOR'
                        ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                    }`}>
                      {medal.place}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-black text-[var(--text-primary)] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {medal.tournament_name}
                    </p>
                    <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      {medal.title}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-card)] mt-4 flex items-center justify-between text-[10px] text-[var(--text-muted)] relative z-10">
                  <span className="font-bold text-[var(--text-secondary)]">{medal.game_code}</span>
                  <span className="inline-flex items-center gap-1 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                    Ver historial &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. MIS TORNEOS E INSCRIPCIONES */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/20 text-[#E63946] flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[var(--text-primary)]">Historial de Torneos y Participaciones</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30">
                  {registrations.length} {registrations.length === 1 ? 'Participación' : 'Participaciones'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Registro oficial de competencias, estados y rendimiento en Campus Arena</p>
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
          <div className="p-8 text-center bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-3">
            <p className="text-sm font-bold text-[var(--text-primary)]">Aún no estás inscrito en ningún torneo</p>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
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
            {registrations.map((reg) => {
              const earnedMedal = medals.find(
                (m) => m.tournament_id === reg.tournament_id || m.tournament_slug === reg.tournament_slug
              );

              return (
                <div
                  key={reg.id}
                  className="p-5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-4 hover:border-[#E63946]/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        {reg.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {earnedMedal && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                            earnedMedal.medal_type === 'GOLD'
                              ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/40'
                              : earnedMedal.medal_type === 'SILVER'
                              ? 'bg-slate-300/20 text-slate-700 dark:text-slate-200 border-slate-300/40'
                              : 'bg-amber-700/20 text-amber-600 dark:text-amber-400 border-amber-700/40'
                          }`}>
                            {earnedMedal.medal_type === 'GOLD' ? '🥇 1° Lugar' : earnedMedal.medal_type === 'SILVER' ? '🥈 2° Lugar' : '🥉 3° Lugar'}
                          </span>
                        )}
                        {getRegistrationBadge(reg.status)}
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-[var(--text-primary)] line-clamp-1">
                      {reg.tournament_name}
                    </h3>

                    <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                      <p>
                        Jugador: <span className="text-[var(--text-primary)] font-semibold">{reg.in_game_name}</span> ({reg.player_tag})
                      </p>
                      {reg.team_name && (
                        <p>
                          Escuadra: <span className="text-amber-500 dark:text-amber-400 font-semibold">{reg.team_name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
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
                      className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                    >
                      Ver Torneo &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. INFORMACIÓN ACADÉMICA & DEL COMPETIDOR */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#457B9D]/20 text-[#457B9D] flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Información Académica y de Competidor</h2>
            <p className="text-xs text-[var(--text-secondary)]">Datos validados para torneos interuniversitarios Tecsup</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Apodo / Gamertag */}
          <div className="space-y-2 bg-[var(--bg-arena)] p-4 rounded-xl border border-[var(--border-card)]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                🎮 Apodo / Gamertag (Nombre principal en la Arena)
              </label>
              <span className="text-[10px] text-[var(--text-muted)]">Visible en Comunidad, Torneos y Rankings</span>
            </div>
            <input
              type="text"
              value={profile.nickname || ''}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              placeholder="Ej. Viper, LuchoPro, Ghost..."
              maxLength={30}
              className="input-arena border-amber-500/30 focus:border-amber-400 focus:ring-amber-400/20 text-[var(--text-primary)] font-bold bg-[var(--bg-card)]"
            />
            <p className="text-[11px] text-[var(--text-secondary)]">
              Este será el nombre principal grande con el que te identificarán todos en la plataforma. Tu nombre real aparecerá debajo en letra más pequeña.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Nombres
              </label>
              <input
                type="text"
                disabled
                value={capitalizeWords(user.first_name)}
                className="input-arena opacity-70 cursor-not-allowed bg-[var(--bg-arena)] font-medium text-[var(--text-primary)] border-[var(--border-card)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Apellidos
              </label>
              <input
                type="text"
                disabled
                value={capitalizeWords(user.last_name)}
                className="input-arena opacity-70 cursor-not-allowed bg-[var(--bg-arena)] font-medium text-[var(--text-primary)] border-[var(--border-card)]"
              />
            </div>
          </div>

          {/* Sede Institucional Tecsup (Lima, Arequipa, Trujillo) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                📍 Sede Institucional Tecsup
              </label>
              <span className="text-[10px] text-[var(--text-muted)]">Representarás a esta sede en torneos y rankings</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'Lima', name: 'Sede Lima', desc: 'Campus Principal Santa Anita', flag: '🏛️' },
                { id: 'Arequipa', name: 'Sede Arequipa', desc: 'Campus Hunter / J.L. Bustamante', flag: '🌋' },
                { id: 'Trujillo', name: 'Sede Trujillo', desc: 'Campus Víctor Larco Herrera', flag: '🌊' },
              ].map((c) => {
                const isSelected = (profile.campus || 'Lima') === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, campus: c.id })}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#E63946]/10 text-[var(--text-primary)] border-[#E63946] shadow-sm'
                        : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xl shrink-0">{c.flag}</span>
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#E63946]' : 'text-[var(--text-primary)]'}`}>
                        {c.name}
                      </p>
                      <p className="text-[10px] font-normal text-[var(--text-secondary)] leading-tight">
                        {c.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Institutional Academic Condition in Tecsup */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Condición Institucional en Tecsup
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAcademicRole('ESTUDIANTE');
                  if (!profile.cycle || profile.cycle < 1 || profile.cycle > 6) {
                    setProfile({ ...profile, cycle: 1 });
                  }
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                  academicRole === 'ESTUDIANTE'
                    ? 'bg-[#E63946]/10 text-[var(--text-primary)] border-[#E63946] shadow-sm'
                    : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[var(--text-primary)]'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <div>
                  <p className="text-[var(--text-primary)]">Estudiante Regular</p>
                  <p className="text-[10px] font-normal text-[var(--text-secondary)]">Ciclos 1° al 6°</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAcademicRole('DOCENTE');
                  setProfile({ ...profile, cycle: 0 });
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                  academicRole === 'DOCENTE'
                    ? 'bg-indigo-500/10 text-[var(--text-primary)] border-indigo-500 shadow-sm'
                    : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[var(--text-primary)]'
                }`}
              >
                <span className="text-base">👨‍🏫</span>
                <div>
                  <p className="text-[var(--text-primary)]">Docente / Profesor</p>
                  <p className="text-[10px] font-normal text-[var(--text-secondary)]">Plana Docente Tecsup</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAcademicRole('EGRESADO');
                  setProfile({ ...profile, cycle: 0 });
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                  academicRole === 'EGRESADO'
                    ? 'bg-amber-500/10 text-[var(--text-primary)] border-amber-500 shadow-sm'
                    : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[var(--text-primary)]'
                }`}
              >
                <span className="text-base">🎓</span>
                <div>
                  <p className="text-[var(--text-primary)]">Egresado / Graduado</p>
                  <p className="text-[10px] font-normal text-[var(--text-secondary)]">Comunidad de Alumni</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className={academicRole === 'ESTUDIANTE' ? 'sm:col-span-2 space-y-1.5' : 'sm:col-span-3 space-y-1.5'}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {academicRole === 'DOCENTE' 
                  ? 'Área o Especialidad Docente' 
                  : academicRole === 'EGRESADO' 
                  ? 'Carrera de Egreso' 
                  : 'Carrera Profesional en Tecsup'}
              </label>
              <input
                type="text"
                value={profile.career || ''}
                onChange={(e) => setProfile({ ...profile, career: e.target.value })}
                placeholder={
                  academicRole === 'DOCENTE' 
                    ? 'Ej. Tecnología Digital / Software' 
                    : 'Ej. Diseño y Desarrollo de Software'
                }
                className="input-arena"
                required
              />
            </div>

            {academicRole === 'ESTUDIANTE' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Ciclo Académico Actual
                </label>
                <select
                  value={profile.cycle || 1}
                  onChange={(e) => setProfile({ ...profile, cycle: Number(e.target.value) })}
                  className="input-arena bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-card)]"
                >
                  {[1, 2, 3, 4, 5, 6].map((c) => (
                    <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                      {c}° Ciclo
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
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

      {/* STUDENT APPEAL SUBMISSION MODAL */}
      {appealModalSanction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="arena-card p-6 sm:p-8 max-w-lg w-full space-y-5 border-amber-500/30">
            
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Solicitud de Apelación Disciplinaria</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Envía tu descargo para que el equipo administrativo revise tu sanción
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAppealModalSanction(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[var(--bg-arena)] p-3.5 rounded-xl border border-[var(--border-card)] text-xs space-y-1.5">
              <p className="text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">Tipo de sanción:</strong> {appealModalSanction.type}
              </p>
              <p className="text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">Motivo aplicado:</strong> {appealModalSanction.reason}
              </p>
              {appealModalSanction.ends_at && (
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Fecha de expiración:</strong> {new Date(appealModalSanction.ends_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmitAppeal} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-[var(--text-primary)]">Tu descargo y explicación de los hechos:</label>
                <textarea
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  placeholder="Explica con respeto y detalle por qué consideras que la sanción debe ser revocada o reducida (mínimo 10 caracteres)..."
                  rows={4}
                  required
                  minLength={10}
                  className="w-full bg-[var(--bg-arena)] border border-[var(--border-card)] rounded-xl p-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-400 text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-card)]">
                <button
                  type="button"
                  onClick={() => setAppealModalSanction(null)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAppeal || appealText.trim().length < 10}
                  className="btn-primary px-5 py-2 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-50"
                >
                  {isSubmittingAppeal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Enviar Apelación al Tribunal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* AVATAR SELECTOR MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="arena-card p-6 sm:p-8 max-w-xl w-full space-y-6 border border-[var(--border-card)] shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Elegir Foto de Perfil</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Selecciona un avatar oficial del sistema o ingresa un enlace web personalizado
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[var(--bg-arena)] p-1 rounded-xl border border-[var(--border-card)]">
              <button
                type="button"
                onClick={() => setAvatarTab('SYSTEM')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  avatarTab === 'SYSTEM'
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Avatares del Sistema
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('CUSTOM')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  avatarTab === 'CUSTOM'
                    ? 'bg-[#E63946] text-white shadow-sm shadow-[#E63946]/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                URL Personalizada
              </button>
            </div>

            {/* TAB CONTENT: SYSTEM AVATARS */}
            {avatarTab === 'SYSTEM' ? (
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-secondary)]">
                  Elige entre avatares temáticos de gaming y esports inspirados en Tecsup:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto p-1">
                  {SYSTEM_AVATARS.map((av) => {
                    const isSelected = selectedSystemAvatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedSystemAvatar(av.url)}
                        className={`p-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#E63946]/20 border-[#E63946] shadow-lg shadow-[#E63946]/30 scale-105'
                            : 'bg-[var(--bg-arena)] border-[var(--border-card)] hover:border-[#E63946]/50 hover:scale-102'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-card)] flex items-center justify-center">
                          <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-semibold text-[var(--text-primary)] text-center truncate max-w-[85px]">
                          {av.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAB CONTENT: CUSTOM URL */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                    URL Directa de la Imagen
                  </label>
                  <input
                    type="url"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    placeholder="https://ejemplo.com/tu-foto.png"
                    className="input-arena w-full text-xs"
                  />
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Puedes pegar un enlace directo de Discord, Gravatar, Imgur, GitHub o cualquier imagen web.
                  </p>
                </div>

                {/* Live Preview */}
                {customAvatarInput.trim() && (
                  <div className="flex items-center gap-3 p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-card)] shrink-0 border border-[var(--border-card)] flex items-center justify-center">
                      <img
                        src={customAvatarInput.trim()}
                        alt="Vista previa"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Vista previa del avatar</p>
                      <p className="text-[11px] text-[var(--text-secondary)]">Se adaptará automáticamente a tu perfil.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-card)]">
              {profile.avatar_url ? (
                <button
                  type="button"
                  disabled={isSavingAvatar}
                  onClick={() => handleSaveAvatar(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Quitar Foto Actual
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="btn-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSavingAvatar || (avatarTab === 'SYSTEM' && !selectedSystemAvatar) || (avatarTab === 'CUSTOM' && !customAvatarInput.trim())}
                  onClick={() => {
                    const finalUrl = avatarTab === 'SYSTEM' ? selectedSystemAvatar : customAvatarInput.trim();
                    if (finalUrl) handleSaveAvatar(finalUrl);
                  }}
                  className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar Foto
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEAM-STYLE PROFILE BACKGROUND SELECTOR MODAL */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl arena-card p-5 sm:p-7 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E63946]/15 text-[#E63946] flex items-center justify-center border border-[#E63946]/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">Fondo de Perfil (Estilo Steam)</h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">Elige la estética y textura que decorará tu carnet en la Arena</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-arena)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Mini Preview Box */}
            <div className="shrink-0 p-3.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-arena)]/60 relative overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                <span>Vista Previa en Vivo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </p>
              <div className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                bannerTheme === 'cyberpunk' ? 'banner-cyberpunk border-[#E63946]/40' :
                bannerTheme === 'carbon' ? 'banner-carbon border-slate-500/40' :
                bannerTheme === 'aurora' ? 'banner-aurora border-emerald-500/40' :
                bannerTheme === 'gold' ? 'banner-gold border-amber-500/40' :
                bannerTheme === 'retro' ? 'banner-retro border-purple-500/40' :
                bannerTheme === 'matrix' ? 'banner-matrix border-emerald-500/40' :
                bannerTheme === 'arena' ? 'banner-arena border-[#E63946]/40' :
                'banner-obsidian border-blue-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#1D3557] p-0.5 overflow-hidden shrink-0 shadow">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-[10px]" />
                    ) : (
                      <div className="w-full h-full bg-[var(--bg-card)] rounded-[10px] flex items-center justify-center text-sm font-black text-white">
                        {(profile.nickname || user?.first_name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] truncate">
                      {profile.nickname || capitalizeWords(user?.first_name || 'Competidor')}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Tecsup Competidor • Sede {profile.campus || 'Lima'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Themes Grid */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                Selecciona un fondo gamer para aplicar de inmediato:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Rejilla carmesí & cian synthwave oficial', tag: 'Neon', bgClass: 'banner-cyberpunk border-[#E63946]/40' },
                  { id: 'carbon', name: 'Midnight Carbon', desc: 'Malla stealth de fibra de carbono oscura', tag: 'Stealth', bgClass: 'banner-carbon border-slate-500/40' },
                  { id: 'aurora', name: 'Aurora Cósmica', desc: 'Nebulosa esmeralda y violeta etérea', tag: 'Cosmic', bgClass: 'banner-aurora border-emerald-500/40' },
                  { id: 'gold', name: '24K Championship', desc: 'Reflejos dorados de gran campeón', tag: 'Gold', bgClass: 'banner-gold border-amber-500/40' },
                  { id: 'obsidian', name: 'Titanio Obsidiana', desc: 'Acabado minimalista de cristal templado', tag: 'Titanium', bgClass: 'banner-obsidian border-[var(--border-card)]' },
                  { id: 'retro', name: 'Retro Synthwave 80s', desc: 'Atardecer neón y rejilla arcade retro', tag: 'Arcade', bgClass: 'banner-retro border-purple-500/40' },
                  { id: 'matrix', name: 'Cyber Matrix', desc: 'Terminal hacker táctica verde fósforo', tag: 'Matrix', bgClass: 'banner-matrix border-emerald-500/40' },
                  { id: 'arena', name: 'Tecsup Arena Oficial', desc: 'Rojo carmesí y azul marino institucional', tag: 'Oficial', bgClass: 'banner-arena border-[#E63946]/50' },
                ].map((theme) => {
                  const isSelected = bannerTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectBannerTheme(theme.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group hover:scale-[1.01] ${theme.bgClass} ${
                        isSelected
                          ? 'ring-2 ring-[#E63946] border-[#E63946] shadow-lg shadow-[#E63946]/20 bg-[var(--bg-card)]/90'
                          : 'bg-[var(--bg-card)]/50 hover:border-[#E63946]/50 hover:bg-[var(--bg-card)]/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-[var(--text-primary)]">{theme.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-[var(--text-secondary)]">
                            {theme.tag}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#E63946]" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-snug line-clamp-1">{theme.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[var(--text-muted)]">
                Se guarda automáticamente en tu navegador
              </span>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="btn-secondary py-2 px-5 text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
