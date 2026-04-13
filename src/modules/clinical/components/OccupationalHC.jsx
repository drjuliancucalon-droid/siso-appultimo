import React, { useState } from 'react';
import {
  User, Briefcase, Heart, Stethoscope, Activity, AlertTriangle,
  FileText, History, CheckCircle2, Save, Printer, ClipboardList
} from 'lucide-react';
import { InputGroup } from '../../../shared/components/ui/InputGroup';
import { SelectGroup } from '../../../shared/components/ui/SelectGroup';
import { TextAreaGroup } from '../../../shared/components/ui/TextAreaGroup';
import { SectionTitle } from '../../../shared/components/ui/SectionTitle';
import { BrandLogo } from '../../../shared/components/ui/BrandLogo';
import { CIE10Input } from '../../../shared/components/CIE10Input';
import { VitalSigns } from './VitalSigns';
import { PhysicalExam } from './PhysicalExam';

/**
 * OccupationalHC - Historia Clínica Ocupacional completa
 * Res. 1843/2025 (deroga Res. 2346/2007)
 * Incluye: datos sociodemográficos, antecedentes, exposición laboral,
 * examen físico, signos vitales, diagnósticos, concepto de aptitud
 */
export const OccupationalHC = ({
  data,
  setData,
  companies = [],
  activeDoctorData,
  activeSignature,
  onSave,
  onClose,
  onPrint,
  onOpenConsent,
  onOpenRestrictions,
  onOpenRecommendations,
  onOpenHistory,
  handleChange: externalHandleChange,
  handleCompanySelect: externalCompanySelect,
  handleNameChange: externalNameChange,
  patientSuggestions = [],
  selectPatientSuggestion,
  historyNotification,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState('datos');

  const handleChange = externalHandleChange || ((e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  });

  const handleCompanySelect = externalCompanySelect || ((e) => {
    const compId = e.target.value;
    if (compId === 'particular') {
      setData((prev) => ({ ...prev, empresaId: 'particular', empresaNombre: 'PARTICULAR' }));
    } else {
      const comp = companies.find((c) => c.id === compId);
      if (comp) {
        setData((prev) => ({
          ...prev,
          empresaId: comp.id,
          empresaNombre: comp.nombre,
          arl: comp.arl || prev.arl,
        }));
      }
    }
  });

  const isClosed = data.estadoHistoria === 'Cerrada';

  const tabs = [
    { key: 'datos', label: 'Datos', icon: User },
    { key: 'antecedentes', label: 'Antecedentes', icon: ClipboardList },
    { key: 'exposicion', label: 'Exposición', icon: Briefcase },
    { key: 'examen', label: 'Examen Físico', icon: Stethoscope },
    { key: 'diagnostico', label: 'Diagnóstico', icon: Activity },
    { key: 'concepto', label: 'Concepto', icon: CheckCircle2 },
  ];

  return (
    <div className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
      style={{ width: '21.59cm', minHeight: 'auto', padding: '1.2cm', boxSizing: 'border-box' }}>

      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-emerald-500 pb-3 mb-3 print:border-black">
        <div className="w-1/3 hidden print:block">
          <BrandLogo data={activeDoctorData} />
        </div>
        <div className="w-1/3 text-center">
          <h1 className="text-sm font-black text-gray-800 uppercase">Historia Clínica Ocupacional</h1>
          <p className="text-[9px] text-gray-500 font-medium">SEGURIDAD Y SALUD EN EL TRABAJO</p>
        </div>
        <div className="w-1/3 text-right text-[9px] font-bold text-gray-400">
          <p>FOR-SST-001 v4.0</p>
          <p>Res. 1843/2025</p>
        </div>
      </div>

      {/* History notification */}
      {historyNotification && (
        <div className="mb-3 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-xl flex justify-between items-center no-print">
          <div>
            <p className="text-xs font-black text-emerald-800">📚 Antecedentes cargados desde HC anterior</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">
              {historyNotification} atención(es) previa(s) · Antecedentes prellenos · Puede editarlos
            </p>
          </div>
          {onOpenHistory && (
            <button onClick={onOpenHistory}
              className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
              <History className="w-3 h-3" /> Ver historial
            </button>
          )}
        </div>
      )}

      {/* Consent status */}
      <div className={`mb-3 p-3 rounded-xl border-2 no-print ${
        data.consentimientoInformado ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`text-[11px] font-black uppercase tracking-wide ${
            data.consentimientoInformado ? 'text-emerald-800' : 'text-amber-800'
          }`}>
            {data.consentimientoInformado ? '✅ Consentimiento Informado Registrado' : '⚠️ Consentimiento Informado Pendiente'}
          </span>
          {!data.consentimientoInformado && !isClosed && onOpenConsent && (
            <button type="button" onClick={onOpenConsent}
              className="px-3 py-1 text-[11px] font-black text-white bg-amber-600 hover:bg-amber-700 rounded-lg no-print">
              📋 Registrar consentimiento
            </button>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-3 no-print overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition flex items-center justify-center gap-1 whitespace-nowrap px-2 ${
              activeTab === tab.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      <fieldset disabled={isClosed} className="disabled:opacity-75">
        {/* Datos Sociodemográficos */}
        {activeTab === 'datos' && (
          <div>
            {/* Empresa y tipo de examen */}
            <div className="grid grid-cols-2 gap-3 mb-2 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
              <div>
                <label className="block text-[10px] font-black text-emerald-800 mb-1">EMPRESA</label>
                <select className="w-full p-1.5 border border-emerald-300 rounded text-xs font-bold bg-white"
                  value={data.empresaId} onChange={handleCompanySelect}>
                  <option value="particular">PARTICULAR / INDEPENDIENTE</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <SelectGroup label="Énfasis" name="enfasisExamen" value={data.enfasisExamen}
                onChange={handleChange}
                options={['GENERAL', 'OSTEOMUSCULAR', 'CORAZON', 'ALTURAS', 'ALIMENTOS', 'CONFINADOS']}
                width="w-full" />
            </div>

            {/* Tipo de evaluación */}
            <div className="bg-gray-50 p-2 rounded-lg mb-2 border border-gray-200">
              <label className="block text-[10px] font-black text-gray-700 mb-1 uppercase">Tipo de Evaluación</label>
              <div className="flex flex-wrap gap-3">
                {['INGRESO', 'PERIODICO', 'RETIRO', 'POST-INCAPACIDAD', 'RETORNO-LABORAL', 'SEGUIMIENTO'].map((opt) => (
                  <label key={opt} className="flex items-center text-[10px] font-bold cursor-pointer text-gray-700">
                    <input type="radio" name="tipoExamen" value={opt} checked={data.tipoExamen === opt}
                      onChange={handleChange} className="mr-1 w-3 h-3 text-emerald-600" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <SectionTitle title="Datos Sociodemográficos y Laborales" icon={User} />
            <div className="flex flex-wrap -mx-1.5">
              <InputGroup label="Nombres Completos" name="nombres" value={data.nombres}
                onChange={externalNameChange || handleChange} width="w-1/2" placeholder="Nombres y apellidos..." />
              <SelectGroup label="Tipo Doc." name="docTipo" value={data.docTipo || 'CC'}
                onChange={handleChange} options={['CC', 'CE', 'TI', 'Pasaporte', 'PEP', 'NIT']} width="w-1/8 min-w-[80px]" />
              <InputGroup label="Documento ID" name="docNumero" value={data.docNumero}
                onChange={handleChange} width="w-1/4" />
              <InputGroup label="F. Nacimiento" name="fechaNacimiento" type="date" value={data.fechaNacimiento}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value) {
                    const d = new Date(e.target.value);
                    const age = Math.floor((new Date() - d) / 31557600000);
                    setData((p) => ({ ...p, fechaNacimiento: e.target.value, edad: String(age) }));
                  }
                }} width="w-1/4" />
              <InputGroup label="Edad" name="edad" value={data.edad} onChange={handleChange} width="w-1/8 min-w-[60px]" />
              <SelectGroup label="Sexo" name="genero" value={data.genero} onChange={handleChange}
                options={['Masculino', 'Femenino', 'Otro']} width="w-1/6" />
              <SelectGroup label="Estado civil" name="estadoCivil" value={data.estadoCivil} onChange={handleChange}
                options={['Soltero/a', 'Casado/a', 'Unión libre', 'Divorciado/a', 'Viudo/a']} width="w-1/6" />
              <SelectGroup label="Escolaridad" name="escolaridad" value={data.escolaridad} onChange={handleChange}
                options={['Primaria', 'Secundaria', 'Técnico', 'Tecnólogo', 'Profesional', 'Posgrado', 'Ninguna']} width="w-1/6" />
              <InputGroup label="Dirección" name="direccion" value={data.direccion} onChange={handleChange} width="w-1/3" />
              <InputGroup label="Ciudad" name="ciudad" value={data.ciudad} onChange={handleChange} width="w-1/6" />
              <InputGroup label="Celular" name="celular" value={data.celular} onChange={handleChange} width="w-1/6" />
              <InputGroup label="Email" name="emailPaciente" type="email" value={data.emailPaciente}
                onChange={handleChange} width="w-1/4" />
              <InputGroup label="EPS" name="eps" value={data.eps} onChange={handleChange} width="w-1/4" />
              <InputGroup label="AFP" name="afp" value={data.afp} onChange={handleChange} width="w-1/4" />
              <InputGroup label="ARL" name="arl" value={data.arl} onChange={handleChange} width="w-1/4" />
              <InputGroup label="Cargo" name="cargo" value={data.cargo} onChange={handleChange} width="w-1/3" />
              <InputGroup label="Antigüedad (años)" name="antiguedad" value={data.antiguedad}
                onChange={handleChange} width="w-1/6" />
              <InputGroup label="Fecha examen" name="fechaExamen" type="date" value={data.fechaExamen}
                onChange={handleChange} width="w-1/4" />
            </div>
          </div>
        )}

        {/* Antecedentes */}
        {activeTab === 'antecedentes' && (
          <div>
            <SectionTitle title="Antecedentes Personales" icon={ClipboardList} />
            <div className="space-y-2">
              {[
                { name: 'antPatologicos', label: 'Patológicos', placeholder: 'Enfermedades previas, hospitalizaciones...' },
                { name: 'antQuirurgicos', label: 'Quirúrgicos', placeholder: 'Cirugías previas...' },
                { name: 'antTraumaticos', label: 'Traumáticos', placeholder: 'Fracturas, traumas...' },
                { name: 'antToxicoAlergicos', label: 'Tóxico-Alérgicos', placeholder: 'Alergias, intolerancias...' },
                { name: 'antFarmacologicos', label: 'Farmacológicos', placeholder: 'Medicamentos actuales...' },
                { name: 'antFamiliares', label: 'Familiares', placeholder: 'HTA, DM, cáncer en familia...' },
                { name: 'antGinecoObstetricos', label: 'Gineco-obstétricos', placeholder: 'G_P_A_C_ FUM...' },
              ].map(({ name, label, placeholder }) => (
                <TextAreaGroup key={name} label={label} name={name}
                  value={data[name] || ''} onChange={handleChange}
                  placeholder={placeholder} rows={2} />
              ))}
            </div>

            <SectionTitle title="Hábitos" icon={Activity} color="orange" />
            <div className="flex flex-wrap -mx-1.5">
              {[
                { name: 'tabaquismo', label: 'Tabaquismo' },
                { name: 'alcoholismo', label: 'Alcohol' },
                { name: 'sustanciasPsicoactivas', label: 'Sustancias' },
                { name: 'actividadFisica', label: 'Actividad física' },
              ].map(({ name, label }) => (
                <SelectGroup key={name} label={label} name={name} value={data[name] || ''}
                  onChange={handleChange} options={['No', 'Sí - Actual', 'Sí - Previo', 'Ocasional']}
                  width="w-1/4 min-w-[100px]" />
              ))}
            </div>
          </div>
        )}

        {/* Exposición laboral */}
        {activeTab === 'exposicion' && (
          <div>
            <SectionTitle title="Exposición Laboral y Riesgos" icon={Briefcase} />
            <TextAreaGroup label="Descripción del puesto de trabajo" name="descripcionPuesto"
              value={data.descripcionPuesto || ''} onChange={handleChange}
              placeholder="Descripción detallada de las actividades y el ambiente de trabajo..." rows={3} />

            <div className="mt-2 space-y-2">
              <p className="text-[10px] font-black text-gray-700 uppercase">Factores de riesgo identificados (GTC-45)</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'riesgoBiologico', label: 'Biológico' },
                  { name: 'riesgoFisico', label: 'Físico (ruido, vibración, radiación)' },
                  { name: 'riesgoQuimico', label: 'Químico' },
                  { name: 'riesgoBiomecanico', label: 'Biomecánico / Ergonómico' },
                  { name: 'riesgoPsicosocial', label: 'Psicosocial' },
                  { name: 'riesgoSeguridad', label: 'Condiciones de seguridad' },
                  { name: 'riesgoNatural', label: 'Fenómenos naturales' },
                ].map(({ name, label }) => (
                  <label key={name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input type="checkbox" name={name} checked={!!data[name]} onChange={handleChange}
                      className="w-4 h-4 accent-emerald-600" />
                    <span className="text-xs text-gray-700 font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <TextAreaGroup label="Equipos de protección personal (EPP)" name="epp"
              value={data.epp || ''} onChange={handleChange}
              placeholder="EPP utilizados por el trabajador..." rows={2} />

            <TextAreaGroup label="Accidentes de trabajo previos" name="accidentesTrabajoPrevios"
              value={data.accidentesTrabajoPrevios || ''} onChange={handleChange}
              placeholder="Descripción de AT previos..." rows={2} />
          </div>
        )}

        {/* Examen Físico */}
        {activeTab === 'examen' && (
          <div>
            <VitalSigns data={data} onChange={(d) => setData(d)} disabled={isClosed} />
            <PhysicalExam data={data} onChange={(d) => setData(d)} disabled={isClosed}
              enfasis={data.enfasisExamen || 'GENERAL'} />
          </div>
        )}

        {/* Diagnósticos */}
        {activeTab === 'diagnostico' && (
          <div>
            <SectionTitle title="Diagnósticos CIE-10" icon={Activity} color="blue" />
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <CIE10Input
                      value={data[`diagnostico${n}`] || ''}
                      onChange={(val) => setData((p) => ({ ...p, [`diagnostico${n}`]: val }))}
                      placeholder={`Diagnóstico ${n}...`}
                    />
                  </div>
                  <SelectGroup label="Tipo" name={`diagnosticoTipo${n}`}
                    value={data[`diagnosticoTipo${n}`] || ''} onChange={handleChange}
                    options={['Confirmado', 'Presuntivo', 'Descartado']}
                    width="w-32" />
                </div>
              ))}
            </div>

            <TextAreaGroup label="Análisis clínico" name="analisis"
              value={data.analisis || ''} onChange={handleChange}
              placeholder="Análisis e interpretación de hallazgos..." rows={4} />
          </div>
        )}

        {/* Concepto de Aptitud */}
        {activeTab === 'concepto' && (
          <div>
            <SectionTitle title="Concepto de Aptitud Laboral" icon={CheckCircle2} color="emerald" />
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3">
              <label className="block text-[10px] font-black text-gray-700 mb-2 uppercase">Concepto</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'APTO SIN RESTRICCIONES', color: 'bg-emerald-100 border-emerald-400 text-emerald-800' },
                  { v: 'APTO CON RESTRICCIONES', color: 'bg-amber-100 border-amber-400 text-amber-800' },
                  { v: 'APTO CON RECOMENDACIONES', color: 'bg-blue-100 border-blue-400 text-blue-800' },
                  { v: 'NO APTO', color: 'bg-red-100 border-red-400 text-red-800' },
                  { v: 'APLAZADO', color: 'bg-purple-100 border-purple-400 text-purple-800' },
                ].map(({ v, color }) => (
                  <label key={v} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition ${
                    data.conceptoAptitud === v ? color : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="conceptoAptitud" value={v}
                      checked={data.conceptoAptitud === v} onChange={handleChange}
                      className="w-4 h-4 accent-emerald-600" />
                    <span className="text-xs font-black">{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Restrictions and Recommendations buttons */}
            <div className="flex gap-2 mb-3 no-print">
              {onOpenRestrictions && (
                <button type="button" onClick={onOpenRestrictions}
                  className="flex-1 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-black text-red-700 hover:bg-red-100 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Restricciones
                </button>
              )}
              {onOpenRecommendations && (
                <button type="button" onClick={onOpenRecommendations}
                  className="flex-1 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-700 hover:bg-emerald-100 flex items-center justify-center gap-1">
                  <ClipboardList className="w-4 h-4" /> Recomendaciones
                </button>
              )}
            </div>

            <TextAreaGroup label="Restricciones" name="restricciones"
              value={data.restricciones || ''} onChange={handleChange}
              placeholder="Restricciones médico-laborales..." rows={3} />

            <TextAreaGroup label="Recomendaciones" name="recomendaciones"
              value={data.recomendaciones || ''} onChange={handleChange}
              placeholder="Recomendaciones para el trabajador y la empresa..." rows={3} />

            <TextAreaGroup label="Observaciones" name="observaciones"
              value={data.observaciones || ''} onChange={handleChange}
              placeholder="Observaciones adicionales..." rows={2} />
          </div>
        )}
      </fieldset>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t no-print">
        <button onClick={onSave}
          className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 flex items-center justify-center gap-1.5">
          <Save className="w-4 h-4" /> Guardar HC
        </button>
        {onPrint && (
          <button onClick={onPrint}
            className="py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 flex items-center gap-1">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        )}
        <button onClick={onClose}
          className="py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200">
          Cerrar
        </button>
      </div>
    </div>
  );
};
