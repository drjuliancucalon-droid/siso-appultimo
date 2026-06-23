import React, { useRef, useEffect } from 'react';

export const TextAreaGroup = ({
  label,
  name,
  value,
  onChange,
  rows = 3,
  placeholder = "",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);

  return (
    <div className="mb-2 w-full px-1.5 print:mb-1">
      <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
        {label}
      </label>
      <textarea
        ref={ref}
        name={name}
        value={value || ""}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs print:text-[9px] print:p-0 print:border-none resize-none overflow-hidden"
        style={{ minHeight: `${rows * 1.6}rem` }}
      />
    </div>
  );
};
