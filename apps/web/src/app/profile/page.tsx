'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
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
  Camera,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Eye,
  Mail,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Award,
  Gamepad2,
  Building2,
  Check,
  Volume2,
  Palette,
  Type
} from 'lucide-react';
import { toast } from 'sonner';
import { fireCelebration } from '@/lib/confetti';
import { HolographicCard } from '@/components/HolographicCard';
import { sounds } from '@/lib/sound';
import { GAME_CATALOG, GAME_LIST, type GameCode } from '@/lib/games';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { 
  getProfileCustomization, 
  saveProfileCustomization, 
  ProfileCustomizationState,
  DEFAULT_CUSTOMIZATION,
  CARD_MATERIALS,
  AVATAR_FRAMES,
  NAME_FONT_LIST,
  NAME_COLOR_PRESETS,
  SOUNDBITES,
  PROFILE_WALLPAPERS,
  playCustomSoundbite,
  type CardMaterial,
  type AvatarFrame,
  type NameFontFamily,
  type NameColorPreset,
  type SoundbiteId,
  type ProfileWallpaper,
  type HonorPinId
} from '@/lib/profile-customization';
import { AvatarWithFrame } from '@/components/AvatarWithFrame';
import { HonorPinboard } from '@/components/HonorPinboard';
import { CompetitorName } from '@/components/CompetitorName';

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

export type BannerTheme = 'cyberpunk' | 'carbon' | 'aurora' | 'gold' | 'obsidian' | 'retro' | 'matrix' | 'arena' | 'sapphire';

export const BANNER_THEMES: Array<{
  id: BannerTheme;
  name: string;
  desc: string;
  tag: string;
  bgClass: string;
  glowColor: string;
}> = [
  { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Rejilla carmesí & cian synthwave oficial', tag: 'Neon', bgClass: 'banner-cyberpunk', glowColor: 'rgba(230, 57, 70, 0.35)' },
  { id: 'sapphire', name: 'Zafiro Tecsup', desc: 'Resplandor azul cobalto y cian eléctrico', tag: 'Cobalt', bgClass: 'banner-sapphire', glowColor: 'rgba(37, 99, 235, 0.4)' },
  { id: 'carbon', name: 'Midnight Carbon', desc: 'Malla stealth de fibra de carbono oscura', tag: 'Stealth', bgClass: 'banner-carbon', glowColor: 'rgba(148, 163, 184, 0.25)' },
  { id: 'aurora', name: 'Aurora Cósmica', desc: 'Nebulosa esmeralda y cian etérea', tag: 'Cosmic', bgClass: 'banner-aurora', glowColor: 'rgba(16, 185, 129, 0.3)' },
  { id: 'gold', name: '24K Championship', desc: 'Reflejos dorados de gran campeón', tag: 'Gold', bgClass: 'banner-gold', glowColor: 'rgba(245, 158, 11, 0.35)' },
  { id: 'obsidian', name: 'Titanio Obsidiana', desc: 'Acabado minimalista de cristal templado', tag: 'Titanium', bgClass: 'banner-obsidian', glowColor: 'rgba(59, 130, 246, 0.25)' },
  { id: 'retro', name: 'Retro Synthwave 80s', desc: 'Atardecer neón y rejilla arcade retro', tag: 'Arcade', bgClass: 'banner-retro', glowColor: 'rgba(168, 85, 247, 0.3)' },
  { id: 'matrix', name: 'Cyber Matrix', desc: 'Terminal táctica hacker verde fósforo', tag: 'Matrix', bgClass: 'banner-matrix', glowColor: 'rgba(16, 185, 129, 0.3)' },
  { id: 'arena', name: 'Tecsup Arena Oficial', desc: 'Rojo carmesí y azul marino institucional', tag: 'Oficial', bgClass: 'banner-arena', glowColor: 'rgba(230, 57, 70, 0.4)' },
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

  // Profile data
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
  const [academicRole, setAcademicRole] = useState<'ESTUDIANTE' | 'DOCENTE' | 'EGRESADO'>('ESTUDIANTE');
  const [favGame, setFavGame] = useState<GameCode>('CLASH_ROYALE');

  // UI Tabs on Main Profile: 'TOURNAMENTS' | 'MEDALS' | 'ACADEMIC'
  const [activeTab, setActiveTab] = useState<'TOURNAMENTS' | 'MEDALS' | 'ACADEMIC'>('TOURNAMENTS');

  // Customization Modal State (Clean, step-by-step modal with live preview)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState<'WALLPAPER_CARD' | 'AVATAR_NAME' | 'GAMES' | 'INFO'>('WALLPAPER_CARD');

  // Full Profile Customization (Materials, Frames, Calling Cards, Pins, War Cry, Soundbite, Wallpaper)
  const [customization, setCustomization] = useState<ProfileCustomizationState>(DEFAULT_CUSTOMIZATION);
  const [editCustomization, setEditCustomization] = useState<ProfileCustomizationState>(DEFAULT_CUSTOMIZATION);

  // Temporary edit buffer for live preview before saving
  const [editForm, setEditForm] = useState<ProfileData>({
    nickname: '',
    campus: 'Lima',
    biography: '',
    career: '',
    cycle: 1,
    avatar_url: null,
  });
  const [editRole, setEditRole] = useState<'ESTUDIANTE' | 'DOCENTE' | 'EGRESADO'>('ESTUDIANTE');
  const [editBannerTheme, setEditBannerTheme] = useState<BannerTheme>('cyberpunk');
  const [editFavGame, setEditFavGame] = useState<GameCode>('CLASH_ROYALE');
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Gamer Banner Theme State
  const [bannerTheme, setBannerTheme] = useState<BannerTheme>('cyberpunk');

  // Sanctions and appeals state
  const [userSanctions, setUserSanctions] = useState<any[]>([]);
  const [userAppeals, setUserAppeals] = useState<any[]>([]);
  const [appealModalSanction, setAppealModalSanction] = useState<any | null>(null);
  const [appealText, setAppealText] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('campus_arena_banner_theme') as BannerTheme;
    if (savedTheme && BANNER_THEMES.some(t => t.id === savedTheme)) {
      setBannerTheme(savedTheme);
      setEditBannerTheme(savedTheme);
    }
    const savedGame = localStorage.getItem('campus_arena_fav_game') as GameCode;
    if (savedGame && GAME_CATALOG[savedGame]) {
      setFavGame(savedGame);
      setEditFavGame(savedGame);
    }

    // Load full profile customization
    const savedCustomization = getProfileCustomization(user?.id);
    setCustomization(savedCustomization);
    setEditCustomization(savedCustomization);

    // Play Soundbite on profile entry if configured
    if (savedCustomization.soundbite && savedCustomization.soundbite !== 'none') {
      const timer = setTimeout(() => {
        if (savedCustomization.soundbite === 'tactical_chime') sounds.playTacticalChime();
        else if (savedCustomization.soundbite === 'synthesizer_blip') sounds.playSynthesizerBlip();
        else if (savedCustomization.soundbite === 'laser_charge') sounds.playLaserCharge();
        else if (savedCustomization.soundbite === 'victory_bell') sounds.playVictoryBell();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync customization when user authentication completes
  useEffect(() => {
    if (user?.id) {
      const userCustomization = getProfileCustomization(user.id);
      setCustomization(userCustomization);
      setEditCustomization(userCustomization);
    }
  }, [user?.id]);

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
        
        let detectedRole: 'ESTUDIANTE' | 'DOCENTE' | 'EGRESADO' = 'ESTUDIANTE';
        if (careerStr.toLowerCase().includes('docente') || careerStr.toLowerCase().includes('profesor') || rawCycle === -1) {
          detectedRole = 'DOCENTE';
        } else if (careerStr.toLowerCase().includes('egresado') || rawCycle === 0) {
          detectedRole = 'EGRESADO';
        } else {
          detectedRole = 'ESTUDIANTE';
        }

        const initialData: ProfileData = {
          nickname: res.data.profile.nickname || '',
          campus: res.data.profile.campus || 'Lima',
          biography: res.data.profile.biography || '',
          career: careerStr || 'Diseño y Desarrollo de Software',
          cycle: rawCycle !== undefined && rawCycle !== null ? rawCycle : 1,
          avatar_url: res.data.profile.avatar_url || null,
        };

        setAcademicRole(detectedRole);
        setEditRole(detectedRole);
        setProfile(initialData);
        setEditForm(initialData);
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

  // Open edit modal syncs state
  const handleOpenEditModal = () => {
    setEditForm({ ...profile });
    setEditRole(academicRole);
    setEditBannerTheme(bannerTheme);
    setEditFavGame(favGame);
    setEditCustomization({ ...customization });
    setCustomAvatarInput(profile.avatar_url?.startsWith('http') ? profile.avatar_url : '');
    setShowEditModal(true);
    sounds.playClick();
  };

  // Test soundbite audio in customizer
  const testSoundbite = (s: SoundbiteId) => {
    if (s === 'tactical_chime') sounds.playTacticalChime();
    else if (s === 'synthesizer_blip') sounds.playSynthesizerBlip();
    else if (s === 'laser_charge') sounds.playLaserCharge();
    else if (s === 'victory_bell') sounds.playVictoryBell();
  };

  // Save all modifications from modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const cycleToSave = editRole === 'ESTUDIANTE' ? Number(editForm.cycle || 1) : 0;

    const res = await api.patch('/profile/me', {
      nickname: editForm.nickname?.trim() || undefined,
      campus: editForm.campus || 'Lima',
      biography: editForm.biography,
      career: editForm.career,
      cycle: cycleToSave,
      avatar_url: editForm.avatar_url || undefined,
    });

    if (res.success) {
      // Save local preferences
      localStorage.setItem('campus_arena_banner_theme', editBannerTheme);
      localStorage.setItem('campus_arena_fav_game', editFavGame);
      saveProfileCustomization(editCustomization, user?.id);
      setCustomization(editCustomization);
      setBannerTheme(editBannerTheme);
      setFavGame(editFavGame);
      setProfile({ ...editForm, cycle: cycleToSave });
      setAcademicRole(editRole);

      if (user && editForm.avatar_url) {
        user.avatar_url = editForm.avatar_url;
      }

      sounds.playSuccess();
      fireCelebration();
      toast.success('¡Carnet competitivo y personalizaciones guardadas con éxito!');
      setShowEditModal(false);
    } else {
      toast.error(res.error?.message || 'Error al guardar los cambios.');
    }

    setIsSaving(false);
  };

  const handleShareProfile = async () => {
    sounds.playClick();
    const url = `${window.location.origin}/profile/${user?.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('¡Enlace de tu perfil copiado al portapapeles!');
    } catch {
      toast.info(`Comparte este enlace: ${url}`);
    }
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
      toast.success('¡Tu apelación fue enviada y será revisada por el tribunal!');
      setAppealModalSanction(null);
      setAppealText('');
      loadFullProfile();
    } else {
      toast.error(res.error?.message || 'Error al enviar la apelación.');
    }
    setIsSubmittingAppeal(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
        <p className="text-xs text-[#8E92A4]">Cargando carnet de competidor...</p>
      </div>
    );
  }

  const activeThemeConfig = BANNER_THEMES.find(t => t.id === bannerTheme) || BANNER_THEMES[0];
  const activeWallpaperConfig = PROFILE_WALLPAPERS.find(w => w.id === customization.wallpaper) || PROFILE_WALLPAPERS[0];
  const activeMaterialConfig = CARD_MATERIALS.find(m => m.id === customization.material) || CARD_MATERIALS[0];
  const activeTypographyConfig = NAME_FONT_LIST.find(t => t.id === customization.nameTypography) || NAME_FONT_LIST[0];

  const previewWallpaperConfig = PROFILE_WALLPAPERS.find(w => w.id === editCustomization.wallpaper) || PROFILE_WALLPAPERS[0];
  const previewMaterialConfig = CARD_MATERIALS.find(m => m.id === editCustomization.material) || CARD_MATERIALS[0];
  const previewTypographyConfig = NAME_FONT_LIST.find(t => t.id === editCustomization.nameTypography) || NAME_FONT_LIST[0];

  const handleToggleFavoriteGame = (gameCode: GameCode) => {
    sounds.playClick();
    const current = editCustomization.favoriteGames || [];
    if (current.includes(gameCode)) {
      if (current.length === 1) {
        toast.info('Debes mantener al menos un juego favorito.');
        return;
      }
      setEditCustomization({
        ...editCustomization,
        favoriteGames: current.filter((g) => g !== gameCode),
      });
    } else {
      if (current.length >= 4) {
        toast.info('Puedes seleccionar hasta 4 juegos favoritos.');
        return;
      }
      setEditCustomization({
        ...editCustomization,
        favoriteGames: [...current, gameCode],
      });
    }
  };

  const handleTogglePin = (pinId: HonorPinId) => {
    sounds.playClick();
    const currentPins = editCustomization.pinnedPins || [];
    if (currentPins.includes(pinId)) {
      setEditCustomization({
        ...editCustomization,
        pinnedPins: currentPins.filter((id) => id !== pinId),
      });
    } else {
      if (currentPins.length >= 3) {
        toast.info('Solo puedes fijar hasta 3 pines en tu carnet. Desmarca uno para añadir este.');
        return;
      }
      setEditCustomization({
        ...editCustomization,
        pinnedPins: [...currentPins, pinId],
      });
    }
  };

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
      
      {/* 1. TOP QUICK ACTION TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#E63946] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Identidad Competitiva Tecsup
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Carnet del Jugador
          </h1>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Personalizar Carnet */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="flex-1 sm:flex-none btn-primary px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#E63946]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Personalizar tu carnet de competidor con vista previa en vivo"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Personalizar Carnet</span>
          </button>

          {/* Vista Visitante */}
          <Link
            href={`/profile/${user.id}`}
            className="btn-secondary px-3.5 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 text-[#A8DADC] hover:text-white"
            title="Ver cómo observan tu perfil los demás estudiantes y organizadores"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Vista Visitante</span>
          </Link>

          {/* Compartir */}
          <button
            type="button"
            onClick={handleShareProfile}
            className="btn-secondary p-2.5 text-xs cursor-pointer shrink-0 text-[#8E92A4] hover:text-white"
            title="Copiar enlace de tu perfil"
            aria-label="Compartir perfil"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. THE GAMER PASSPORT / IDENTITY CARD (Steam Points Shop meets Riot Esports) */}
      <HolographicCard 
        material={customization.material}
        className={`p-6 sm:p-9 relative overflow-hidden transition-all duration-500 rounded-3xl border border-white/10 ${customization.material === 'steam_neon_shrine' ? '' : activeThemeConfig.bgClass}`} 
        glowColor={activeThemeConfig.glowColor}
      >
        {/* Subtle Watermark Logo on Background */}
        <div className="absolute -right-8 -bottom-10 w-64 h-64 opacity-5 pointer-events-none select-none">
          <img src="/brand/tecsup_emblem.png" alt="" className="w-full h-full object-contain filter grayscale" />
        </div>

        <div className="relative z-10 space-y-6">
          
          {/* Main Competitor Banner Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center gap-5">
              {/* Avatar with Animated Frame */}
              <div className="relative shrink-0">
                <AvatarWithFrame
                  avatarUrl={profile.avatar_url || ''}
                  frame={customization.avatarFrame}
                  size="xl"
                  alt={profile.nickname || 'Avatar'}
                />
                
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  title="Personalizar avatar y marco"
                  className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#E63946] hover:bg-[#ff4353] text-white shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer z-30"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity & Badges */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <CompetitorName
                    userId={user.id}
                    name={profile.nickname || capitalizeWords(user.first_name)}
                    customization={customization}
                    className="text-2xl sm:text-3xl tracking-tight"
                  />

                  {/* Academic Condition Pill */}
                  {academicRole === 'DOCENTE' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      👨‍🏫 Docente Tecsup
                    </span>
                  ) : academicRole === 'EGRESADO' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      🎓 Egresado Tecsup
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      📚 {profile.cycle || 1}° Ciclo
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 uppercase font-mono">
                    Competidor
                  </span>
                </div>

                {/* Real Name & Academic Career */}
                <p className="text-xs sm:text-sm font-semibold text-[#8E92A4] flex items-center gap-2 flex-wrap">
                  <span className="text-white">{capitalizeWords(`${user.first_name} ${user.last_name}`)}</span>
                  <span>•</span>
                  <span>{profile.career || 'Tecsup Profesional'}</span>
                </p>

                {/* Sede & Email Info */}
                <div className="flex items-center gap-3 pt-1 text-[11px] text-[#A8DADC] flex-wrap">
                  <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-md border border-white/5">
                    <Building2 className="w-3 h-3 text-[#E63946]" />
                    Tecsup — Sede {profile.campus || 'Lima'}
                  </span>
                  <span className="flex items-center gap-1 text-[#8E92A4] font-mono">
                    <Mail className="w-3 h-3 text-[#8E92A4]" />
                    {user.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Audio Trigger (if enabled) */}
            <div className="flex md:flex-col items-center md:items-end justify-between gap-3">
              {customization.soundbite && customization.soundbite !== 'none' && (
                <button
                  type="button"
                  onClick={() => playCustomSoundbite(customization.soundbite)}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-cyan-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                  title="Reproducir audio táctil"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-mono">Audio de Perfil</span>
                </button>
              )}
            </div>

          </div>

          {/* Juegos Favoritos (Dedicated Section) */}
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

          {/* Competitor Bio Statement */}
          {profile.biography ? (
            <div className="p-3.5 rounded-2xl bg-black/35 backdrop-blur-sm border border-white/5 text-xs text-[#CBD5E1] leading-relaxed">
              "{profile.biography}"
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-xs text-[#8E92A4] flex items-center justify-between">
              <span>¿Tienes una historia o estilo de juego? Añade tu biografía competitiva.</span>
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="text-[#E63946] hover:underline font-bold text-xs cursor-pointer ml-2 shrink-0"
              >
                + Añadir Biografía
              </button>
            </div>
          )}

          {/* Vitrina de Honor / Showcase Pinboard (Idea 5) */}
          <HonorPinboard pinnedPins={customization.pinnedPins || []} />

          {/* MONOLITHIC CAREER STATS TICKER STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E63946]/15 text-[#E63946] flex items-center justify-center shrink-0 border border-[#E63946]/20">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#8E92A4] uppercase">Torneos</p>
                <p className="text-base font-black text-white">
                  <AnimatedCounter target={legacySummary.tournaments_played || registrations.length} />
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
                  <AnimatedCounter target={legacySummary.championships} />
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
                  <AnimatedCounter target={legacySummary.silver_medals} />
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
                  <AnimatedCounter target={legacySummary.bronze_medals} />
                </p>
              </div>
            </div>
          </div>

        </div>
      </HolographicCard>

      {/* SANCTIONS & APPEALS ALERT BANNER (If any) */}
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

      {/* 3. PROFILE CONTENT NAVIGATION TABS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
              <span>Mis Torneos & Llaves</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-[#CBD5E1]">
                {registrations.length}
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
                setActiveTab('ACADEMIC');
              }}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'ACADEMIC'
                  ? 'text-white'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#457B9D]" />
              <span>Ficha Académica</span>
              {activeTab === 'ACADEMIC' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#457B9D] rounded-full" />
              )}
            </button>
          </div>

          <Link
            href="/tournaments"
            className="text-xs font-bold text-[#E63946] hover:text-[#ff4353] flex items-center gap-1 shrink-0 pb-2.5 pr-2"
          >
            <span>Explorar Torneos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* TAB 1: MIS TORNEOS & PARTICIPACIONES */}
        {activeTab === 'TOURNAMENTS' && (
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <div className="p-10 text-center bg-[#111520] rounded-3xl border border-white/10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/20 text-[#E63946] flex items-center justify-center mx-auto">
                  <Swords className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-black text-white">Sin torneos activos</h3>
                  <p className="text-xs text-[#8E92A4] leading-relaxed">
                    Aún no te has inscrito a ningún torneo oficial de Campus Arena. Explora los torneos activos de Tecsup, asegura tu cupo y compite por premios y puntos en el ranking.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/tournaments"
                    className="btn-primary inline-flex items-center gap-2 py-2.5 px-6 text-xs font-bold shadow-lg shadow-[#E63946]/20"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Ver Torneos Oficiales
                  </Link>
                </div>
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
                      className="p-5 bg-[#111520] rounded-2xl border border-white/10 space-y-4 hover:border-[#E63946]/40 transition-all flex flex-col justify-between group shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[#8E92A4] uppercase tracking-wider">
                            {reg.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : reg.game_code === 'BRAWL_STARS' ? 'Brawl Stars' : reg.game_code}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {earnedMedal && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                                earnedMedal.medal_type === 'GOLD'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : earnedMedal.medal_type === 'SILVER'
                                  ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                                  : 'bg-amber-700/20 text-amber-400 border-amber-700/40'
                              }`}>
                                {earnedMedal.medal_type === 'GOLD' ? '🥇 1° Lugar' : earnedMedal.medal_type === 'SILVER' ? '🥈 2° Lugar' : '🥉 3° Lugar'}
                              </span>
                            )}
                            {getRegistrationBadge(reg.status)}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-white group-hover:text-[#E63946] transition-colors line-clamp-1">
                            {reg.tournament_name}
                          </h3>
                        </div>

                        <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/5 text-xs text-[#CBD5E1] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[#8E92A4]">Nombre de Juego:</span>
                            <span className="font-bold text-white">{reg.in_game_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#8E92A4]">Player Tag:</span>
                            <span className="font-mono text-[11px] text-[#A8DADC]">{reg.player_tag}</span>
                          </div>
                          {reg.team_name && (
                            <div className="flex items-center justify-between">
                              <span className="text-[#8E92A4]">Equipo:</span>
                              <span className="font-bold text-amber-400">{reg.team_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#8E92A4]">
                          <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
                          <span>
                            {new Date(reg.tournament_start_at).toLocaleDateString('es-PE', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <Link
                          href={`/tournaments/${reg.tournament_slug}`}
                          className="font-bold text-[#E63946] hover:text-[#ff4353] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Ver Torneo & Llaves</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VITRINA DE MEDALLAS DE HONOR */}
        {activeTab === 'MEDALS' && (
          <div className="space-y-6">
            {medals.length === 0 ? (
              <div className="p-10 text-center bg-[#111520] rounded-3xl border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  🏅
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-black text-white">
                    Sin medallas de podio aún
                  </h3>
                  <p className="text-xs text-[#8E92A4] leading-relaxed">
                    Las medallas oficiales de <strong>Oro (1° Lugar)</strong>, <strong>Plata (2° Lugar)</strong> y <strong>Bronce (3° Lugar)</strong> se forjan automáticamente en tu carnet de competidor al concluir los torneos según tu posición en el bracket oficial.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/tournaments"
                    className="btn-primary inline-flex items-center gap-2 py-2.5 px-6 text-xs font-bold shadow-lg shadow-[#E63946]/20"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Competir por una Medalla
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

        {/* TAB 3: FICHA ACADÉMICA TECSUP */}
        {activeTab === 'ACADEMIC' && (
          <div className="bg-[#111520] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#457B9D]/20 text-[#457B9D] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Registro Institucional Tecsup</h3>
                  <p className="text-xs text-[#8E92A4]">Datos oficiales vinculados a tu cuenta estudiantil</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditTab('INFO');
                  handleOpenEditModal();
                }}
                className="btn-secondary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Actualizar Datos</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-white/5 space-y-1">
                <p className="text-[10px] font-mono uppercase text-[#8E92A4]">Sede Oficial</p>
                <p className="text-sm font-black text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Tecsup — Sede {profile.campus || 'Lima'}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-white/5 space-y-1">
                <p className="text-[10px] font-mono uppercase text-[#8E92A4]">Condición en Tecsup</p>
                <p className="text-sm font-black text-white">
                  {academicRole === 'DOCENTE' ? '👨‍🏫 Docente' : academicRole === 'EGRESADO' ? '🎓 Egresado' : `📚 Estudiante (${profile.cycle || 1}° Ciclo)`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-white/5 space-y-1">
                <p className="text-[10px] font-mono uppercase text-[#8E92A4]">Carrera / Especialidad</p>
                <p className="text-sm font-black text-white truncate">
                  {profile.career || 'Tecsup Profesional'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-white/5 space-y-1">
                <p className="text-[10px] font-mono uppercase text-[#8E92A4]">Nombres y Apellidos</p>
                <p className="text-sm font-bold text-white">
                  {capitalizeWords(`${user.first_name} ${user.last_name}`)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-white/5 space-y-1 sm:col-span-2">
                <p className="text-[10px] font-mono uppercase text-[#8E92A4]">Correo Institucional Verificado</p>
                <p className="text-sm font-mono text-[#CBD5E1] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL DE PERSONALIZACIÓN PASO A PASO (LIMPIO, SIN TEXTO INNECESARIO) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#111520] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0A0D14]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E63946]/15 text-[#E63946] flex items-center justify-center border border-[#E63946]/20">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Personalizar Perfil
                  </h3>
                  <p className="text-xs text-[#8E92A4]">
                    Configura tu carnet, apariencia y juegos favoritos paso a paso
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-[#8E92A4] hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LIVE MINI PREVIEW OF THE CARNET */}
            <div 
              className="p-4 sm:p-5 border-b border-white/10 shrink-0 transition-all duration-300"
              style={previewWallpaperConfig.cssStyle}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Previsualización en Vivo de tu Carnet</span>
                </p>
                <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-white font-semibold text-[10px] font-mono">
                  {previewMaterialConfig.name}
                </span>
              </div>

              {/* The Mini Card */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-2xl ${previewMaterialConfig.cardClass} ${previewMaterialConfig.borderClass}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarWithFrame
                      avatarUrl={editForm.avatar_url || ''}
                      frame={editCustomization.avatarFrame}
                      size="md"
                      alt="Avatar Preview"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CompetitorName
                          userId={user?.id}
                          name={editForm.nickname || profile.nickname || capitalizeWords(user?.first_name || 'Competidor')}
                          customization={editCustomization}
                          className="text-base font-black truncate"
                        />
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30">
                          {editRole === 'ESTUDIANTE' ? `${editForm.cycle || 1}° Ciclo` : editRole}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1] truncate">
                        {capitalizeWords(`${user.first_name} ${user.last_name}`)} • Sede {editForm.campus || 'Lima'}
                      </p>
                    </div>
                  </div>

                  {editCustomization.soundbite && editCustomization.soundbite !== 'none' && (
                    <button
                      type="button"
                      onClick={() => playCustomSoundbite(editCustomization.soundbite)}
                      className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono flex items-center gap-1 shrink-0 cursor-pointer border border-white/10"
                      title="Probar sonido rápido"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Probar</span>
                    </button>
                  )}
                </div>

                {/* Favorite Games Badges Preview */}
                {editCustomization.favoriteGames && editCustomization.favoriteGames.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-[#8E92A4] mr-1">Juegos:</span>
                    {editCustomization.favoriteGames.map((gCode) => {
                      const g = GAME_CATALOG[gCode];
                      if (!g) return null;
                      return (
                        <span
                          key={gCode}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-black/50 border border-white/15"
                        >
                          {g.logoUrl ? (
                            <img src={g.logoUrl} alt="" className="w-3 h-3 object-contain shrink-0 filter drop-shadow" />
                          ) : (
                            <Gamepad2 className="w-3 h-3 text-[#38BDF8] shrink-0" />
                          )}
                          <span>{g.name}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Step Navigation (Clean 4 Steps) */}
            <div className="grid grid-cols-4 border-b border-white/10 bg-[#0A0D14] shrink-0 text-center">
              <button
                type="button"
                onClick={() => { sounds.playClick(); setEditTab('WALLPAPER_CARD'); }}
                className={`py-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  editTab === 'WALLPAPER_CARD'
                    ? 'border-[#38BDF8] text-white bg-white/5'
                    : 'border-transparent text-[#8E92A4] hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="hidden sm:inline">1. Fondo & Tarjeta</span>
                <span className="sm:hidden">1. Fondo</span>
              </button>

              <button
                type="button"
                onClick={() => { sounds.playClick(); setEditTab('AVATAR_NAME'); }}
                className={`py-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  editTab === 'AVATAR_NAME'
                    ? 'border-purple-400 text-white bg-white/5'
                    : 'border-transparent text-[#8E92A4] hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">2. Marco & Nombre</span>
                <span className="sm:hidden">2. Marco</span>
              </button>

              <button
                type="button"
                onClick={() => { sounds.playClick(); setEditTab('GAMES'); }}
                className={`py-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  editTab === 'GAMES'
                    ? 'border-[#E63946] text-white bg-white/5'
                    : 'border-transparent text-[#8E92A4] hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-[#E63946]" />
                <span className="hidden sm:inline">3. Juegos Favoritos</span>
                <span className="sm:hidden">3. Juegos</span>
              </button>

              <button
                type="button"
                onClick={() => { sounds.playClick(); setEditTab('INFO'); }}
                className={`py-3 text-[11px] sm:text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  editTab === 'INFO'
                    ? 'border-emerald-400 text-white bg-white/5'
                    : 'border-transparent text-[#8E92A4] hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">4. Datos & Audio</span>
                <span className="sm:hidden">4. Datos</span>
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSaveModal} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
              
              {/* STEP 1: FONDO & TARJETA */}
              {editTab === 'WALLPAPER_CARD' && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* 1. Fondo de la Página de Perfil */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Fondo de la Página de Perfil</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#8E92A4]">5 Fondos</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {PROFILE_WALLPAPERS.map((wp) => {
                        const isSelected = editCustomization.wallpaper === wp.id;
                        return (
                          <button
                            key={wp.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setEditCustomization({ ...editCustomization, wallpaper: wp.id });
                            }}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden bg-[#0A0D14] ${
                              isSelected
                                ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/20'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black text-white">{wp.name}</span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div 
                              className="h-8 rounded-lg border border-white/10 w-full"
                              style={wp.cssStyle}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Acabado de la Tarjeta */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>Material de la Tarjeta</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#8E92A4]">5 Acabados</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {CARD_MATERIALS.map((mat) => {
                        const isSelected = editCustomization.material === mat.id;
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setEditCustomization({ ...editCustomization, material: mat.id });
                            }}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${mat.cardClass} ${
                              isSelected
                                ? 'ring-2 ring-[#38BDF8] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/20 scale-[1.02]'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-white">{mat.name}</span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-[#38BDF8] text-black flex items-center justify-center text-[10px] font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Textura Gamer */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white">
                      Textura Ambiental de la Tarjeta
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BANNER_THEMES.map((theme) => {
                        const isSelected = editBannerTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setEditBannerTheme(theme.id);
                            }}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${theme.bgClass} ${
                              isSelected ? 'ring-2 ring-[#E63946] text-white border-[#E63946]' : 'border-white/10 text-[#CBD5E1]'
                            }`}
                          >
                            {theme.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 2: MARCO & NOMBRE */}
              {editTab === 'AVATAR_NAME' && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* 1. Marco del Avatar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#E63946] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
                        <span>Marco de la Foto (Avatar)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#8E92A4]">6 Marcos</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {AVATAR_FRAMES.map((frame) => {
                        const isSelected = editCustomization.avatarFrame === frame.id;
                        return (
                          <button
                            key={frame.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setEditCustomization({ ...editCustomization, avatarFrame: frame.id });
                            }}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 relative bg-[#0A0D14] ${
                              isSelected
                                ? 'ring-2 ring-[#E63946] border-[#E63946] shadow-lg shadow-[#E63946]/20 bg-[#E63946]/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <AvatarWithFrame
                              avatarUrl={editForm.avatar_url || ''}
                              frame={frame.id}
                              size="md"
                              alt={frame.name}
                            />
                            <p className="text-xs font-black text-white truncate w-full">{frame.name}</p>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E63946] text-white flex items-center justify-center text-[10px]">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Tipo de Letra (Variedad de Fuentes) */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-purple-400" />
                        <span>Tipo de Letra del Nombre (Fuente)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#8E92A4]">8 Tipografías</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {NAME_FONT_LIST.map((font) => {
                        const isSelected = editCustomization.nameTypography === font.id;
                        return (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setEditCustomization({ ...editCustomization, nameTypography: font.id });
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 bg-[#0A0D14] ${
                              isSelected
                                ? 'ring-2 ring-purple-400 border-purple-400 bg-purple-500/10 shadow-md'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-mono text-[#8E92A4] uppercase truncate">{font.name}</p>
                              <p className={`text-base font-bold text-white truncate ${font.fontClass}`}>
                                {editForm.nickname || user?.first_name || font.previewSample}
                              </p>
                              <p className="text-[10px] text-[#A8DADC]/70 truncate mt-0.5">{font.description}</p>
                            </div>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Color y Brillo del Nombre (Totalmente Independiente & Libre) */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#E63946] flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-[#E63946]" />
                        <span>Color del Nombre (Cualquier Color que Quieras)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#8E92A4]">Presets + Hex Libre</span>
                    </div>

                    {/* Presets Gradients & Glows */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {NAME_COLOR_PRESETS.filter(c => c.id !== 'custom').map((colorConfig) => {
                        const isSelected = editCustomization.nameColorPreset === colorConfig.id;
                        return (
                          <button
                            key={colorConfig.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setEditCustomization({
                                ...editCustomization,
                                nameColorPreset: colorConfig.id,
                                nameCustomColor: colorConfig.colorHex,
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 bg-[#0A0D14] ${
                              isSelected
                                ? 'ring-2 ring-white border-white shadow-lg bg-white/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <span 
                              className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: colorConfig.colorHex }}
                            />
                            <span className="text-xs font-bold text-white truncate flex-1">
                              {colorConfig.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-emerald-400">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selector de Color Hexadecimal Libre */}
                    <div className={`p-3.5 rounded-2xl border transition-all bg-[#0A0D14] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      editCustomization.nameColorPreset === 'custom'
                        ? 'border-[#E63946] ring-2 ring-[#E63946]/50 bg-[#E63946]/5'
                        : 'border-white/10'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editCustomization.nameCustomColor || '#E63946'}
                          onChange={(e) => {
                            setEditCustomization({
                              ...editCustomization,
                              nameColorPreset: 'custom',
                              nameCustomColor: e.target.value,
                            });
                          }}
                          className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white/20 bg-transparent p-0.5 shrink-0"
                          title="Haz clic para escoger cualquier color de la paleta"
                        />
                        <div>
                          <p className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>Selector de Color Libre (Hexadecimal)</span>
                            {editCustomization.nameColorPreset === 'custom' && (
                              <span className="px-2 py-0.2 rounded-full bg-[#E63946] text-white text-[9px] font-bold">
                                Activo
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#8E92A4]">
                            Elige cualquier tono exacto. Se reflejará con brillo neón en tu perfil, podios y foros.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#8E92A4]">HEX:</span>
                        <input
                          type="text"
                          value={editCustomization.nameCustomColor || '#E63946'}
                          onChange={(e) => {
                            setEditCustomization({
                              ...editCustomization,
                              nameColorPreset: 'custom',
                              nameCustomColor: e.target.value,
                            });
                          }}
                          placeholder="#E63946"
                          className="input-arena text-xs font-mono uppercase w-28 bg-[#111520] border-white/10 text-white font-bold"
                          maxLength={9}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setEditCustomization({
                              ...editCustomization,
                              nameColorPreset: 'custom',
                              nameCustomColor: editCustomization.nameCustomColor || '#E63946',
                            });
                          }}
                          className={`btn-secondary px-3 py-2 text-xs font-bold ${
                            editCustomization.nameColorPreset === 'custom' ? 'border-[#E63946] text-white' : ''
                          }`}
                        >
                          Usar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Selección de Avatar Oficial o URL */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white">
                      Avatar Oficial o Imagen
                    </label>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {SYSTEM_AVATARS.map((av) => {
                        const isSelected = editForm.avatar_url === av.url;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setEditForm({ ...editForm, avatar_url: av.url });
                            }}
                            className={`p-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#E63946]/20 border-[#E63946] scale-105 shadow-lg shadow-[#E63946]/20'
                                : 'bg-[#0A0D14] border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#111520] flex items-center justify-center">
                              <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[9px] font-semibold text-[#CBD5E1] truncate max-w-[65px]">
                              {av.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="url"
                        value={customAvatarInput}
                        onChange={(e) => setCustomAvatarInput(e.target.value)}
                        placeholder="O pega URL de avatar (Discord, Gravatar, Imgur)..."
                        className="input-arena flex-1 text-xs bg-[#0A0D14] border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customAvatarInput.trim()) {
                            setEditForm({ ...editForm, avatar_url: customAvatarInput.trim() });
                            toast.success('Avatar cargado en la vista previa.');
                          }
                        }}
                        className="btn-secondary px-3.5 py-2 text-xs font-bold cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 3: JUEGOS FAVORITOS */}
              {editTab === 'GAMES' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-[#E63946]" />
                        <span>Tus Juegos Favoritos</span>
                      </h4>
                      <p className="text-xs text-[#8E92A4]">
                        Selecciona hasta 4 juegos que te gusten o compitas en Campus Arena
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white">
                      {(editCustomization.favoriteGames || []).length} / 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {GAME_LIST.map((game) => {
                      const isSelected = (editCustomization.favoriteGames || []).includes(game.code);
                      return (
                        <button
                          key={game.code}
                          type="button"
                          onClick={() => handleToggleFavoriteGame(game.code)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#E63946]/15 border-[#E63946] shadow-sm text-white'
                              : 'bg-[#0A0D14] border-white/5 text-[#8E92A4] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {game.logoUrl ? (
                              <img src={game.logoUrl} alt={game.name} className="w-7 h-7 object-contain shrink-0 filter drop-shadow" />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                <Gamepad2 className="w-4 h-4 text-[#38BDF8]" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#CBD5E1]'}`}>
                                {game.name}
                              </p>
                              <p className="text-[10px] text-[#8E92A4]">{game.badge} • {game.shortName}</p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 border ${
                            isSelected ? 'bg-[#E63946] border-[#E63946] text-white font-bold' : 'border-white/20 text-transparent'
                          }`}>
                            ✓
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: DATOS & AUDIO */}
              {editTab === 'INFO' && (
                <div className="space-y-5 animate-in fade-in">
                  
                  {/* Gamertag / Apodo */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                      🎮 Gamertag / Apodo Competitivo
                    </label>
                    <input
                      type="text"
                      value={editForm.nickname || ''}
                      onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                      placeholder="Ej. CyberViper, LuchoPro, Phantom..."
                      maxLength={24}
                      className="input-arena w-full font-bold text-white bg-[#0A0D14] border-white/10 focus:border-amber-400 text-sm"
                    />
                  </div>

                  {/* Audio de Entrada Rápido */}
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Audio de Entrada Rápido (Soundbite)</span>
                        </label>
                        <p className="text-[11px] text-[#8E92A4]">
                          Sonido sintetizado ultrarrápido al entrar o presionar el botón de tu perfil
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SOUNDBITES.map((snd) => {
                        const isSelected = editCustomization.soundbite === snd.id;
                        return (
                          <div
                            key={snd.id}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 bg-[#0A0D14] ${
                              isSelected
                                ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-500/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playClick();
                                setEditCustomization({ ...editCustomization, soundbite: snd.id });
                                if (snd.id !== 'none') playCustomSoundbite(snd.id);
                              }}
                              className="text-left flex-1 cursor-pointer"
                            >
                              <p className="text-xs font-black text-white">{snd.name}</p>
                            </button>

                            {snd.id !== 'none' && (
                              <button
                                type="button"
                                onClick={() => playCustomSoundbite(snd.id)}
                                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-cyan-300 text-xs font-mono flex items-center gap-1 shrink-0 border border-white/10 cursor-pointer"
                                title="Reproducir sonido de prueba"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>Probar</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Biografía */}
                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white">
                      ✍️ Biografía
                    </label>
                    <textarea
                      value={editForm.biography || ''}
                      onChange={(e) => setEditForm({ ...editForm, biography: e.target.value })}
                      rows={2}
                      placeholder="Escribe tu estilo de juego o trayectoria universitaria..."
                      className="input-arena w-full bg-[#0A0D14] border-white/10 resize-none text-xs"
                      maxLength={180}
                    />
                  </div>

                  {/* Sede Institucional */}
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white">
                      📍 Sede Institucional Tecsup
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Lima', name: 'Lima', flag: '🏛️' },
                        { id: 'Arequipa', name: 'Arequipa', flag: '🌋' },
                        { id: 'Trujillo', name: 'Trujillo', flag: '🌊' },
                      ].map((c) => {
                        const isSelected = (editForm.campus || 'Lima') === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, campus: c.id })}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#E63946]/15 border-[#E63946] text-white font-bold'
                                : 'bg-[#0A0D14] border-white/5 text-[#8E92A4] hover:border-white/20'
                            }`}
                          >
                            <span className="text-base mr-1">{c.flag}</span>
                            <span className="text-xs">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Condición Académica */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditRole('ESTUDIANTE');
                        if (!editForm.cycle || editForm.cycle < 1 || editForm.cycle > 6) {
                          setEditForm({ ...editForm, cycle: 1 });
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        editRole === 'ESTUDIANTE'
                          ? 'bg-[#E63946]/15 border-[#E63946] text-white font-bold'
                          : 'bg-[#0A0D14] border-white/10 text-[#8E92A4]'
                      }`}
                    >
                      <span className="text-xs">Estudiante Regular</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditRole('DOCENTE');
                        setEditForm({ ...editForm, cycle: 0 });
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        editRole === 'DOCENTE'
                          ? 'bg-indigo-500/15 border-indigo-500 text-white font-bold'
                          : 'bg-[#0A0D14] border-white/10 text-[#8E92A4]'
                      }`}
                    >
                      <span className="text-xs">Docente Tecsup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditRole('EGRESADO');
                        setEditForm({ ...editForm, cycle: 0 });
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        editRole === 'EGRESADO'
                          ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                          : 'bg-[#0A0D14] border-white/10 text-[#8E92A4]'
                      }`}
                    >
                      <span className="text-xs">Egresado Tecsup</span>
                    </button>
                  </div>

                  {/* Carrera y Ciclo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={editRole === 'ESTUDIANTE' ? 'sm:col-span-2 space-y-1' : 'sm:col-span-3 space-y-1'}>
                      <label className="block text-[11px] font-semibold text-[#8E92A4]">
                        {editRole === 'DOCENTE' ? 'Área Docente' : 'Carrera'}
                      </label>
                      <input
                        type="text"
                        value={editForm.career || ''}
                        onChange={(e) => setEditForm({ ...editForm, career: e.target.value })}
                        placeholder="Ej. Diseño y Desarrollo de Software"
                        className="input-arena w-full bg-[#0A0D14] border-white/10 text-xs"
                        required
                      />
                    </div>

                    {editRole === 'ESTUDIANTE' && (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#8E92A4]">
                          Ciclo
                        </label>
                        <select
                          value={editForm.cycle || 1}
                          onChange={(e) => setEditForm({ ...editForm, cycle: Number(e.target.value) })}
                          className="input-arena w-full bg-[#0A0D14] border-white/10 text-xs text-white"
                        >
                          {[1, 2, 3, 4, 5, 6].map((c) => (
                            <option key={c} value={c} className="bg-[#111520] text-white">
                              {c}° Ciclo
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary py-2.5 px-5 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary py-2.5 px-7 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E63946]/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* STUDENT APPEAL SUBMISSION MODAL */}
      {appealModalSanction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111520] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-amber-500/30 rounded-3xl shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Solicitud de Apelación Disciplinaria</h3>
                  <p className="text-xs text-[#8E92A4]">
                    Envía tu descargo para que el tribunal revise tu sanción
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAppealModalSanction(null)}
                className="p-1 rounded-lg text-[#8E92A4] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0A0D14] p-3.5 rounded-xl border border-white/10 text-xs space-y-1.5">
              <p className="text-[#8E92A4]">
                <strong className="text-white">Tipo de sanción:</strong> {appealModalSanction.type}
              </p>
              <p className="text-[#8E92A4]">
                <strong className="text-white">Motivo aplicado:</strong> {appealModalSanction.reason}
              </p>
            </div>

            <form onSubmit={handleSubmitAppeal} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-white">Tu descargo y explicación de los hechos:</label>
                <textarea
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  placeholder="Explica con respeto y detalle por qué consideras que la sanción debe ser revocada o reducida (mínimo 10 caracteres)..."
                  rows={4}
                  required
                  minLength={10}
                  className="w-full bg-[#0A0D14] border border-white/10 rounded-xl p-3 text-white placeholder:text-[#8E92A4] focus:outline-none focus:border-amber-400 text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
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

      </div>
    </div>
  );
}
