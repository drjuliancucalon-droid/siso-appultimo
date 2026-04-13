import React, { useState, useEffect, useRef } from 'react';
import { Video, Clock, Play, Square, Link2, Copy, CheckCircle, FileText } from 'lucide-react';
import { sp, _ls } from '../../../shared/lib/storage';

const STORAGE_KEY = 'siso_teleconsultas';

const STATUS_CONFIG = {
  programada: { label: 'Programada', color: 'bg-yellow-100 text-yellow-800' },
  en_curso: { label: 'En curso', color: 'bg-green-100 text-green-800' },
  finalizada: { label: 'Finalizada', color: 'bg-gray-100 text-gray-600' },
};

const generarRoomUrl = (consultaId) => {
  return `https://ocupasalud.daily.co/room-${consultaId}`;
};

export const VideoConsult = () => {
  const [consultas, setConsultas] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [copiado, setCopiado] = useState('');
  const [notasEdit, setNotasEdit] = useState({});
  const timerRef = useRef(null);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    setConsultas(sp(STORAGE_KEY, []));
    timerRef.current = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const guardar = (nuevas) => {
    setConsultas(nuevas);
    _ls.setItem(STORAGE_KEY, JSON.stringify(nuevas));
  };

  const iniciarConsulta = (id) => {
    const actualizadas = consultas.map((c) =>
      c.id === id ? { ...c, estado: 'en_curso', horaInicio: new Date().toISOString() } : c
    );
    guardar(actualizadas);
  };

  const finalizarConsulta = (id) => {
    const notas = notasEdit[id] || '';
    const actualizadas = consultas.map((c) =>
      c.id === id
        ? { ...c, estado: 'finalizada', horaFin: new Date().toISOString(), notas: notas || c.notas }
        : c
    );
    guardar(actualizadas);
  };

  const copiarLink = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiado(id);
    setTimeout(() => setCopiado(''), 2000);
  };

  const calcularDuracion = (consulta) => {
    if (!consulta.horaInicio) return '00:00';
    const inicio = new Date(consulta.horaInicio).getTime();
    const fin = consulta.horaFin ? new Date(consulta.horaFin).getTime() : ahora;
    const diff = Math.max(0, fin - inicio);
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const filtradas = consultas.filter((c) => {
    if (filtro === 'todas') return true;
    return c.estado === filtro;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
        <Video className="w-5 h-5 text-indigo-600" /> Teleconsultas
      </h2>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'todas', label: 'Todas' },
          { key: 'programada', label: 'Programadas' },
          { key: 'en_curso', label: 'En curso' },
          { key: 'finalizada', label: 'Finalizadas' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              filtro === f.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Video className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p>No hay teleconsultas {filtro !== 'todas' ? 'con este estado' : 'registradas'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((consulta) => {
            const cfg = STATUS_CONFIG[consulta.estado] || STATUS_CONFIG.programada;
            const roomUrl = generarRoomUrl(consulta.id);
            return (
              <div key={consulta.id} className="bg-white border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{consulta.paciente || 'Paciente'}</p>
                    <p className="text-xs text-gray-500">
                      {consulta.fecha} · {consulta.hora} · {consulta.tipo || 'General'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {consulta.estado === 'en_curso' && (
                      <span className="flex items-center gap-1 text-sm font-mono font-bold text-green-700">
                        <Clock className="w-4 h-4" /> {calcularDuracion(consulta)}
                      </span>
                    )}
                    {consulta.estado === 'finalizada' && consulta.horaInicio && (
                      <span className="text-xs text-gray-400">
                        Duración: {calcularDuracion(consulta)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Link de sala */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <Link2 className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600 flex-1 truncate">{roomUrl}</span>
                  <button
                    onClick={() => copiarLink(roomUrl, consulta.id)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    {copiado === consulta.id ? (
                      <><CheckCircle className="w-3 h-3" /> Copiado</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copiar</>
                    )}
                  </button>
                </div>

                {/* Notas */}
                {(consulta.estado === 'en_curso' || consulta.estado === 'finalizada') && (
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1">
                      <FileText className="w-3 h-3" /> Notas de consulta
                    </label>
                    <textarea
                      value={notasEdit[consulta.id] !== undefined ? notasEdit[consulta.id] : (consulta.notas || '')}
                      onChange={(e) => setNotasEdit((prev) => ({ ...prev, [consulta.id]: e.target.value }))}
                      rows={2}
                      disabled={consulta.estado === 'finalizada'}
                      className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50"
                      placeholder="Anotaciones de la consulta..."
                    />
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2">
                  {consulta.estado === 'programada' && (
                    <button
                      onClick={() => iniciarConsulta(consulta.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                    >
                      <Play className="w-3 h-3" /> Iniciar consulta
                    </button>
                  )}
                  {consulta.estado === 'en_curso' && (
                    <button
                      onClick={() => finalizarConsulta(consulta.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
                    >
                      <Square className="w-3 h-3" /> Finalizar consulta
                    </button>
                  )}
                  {consulta.estado !== 'finalizada' && (
                    <a
                      href={roomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                    >
                      <Video className="w-3 h-3" /> Abrir sala
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
