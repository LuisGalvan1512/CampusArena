'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { GAME_CATALOG, type GameCode } from '@/lib/games';
import {
  X,
  Save,
  Loader2,
  Calendar,
  Trophy,
  FileText,
  Settings,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  AegisTrophyIcon,
  CommandConsoleIcon,
  GameDisciplineEmblem,
} from '@/components/EsportsIcons';

interface EditTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: any;
  onSuccess: (updated: any) => void;
}

const BANNER_PRESETS = [
  { label: 'Estadio Arena', url: '/assets/arena_hero_stage.jpg' },
  { label: 'Túnel Jugadores', url: '/assets/banner_stadium_tunnel.jpg' },
  { label: 'Control Broadcast', url: '/assets/banner_command_center.jpg' },
  { label: 'Hardware Pro', url: '/assets/banner_pro_gear.jpg' },
  { label: 'Pedestal Aegis', url: '/assets/arena_trophy_pedestal.jpg' },
];

const formatDateForInput = (dateVal: any) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

export function EditTournamentModal({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}: EditTournamentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    game_code: 'CLASH_ROYALE',
    organization_name: 'Tecsup',
    campus_name: 'Lima',
    event_modality: 'PRESENTIAL',
    description_short: '',
    description_full: '',
    rules_text: '',
    banner_url: '',
    status: 'REGISTRATION_OPEN',
    format: '1 vs 1 (BO3 / BO5)',
    team_size: 1,
    stream_url: '',
    stream_platform: 'KICK',
    max_slots: 16,
    min_slots: 8,
    cost: 0,
    currency: 'PEN',
    prize_pool: 'S/ 500.00 en Premios',
    prize_1: '100% del pozo acumulado',
    prize_2: '',
    prize_3: '',
    contact_email: 'esports@tecsup.edu.pe',
    registration_open_at: '',
    registration_close_at: '',
    tournament_start_at: '',
  });

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name || '',
        game_code: tournament.game_code || 'CLASH_ROYALE',
        organization_name: tournament.organization_name || 'Tecsup',
        campus_name: tournament.campus_name || 'Lima',
        event_modality:
          tournament.event_modality || (tournament.is_online ? 'ONLINE' : 'PRESENTIAL'),
        description_short: tournament.description_short || '',
        description_full: tournament.description_full || '',
        rules_text: tournament.rules_text || '',
        banner_url: tournament.banner_url || '',
        status: tournament.status || 'REGISTRATION_OPEN',
        format: tournament.format || '1 vs 1 (BO3 / BO5)',
        team_size: tournament.team_size || 1,
        stream_url: tournament.stream_url || '',
        stream_platform: tournament.stream_platform || 'KICK',
        max_slots: tournament.max_slots || 16,
        min_slots: tournament.min_slots || 8,
        cost: tournament.cost || 0,
        currency: tournament.currency || 'PEN',
        prize_pool: tournament.prize_pool || 'S/ 500.00 en Premios',
        prize_1:
          tournament.prize_distribution?.first_place ||
          tournament.prize_pool ||
          '100% del pozo acumulado',
        prize_2: tournament.prize_distribution?.second_place || '',
        prize_3: tournament.prize_distribution?.third_place || '',
        contact_email: tournament.contact_email || 'esports@tecsup.edu.pe',
        registration_open_at: formatDateForInput(tournament.registration_open_at),
        registration_close_at: formatDateForInput(tournament.registration_close_at),
        tournament_start_at: formatDateForInput(tournament.tournament_start_at),
      });
    }
  }, [tournament, isOpen]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !tournament) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { prize_1, prize_2, prize_3, ...cleanFormData } = formData;
      const payload: any = {
        ...cleanFormData,
        cost: Number(formData.cost),
        max_slots: Number(formData.max_slots),
        min_slots: Number(formData.min_slots),
        team_size: Number(formData.team_size),
        event_modality: formData.event_modality,
        is_online: formData.event_modality === 'ONLINE',
        prize_distribution: {
          first_place: formData.prize_1?.trim() || undefined,
          second_place: formData.prize_2?.trim() || undefined,
          third_place: formData.prize_3?.trim() || undefined,
        },
        stream_url: formData.stream_url?.trim() || null,
        stream_platform: formData.stream_platform,
        registration_open_at: formData.registration_open_at
          ? new Date(formData.registration_open_at).toISOString()
          : undefined,
        registration_close_at: formData.registration_close_at
          ? new Date(formData.registration_close_at).toISOString()
          : undefined,
        tournament_start_at: formData.tournament_start_at
          ? new Date(formData.tournament_start_at).toISOString()
          : undefined,
      };

      const res = await api.patch(`/tournaments/${tournament.id}`, payload);
      if (res.success && res.data) {
        setSuccessMsg('¡Parámetros del torneo actualizados correctamente!');
        setTimeout(() => {
          onSuccess(res.data);
          onClose();
        }, 900);
      } else {
        setErrorMsg(res.error?.message || 'Error al actualizar el torneo.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedGame =
    GAME_CATALOG[formData.game_code as GameCode] || GAME_CATALOG.CLASH_ROYALE;
  const previewBanner =
    formData.banner_url?.trim() || selectedGame.bannerUrl || '/assets/arena_hero_stage.jpg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col double-bezel shadow-2xl overflow-hidden">
        <div className="double-bezel-inner flex flex-col max-h-[89vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)] bg-[#070709]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-[#D9232E]/15 border border-[#D9232E]/40 text-[#D9232E] flex items-center justify-center">
                <CommandConsoleIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono-data uppercase tracking-[0.2em] text-[#D9232E] font-bold">
                  ESTUDIO DE EDICIÓN DE TORNEO
                </p>
                <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)] uppercase tracking-tight">
                  Modificar Parámetros de Competición
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-sm hover:bg-white/[0.04] border border-transparent hover:border-[var(--border-card)] transition-colors cursor-pointer"
              aria-label="Cerrar estudio de edición"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2-Column Studio Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left 8 Columns: Form Controls */}
            <div className="lg:col-span-8 space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-sm bg-[#D9232E]/10 border border-[#D9232E]/35 text-[#D9232E] text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-sm bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Section 1: General Info */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-mono-data font-bold uppercase tracking-[0.2em] text-[#C5A059] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#D9232E]" />
                  01 // INFORMACIÓN GENERAL Y ESTADO
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Nombre del Torneo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-arena w-full text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Disciplina Oficial
                    </label>
                    <select
                      name="game_code"
                      value={formData.game_code}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    >
                      {Object.values(GAME_CATALOG).map((g) => (
                        <option
                          key={g.code}
                          value={g.code}
                          className="bg-[#0D0D10] text-[var(--text-primary)]"
                        >
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Estado Operativo
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="input-arena w-full text-xs font-bold text-emerald-400"
                    >
                      <option value="DRAFT" className="bg-[#0D0D10] text-white">
                        Borrador (DRAFT)
                      </option>
                      <option value="PUBLISHED" className="bg-[#0D0D10] text-white">
                        Publicado (PUBLISHED)
                      </option>
                      <option value="REGISTRATION_OPEN" className="bg-[#0D0D10] text-white">
                        Inscripciones Abiertas (REGISTRATION_OPEN)
                      </option>
                      <option value="REGISTRATION_CLOSED" className="bg-[#0D0D10] text-white">
                        Inscripciones Cerradas (REGISTRATION_CLOSED)
                      </option>
                      <option value="IN_PROGRESS" className="bg-[#0D0D10] text-white">
                        En Progreso / Brackets Activos (IN_PROGRESS)
                      </option>
                      <option value="FINISHED" className="bg-[#0D0D10] text-white">
                        Concluido / Premiado (FINISHED)
                      </option>
                      <option value="CANCELLED" className="bg-[#0D0D10] text-white">
                        Cancelado (CANCELLED)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Organización Responsable
                    </label>
                    <input
                      type="text"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Modalidad del Evento
                    </label>
                    <select
                      name="event_modality"
                      value={formData.event_modality}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    >
                      <option value="PRESENTIAL" className="bg-[#0D0D10] text-white">
                        Presencial (Campus Tecsup)
                      </option>
                      <option value="ONLINE" className="bg-[#0D0D10] text-white">
                        100% Virtual / Remoto
                      </option>
                      <option value="HYBRID" className="bg-[#0D0D10] text-white">
                        Híbrido (Clasificatorias Online • Final Presencial)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Sede / Campus Tecsup
                    </label>
                    <select
                      name="campus_name"
                      value={formData.campus_name}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    >
                      <option value="Lima" className="bg-[#0D0D10] text-white">
                        Sede Lima (Santa Anita)
                      </option>
                      <option value="Arequipa" className="bg-[#0D0D10] text-white">
                        Sede Arequipa
                      </option>
                      <option value="Trujillo" className="bg-[#0D0D10] text-white">
                        Sede Trujillo
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Email Oficial de Contacto
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Descripción Corta (Subtítulo)
                    </label>
                    <input
                      type="text"
                      name="description_short"
                      value={formData.description_short}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Descripción Completa
                    </label>
                    <textarea
                      name="description_full"
                      rows={3}
                      value={formData.description_full}
                      onChange={handleChange}
                      className="input-arena w-full text-xs leading-relaxed"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#D9232E]" />
                      Banner Fotográfico (URL o Presets Oficiales)
                    </label>
                    <input
                      type="url"
                      name="banner_url"
                      value={formData.banner_url}
                      onChange={handleChange}
                      placeholder="https://... o selecciona un preset inferior"
                      className="input-arena w-full text-xs"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {BANNER_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, banner_url: preset.url }))
                          }
                          className={`px-2.5 py-1 rounded-sm text-[10px] font-mono-data uppercase tracking-wider border transition-colors cursor-pointer ${
                            formData.banner_url === preset.url
                              ? 'bg-[#D9232E] text-white border-[#D9232E] font-bold'
                              : 'bg-[#070709] text-[var(--text-secondary)] border-[var(--border-card)] hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Dates & Schedule */}
              <div className="space-y-4 pt-5 border-t border-[var(--border-card)]">
                <h3 className="text-[11px] font-mono-data font-bold uppercase tracking-[0.2em] text-[#C5A059] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D9232E]" />
                  02 // CRONOGRAMA OFICIAL
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Apertura Inscripciones
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_open_at"
                      value={formData.registration_open_at}
                      onChange={handleChange}
                      required
                      className="input-arena w-full text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Cierre Inscripciones
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_close_at"
                      value={formData.registration_close_at}
                      onChange={handleChange}
                      required
                      className="input-arena w-full text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Inicio de Torneo
                    </label>
                    <input
                      type="datetime-local"
                      name="tournament_start_at"
                      value={formData.tournament_start_at}
                      onChange={handleChange}
                      required
                      className="input-arena w-full text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Slots, Formats & Prizes */}
              <div className="space-y-4 pt-5 border-t border-[var(--border-card)]">
                <h3 className="text-[11px] font-mono-data font-bold uppercase tracking-[0.2em] text-[#C5A059] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#D9232E]" />
                  03 // CUPOS, FORMATO Y PREMIOS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Cupos Máximos
                    </label>
                    <input
                      type="number"
                      name="max_slots"
                      min={2}
                      max={64}
                      value={formData.max_slots}
                      onChange={handleChange}
                      className="input-arena w-full text-xs font-mono-data"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Cupos Mínimos
                    </label>
                    <input
                      type="number"
                      name="min_slots"
                      min={2}
                      max={64}
                      value={formData.min_slots}
                      onChange={handleChange}
                      className="input-arena w-full text-xs font-mono-data"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Costo Inscripción (S/)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className="input-arena w-full text-xs font-mono-data"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Pozo Acumulado Oficial
                    </label>
                    <input
                      type="text"
                      name="prize_pool"
                      value={formData.prize_pool}
                      onChange={handleChange}
                      placeholder="Ej. S/ 500.00 en Premios"
                      className="input-arena w-full text-xs text-[#C5A059] font-bold"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-2.5 p-4 rounded-sm bg-[#070709] border border-[var(--border-card)]">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[#C5A059] font-bold flex items-center gap-1.5">
                      <AegisTrophyIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                      Distribución de Premios por Puesto
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono-data font-bold text-[#C5A059]">
                          01° CAMPEÓN
                        </span>
                        <input
                          type="text"
                          name="prize_1"
                          value={formData.prize_1}
                          onChange={handleChange}
                          className="input-arena w-full text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono-data font-bold text-slate-300">
                          02° SUBCAMPEÓN
                        </span>
                        <input
                          type="text"
                          name="prize_2"
                          value={formData.prize_2}
                          onChange={handleChange}
                          placeholder="Opcional"
                          className="input-arena w-full text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono-data font-bold text-amber-600">
                          03° PODIO
                        </span>
                        <input
                          type="text"
                          name="prize_3"
                          value={formData.prize_3}
                          onChange={handleChange}
                          placeholder="Opcional"
                          className="input-arena w-full text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Reglamento de Competición
                    </label>
                    <textarea
                      name="rules_text"
                      rows={4}
                      value={formData.rules_text}
                      onChange={handleChange}
                      className="input-arena w-full text-xs font-mono-data leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Teams & Streaming */}
              <div className="space-y-4 pt-5 border-t border-[var(--border-card)]">
                <h3 className="text-[11px] font-mono-data font-bold uppercase tracking-[0.2em] text-[#C5A059] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#D9232E]" />
                  04 // ESCUADRAS Y SEÑAL DE STREAMING
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Tamaño de Equipo
                    </label>
                    <select
                      name="team_size"
                      value={formData.team_size}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    >
                      <option value={1} className="bg-[#0D0D10] text-white">
                        1 vs 1 (Individual / Solos)
                      </option>
                      <option value={2} className="bg-[#0D0D10] text-white">
                        2 vs 2 (Dúos)
                      </option>
                      <option value={3} className="bg-[#0D0D10] text-white">
                        3 vs 3 (Tríos / Brawl Stars)
                      </option>
                      <option value={4} className="bg-[#0D0D10] text-white">
                        4 vs 4 (Escuadras Fortnite / L4D2)
                      </option>
                      <option value={5} className="bg-[#0D0D10] text-white">
                        5 vs 5 (Equipos Dota 2)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Plataforma de Stream
                    </label>
                    <select
                      name="stream_platform"
                      value={formData.stream_platform}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    >
                      <option value="KICK" className="bg-[#0D0D10] text-white">
                        Kick
                      </option>
                      <option value="TWITCH" className="bg-[#0D0D10] text-white">
                        Twitch
                      </option>
                      <option value="YOUTUBE" className="bg-[#0D0D10] text-white">
                        YouTube
                      </option>
                      <option value="TIKTOK" className="bg-[#0D0D10] text-white">
                        TikTok Live
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Canal o URL del Stream
                    </label>
                    <input
                      type="text"
                      name="stream_url"
                      placeholder="Ej. lusen15"
                      value={formData.stream_url}
                      onChange={handleChange}
                      className="input-arena w-full text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Live Preview Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="sticky top-0 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-2.5">
                  <span className="text-[10px] font-mono-data uppercase tracking-[0.2em] text-[#C5A059] font-bold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#D9232E]" />
                    VISTA PREVIA EN TIEMPO REAL
                  </span>
                  <span className="text-[9px] font-mono-data text-[var(--text-muted)] uppercase">
                    CATÁLOGO OFICIAL
                  </span>
                </div>

                <div className="double-bezel">
                  <div className="double-bezel-inner overflow-hidden">
                    <div className="relative h-44 bg-[#070709] overflow-hidden border-b border-[var(--border-card)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewBanner}
                        alt="Preview Banner"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-[#0D0D10]/30 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#070709]/90 border border-white/15">
                        <GameDisciplineEmblem
                          code={formData.game_code}
                          className="w-3.5 h-3.5 text-[#D9232E]"
                        />
                        <span className="font-mono-data text-[9px] font-bold uppercase tracking-widest text-white">
                          {selectedGame.shortName}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-sm bg-[#070709]/85 border border-white/15 text-[9px] font-mono-data uppercase tracking-widest text-[var(--text-secondary)]">
                          Sede {formData.campus_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-sm bg-[#D9232E]/20 border border-[#D9232E]/40 text-[9px] font-mono-data font-bold uppercase tracking-widest text-[#D9232E]">
                          {formData.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 bg-[#0D0D10]">
                      <h4 className="font-display text-base font-extrabold text-[var(--text-primary)] uppercase tracking-tight line-clamp-2">
                        {formData.name || 'Nombre del Torneo'}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                        {formData.description_short ||
                          'Competición universitaria oficial verificada por Tecsup Esports.'}
                      </p>

                      <div className="pt-2 border-t border-[var(--border-card)] grid grid-cols-2 gap-2 text-[10px] font-mono-data">
                        <div className="p-2 rounded-sm bg-[#070709] border border-[var(--border-card)]">
                          <span className="text-[var(--text-muted)] block uppercase">PREMIO</span>
                          <span className="text-[#C5A059] font-bold truncate block">
                            {formData.prize_pool}
                          </span>
                        </div>
                        <div className="p-2 rounded-sm bg-[#070709] border border-[var(--border-card)]">
                          <span className="text-[var(--text-muted)] block uppercase">CUPOS</span>
                          <span className="text-[var(--text-primary)] font-bold block">
                            {formData.max_slots} MAX •{' '}
                            {Number(formData.cost) > 0 ? `S/ ${formData.cost}` : 'GRATIS'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Action Buttons inside Sticky Column */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar Modificaciones
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary w-full py-2.5 text-xs cursor-pointer"
                  >
                    Cancelar y Cerrar
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
