// src/shared/ui/AgendaFieldF.jsx
// AgendaFieldInput: componente de campo de formulario de agenda
// DEBE estar fuera del App/renderAgenda para que React no lo destruya en cada keystroke
import React from "react";

const AgendaFieldF = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  opts,
  width = "flex-1",
  list,
  req,
  placeholder,
}) => (
  <div className={width + " min-w-[120px] px-1 mb-2"}>
    <label className="block text-[9px] font-black text-gray-500 uppercase mb-0.5">
      {label}
      {req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {opts ? (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-300 bg-white"
      >
        <option value="">-</option>
        {opts.map((o) => (
          <option key={o.v || o} value={o.v || o}>
            {o.l || o}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        list={list}
        placeholder={placeholder || ""}
        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-300"
      />
    )}
  </div>
);

export default AgendaFieldF;
