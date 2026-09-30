'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenterDrawer } from '@/components/NotificationCenterDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SoundToggle } from '@/components/SoundToggle';
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
  Crown,
  Search
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border-card)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E63946] to-[#1D3557] flex items-center justify-center shadow-lg shadow-[#E63946]/20 group-hover:scale-105 transition-transform overflow-hidden p-1.5 border border-white/10">
                <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 leading-none">
                CAMPUS <span className="text-[#E63946]">ARENA</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#002B49] text-sky-300 font-black border border-sky-400/30">TECSUP</span>
              </span>
              <span className="text-[10px] tracking-widest text-[var(--text-secondary)] uppercase font-semibold mt-1">
                Esports Universitarios
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#E63946] ${
                    isActive ? 'text-[#E63946] font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Auth & Notification Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Quick Command Palette Button */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  ctrlKey: true,
                  bubbles: true,
                });
                window.dispatchEvent(event);
              }}
              title="Buscar o comandos (Ctrl + K)"
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#E63946]/50 transition-all cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Buscar...</span>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[var(--bg-arena)] border border-[var(--border-card)] rounded-md">
                ⌘K
              </kbd>
            </button>

            {/* Sound Toggle */}
            <SoundToggle />

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {isAuthenticated && user ? (
              <>
                {/* Real-time Notification Bell */}
                <NotificationCenterDrawer />

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[#E63946]/50 transition-all text-sm cursor-pointer shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0 shadow-sm">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.first_name} className="w-full h-full object-cover" />
                      ) : (
                        `${user.first_name[0]}${user.last_name[0]}`
                      )}
                    </div>
                    <div className="text-left leading-tight hidden lg:block">
                      <p className="font-semibold text-[var(--text-primary)] text-xs">{user.first_name}</p>
                      <p className="text-[10px] font-bold text-amber-500">
                        {user.role === 'ADMIN' ? '👑 ADMIN' : user.role === 'ORGANIZER' ? '🛡️ ORGANIZADOR' : 'ESTUDIANTE'}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 arena-card py-2 shadow-2xl z-50 border border-[var(--border-card)] animate-in fade-in">
                      <div className="px-4 py-2 border-b border-[var(--border-card)]">
                        <p className="text-[11px] text-[var(--text-secondary)]">Conectado como</p>
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.email}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-black ${
                          user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30' :
                          user.role === 'ORGANIZER' ? 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30' :
                          'bg-[var(--bg-arena)] text-[var(--text-secondary)] border border-[var(--border-card)]'
                        }`}>
                          {user.role === 'ADMIN' ? 'SUPER ADMINISTRADOR' : user.role === 'ORGANIZER' ? 'ORGANIZADOR OFICIAL' : 'ALUMNO COMPETIDOR'}
                        </span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)] flex items-center gap-2 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#E63946]" />
                        Mi Perfil & Medallero
                      </Link>

                      <Link
                        href="/ranking"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)] flex items-center gap-2 transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Ranking Institucional
                      </Link>

                      {(isAdmin || isOrganizer) && (
                        <Link
                          href="/dashboard/organizer"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)] flex items-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-500" />
                          Panel Organizador
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin/organizers"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full px-4 py-2.5 text-xs text-left text-amber-500 dark:text-amber-400 hover:bg-[var(--bg-arena)] flex items-center gap-2 transition-colors font-semibold"
                        >
                          <Crown className="w-4 h-4 text-amber-500" />
                          Gestión de Organizadores
                        </Link>
                      )}

                      <div className="border-t border-[var(--border-card)] my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-xs text-left text-[#E63946] hover:bg-[var(--bg-arena)] flex items-center gap-2 transition-colors cursor-pointer"
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
            <ThemeToggle />
            {isAuthenticated && <NotificationCenterDrawer />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg-card)] border-b border-[var(--border-card)] backdrop-blur-xl px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
