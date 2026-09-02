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
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel text-xs font-bold text-[#A8DADC] tracking-widest uppercase">
            <Flame className="w-4 h-4 text-[#E63946]" />
            Temporada 2026 — 6 Disciplinas Oficiales
          </motion.div>

          {/* Epic Title */}
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
            Compite. Evoluciona.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#FF6B35] to-[#D62839] block sm:inline mt-2 sm:mt-0">
              Deja tu huella.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-lg sm:text-2xl text-[#8E92A4] max-w-3xl mx-auto leading-relaxed font-medium">
            La plataforma oficial de esports universitarios. Demuestra tu nivel en{' '}
            <span className="text-white">Clash Royale</span>,{' '}
            <span className="text-white">Dota 2</span>,{' '}
            <span className="text-white">Left 4 Dead 2</span> y más.
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
                  href="/auth/register"
                  className="btn-primary px-10 py-4 text-lg flex items-center gap-3 w-full sm:w-auto justify-center rounded-xl"
                >
                  <Swords className="w-5 h-5" />
                  Crear Cuenta de Competidor
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-secondary px-10 py-4 text-lg w-full sm:w-auto text-center rounded-xl glass-panel hover:bg-white/10 transition-all"
                >
                  Iniciar Sesión
                </Link>
              </>
            )}
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto border-t border-white/10 mt-10">
            <div className="p-4 text-center glass-panel">
              <p className="text-3xl font-black text-white">6</p>
              <p className="text-xs text-[#8E92A4] mt-1 font-semibold uppercase tracking-wider">Juegos Oficiales</p>
            </div>
            <div className="p-4 text-center glass-panel">
              <p className="text-3xl font-black text-[#E63946]">Tecsup</p>
              <p className="text-xs text-[#8E92A4] mt-1 font-semibold uppercase tracking-wider">Sede Principal</p>
            </div>
            <div className="p-4 text-center glass-panel">
              <p className="text-3xl font-black text-[#457B9D]">100%</p>
              <p className="text-xs text-[#8E92A4] mt-1 font-semibold uppercase tracking-wider">Registro Autónomo</p>
            </div>
            <div className="p-4 text-center glass-panel">
              <p className="text-3xl font-black text-[#A8DADC]">24/7</p>
              <p className="text-xs text-[#8E92A4] mt-1 font-semibold uppercase tracking-wider">Disponibilidad</p>
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
          <div className="bg-[#0B0C10]/90 backdrop-blur-xl rounded-xl p-8 sm:p-12 border border-white/5 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946] border border-[#E63946]/20 uppercase tracking-widest">
                  <Building2 className="w-4 h-4" />
                  Sede Oficial
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  La Gran Final se vive en <span className="text-[#E63946]">TECSUP</span>
                </h2>
                <p className="text-[#8E92A4] text-lg leading-relaxed">
                  Disfruta de lo mejor de ambos mundos. Nuestra plataforma soporta competencias con <strong>Fase Preliminar Online</strong> para jugar cómodamente desde casa, y eventos <strong>100% Presenciales</strong> en los laboratorios de la sede central.
                </p>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 transition-colors hover:bg-white/10">
                    <Wifi className="w-6 h-6 text-[#A8DADC]" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Fases de Grupo Online</h4>
                      <p className="text-xs text-[#8E92A4]">Clasificatorias jugadas a distancia con brackets automáticos.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 transition-colors hover:bg-white/10">
                    <MapPin className="w-6 h-6 text-[#E63946]" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Gran Final Presencial</h4>
                      <p className="text-xs text-[#8E92A4]">Los mejores equipos se enfrentan cara a cara en las instalaciones.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Simulated Map/Campus Image Graphic */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1D3557] to-[#0B0C10]" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <Building2 className="w-24 h-24 text-[#E63946] mb-6 drop-shadow-[0_0_15px_rgba(230,57,70,0.5)]" />
                  <h3 className="text-2xl font-black tracking-widest text-white uppercase">Campus Tecsup</h3>
                  <p className="text-[#A8DADC] mt-2 font-mono text-sm">Lima, Perú</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. JUEGOS OFICIALES */}
      <section id="juegos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-sm font-bold text-[#A8DADC] uppercase tracking-widest">
            Disciplinas Oficiales
          </h2>
          <h3 className="text-4xl sm:text-5xl font-black text-white">
            Elige tu campo de batalla
          </h3>
          <p className="text-[#8E92A4] max-w-2xl mx-auto text-base">
            6 juegos soportados oficialmente. Registro rápido y sin validaciones restrictivas. 
            Simplemente ingresa tu nickname y estás dentro.
          </p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {GAME_LIST.map((game, index) => (
            <motion.div 
              variants={fadeUp}
              key={game.code} 
              className="arena-card p-6 relative overflow-hidden group cursor-pointer arena-card-glow"
            >
              {/* Background dynamic glow */}
              <div 
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-30"
                style={{ backgroundColor: game.color }}
              />

              {/* Header: Icon + Badge */}
              <div className="flex items-start justify-between relative z-10">
                <div 
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${game.bgGradient}`}
                >
                  {GAME_ICONS[game.iconName]}
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
                <h4 className="text-2xl font-black text-white">{game.name}</h4>
                <p className="text-sm text-[#8E92A4] leading-relaxed line-clamp-3">
                  {game.description}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs relative z-10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[#5A5E73]">Identificador: <span className="font-mono font-bold text-white ml-1">{game.tagPlaceholder}</span></span>
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
              <h3 className="text-4xl sm:text-5xl font-black text-white leading-[1.1]">
                Tu legado competitivo registrado <span className="text-[#E63946]">para siempre</span>
              </h3>
              <p className="text-[#8E92A4] text-lg leading-relaxed">
                Cada partida alimenta tu tarjeta de competidor. Tus victorias y campeonatos forman un perfil deportivo verificable que define tu reputación.
              </p>

              <div className="space-y-4">
                {[
                  'Cálculo automático de Win Rate.',
                  'Insignias y trofeos digitales por cada torneo.',
                  'Registro multi-juego desde un solo lugar.',
                  'Integración de pagos Yape/Plin directa.'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 text-base text-[#F1FAEE] bg-white/5 p-3 rounded-lg border border-white/5">
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
              className="bg-[#0B0C10] p-8 rounded-2xl border border-white/10 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E63946]/10 blur-2xl rounded-full" />
              
              <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/10">
                    LG
                  </div>
                  <div>
                    <h5 className="font-black text-xl text-white">Luis Galvan</h5>
                    <p className="text-sm text-[#8E92A4] mt-0.5">Diseño y Desarrollo de Software</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#E63946]/20 text-[#E63946] text-sm font-black uppercase tracking-wider">
                  PRO
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center relative z-10">
                <div className="p-4 glass-panel border-white/5">
                  <p className="text-2xl font-black text-white">12</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E92A4] mt-1">Torneos</p>
                </div>
                <div className="p-4 glass-panel border-white/5">
                  <p className="text-2xl font-black text-[#E63946]">2</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E92A4] mt-1">Copas</p>
                </div>
                <div className="p-4 glass-panel border-white/5">
                  <p className="text-2xl font-black text-[#A8DADC]">80.9%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E92A4] mt-1">Win Rate</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-sm transition-colors hover:bg-white/10">
                  <span className="flex items-center gap-2 font-bold text-[#8E92A4]">
                    <Swords className="w-4 h-4 text-[#E63946]" />
                    Dota 2
                  </span>
                  <span className="font-mono font-bold text-white">Arteezy</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-sm transition-colors hover:bg-white/10">
                  <span className="flex items-center gap-2 font-bold text-[#8E92A4]">
                    <Crosshair className="w-4 h-4 text-[#4CAF50]" />
                    Left 4 Dead 2
                  </span>
                  <span className="font-mono font-bold text-white">Luis_L4D</span>
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
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Inscripciones Abiertas
          </div>
          <h3 className="text-5xl sm:text-6xl font-black text-white leading-tight">
            ¿Listo para ingresar a la arena?
          </h3>
          <p className="text-[#8E92A4] max-w-xl mx-auto text-lg font-medium">
            Crea tu cuenta de competidor en menos de 1 minuto y prepárate para los próximos torneos en Tecsup.
          </p>
          <div className="pt-6">
            <Link
              href="/auth/register"
              className="btn-primary px-10 py-5 text-lg inline-flex items-center gap-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(230,57,70,0.4)] hover:shadow-[0_0_60px_rgba(230,57,70,0.6)]"
            >
              <Swords className="w-6 h-6" />
              Unirse a Campus Arena
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
