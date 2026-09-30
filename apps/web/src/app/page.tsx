'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  Trophy, 
  Swords, 
  Gamepad2, 
  ShieldCheck, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Medal, 
  Zap,
  Crosshair,
  CircleDot,
  Wifi,
  Sparkles,
  MapPin,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GAME_LIST } from '@/lib/games';

const GAME_ICONS: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-7 h-7 text-white" />,
  Gamepad2: <Gamepad2 className="w-7 h-7 text-white" />,
  Zap: <Zap className="w-7 h-7 text-white" />,
  Crosshair: <Crosshair className="w-7 h-7 text-white" />,
  CircleDot: <CircleDot className="w-7 h-7 text-white" />,
};

// Animation variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 15 } }
};

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col gap-24 pb-24 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Animated Background glow effects */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E63946]/20 rounded-full blur-[140px] pointer-events-none" 
        />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#1D3557]/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#457B9D]/30 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-5xl mx-auto text-center space-y-8"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel border border-[var(--border-card)] bg-[var(--bg-card)]/70 text-xs font-bold text-sky-600 dark:text-[#A8DADC] tracking-widest uppercase">
            <Flame className="w-4 h-4 text-[#E63946]" />
            Temporada 2026 — 7 Disciplinas Oficiales
          </motion.div>

          {/* Epic Title */}
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] text-[var(--text-primary)]">
            Compite. Evoluciona.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#FF6B35] to-[#D62839] block sm:inline mt-2 sm:mt-0">
              Deja tu huella.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-lg sm:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed font-medium">
            La plataforma oficial de esports universitarios. Demuestra tu nivel en{' '}
            <span className="text-[var(--text-primary)] font-bold">Clash Royale</span>,{' '}
            <span className="text-[var(--text-primary)] font-bold">Dota 2</span>,{' '}
            <span className="text-[var(--text-primary)] font-bold">Left 4 Dead 2</span>,{' '}
            <span className="text-[var(--text-primary)] font-bold">Fortnite</span> y más.
          </motion.p>

          {/* Action CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="btn-primary px-10 py-4 text-lg flex items-center gap-3 w-full sm:w-auto justify-center rounded-xl"
              >
                <Trophy className="w-5 h-5" />
                Ir a Mi Perfil ({user?.first_name})
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-primary px-9 py-4 text-base sm:text-lg flex items-center gap-3 w-full sm:w-auto justify-center rounded-xl shadow-[0_0_35px_rgba(230,57,70,0.35)] hover:scale-105 transition-all"
                >
                  <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-5 h-5 object-contain" />
                  Ingresar con Google Tecsup
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/tournaments"
                  className="btn-secondary px-8 py-4 text-base sm:text-lg w-full sm:w-auto text-center rounded-xl glass-panel hover:bg-[var(--bg-arena)] transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Explorar Torneos
                </Link>
              </>
            )}
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto border-t border-[var(--border-card)] mt-10">
            <div className="p-4 text-center arena-card">
              <p className="text-3xl font-black text-[var(--text-primary)]">7</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-semibold uppercase tracking-wider">Juegos Oficiales</p>
            </div>
            <div className="p-4 text-center arena-card">
              <p className="text-3xl font-black text-[#E63946]">Tecsup</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-semibold uppercase tracking-wider">Sede Principal</p>
            </div>
            <div className="p-4 text-center arena-card">
              <p className="text-3xl font-black text-[#457B9D]">100%</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-semibold uppercase tracking-wider">Registro Autónomo</p>
            </div>
            <div className="p-4 text-center arena-card">
              <p className="text-3xl font-black text-teal-600 dark:text-[#A8DADC]">24/7</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-semibold uppercase tracking-wider">Disponibilidad</p>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* 2. NUEVA SECCIÓN: SEDE OFICIAL TECSUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="arena-card p-1 relative overflow-hidden bg-gradient-to-br from-[#E63946]/20 to-[#1D3557]/40 shadow-2xl"
        >
          <div className="bg-[var(--bg-card)]/95 backdrop-blur-xl rounded-xl p-8 sm:p-12 border border-[var(--border-card)] relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20 uppercase tracking-widest">
                  <Building2 className="w-4 h-4" />
                  Sede Oficial
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] leading-tight">
                  La Gran Final se vive en <span className="text-[#E63946]">TECSUP</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                  Disfruta de lo mejor de ambos mundos. Nuestra plataforma soporta competencias con <strong>Fase Preliminar Online</strong> para jugar cómodamente desde casa, y eventos <strong>100% Presenciales</strong> en los laboratorios de la sede central.
                </p>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center gap-4 bg-[var(--bg-arena)] p-4 rounded-xl border border-[var(--border-card)] transition-colors hover:bg-[var(--bg-card)]">
                    <Wifi className="w-6 h-6 text-[#A8DADC]" />
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm">Fases de Grupo Online</h4>
                      <p className="text-xs text-[var(--text-secondary)]">Clasificatorias jugadas a distancia con brackets automáticos.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-[var(--bg-arena)] p-4 rounded-xl border border-[var(--border-card)] transition-colors hover:bg-[var(--bg-card)]">
                    <MapPin className="w-6 h-6 text-[#E63946]" />
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm">Gran Final Presencial</h4>
                      <p className="text-xs text-[var(--text-secondary)]">Los mejores equipos se enfrentan cara a cara en las instalaciones.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-full min-h-[360px] rounded-2xl overflow-hidden border border-[var(--border-card)] shadow-2xl group">
                {/* Real Campus Photo from Tecsup */}
                <img 
                  src="/brand/tecsup_sede_lima.jpg" 
                  alt="Campus Tecsup Lima" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Top Institution Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 shadow-lg">
                  <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-black tracking-wider text-white uppercase">Tecsup • Innovación & Tecnología</span>
                </div>

                {/* Bottom Campus Details */}
                <div className="absolute bottom-4 left-4 right-4 z-10 p-4 rounded-xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-card)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-[var(--text-primary)]">Campus Central Lima</h4>
                      <p className="text-xs text-[var(--text-secondary)]">Av. Cascanueces 2221, Santa Anita</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      Sede Oficial
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. JUEGOS OFICIALES */}
      <section id="juegos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-sm font-bold text-sky-600 dark:text-[#A8DADC] uppercase tracking-widest">
            Disciplinas Oficiales
          </h2>
          <h3 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)]">
            Elige tu campo de batalla
          </h3>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-base">
            7 disciplinas soportadas oficialmente con rankings y torneos en vivo. 
            Vincula tu tag oficial o nickname y empieza a competir.
          </p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {GAME_LIST.map((game) => (
            <motion.div 
              variants={fadeUp}
              key={game.code} 
              className="arena-card p-6 relative overflow-hidden group cursor-pointer arena-card-glow"
            >
              {/* Game Official Key Art Background */}
              {game.bannerUrl && (
                <div className="absolute inset-0 opacity-15 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none overflow-hidden">
                  <img 
                    src={game.bannerUrl} 
                    alt={game.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/80 to-[var(--bg-card)]/40" />
                </div>
              )}

              {/* Background dynamic glow */}
              <div 
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-30"
                style={{ backgroundColor: game.color }}
              />

              {/* Header: Icon + Badge */}
              <div className="flex items-start justify-between relative z-10">
                <div 
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center p-2.5 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${game.bgGradient}`}
                >
                  {game.logoUrl ? (
                    <img src={game.logoUrl} alt={game.name} className="w-full h-full object-contain filter drop-shadow" />
                  ) : (
                    GAME_ICONS[game.iconName]
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span 
                    className="px-3 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md uppercase tracking-wider"
                    style={{ 
                      backgroundColor: `${game.color}15`,
                      color: game.color,
                      borderColor: `${game.color}30`,
                    }}
                  >
                    {game.badge}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="mt-8 space-y-2 relative z-10">
                <h4 className="text-2xl font-black text-[var(--text-primary)]">{game.name}</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {game.description}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-[var(--border-card)] flex items-center gap-2 text-xs relative z-10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[var(--text-secondary)]">Identificador: <span className="font-mono font-bold text-[var(--text-primary)] ml-1">{game.tagPlaceholder}</span></span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. SISTEMA DE LEGADO */}
      <section id="legado" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="arena-card p-8 sm:p-14 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20 uppercase tracking-widest">
                <Medal className="w-4 h-4" />
                Historial Inmutable
              </div>
              <h3 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] leading-[1.1]">
                Tu legado competitivo registrado <span className="text-[#E63946]">para siempre</span>
              </h3>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                Cada partida alimenta tu tarjeta de competidor. Tus victorias y campeonatos forman un perfil deportivo verificable que define tu reputación.
              </p>

              <div className="space-y-4">
                {[
                  'Cálculo automático de Win Rate.',
                  'Insignias y trofeos digitales por cada torneo.',
                  'Registro multi-juego desde un solo lugar.',
                  'Integración de pagos Yape/Plin directa.'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 text-base text-[var(--text-primary)] bg-[var(--bg-arena)] p-3 rounded-lg border border-[var(--border-card)]">
                    <CheckCircle2 className="w-5 h-5 text-[#E63946] shrink-0" />
                    <span className="font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Card Mock */}
            <motion.div 
              whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="arena-card bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-card)] space-y-6 shadow-2xl relative"
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E63946]/10 blur-2xl rounded-full" />
              
              <div className="flex items-center justify-between pb-6 border-b border-[var(--border-card)] relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/10">
                    LG
                  </div>
                  <div>
                    <h5 className="font-black text-xl text-[var(--text-primary)]">Luis Galvan</h5>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Diseño y Desarrollo de Software</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#E63946]/20 text-[#E63946] text-sm font-black uppercase tracking-wider">
                  PRO
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center relative z-10">
                <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                  <p className="text-2xl font-black text-[var(--text-primary)]">12</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-1">Torneos</p>
                </div>
                <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                  <p className="text-2xl font-black text-[#E63946]">2</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-1">Copas</p>
                </div>
                <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)]">
                  <p className="text-2xl font-black text-teal-600 dark:text-[#A8DADC]">80.9%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-1">Win Rate</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] flex items-center justify-between text-sm transition-colors hover:bg-[var(--bg-card)]">
                  <span className="flex items-center gap-2.5 font-bold text-[var(--text-secondary)]">
                    <img src="/games/dota_2_logo.png" alt="Dota 2" className="w-5 h-5 object-contain" />
                    Dota 2
                  </span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">Arteezy</span>
                </div>
                <div className="p-4 bg-[var(--bg-arena)] rounded-xl border border-[var(--border-card)] flex items-center justify-between text-sm transition-colors hover:bg-[var(--bg-card)]">
                  <span className="flex items-center gap-2.5 font-bold text-[var(--text-secondary)]">
                    <img src="/games/left_4_dead_2_logo.png" alt="Left 4 Dead 2" className="w-5 h-5 object-contain" />
                    Left 4 Dead 2
                  </span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">Luis_L4D</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-8 relative pb-20 mt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E63946]/10 rounded-full blur-[100px] pointer-events-none" 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel border border-[var(--border-card)] bg-[var(--bg-card)]/80 text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Inscripciones Abiertas
          </div>
          <h3 className="text-5xl sm:text-6xl font-black text-[var(--text-primary)] leading-tight">
            ¿Listo para ingresar a la arena?
          </h3>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg font-medium">
            Crea tu cuenta de competidor en menos de 1 minuto y prepárate para los próximos torneos en Tecsup.
          </p>
          <div className="pt-6">
            <Link
              href="/auth/login"
              className="btn-primary px-10 py-5 text-lg inline-flex items-center gap-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(230,57,70,0.4)] hover:shadow-[0_0_60px_rgba(230,57,70,0.6)]"
            >
              <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-6 h-6 object-contain" />
              Ingresar con Google Tecsup
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
