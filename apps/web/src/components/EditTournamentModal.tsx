'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
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

export function EditTournamentModal({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}: EditTournamentModalProps) {
  if (!isOpen || !tournament) return null;

  const [formData, setFormData] = useState({
    name: tournament.name || '',
    game_code: tournament.game_code || 'CLASH_ROYALE',
    organization_name: tournament.organization_name || 'Tecsup',
    campus_name: tournament.campus_name || 'Lima',
    description_short: tournament.description_short || '',
    description_full: tournament.description_full || '',
    rules_text: tournament.rules_text || '',
    banner_url: tournament.banner_url || '',
    status: tournament.status || 'REGISTRATION_OPEN',
    format: tournament.format || '1 vs 1 (BO3 / BO5)',
    max_slots: tournament.max_slots || 16,
    min_slots: tournament.min_slots || 8,
    cost: tournament.cost || 0,
    currency: tournament.currency || 'PEN',
    prize_pool: tournament.prize_pool || 'S/ 500.00 en Premios',
    contact_email: tournament.contact_email || 'esports@tecsup.edu.pe',
    registration_open_at: tournament.registration_open_at 
      ? new Date(tournament.registration_open_at).toISOString().slice(0, 16) 
      : '',
    registration_close_at: tournament.registration_close_at 
      ? new Date(tournament.registration_close_at).toISOString().slice(0, 16) 
      : '',
    tournament_start_at: tournament.tournament_start_at 
      ? new Date(tournament.tournament_start_at).toISOString().slice(0, 16) 
      : '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      const payload: any = {
        ...formData,
        cost: Number(formData.cost),
        max_slots: Number(formData.max_slots),
        min_slots: Number(formData.min_slots),
        registration_open_at: new Date(formData.registration_open_at).toISOString(),
        registration_close_at: new Date(formData.registration_close_at).toISOString(),
        tournament_start_at: new Date(formData.tournament_start_at).toISOString(),
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
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col arena-card bg-[#15161E] border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0B0C10]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E63946]/20 text-[#E63946] flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Panel de Modificación de Torneo</h2>
              <p className="text-xs text-[#8E92A4]">Edita parámetros oficiales, fechas, reglas y estado de la competición</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E92A4] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
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
                <label className="text-xs font-bold text-white">Nombre Oficial del Torneo</label>
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
                <label className="text-xs font-bold text-white">Videojuego Oficial</label>
                <select
                  name="game_code"
                  value={formData.game_code}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                >
                  <option value="CLASH_ROYALE">Clash Royale (Supercell)</option>
                  <option value="BRAWL_STARS">Brawl Stars (Supercell)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Estado de la Competición</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-arena w-full text-xs font-bold text-emerald-400"
                >
                  <option value="DRAFT">Borrador (DRAFT)</option>
                  <option value="PUBLISHED">Publicado (PUBLISHED)</option>
                  <option value="REGISTRATION_OPEN">Inscripciones Abiertas (REGISTRATION_OPEN)</option>
                  <option value="REGISTRATION_CLOSED">Inscripciones Cerradas (REGISTRATION_CLOSED)</option>
                  <option value="IN_PROGRESS">En Progreso / Brackets Activos (IN_PROGRESS)</option>
                  <option value="FINISHED">Concluido / Premiado (FINISHED)</option>
                  <option value="CANCELLED">Cancelado (CANCELLED)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Organización Responsable</label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Sede / Campus</label>
                <input
                  type="text"
                  name="campus_name"
                  value={formData.campus_name}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-white">Descripción Corta</label>
                <input
                  type="text"
                  name="description_short"
                  value={formData.description_short}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-white">Descripción Completa</label>
                <textarea
                  name="description_full"
                  rows={3}
                  value={formData.description_full}
                  onChange={handleChange}
                  className="input-arena w-full text-xs leading-relaxed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
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
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#A8DADC] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              2. Fechas & Horarios Oficiales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Apertura Inscripciones</label>
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
                <label className="text-xs font-bold text-white">Cierre Inscripciones</label>
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
                <label className="text-xs font-bold text-white">Inicio de Torneo</label>
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
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#A8DADC] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              3. Cupos, Formato & Premios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Cupos Máximos</label>
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
                <label className="text-xs font-bold text-white">Cupos Mínimos</label>
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
                <label className="text-xs font-bold text-white">Costo de Inscripción (PEN)</label>
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
                <label className="text-xs font-bold text-white">Pozo de Premios Oficial</label>
                <input
                  type="text"
                  name="prize_pool"
                  value={formData.prize_pool}
                  onChange={handleChange}
                  className="input-arena w-full text-xs text-amber-400 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Email de Contacto</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="input-arena w-full text-xs"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-white">Reglamento Oficial de Competición</label>
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

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
