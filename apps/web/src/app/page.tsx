'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, Variants, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Trophy, 
  Swords, 
  Gamepad2, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Crosshair, 
  CircleDot, 
  Wifi, 
  Sparkles, 
  MapPin, 
  Building2, 
  Users, 
  Medal, 
  Target, 
  Shield, 
  Rocket, 
  Crown, 
  ChevronRight, 
  Heart, 
  Volume2, 
  Share2, 
  Clock, 
  Loader2,
  Dice5,
  RotateCw,
  Copy,
  PartyPopper,
  HelpCircle,
  Vote,
  Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { GAME_LIST, GAME_CATALOG, type GameCode } from '@/lib/games';
import { sounds } from '@/lib/sound';
import { fireCelebration } from '@/lib/confetti';
import { toast } from 'sonner';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { SpotlightCard } from '@/components/SpotlightCard';

// Subtle physics-based motion variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 350, damping: 28 } 
  }
};

// Initial Campus Rivalry Data
const INITIAL_CAMPUS_CHEERS = {
  Lima: 1420,
  Arequipa: 1285,
  Trujillo: 1140,
};

// Fun Campus Gaming Challenges for the Roulette
const CAMPUS_CHALLENGES = [
  {
    gameCode: 'BRAWL_STARS' as GameCode,
    title: 'Desafío Trío de Carrera',
    desc: 'Arma una escuadra 3v3 de Brawl Stars con compañeros de tu misma carrera y gana 2 partidas en Balón Brawl.',
    badge: 'Fácil • 15 min',
    emoji: '⭐'
  },
  {
    gameCode: 'CLASH_ROYALE' as GameCode,
    title: 'Duelo de Laboratorio',
    desc: 'Reta a un compañero de aula en sala amistosa estándar. ¡El perdedor invita el almuerzo en la cafetería!',
    badge: 'Duelo 1v1',
    emoji: '👑'
  },
  {
    gameCode: 'VALORANT' as GameCode,
    title: 'Defensa de Servidores',
    desc: 'Gana una ronda en sala personalizada usando solo pistolas con tu dúo de ingeniería.',
    badge: 'Precisión',
    emoji: '🎯'
  },
  {
    gameCode: 'DOTA_2' as GameCode,
    title: 'Batalla de Algoritmos',
    desc: 'Elige un héroe de fuerza y asegura la primera sangre antes de los primeros 5 minutos.',
    badge: 'Estrategia',
    emoji: '⚡'
  },
  {
    gameCode: 'EAFC_25' as GameCode,
    title: 'Clásico Universitario',
    desc: 'Juega un partido ida y vuelta de FIFA/EAFC. Si empatan en los 90 min, define por penales directos.',
    badge: 'Fútbol Gamer',
    emoji: '⚽'
  },
  {
    gameCode: 'FREE_FIRE' as GameCode,
    title: 'Booyah en Recreo',
    desc: 'Consigue un Top 3 en Duelo de Escuadras jugando desde el patio central del campus.',
    badge: 'Battle Royale',
    emoji: '🔥'
  }
];

// Initial Game Votes for Pre-Season
const INITIAL_GAME_VOTES: Record<string, number> = {
  BRAWL_STARS: 384,
  VALORANT: 512,
  CLASH_ROYALE: 420,
  DOTA_2: 345,
  EAFC_25: 290
};

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  // Dynamic Real Tournament State
  const [featuredTournament, setFeaturedTournament] = useState<any | null>(null);
  const [isLoadingTournament, setIsLoadingTournament] = useState(true);

  // Interactive Battle Station Discipline (defaults to Brawl Stars)
  const [selectedDiscipline, setSelectedDiscipline] = useState<GameCode>('BRAWL_STARS');

  // Campus Rivalry Cheers State
  const [campusCheers, setCampusCheers] = useState(INITIAL_CAMPUS_CHEERS);

  // Challenge Roulette State
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(CAMPUS_CHALLENGES[0]);

  // Game Poll Voting State
  const [gameVotes, setGameVotes] = useState(INITIAL_GAME_VOTES);
  const [hasVotedGame, setHasVotedGame] = useState<string | null>(null);

  // Scroll Parallax Hooks for the Hero
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 400], [0, 40]);
  const heroParallaxOpacity = useTransform(scrollY, [0, 400], [1, 0.85]);

  // Fetch REAL active tournaments from backend API
  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoadingTournament(true);
      try {
        const res = await api.get('/tournaments');
        if (res.success && res.data?.items && res.data.items.length > 0) {
          // Find tournament with registration open or in progress, or fallback to first
          const openTour = res.data.items.find(
            (t: any) => t.status === 'REGISTRATION_OPEN' || t.status === 'IN_PROGRESS'
          ) || res.data.items[0];
          setFeaturedTournament(openTour);
          if (openTour.game_code && GAME_CATALOG[openTour.game_code as GameCode]) {
            setSelectedDiscipline(openTour.game_code as GameCode);
          }
        } else {
          setFeaturedTournament(null);
        }
      } catch (err) {
        console.error('Error fetching tournaments for home:', err);
        setFeaturedTournament(null);
      } finally {
        setIsLoadingTournament(false);
      }
    };

    fetchTournaments();
  }, []);

  // Campus Cheer Handler
  const handleCheerCampus = (campusKey: 'Lima' | 'Arequipa' | 'Trujillo') => {
    sounds.playSuccess();
    fireCelebration();
    setCampusCheers(prev => ({
      ...prev,
      [campusKey]: prev[campusKey] + 1
    }));
    toast.success(`¡+1 Punto de Aliento sumado para Sede ${campusKey}! 🏆`);
  };

  // Game Discipline Selector Handler
  const handleSelectGameDiscipline = (code: GameCode) => {
    sounds.playClick();
    setSelectedDiscipline(code);
  };

  // Challenge Roulette Spinner Handler
  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sounds.playClick();

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const randomIdx = Math.floor(Math.random() * CAMPUS_CHALLENGES.length);
      setCurrentChallenge(CAMPUS_CHALLENGES[randomIdx]);
      sounds.playClick();

      if (counter > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        sounds.playSuccess();
        fireCelebration();
        toast.success('¡Nuevo reto de la Arena seleccionado! 🎯');
      }
    }, 100);
  };

  // Copy challenge to clipboard
  const handleCopyChallenge = () => {
    sounds.playClick();
    const text = `🏆 ¡Reto Campus Arena Tecsup!\n\n${currentChallenge.emoji} ${currentChallenge.title}\n${currentChallenge.desc}\n\nCompite en https://campusarena.tecsup.edu.pe`;
    navigator.clipboard.writeText(text);
    toast.success('¡Reto copiado al portapapeles! Compártelo con tu escuadra.');
  };

  // Vote for next game
  const handleVoteGame = (gameCode: string) => {
    if (hasVotedGame) {
      toast.info('Ya registraste tu voto para la próxima copa. ¡Gracias por participar!');
      return;
    }
    sounds.playSuccess();
    fireCelebration();
    setHasVotedGame(gameCode);
    setGameVotes(prev => ({
      ...prev,
      [gameCode]: (prev[gameCode] || 0) + 1
    }));
    const gameName = GAME_CATALOG[gameCode as GameCode]?.name || gameCode;
    toast.success(`¡Voto registrado para ${gameName}! 🎉`);
  };

  // Calculate rivalry percentages
  const totalCheers = campusCheers.Lima + campusCheers.Arequipa + campusCheers.Trujillo;
  const limaPct = Math.round((campusCheers.Lima / totalCheers) * 100);
  const arequipaPct = Math.round((campusCheers.Arequipa / totalCheers) * 100);
  const trujilloPct = 100 - limaPct - arequipaPct;

  const activeGame = GAME_CATALOG[selectedDiscipline] || GAME_CATALOG.BRAWL_STARS;

  return (
    <div className="flex flex-col gap-20 pb-24 overflow-x-hidden">
      
      {/* 1. ASYMMETRIC HERO SECTION WITH DYNAMIC TOURNAMENT SPOTLIGHT */}
      <section className="relative pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action Triggers (7 Cols) */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Institution Badge + Sound Mode Tag */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse" />
                <span className="font-bold text-[var(--text-primary)]">TECSUP ESPORTS</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span>Temporada Oficial 2026</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playNotification();
                  toast('🔊 Sonido Gamer activado: Los clics y victorias reproducen audio.');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-arena)] hover:bg-[var(--bg-card)] border border-[var(--border-card)] text-[11px] font-bold text-[var(--text-secondary)] transition-colors cursor-pointer"
                title="Probar sonido de la arena"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Audio Interactivo</span>
              </button>
            </motion.div>

            {/* Asymmetrical High-Craft Headline */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.06] text-[var(--text-primary)]">
              El circuito oficial de esports universitarios.
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal">
              Representa a tu carrera, compite en brackets en vivo y asegura tu lugar en el podio de honor de Tecsup. Torneos presenciales en Campus Lima y clasificatorias online en 7 disciplinas oficiales.
            </motion.p>

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="btn-primary px-6 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 rounded-xl shadow-lg shadow-[#E63946]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Trophy className="w-4 h-4 text-white" />
                  <span>Mi Carnet & Medallero ({user?.first_name})</span>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn-primary px-6 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 rounded-xl shadow-lg shadow-[#E63946]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                  <span>Ingresar con Google Tecsup</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/tournaments"
                className="btn-secondary px-5 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all"
              >
                <span>Explorar Torneos</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </Link>
            </motion.div>

            {/* Trust Proof Footnote */}
            <motion.div variants={fadeUp} className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-card)]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Acceso con @tecsup.edu.pe
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Cero cuentas externas obligatorias
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Fair Play & Brackets oficiales
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: REAL TOURNAMENT SPOTLIGHT OR GRACEFUL PRE-SEASON (5 Cols) */}
          <motion.div
            style={{ y: heroParallaxY, opacity: heroParallaxOpacity }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-5"
          >
            {isLoadingTournament ? (
              <div className="arena-card p-8 text-center space-y-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl min-h-[340px] flex flex-col items-center justify-center shadow-md">
                <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
                <p className="text-xs text-[var(--text-muted)]">Sincronizando torneos activos de la Arena...</p>
              </div>
            ) : featuredTournament ? (
              /* REAL TOURNAMENT CARD WITH SPOTLIGHT */
              <SpotlightCard 
                spotlightColor={`${GAME_CATALOG[featuredTournament.game_code as GameCode]?.color || '#E63946'}25`}
                className="arena-card p-5 relative overflow-hidden border border-[var(--border-card)] hover:border-[#E63946]/40 transition-all shadow-xl bg-[var(--bg-card)] rounded-2xl group"
              >
                
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-card)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">
                      {featuredTournament.status === 'REGISTRATION_OPEN' ? 'Inscripciones Abiertas' : 'Torneo Oficial'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                    {featuredTournament.format || 'Formato BO3'}
                  </span>
                </div>

                {/* Key Art Banner with safe fallback */}
                <div className="relative h-44 rounded-xl overflow-hidden my-4 bg-black/90">
                  <img
                    src={
                      featuredTournament.banner_url || 
                      GAME_CATALOG[featuredTournament.game_code as GameCode]?.bannerUrl || 
                      '/games/brawl_stars_banner.jpg'
                    }
                    alt={featuredTournament.name}
                    onError={(e) => {
                      const fallback = GAME_CATALOG[featuredTournament.game_code as GameCode]?.bannerUrl || '/games/brawl_stars_banner.jpg';
                      if (e.currentTarget.getAttribute('data-failed') !== 'true') {
                        e.currentTarget.setAttribute('data-failed', 'true');
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-black/30" />
                  
                  <div className="absolute top-2.5 left-2.5">
                    <span 
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1.5 shadow-md backdrop-blur-md"
                      style={{ backgroundColor: GAME_CATALOG[featuredTournament.game_code as GameCode]?.color || '#E63946' }}
                    >
                      <Swords className="w-3 h-3" />
                      {GAME_CATALOG[featuredTournament.game_code as GameCode]?.name || featuredTournament.game_code}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 bg-black/80 px-2.5 py-0.5 rounded-md border border-amber-400/20 backdrop-blur-md">
                      Premio: {featuredTournament.prize_pool || 'Premio Oficial Tecsup'}
                    </span>
                  </div>
                </div>

                {/* Meta info */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <MapPin className="w-3.5 h-3.5 text-[#457B9D]" />
                      <span>Tecsup Sede {featuredTournament.campus_name || 'Lima'} • {featuredTournament.is_online ? 'Virtual' : 'Presencial'}</span>
                    </div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] group-hover:text-[#E63946] transition-colors line-clamp-1">
                      {featuredTournament.name}
                    </h3>
                  </div>

                  {/* Real Cupos Bar & 0-Registered Alert */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Cupos Registrados</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {featuredTournament.current_participants || 0} / {featuredTournament.max_slots || 16} {featuredTournament.team_size && featuredTournament.team_size > 1 ? 'Equipos' : 'Jugadores'}
                      </span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-[var(--bg-arena)] rounded-full overflow-hidden border border-[var(--border-card)]">
                      <div 
                        className="h-full bg-[#E63946] rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.max(6, ((featuredTournament.current_participants || 0) / (featuredTournament.max_slots || 16)) * 100)}%` 
                        }}
                      />
                    </div>

                    {/* Fun Prompt when 0 participants */}
                    {Number(featuredTournament.current_participants || 0) === 0 && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>¡0 inscritos aún! Sé el primer equipo en entrar y asegura tu cabeza de serie.</span>
                      </div>
                    )}
                  </div>

                  {/* Direct Action Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#E63946]" />
                      {Number(featuredTournament.cost) === 0 ? 'Inscripción Gratuita' : `Costo: S/ ${featuredTournament.cost} PEN`}
                    </span>
                    <Link
                      href={`/tournaments/${featuredTournament.slug}`}
                      className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 rounded-lg shadow-md shadow-[#E63946]/20"
                    >
                      <span>Inscribirme al Torneo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </SpotlightCard>
            ) : (
              /* GRACEFUL PRE-SEASON & POLL STAGE (When no tournaments exist) */
              <div className="arena-card p-6 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    <Sparkles className="w-3 h-3" />
                    Arena en Calentamiento
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">Temporada 2026</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-[var(--text-primary)]">
                    ¿Qué disciplina quieres en la próxima copa?
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Vota por tu juego favorito para que los organizadores abran el bracket oficial con premios en efectivo.
                  </p>
                </div>

                {/* Micro Game Voting Options */}
                <div className="space-y-2 pt-1">
                  {[
                    { code: 'BRAWL_STARS', label: 'Brawl Stars (3v3)', icon: '⭐' },
                    { code: 'VALORANT', label: 'Valorant (5v5)', icon: '🎯' },
                    { code: 'CLASH_ROYALE', label: 'Clash Royale (1v1)', icon: '👑' },
                    { code: 'DOTA_2', label: 'Dota 2 (5v5)', icon: '⚡' },
                  ].map((item) => {
                    const votes = gameVotes[item.code] || 100;
                    const isVoted = hasVotedGame === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleVoteGame(item.code)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isVoted
                            ? 'bg-[#E63946] text-white border-[#E63946] shadow-md shadow-[#E63946]/20'
                            : 'bg-[var(--bg-arena)] hover:bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-primary)]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          isVoted ? 'bg-black/30 text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'
                        }`}>
                          {votes} votos
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/tournaments"
                    className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ver catálogo completo de disciplinas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </section>

      {/* 2. REFINED METRIC TICKER STRIP WITH LIVING ANIMATED COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6">
        <div className="arena-card p-6 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[var(--border-card)] shadow-sm">
          <div className="text-center md:text-left md:px-4 space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              <AnimatedCounter target={7} duration={1} />
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Disciplinas Oficiales</p>
          </div>
          <div className="text-center md:text-left md:px-4 pt-4 md:pt-0 space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-[#E63946]">Campus Lima</p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Sede Central de Finales</p>
          </div>
          <div className="text-center md:text-left md:px-4 pt-4 md:pt-0 space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-sky-500 dark:text-sky-400">
              <AnimatedCounter target={100} suffix="%" duration={1.2} />
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Acceso @tecsup.edu.pe</p>
          </div>
          <div className="text-center md:text-left md:px-4 pt-4 md:pt-0 space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">Oro / Plata</p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Medallero Permanente</p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE BATTLE ARENA (PLAYFUL DISCIPLINE SELECTOR WITH VOLUMETRIC AURA) */}
      <section id="arena-disciplinas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Cabina de Entrenamiento
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Explora las 7 Disciplinas de la Temporada
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Toca cada juego para escuchar su ambientación, ver sus modos y conocer el formato de competición en Tecsup.
            </p>
          </div>
          <Link
            href="/tournaments"
            className="text-xs font-bold text-[var(--text-secondary)] hover:text-[#E63946] flex items-center gap-1 transition-colors self-start md:self-auto"
          >
            <span>Ver catálogo de torneos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Game Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GAME_LIST.map((game) => {
            const isSelected = selectedDiscipline === game.code;
            return (
              <button
                key={game.code}
                type="button"
                onClick={() => handleSelectGameDiscipline(game.code)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-lg shadow-[#E63946]/25 scale-102'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-card)] hover:text-[var(--text-primary)] hover:border-[#E63946]/40'
                }`}
              >
                {game.logoUrl ? (
                  <img src={game.logoUrl} alt="" className="w-4 h-4 object-contain shrink-0" />
                ) : (
                  <span>{game.statIcon || '🎮'}</span>
                )}
                <span>{game.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-[var(--bg-arena)] text-[var(--text-muted)]'
                }`}>
                  {game.shortName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Discipline Showcase Stage with Volumetric Ambient Aura */}
        <div className="arena-card p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] relative overflow-hidden shadow-xl">
          {/* Volumetric Aura that reacts to selected game */}
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ease-out"
            style={{ backgroundColor: activeGame.color }}
          />
          <div 
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700 ease-out"
            style={{ backgroundColor: activeGame.colorSecondary || '#1D3557' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Info details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span 
                  className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: activeGame.color }}
                >
                  {activeGame.badge}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  Verificación: {activeGame.tagLabel}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {activeGame.name}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {activeGame.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Métrica Oficial</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                    <span>{activeGame.statIcon}</span>
                    <span>{activeGame.statLabel}</span>
                  </p>
                </div>
                <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Formato Habitual</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                    <Swords className="w-3.5 h-3.5 text-[#E63946]" />
                    <span>Eliminación Directa (Bo3)</span>
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/tournaments?game=${activeGame.code}`}
                  className="btn-primary py-2.5 px-6 text-xs font-bold inline-flex items-center gap-2 rounded-xl shadow-md shadow-[#E63946]/20"
                >
                  <span>Ver Torneos de {activeGame.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Game Stage Key Art */}
            <div className="lg:col-span-5 relative h-56 sm:h-64 rounded-xl overflow-hidden border border-[var(--border-card)] shadow-lg group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeGame.code}
                  src={activeGame.bannerUrl}
                  alt={activeGame.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="font-bold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10">
                  {activeGame.logoUrl && (
                    <img src={activeGame.logoUrl} alt="" className="w-4 h-4 object-contain" />
                  )}
                  <span>{activeGame.shortName} Tecsup Arena</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  ● En Rotación
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. GUERRA DE SEDES TECSUP (CAMPUS RIVALRY ARENA & CHEER SYSTEM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
            <Trophy className="w-3.5 h-3.5" />
            Rivalidad Inter-Sedes
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            La Copa de las 3 Sedes Tecsup
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            ¿Qué sede liderará el ranking este año? Apoya a tu campus universitario para sumar puntos de aliento a la clasificación general.
          </p>
        </div>

        {/* Live Territorial Domination Meter */}
        <div className="arena-card p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--text-primary)] flex items-center gap-1.5">
              <span>⚡</span>
              <span>Balance de Dominación Territorial</span>
            </span>
            <span className="font-mono text-[var(--text-muted)] text-[11px] flex items-center gap-1">
              <AnimatedCounter target={totalCheers} duration={1.2} /> Alientos Registrados
            </span>
          </div>

          <div className="w-full h-3.5 bg-[var(--bg-arena)] rounded-full overflow-hidden flex border border-[var(--border-card)] p-0.5 gap-0.5">
            <div 
              style={{ width: `${limaPct}%` }}
              className="bg-[#E63946] h-full rounded-l-full transition-all duration-700 ease-out relative group cursor-pointer"
              title={`Sede Lima: ${limaPct}%`}
            />
            <div 
              style={{ width: `${arequipaPct}%` }}
              className="bg-amber-500 h-full transition-all duration-700 ease-out relative group cursor-pointer"
              title={`Sede Arequipa: ${arequipaPct}%`}
            />
            <div 
              style={{ width: `${trujilloPct}%` }}
              className="bg-sky-500 h-full rounded-r-full transition-all duration-700 ease-out relative group cursor-pointer"
              title={`Sede Trujillo: ${trujilloPct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-1">
            <span className="text-[#E63946] flex items-center gap-1">
              🏛️ Lima: {limaPct}% {limaPct >= arequipaPct && limaPct >= trujilloPct && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
            </span>
            <span className="text-amber-500 flex items-center gap-1">
              🌋 Arequipa: {arequipaPct}% {arequipaPct > limaPct && arequipaPct >= trujilloPct && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
            </span>
            <span className="text-sky-500 flex items-center gap-1">
              🌊 Trujillo: {trujilloPct}% {trujilloPct > limaPct && trujilloPct > arequipaPct && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
            </span>
          </div>
        </div>

        {/* Campus Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Sede Lima */}
          <div className="arena-card p-6 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-4 hover:border-[#E63946]/40 transition-all flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🏛️</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30">
                  Campus Central
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">Sede Lima</h3>
                <p className="text-xs text-[var(--text-secondary)]">Santa Anita • Laboratorios Centrales de Cómputo</p>
              </div>
              <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-0.5">
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Puntos de Aliento</p>
                <p className="text-xl font-black text-[var(--text-primary)]">
                  <AnimatedCounter target={campusCheers.Lima} duration={1.2} suffix=" pts" />
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCheerCampus('Lima')}
              className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl cursor-pointer shadow-md shadow-[#E63946]/20 active:scale-95 transition-transform"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>¡Alentar a Sede Lima!</span>
            </button>
          </div>

          {/* Sede Arequipa */}
          <div className="arena-card p-6 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🌋</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  Sede Sur
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">Sede Arequipa</h3>
                <p className="text-xs text-[var(--text-secondary)]">Campus J.L. Bustamante y Rivero • Los Volcanes</p>
              </div>
              <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-0.5">
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Puntos de Aliento</p>
                <p className="text-xl font-black text-[var(--text-primary)]">
                  <AnimatedCounter target={campusCheers.Arequipa} duration={1.2} suffix=" pts" />
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCheerCampus('Arequipa')}
              className="w-full btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl cursor-pointer hover:border-amber-400 hover:text-amber-500 active:scale-95 transition-transform"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>¡Alentar a Sede Arequipa!</span>
            </button>
          </div>

          {/* Sede Trujillo */}
          <div className="arena-card p-6 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-4 hover:border-sky-500/40 transition-all flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🌊</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-500 border border-sky-500/30">
                  Sede Norte
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">Sede Trujillo</h3>
                <p className="text-xs text-[var(--text-secondary)]">Campus Víctor Larco Herrera • La Ciudad de la Primavera</p>
              </div>
              <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-0.5">
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Puntos de Aliento</p>
                <p className="text-xl font-black text-[var(--text-primary)]">
                  <AnimatedCounter target={campusCheers.Trujillo} duration={1.2} suffix=" pts" />
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCheerCampus('Trujillo')}
              className="w-full btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl cursor-pointer hover:border-sky-400 hover:text-sky-500 active:scale-95 transition-transform"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-sky-500" />
              <span>¡Alentar a Sede Trujillo!</span>
            </button>
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE MINI-GAME: RULETA DE DESAFÍOS GAMER TECSUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="arena-card p-8 sm:p-10 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl relative overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-xs font-bold text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                <Dice5 className="w-3.5 h-3.5" />
                Mini-Juego Estudiantil
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                Ruleta de Retos & Partidas Rápidas
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                ¿Tienes un rato libre entre clases con tus compañeros de Tecsup? Gira la ruleta interactiva para recibir un desafío y competir de inmediato.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSpinRoulette}
                  disabled={isSpinning}
                  className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl shadow-lg shadow-[#E63946]/25 cursor-pointer disabled:opacity-50 active:scale-95 transition-transform"
                >
                  <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? 'Girando la Ruleta...' : '¡Girar Ruleta de Retos!'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyChallenge}
                  className="btn-secondary py-3 px-4 text-xs font-bold flex items-center gap-2 rounded-xl cursor-pointer active:scale-95 transition-transform"
                  title="Copiar reto para WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir Reto</span>
                </button>
              </div>
            </div>

            {/* Challenge Card Display */}
            <div className="lg:col-span-6">
              <motion.div 
                key={currentChallenge.title}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-arena)] border-2 border-amber-500/30 space-y-4 shadow-lg relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{currentChallenge.emoji}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    {currentChallenge.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-[var(--text-primary)]">
                    {currentChallenge.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {currentChallenge.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[var(--border-card)] text-xs text-[var(--text-muted)]">
                  <span>Disciplina: <strong>{GAME_CATALOG[currentChallenge.gameCode]?.name || 'Tecsup Arena'}</strong></span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Apto para Recreos
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. TABLERO DE RÉCORDS & HECHOS ÉPICOS DE TECSUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
            <Sparkles className="w-3.5 h-3.5" />
            Hitos Universitarios
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            Récords & Hazañas de la Comunidad
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Momentos legendarios logrados por estudiantes en las finales de Campus Arena.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Victoria Más Veloz',
              stat: '1m 42s',
              desc: 'Final de Clash Royale en Campus Lima. Victoria con mazo de ciclo rápido.',
              icon: Zap,
              color: '#E63946'
            },
            {
              title: 'Racha Invicta',
              stat: '14 Victorias',
              desc: 'Logrado por la escuadra de Diseño de Software en la Copa Apertura.',
              icon: Crown,
              color: '#F59E0B'
            },
            {
              title: 'Precisión Headshot',
              stat: '68% HS Rate',
              desc: 'Récord de puntería en clasificatorias virtuales de Valorant.',
              icon: Crosshair,
              color: '#0EA5E9'
            },
            {
              title: 'Fair Play Total',
              stat: '100% Limpio',
              desc: 'Cero sanciones por conducta antideportiva. Arbitraje transparente en cada partida.',
              icon: Shield,
              color: '#10B981'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="arena-card p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-3 hover:border-white/20 transition-all shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--border-card)]" style={{ backgroundColor: `${item.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">{item.stat}</p>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{item.title}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. ARCHITECTURAL SHOWCASE: SEDE CENTRAL TECSUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="arena-card p-8 sm:p-12 border border-[var(--border-card)] bg-[var(--bg-card)] rounded-3xl shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Infraestructura Híbrida Oficial</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] leading-tight tracking-tight">
                La Gran Final se vive en las instalaciones de <span className="text-[#E63946]">TECSUP</span>
              </h2>

              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                Nuestra plataforma combina la agilidad de las clasificatorias remotas con la emoción de las finales presenciales en los laboratorios de cómputo de alto rendimiento de Tecsup Lima.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <Wifi className="w-4 h-4 text-sky-500" />
                    <span>Fase Online Automatizada</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Clasificatorias jugadas a distancia con actualización automática de brackets.
                  </p>
                </div>

                <div className="p-3.5 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <MapPin className="w-4 h-4 text-[#E63946]" />
                    <span>Final Presencial en Lima</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Los mejores clasificados se enfrentan en vivo en los laboratorios centrales.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-[var(--border-card)] shadow-2xl group">
              <img 
                src="/brand/tecsup_sede_lima.jpg" 
                alt="Campus Tecsup Lima" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
              
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-lg">
                <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                <span>Campus Central Lima • Santa Anita</span>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white">
                <div>
                  <p className="font-bold flex items-center gap-1.5">
                    <span>Av. Cascanueces 2221, Lima</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </p>
                  <p className="text-[11px] text-[#A8DADC]">Laboratorios de Cómputo de Alto Rendimiento</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/30">
                  Sede Oficial
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. SCROLL-CONNECTED COMPETITIVE JOURNEY: DE LA INSCRIPCIÓN A LA GLORIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-1 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20 uppercase tracking-wider">
            <Rocket className="w-3.5 h-3.5" />
            <span>Senda Competitiva Oficial</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            De la inscripción a la gloria universitaria
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            4 etapas sincronizadas para construir tu historial competitivo oficial en Tecsup.
          </p>
        </div>

        <div className="relative">
          {/* Laser energy line connecting cards on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-[2px] bg-gradient-to-r from-[#457B9D] via-[#E63946] to-amber-500 -translate-y-1/2 z-0 opacity-25" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {[
              {
                step: '01',
                title: 'Inicia con Google Tecsup',
                desc: 'Sin formularios manuales. Acceso directo con tu correo institucional @tecsup.edu.pe.',
                tag: '1 Clic',
                icon: Shield,
                color: '#457B9D',
              },
              {
                step: '02',
                title: 'Elige tu Disciplina',
                desc: 'Revisa bases oficiales, cupos disponibles, fechas límite y modalidad (100% online o presencial).',
                tag: '7 Juegos',
                icon: Target,
                color: '#E63946',
              },
              {
                step: '03',
                title: 'Arma tu Escuadra',
                desc: 'Inscríbete individualmente o crea tu equipo con tus compañeros de clase. Sin cuentas de terceros forzosas.',
                tag: 'Capitán & Roster',
                icon: Users,
                color: '#10B981',
              },
              {
                step: '04',
                title: 'Compite y Corona',
                desc: 'Avanza en brackets automatizados en vivo, suma medallas a tu medallero y clasifica a la Gran Final.',
                tag: 'Podio & Copa',
                icon: Trophy,
                color: '#F59E0B',
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: idx * 0.08, ease: [0.23, 1, 0.32, 1] }}
                  className="arena-card p-6 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-4 hover:border-[#E63946]/40 hover:shadow-xl transition-all shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wider text-white"
                      style={{ backgroundColor: step.color }}
                    >
                      Paso {step.step}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                      {step.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border-card)] group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${step.color}18` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: step.color }} />
                      </div>
                      <h3 className="text-sm font-black text-[var(--text-primary)] leading-tight">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 w-full text-center space-y-6 pt-4">
        <div className="arena-card p-8 sm:p-12 border border-[var(--border-card)] bg-[var(--bg-card)] rounded-3xl space-y-6 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Arena Oficial Tecsup
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            ¿Listo para defender los colores de tu carrera?
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Inscríbete hoy mismo en los torneos activos o explora las tablas de clasificación de la temporada 2026.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/tournaments"
                className="btn-primary px-7 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[#E63946]/20 active:scale-95 transition-transform"
              >
                <Trophy className="w-4 h-4" />
                <span>Explorar Torneos Disponibles</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary px-7 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[#E63946]/20 active:scale-95 transition-transform"
              >
                <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                <span>Ingresar con Google Tecsup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/ranking"
              className="btn-secondary px-6 py-3.5 text-xs sm:text-sm font-bold rounded-xl active:scale-95 transition-transform"
            >
              Ver Ranking Institucional
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
