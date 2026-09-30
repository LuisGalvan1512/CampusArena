'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { GAME_CATALOG } from '@/lib/games';
import { 
  X, 
  Save, 
  Loader2, 
  Calendar, 
  Trophy, 
  FileText, 
  Settings, 
  Users, 
  DollarSign, 
  Mail, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface EditTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: any;
  onSuccess: (updated: any) => void;
}

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
        event_modality: tournament.event_modality || (tournament.is_online ? 'ONLINE' : 'PRESENTIAL'),
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
        prize_1: tournament.prize_distribution?.first_place || tournament.prize_pool || '100% del pozo acumulado',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        registration_open_at: formData.registration_open_at ? new Date(formData.registration_open_at).toISOString() : undefined,
        registration_close_at: formData.registration_close_at ? new Date(formData.registration_close_at).toISOString() : undefined,
        tournament_start_at: formData.tournament_start_at ? new Date(formData.tournament_start_at).toISOString() : undefined,
      };

      const res = await api.patch(`/tournaments/${tournament.id}`, payload);
      if (res.success && res.data) {
        setSuccessMsg('¡Torneo actualizado correctamente!');
        setTimeout(() => {
          onSuccess(res.data);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.error?.message || 'Error al actualizar el torneo.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col arena-card bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E63946]/20 text-[#E63946] flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">Panel de Modificación de Torneo</h2>
              <p className="text-xs text-[var(--text-secondary)]">Edita parámetros oficiales, fechas, reglas y estado de la competición</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-arena)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#A8DADC] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              1. Información General
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Nombre Oficial del Torneo</label>
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
                <label className="text-xs font-bold text-[var(--text-primary)]">Videojuego Oficial</label>
                <select
                  name="game_code"
                  value={formData.game_code}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                >
                  {Object.values(GAME_CATALOG).map((g) => (
                    <option key={g.code} value={g.code} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Estado de la Competición</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-arena w-full text-xs font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <option value="DRAFT" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Borrador (DRAFT)</option>
                  <option value="PUBLISHED" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Publicado (PUBLISHED)</option>
                  <option value="REGISTRATION_OPEN" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Inscripciones Abiertas (REGISTRATION_OPEN)</option>
                  <option value="REGISTRATION_CLOSED" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Inscripciones Cerradas (REGISTRATION_CLOSED)</option>
                  <option value="IN_PROGRESS" className="bg-[var(--bg-card)] text-[var(--text-primary)]">En Progreso / Brackets Activos (IN_PROGRESS)</option>
                  <option value="FINISHED" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Concluido / Premiado (FINISHED)</option>
                  <option value="CANCELLED" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Cancelado (CANCELLED)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Organización Responsable</label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Modalidad del Evento</label>
                <select
                  name="event_modality"
                  value={formData.event_modality}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                >
                  <option value="PRESENTIAL" className="bg-[var(--bg-card)] text-[var(--text-primary)]">📍 100% Presencial (Campus Tecsup)</option>
                  <option value="ONLINE" className="bg-[var(--bg-card)] text-[var(--text-primary)]">🌐 100% Virtual / Remoto</option>
                  <option value="HYBRID" className="bg-[var(--bg-card)] text-[var(--text-primary)]">⚡ Híbrido (Previas Online • Final Presencial)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Sede / Campus Tecsup</label>
                <select
                  name="campus_name"
                  value={formData.campus_name}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                >
                  <option value="Lima" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Sede Lima (Santa Anita)</option>
                  <option value="Arequipa" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Sede Arequipa</option>
                  <option value="Trujillo" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Sede Trujillo</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Descripción Corta</label>
                <input
                  type="text"
                  name="description_short"
                  value={formData.description_short}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Descripción Completa</label>
                <textarea
                  name="description_full"
                  rows={3}
                  value={formData.description_full}
                  onChange={handleChange}
                  className="input-arena w-full text-xs leading-relaxed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#457B9D]" />
                  URL del Banner
                </label>
                <input
                  type="url"
                  name="banner_url"
                  value={formData.banner_url}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dates & Schedule */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-card)]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#A8DADC] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              2. Fechas & Horarios Oficiales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Apertura Inscripciones</label>
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
                <label className="text-xs font-bold text-[var(--text-primary)]">Cierre Inscripciones</label>
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
                <label className="text-xs font-bold text-[var(--text-primary)]">Inicio de Torneo</label>
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
          <div className="space-y-4 pt-4 border-t border-[var(--border-card)]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#A8DADC] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              3. Cupos, Formato & Premios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Cupos Máximos</label>
                <input
                  type="number"
                  name="max_slots"
                  min={2}
                  max={64}
                  value={formData.max_slots}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Cupos Mínimos</label>
                <input
                  type="number"
                  name="min_slots"
                  min={2}
                  max={64}
                  value={formData.min_slots}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Costo de Inscripción (PEN)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Pozo Acumulado Oficial</label>
                <input
                  type="text"
                  name="prize_pool"
                  value={formData.prize_pool}
                  onChange={handleChange}
                  placeholder="Ej. Pozo (S/.9 por equipo) o S/ 500"
                  className="input-arena w-full text-xs text-amber-500 dark:text-amber-400 font-bold"
                />
              </div>

              {/* Manual Prize Breakdown per Place */}
              <div className="sm:col-span-3 space-y-2.5 p-3.5 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)]">
                <label className="text-xs font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  Distribución Manual de Premios por Puesto
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center gap-1">🥇 1er Lugar</span>
                    <input
                      type="text"
                      name="prize_1"
                      value={formData.prize_1}
                      onChange={handleChange}
                      placeholder="Ej. 100% del pozo acumulado"
                      className="input-arena w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">🥈 2do Lugar</span>
                    <input
                      type="text"
                      name="prize_2"
                      value={formData.prize_2}
                      onChange={handleChange}
                      placeholder="Opcional (dejar vacío si no aplica)"
                      className="input-arena w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">🥉 3er Lugar</span>
                    <input
                      type="text"
                      name="prize_3"
                      value={formData.prize_3}
                      onChange={handleChange}
                      placeholder="Opcional (dejar vacío si no aplica)"
                      className="input-arena w-full text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Email de Contacto</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Reglamento Oficial de Competición</label>
                <textarea
                  name="rules_text"
                  rows={4}
                  value={formData.rules_text}
                  onChange={handleChange}
                  className="input-arena w-full text-xs font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Teams & Streaming */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-card)]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#A8DADC] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              4. Modalidad de Equipos & Transmisión Oficial
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Tamaño de Equipo</label>
                <select
                  name="team_size"
                  value={formData.team_size}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                >
                  <option value={1} className="bg-[var(--bg-card)] text-[var(--text-primary)]">1 vs 1 (Individual / Solos)</option>
                  <option value={2} className="bg-[var(--bg-card)] text-[var(--text-primary)]">2 vs 2 (Dúos)</option>
                  <option value={3} className="bg-[var(--bg-card)] text-[var(--text-primary)]">3 vs 3 (Tríos / Brawl Stars)</option>
                  <option value={4} className="bg-[var(--bg-card)] text-[var(--text-primary)]">4 vs 4 (Escuadras Fortnite / L4D2)</option>
                  <option value={5} className="bg-[var(--bg-card)] text-[var(--text-primary)]">5 vs 5 (Equipos Dota 2 / CS2)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Plataforma de Stream</label>
                <select
                  name="stream_platform"
                  value={formData.stream_platform}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                >
                  <option value="KICK" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Kick</option>
                  <option value="TWITCH" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Twitch</option>
                  <option value="YOUTUBE" className="bg-[var(--bg-card)] text-[var(--text-primary)]">YouTube</option>
                  <option value="TIKTOK" className="bg-[var(--bg-card)] text-[var(--text-primary)]">TikTok Live</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Canal o URL del Stream</label>
                <input
                  type="text"
                  name="stream_url"
                  placeholder="Ej. lusen15 o https://kick.com/lusen15"
                  value={formData.stream_url}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-card)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-5 py-2.5 text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#E63946]/30"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Modificaciones
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
