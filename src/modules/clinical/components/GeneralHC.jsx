import React, { useState } from 'react';
import {
  User, Heart, Stethoscope, Activity, FileText,
  Save, Printer, ClipboardList, CheckCircle2
} from 'lucide-react';
import { InputGroup } from '../../../shared/components/ui/InputGroup';
import { SelectGroup } from '../../../shared/components/ui/SelectGroup';
import { TextAreaGroup } from '../../../shared/components/ui/TextAreaGroup';
import { SectionTitle } from '../../../shared/components/ui/SectionTitle';
import { CIE10Input } from '../../../shared/components/CIE10Input';
import { VitalSigns } from './VitalSigns';
import { PhysicalExam } from './PhysicalExam';

/**
 * GeneralHC - Historia Clínica de Medicina General
 * Para consultas no ocupacionales en la IPS
 */
export const GeneralHC = ({
  data,
  setData,
  activeDoctorData,
  activeSignature,
  onSave,
  onClose,
  onPrint,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState('datos');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const isClosed = data.estadoHistoria === 'Cerrada';

  const tabs = [
    { key: 'datos', label: 'Datos Paciente', icon: User },
    { key: 'motivo', label: 'Motivo Consulta', icon: FileText },
    { key: 'antecedentes', label: 'Antecedentes', icon: ClipboardList },
    { key: 'examen', label: 'Examen Físico', icon: Stethoscope },
    { key: 'diagnostico', label: 'Diagnóstico y Plan', icon: Activity },
  ];

  return (
    <div className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
      style={{ width: '21.59cm', minHeight: 'auto', padding: '1.2cm', boxSizing: 'border-box' }}>

      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-blue-500 pb-3 mb-3">
        <div className="w-1/3 text-left">
          <p className="text-[10px] font-black text-blue-800">{activeDoctorData?.nombre || 'MÉDICO'}</p>
          <p className="text-[9px] text-gray-500">{activeDoctorData?.titulo || ''}</p>
        </div>
        <div className="w-1/3 text-center">
          <h1 className="text-sm font-black text-gray-800 uppercase">Historia Clínica General</h1>
          <p className="text-[9px] text-gray-500 font-medium">MEDICINA GENERAL</p>
        </div>
        <div className="w-1/3 text-right text-[9px] font-bold text-gray-400">
          <p>FOR-MG-001 v2.0</p>
          <p>Res. 1995/1999</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-3 no-print overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition flex items-center justify-center gap-1 whitespace-nowrap px-2 ${
              activeTab === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      <fieldset disabled={isClosed} className="disabled:opacity-75">
        {/* Datos del paciente */}
        {activeTab === 'datos' && (
          <div>
            <SectionTitle title="Identificación del Paciente" icon={User} />
            <div className="flex flex-wrap -mx-1.5">
              <InputGroup label="Nombres Completos" name="nombres" value={data.nombres}
                onChange={handleChange} width="w-1/2" placeholder="Nombres y apellidos..." />
              <SelectGroup label="Tipo Doc." name="docTipo" value={data.docTipo || 'CC'}
                onChange={handleChange} options={['CC', 'CE', 'TI', 'Pasaporte', 'PEP']} width="w-1/8 min-w-[80px]" />
              <InputGroup label="Documento" name="docNumero" value={data.docNumero}
                onChange={handleChange} width="w-1/4" />
              <InputGroup label="F. Nacimiento" name="fechaNacimiento" type="date"
                value={data.fechaNacimiento} onChange={(e) => {
                  handleChange(e);
                  if (e.target.value) {
                    const age = Math.floor((new Date() - new Date(e.target.value)) / 31557600000);
                    setData((p) => ({ ...p, fechaNacimiento: e.target.value, edad: String(age) }));
                  }
                }} width="w-1/4" />
              <InputGroup label="Edad" name="edad" value={data.edad} onChange={handleChange} width="w-1/8 min-w-[60px]" />
              <SelectGroup label="Sexo" name="genero" value={data.genero} onChange={handleChange}
                options={['Masculino', 'Femenino', 'Otro']} width="w-1/6" />
              <InputGroup label="Celular" name="celular" value={data.celular} onChange={handleChange} width="w-1/6" />
              <InputGroup label="Dirección" name="direccion" value={data.direccion} onChange={handleChange} width="w-1/3" />
              <InputGroup label="EPS" name="eps" value={data.eps} onChange={handleChange} width="w-1/4" />
              <InputGroup label="Fecha consulta" name="fechaConsulta" type="date"
                value={data.fechaConsulta || new Date().toISOString().split('T')[0]} onChange={handleChange} width="w-1/4" />
            </div>
          </div>
        )}

        {/* Motivo de consulta */}
        {activeTab === 'motivo' && (
          <div>
            <SectionTitle title="Motivo de Consulta" icon={FileText} color="blue" />
            <TextAreaGroup label="Motivo de consulta" name="motivoConsulta"
              value={data.motivoConsulta || ''} onChange={handleChange}
              placeholder="Motivo por el que consulta..." rows={3} />
            <TextAreaGroup label="Enfermedad actual" name="enfermedadActual"
              value={data.enfermedadActual || ''} onChange={handleChange}
              placeholder="Descripción de la enfermedad actual, evolución, tratamientos previos..." rows={4} />
            <SectionTitle title="Revisión por Sistemas" icon={ClipboardList} color="purple" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'revSisGeneral', label: 'Estado general' },
                { name: 'revSisCardiovascular', label: 'Cardiovascular' },
                { name: 'revSisRespiratorio', label: 'Respiratorio' },
                { name: 'revSisDigestivo', label: 'Digestivo' },
                { name: 'revSisUrinario', label: 'Urinario' },
                { name: 'revSisNeurologico', label: 'Neurológico' },
                { name: 'revSisOsteomuscular', label: 'Osteomuscular' },
                { name: 'revSisPiel', label: 'Piel y faneras' },
              ].map(({ name, label }) => (
                <InputGroup key={name} label={label} name={name}
                  value={data[name] || ''} onChange={handleChange}
                  width="w-full" placeholder="Normal / Hallazgos..." />
              ))}
            </div>
          </div>
        )}

        {/* Antecedentes */}
        {activeTab === 'antecedentes' && (
          <div>
            <SectionTitle title="Antecedentes" icon={ClipboardList} />
            {[
              { name: 'antPatologicos', label: 'Patológicos' },
              { name: 'antQuirurgicos', label: 'Quirúrgicos' },
              { name: 'antFarmacologicos', label: 'Farmacológicos' },
              { name: 'antAlergicos', label: 'Alérgicos' },
              { name: 'antFamiliares', label: 'Familiares' },
              { name: 'antGinecoObstetricos', label: 'Gineco-obstétricos' },
            ].map(({ name, label }) => (
              <TextAreaGroup key={name} label={label} name={name}
                value={data[name] || ''} onChange={handleChange}
                placeholder={`${label}...`} rows={2} />
            ))}
          </div>
        )}

        {/* Examen Físico */}
        {activeTab === 'examen' && (
          <div>
            <VitalSigns data={data} onChange={(d) => setData(d)} disabled={isClosed} />
            <PhysicalExam data={data} onChange={(d) => setData(d)} disabled={isClosed} enfasis="GENERAL" />
          </div>
        )}

        {/* Diagnóstico y Plan */}
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
                    options={['Confirmado', 'Presuntivo', 'Descartado']} width="w-32" />
                </div>
              ))}
            </div>

            <TextAreaGroup label="Análisis y plan de tratamiento" name="planTratamiento"
              value={data.planTratamiento || ''} onChange={handleChange}
              placeholder="Plan de manejo, tratamiento indicado..." rows={4} />

            <TextAreaGroup label="Conducta" name="conducta"
              value={data.conducta || ''} onChange={handleChange}
              placeholder="Conducta a seguir..." rows={2} />

            <TextAreaGroup label="Observaciones" name="observaciones"
              value={data.observaciones || ''} onChange={handleChange}
              placeholder="Observaciones adicionales..." rows={2} />
          </div>
        )}
      </fieldset>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t no-print">
        <button onClick={onSave}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 flex items-center justify-center gap-1.5">
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
