'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenterDrawer } from '@/components/NotificationCenterDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push('/');
  };

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Torneos', href: '/tournaments' },
    { name: 'Comunidad', href: '/community' },
    { 
      name: 'En Vivo', 
      href: '/live',
      badge: <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
    },
    { name: 'Ranking', href: '/ranking' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border-card)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E63946] to-[#1D3557] flex items-center justify-center shadow-lg shadow-[#E63946]/20 group-hover:scale-105 transition-transform overflow-hidden p-1.5 border border-white/10">
              <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 leading-none">
                CAMPUS <span className="text-[#E63946]">ARENA</span>
              </span>
              <span className="text-[9px] tracking-widest text-sky-400 font-bold uppercase mt-1">
                TECSUP ESPORTS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-white/[0.08] text-[var(--text-primary)] border border-white/10' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                  }`}
                >
                  {link.badge}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth & Quick Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {isAuthenticated && user ? (
              <>
                {/* Real-time Notification Bell */}
                <NotificationCenterDrawer />

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[#E63946]/50 transition-all text-sm cursor-pointer shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0 shadow-sm">
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
                  className="btn-primary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 rounded-lg shadow-sm"
                >
                  <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-3.5 h-3.5 object-contain" />
                  <span>Acceso Google Tecsup</span>
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
        <div className="md:hidden bg-[var(--bg-card)] border-b border-[var(--border-card)] backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* User profile preview on mobile if authenticated */}
          {isAuthenticated && user && (
            <div className="p-3 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E63946] to-[#457B9D] flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0 shadow-sm">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.first_name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.first_name[0]}{user.last_name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
              </div>
              {isAdmin ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  ADMIN
                </span>
              ) : isOrganizer ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  ORG
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-card)]">
                  ESTUDIANTE
                </span>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive 
                      ? 'bg-[#E63946]/10 text-[#E63946] font-bold' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)]'
                  }`}
                >
                  {link.badge}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions & Role Based Panels */}
          <div className="pt-3 border-t border-[var(--border-card)] flex flex-col gap-2">
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

                {(isAdmin || isOrganizer) && (
                  <Link
                    href="/dashboard/organizer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-xs py-2.5 text-center flex items-center justify-center gap-2 text-blue-500 dark:text-blue-400 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Panel Organizador
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    href="/admin/organizers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-xs py-2.5 text-center flex items-center justify-center gap-2 text-amber-500 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 font-bold"
                  >
                    <Crown className="w-4 h-4 text-amber-500" />
                    Gestión de Organizadores
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 text-[#E63946] hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-xs py-3 text-center flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#E63946]/20"
              >
                <img src="/brand/tecsup_emblem.png" alt="Tecsup" className="w-4 h-4 object-contain" />
                Ingresar con Google Tecsup
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
