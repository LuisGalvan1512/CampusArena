'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Sparkles,
  User,
  X,
  CheckCircle2,
  Zap,
  MessageSquare,
} from 'lucide-react';
import {
  useProfileCustomization,
  ACCENT_COLORS,
  STATUS_MOODS,
  CARD_EFFECTS,
  type AccentColor,
  type StatusMood,
  type CardEffect,
} from '@/lib/useProfileCustomization';
import { toast } from 'sonner';

export function ProfileCustomizationPanel() {
  const {
    accentColor,
    statusMood,
    customTitle,
    cardEffect,
    showBadgeAnimations,
    setAccentColor,
    setStatusMood,
    setCustomTitle,
    setCardEffect,
    setShowBadgeAnimations,
  } = useProfileCustomization();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'status' | 'effects'>('colors');

  const handleSave = () => {
    toast.success('¡Personalización guardada! Se aplica automáticamente.');
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-secondary px-3.5 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-[#E63946]/50 shrink-0 group"
        title="Personalizar tu perfil con colores, estados y efectos"
      >
        <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
        <span>Personalizar</span>
      </button>

      {/* Full Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg arena-card p-0 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-card)]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${ACCENT_COLORS[accentColor].hex}20` }}
                  >
                    <Palette className="w-5 h-5" style={{ color: ACCENT_COLORS[accentColor].hex }} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[var(--text-primary)]">Centro de Personalización</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Todo se guarda en tu navegador automáticamente</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[var(--border-card)]">
                {[
                  { id: 'colors' as const, label: 'Colores', icon: Palette },
                  { id: 'status' as const, label: 'Estado', icon: MessageSquare },
                  { id: 'effects' as const, label: 'Efectos', icon: Zap },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
                        activeTab === tab.id
                          ? 'border-[#E63946] text-[#E63946] bg-[#E63946]/5'
                          : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* COLORS TAB */}
                {activeTab === 'colors' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Color de Acento Personal
                      </label>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Este color se usa en bordes, efectos de brillo y resaltados de tu perfil.
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(
                          ([key, color]) => (
                            <button
                              key={key}
                              onClick={() => setAccentColor(key)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center group hover:scale-105 ${
                                accentColor === key
                                  ? 'border-2 shadow-lg scale-105'
                                  : 'border-[var(--border-card)] hover:border-[var(--text-secondary)]'
                              }`}
                              style={accentColor === key ? { borderColor: color.hex, boxShadow: `0 0 20px ${color.hex}30` } : {}}
                            >
                              <div
                                className="w-8 h-8 rounded-full mx-auto mb-1.5 shadow-md"
                                style={{ background: `linear-gradient(135deg, ${color.hex}, ${color.hex}AA)` }}
                              />
                              <span className="text-[10px] font-bold text-[var(--text-primary)] leading-none block">
                                {color.name}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Custom Title */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Título Personalizado
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Ej. El Estratega Supremo, Rey del Clutch..."
                        maxLength={40}
                        className="input-arena text-xs"
                      />
                      <p className="text-[10px] text-[var(--text-muted)]">
                        Aparece debajo de tu nombre en el perfil público. Máx. 40 caracteres.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* STATUS TAB */}
                {activeTab === 'status' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Estado / Disponibilidad
                      </label>
                      <div className="space-y-2">
                        {(Object.entries(STATUS_MOODS) as [StatusMood, typeof STATUS_MOODS[StatusMood]][]).map(
                          ([key, mood]) => (
                            <button
                              key={key}
                              onClick={() => setStatusMood(key)}
                              className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                                statusMood === key
                                  ? 'bg-[#E63946]/10 border-[#E63946] shadow-sm'
                                  : 'border-[var(--border-card)] hover:border-[var(--text-secondary)] bg-[var(--bg-arena)]'
                              }`}
                            >
                              <span className="text-lg">{mood.emoji}</span>
                              <div>
                                <p className="text-xs font-bold text-[var(--text-primary)]">{mood.label}</p>
                              </div>
                              {statusMood === key && (
                                <CheckCircle2 className="w-4 h-4 text-[#E63946] ml-auto" />
                              )}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* EFFECTS TAB */}
                {activeTab === 'effects' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Efecto Visual de Tarjeta
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(Object.entries(CARD_EFFECTS) as [CardEffect, typeof CARD_EFFECTS[CardEffect]][]).map(
                          ([key, effect]) => (
                            <button
                              key={key}
                              onClick={() => setCardEffect(key)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                cardEffect === key
                                  ? 'bg-[#E63946]/10 border-[#E63946] shadow-sm'
                                  : 'border-[var(--border-card)] hover:border-[var(--text-secondary)] bg-[var(--bg-arena)]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[var(--text-primary)]">{effect.name}</span>
                                {cardEffect === key && <CheckCircle2 className="w-3.5 h-3.5 text-[#E63946]" />}
                              </div>
                              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{effect.desc}</p>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Badge Animations Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)]">
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">Animaciones de insignias</p>
                        <p className="text-[10px] text-[var(--text-secondary)]">Efecto shine en medallas del medallero</p>
                      </div>
                      <button
                        onClick={() => setShowBadgeAnimations(!showBadgeAnimations)}
                        className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${
                          showBadgeAnimations ? 'bg-[#E63946]' : 'bg-[var(--border-card)]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                            showBadgeAnimations ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--border-card)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ACCENT_COLORS[accentColor].hex }} />
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {STATUS_MOODS[statusMood].emoji} {STATUS_MOODS[statusMood].label} • {CARD_EFFECTS[cardEffect].name}
                  </span>
                </div>
                <button onClick={handleSave} className="btn-primary px-5 py-2 text-xs cursor-pointer">
                  Listo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
