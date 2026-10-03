'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  Volume2, 
  Clock, 
  Loader2,
  ExternalLink,
  ShieldCheck,
  Tv
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { GAME_LIST, GAME_CATALOG, type GameCode } from '@/lib/games';
import { sounds } from '@/lib/sound';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { SpotlightCard } from '@/components/SpotlightCard';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  // Dynamic Real Tournament State from backend
  const [featuredTournament, setFeaturedTournament] = useState<any | null>(null);
  const [isLoadingTournament, setIsLoadingTournament] = useState(true);

  // Active Interactive Discipline for Apple-Style Lineup Showcase
  const [selectedDiscipline, setSelectedDiscipline] = useState<GameCode>('BRAWL_STARS');

  // Scroll Parallax for Hero
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 500], [0, 35]);
  const heroParallaxOpacity = useTransform(scrollY, [0, 450], [1, 0.88]);

  // Fetch real tournaments on mount
  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoadingTournament(true);
      try {
        const res = await api.get('/tournaments');
        if (res.success && res.data?.items && res.data.items.length > 0) {
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

  const handleSelectDiscipline = (code: GameCode) => {
    sounds.playClick();
    setSelectedDiscipline(code);
  };

  const activeGame = GAME_CATALOG[selectedDiscipline] || GAME_CATALOG.BRAWL_STARS;

  return (
    <div className="flex flex-col gap-24 sm:gap-32 pb-28 overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. APPLE FLAGSHIP HERO GATE: MONUMENTAL TYPOGRAPHY & CINEMATIC KEYNOTE    */}
      {/* ========================================================================= */}
      <section className="relative pt-10 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Editorial Hero Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Status Pill & Audio Trigger */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse" />
                <span className="font-bold text-[var(--text-primary)]">TECSUP ESPORTS</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="font-mono text-[11px]">TEMPORADA 2026</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playNotification();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-arena)] hover:bg-[var(--bg-card)] border border-[var(--border-card)] text-[11px] font-bold text-[var(--text-secondary)] transition-colors cursor-pointer"
                title="Sonido táctil habilitado"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Audio Táctil Activo</span>
              </button>
            </div>

            {/* Monumental Headline (Apple Editorial Scale) */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.03] text-[var(--text-primary)]">
                Campus Arena.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#FF5A67] to-amber-400">
                  La alta competición universitaria.
                </span>
              </h1>
            </div>

            {/* Crisp Subtitle */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal">
              La plataforma oficial de esports de Tecsup. Brackets automatizados, clasificaciones sin trampas con tu cuenta institucional y una Gran Final presencial en los laboratorios de cómputo de Santa Anita.
            </p>

            {/* Apple-Style Pill CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {isAuthenticated ? (
                <Link
                  href="/tournaments"
                  className="btn-primary px-7 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 rounded-full shadow-xl shadow-[#E63946]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Trophy className="w-4 h-4 text-white" />
                  <span>Explorar Torneos Disponibles</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn-primary px-7 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 rounded-full shadow-xl shadow-[#E63946]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                  <span>Ingresar con Google Tecsup</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/profile"
                className="btn-secondary px-6 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-full transition-all hover:border-[var(--text-primary)]"
              >
                <span>{isAuthenticated ? 'Mi Carnet de Competidor' : 'Ver Carnet del Jugador'}</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </Link>
            </div>

            {/* Institutional Trust Proof Footnote */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-[var(--text-muted)] border-t border-[var(--border-card)]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Cuenta @tecsup.edu.pe
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Cero cuentas externas forzadas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Finales en Campus Lima
              </span>
            </div>
          </div>

          {/* Right: Flagship Keynote Stage (5 cols) */}
          <motion.div
            style={{ y: heroParallaxY, opacity: heroParallaxOpacity }}
            className="lg:col-span-5"
          >
            {isLoadingTournament ? (
              <div className="arena-card p-10 text-center space-y-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl min-h-[380px] flex flex-col items-center justify-center shadow-xl">
                <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
                <p className="text-xs text-[var(--text-muted)] font-mono">Sincronizando la Arena...</p>
              </div>
            ) : featuredTournament ? (
              /* REAL TOURNAMENT FLAGSHIP CARD */
              <SpotlightCard 
                spotlightColor={`${GAME_CATALOG[featuredTournament.game_code as GameCode]?.color || '#E63946'}26`}
                className="arena-card p-6 relative overflow-hidden border border-[var(--border-card)] hover:border-white/20 transition-all shadow-2xl bg-[var(--bg-card)] rounded-3xl group"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-card)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">
                      {featuredTournament.status === 'REGISTRATION_OPEN' ? 'Inscripciones Abiertas' : 'Torneo Oficial Activo'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
                    {featuredTournament.format || 'Formato BO3'}
                  </span>
                </div>

                {/* Key Art Hero */}
                <div className="relative h-48 rounded-2xl overflow-hidden my-4 bg-black/90">
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
                    className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-black/30" />
                  
                  {/* Floating Game Badge */}
                  <div className="absolute top-3 left-3">
                    <span 
                      className="px-3 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md"
                      style={{ backgroundColor: GAME_CATALOG[featuredTournament.game_code as GameCode]?.color || '#E63946' }}
                    >
                      <Swords className="w-3 h-3" />
                      {GAME_CATALOG[featuredTournament.game_code as GameCode]?.name || featuredTournament.game_code}
                    </span>
                  </div>

                  {/* Prize Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 bg-black/85 px-3 py-1 rounded-lg border border-amber-400/25 backdrop-blur-md shadow-md">
                      Premio: {featuredTournament.prize_pool || 'Premio Oficial Tecsup'}
                    </span>
                  </div>
                </div>

                {/* Tournament Metadata */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <MapPin className="w-3.5 h-3.5 text-[#457B9D]" />
                      <span>Sede {featuredTournament.campus_name || 'Lima'} • {featuredTournament.is_online ? 'Remoto / Virtual' : 'Presencial'}</span>
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] group-hover:text-[#E63946] transition-colors line-clamp-1">
                      {featuredTournament.name}
                    </h3>
                  </div>

                  {/* Live Capacity Fill Bar */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Cupos Oficiales</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {featuredTournament.current_participants || 0} / {featuredTournament.max_slots || 16} {featuredTournament.team_size && featuredTournament.team_size > 1 ? 'Equipos' : 'Jugadores'}
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-[var(--bg-arena)] rounded-full overflow-hidden border border-[var(--border-card)]">
                      <div 
                        className="h-full bg-[#E63946] rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.max(6, ((featuredTournament.current_participants || 0) / (featuredTournament.max_slots || 16)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Trigger */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#E63946]" />
                      {Number(featuredTournament.cost) === 0 ? 'Inscripción Gratuita' : `S/ ${featuredTournament.cost} PEN`}
                    </span>
                    <Link
                      href={`/tournaments/${featuredTournament.slug}`}
                      className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-1.5 rounded-full shadow-lg shadow-[#E63946]/25"
                    >
                      <span>Inscribirme al Torneo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </SpotlightCard>
            ) : (
              /* GRACEFUL PRE-SEASON SHOWCASE */
              <div className="arena-card p-8 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    Arena en Calentamiento
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">Temporada 2026</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[var(--text-primary)]">
                    Próximas Copas Oficiales en Preparación
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Los organizadores y centros de estudiantes están configurando los brackets de la temporada. Explora las 7 disciplinas y prepara tu escuadra.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-[var(--bg-arena)] rounded-2xl border border-[var(--border-card)]">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">7 Disciplinas</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Móvil, PC y Consola</span>
                  </div>
                  <div className="p-3.5 bg-[var(--bg-arena)] rounded-2xl border border-[var(--border-card)]">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">Campus Lima</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Sede de Finales</span>
                  </div>
                </div>

                <Link
                  href="/tournaments"
                  className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 rounded-full shadow-lg shadow-[#E63946]/20"
                >
                  <span>Explorar Catálogo de Torneos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. "DESCUBRE LA LÍNEA": APPLE-STYLE INTERACTIVE DISCIPLINE SHOWCASE       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-mono font-bold uppercase tracking-wider text-[#E63946]">
            <Zap className="w-3.5 h-3.5" />
            <span>Alineación Oficial de Juegos</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Descubre las 7 disciplinas.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            De los duelos tácticos móviles a los títulos de estrategia por equipos. Selecciona un juego para conocer su escenario de copa oficial en Tecsup.
          </p>
        </div>

        {/* Apple-Style Segmented Pill Navigation */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none px-2">
          {GAME_LIST.map((game) => {
            const isSelected = selectedDiscipline === game.code;
            return (
              <button
                key={game.code}
                type="button"
                onClick={() => handleSelectDiscipline(game.code)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)] shadow-lg scale-102'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-card)] hover:text-[var(--text-primary)] hover:border-white/20'
                }`}
              >
                {game.logoUrl ? (
                  <img src={game.logoUrl} alt="" className="w-4 h-4 object-contain shrink-0" />
                ) : (
                  <span>{game.statIcon || '🎮'}</span>
                )}
                <span>{game.name}</span>
              </button>
            );
          })}
        </div>

        {/* Widescreen Cinematic Product Stage with Morphing Volumetric Light */}
        <div className="arena-card p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] relative overflow-hidden shadow-2xl">
          {/* Volumetric Aura reacting to selected game color */}
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ease-out"
            style={{ backgroundColor: activeGame.color }}
          />
          <div 
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700 ease-out"
            style={{ backgroundColor: activeGame.colorSecondary || '#1D3557' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left: Detailed Specs & Storytelling (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2.5">
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

              <div className="space-y-2">
                <h3 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                  {activeGame.name}
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {activeGame.description}
                </p>
              </div>

              {/* Technical Specifications Grid (Apple Style) */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[var(--bg-arena)] rounded-2xl border border-[var(--border-card)]">
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Métrica Oficial</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-1">
                    <span>{activeGame.statIcon}</span>
                    <span>{activeGame.statLabel}</span>
                  </p>
                </div>

                <div className="p-4 bg-[var(--bg-arena)] rounded-2xl border border-[var(--border-card)]">
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Formato Habitual</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-1">
                    <Swords className="w-3.5 h-3.5 text-[#E63946]" />
                    <span>Eliminación Directa (Bo3)</span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={`/tournaments?game=${activeGame.code}`}
                  className="btn-primary py-3 px-7 text-xs sm:text-sm font-bold inline-flex items-center gap-2 rounded-full shadow-lg shadow-[#E63946]/20 transition-all hover:scale-[1.02]"
                >
                  <span>Ver Torneos de {activeGame.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Immersive High-Res Key Art (6 cols) */}
            <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden border border-[var(--border-card)] shadow-2xl group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeGame.code}
                  src={activeGame.bannerUrl}
                  alt={activeGame.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="font-bold flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                  {activeGame.logoUrl && (
                    <img src={activeGame.logoUrl} alt="" className="w-4 h-4 object-contain" />
                  )}
                  <span>{activeGame.shortName} • Circuito Tecsup</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  ● En Rotación Oficial
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "INGENIERÍA DE TORNEOS": APPLE "A FONDO" & ANTIGRAVITY SPATIAL BENTO   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        
        {/* Section Header */}
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-mono font-bold uppercase tracking-wider text-[#E63946]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Infraestructura & Confianza</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Diseñado para competir al máximo nivel.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Cero barreras de entrada, validación estricta de identidad institucional y tecnología de brackets en tiempo real construida específicamente para Tecsup.
          </p>
        </div>

        {/* Asymmetrical 4-Card Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento Card 1: Identidad Institucional & Fair Play (7 cols) */}
          <div className="lg:col-span-7 arena-card p-8 sm:p-10 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl flex flex-col justify-between space-y-6 shadow-sm relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Juego limpio garantizado con tu correo @tecsup.edu.pe
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Evitamos el smurfing y las inscripciones fantasma. Solo estudiantes y docentes verificados con credenciales institucionales pueden crear equipos, registrar planteles y competir por medallas oficiales.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 relative z-10">
              <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                <span className="text-xs font-bold text-[var(--text-primary)] block">Cero Bloat</span>
                <span className="text-[11px] text-[var(--text-muted)]">Sin cuentas externas</span>
              </div>
              <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                <span className="text-xs font-bold text-[var(--text-primary)] block">Fair Play</span>
                <span className="text-[11px] text-[var(--text-muted)]">Arbitraje certificado</span>
              </div>
              <div className="p-3 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                <span className="text-xs font-bold text-[var(--text-primary)] block">100% Tecsup</span>
                <span className="text-[11px] text-[var(--text-muted)]">Lima, Arequipa, Trujillo</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: La Gran Final Presencial (5 cols) */}
          <div className="lg:col-span-5 arena-card p-8 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl flex flex-col justify-between space-y-6 shadow-sm relative overflow-hidden group">
            <div className="relative h-44 rounded-2xl overflow-hidden border border-[var(--border-card)]">
              <img 
                src="/brand/tecsup_sede_lima.jpg" 
                alt="Campus Tecsup Lima" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs text-white font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Santa Anita • Campus Central</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-[var(--text-primary)]">
                Finales Presenciales de Alto Rendimiento
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Las etapas previas se juegan de forma remota y las grandes finales se disputan en vivo en los laboratorios de cómputo con pantallas de 144Hz y baja latencia.
              </p>
            </div>
          </div>

          {/* Bento Card 3: Carnet Competitivo Inmutable (5 cols) */}
          <div className="lg:col-span-5 arena-card p-8 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
                <Medal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">
                Pasaporte Gamer & Medallero Permanente
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Tus copas de oro, títulos de campeón y participaciones quedan registradas de por vida en tu Carnet de Competidor, personalizable con fondos temáticos estilo Steam Points Shop.
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-arena)] rounded-2xl border border-[var(--border-card)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Registro Oficial</span>
                <span className="text-xs font-bold text-[var(--text-primary)] block">Medallas Verificadas</span>
              </div>
              <span className="text-2xl">🥇</span>
            </div>
          </div>

          {/* Bento Card 4: Brackets en Vivo & Live Streaming (7 cols) */}
          <div className="lg:col-span-7 arena-card p-8 sm:p-10 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl flex flex-col justify-between space-y-6 shadow-sm relative overflow-hidden">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-500">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Brackets sincronizados en tiempo real y transmisión oficial
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Avanza en llaves de eliminación directa con generación automatizada de enfrentamientos, asignación de árbitros y casters estudiantiles transmitiendo las partidas clave.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/tournaments"
                className="btn-primary py-2.5 px-6 text-xs font-bold rounded-full shadow-md shadow-[#E63946]/20"
              >
                <span>Ver Llaves Activas</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
              </Link>
              <Link
                href="/live"
                className="btn-secondary py-2.5 px-5 text-xs font-bold rounded-full"
              >
                <span>Transmisión en Vivo</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 inline text-[var(--text-muted)]" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. "LA SENDA DEL COMPETIDOR": CHRONOLOGICAL SEQUENTIAL TIMELINE           */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        
        {/* Section Header */}
        <div className="text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-mono font-bold uppercase tracking-wider text-[#E63946]">
            <Rocket className="w-3.5 h-3.5" />
            <span>El Recorrido Oficial</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            De tu primera partida al podio.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Cuatro pasos sincronizados para construir tu historial competitivo en Tecsup.
          </p>
        </div>

        {/* 4-Step Editorial Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Inicia con Google Tecsup',
              desc: 'Sin formularios engorrosos. 1 clic con tu correo @tecsup.edu.pe para validar tu condición de estudiante activo.',
              tag: '1 Clic',
              color: '#457B9D',
            },
            {
              step: '02',
              title: 'Selecciona tu Torneo',
              desc: 'Consulta las bases, premios en efectivo, cupos disponibles y modalidad (100% online o presencial).',
              tag: '7 Disciplinas',
              color: '#E63946',
            },
            {
              step: '03',
              title: 'Registra tu Escuadra',
              desc: 'Inscríbete de manera individual o registra el roster de tus compañeros de aula sin vincular cuentas externas.',
              tag: 'Capitán & Roster',
              color: '#10B981',
            },
            {
              step: '04',
              title: 'Compite y Alza la Copa',
              desc: 'Avanza en el bracket en vivo, gana medallas permanentes para tu carnet y asegura tu cupo en la Gran Final.',
              tag: 'Podio & Gloria',
              color: '#F59E0B',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="arena-card p-7 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl space-y-4 hover:border-white/20 transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span 
                    className="font-mono text-2xl font-black"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--bg-arena)] text-[var(--text-muted)] border border-[var(--border-card)]">
                    {item.tag}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. GRAND FINALE: APPLE KEYNOTE CLOSURE                                    */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 w-full text-center">
        <div className="arena-card p-10 sm:p-16 border border-[var(--border-card)] bg-[var(--bg-card)] rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Circuito Oficial Tecsup</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
            ¿Listo para inscribir tu nombre en la historia de Tecsup?
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Inscríbete hoy mismo en los torneos activos de la temporada o explora los rankings y medallas de tus compañeros de campus.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {isAuthenticated ? (
              <Link
                href="/tournaments"
                className="btn-primary px-8 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-full shadow-xl shadow-[#E63946]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Trophy className="w-4 h-4" />
                <span>Explorar Torneos Activos</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary px-8 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-full shadow-xl shadow-[#E63946]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                <span>Ingresar con Google Tecsup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/ranking"
              className="btn-secondary px-7 py-3.5 text-xs sm:text-sm font-bold rounded-full transition-all hover:border-[var(--text-primary)]"
            >
              Ver Ranking Institucional
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
