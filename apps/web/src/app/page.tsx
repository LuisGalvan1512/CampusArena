'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, Variants, AnimatePresence } from 'framer-motion';
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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GAME_LIST, GAME_CATALOG } from '@/lib/games';

const GAME_ICONS: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-5 h-5 text-white" />,
  Gamepad2: <Gamepad2 className="w-5 h-5 text-white" />,
  Zap: <Zap className="w-5 h-5 text-white" />,
  Crosshair: <Crosshair className="w-5 h-5 text-white" />,
  CircleDot: <CircleDot className="w-5 h-5 text-white" />,
};

// Subtle physics-based motion variants (Emil Kowalski principles)
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 350, damping: 28 } 
  }
};

// Interactive Feature Showcase Data
const HIGHLIGHT_TABS = [
  {
    id: 'season',
    num: '01',
    label: 'Temporada 2026',
    title: '7 disciplinas oficiales con brackets y llaves en tiempo real',
    desc: 'Compite en Clash Royale, Dota 2, Fortnite, Left 4 Dead 2, Brawl Stars, eFootball y Super Smash Bros. Cada victoria se sincroniza automáticamente con el ranking de la universidad.',
    badge: 'En Vivo',
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    icon: Trophy,
    highlightMetric: '7 Juegos Soportados',
    highlightSub: 'Fases online + presencial',
  },
  {
    id: 'rewards',
    num: '02',
    label: 'Medallero & Premios',
    title: 'Medallas oficiales institucionales y premios en efectivo',
    desc: 'Gana medallas de oro, plata y bronce que quedan grabadas de forma permanente en tu carnet de competidor. Cada título conquistado suma prestigio a tu carrera en Tecsup.',
    badge: 'Reconocimiento',
    badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    icon: Medal,
    highlightMetric: 'Oro, Plata y Bronce',
    highlightSub: 'Historial permanente en perfil',
  },
  {
    id: 'identity',
    num: '03',
    label: 'Carnet Estilo Steam',
    title: 'Personaliza tu identidad competitiva con fondos coleccionables',
    desc: 'Equipa fondos de perfil procedurales inspirados en la estética gamer de Steam (Cyberpunk, Carbon, Aurora, Gold, Obsidian, Retro y Matrix) sin necesidad de vincular cuentas de terceros.',
    badge: 'Estilo Steam',
    badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    icon: Sparkles,
    highlightMetric: '8 Temas Procedurales',
    highlightSub: '100% libre de apps externas',
  },
];

// 4 Steps Process
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Inicia con @tecsup.edu.pe',
    desc: 'Sin formularios largos. Acceso directo con tu correo institucional de Google Workspace.',
    icon: Shield,
    color: '#457B9D',
  },
  {
    step: '02',
    title: 'Elige tu Disciplina',
    desc: 'Revisa las bases del torneo, fechas, cupos disponibles y modalidad (virtual o presencial).',
    icon: Target,
    color: '#E63946',
  },
  {
    step: '03',
    title: 'Inscripción en 1 Clic',
    desc: 'Inscríbete individualmente o crea tu escuadra. Cero vinculaciones obligatorias de terceros.',
    icon: Users,
    color: '#10B981',
  },
  {
    step: '04',
    title: 'Compite y Deja tu Huella',
    desc: 'Aparece en el bracket oficial en vivo, juega tus partidas y suma medallas a tu medallero.',
    icon: Rocket,
    color: '#F59E0B',
  },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const nextTab = useCallback(() => {
    setActiveTabIdx((prev) => (prev + 1) % HIGHLIGHT_TABS.length);
  }, []);

  const activeTab = HIGHLIGHT_TABS[activeTabIdx];

  return (
    <div className="flex flex-col gap-20 pb-24 overflow-x-hidden">
      
      {/* 1. ASYMMETRIC HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions (7 Cols) */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Institution Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111622] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse" />
              <span className="font-bold text-[var(--text-primary)]">TECSUP ESPORTS</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span>Temporada 2026</span>
            </motion.div>

            {/* Asymmetrical High-Craft Headline */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-[var(--text-primary)]">
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
                  className="btn-primary px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2.5 rounded-lg shadow-sm"
                >
                  <Trophy className="w-4 h-4 text-white" />
                  <span>Mi Carnet & Medallero ({user?.first_name})</span>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn-primary px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2.5 rounded-lg shadow-sm"
                >
                  <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                  <span>Ingresar con Google Tecsup</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/tournaments"
                className="btn-secondary px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-lg"
              >
                <span>Explorar Torneos Activos</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </Link>
            </motion.div>

            {/* Trust Proof Footnote */}
            <motion.div variants={fadeUp} className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-card)]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Acceso con @tecsup.edu.pe
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cero cuentas externas obligatorias
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Fair Play & Brackets oficiales
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Live Featured Tournament Spotlight (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="arena-card p-5 relative overflow-hidden border border-white/10 hover:border-white/20 transition-all shadow-xl bg-[#111520]">
              
              {/* Card Header Tag */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-card)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    Torneo Destacado de Apertura
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                  BO3 • 1vs1
                </span>
              </div>

              {/* Tournament Key Art Banner */}
              <div className="relative h-44 rounded-lg overflow-hidden my-4 bg-black/90">
                <img
                  src="/games/clash_royale_banner.jpg"
                  alt="Clash Royale Tecsup"
                  className="w-full h-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-transparent to-black/30" />
                
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#E63946] text-white flex items-center gap-1.5 shadow-md">
                    <Swords className="w-3 h-3" />
                    Clash Royale
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-400/20">
                    Premio: S/ 250 + Medalla de Oro
                  </span>
                </div>
              </div>

              {/* Tournament Meta Info */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <MapPin className="w-3.5 h-3.5 text-[#457B9D]" />
                    <span>Campus Central Lima • Sede Santa Anita</span>
                  </div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">
                    Copa Apertura Tecsup 2026
                  </h3>
                </div>

                {/* Cupos Bar */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Cupos Confirmados</span>
                    <span className="font-bold text-[var(--text-primary)]">16 / 32 Jugadores</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-[var(--border-card)]">
                    <div className="w-1/2 h-full bg-[#E63946] rounded-full" />
                  </div>
                </div>

                {/* Direct Action */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Modalidad Presencial</span>
                  <Link
                    href="/tournaments"
                    className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>Inscribirme en el Bracket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. REFINED METRIC TICKER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6">
        <div className="arena-card p-6 bg-[#111520] border border-[var(--border-card)] grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[var(--border-card)]">
          <div className="text-center md:text-left md:px-4 space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">7</p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Disciplinas Oficiales</p>
          </div>
          <div className="text-center md:text-left md:px-4 pt-4 md:pt-0 space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-[#E63946]">Campus Lima</p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Sede Presencial Principal</p>
          </div>
          <div className="text-center md:text-left md:px-4 pt-4 md:pt-0 space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-sky-400">1 Clic</p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Registro con cuenta @tecsup</p>
          </div>
          <div className="text-center md:text-left md:px-4 pt-4 md:pt-0 space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">Oro / Plata</p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Medallero Institucional</p>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURAL SHOWCASE: SEDE CENTRAL TECSUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="arena-card p-8 sm:p-12 border border-[var(--border-card)] bg-[#111520]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                Infraestructura Híbrida
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] leading-tight">
                La Gran Final se vive en las instalaciones de <span className="text-[#E63946]">TECSUP</span>
              </h2>

              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                Nuestra plataforma combina la agilidad de las clasificatorias remotas con la emoción de las finales presenciales en los laboratorios de cómputo de alto rendimiento de Tecsup Lima.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-[#0D1018] rounded-lg border border-[var(--border-card)] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <Wifi className="w-4 h-4 text-sky-400" />
                    <span>Fase Online</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Clasificatorias jugadas a distancia con actualización automática de brackets.
                  </p>
                </div>

                <div className="p-3.5 bg-[#0D1018] rounded-lg border border-[var(--border-card)] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <MapPin className="w-4 h-4 text-[#E63946]" />
                    <span>Final Presencial</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Los mejores clasificados se enfrentan en vivo en los laboratorios centrales.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden border border-[var(--border-card)] shadow-lg group">
              <img 
                src="/brand/tecsup_sede_lima.jpg" 
                alt="Campus Tecsup Lima" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
                <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                <span>Campus Central Lima</span>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Av. Cascanueces 2221, Santa Anita</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Laboratorios Especializados de Ingeniería</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/30">
                  Sede Oficial
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. DISCIPLINAS OFICIALES: CATÁLOGO EN ALTA RESOLUCIÓN */}
      <section id="juegos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider">
              Disciplinas Oficiales
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
              Elige tu campo de batalla
            </h2>
          </div>
          <Link
            href="/tournaments"
            className="text-xs font-bold text-[var(--text-secondary)] hover:text-[#E63946] flex items-center gap-1 transition-colors self-start md:self-auto"
          >
            <span>Ver todos los torneos programados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {GAME_LIST.map((game) => (
            <motion.div 
              variants={fadeUp}
              key={game.code} 
              className="group"
            >
              <Link 
                href={`/tournaments?game=${game.code}`}
                className="arena-card p-5 block h-full relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-white/20 bg-[#111520]"
              >
                {/* Official Game Key Art Background */}
                {game.bannerUrl && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <img 
                      src={game.bannerUrl} 
                      alt={game.name} 
                      className="w-full h-full object-cover object-center opacity-20 group-hover:opacity-40 transition-opacity duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/80 to-[#111520]/40" />
                  </div>
                )}

                {/* Card Header: Emblem + Badge */}
                <div className="flex items-start justify-between relative z-10">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center p-2 shadow-md border border-white/10"
                    style={{ backgroundColor: `${game.color}22` }}
                  >
                    {game.logoUrl ? (
                      <img src={game.logoUrl} alt={game.name} className="w-full h-full object-contain filter drop-shadow" />
                    ) : (
                      GAME_ICONS[game.iconName]
                    )}
                  </div>
                  <span 
                    className="px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider"
                    style={{ 
                      backgroundColor: `${game.color}15`,
                      color: game.color,
                      borderColor: `${game.color}35`,
                    }}
                  >
                    {game.badge}
                  </span>
                </div>

                {/* Card Body */}
                <div className="mt-6 space-y-2 relative z-10">
                  <h3 className="text-xl font-black text-[var(--text-primary)] group-hover:text-white transition-colors flex items-center justify-between">
                    <span>{game.name}</span>
                    <ArrowRight 
                      className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" 
                      style={{ color: game.color }}
                    />
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {game.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. TACTILE FEATURE STAGE (INTERACTIVE TABS REPLACING SLOPPY SLIDERS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="arena-card p-6 sm:p-10 border border-[var(--border-card)] bg-[#111520] space-y-8">
          
          {/* Header & Section Title */}
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider">
              Ventajas Competitivas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Construido específicamente para la comunidad Tecsup
            </h2>
          </div>

          {/* Segmented Control Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-xl bg-[#0A0D14] border border-[var(--border-card)]">
            {HIGHLIGHT_TABS.map((tab, idx) => {
              const isSelected = activeTabIdx === idx;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabIdx(idx)}
                  className={`p-3 rounded-lg text-left transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-[#161D2B] text-white border border-white/10 shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-[#E63946]' : 'text-[var(--text-muted)]'}`}>
                    {tab.num}
                  </span>
                  <span className="text-xs sm:text-sm font-bold truncate">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Panel */}
          <div className="p-6 sm:p-8 rounded-xl bg-[#0D1018] border border-[var(--border-card)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${activeTab.badgeColor}`}>
                {activeTab.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-tight">
                {activeTab.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {activeTab.desc}
              </p>
            </div>

            <div className="lg:col-span-4 p-5 rounded-xl bg-[#111520] border border-[var(--border-card)] text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center mx-auto text-[#E63946]">
                <activeTab.icon className="w-5 h-5" />
              </div>
              <p className="text-lg font-black text-[var(--text-primary)]">
                {activeTab.highlightMetric}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {activeTab.highlightSub}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CHRONOLOGICAL PROCESS: DE LA INSCRIPCIÓN A LA GLORIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-1 mb-10 text-center sm:text-left">
          <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider">
            Ruta Competitiva
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
            De la inscripción a la gloria
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            4 pasos directos para comenzar tu trayectoria en la Arena sin intermediarios.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="arena-card p-6 bg-[#111520] border border-[var(--border-card)] space-y-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    Paso {step.step}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: `${step.color}18` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: step.color }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. REFINED FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 w-full text-center space-y-6 pt-4">
        <div className="arena-card p-8 sm:p-12 border border-[var(--border-card)] bg-[#111520] space-y-6">
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
                className="btn-primary px-7 py-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-lg"
              >
                <Trophy className="w-4 h-4" />
                <span>Explorar Torneos Disponibles</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary px-7 py-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-lg"
              >
                <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                <span>Ingresar con Google Tecsup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/ranking"
              className="btn-secondary px-6 py-3 text-sm font-semibold rounded-lg"
            >
              Ver Ranking Institucional
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
