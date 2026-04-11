import React from 'react';
import { ChevronDown } from 'lucide-react';

export const InputGroup = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  width = "w-full",
  disabled = false,
  alertInfo = null,
  list,
}) => (
  <div className={`mb-2 ${width} px-1.5 print:mb-1`}>
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate">
      {label}
      {required && <span className="text-red-500 no-print"> *</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        list={list}
        className={`w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-xs ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        } print:text-[9px] print:p-0 print:border-none`}
      />
      {alertInfo && (
        <div
          className={`absolute right-0 -top-5 text-[9px] font-bold px-2 py-0.5 rounded-full no-print ${alertInfo.color}`}
        >
          {alertInfo.text}
        </div>
      )}
    </div>
  </div>
);
export const SelectGroup = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  width = "w-full",
  disabled = false,
}) => (
  <div className={`mb-2 ${width} px-1.5 print:mb-1`}>
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate">
      {label}
      {required && <span className="text-red-500 no-print"> *</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs bg-white appearance-none ${
          disabled ? "bg-gray-50 cursor-not-allowed" : ""
        } print:text-[9px] print:p-0 print:border-none`}
      >
        <option value="">Seleccione...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-gray-400 no-print" />
    </div>
  </div>
);
export const TextAreaGroup = ({
  label,
  name,
  value,
  onChange,
  rows = 3,
  placeholder = "",
}) => (
  <div className="mb-2 w-full px-1.5 print:mb-1">
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
      {label}
    </label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs print:text-[9px] print:p-0 print:border-none resize-none"
    />
  </div>
);
export const SectionTitle = ({ title, icon: Icon, color }) => {
  const c = color || "emerald";
  return (
    <div
      className="print-break-avoid"
      style={{ pageBreakInside: "avoid", pageBreakAfter: "avoid" }}
    >
      <div
        className={`w-full border-b border-${c}-400 mb-2 mt-3 pb-0.5 flex items-center bg-${c}-50 p-1.5 rounded-t print:bg-transparent print:border-gray-400 print:mt-2 print:mb-1 print:p-0`}
      >
        <Icon className={`mr-2 w-4 h-4 text-${c}-600 print:hidden`} />
        <h3
          className={`text-xs font-bold uppercase tracking-wide text-${c}-800 print:text-black`}
        >
          {title}
        </h3>
      </div>
    </div>
  );
};
// ==========================================
