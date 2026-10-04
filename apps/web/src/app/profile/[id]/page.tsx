'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Trophy, 
  ShieldCheck, 
  Swords, 
  Loader2, 
  ArrowLeft,
  Edit3,
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  Mail,
  Building2,
  Calendar,
  Share2,
  Volume2,
  Gamepad2,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadSignatureMedia } from '@/lib/storage';
import { fireCelebration } from '@/lib/confetti';
import { sounds } from '@/lib/sound';
import { HolographicCard } from '@/components/HolographicCard';
import { Medal, LegacySummary, capitalizeWords, BANNER_THEMES, BannerTheme } from '../page';
import { GAME_CATALOG, type GameCode } from '@/lib/games';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { AvatarWithFrame } from '@/components/AvatarWithFrame';
import { HonorPinboard } from '@/components/HonorPinboard';
import { 
  getProfileCustomization, 
  DEFAULT_CUSTOMIZATION, 
  CARD_MATERIALS, 
  PROFILE_WALLPAPERS,
  NAME_FONT_LIST,
  playCustomSoundbite,
  type ProfileCustomizationState 
} from '@/lib/profile-customization';
import { CompetitorName } from '@/components/CompetitorName';

export interface ProfileSignature {
  id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    nickname?: string | null;
    email: string;
    avatar_url?: string | null;
    campus: string;
  };
}

interface PublicCompetitor {
  id: string;
  email?: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  profile: {
    nickname?: string | null;
    campus?: string | null;
    biography: string | null;
    career: string | null;
    cycle: number | null;
    avatar_url: string | null;
  };
  active_tournaments?: Array<{
    id: string;
    name: string;
    slug: string;
    game_code: string;
    banner_url?: string;
    tournament_start_at: string;
    prize_pool?: string;
    status: string;
    team_name?: string | null;
    registration_status: string;
  }>;
  medals: Medal[];
  legacy_summary: LegacySummary;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params?.id as string;

  const [competitor, setCompetitor] = useState<PublicCompetitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs on public profile: 'TOURNAMENTS' | 'MEDALS' | 'WALL'
  const [activeTab, setActiveTab] = useState<'TOURNAMENTS' | 'MEDALS' | 'WALL'>('TOURNAMENTS');

  // Signatures / Wall State
  const [signatures, setSignatures] = useState<ProfileSignature[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState(false);
  const [sigContent, setSigContent] = useState('');
  const [sigImage, setSigImage] = useState<string | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [sigUrlInput, setSigUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [isSubmittingSig, setIsSubmittingSig] = useState(false);
  const [sigFeedback, setSigFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [bannerTheme, setBannerTheme] = useState<BannerTheme>('cyberpunk');
  const [customization, setCustomization] = useState<ProfileCustomizationState>(DEFAULT_CUSTOMIZATION);

  useEffect(() => {
    const saved = localStorage.getItem('campus_arena_banner_theme') as BannerTheme;
    if (saved && BANNER_THEMES.some(t => t.id === saved)) setBannerTheme(saved);

    const custom = getProfileCustomization(userId);
    setCustomization(custom);

    if (custom.soundbite && custom.soundbite !== 'none') {
      const timer = setTimeout(() => {
        if (custom.soundbite === 'tactical_chime') sounds.playTacticalChime();
        else if (custom.soundbite === 'synthesizer_blip') sounds.playSynthesizerBlip();
        else if (custom.soundbite === 'laser_charge') sounds.playLaserCharge();
        else if (custom.soundbite === 'victory_bell') sounds.playVictoryBell();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  const fetchSignatures = async () => {
    try {
      setLoadingSignatures(true);
      const res = await api.get(`/profile/${userId}/signatures`);
      if (res.success && Array.isArray(res.data)) {
        setSignatures(res.data);
      }
    } catch (err) {
      console.error('Error fetching signatures:', err);
    } finally {
      setLoadingSignatures(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchPublicProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/profile/${userId}`);
        if (res.success && res.data) {
          setCompetitor(res.data);
        } else {
          setError(res.error?.message || 'No se pudo cargar el carnet del competidor.');
        }
      } catch (err: any) {
        setError(err.message || 'Error de conexión.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
    fetchSignatures();
  }, [userId]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('El archivo o GIF no debe superar los 8MB.');
      return;
    }
    setSigFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSigImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigContent.trim() && !sigImage) return;
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setIsSubmittingSig(true);
    setSigFeedback(null);
    try {
      let finalImageUrl = sigImage;
      if (sigFile && currentUser?.id) {
        try {
          const uploadRes = await uploadSignatureMedia(sigFile, currentUser.id);
          if (uploadRes.url) {
            finalImageUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn('Fallback a imagen local de firma:', uploadErr);
        }
      }

      const res = await api.post(`/profile/${userId}/signatures`, {
        content: sigContent.trim() || '✍️ Dejó una firma en tu carnet de honor',
        image_url: finalImageUrl || undefined,
      });

      if (res.success) {
        fireCelebration();
        sounds.playSuccess();
        toast.success('¡Firma agregada exitosamente al muro!');
        if (res.data && res.data.author) {
          setSignatures((prev) => [res.data, ...prev]);
        } else {
          fetchSignatures();
        }
        setSigContent('');
        setSigImage(null);
        setSigFile(null);
        setSigUrlInput('');
        setShowUrlField(false);
        setSigFeedback({ type: 'success', message: '¡Firma publicada con éxito!' });
        setTimeout(() => setSigFeedback(null), 4000);
      } else {
        const errMsg = res.error?.message || 'No se pudo publicar la firma.';
        toast.error(errMsg);
        setSigFeedback({ type: 'error', message: errMsg });
      }
    } catch (err: any) {
      const errMsg = err.message || 'Error de conexión.';
      toast.error(errMsg);
      setSigFeedback({ type: 'error', message: errMsg });
    } finally {
      setIsSubmittingSig(false);
    }
  };

  const handleDeleteSignature = async (sigId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta firma del muro?')) return;
    try {
      const res = await api.delete(`/profile/signatures/${sigId}`);
      if (res.success) {
        toast.success('Firma eliminada del muro');
        setSignatures((prev) => prev.filter((s) => s.id !== sigId));
      } else {
        toast.error(res.error?.message || 'No se pudo eliminar la firma.');
      }
    } catch (err) {
      console.error('Error deleting signature:', err);
      toast.error('Error al intentar eliminar la firma.');
    }
  };

  const handleShareProfile = async () => {
    sounds.playClick();
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('¡Enlace del perfil copiado al portapapeles!');
    } catch {
      toast.info(`Comparte este enlace: ${url}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
        <p className="text-xs text-[#8E92A4]">Cargando carnet de competidor...</p>
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-white">Competidor No Encontrado</h2>
        <p className="text-xs text-[#8E92A4] max-w-sm mx-auto">
          {error || 'El perfil solicitado no existe o no se encuentra disponible.'}
        </p>
        <button
          onClick={() => router.back()}
          className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === competitor.id;
  const medals = competitor.medals || [];
  const summary = competitor.legacy_summary || {
    tournaments_played: 0,
    championships: 0,
    silver_medals: 0,
    bronze_medals: 0,
    total_medals: 0,
  };

  const activeThemeConfig = BANNER_THEMES.find(t => t.id === bannerTheme) || BANNER_THEMES[0];
  const activeWallpaperConfig = PROFILE_WALLPAPERS.find(w => w.id === customization.wallpaper) || PROFILE_WALLPAPERS[0];
  const activeMaterialConfig = CARD_MATERIALS.find(m => m.id === customization.material) || CARD_MATERIALS[0];
  const activeTypographyConfig = NAME_FONT_LIST.find(t => t.id === customization.nameTypography) || NAME_FONT_LIST[0];

  const testSoundbite = (s: string) => {
    if (s === 'tactical_chime') sounds.playTacticalChime();
    else if (s === 'synthesizer_blip') sounds.playSynthesizerBlip();
    else if (s === 'laser_charge') sounds.playLaserCharge();
    else if (s === 'victory_bell') sounds.playVictoryBell();
  };

  return (
    <div 
      className="min-h-screen transition-all duration-700 -mt-6 pt-6 pb-12 relative overflow-hidden"
      style={activeWallpaperConfig.cssStyle}
    >
      {/* Video Background Layer if wallpaper has videoUrl (Steam Animated Profile) */}
      {activeWallpaperConfig.videoUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <video
            src={activeWallpaperConfig.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13]/50 via-transparent to-[#0B0D13]/30" />
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* VISTA DE VISITANTE BAR (Si el usuario está viendo su propio perfil en modo público) */}
      {isOwnProfile && (
        <div className="bg-[#111520] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white flex items-center gap-2">
                <span>Modo Vista de Visitante Activo</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Público
                </span>
              </p>
              <p className="text-[11px] text-[#8E92A4]">
                Estás visualizando tu carnet exactamente como lo ven los demás estudiantes y organizadores en la Arena.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="btn-primary px-4 py-2 text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-[#E63946]/20"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Mi Carnet</span>
          </Link>
        </div>
      )}

      {/* TOP TOOLBAR */}
      <div className="flex items-center justify-between gap-4 pb-1">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-[#8E92A4] hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo</span>
        </button>

        <button
          type="button"
          onClick={handleShareProfile}
          className="btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#8E92A4] hover:text-white"
          title="Copiar enlace de este perfil"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir Perfil</span>
        </button>
      </div>

      {/* 1. THE COMPETITOR PASSPORT / IDENTITY CARD */}
      <HolographicCard 
        material={customization.material}
        className={`p-6 sm:p-9 relative overflow-hidden transition-all duration-500 rounded-3xl border border-white/10 ${customization.material === 'steam_neon_shrine' ? '' : activeThemeConfig.bgClass}`} 
        glowColor={activeThemeConfig.glowColor}
      >
        <div className="absolute -right-8 -bottom-10 w-64 h-64 opacity-5 pointer-events-none select-none">
          <img src="/brand/tecsup_emblem.png" alt="" className="w-full h-full object-contain filter grayscale" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center gap-5">
              {/* Avatar with Animated Frame */}
              <div className="relative shrink-0">
                <AvatarWithFrame
                  avatarUrl={competitor.profile?.avatar_url || ''}
                  frame={customization.avatarFrame}
                  size="xl"
                  alt={competitor.profile?.nickname || 'Avatar'}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <CompetitorName
                    userId={competitor.id}
                    name={competitor.profile?.nickname || capitalizeWords(competitor.first_name)}
                    customization={customization}
                    className="text-2xl sm:text-3xl tracking-tight"
                  />

                  {/* Academic Condition Pill */}
                  {competitor.profile?.career?.toLowerCase().includes('docente') || competitor.profile?.cycle === -1 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      👨‍🏫 Docente Tecsup
                    </span>
                  ) : competitor.profile?.career?.toLowerCase().includes('egresado') || competitor.profile?.cycle === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      🎓 Egresado Tecsup
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      📚 {competitor.profile?.cycle || 1}° Ciclo
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 uppercase font-mono">
                    {competitor.role === 'ADMIN' ? 'Administrador' : competitor.role === 'ORGANIZER' ? 'Organizador' : 'Competidor'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-[#8E92A4] flex items-center gap-2 flex-wrap">
                  <span className="text-white">{capitalizeWords(`${competitor.first_name} ${competitor.last_name}`)}</span>
                  <span>•</span>
                  <span>{competitor.profile?.career || 'Tecsup Profesional'}</span>
                </p>

                <div className="flex items-center gap-3 pt-1 text-[11px] text-[#A8DADC] flex-wrap">
                  <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-md border border-white/5">
                    <Building2 className="w-3 h-3 text-[#E63946]" />
                    Tecsup — Sede {competitor.profile?.campus || 'Lima'}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Cuenta Verificada
                  </span>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
              <div className="flex items-center gap-2">
                {customization.soundbite && customization.soundbite !== 'none' && (
                  <button
                    type="button"
                    onClick={() => playCustomSoundbite(customization.soundbite)}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-cyan-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                    title="Reproducir audio de perfil"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="text-[11px] font-mono">Audio de Perfil</span>
                  </button>
                )}
              </div>

              {isOwnProfile && (
                <Link
                  href="/profile"
                  className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#E63946]/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </Link>
              )}
            </div>

          </div>

          {/* Dedicated Favorite Games Section */}
          {customization.favoriteGames && customization.favoriteGames.length > 0 && (
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-[#E63946]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#8E92A4]">
                  Juegos Favoritos:
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {customization.favoriteGames.map((gCode) => {
                  const g = GAME_CATALOG[gCode];
                  if (!g) return null;
                  return (
                    <span
                      key={gCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/15 bg-black/40 shadow-sm"
                      style={{ borderColor: `${g.color}55` }}
                    >
                      {g.logoUrl ? (
                        <img src={g.logoUrl} alt="" className="w-3.5 h-3.5 object-contain shrink-0 filter drop-shadow" />
                      ) : (
                        <Gamepad2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      )}
                      <span>{g.name}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bio Quote */}
          {competitor.profile?.biography && (
            <div className="p-3.5 rounded-2xl bg-black/35 backdrop-blur-sm border border-white/5 text-xs text-[#CBD5E1] leading-relaxed italic">
              &ldquo;{competitor.profile.biography}&rdquo;
            </div>
          )}

          {/* Vitrina de Honor / Showcase Pinboard */}
          <HonorPinboard pinnedPins={customization.pinnedPins || []} />

          {/* MONOLITHIC STATS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E63946]/15 text-[#E63946] flex items-center justify-center shrink-0 border border-[#E63946]/20">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#8E92A4] uppercase">Torneos</p>
                <p className="text-base font-black text-white">
                  <AnimatedCounter target={summary.tournaments_played} />
                </p>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <span className="text-base">🥇</span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#8E92A4] uppercase">Campeonatos</p>
                <p className="text-base font-black text-amber-400">
                  <AnimatedCounter target={summary.championships} />
                </p>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-300/15 text-slate-300 flex items-center justify-center shrink-0 border border-slate-300/20">
                <span className="text-base">🥈</span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#8E92A4] uppercase">Platas</p>
                <p className="text-base font-black text-slate-300">
                  <AnimatedCounter target={summary.silver_medals} />
                </p>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-700/15 text-amber-500 flex items-center justify-center shrink-0 border border-amber-700/20">
                <span className="text-base">🥉</span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#8E92A4] uppercase">Bronces</p>
                <p className="text-base font-black text-amber-500">
                  <AnimatedCounter target={summary.bronze_medals} />
                </p>
              </div>
            </div>
          </div>

        </div>
      </HolographicCard>

      {/* 2. TABS: TORNEOS / MEDALLAS / MURO */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 overflow-x-auto">
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('TOURNAMENTS');
              }}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'TOURNAMENTS'
                  ? 'text-white'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <Swords className="w-4 h-4 text-[#E63946]" />
              <span>Torneos Activos</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-[#CBD5E1]">
                {competitor.active_tournaments?.length || 0}
              </span>
              {activeTab === 'TOURNAMENTS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63946] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('MEDALS');
              }}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'MEDALS'
                  ? 'text-white'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Vitrina de Medallas</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300">
                {medals.length}
              </span>
              {activeTab === 'MEDALS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('WALL');
              }}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'WALL'
                  ? 'text-white'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Muro de Firmas</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                {signatures.length}
              </span>
              {activeTab === 'WALL' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: TORNEOS ACTIVOS */}
        {activeTab === 'TOURNAMENTS' && (
          <div className="space-y-4">
            {(!competitor.active_tournaments || competitor.active_tournaments.length === 0) ? (
              <div className="p-10 text-center bg-[#111520] rounded-3xl border border-white/10 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#0A0D14] border border-white/5 text-[#8E92A4] flex items-center justify-center mx-auto text-2xl">
                  ⚔️
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-base font-black text-white">Sin torneos activos</h3>
                  <p className="text-xs text-[#8E92A4] leading-relaxed">
                    Este competidor no se encuentra disputando ningún torneo activo en este momento. Sus participaciones culminadas y podios se muestran en la Vitrina de Medallas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitor.active_tournaments.map((tour) => (
                  <div
                    key={tour.id}
                    className="p-5 rounded-2xl bg-[#111520] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between group space-y-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-white/10 text-white border border-white/10">
                          {tour.game_code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A0D14] text-[#CBD5E1] border border-white/10">
                          {tour.registration_status === 'CONFIRMED' ? 'Cupo Confirmado' : 'En Revisión'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {tour.name}
                        </h3>
                        {tour.team_name && (
                          <p className="text-xs text-[#8E92A4] font-semibold mt-0.5">
                            Equipo: <span className="text-amber-400 font-bold">{tour.team_name}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-[#8E92A4] mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#E63946]" />
                          <span>
                            {new Date(tour.tournament_start_at).toLocaleDateString('es-PE', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        {tour.prize_pool || 'Premio Oficial'}
                      </span>
                      <Link
                        href={`/tournaments/${tour.slug}`}
                        className="btn-secondary px-3 py-1.5 text-xs text-emerald-400 hover:text-white inline-flex items-center gap-1"
                      >
                        Ver Torneo &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VITRINA DE MEDALLAS */}
        {activeTab === 'MEDALS' && (
          <div className="space-y-4">
            {medals.length === 0 ? (
              <div className="p-10 text-center bg-[#111520] rounded-3xl border border-white/10 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  🏅
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-black text-white">
                    Sin medallas de honor aún
                  </h3>
                  <p className="text-xs text-[#8E92A4] leading-relaxed">
                    Este competidor aún no ha finalizado ningún torneo en el podio de Campus Arena.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {medals.map((medal) => (
                  <Link
                    key={medal.id}
                    href={`/tournaments/${medal.tournament_slug}`}
                    onMouseEnter={() => sounds.playClick()}
                    className={`p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden flex flex-col justify-between ${
                      medal.medal_type === 'GOLD'
                        ? 'border-amber-400/60 hover:border-amber-300 shadow-lg shadow-amber-500/10 bg-gradient-to-b from-amber-500/15 via-[#111520] to-[#0A0D14]'
                        : medal.medal_type === 'SILVER'
                        ? 'border-slate-300/60 hover:border-slate-200 shadow-lg shadow-slate-400/10 bg-gradient-to-b from-slate-400/15 via-[#111520] to-[#0A0D14]'
                        : 'border-amber-700/60 hover:border-amber-600 shadow-lg shadow-amber-800/10 bg-gradient-to-b from-amber-700/15 via-[#111520] to-[#0A0D14]'
                    }`}
                  >
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform ${
                          medal.medal_type === 'GOLD' ? 'bg-gradient-to-tr from-amber-500/30 to-amber-200/20 border border-amber-400/50' :
                          medal.medal_type === 'SILVER' ? 'bg-gradient-to-tr from-slate-400/30 to-slate-200/20 border border-slate-300/50' :
                          'bg-gradient-to-tr from-amber-800/30 to-amber-600/20 border border-amber-600/50'
                        }`}>
                          {medal.emoji}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          medal.medal_type === 'GOLD'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : medal.medal_type === 'SILVER'
                            ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                            : 'bg-amber-700/20 text-amber-400 border-amber-700/40'
                        }`}>
                          {medal.place}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {medal.tournament_name}
                        </p>
                        <p className="text-[11px] font-semibold text-[#8E92A4]">
                          {medal.title}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-[10px] text-[#8E92A4] relative z-10">
                      <span className="font-bold text-white">{medal.game_code}</span>
                      <span className="inline-flex items-center gap-1 text-[#CBD5E1] group-hover:text-white transition-colors">
                        Ver torneo &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MURO DE FIRMAS */}
        {activeTab === 'WALL' && (
          <div className="bg-[#111520] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#1D3557] text-white flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Muro de Firmas & Mensajes</h3>
                  <p className="text-xs text-[#8E92A4]">Dedicatorias y firmas de honor dejadas por la comunidad</p>
                </div>
              </div>
            </div>

            {/* Formulario para firmar */}
            {currentUser ? (
              <form onSubmit={handleAddSignature} className="bg-[#0A0D14] p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Firmar el carnet de {competitor.profile?.nickname || capitalizeWords(competitor.first_name)}
                  </span>
                </div>

                {/* Quick Stickers */}
                <div className="flex flex-wrap gap-2">
                  {[
                    '🏆 ¡A romperla en el torneo!',
                    '👑 Leyenda de Tecsup',
                    '🔥 Mucho nivel, GG WP',
                    '🚀 El MVP indiscutible',
                    '🛡️ Enorme defensa hoy',
                    '⚔️ Listo para la revancha'
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setSigContent((prev) => (prev ? `${prev} ${chip}` : chip))}
                      className="px-2.5 py-1 rounded-lg bg-[#111520] hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-[#CBD5E1] hover:text-white transition-all cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <textarea
                  value={sigContent}
                  onChange={(e) => setSigContent(e.target.value)}
                  placeholder="Escribe un mensaje, felicitación, reto o firma aquí..."
                  rows={3}
                  maxLength={400}
                  className="input-arena w-full bg-[#111520] border-white/10 focus:border-[#E63946] rounded-xl text-xs text-white resize-none"
                />

                {sigImage && (
                  <div className="relative inline-block border border-white/10 rounded-xl overflow-hidden bg-[#111520] p-1">
                    <img
                      src={sigImage}
                      alt="Adjunto para el muro"
                      className="max-h-36 max-w-full rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSigImage(null);
                        setSigFile(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-white text-xs transition-colors"
                      title="Quitar imagen"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {showUrlField && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#111520] border border-cyan-500/40">
                    <input
                      type="url"
                      value={sigUrlInput}
                      onChange={(e) => setSigUrlInput(e.target.value)}
                      placeholder="Pega enlace directo de GIF o imagen (https://...gif)"
                      className="bg-transparent border-none text-xs text-white placeholder-[#8E92A4] focus:outline-none flex-1 px-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = sigUrlInput.trim();
                          if (url) {
                            if (!url.startsWith('https://') && !url.startsWith('http://') && !url.startsWith('data:image/')) {
                              toast.error('Solo se admiten enlaces seguros que comiencen por https://');
                              return;
                            }
                            setSigImage(url);
                            setShowUrlField(false);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = sigUrlInput.trim();
                        if (url) {
                          if (!url.startsWith('https://') && !url.startsWith('http://') && !url.startsWith('data:image/')) {
                            toast.error('Solo se admiten enlaces seguros que comiencen por https://');
                            return;
                          }
                          setSigImage(url);
                          setShowUrlField(false);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cargar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlField(false)}
                      className="p-1 text-[#8E92A4] hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111520] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#CBD5E1] hover:text-white cursor-pointer transition-colors">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{sigImage ? 'Cambiar archivo' : 'Subir imagen/GIF'}</span>
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowUrlField((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        showUrlField
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-[#111520] hover:bg-white/10 border-white/10 text-[#CBD5E1] hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5 text-pink-400" />
                      <span>Pegar link GIF/Web</span>
                    </button>

                    <span className="text-[10px] text-[#8E92A4]">
                      {sigContent.length}/400 caracteres
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingSig || (!sigContent.trim() && !sigImage)}
                    className="btn-primary px-5 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#E63946]/20 disabled:opacity-50"
                  >
                    {isSubmittingSig ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Firmar Carnet</span>
                      </>
                    )}
                  </button>
                </div>

                {sigFeedback && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    sigFeedback.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {sigFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <span>⚠️</span>
                    )}
                    <span>{sigFeedback.message}</span>
                  </div>
                )}
              </form>
            ) : (
              <div className="p-6 bg-[#0A0D14] rounded-2xl border border-white/10 text-center space-y-3">
                <p className="text-xs text-[#8E92A4]">
                  ¿Quieres dejar una dedicatoria o firma en el carnet de este competidor?
                </p>
                <Link
                  href="/auth/login"
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-lg shadow-[#E63946]/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Inicia sesión con tu correo @tecsup.edu.pe
                </Link>
              </div>
            )}

            {/* Listado de Firmas */}
            {loadingSignatures ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-[#8E92A4]">
                <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
                <p className="text-xs">Cargando firmas...</p>
              </div>
            ) : signatures.length === 0 ? (
              <div className="p-8 text-center bg-[#0A0D14] rounded-2xl border border-white/5 space-y-2">
                <div className="text-2xl">✍️</div>
                <h3 className="text-sm font-bold text-white">Muro sin firmas aún</h3>
                <p className="text-xs text-[#8E92A4]">
                  ¡Sé el primero en dejar una dedicatoria de honor en este carnet!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {signatures.map((sig) => {
                  const author = sig.author || {
                    id: '',
                    first_name: 'Usuario',
                    last_name: '',
                    nickname: null,
                    email: '',
                    avatar_url: null,
                    campus: 'Lima',
                  };

                  const canDelete =
                    (Boolean(currentUser?.id && author.id) && currentUser?.id === author.id) ||
                    isOwnProfile ||
                    currentUser?.role === 'ADMIN';

                  return (
                    <div
                      key={sig.id}
                      className="p-4 rounded-2xl bg-[#0A0D14] border border-white/5 hover:border-white/20 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={author.id ? `/profile/${author.id}` : '#'}
                            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#1D3557] p-0.5 shrink-0 overflow-hidden"
                          >
                            {author.avatar_url ? (
                              <img
                                src={author.avatar_url}
                                alt={author.nickname || author.first_name}
                                className="w-full h-full object-cover rounded-[10px]"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#111520] rounded-[10px] flex items-center justify-center font-bold text-white text-xs">
                                {(author.nickname || author.first_name || 'U')[0].toUpperCase()}
                              </div>
                            )}
                          </Link>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={author.id ? `/profile/${author.id}` : '#'}
                                className="text-xs font-bold text-white hover:text-[#E63946] transition-colors"
                              >
                                {author.nickname || capitalizeWords(author.first_name)}
                              </Link>
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-white/5 border border-white/10 text-[#8E92A4]">
                                Sede {author.campus || 'Lima'}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#8E92A4]">
                              {new Date(sig.created_at).toLocaleDateString('es-PE', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteSignature(sig.id)}
                            className="p-1.5 rounded-lg text-[#8E92A4] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Eliminar firma"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-[#CBD5E1] leading-relaxed pl-12 whitespace-pre-wrap">
                        {sig.content}
                      </p>

                      {sig.image_url && (
                        <div className="pl-12 pt-1">
                          <img
                            src={sig.image_url}
                            alt="Firma adjunta"
                            className="max-h-56 max-w-sm rounded-xl border border-white/10 object-contain bg-black/20"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      </div>
    </div>
  );
}
