import React from 'react';
import type { GameCode } from './games';
import { sounds } from './sound';

// ============================================================================
// 1. ACABADOS DE LA TARJETA (Card Materials / Mini Profile Backgrounds)
// ============================================================================
export type CardMaterial = 
  | 'sapphire_glass' 
  | 'titanium' 
  | 'rainbow_foil' 
  | 'gold_24k' 
  | 'stealth_carbon'
  | 'steam_neon_shrine';

export interface MaterialConfig {
  id: CardMaterial;
  name: string;
  cardClass: string;
  foilGradient: string;
  borderClass: string;
  glowColor: string;
  swatchColor: string;
  videoUrl?: string;
  tag?: string;
  description?: string;
}

export const CARD_MATERIALS: MaterialConfig[] = [
  {
    id: 'steam_neon_shrine',
    name: 'Santuario Steam Animado',
    cardClass: 'bg-[#0B0D13]/85 backdrop-blur-xl shadow-[0_10px_35px_rgba(147,51,234,0.35)]',
    foilGradient: 'radial-gradient(circle at %X% %Y%, rgba(168,85,247,0.4) 0%, transparent 70%)',
    borderClass: 'border-purple-500/50 hover:border-purple-400/90',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    swatchColor: '#7C3AED',
    videoUrl: '/steam/admin_card_bg.webm',
    tag: 'Admin Steam',
    description: 'Fondo animado de vapor y santuario neón oficial de Steam',
  },
  {
    id: 'sapphire_glass',
    name: 'Cristal Zafiro',
    cardClass: 'bg-[#0E1424]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(30,64,175,0.25)]',
    foilGradient: 'radial-gradient(circle at %X% %Y%, rgba(56,189,248,0.5) 0%, rgba(37,99,235,0.3) 30%, transparent 70%)',
    borderClass: 'border-[#38BDF8]/40 hover:border-[#38BDF8]/70',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    swatchColor: '#1E40AF',
  },
  {
    id: 'titanium',
    name: 'Titanio Mate',
    cardClass: 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] shadow-[0_8px_30px_rgba(0,0,0,0.6)]',
    foilGradient: 'radial-gradient(circle at %X% %Y%, rgba(255,255,255,0.25) 0%, rgba(148,163,184,0.15) 35%, transparent 65%)',
    borderClass: 'border-slate-500/40 hover:border-slate-400/70',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    swatchColor: '#334155',
  },
  {
    id: 'rainbow_foil',
    name: 'Prisma Tornasol',
    cardClass: 'bg-[#0F1320] shadow-[0_10px_35px_rgba(230,57,70,0.2)]',
    foilGradient: 'radial-gradient(circle at %X% %Y%, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.4) 25%, rgba(230,57,70,0.35) 50%, rgba(69,123,157,0.35) 75%, transparent 100%)',
    borderClass: 'border-pink-500/40 hover:border-pink-400/80',
    glowColor: 'rgba(230, 57, 70, 0.35)',
    swatchColor: '#EC4899',
  },
  {
    id: 'gold_24k',
    name: 'Oro Metálico',
    cardClass: 'bg-gradient-to-br from-[#2D2109] via-[#1A1405] to-[#0B0902] shadow-[0_10px_35px_rgba(245,158,11,0.25)]',
    foilGradient: 'radial-gradient(circle at %X% %Y%, rgba(254,240,138,0.7) 0%, rgba(245,158,11,0.4) 30%, rgba(180,83,9,0.2) 60%, transparent 80%)',
    borderClass: 'border-amber-400/50 hover:border-amber-400/90',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    swatchColor: '#F59E0B',
  },
  {
    id: 'stealth_carbon',
    name: 'Negro Sigilo',
    cardClass: 'bg-[#0B0D13] shadow-[0_8px_30px_rgba(0,0,0,0.7)]',
    foilGradient: 'radial-gradient(circle at %X% %Y%, rgba(255,255,255,0.15) 0%, rgba(51,65,85,0.2) 40%, transparent 70%)',
    borderClass: 'border-zinc-700/50 hover:border-zinc-500/80',
    glowColor: 'rgba(51, 65, 85, 0.35)',
    swatchColor: '#18181B',
  },
];

// ============================================================================
// 2. MARCOS DE AVATAR (Avatar Frames)
// ============================================================================
export type AvatarFrame = 
  | 'none' 
  | 'admin_brush'
  | 'pcb_circuit' 
  | 'crimson_flame' 
  | 'neon_ring' 
  | 'golden_crown' 
  | 'cyber_glitch';

export interface FrameConfig {
  id: AvatarFrame;
  name: string;
  frameCss: string;
  glowColor: string;
  imageFrameUrl?: string;
  tag?: string;
  description?: string;
  accentBadge?: string;
}

export const AVATAR_FRAMES: FrameConfig[] = [
  {
    id: 'admin_brush',
    name: 'Sumi-e Tinta Admin',
    frameCss: 'border-0',
    imageFrameUrl: '/frames/admin_brush_frame.png',
    glowColor: 'rgba(230, 57, 70, 0.65)',
    tag: 'Admin Exclusivo',
    description: 'Círculo de pincelada zen y tinta sumi-e tradicional',
  },
  {
    id: 'none',
    name: 'Sin Marco',
    frameCss: 'border-2 border-white/20',
    glowColor: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'pcb_circuit',
    name: 'Circuito Zafiro',
    frameCss: 'border-2 border-[#38BDF8] ring-2 ring-[#1E40AF]/60 shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    glowColor: 'rgba(56, 189, 248, 0.5)',
  },
  {
    id: 'crimson_flame',
    name: 'Fuego Carmesí',
    frameCss: 'border-2 border-[#E63946] ring-2 ring-[#E63946]/50 shadow-[0_0_18px_rgba(230,57,70,0.55)]',
    glowColor: 'rgba(230, 57, 70, 0.6)',
  },
  {
    id: 'neon_ring',
    name: 'Anillo Neón',
    frameCss: 'border-2 border-[#A855F7] ring-2 ring-[#38BDF8]/40 shadow-[0_0_16px_rgba(168,85,247,0.5)]',
    glowColor: 'rgba(168, 85, 247, 0.55)',
  },
  {
    id: 'golden_crown',
    name: 'Corona Dorada',
    frameCss: 'border-2 border-amber-400 ring-2 ring-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.6)]',
    glowColor: 'rgba(245, 158, 11, 0.65)',
  },
  {
    id: 'cyber_glitch',
    name: 'Glitch Cyber',
    frameCss: 'border-2 border-emerald-400 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    glowColor: 'rgba(16, 185, 129, 0.5)',
  },
];

// ============================================================================
// 3. FONDOS DE LA PÁGINA DE PERFIL (Profile Wallpapers)
// ============================================================================
export type ProfileWallpaper = 
  | 'steam_space_voyage'
  | 'nebula_sapphire' 
  | 'cyber_rain' 
  | 'night_campus' 
  | 'deep_void' 
  | 'hex_matrix';

export interface WallpaperConfig {
  id: ProfileWallpaper;
  name: string;
  swatchColor: string;
  cssStyle: React.CSSProperties;
  videoUrl?: string;
  tag?: string;
  description?: string;
}

export const PROFILE_WALLPAPERS: WallpaperConfig[] = [
  {
    id: 'steam_space_voyage',
    name: 'Cosmos Steam Animado',
    swatchColor: '#9333EA',
    videoUrl: '/steam/admin_profile_bg.webm',
    cssStyle: {
      backgroundColor: '#070913',
    },
    tag: 'Admin Steam',
    description: 'Viaje espacial estelar animado oficial de Steam Points Shop',
  },
  {
    id: 'nebula_sapphire',
    name: 'Cobalto Zafiro',
    swatchColor: '#1E40AF',
    cssStyle: {
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(30, 64, 175, 0.28) 0%, rgba(15, 23, 42, 0.5) 50%, transparent 80%)',
    },
  },
  {
    id: 'cyber_rain',
    name: 'Esmeralda Matrix',
    swatchColor: '#059669',
    cssStyle: {
      backgroundImage: 'radial-gradient(circle at 30% 10%, rgba(16, 185, 129, 0.22) 0%, rgba(6, 78, 59, 0.3) 50%, transparent 80%)',
    },
  },
  {
    id: 'night_campus',
    name: 'Carmesí Tecsup',
    swatchColor: '#E63946',
    cssStyle: {
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(230, 57, 70, 0.24) 0%, rgba(29, 53, 87, 0.3) 50%, transparent 80%)',
    },
  },
  {
    id: 'deep_void',
    name: 'Titanio Minimal',
    swatchColor: '#475569',
    cssStyle: {
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.1) 0%, transparent 70%)',
    },
  },
  {
    id: 'hex_matrix',
    name: 'Violeta Neón',
    swatchColor: '#9333EA',
    cssStyle: {
      backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.25) 0%, rgba(37, 99, 235, 0.18) 60%, transparent 85%)',
    },
  },
];

// ============================================================================
// 4. TIPOGRAFÍA Y FAMILIA DE FUENTE (Variedad Amplia de Tipos de Letra)
// ============================================================================
export type NameFontFamily = 
  | 'default'
  | 'gamer_heavy'
  | 'cyber_mecha'
  | 'gothic_lord'
  | 'retro_pixel'
  | 'street_brush'
  | 'terminal_code'
  | 'titan_black';

export interface NameFontConfig {
  id: NameFontFamily;
  name: string;
  fontClass: string;
  description: string;
  previewSample: string;
}

export const NAME_FONT_LIST: NameFontConfig[] = [
  {
    id: 'default',
    name: 'Modern Esports',
    fontClass: 'font-name-default font-black',
    description: 'Limpio y vanguardista estilo Riot / Apple',
    previewSample: 'Gamer Pro',
  },
  {
    id: 'gothic_lord',
    name: 'Gótico Legendario',
    fontClass: 'font-name-gothic font-black tracking-wide',
    description: 'Medieval místico estilo Dark Souls / Elden Ring',
    previewSample: 'Lord Champion',
  },
  {
    id: 'cyber_mecha',
    name: 'Cyberpunk HUD',
    fontClass: 'font-name-scifi font-black tracking-wider uppercase',
    description: 'Futurista y angular estilo interfaz mecha',
    previewSample: 'CYBER 2026',
  },
  {
    id: 'gamer_heavy',
    name: 'Titán de Batalla',
    fontClass: 'font-name-gamer font-bold tracking-wide uppercase',
    description: 'Pesado, agresivo y contundente para torneos',
    previewSample: 'TITÁN PRO',
  },
  {
    id: 'retro_pixel',
    name: 'Pixel Arcade 8-Bit',
    fontClass: 'font-name-pixel text-[0.82em] tracking-tight',
    description: 'Clásico pixel art retro de maquinitas arcade',
    previewSample: 'P1 READY',
  },
  {
    id: 'street_brush',
    name: 'Graffiti Callejero',
    fontClass: 'font-name-graffiti tracking-wide',
    description: 'Trazo urbano caligráfico y rebelde',
    previewSample: 'Rebel Ink',
  },
  {
    id: 'terminal_code',
    name: 'Terminal CLI Hacker',
    fontClass: 'font-name-terminal font-bold tracking-tight',
    description: 'Monoespaciado estilo consola de programación',
    previewSample: 'root@tecsup:~#',
  },
  {
    id: 'titan_black',
    name: 'Black Impact',
    fontClass: 'font-name-impact tracking-tighter uppercase',
    description: 'Geometría sólida ultra pesada de máximo impacto',
    previewSample: 'OVERKILL',
  },
];

// Legacy aliases for backwards compatibility
export type NameTypography = NameFontFamily;
export const NAME_TYPOGRAPHIES = NAME_FONT_LIST;

// ============================================================================
// 5. PALETA DE COLORES DEL NOMBRE (Independiente del tipo de fuente)
// ============================================================================
export type NameColorPreset = 
  | 'white' 
  | 'crimson' 
  | 'gold' 
  | 'cyan' 
  | 'emerald' 
  | 'purple' 
  | 'rose' 
  | 'orange'
  | 'custom';

export interface NameColorConfig {
  id: NameColorPreset;
  name: string;
  colorHex: string;
  gradientClass?: string;
  textShadow?: string;
}

export const NAME_COLOR_PRESETS: NameColorConfig[] = [
  { 
    id: 'crimson', 
    name: 'Carmesí Fuego', 
    colorHex: '#E63946', 
    gradientClass: 'from-[#E63946] via-[#FF6B6B] to-[#FF8E71]', 
    textShadow: '0 0 14px rgba(230,57,70,0.65)' 
  },
  { 
    id: 'gold', 
    name: 'Oro Campeón', 
    colorHex: '#F59E0B', 
    gradientClass: 'from-amber-200 via-amber-400 to-amber-500', 
    textShadow: '0 0 15px rgba(245,158,11,0.65)' 
  },
  { 
    id: 'cyan', 
    name: 'Cian Zafiro', 
    colorHex: '#38BDF8', 
    gradientClass: 'from-cyan-300 via-sky-400 to-blue-500', 
    textShadow: '0 0 14px rgba(56,189,248,0.65)' 
  },
  { 
    id: 'emerald', 
    name: 'Verde Matrix', 
    colorHex: '#10B981', 
    gradientClass: 'from-emerald-300 via-emerald-400 to-teal-500', 
    textShadow: '0 0 14px rgba(16,185,129,0.65)' 
  },
  { 
    id: 'purple', 
    name: 'Púrpura Neón', 
    colorHex: '#A855F7', 
    gradientClass: 'from-purple-300 via-violet-400 to-fuchsia-500', 
    textShadow: '0 0 14px rgba(168,85,247,0.65)' 
  },
  { 
    id: 'rose', 
    name: 'Rosa Eléctrico', 
    colorHex: '#F43F5E', 
    gradientClass: 'from-pink-300 via-rose-400 to-red-500', 
    textShadow: '0 0 14px rgba(244,63,94,0.65)' 
  },
  { 
    id: 'orange', 
    name: 'Magma Solar', 
    colorHex: '#F97316', 
    gradientClass: 'from-yellow-300 via-orange-400 to-red-600', 
    textShadow: '0 0 14px rgba(249,115,22,0.65)' 
  },
  { 
    id: 'white', 
    name: 'Blanco Puro', 
    colorHex: '#FFFFFF', 
    textShadow: '0 0 10px rgba(255,255,255,0.2)' 
  },
  { 
    id: 'custom', 
    name: 'Color Hex Libre', 
    colorHex: '#E63946' 
  },
];

// ============================================================================
// 6. EFECTOS DE AUDIO RÁPIDOS (Synthesized Soundbites)
// ============================================================================
export type SoundbiteId = 'tactical_chime' | 'synthesizer_blip' | 'laser_charge' | 'victory_bell' | 'none';

export interface SoundbiteConfig {
  id: SoundbiteId;
  name: string;
  description?: string;
}

export const SOUNDBITES: SoundbiteConfig[] = [
  { id: 'synthesizer_blip', name: 'Pulso Cyber' },
  { id: 'tactical_chime', name: 'Acorde Suave' },
  { id: 'laser_charge', name: 'Láser Rápido' },
  { id: 'victory_bell', name: 'Campana Victoria' },
  { id: 'none', name: 'Silencioso' },
];

export function playCustomSoundbite(id: SoundbiteId) {
  if (typeof window === 'undefined') return;
  if (id === 'tactical_chime') sounds.playTacticalChime();
  else if (id === 'synthesizer_blip') sounds.playSynthesizerBlip();
  else if (id === 'laser_charge') sounds.playLaserCharge();
  else if (id === 'victory_bell') sounds.playVictoryBell();
}

// ============================================================================
// 7. LEGACY PINS & CARDS
// ============================================================================
export type CallingCardId = 'software_terminal' | 'mechatronics_hud' | 'networks_nodes' | 'arena_championship' | 'clash_arena' | 'dota_river' | 'cyber_neon';

export interface CallingCardConfig {
  id: CallingCardId;
  name: string;
  category: 'INGENIERÍA' | 'ARENA';
  desc: string;
  bgGradient: string;
  icon: string;
  accentColor: string;
}

export const CALLING_CARDS: CallingCardConfig[] = [
  { id: 'arena_championship', name: 'Campus Arena', category: 'ARENA', desc: 'Gran escenario oficial', bgGradient: 'linear-gradient(135deg, #1E1B4B 0%, #311042 50%, #991B1B 100%)', icon: '🏟️', accentColor: '#E63946' },
  { id: 'software_terminal', name: 'Terminal Software', category: 'INGENIERÍA', desc: 'Líneas de código', bgGradient: 'linear-gradient(135deg, #0A0F1D 0%, #0F172A 60%, #1E3A8A 100%)', icon: '💻', accentColor: '#38BDF8' },
  { id: 'mechatronics_hud', name: 'Mecatrónica', category: 'INGENIERÍA', desc: 'Robótica y control', bgGradient: 'linear-gradient(135deg, #18181B 0%, #27272A 50%, #D97706 100%)', icon: '🤖', accentColor: '#F59E0B' },
  { id: 'networks_nodes', name: 'Redes y Fibra', category: 'INGENIERÍA', desc: 'Telecomunicaciones', bgGradient: 'linear-gradient(135deg, #022C22 0%, #064E3B 60%, #047857 100%)', icon: '🌐', accentColor: '#10B981' },
  { id: 'clash_arena', name: 'Valle de Reyes', category: 'ARENA', desc: 'Duelos de estrategia', bgGradient: 'linear-gradient(135deg, #172554 0%, #1E40AF 60%, #3B82F6 100%)', icon: '👑', accentColor: '#60A5FA' },
  { id: 'dota_river', name: 'Río 5v5', category: 'ARENA', desc: 'Ancestros tácticos', bgGradient: 'linear-gradient(135deg, #450A0A 0%, #7F1D1D 60%, #B91C1C 100%)', icon: '⚔️', accentColor: '#EF4444' },
  { id: 'cyber_neon', name: 'Distrito Cyber', category: 'ARENA', desc: 'Luces nocturnas', bgGradient: 'linear-gradient(135deg, #180927 0%, #300C38 50%, #082F49 100%)', icon: '🌆', accentColor: '#C084FC' },
];

export type HonorPinId = 'campus_lima' | 'campus_aqp' | 'campus_tru' | 'pioneer_2026' | 'fair_play' | 'win_streak' | 'trophy_hunter' | 'bo3_master';

export interface HonorPin {
  id: HonorPinId;
  name: string;
  icon: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  badgeColor: string;
}

export const HONOR_PINS: HonorPin[] = [
  { id: 'campus_lima', name: 'Sede Lima', icon: '🏛️', description: 'Campus Santa Anita', rarity: 'COMMON', badgeColor: '#E63946' },
  { id: 'pioneer_2026', name: 'Pionero 2026', icon: '🚀', description: 'Temporada Inaugural', rarity: 'RARE', badgeColor: '#8B5CF6' },
  { id: 'fair_play', name: 'Juego Limpio', icon: '🛡️', description: 'Fair Play Oficial', rarity: 'RARE', badgeColor: '#10B981' },
  { id: 'campus_aqp', name: 'Sede Arequipa', icon: '🌋', description: 'Ciudad Blanca', rarity: 'COMMON', badgeColor: '#F59E0B' },
  { id: 'campus_tru', name: 'Sede Trujillo', icon: '🌊', description: 'Costa Norte', rarity: 'COMMON', badgeColor: '#3B82F6' },
  { id: 'win_streak', name: 'Racha Imparable', icon: '🔥', description: 'Racha de Victorias', rarity: 'RARE', badgeColor: '#EC4899' },
  { id: 'bo3_master', name: 'Maestro Bo3', icon: '⚡', description: 'Estratega Bo3', rarity: 'LEGENDARY', badgeColor: '#06B6D4' },
];

// ============================================================================
// 8. ESTADO DE PERSONALIZACIÓN COMPLETO
// ============================================================================
export interface ProfileCustomizationState {
  wallpaper: ProfileWallpaper;
  material: CardMaterial;
  avatarFrame: AvatarFrame;
  nameTypography: NameFontFamily;
  nameColorPreset: NameColorPreset;
  nameCustomColor?: string;
  favoriteGames: GameCode[];
  soundbite: SoundbiteId;
  callingCard?: CallingCardId;
  pinnedPins?: HonorPinId[];
  warCry?: string;
}

export const ADMIN_USER_ID = '085e111e-7018-4f40-b9aa-96456652f3dd';

/**
 * Admin Official Preset: Custom Ink Brush Avatar Frame + Steam Animated Backgrounds
 */
export const ADMIN_PROFILE_PRESET: ProfileCustomizationState = {
  wallpaper: 'steam_space_voyage',
  material: 'steam_neon_shrine',
  avatarFrame: 'admin_brush',
  nameTypography: 'gothic_lord',
  nameColorPreset: 'crimson',
  nameCustomColor: '#E63946',
  favoriteGames: ['BRAWL_STARS', 'CLASH_ROYALE', 'SMASH_ULTIMATE'],
  soundbite: 'synthesizer_blip',
  callingCard: 'arena_championship',
  pinnedPins: ['campus_lima', 'pioneer_2026'],
  warCry: 'Administrador Oficial Campus Arena',
};

export const DEFAULT_CUSTOMIZATION: ProfileCustomizationState = {
  wallpaper: 'nebula_sapphire',
  material: 'sapphire_glass',
  avatarFrame: 'pcb_circuit',
  nameTypography: 'default',
  nameColorPreset: 'crimson',
  nameCustomColor: '#E63946',
  favoriteGames: ['CLASH_ROYALE', 'BRAWL_STARS'],
  soundbite: 'synthesizer_blip',
  callingCard: 'software_terminal',
  pinnedPins: ['campus_lima', 'pioneer_2026'],
  warCry: '',
};

/**
 * Presets registry by User ID (Ensures admin and key competitors reflect their styles everywhere)
 */
export const USER_PROFILE_PRESETS: Record<string, Partial<ProfileCustomizationState>> = {
  [ADMIN_USER_ID]: ADMIN_PROFILE_PRESET,
};

export function getActiveSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('campus_token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.sub || payload.id || null;
    }
  } catch {
    return null;
  }
  return null;
}

const ADMIN_STORAGE_KEY = 'campus_arena_admin_preset_v5';
const USER_STORAGE_KEY_V5 = 'campus_arena_profile_customization_v5';
const USER_STORAGE_KEY_V4 = 'campus_arena_profile_customization_v4';
const STORAGE_KEY = 'campus_arena_profile_customization_v3';
const LEGACY_STORAGE_KEY_V2 = 'campus_arena_profile_customization_v2';
const LEGACY_STORAGE_KEY_V1 = 'campus_arena_profile_customization_v1';

const MATERIAL_IDS = new Set(CARD_MATERIALS.map((m) => m.id));
const AVATAR_FRAME_IDS = new Set(AVATAR_FRAMES.map((f) => f.id));
const WALLPAPER_IDS = new Set(PROFILE_WALLPAPERS.map((w) => w.id));
const FONT_IDS = new Set(NAME_FONT_LIST.map((f) => f.id));
const COLOR_PRESET_IDS = new Set(NAME_COLOR_PRESETS.map((c) => c.id));
const SOUNDBITE_IDS = new Set(SOUNDBITES.map((s) => s.id));

export function getProfileCustomization(userId?: string): ProfileCustomizationState {
  const currentSessionId = getActiveSessionUserId();
  const effectiveUserId = userId || currentSessionId || undefined;
  const isAdmin = effectiveUserId === ADMIN_USER_ID;

  // Code preset takes definitive baseline precedence for registered users
  const preset = (effectiveUserId && USER_PROFILE_PRESETS[effectiveUserId]) 
    ? USER_PROFILE_PRESETS[effectiveUserId] 
    : (isAdmin ? ADMIN_PROFILE_PRESET : null);

  const baseDefault = preset ? { ...DEFAULT_CUSTOMIZATION, ...preset } : DEFAULT_CUSTOMIZATION;

  if (typeof window === 'undefined') return baseDefault;
  try {
    // If user is Admin, isolate storage so old non-admin cached state cannot override code preset
    if (isAdmin) {
      const adminRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (!adminRaw) {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(ADMIN_PROFILE_PRESET));
        return ADMIN_PROFILE_PRESET;
      }
      const parsed = JSON.parse(adminRaw);
      return {
        ...ADMIN_PROFILE_PRESET,
        ...parsed,
        pinnedPins: (Array.isArray(parsed.pinnedPins) ? parsed.pinnedPins : ADMIN_PROFILE_PRESET.pinnedPins)
          .filter((p: string) => p !== 'fair_play')
          .slice(0, 3),
        avatarFrame: parsed.avatarFrame || 'admin_brush',
        material: parsed.material || 'steam_neon_shrine',
        wallpaper: parsed.wallpaper || 'steam_space_voyage',
      };
    }

    const raw = localStorage.getItem(USER_STORAGE_KEY_V5) || localStorage.getItem(USER_STORAGE_KEY_V4) || localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_V2) || localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (!raw) {
      if (preset) {
        localStorage.setItem(USER_STORAGE_KEY_V5, JSON.stringify(baseDefault));
      }
      return baseDefault;
    }
    const parsed = JSON.parse(raw);

    const validGames: GameCode[] = Array.isArray(parsed.favoriteGames) && parsed.favoriteGames.length > 0
      ? parsed.favoriteGames.slice(0, 4)
      : baseDefault.favoriteGames;

    return {
      wallpaper: WALLPAPER_IDS.has(parsed.wallpaper) ? parsed.wallpaper : baseDefault.wallpaper,
      material: MATERIAL_IDS.has(parsed.material) ? parsed.material : baseDefault.material,
      avatarFrame: AVATAR_FRAME_IDS.has(parsed.avatarFrame) ? parsed.avatarFrame : baseDefault.avatarFrame,
      nameTypography: FONT_IDS.has(parsed.nameTypography) ? parsed.nameTypography : baseDefault.nameTypography,
      nameColorPreset: COLOR_PRESET_IDS.has(parsed.nameColorPreset) ? parsed.nameColorPreset : baseDefault.nameColorPreset,
      nameCustomColor: typeof parsed.nameCustomColor === 'string' ? parsed.nameCustomColor : baseDefault.nameCustomColor,
      favoriteGames: validGames,
      soundbite: SOUNDBITE_IDS.has(parsed.soundbite) ? parsed.soundbite : baseDefault.soundbite,
      callingCard: parsed.callingCard || baseDefault.callingCard,
      pinnedPins: (Array.isArray(parsed.pinnedPins) ? parsed.pinnedPins : baseDefault.pinnedPins)
        .filter((p: string) => p !== 'fair_play')
        .slice(0, 3),
      warCry: parsed.warCry || baseDefault.warCry,
    };
  } catch {
    return baseDefault;
  }
}

export function saveProfileCustomization(state: Partial<ProfileCustomizationState>, userId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const effectiveUserId = userId || getActiveSessionUserId() || undefined;
    const isAdmin = effectiveUserId === ADMIN_USER_ID;
    const current = getProfileCustomization(effectiveUserId);
    const updated = { ...current, ...state };
    if (isAdmin) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
    } else {
      localStorage.setItem(USER_STORAGE_KEY_V5, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to save profile customization:', err);
  }
}

/**
 * Returns the CSS styling and classNames for a competitor name
 * so that custom font and custom color reflect universally across rankings, forums and profiles.
 */
export function getCompetitorNameStyle(
  userId?: string, 
  customizationOverride?: Partial<ProfileCustomizationState> | null
): { className: string; style: React.CSSProperties } {
  const effectiveUserId = userId || getActiveSessionUserId() || undefined;
  const custom = customizationOverride || getProfileCustomization(effectiveUserId);
  
  const fontConfig = NAME_FONT_LIST.find((f) => f.id === custom.nameTypography) || NAME_FONT_LIST[0];
  const colorPreset = NAME_COLOR_PRESETS.find((c) => c.id === custom.nameColorPreset) || NAME_COLOR_PRESETS[0];

  let colorClass = '';
  const inlineStyle: React.CSSProperties = {};

  if (custom.nameColorPreset === 'custom' && custom.nameCustomColor) {
    inlineStyle.color = custom.nameCustomColor;
    inlineStyle.textShadow = `0 0 12px ${custom.nameCustomColor}88`;
  } else if (colorPreset.gradientClass) {
    colorClass = `text-transparent bg-clip-text bg-gradient-to-r ${colorPreset.gradientClass}`;
    if (colorPreset.textShadow) {
      inlineStyle.filter = `drop-shadow(${colorPreset.textShadow})`;
    }
  } else {
    inlineStyle.color = colorPreset.colorHex;
    if (colorPreset.textShadow) {
      inlineStyle.textShadow = colorPreset.textShadow;
    }
  }

  return {
    className: `${fontConfig.fontClass} ${colorClass}`.trim(),
    style: inlineStyle,
  };
}
