import React from 'react';
import Link from 'next/link';
import { Swords, Shield, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border-card)] pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[var(--border-card)]">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E63946] to-[#1D3557] flex items-center justify-center">
                <Swords className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-wider text-[var(--text-primary)]">
                CAMPUS <span className="text-[#E63946]">ARENA</span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm">
              La plataforma oficial de esports académicos en Latinoamérica. Compite, representa a tu institución y construye un legado imborrable.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Shield className="w-4 h-4 text-[#457B9D]" />
              <span>Protegido por reglas de Fair Play & APIs Oficiales</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Plataforma</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link href="/tournaments" className="hover:text-[#E63946] transition-colors">Torneos Activos</Link></li>
              <li><Link href="/#juegos" className="hover:text-[#E63946] transition-colors">Juegos Oficiales</Link></li>
              <li><Link href="/ranking" className="hover:text-[#E63946] transition-colors">Ranking Institucional</Link></li>
              <li><Link href="/profile" className="hover:text-[#E63946] transition-colors">Perfil de Jugador</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Institucional</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><span className="cursor-default opacity-60" title="Próximamente">Reglamento General</span></li>
              <li><span className="cursor-default opacity-60" title="Próximamente">Términos y Condiciones</span></li>
              <li><span className="cursor-default opacity-60" title="Próximamente">Política de Privacidad</span></li>
              <li><Link href="/community" className="hover:text-[#E63946] transition-colors">Comunidad & Soporte</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <p>© {new Date().getFullYear()} Campus Arena. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart className="w-3.5 h-3.5 text-[#E63946] fill-[#E63946]" /> para la comunidad gamer de
            <span className="font-bold text-[var(--text-secondary)]">Tecsup</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
