import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CIE11_EQUIVALENCIAS } from '../../data/cie11.js';
import { CIE10_OCUPACIONAL } from '../../data/cie10.js';
import { CUPS_OCUPACIONAL } from '../../data/cups.js';

export const _equivalenciaCIE11 = (cie10code) => {
  if (!cie10code) return null;
  const c = cie10code.toUpperCase().split(" ")[0].split("-")[0];
  return (
    CIE11_EQUIVALENCIAS.find((e) => e.cie10 === c || c.startsWith(e.cie10)) ||
    null
  );
};
export const CIE11Badge = ({ cie10value }) => {
  if (!cie10value || cie10value.trim().length < 3) return null;
  const eq = _equivalenciaCIE11(cie10value);
  if (!eq) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#fef9c3",
        border: "1px solid #fbbf24",
        borderRadius: "5px",
        padding: "2px 7px",
        marginTop: "2px",
        fontSize: "9px",
        color: "#78350f",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: "900", color: "#92400e", flexShrink: 0 }}>
        CIE-11:
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontWeight: "800",
          background: "#fde68a",
          padding: "1px 4px",
          borderRadius: "3px",
          flexShrink: 0,
        }}
      >
        {eq.cie11}
      </span>
      <span style={{ color: "#713f12", flex: 1 }}>{eq.desc}</span>
      <span
        style={{
          fontSize: "8px",
          color: "#b45309",
          fontStyle: "italic",
          flexShrink: 0,
        }}
      >
        Res. 1442/2024
      </span>
    </div>
  );
};
export const _buscarCUPS = (query, maxResults) => {
  const max = maxResults || 10;
  if (!query || query.trim().length < 2) return [];
  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const q = normalize(query.trim());
  return CUPS_OCUPACIONAL.filter(
    (item) =>
      normalize(item.code).includes(q) ||
      normalize(item.desc).includes(q) ||
      normalize(item.group).includes(q)
  ).slice(0, max);
};
export const CUPSInput = ({ value, onChange, placeholder, className }) => {
  const [query, setQuery] = useState(value || "");
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    setQuery(value || "");
  }, [value]);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange && onChange(v);
    if (v.trim().length >= 2) {
      const r = _buscarCUPS(v);
      setSugerencias(r);
      setAbierto(r.length > 0);
    } else {
      setSugerencias([]);
      setAbierto(false);
    }
  };
  const seleccionar = (item) => {
    const completo = item.code + " - " + item.desc;
    setQuery(completo);
    onChange && onChange(completo);
    setSugerencias([]);
    setAbierto(false);
  };
  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        onChange={handleInput}
        onFocus={() => {
          if (sugerencias.length > 0) setAbierto(true);
        }}
        placeholder={
          placeholder || "Buscar CUPS - código o nombre del procedimiento..."
        }
        className={
          className ||
          "w-full p-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-teal-400 outline-none border-gray-300"
        }
        autoComplete="off"
        spellCheck="false"
      />
      {abierto && sugerencias.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "white",
            border: "2px solid #0d9488",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {sugerencias.map((item, ixd) => (
            <div
              key={ixd}
              onMouseDown={(e) => {
                e.preventDefault();
                seleccionar(item);
              }}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0fdfa")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <div style={{ flexShrink: 0, textAlign: "center" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: "900",
                    color: "#134e4a",
                    fontSize: "10px",
                    background: "#ccfbf1",
                    padding: "2px 5px",
                    borderRadius: "4px",
                    display: "block",
                  }}
                >
                  {item.code}
                </span>
                <span
                  style={{
                    fontSize: "8px",
                    color: "#0d9488",
                    fontWeight: "700",
                    display: "block",
                    marginTop: "1px",
                  }}
                >
                  {item.group}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  lineHeight: "1.4",
                  flex: 1,
                }}
              >
                {item.desc}
              </span>
            </div>
          ))}
          <div
            style={{
              padding: "3px 10px",
              background: "#f0fdfa",
              fontSize: "9px",
              color: "#6b7280",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {sugerencias.length} resultado(s) · CUPS Colombia · Res. 5265/1994
            actualizada · MinSalud
          </div>
        </div>
      )}
    </div>
  );
};
export const _buscarCIE10 = (query, maxResults) => {
  const max = maxResults || 12;
  if (!query || query.trim().length < 2) return [];
  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const q = normalize(query.trim());
  return CIE10_OCUPACIONAL.filter((item) => {
    return normalize(item.code).includes(q) || normalize(item.desc).includes(q);
  }).slice(0, max);
};
// Componente CIE10Input: autocomplete en tiempo real al escribir
export const CIE10Input = ({ value, onChange, placeholder, className, name }) => {
  const [query, setQuery] = useState(value || "");
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    setQuery(value || "");
  }, [value]);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange && onChange(v);
    if (v.trim().length >= 2) {
      const r = _buscarCIE10(v);
      setSugerencias(r);
      setAbierto(r.length > 0);
    } else {
      setSugerencias([]);
      setAbierto(false);
    }
  };
  const seleccionar = (item) => {
    const completo = item.code + " - " + item.desc;
    setQuery(completo);
    onChange && onChange(completo);
    setSugerencias([]);
    setAbierto(false);
  };
  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        name={name}
        value={query}
        onChange={handleInput}
        onFocus={() => {
          if (sugerencias.length > 0) setAbierto(true);
        }}
        placeholder={placeholder || "Buscar CIE-10 - código o descripción..."}
        className={
          className ||
          "w-full p-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-400 outline-none border-gray-300"
        }
        autoComplete="off"
        spellCheck="false"
      />
      {abierto && sugerencias.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "white",
            border: "2px solid #10b981",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {sugerencias.map((item, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                seleccionar(item);
              }}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#ecfdf5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: "900",
                  color: "#065f46",
                  fontSize: "11px",
                  minWidth: "54px",
                  background: "#d1fae5",
                  padding: "2px 5px",
                  borderRadius: "4px",
                  flexShrink: 0,
                }}
              >
                {item.code}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  lineHeight: "1.4",
                }}
              >
                {item.desc}
              </span>
            </div>
          ))}
          <div
            style={{
              padding: "3px 10px",
              background: "#f0fdf4",
              fontSize: "9px",
              color: "#6b7280",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {sugerencias.length} resultado(s) · CIE-10 Salud Ocupacional ·
            Decreto 1477/2014 · Res. 1843/2025
          </div>
        </div>
      )}
    </div>
  );
};
