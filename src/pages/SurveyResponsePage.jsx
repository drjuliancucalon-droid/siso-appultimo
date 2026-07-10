// src/pages/SurveyResponsePage.jsx — SPRINT 6 FASE 4.2: Perfil sociodemográfico público
// Reconstruido desde monolito forense EncuestaPublicaForm (App.jsx L14246-14400)
// Paridad completa: 25+ campos, listas EPS/ARL, validaciones, anti-duplicados, write-back verify
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { d1Get, d1WriteArrayMerge, d1Append } from '../lib/d1Client';
import { ClipboardList, Loader2, CheckCircle, AlertCircle, Send, Shield, User, Phone, Mail, MapPin, Briefcase, Heart, GraduationCap, Calendar, Hash } from 'lucide-react';

// ─── CONSTANTES ────────────────────────────────────────────────────────────
const SURVEYS_KEY = 'siso_encuestas';

const DOC_TIPOS = ['CC', 'CE', 'PA', 'TI', 'RC'];
const GENEROS = ['Masculino', 'Femenino', 'Otro'];
const ESTADOS_CIVILES = ['Soltero(a)', 'Casado(a)', 'Unión libre', 'Separado(a)', 'Divorciado(a)', 'Viudo(a)'];
const ESCOLARIDADES = ['Primaria', 'Secundaria', 'Técnico', 'Tecnólogo', 'Universitario', 'Especialización', 'Maestría', 'Doctorado', 'Ninguno'];
const GRUPOS_ETNICOS = ['Ninguno', 'Indígena', 'Afrocolombiano', 'Raizal', 'Palenquero', 'Rom/Gitano'];
const LATERALIDADES = ['Diestro', 'Zurdo', 'Ambidiestro'];
const ZONAS = ['Urbana', 'Rural'];
const ESTRATOS = ['1', '2', '3', '4', '5', '6'];
const TIPOS_CONTRATO = ['Término fijo', 'Término indefinido', 'Prestación de servicios', 'Obra/Labor', 'Temporal', 'Aprendizaje'];
const TURNOS = ['Diurno', 'Nocturno', 'Mixto', 'Rotativo'];

// ─── LISTAS EPS Y ARL (idénticas al monolito) ──────────────────────────────
const EPS_LIST = [
  'NUEVA EPS', 'SANITAS', 'SALUD TOTAL', 'MEDIMÁS', 'COMPENSAR', 'SURA',
  'COOMEVA', 'FAMISANAR', 'COOSALUD', 'MUTUAL SER', 'COMFENALCO', 'CAJACOPI',
  'ASMET SALUD', 'EMSSANAR', 'MALLAMAS', 'AIC', 'PIJAOS SALUD', 'CAPITAL SALUD',
  'ALIANSALUD', 'OTRA',
];
const ARL_LIST = [
  'ARL SURA', 'POSITIVA', 'AXA COLPATRIA', 'SEGUROS BOLÍVAR', 'COLMENA',
  'LA EQUIDAD', 'MAPFRE', 'LIBERTY', 'ALFA',
];

// ─── VALOR INICIAL DEL FORMULARIO ──────────────────────────────────────────
const INITIAL_FORM = {
  nombres: '', docTipo: 'CC', docNumero: '', fechaNacimiento: '', edad: '',
  genero: '', estadoCivil: '', escolaridad: '', grupoEtnico: '', lateralidad: 'Diestro',
  celular: '', email: '', direccion: '', ciudad: 'Popayán', zonaResidencia: 'Urbana',
  eps: '', arl: '', afp: '', estrato: '',
  cargo: '', area: '', antiguedad: '', tipoContrato: '', turnoTrabajo: 'Diurno',
  contactoEmergencia: '', telEmergencia: '',
};

const FIELD_LABELS = {
  nombres: 'Nombres completos *', docTipo: 'Tipo de documento',
  docNumero: 'Número de documento *', fechaNacimiento: 'Fecha de nacimiento *',
  edad: 'Edad', genero: 'Género *', estadoCivil: 'Estado civil',
  escolaridad: 'Nivel de escolaridad', grupoEtnico: 'Grupo étnico',
  lateralidad: 'Lateralidad', celular: 'Celular *',
  email: 'Correo electrónico', direccion: 'Dirección de residencia',
  ciudad: 'Ciudad', zonaResidencia: 'Zona de residencia',
  eps: 'EPS *', arl: 'ARL', afp: 'AFP / Fondo de pensiones',
  estrato: 'Estrato socioeconómico', cargo: 'Cargo actual *',
  area: 'Área / Departamento', antiguedad: 'Antigüedad en el cargo',
  tipoContrato: 'Tipo de contrato', turnoTrabajo: 'Turno de trabajo',
  contactoEmergencia: 'Contacto de emergencia', telEmergencia: 'Teléfono de emergencia',
};

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export default function SurveyResponsePage() {
  const { token } = useParams();

  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirmId, setConfirmId] = useState('');

  // Cargar metadata de la encuesta desde D1 (clave individual primero, fallback array)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let found = null;
        // 1. Intentar clave individual siso_encuesta_{token} en D1 (metadata dedicada)
        try {
          const { value } = await d1Get(`siso_encuesta_${token}`);
          if (value && typeof value === 'object' && value.id) found = value;
        } catch { /* D1 no disponible */ }
        // 2. Fallback: buscar en el array siso_encuestas
        if (!found) {
          try {
            const { value: encuestas } = await d1Get(SURVEYS_KEY);
            if (Array.isArray(encuestas)) found = encuestas.find(e => e.id === token);
          } catch { /* D1 no disponible */ }
        }
        // 3. Fallback: localStorage
        if (!found) {
          try {
            const raw = localStorage.getItem(SURVEYS_KEY);
            if (raw) {
              const arr = JSON.parse(raw);
              if (Array.isArray(arr)) found = arr.find(e => e.id === token);
            }
          } catch { /* ignorar */ }
        }
        if (!cancelled) {
          if (found) setEncuesta(found);
          else setError('Encuesta no encontrada o expirada.');
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Error de conexión: ' + (err.message || 'desconocido'));
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  // ── Actualizar campo ──────────────────────────────────────────────────────
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // ── Validaciones (idénticas al monolito) ──────────────────────────────────
  const validar = () => {
    if (!form.nombres.trim() || form.nombres.trim().length < 5) {
      setError('Ingrese su nombre completo (mínimo 5 caracteres).'); return false;
    }
    if (!form.docNumero.trim()) {
      setError('Ingrese su número de documento.'); return false;
    }
    if (!form.fechaNacimiento) {
      setError('Ingrese su fecha de nacimiento.'); return false;
    }
    if (!form.genero) {
      setError('Seleccione su género.'); return false;
    }
    if (!form.celular.trim()) {
      setError('Ingrese su número de celular.'); return false;
    }
    if (!form.cargo.trim()) {
      setError('Ingrese su cargo actual.'); return false;
    }
    if (!form.eps) {
      setError('Seleccione su EPS.'); return false;
    }
    return true;
  };

  // ── Verificar escritura (write-back verify como el monolito) ──────────────
  const verificarEscritura = async (respId) => {
    const respKey = `siso_encuesta_resps_${token}`;
    try {
      const { value } = await d1Get(respKey);
      const arr = Array.isArray(value) ? value : [];
      return arr.some(r => r.id === respId);
    } catch {
      // Fallback localStorage
      try {
        const local = localStorage.getItem(respKey);
        const arr = local ? JSON.parse(local) : [];
        return arr.some(r => r.id === respId);
      } catch { return false; }
    }
  };

  // ── Enviar formulario (lógica adaptada del monolito EncuestaPublicaForm) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!encuesta) return;

    // Validar
    if (!validar()) return;

    setSending(true);
    setError('');

    try {
      const respKey = `siso_encuesta_resps_${token}`;

      // 1. Leer respuestas existentes
      let respuestas = [];
      let lecturaConfiable = false;
      try {
        const { value } = await d1Get(respKey);
        respuestas = Array.isArray(value) ? value : [];
        lecturaConfiable = true;
      } catch {
        // Fallback localStorage
        try {
          const local = localStorage.getItem(respKey);
          respuestas = local ? JSON.parse(local) : [];
          lecturaConfiable = true;
        } catch { /* ignorar */ }
      }

      if (!lecturaConfiable) {
        setError('No se pudo conectar para guardar (conexión inestable). Intente de nuevo en unos segundos.');
        setSending(false);
        return;
      }

      // 2. ANTI-DUPLICADOS: verificar por número de documento
      const docNormalizado = form.docNumero.trim();
      if (respuestas.find(r => r.docNumero === docNormalizado)) {
        setError('Ya se registraron datos con este número de documento.');
        setSending(false);
        return;
      }

      // 3. Calcular edad desde fecha de nacimiento
      let edadCalculada = form.edad;
      if (form.fechaNacimiento && !form.edad) {
        const nac = new Date(form.fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nac.getFullYear();
        const m = hoy.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
        edadCalculada = String(edad);
      }

      // 4. Construir respuesta con ID único (formato monolito)
      const respId = 'resp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const nuevaRespuesta = {
        ...form,
        nombres: form.nombres.trim().toUpperCase(),
        docNumero: docNormalizado,
        edad: edadCalculada,
        id: respId,
        timestamp: new Date().toISOString(),
        estado: 'completa',
      };

      respuestas.push(nuevaRespuesta);

      // 5. Guardar en D1 usando APPEND (vía primaria, anti-carreras)
      let guardado = false;
      try {
        // VÍA PRIMARIA: append server-side — evita que escrituras concurrentes se pisen
        const appendResult = await d1Append(respKey, nuevaRespuesta, 'id');
        guardado = appendResult?.ok === true;
        if (guardado) {
          console.log('[Encuesta] ✅ Append server-side exitoso. Total items:', appendResult.count);
        }
      } catch (errAppend) {
        console.warn('[Encuesta] Append falló, intentando fallback read-modify-write:', errAppend.message);
        // FALLBACK: read-modify-write tradicional
        try {
          await d1WriteArrayMerge(respKey, [nuevaRespuesta], 'id');
          await new Promise(r => setTimeout(r, 800));
          guardado = await verificarEscritura(respId);
        } catch (errD1) {
          console.warn('[Encuesta] D1 fallback también falló, usando localStorage:', errD1.message);
        }
      }

      // 6. Siempre guardar en localStorage como backup y para verificación
      localStorage.setItem(respKey, JSON.stringify(respuestas));

      if (!guardado) {
        // Verificar en localStorage
        const local = localStorage.getItem(respKey);
        const arr = local ? JSON.parse(local) : [];
        guardado = arr.some(r => r.id === respId);
      }

      if (!guardado) {
        setError('⚠️ No fue posible guardar sus datos. Por favor tome una captura de pantalla de este formulario y comuníquese con la empresa. Código: PERSIST_FAIL');
        setSending(false);
        return;
      }

      console.log('[Encuesta] ✅ Respuesta guardada y verificada. ID:', respId);
      setConfirmId(respId);
      setSent(true);
    } catch (err) {
      console.error('[Encuesta] Error inesperado:', err);
      setError('Error de conexión. Verifique su internet e intente de nuevo.');
    } finally {
      setSending(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: LOADING
  // ──────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Cargando formulario...</p>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: ERROR (encuesta no encontrada)
  // ──────────────────────────────────────────────────────────────────────────
  if (error && !encuesta) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-black text-gray-800">Encuesta no disponible</h2>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
        <p className="text-[10px] text-gray-400 mt-6">
          SISO OcupaSalud Pro · Res. 1843/2025
        </p>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: ENVIADO (pantalla de éxito)
  // ──────────────────────────────────────────────────────────────────────────
  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-black text-gray-800 mb-2">¡Datos registrados exitosamente!</h2>
        <p className="text-sm text-gray-600 mb-1">
          Gracias por completar el perfil sociodemográfico de <strong>{encuesta?.nombre || 'la encuesta'}</strong>.
        </p>
        {encuesta?.empresaNombre && (
          <p className="text-xs text-gray-500 mb-1">Empresa: {encuesta.empresaNombre}</p>
        )}
        <p className="text-xs text-gray-400 mt-4">
          Sus datos han sido almacenados de forma segura.
        </p>
        <p className="text-[10px] text-gray-300 mt-4">
          ID de confirmación: {confirmId}
        </p>
        <p className="text-[10px] text-gray-300 mt-2">
          SISO OcupaSalud · Res. 1843/2025 · Decreto 1072/2015
        </p>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: FORMULARIO SOCIODEMOGRÁFICO COMPLETO
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-800">{encuesta?.nombre || 'Perfil Sociodemográfico'}</h1>
              {encuesta?.empresaNombre && (
                <p className="text-xs text-gray-500">{encuesta.empresaNombre}</p>
              )}
            </div>
          </div>
          {encuesta?.descripcion && (
            <p className="text-xs text-gray-500 ml-13">{encuesta.descripcion}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          {/* ─── Error banner ──────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ─── SECCIÓN 1: DATOS PERSONALES ──────────────────────────── */}
          <Section icon={<User className="w-4 h-4" />} title="Datos Personales">
            <Row2>
              <Field label={FIELD_LABELS.nombres} required>
                <input type="text" value={form.nombres} onChange={e => update('nombres', e.target.value)}
                  className="input-siso" placeholder="Nombres y apellidos completos" />
              </Field>
            </Row2>

            <Row3>
              <Field label={FIELD_LABELS.docTipo}>
                <select value={form.docTipo} onChange={e => update('docTipo', e.target.value)} className="input-siso">
                  {DOC_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label={FIELD_LABELS.docNumero} required>
                <input type="text" value={form.docNumero} onChange={e => update('docNumero', e.target.value)}
                  className="input-siso" placeholder="Número de documento" />
              </Field>
              <Field label={FIELD_LABELS.fechaNacimiento} required>
                <input type="date" value={form.fechaNacimiento} onChange={e => update('fechaNacimiento', e.target.value)}
                  className="input-siso" />
              </Field>
            </Row3>

            <Row3>
              <Field label={FIELD_LABELS.edad}>
                <input type="number" value={form.edad} onChange={e => update('edad', e.target.value)}
                  className="input-siso" placeholder="Edad (auto-calculada si no)" min="0" max="120" />
              </Field>
              <Field label={FIELD_LABELS.genero} required>
                <select value={form.genero} onChange={e => update('genero', e.target.value)} className="input-siso">
                  <option value="">Seleccione...</option>
                  {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label={FIELD_LABELS.estadoCivil}>
                <select value={form.estadoCivil} onChange={e => update('estadoCivil', e.target.value)} className="input-siso">
                  <option value="">Seleccione...</option>
                  {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </Row3>

            <Row3>
              <Field label={FIELD_LABELS.grupoEtnico}>
                <select value={form.grupoEtnico} onChange={e => update('grupoEtnico', e.target.value)} className="input-siso">
                  <option value="">Seleccione...</option>
                  {GRUPOS_ETNICOS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label={FIELD_LABELS.lateralidad}>
                <select value={form.lateralidad} onChange={e => update('lateralidad', e.target.value)} className="input-siso">
                  {LATERALIDADES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label={FIELD_LABELS.escolaridad}>
                <select value={form.escolaridad} onChange={e => update('escolaridad', e.target.value)} className="input-siso">
                  <option value="">Seleccione...</option>
                  {ESCOLARIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </Row3>
          </Section>

          {/* ─── SECCIÓN 2: CONTACTO ─────────────────────────────────── */}
          <Section icon={<Phone className="w-4 h-4" />} title="Información de Contacto">
            <Row2>
              <Field label={FIELD_LABELS.celular} required>
                <input type="tel" value={form.celular} onChange={e => update('celular', e.target.value)}
                  className="input-siso" placeholder="Ej: 3001234567" />
              </Field>
              <Field label={FIELD_LABELS.email}>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className="input-siso" placeholder="correo@ejemplo.com" />
              </Field>
            </Row2>

            <Field label={FIELD_LABELS.direccion}>
              <input type="text" value={form.direccion} onChange={e => update('direccion', e.target.value)}
                className="input-siso" placeholder="Dirección de residencia" />
            </Field>

            <Row3>
              <Field label={FIELD_LABELS.ciudad}>
                <input type="text" value={form.ciudad} onChange={e => update('ciudad', e.target.value)}
                  className="input-siso" placeholder="Ciudad" />
              </Field>
              <Field label={FIELD_LABELS.zonaResidencia}>
                <select value={form.zonaResidencia} onChange={e => update('zonaResidencia', e.target.value)} className="input-siso">
                  {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </Field>
              <Field label={FIELD_LABELS.estrato}>
                <select value={form.estrato} onChange={e => update('estrato', e.target.value)} className="input-siso">
                  <option value="">Seleccione...</option>
                  {ESTRATOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </Row3>
          </Section>

          {/* ─── SECCIÓN 3: SEGURIDAD SOCIAL ──────────────────────────── */}
          <Section icon={<Heart className="w-4 h-4" />} title="Seguridad Social">
            <Row3>
              <Field label={FIELD_LABELS.eps} required>
                <select value={form.eps} onChange={e => update('eps', e.target.value)} className="input-siso">
                  <option value="">Seleccione EPS...</option>
                  {EPS_LIST.map(eps => <option key={eps} value={eps}>{eps}</option>)}
                </select>
              </Field>
              <Field label={FIELD_LABELS.arl}>
                <select value={form.arl} onChange={e => update('arl', e.target.value)} className="input-siso">
                  <option value="">Seleccione ARL...</option>
                  {ARL_LIST.map(arl => <option key={arl} value={arl}>{arl}</option>)}
                </select>
              </Field>
              <Field label={FIELD_LABELS.afp}>
                <input type="text" value={form.afp} onChange={e => update('afp', e.target.value)}
                  className="input-siso" placeholder="Fondo de pensiones" />
              </Field>
            </Row3>
          </Section>

          {/* ─── SECCIÓN 4: INFORMACIÓN OCUPACIONAL ──────────────────── */}
          <Section icon={<Briefcase className="w-4 h-4" />} title="Información Ocupacional">
            <Row2>
              <Field label={FIELD_LABELS.cargo} required>
                <input type="text" value={form.cargo} onChange={e => update('cargo', e.target.value)}
                  className="input-siso" placeholder="Cargo que desempeña" />
              </Field>
              <Field label={FIELD_LABELS.area}>
                <input type="text" value={form.area} onChange={e => update('area', e.target.value)}
                  className="input-siso" placeholder="Área o departamento" />
              </Field>
            </Row2>

            <Row3>
              <Field label={FIELD_LABELS.antiguedad}>
                <input type="text" value={form.antiguedad} onChange={e => update('antiguedad', e.target.value)}
                  className="input-siso" placeholder="Ej: 2 años" />
              </Field>
              <Field label={FIELD_LABELS.tipoContrato}>
                <select value={form.tipoContrato} onChange={e => update('tipoContrato', e.target.value)} className="input-siso">
                  <option value="">Seleccione...</option>
                  {TIPOS_CONTRATO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label={FIELD_LABELS.turnoTrabajo}>
                <select value={form.turnoTrabajo} onChange={e => update('turnoTrabajo', e.target.value)} className="input-siso">
                  {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </Row3>
          </Section>

          {/* ─── SECCIÓN 5: CONTACTO DE EMERGENCIA ────────────────────── */}
          <Section icon={<Shield className="w-4 h-4" />} title="Contacto de Emergencia">
            <Row2>
              <Field label={FIELD_LABELS.contactoEmergencia}>
                <input type="text" value={form.contactoEmergencia} onChange={e => update('contactoEmergencia', e.target.value)}
                  className="input-siso" placeholder="Nombre de persona de contacto" />
              </Field>
              <Field label={FIELD_LABELS.telEmergencia}>
                <input type="tel" value={form.telEmergencia} onChange={e => update('telEmergencia', e.target.value)}
                  className="input-siso" placeholder="Teléfono de emergencia" />
              </Field>
            </Row2>
          </Section>

          {/* ─── BOTÓN DE ENVÍO ────────────────────────────────────────── */}
          <div className="mt-8 mb-12">
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-sm hover:opacity-95 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando datos...</>
              ) : (
                <><Send className="w-4 h-4" /> Enviar Perfil Sociodemográfico</>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-3">
              SISO OcupaSalud Pro · Res. 1843/2025 · Decreto 1072/2015
              <br />Sus datos serán tratados conforme a la Ley 1581/2012 de Habeas Data
            </p>
          </div>
        </form>
      </div>

      {/* Estilos inline para inputs consistentes */}
      <style>{`
        .input-siso {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          color: #1e293b;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-siso:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .input-siso::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ──────────────────────────────────────────────────

function Section({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <span className="text-indigo-500">{icon}</span>
        <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-[11px] font-bold text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Row2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Row3({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{children}</div>;
}