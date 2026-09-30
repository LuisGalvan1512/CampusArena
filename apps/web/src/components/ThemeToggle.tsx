'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-white/10 bg-white/5 opacity-40 animate-pulse ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 group cursor-pointer ${
        isDark
          ? 'bg-[#15161E] border-white/10 hover:border-amber-400/50 text-amber-400 hover:bg-amber-400/10 shadow-sm'
          : 'bg-white border-slate-200 hover:border-indigo-400/50 text-indigo-600 hover:bg-indigo-50 shadow-sm'
      } ${className}`}
      title={isDark ? 'Cambiar a Modo Claro (Warm Slate)' : 'Cambiar a Modo Oscuro (Obsidian)'}
      aria-label="Alternar tema"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 text-slate-700" />
        )}
      </div>
    </button>
  );
}
