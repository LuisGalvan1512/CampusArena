import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor = 'red' | 'blue' | 'purple' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'lime';
export type StatusMood = 'online' | 'competing' | 'training' | 'resting' | 'looking_for_team';
export type CardEffect = 'none' | 'holographic' | 'glow' | 'neon' | 'gradient';

export const ACCENT_COLORS: Record<AccentColor, { name: string; hex: string; tw: string; gradient: string }> = {
  red: { name: 'Rojo Arena', hex: '#E63946', tw: 'text-red-500', gradient: 'from-red-500 to-rose-600' },
  blue: { name: 'Azul Estratega', hex: '#3B82F6', tw: 'text-blue-500', gradient: 'from-blue-500 to-indigo-600' },
  purple: { name: 'Violeta Místico', hex: '#8B5CF6', tw: 'text-purple-500', gradient: 'from-purple-500 to-violet-600' },
  emerald: { name: 'Esmeralda Táctico', hex: '#10B981', tw: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  amber: { name: 'Dorado Campeón', hex: '#F59E0B', tw: 'text-amber-500', gradient: 'from-amber-500 to-orange-600' },
  cyan: { name: 'Cyan Digital', hex: '#06B6D4', tw: 'text-cyan-500', gradient: 'from-cyan-500 to-sky-600' },
  rose: { name: 'Rosa Neón', hex: '#F43F5E', tw: 'text-rose-500', gradient: 'from-rose-500 to-pink-600' },
  lime: { name: 'Verde Respawn', hex: '#84CC16', tw: 'text-lime-500', gradient: 'from-lime-500 to-green-600' },
};

export const STATUS_MOODS: Record<StatusMood, { label: string; emoji: string; color: string }> = {
  online: { label: 'En línea', emoji: '🟢', color: 'text-emerald-400' },
  competing: { label: 'Compitiendo', emoji: '⚔️', color: 'text-red-400' },
  training: { label: 'Entrenando', emoji: '🎯', color: 'text-amber-400' },
  resting: { label: 'Descansando', emoji: '😴', color: 'text-slate-400' },
  looking_for_team: { label: 'Buscando equipo', emoji: '🔎', color: 'text-cyan-400' },
};

export const CARD_EFFECTS: Record<CardEffect, { name: string; desc: string }> = {
  none: { name: 'Sin efecto', desc: 'Limpio y minimalista' },
  holographic: { name: 'Holográfico', desc: 'Reflejos de arcoíris premium' },
  glow: { name: 'Resplandor', desc: 'Brillo suave de neón' },
  neon: { name: 'Neón Cyberpunk', desc: 'Bordes eléctricos intensos' },
  gradient: { name: 'Gradiente Dinámico', desc: 'Degradado animado de colores' },
};

interface ProfileCustomization {
  accentColor: AccentColor;
  statusMood: StatusMood;
  customTitle: string;
  cardEffect: CardEffect;
  showBadgeAnimations: boolean;
  profileBio: string;
  setAccentColor: (color: AccentColor) => void;
  setStatusMood: (mood: StatusMood) => void;
  setCustomTitle: (title: string) => void;
  setCardEffect: (effect: CardEffect) => void;
  setShowBadgeAnimations: (show: boolean) => void;
  setProfileBio: (bio: string) => void;
}

export const useProfileCustomization = create<ProfileCustomization>()(
  persist(
    (set) => ({
      accentColor: 'red',
      statusMood: 'online',
      customTitle: '',
      cardEffect: 'holographic',
      showBadgeAnimations: true,
      profileBio: '',
      setAccentColor: (color) => set({ accentColor: color }),
      setStatusMood: (mood) => set({ statusMood: mood }),
      setCustomTitle: (title) => set({ customTitle: title }),
      setCardEffect: (effect) => set({ cardEffect: effect }),
      setShowBadgeAnimations: (show) => set({ showBadgeAnimations: show }),
      setProfileBio: (bio) => set({ profileBio: bio }),
    }),
    {
      name: 'campus-arena-profile-customization',
    }
  )
);
