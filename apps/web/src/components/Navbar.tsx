'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenterDrawer } from '@/components/NotificationCenterDrawer';
import { 
  Trophy, 
  Gamepad2, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Swords, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck, 
  Crown 
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isOrganizer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push('/');
  };

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Torneos', href: '/tournaments' },
    { name: 'Comunidad', href: '/community' },
    { name: '🔴 En Vivo', href: '/live' },
    { name: 'Ranking', href: '/ranking' },
    ...(isOrganizer || isAdmin ? [{ name: '🛡️ Organizador', href: '/dashboard/organizer' }] : []),
    ...(isAdmin ? [{ name: '👑 Admin', href: '/admin/organizers' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0C10]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E63946] to-[#1D3557] flex items-center justify-center shadow-lg shadow-[#E63946]/20 group-hover:scale-105 transition-transform">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider text-white flex items-center gap-1">
                CAMPUS <span className="text-[#E63946]">ARENA</span>
              </span>
              <span className="text-[10px] tracking-widest text-[#8E92A4] uppercase font-semibold">
                Esports Universitarios
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#E63946] ${
                    isActive ? 'text-[#E63946] font-bold' : 'text-[#8E92A4]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Auth & Notification Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Real-time Notification Bell */}
                <NotificationCenterDrawer />

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-[#15161E] border border-white/10 hover:border-[#E63946]/50 transition-all text-sm cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-xs">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div className="text-left leading-tight hidden lg:block">
                      <p className="font-semibold text-white text-xs">{user.first_name}</p>
                      <p className="text-[10px] font-bold text-amber-400">
                        {user.role === 'ADMIN' ? '👑 ADMIN' : user.role === 'ORGANIZER' ? '🛡️ ORGANIZADOR' : 'ESTUDIANTE'}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#8E92A4]" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 arena-card py-2 shadow-2xl z-50 border border-white/10 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-[11px] text-[#8E92A4]">Conectado como</p>
                        <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-black ${
                          user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          user.role === 'ORGANIZER' ? 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30' :
                          'bg-white/10 text-[#8E92A4]'
                        }`}>
                          {user.role === 'ADMIN' ? 'SUPER ADMINISTRADOR' : user.role === 'ORGANIZER' ? 'ORGANIZADOR OFICIAL' : 'ALUMNO COMPETIDOR'}
                        </span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-4 py-2.5 text-xs text-left text-[#8E92A4] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#E63946]" />
                        Mi Perfil & Medallero
                      </Link>

                      <Link
                        href="/ranking"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-4 py-2.5 text-xs text-left text-[#8E92A4] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-amber-400" />
                        Ranking Institucional
                      </Link>

                      {(isAdmin || isOrganizer) && (
                        <Link
                          href="/dashboard/organizer"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full px-4 py-2.5 text-xs text-left text-[#8E92A4] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#457B9D]" />
                          Panel Organizador
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin/organizers"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full px-4 py-2.5 text-xs text-left text-amber-400 hover:bg-white/5 flex items-center gap-2 transition-colors font-semibold"
                        >
                          <Crown className="w-4 h-4 text-amber-400" />
                          Gestión de Organizadores
                        </Link>
                      )}

                      <div className="border-t border-white/5 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-xs text-left text-[#E63946] hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#E63946]/20"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Acceso Google Tecsup
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && <NotificationCenterDrawer />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#8E92A4] hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#15161E] border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#8E92A4] hover:text-white"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-xs py-2.5 text-center flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Mi Perfil & Medallero
                </Link>
                <Link
                  href="/dashboard/organizer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-xs py-2.5 text-center flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#457B9D]" />
                  Panel Organizador
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-primary text-xs py-2.5 text-center"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-xs py-2.5 text-center"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-xs py-2.5 text-center"
                >
                  Registrarme
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
