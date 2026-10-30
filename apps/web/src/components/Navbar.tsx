'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenterDrawer } from '@/components/NotificationCenterDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SoundToggle } from '@/components/SoundToggle';
import { sounds } from '@/lib/sound';
import { LiveWaveformIcon, CommandConsoleIcon } from '@/components/EsportsIcons';
import {
  Trophy,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Crown,
  Search,
  ArrowUpRight,
} from 'lucide-react';

import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isOrganizer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Smooth micro-meter scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

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

  const triggerCommandPalette = () => {
    sounds.playWoodClick();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
      );
    }
  };

  const navLinks = [
    { code: '01', name: 'Inicio', href: '/' },
    { code: '02', name: 'Torneos', href: '/tournaments' },
    { code: '03', name: 'Ranking', href: '/ranking' },
    {
      code: '04',
      name: 'En Vivo',
      href: '/live',
      isLive: true,
    },
    { code: '05', name: 'Comunidad', href: '/community' },
  ];

  const canManage = isAuthenticated && (isAdmin || isOrganizer || user?.role === 'ADMIN' || user?.role === 'ORGANIZER');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border-card)] transition-colors duration-200">
      {/* Top Scroll Progress Laser Line */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D9232E] via-[#C5A059] to-[#D9232E] origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />

      <nav
        aria-label="Navegación principal"
        className="widescreen-container h-18 flex items-center justify-between gap-4"
      >
        {/* 1. Brand Identity — Architectural Monolith */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            href="/"
            onClick={() => sounds.playWoodClick()}
            className="flex items-center gap-3.5 group shrink-0"
          >
            <div className="relative w-10 h-10 rounded-sm bg-[#09090B] border border-[#F4F2ED]/15 flex items-center justify-center group-hover:border-[#D9232E] transition-colors overflow-hidden p-1">
              <img
                src="/brand/logo.jpg"
                alt="Campus Arena Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl font-bold tracking-[-0.03em] text-[var(--text-primary)] flex items-center gap-1.5 leading-none uppercase">
                CAMPUS <span className="text-[#D9232E]">ARENA</span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.26em] text-[var(--text-muted)] font-semibold uppercase mt-1">
                CIRCUITO OFICIAL TECSUP
              </span>
            </div>
          </Link>

          {/* Subtle Vertical Architectural Divider */}
          <div className="hidden xl:flex items-center gap-2.5 pl-6 border-l border-[var(--border-card)] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 bg-emerald-500 inline-block" />
            <span>SYS // LIMA • AQP • NORTE</span>
          </div>
        </div>

        {/* 2. Desktop Architectural Navigation Deck */}
        <div className="hidden md:flex items-center h-full">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => sounds.playWoodClick()}
                className={`relative h-full px-4 lg:px-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? 'text-[var(--text-primary)] bg-[#F4F2ED]/[0.03]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="font-mono text-[9px] text-[var(--text-muted)] font-normal">
                  {link.code}
                </span>
                <span>{link.name}</span>
                {link.isLive && <LiveWaveformIcon className="w-4 h-3.5 text-[#D9232E]" />}

                {isActive && (
                  <motion.span
                    layoutId="navbar-active-laser"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D9232E]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* 3. Right Command Deck (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Quick Direct Access for Organizer / Admin Mode */}
          {canManage && (
            <Link
              href="/dashboard/organizer"
              onClick={() => sounds.playWoodClick()}
              className={`hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-[0.14em] transition-all ${
                pathname.startsWith('/dashboard/organizer')
                  ? 'bg-[#D9232E] text-white border-[#D9232E]'
                  : 'bg-[#D9232E]/10 text-[#D9232E] border-[#D9232E]/35 hover:bg-[#D9232E]/20'
              }`}
            >
              <CommandConsoleIcon className="w-3.5 h-3.5" />
              <span>Consola Organizador</span>
            </Link>
          )}

          {/* Quick Command Palette Trigger (Ctrl+K) */}
          <button
            type="button"
            data-no-sound
            onClick={triggerCommandPalette}
            aria-label="Abrir buscador rápido (Ctrl+K)"
            className="hidden lg:inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-[var(--bg-arena)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-card)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#D9232E]" aria-hidden="true" />
            <span className="text-[11px] font-medium">Comando</span>
            <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]">
              CTRL K
            </kbd>
          </button>

          {/* Persistent Global Sound Mute Toggle */}
          <SoundToggle />

          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              <NotificationCenterDrawer />

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2.5 py-1.5 pl-2 pr-3 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] hover:border-[#D9232E]/60 transition-all text-sm cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-sm bg-[#18181C] border border-[#F4F2ED]/15 flex items-center justify-center font-bold text-[#F4F2ED] text-xs overflow-hidden shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      `${user.first_name[0]}${user.last_name[0]}`
                    )}
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <p className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wide">
                      {user.first_name}
                    </p>
                    <p className="font-mono text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.16em]">
                      {user.role === 'ADMIN'
                        ? 'ROOT // ADMIN'
                        : user.role === 'ORGANIZER'
                          ? 'OPS // ORGANIZADOR'
                          : 'ID // COMPETIDOR'}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -4 }}
                      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute right-0 mt-2 w-72 double-bezel z-50"
                    >
                      <div className="double-bezel-inner py-2 overflow-hidden">
                        <div className="px-4 py-3 border-b border-[var(--border-card)] bg-[var(--bg-arena)]/50">
                          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            DOSSIER INSTITUCIONAL
                          </p>
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate mt-1">
                            {user.email}
                          </p>
                          <span
                            className={`mt-2 inline-block px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-[0.14em] ${
                              user.role === 'ADMIN'
                                ? 'bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/35'
                                : user.role === 'ORGANIZER'
                                  ? 'bg-[#D9232E]/15 text-[#D9232E] border border-[#D9232E]/35'
                                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-card)]'
                            }`}
                          >
                            {user.role === 'ADMIN'
                              ? 'MODO: SUPER ADMINISTRADOR'
                              : user.role === 'ORGANIZER'
                                ? 'MODO: ORGANIZADOR OFICIAL'
                                : 'MODO: COMPETIDOR VERIFICADO'}
                          </span>
                        </div>

                        <div className="py-1.5">
                          <Link
                            href="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)] flex items-center justify-between transition-colors font-semibold"
                          >
                            <span className="flex items-center gap-2.5">
                              <UserIcon className="w-4 h-4 text-[#D9232E]" />
                              Dossier & Medallero de Jugador
                            </span>
                            <span className="font-mono text-[9px] text-[var(--text-muted)]">01</span>
                          </Link>

                          <Link
                            href="/ranking"
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)] flex items-center justify-between transition-colors font-semibold"
                          >
                            <span className="flex items-center gap-2.5">
                              <Trophy className="w-4 h-4 text-[#C5A059]" />
                              Clasificación General
                            </span>
                            <span className="font-mono text-[9px] text-[var(--text-muted)]">02</span>
                          </Link>

                          {(isAdmin || isOrganizer) && (
                            <Link
                              href="/dashboard/organizer"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-4 py-2.5 text-xs text-left text-[var(--text-primary)] hover:bg-[var(--bg-arena)] flex items-center justify-between transition-colors font-bold border-t border-[var(--border-card)] mt-1 pt-2.5"
                            >
                              <span className="flex items-center gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-[#D9232E]" />
                                Consola de Organizador & Crear Torneo
                              </span>
                              <span className="font-mono text-[9px] text-[#D9232E]">OPS</span>
                            </Link>
                          )}

                          {isAdmin && (
                            <Link
                              href="/admin/organizers"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-4 py-2.5 text-xs text-left text-[#C5A059] hover:bg-[var(--bg-arena)] flex items-center justify-between transition-colors font-bold"
                            >
                              <span className="flex items-center gap-2.5">
                                <Crown className="w-4 h-4 text-[#C5A059]" />
                                Control Root & Moderación
                              </span>
                              <span className="font-mono text-[9px] text-[#C5A059]">ROOT</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-[var(--border-card)] pt-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-xs text-left text-[#D9232E] hover:bg-[var(--bg-arena)] flex items-center gap-2.5 transition-colors cursor-pointer font-bold uppercase tracking-wider"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="group btn-primary py-2 px-4 text-xs font-bold uppercase tracking-[0.12em] flex items-center gap-2.5"
            >
              <img
                src="/brand/tecsup_emblem.png"
                alt="Tecsup"
                className="w-4 h-4 object-contain"
              />
              <span>Acceso @tecsup</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>

        {/* 4. Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-1.5">
          <SoundToggle />
          <ThemeToggle />
          {isAuthenticated && <NotificationCenterDrawer />}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
            className="min-w-10 min-h-10 flex items-center justify-center rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden border-b border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                      isActive
                        ? 'bg-[#D9232E] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-arena)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[10px] opacity-60">{link.code}</span>
                      <span>{link.name}</span>
                    </span>
                    {link.isLive && <LiveWaveformIcon className="w-4 h-3.5 text-current" />}
                  </Link>
                );
              })}

              <div className="border-t border-[var(--border-card)] pt-3 mt-2 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2.5 rounded-sm bg-[var(--bg-arena)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 uppercase tracking-wider"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#D9232E]" />
                        Mi Dossier
                      </Link>

                      {(isAdmin || isOrganizer) && (
                        <Link
                          href="/dashboard/organizer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2.5 rounded-sm bg-[#D9232E]/15 border border-[#D9232E]/35 text-xs font-bold text-[#D9232E] flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Organizador
                        </Link>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin/organizers"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full px-3 py-2.5 rounded-sm bg-[#C5A059]/15 border border-[#C5A059]/35 text-xs font-bold text-[#C5A059] flex items-center justify-center gap-2 uppercase tracking-wider"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        Panel Root Admin
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-center px-3 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-[#D9232E] bg-[#D9232E]/10 border border-[#D9232E]/25 cursor-pointer"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center btn-primary py-3 text-xs font-bold uppercase tracking-[0.14em]"
                  >
                    Ingresar con @tecsup.edu.pe
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
