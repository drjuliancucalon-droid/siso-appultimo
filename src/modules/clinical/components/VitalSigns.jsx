import React from 'react';
import { Heart } from 'lucide-react';
import { InputGroup } from '../../../shared/components/ui/InputGroup';
import { SelectGroup } from '../../../shared/components/ui/SelectGroup';
import { SectionTitle } from '../../../shared/components/ui/SectionTitle';

/**
 * VitalSigns - Sección de signos vitales
 * TA, FC, FR, Temperatura, Peso, Talla, IMC, SpO2, perímetro abdominal
 */
export const VitalSigns = ({ data, onChange, disabled = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });

    // Auto-calculate IMC when weight or height changes
    if (name === 'peso' || name === 'talla') {
      const peso = parseFloat(name === 'peso' ? value : data.peso);
      const talla = parseFloat(name === 'talla' ? value : data.talla);
      if (peso > 0 && talla > 0) {
        const tallaMt = talla > 3 ? talla / 100 : talla;
        const imc = (peso / (tallaMt * tallaMt)).toFixed(1);
        onChange({
          ...data,
          [name]: value,
          imc,
          clasificacionIMC: getIMCClassification(parseFloat(imc)),
        });
      }
    }
  };

  const getIMCClassification = (imc) => {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidad grado I';
    if (imc < 40) return 'Obesidad grado II';
    return 'Obesidad grado III';
  };

  const analyzeBP = (v) => {
    if (!v) return null;
    const parts = v.split('/');
    if (parts.length !== 2) return null;
    const sys = parseInt(parts[0]);
    const dia = parseInt(parts[1]);
    if (isNaN(sys) || isNaN(dia)) return null;
    if (sys >= 180 || dia >= 120) return { label: 'CRISIS HTA', color: 'text-red-700 bg-red-50' };
    if (sys >= 140 || dia >= 90) return { label: 'HTA Grado 2', color: 'text-red-600 bg-red-50' };
    if (sys >= 130 || dia >= 80) return { label: 'HTA Grado 1', color: 'text-orange-600 bg-orange-50' };
    if (sys >= 120 && dia < 80) return { label: 'Elevada', color: 'text-yellow-600 bg-yellow-50' };
    if (sys < 90 || dia < 60) return { label: 'Hipotensión', color: 'text-blue-600 bg-blue-50' };
    return { label: 'Normal', color: 'text-emerald-600 bg-emerald-50' };
  };

  const analyzeHR = (v) => {
    const hr = parseInt(v);
    if (isNaN(hr)) return null;
    if (hr < 60) return { label: 'Bradicardia', color: 'text-blue-600 bg-blue-50' };
    if (hr > 100) return { label: 'Taquicardia', color: 'text-red-600 bg-red-50' };
    return { label: 'Normal', color: 'text-emerald-600 bg-emerald-50' };
  };

  const analyzeBMI = (v) => {
    const bmi = parseFloat(v);
    if (isNaN(bmi)) return null;
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-600 bg-blue-50' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-600 bg-emerald-50' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'Obesidad', color: 'text-red-600 bg-red-50' };
  };

  const bpAnalysis = analyzeBP(data.tensionArterial);
  const hrAnalysis = analyzeHR(data.frecuenciaCardiaca);
  const bmiAnalysis = analyzeBMI(data.imc);

  return (
    <fieldset disabled={disabled}>
      <SectionTitle title="Signos Vitales y Antropometría" icon={Heart} color="red" />
      <div className="flex flex-wrap -mx-1.5">
        <div className="w-1/4 min-w-[120px] px-1.5 mb-2">
          <label className="block text-[10px] font-black text-gray-600 mb-0.5 uppercase">
            T.A. (mmHg)
          </label>
          <input
            name="tensionArterial"
            value={data.tensionArterial || ''}
            onChange={handleChange}
            placeholder="120/80"
            className="w-full p-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-emerald-400 outline-none"
          />
          {bpAnalysis && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${bpAnalysis.color}`}>
              {bpAnalysis.label}
            </span>
          )}
        </div>
        <InputGroup
          label="F.C. (lpm)"
          name="frecuenciaCardiaca"
          value={data.frecuenciaCardiaca || ''}
          onChange={handleChange}
          width="w-1/6 min-w-[90px]"
          type="number"
        />
        {hrAnalysis && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded self-end mb-2 ${hrAnalysis.color}`}>
            {hrAnalysis.label}
          </span>
        )}
        <InputGroup
          label="F.R. (rpm)"
          name="frecuenciaRespiratoria"
          value={data.frecuenciaRespiratoria || ''}
          onChange={handleChange}
          width="w-1/6 min-w-[90px]"
          type="number"
        />
        <InputGroup
          label="Temp. (°C)"
          name="temperatura"
          value={data.temperatura || ''}
          onChange={handleChange}
          width="w-1/6 min-w-[90px]"
        />
        <InputGroup
          label="SpO₂ (%)"
          name="saturacionO2"
          value={data.saturacionO2 || ''}
          onChange={handleChange}
          width="w-1/6 min-w-[90px]"
        />
        <InputGroup
          label="Peso (kg)"
          name="peso"
          value={data.peso || ''}
          onChange={handleChange}
          width="w-1/6 min-w-[90px]"
          type="number"
        />
        <InputGroup
          label="Talla (cm)"
          name="talla"
          value={data.talla || ''}
          onChange={handleChange}
          width="w-1/6 min-w-[90px]"
          type="number"
        />
        <div className="w-1/6 min-w-[90px] px-1.5 mb-2">
          <label className="block text-[10px] font-black text-gray-600 mb-0.5 uppercase">
            IMC (kg/m²)
          </label>
          <input
            name="imc"
            value={data.imc || ''}
            readOnly
            className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 font-bold"
          />
          {bmiAnalysis && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${bmiAnalysis.color}`}>
              {bmiAnalysis.label}
            </span>
          )}
        </div>
        <InputGroup
          label="Perím. Abdominal (cm)"
          name="perimetroAbdominal"
          value={data.perimetroAbdominal || ''}
          onChange={handleChange}
          width="w-1/6 min-w-[100px]"
        />
        <SelectGroup
          label="Lateralidad"
          name="lateralidad"
          value={data.lateralidad || ''}
          onChange={handleChange}
          options={['Diestro', 'Zurdo', 'Ambidiestro']}
          width="w-1/6 min-w-[100px]"
        />
      </div>
    </fieldset>
  );
};
