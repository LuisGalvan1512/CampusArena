import type { LucideIcon } from 'lucide-react';

/**
 * Game type codes supported by Campus Arena.
 */
export type GameCode = 'CLASH_ROYALE' | 'BRAWL_STARS' | 'SMASH_ULTIMATE' | 'LEFT_4_DEAD_2' | 'EFOOTBALL' | 'DOTA_2' | 'FORTNITE';

/**
 * How the game account is linked / verified.
 * - supercell: verified via Supercell API (Player Tag)
 * - steam: verified via Steam Web API (Steam ID)
 * - manual: user self-reports username + optional metadata
 */
export type TagType = 'supercell' | 'steam' | 'manual';

export interface GameDefinition {
  code: GameCode;
  name: string;
  shortName: string;
  /** Lucide icon name */
  iconName: string;
  /** Official game transparent logo / emblem */
  logoUrl: string;
  /** Official high-res game banner / key art */
  bannerUrl: string;
  /** Fallback remote logo URL */
  remoteLogoUrl: string;
  /** Fallback remote banner URL */
  remoteBannerUrl: string;
  color: string;
  colorSecondary: string;
  bgGradient: string;
  shadowColor: string;
  tagType: TagType;
  tagLabel: string;
  tagPlaceholder: string;
  statLabel: string;
  statIcon: string;
  description: string;
  badge: string;
  /** Extra fields to show in the manual linking form */
  extraFields?: { key: string; label: string; placeholder: string; required?: boolean }[];
}

export const GAME_CATALOG: Record<GameCode, GameDefinition> = {
  CLASH_ROYALE: {
    code: 'CLASH_ROYALE',
    name: 'Clash Royale',
    shortName: 'CR',
    iconName: 'Swords',
    logoUrl: '/games/clash_royale_logo.webp',
    bannerUrl: '/games/clash_royale_banner.jpg',
    remoteLogoUrl: 'https://supercell.com/images/53c91cc7ddf17d5b6fa13cae4762af1b/main_logo_clashroyale.5e3fbb70__1_.webp',
    remoteBannerUrl: 'https://supercell.com/images/c96611b5b4ccd331e2b4dcb797811894/hero_bg_clashroyale.612fcf42.jpg',
    color: '#E63946',
    colorSecondary: '#1D3557',
    bgGradient: 'from-[#E63946] to-[#1D3557]',
    shadowColor: 'rgba(230, 57, 70, 0.3)',
    tagType: 'supercell',
    tagLabel: 'Player Tag',
    tagPlaceholder: '#8YRP92VJ',
    statLabel: 'Copas',
    statIcon: 'Trophy',
    description: 'Formato 1vs1 al mejor de 3 (BO3). Validación automática de Player Tags con la API oficial de Supercell.',
    badge: '1 vs 1 Oficial',
  },
  BRAWL_STARS: {
    code: 'BRAWL_STARS',
    name: 'Brawl Stars',
    shortName: 'BS',
    iconName: 'Gamepad2',
    logoUrl: '/games/brawl_stars_logo.png',
    bannerUrl: '/games/brawl_stars_banner.jpg',
    remoteLogoUrl: 'https://supercell.com/images/0f037a93198129e58a26e509722f04a7/output.png',
    remoteBannerUrl: 'https://supercell.com/images/1a5b69311180a4a1c374e10556941f05/hero_bg_brawlstars.a385872a.jpg',
    color: '#457B9D',
    colorSecondary: '#1D3557',
    bgGradient: 'from-[#457B9D] to-[#1D3557]',
    shadowColor: 'rgba(69, 123, 157, 0.3)',
    tagType: 'supercell',
    tagLabel: 'Player Tag',
    tagPlaceholder: '#2PP009Y9',
    statLabel: 'Copas',
    statIcon: 'Trophy',
    description: 'Modalidades Atrapagemas, Balón Brawl y Duelos. Conexión directa con la API oficial de Supercell.',
    badge: '3 vs 3 y Duelos',
  },
  SMASH_ULTIMATE: {
    code: 'SMASH_ULTIMATE',
    name: 'Super Smash Bros',
    shortName: 'SSBU',
    iconName: 'Zap',
    logoUrl: '/games/smash_ultimate_logo.png',
    bannerUrl: '/games/smash_ultimate_banner.jpg',
    remoteLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Super_Smash_Bros._Ultimate_Logo.png',
    remoteBannerUrl: 'https://www.smashbros.com/assets_v2/img/top/hero01_en.jpg',
    color: '#FF6B35',
    colorSecondary: '#D62839',
    bgGradient: 'from-[#FF6B35] to-[#D62839]',
    shadowColor: 'rgba(255, 107, 53, 0.3)',
    tagType: 'manual',
    tagLabel: 'Nombre de Jugador',
    tagPlaceholder: 'LuisSmash99',
    statLabel: 'Personaje Main',
    statIcon: 'Zap',
    description: 'Torneos presenciales 1vs1 en formato doble eliminación. Nintendo Switch en modo local o LAN.',
    badge: '1 vs 1 Presencial',
    extraFields: [
      { key: 'main_character', label: 'Personaje Main', placeholder: 'Ej: Mario, Link, Joker...', required: true },
    ],
  },
  LEFT_4_DEAD_2: {
    code: 'LEFT_4_DEAD_2',
    name: 'Left 4 Dead 2',
    shortName: 'L4D2',
    iconName: 'Crosshair',
    logoUrl: '/games/left_4_dead_2_logo.png',
    bannerUrl: '/games/left_4_dead_2_banner.jpg',
    remoteLogoUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/550/logo.png',
    remoteBannerUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/550/header.jpg',
    color: '#4CAF50',
    colorSecondary: '#1B5E20',
    bgGradient: 'from-[#4CAF50] to-[#1B5E20]',
    shadowColor: 'rgba(76, 175, 80, 0.3)',
    tagType: 'steam',
    tagLabel: 'Steam ID',
    tagPlaceholder: '76561198XXXXXXXXX',
    statLabel: 'Horas Jugadas',
    statIcon: 'Clock',
    description: 'Cooperativo 4vs4 en modo Versus. Vinculación automática vía Steam Web API con verificación de perfil.',
    badge: '4 vs 4 Versus',
  },
  EFOOTBALL: {
    code: 'EFOOTBALL',
    name: 'eFootball',
    shortName: 'eFB',
    iconName: 'CircleDot',
    logoUrl: '/games/efootball_logo.jpg',
    bannerUrl: '/games/efootball_banner.jpg',
    remoteLogoUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1665460/capsule_616x353.jpg',
    remoteBannerUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1665460/header.jpg',
    color: '#2196F3',
    colorSecondary: '#0D47A1',
    bgGradient: 'from-[#2196F3] to-[#0D47A1]',
    shadowColor: 'rgba(33, 150, 243, 0.3)',
    tagType: 'manual',
    tagLabel: 'Konami ID / Usuario',
    tagPlaceholder: 'LuisFutbol_10',
    statLabel: 'División',
    statIcon: 'Award',
    description: 'Partidos 1vs1 en formato liga y eliminación directa. Registro manual de equipo y división competitiva.',
    badge: '1 vs 1 Liga',
    extraFields: [
      { key: 'team_name', label: 'Equipo Principal', placeholder: 'Ej: FC Barcelona, Real Madrid...', required: true },
      { key: 'division', label: 'División Actual', placeholder: 'Ej: División 1, División 2...', required: false },
    ],
  },
  DOTA_2: {
    code: 'DOTA_2',
    name: 'Dota 2',
    shortName: 'DOTA',
    iconName: 'Swords',
    logoUrl: '/games/dota_2_logo.png',
    bannerUrl: '/games/dota_2_banner.jpg',
    remoteLogoUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/logo.png',
    remoteBannerUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
    color: '#D32F2F',
    colorSecondary: '#B71C1C',
    bgGradient: 'from-[#D32F2F] to-[#B71C1C]',
    shadowColor: 'rgba(211, 47, 47, 0.3)',
    tagType: 'manual',
    tagLabel: 'Steam ID / Nickname',
    tagPlaceholder: 'Ej: Arteezy / 76561197960287930',
    statLabel: 'Horas / Rango',
    statIcon: 'Trophy',
    description: 'Torneos clásicos 5vs5 en modo Capitán. Únete con tu equipo y domina el mapa.',
    badge: '5 vs 5 Oficial',
  },
  FORTNITE: {
    code: 'FORTNITE',
    name: 'Fortnite',
    shortName: 'FN',
    iconName: 'Crosshair',
    logoUrl: '/games/fortnite_logo.png',
    bannerUrl: '/games/fortnite_banner.jpg',
    remoteLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Fortnite_F_lettermark_logo.png',
    remoteBannerUrl: 'https://cdn-live.prm.ol.epicgames.com/prod/c9d5be52e48745d9b71b43693015543b.jpeg?width=1920&height=1080&aspect=fill',
    color: '#9C27B0',
    colorSecondary: '#4A148C',
    bgGradient: 'from-[#9C27B0] to-[#4A148C]',
    shadowColor: 'rgba(156, 39, 176, 0.3)',
    tagType: 'manual',
    tagLabel: 'Epic Games ID',
    tagPlaceholder: 'Ej: Ninja_Tecsup',
    statLabel: 'Plataforma / Rango',
    statIcon: 'Zap',
    description: 'Battle Royale en modalidades Individual (Solos), Dúos (2v2), Tríos (3v3) o Escuadras (4v4). Puntos por victoria y eliminaciones.',
    badge: 'Solos, Dúos y Escuadras',
  },
};

/**
 * High-res official banner preset mapping by game code.
 */
export const GAME_BANNER_PRESETS: Record<string, string> = {
  CLASH_ROYALE: GAME_CATALOG.CLASH_ROYALE.bannerUrl,
  BRAWL_STARS: GAME_CATALOG.BRAWL_STARS.bannerUrl,
  SMASH_ULTIMATE: GAME_CATALOG.SMASH_ULTIMATE.bannerUrl,
  LEFT_4_DEAD_2: GAME_CATALOG.LEFT_4_DEAD_2.bannerUrl,
  EFOOTBALL: GAME_CATALOG.EFOOTBALL.bannerUrl,
  DOTA_2: GAME_CATALOG.DOTA_2.bannerUrl,
  FORTNITE: GAME_CATALOG.FORTNITE.bannerUrl,
};

/**
 * Ordered list for display purposes
 */
export const GAME_LIST: GameDefinition[] = [
  GAME_CATALOG.CLASH_ROYALE,
  GAME_CATALOG.BRAWL_STARS,
  GAME_CATALOG.SMASH_ULTIMATE,
  GAME_CATALOG.LEFT_4_DEAD_2,
  GAME_CATALOG.EFOOTBALL,
  GAME_CATALOG.DOTA_2,
  GAME_CATALOG.FORTNITE,
];

/**
 * Get the display name of a game by its code
 */
export function getGameName(code: string): string {
  return (GAME_CATALOG as Record<string, GameDefinition>)[code]?.name ?? code;
}

/**
 * Get the game definition by its code
 */
export function getGame(code: string): GameDefinition | undefined {
  return (GAME_CATALOG as Record<string, GameDefinition>)[code];
}

