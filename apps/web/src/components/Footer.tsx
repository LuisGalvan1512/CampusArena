import React from 'react';
import Link from 'next/link';
import { Shield, Heart, MapPin, ArrowUpRight, Trophy, Tv, Users } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-[var(--bg-card)] border-t border-[var(--border-card)] pt-16 pb-10 overflow-hidden transition-colors">
      {/* Subtle Ambient Glow */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[700px] h-64 rounded-full bg-[#E63946]/8 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[var(--border-card)]">
          {/* Col 1: Brand & Telemetry (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center p-1 shadow-md overflow-hidden">
                <img
                  src="/brand/logo.jpg"
                  alt="Campus Arena Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
                  CAMPUS <span className="text-[#E63946]">ARENA</span>
                </span>
                <span className="font-mono-data text-[9px] tracking-[0.22em] text-[#38BDF8] font-bold uppercase mt-1">
                  TECSUP ESPORTS CIRCUIT
                </span>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
              La plataforma competitiva oficial para estudiantes de Tecsup. Brackets en tiempo real, validación institucional con correo <span className="font-mono-data text-xs text-[var(--text-primary)]">@tecsup.edu.pe</span> y finales presenciales inter-sedes.
            </p>

            {/* Campus Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {['Sede Lima • Santa Anita', 'Sede Arequipa', 'Sede Norte • Trujillo'].map((sede) => (
                <span
                  key={sede}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-arena)] border border-[var(--border-card)] text-[11px] font-mono-data text-[var(--text-secondary)]"
                >
                  <MapPin className="w-3 h-3 text-[#E63946]" />
                  {sede}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono-data pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Arena Operativa • Fair Play Institucional Verificado</span>
            </div>
          </div>

          {/* Col 2: Competencia (3 cols) */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-mono-data text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Circuito Competitivo
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-[var(--text-secondary)]">
              <li>
                <Link
                  href="/tournaments"
                  className="hover:text-[#E63946] transition-colors inline-flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#E63946]" />
                  Catálogo de Torneos
                </Link>
              </li>
              <li>
                <Link
                  href="/live"
                  className="hover:text-[#E63946] transition-colors inline-flex items-center gap-1.5"
                >
                  <Tv className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Transmisiones En Vivo
                </Link>
              </li>
              <li>
                <Link
                  href="/ranking"
                  className="hover:text-[#E63946] transition-colors inline-flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Ranking & Medallero
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-[#E63946] transition-colors inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Comunidad Estudiantil
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Cuenta & Acceso Rápido (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono-data text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Pasaporte de Jugador
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Personaliza tu carnet estilo Steam, colecciona medallas verificadas y gestiona tus inscripciones de escuadra.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/profile"
                className="group btn-primary py-2 pl-4 pr-1.5 text-xs font-bold inline-flex items-center gap-2 rounded-full"
              >
                <span>Mi Carnet Gamer</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </span>
              </Link>
              <Link
                href="/tournaments"
                className="btn-secondary py-2 px-4 text-xs font-bold rounded-full"
              >
                Ver Brackets
              </Link>
            </div>
          </div>
        </div>

        {/* Monumental Display Watermark */}
        <div className="py-6 select-none pointer-events-none overflow-hidden text-center">
          <p className="font-display text-[11vw] sm:text-[9vw] font-black tracking-tighter leading-none text-[var(--text-primary)] opacity-[0.035]">
            CAMPUS ARENA
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <p className="font-mono-data">
            © {new Date().getFullYear()} Campus Arena — Tecsup Esports. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            Diseñado con <Heart className="w-3.5 h-3.5 text-[#E63946] fill-[#E63946]" /> para la comunidad competitiva de{' '}
            <span className="font-bold text-[var(--text-primary)]">Tecsup</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
