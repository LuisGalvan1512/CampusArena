import React from 'react';
import Link from 'next/link';
import { Swords, Shield, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0B0C10] border-t border-white/10 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E63946] to-[#1D3557] flex items-center justify-center">
                <Swords className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-wider text-white">
                CAMPUS <span className="text-[#E63946]">ARENA</span>
              </span>
            </div>
            <p className="text-sm text-[#8E92A4] max-w-sm">
              La plataforma oficial de esports académicos en Latinoamérica. Compite, representa a tu institución y construye un legado imborrable.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#5A5E73]">
              <Shield className="w-4 h-4 text-[#457B9D]" />
              <span>Protegido por reglas de Fair Play & APIs Oficiales</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1FAEE]">Plataforma</h4>
            <ul className="space-y-2 text-sm text-[#8E92A4]">
              <li><Link href="/#torneos" className="hover:text-white transition-colors">Torneos Activos</Link></li>
              <li><Link href="/#juegos" className="hover:text-white transition-colors">Juegos Oficiales</Link></li>
              <li><Link href="/#legado" className="hover:text-white transition-colors">Sistema de Legado</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Perfil de Jugador</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1FAEE]">Institucional</h4>
            <ul className="space-y-2 text-sm text-[#8E92A4]">
              <li><span className="text-[#5A5E73]">Reglamento General</span></li>
              <li><span className="text-[#5A5E73]">Términos y Condiciones</span></li>
              <li><span className="text-[#5A5E73]">Política de Privacidad</span></li>
              <li><span className="text-[#5A5E73]">Soporte Técnico</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A5E73] gap-4">
          <p>© 2026 Campus Arena. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado para la comunidad universitaria gamer
          </p>
        </div>
      </div>
    </footer>
  );
}
