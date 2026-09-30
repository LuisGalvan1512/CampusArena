'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Swords, 
  Trophy, 
  Users, 
  Radio, 
  Award, 
  User, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
  Crosshair,
  Gamepad2,
  CircleDot
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { sounds } from '@/lib/sound';
import { fireCelebration } from '@/lib/confetti';
import { useAuth } from '@/context/AuthContext';
import { GAME_LIST } from '@/lib/games';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navegación' | 'Juegos' | 'Acciones';
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keydown Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) sounds.playWhoosh();
          return !prev;
        });
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Command items
  const items: PaletteItem[] = [
    // Navigation
    {
      id: 'nav-tournaments',
      title: 'Explorar Torneos',
      subtitle: 'Ver catálogo de torneos oficiales y registrarse',
      category: 'Navegación',
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
      action: () => router.push('/tournaments'),
    },
    {
      id: 'nav-community',
      title: 'Comunidad & Feed',
      subtitle: 'Ver posts, memes, debates y fotos de la comunidad',
      category: 'Navegación',
      icon: <Users className="w-4 h-4 text-sky-500" />,
      action: () => router.push('/community'),
    },
    {
      id: 'nav-ranking',
      title: 'Tabla de Posiciones (Ranking)',
      subtitle: 'Líderes de copas y trofeos en Tecsup',
      category: 'Navegación',
      icon: <Award className="w-4 h-4 text-emerald-500" />,
      action: () => router.push('/ranking'),
    },
    {
      id: 'nav-live',
      title: 'Transmisión Oficial En Vivo',
      subtitle: 'Ver streaming activo en Kick, YouTube o TikTok',
      category: 'Navegación',
      icon: <Radio className="w-4 h-4 text-red-500 animate-pulse" />,
      action: () => router.push('/live'),
    },
    {
      id: 'nav-profile',
      title: 'Mi Perfil de Competidor',
      subtitle: 'Ver estadísticas, insignias, copas y muro personal',
      category: 'Navegación',
      icon: <User className="w-4 h-4 text-indigo-500" />,
      action: () => router.push('/profile'),
    },
    ...(user?.role === 'ADMIN' ? [{
      id: 'nav-admin',
      title: 'Panel de Administración Tecsup',
      subtitle: 'Gestión de organizadores y moderación',
      category: 'Navegación' as const,
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      action: () => router.push('/admin/organizers'),
    }] : []),
    ...(['ORGANIZER', 'ADMIN'].includes(user?.role || '') ? [{
      id: 'nav-organizer',
      title: 'Dashboard de Organizador',
      subtitle: 'Validación de pagos Yape/Plin y gestión de brackets',
      category: 'Navegación' as const,
      icon: <Swords className="w-4 h-4 text-blue-500" />,
      action: () => router.push('/dashboard/organizer'),
    }] : []),

    // Games (all 7 official disciplines)
    ...GAME_LIST.map((game) => ({
      id: `game-${game.code.toLowerCase()}`,
      title: game.name,
      subtitle: `${game.badge} • ${game.description.slice(0, 60)}...`,
      category: 'Juegos' as const,
      icon: game.logoUrl ? (
        <img src={game.logoUrl} alt={game.name} className="w-4 h-4 object-contain" />
      ) : (
        <Gamepad2 className="w-4 h-4" style={{ color: game.color }} />
      ),
      action: () => router.push(`/tournaments?game_code=${game.code}`),
    })),

    // Actions
    {
      id: 'act-theme',
      title: theme === 'dark' ? 'Cambiar a Modo Claro (Warm Slate)' : 'Cambiar a Modo Oscuro (Titanio)',
      subtitle: 'Alternar aspecto visual de la plataforma',
      category: 'Acciones',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        sounds.playClick();
      },
    },
    {
      id: 'act-sound',
      title: sounds.isMuted() ? 'Activar Efectos de Sonido Gamer' : 'Silenciar Efectos de Sonido',
      subtitle: 'Audio sintetizado para clics, victorias y fanfarrias',
      category: 'Acciones',
      icon: sounds.isMuted() ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-400" />,
      action: () => {
        sounds.toggleMute();
      },
    },
    {
      id: 'act-confetti',
      title: 'Lanzar Celebración 🎉',
      subtitle: 'Disparar fuegos artificiales de confeti en pantalla',
      category: 'Acciones',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      action: () => {
        fireCelebration();
        sounds.playFanfare();
      },
    },
  ];

  // Filter items based on user query
  const filteredItems = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: PaletteItem) => {
    sounds.playClick();
    setIsOpen(false);
    item.action();
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-xl arena-card bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-card)]">
                <Search className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDownInInput}
                  placeholder="Escribe un comando, torneo o disciplina..."
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--text-secondary)] bg-[var(--bg-arena)] border border-[var(--border-card)] rounded-md">
                  ESC
                </kbd>
              </div>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                    No se encontraron comandos o torneos para &quot;{query}&quot;
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[var(--accent-red)] text-white shadow-md'
                            : 'hover:bg-[var(--bg-arena)] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[var(--bg-arena)] border border-[var(--border-card)]'
                          }`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${
                              isSelected ? 'text-white' : 'text-[var(--text-primary)]'
                            }`}>
                              {item.title}
                            </p>
                            <p className={`text-[10px] truncate ${
                              isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'
                            }`}>
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] border border-[var(--border-card)]'
                          }`}>
                            {item.category}
                          </span>
                          <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[var(--text-secondary)] opacity-0 group-hover:opacity-100'}`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 bg-[var(--bg-arena)] border-t border-[var(--border-card)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Navegar con <kbd className="px-1.5 py-0.5 font-mono text-[9px] bg-[var(--bg-card)] border border-[var(--border-card)] rounded">↑</kbd> <kbd className="px-1.5 py-0.5 font-mono text-[9px] bg-[var(--bg-card)] border border-[var(--border-card)] rounded">↓</kbd></span>
                <span>Seleccionar <kbd className="px-1.5 py-0.5 font-mono text-[9px] bg-[var(--bg-card)] border border-[var(--border-card)] rounded">ENTER</kbd></span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
