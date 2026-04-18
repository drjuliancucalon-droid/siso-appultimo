import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { InputGroup } from '../../../shared/components/ui/InputGroup';
import { SelectGroup } from '../../../shared/components/ui/SelectGroup';
import { SECRETARIA_PERMISOS_DEFAULT } from '../../../shared/data/planConfig';

/**
 * UserForm - Formulario de creación/edición de usuario
 */
const PERM_LABELS = {
  agenda:          '🗓️ Agenda',
  bill:            '🧾 Cuentas de Cobro',
  propuestas:      '📄 Propuestas',
  telemedicina:    '🩺 Telemedicina',
  empresas:        '🏢 Empresas',
  pacientes_lista: '👥 Lista Pacientes',
  pacientes_crear: '➕ Crear Pacientes',
  reporte:         '📊 Reportes',
  sve:             '🔬 SVE',
  caja:            '💰 Financiero',
  adjuntos:        '📎 Adjuntos',
  cuentas_cobro:   '💳 Cuentas',
};

export const UserForm = ({ user, onSave, onCancel, existingUsers = [], usersList = [] }) => {
  const [form, setForm] = useState({
    usuario: '', nombre: '', role: 'medico', email: '', celular: '',
    cedula: '', titulo: '', licencia: '', ciudad: '', especialidad: '',
    mustChangePassword: true,
    secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT },
    medicosAsignados: [],
    ...user,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError('');
  };

  const handleSave = () => {
    if (!form.usuario?.trim()) { setError('Usuario requerido'); return; }
    if (!form.nombre?.trim()) { setError('Nombre requerido'); return; }
    if (!user?.id && existingUsers.some((u) => u.usuario === form.usuario)) {
      setError('El nombre de usuario ya existe'); return;
    }
    onSave({ ...form, id: form.id || `usr_${Date.now()}` });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-black text-gray-800">{user?.id ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        <button onClick={onCancel}><X className="w-5 h-5 text-gray-400" /></button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap -mx-1.5">
          <InputGroup label="Usuario *" name="usuario" value={form.usuario} onChange={handleChange} width="w-1/2" />
          <SelectGroup label="Rol *" name="role" value={form.role} onChange={handleChange}
            options={[
              { v: 'administrador', l: 'Administrador' },
              { v: 'medico', l: 'Médico' },
              { v: 'secretaria', l: 'Secretaria' },
              { v: 'admin_empresa', l: 'Admin Empresa' },
            ]} width="w-1/2" />
          <InputGroup label="Nombre completo *" name="nombre" value={form.nombre} onChange={handleChange} width="w-full" />
          <InputGroup label="Email" name="email" type="email" value={form.email} onChange={handleChange} width="w-1/2" />
          <InputGroup label="Celular" name="celular" value={form.celular} onChange={handleChange} width="w-1/2" />
        </div>

        {(form.role === 'medico' || form.role === 'administrador') && (
          <div className="flex flex-wrap -mx-1.5 bg-blue-50 p-2 rounded-xl">
            <p className="w-full text-[10px] font-black text-blue-700 px-1.5 mb-1 uppercase">Datos profesionales</p>
            <InputGroup label="Cédula" name="cedula" value={form.cedula} onChange={handleChange} width="w-1/3" />
            <InputGroup label="Título" name="titulo" value={form.titulo} onChange={handleChange} width="w-1/3" />
            <InputGroup label="Licencia" name="licencia" value={form.licencia} onChange={handleChange} width="w-1/3" />
            <InputGroup label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} width="w-1/3" />
            <InputGroup label="Especialidad" name="especialidad" value={form.especialidad} onChange={handleChange} width="w-2/3" />
          </div>
        )}

        {/* ── Permisos de Secretaria — 12 toggles ── */}
        {form.role === 'secretaria' && (
          <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-300">
            <p className="text-xs font-black text-amber-800 uppercase mb-1">🔐 Permisos de Secretaria</p>
            <p className="text-[10px] text-amber-600 mb-3">
              Seleccione los módulos a los que tendrá acceso. Todo bloqueado por defecto.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {Object.entries(PERM_LABELS).map(([key, label]) => {
                const permisos = form.secretariaPermisos || SECRETARIA_PERMISOS_DEFAULT;
                const isOn = permisos[key] === true;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setForm(p => ({
                        ...p,
                        secretariaPermisos: {
                          ...(p.secretariaPermisos || SECRETARIA_PERMISOS_DEFAULT),
                          [key]: !isOn,
                        },
                      }))
                    }
                    className={`p-2 rounded-xl border-2 text-left text-xs font-bold transition ${
                      isOn
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-amber-300'
                    }`}
                  >
                    {label} {isOn ? '✅' : ''}
                  </button>
                );
              })}
            </div>
            {usersList.filter(u => ['medico', 'administrador', 'super_admin'].includes(u.role) && u.activo !== false).length > 0 && (
              <>
                <p className="text-[10px] text-amber-700 font-black mb-2">👨‍⚕️ Médicos asignados (vacío = todos):</p>
                <div className="flex flex-wrap gap-2">
                  {usersList
                    .filter(u => ['medico', 'administrador', 'super_admin'].includes(u.role) && u.activo !== false)
                    .map(med => {
                      const sel = (form.medicosAsignados || []).includes(med.usuario || med.user);
                      return (
                        <button
                          key={med.usuario || med.user}
                          type="button"
                          onClick={() =>
                            setForm(p => ({
                              ...p,
                              medicosAsignados: sel
                                ? (p.medicosAsignados || []).filter(id => id !== (med.usuario || med.user))
                                : [...(p.medicosAsignados || []), med.usuario || med.user],
                            }))
                          }
                          className={`px-2 py-1 rounded-xl border text-xs font-bold ${
                            sel ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 bg-white text-gray-500'
                          }`}
                        >
                          {sel ? '✅ ' : ''}{med.nombre || med.usuario || med.user}
                        </button>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        )}

        {error && <p className="text-red-600 text-xs font-bold">⚠️ {error}</p>}

        <div className="flex gap-2 pt-2">
          <button onClick={handleSave}
            className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 flex items-center justify-center gap-1.5">
            <Save className="w-4 h-4" /> Guardar
          </button>
          <button onClick={onCancel} className="py-2.5 px-6 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancelar</button>
        </div>
      </div>
    </div>
  );
};
