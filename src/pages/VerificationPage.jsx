import React from 'react';
import { FileSearch, LogOut, Search, Printer, Lock, CheckCircle2 } from 'lucide-react';
import BrandLogo from '../shared/ui/BrandLogo.jsx';
import DoctorSignature from '../shared/ui/DoctorSignature.jsx';

const VerificationPage = ({
  verificationCode, setVerificationCode,
  verificationFound, setVerificationFound,
  patientsList, showAlert, goBack, handlePrint,
  activeDoctorData, activeSignature,
}) => {
  const code = verificationCode;
  const setCode = setVerificationCode;
  const found = verificationFound;
  const search = () => {
    const q = code.trim();
    if (!q) {
      showAlert("Ingrese un código de verificación o número de documento.");
      return;
    }
    const allPats = patientsList;
    const byCode = allPats.find(
      (p) =>
        p.codigoVerificacion &&
        p.codigoVerificacion.toUpperCase() === q.toUpperCase()
    );
    const byDoc = !byCode
      ? allPats.filter(
          (p) => p.docNumero === q && p.estadoHistoria === "Cerrada"
        )
      : [];
    if (byCode) {
      setVerificationFound(byCode);
    } else if (byDoc.length === 1) {
      setVerificationFound(byDoc[0]);
    } else if (byDoc.length > 1) {
      setVerificationFound({ _multiple: byDoc });
    } else {
      showAlert(
        "No se encontró ningún certificado cerrado con ese código o documento."
      );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-2xl p-6 mb-6 no-print">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2">
              <FileSearch className="w-5 h-5" /> Validación de Certificados
            </h2>
            <button
              onClick={() => goBack()}
              className="text-gray-500 font-bold text-sm flex items-center gap-1"
            >
              <LogOut className="rotate-180 w-4 h-4" /> Volver
            </button>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <p className="text-xs text-indigo-600 font-bold mb-2">
              Buscar por código de verificación{" "}
              <span className="font-normal">o</span> número de documento del
              paciente:
            </p>
            <div className="flex gap-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                className="flex-1 p-2.5 border border-indigo-300 rounded-xl font-mono text-lg tracking-wider focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Código de verificación Ej: CV-X9Y8Z7"
              />
              <button
                onClick={search}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Consultar
              </button>
            </div>
          </div>
        </div>
        {/* Multiple results selector */}
        {found?._multiple && (
          <div className="bg-white shadow rounded-2xl p-4 mb-4">
            <p className="text-sm font-black text-gray-700 mb-3">
              📋 Se encontraron {found._multiple.length} certificados para ese
              documento. Seleccione:
            </p>
            <div className="space-y-2">
              {found._multiple.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setVerificationFound(p)}
                  className="w-full text-left p-3 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition"
                >
                  <p className="font-bold text-sm text-gray-800">
                    {p.nombres}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.fechaExamen} · {p.conceptoAptitud || "-"} · Código:{" "}
                    {p.codigoVerificacion}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
        {found && !found._multiple && (
          <div
            className="bg-white shadow-2xl print:shadow-none carta-visual mx-auto"
            style={{
              width: "21.59cm",
              minHeight: "auto",
              padding: "1.5cm",
              boxSizing: "border-box",
            }}
          >
            <div className="flex justify-end mb-4 no-print">
              <button
                onClick={() => handlePrint(`Certificado-${found.nombres}`)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
            <div className="text-center border-b-2 border-gray-800 pb-2 mb-4">
              <div className="flex justify-center">
                <BrandLogo data={activeDoctorData} />
              </div>
              <h2 className="text-xl font-black uppercase mt-2">
                Certificado de Aptitud Laboral Verificado
              </h2>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4 text-xs grid grid-cols-2 gap-2 print:bg-transparent">
              <p>
                <strong>Nombre:</strong> {found.nombres}
              </p>
              <p>
                <strong>ID:</strong> {found.docNumero}
              </p>
              <p>
                <strong>Cargo:</strong> {found.cargo}
              </p>
              <p>
                <strong>Empresa:</strong> {found.empresaNombre}
              </p>
              <p>
                <strong>Fecha:</strong> {found.fechaExamen}
              </p>
              <p>
                <strong>Tipo:</strong> {found.tipoExamen}
              </p>
            </div>
            <div className="text-center p-3 border-2 border-gray-800 rounded-xl mb-4">
              <h3 className="text-xs font-bold text-gray-500 mb-1 uppercase">
                Concepto Emitido
              </h3>
              <div className="text-xl font-black uppercase">
                {found.conceptoAptitud}
              </div>
            </div>
            {found.recomendaciones && (
              <div className="mb-3">
                <h4 className="font-bold uppercase border-b mb-1 text-xs text-gray-500">
                  Recomendaciones
                </h4>
                <p className="text-xs whitespace-pre-wrap">
                  {found.recomendaciones}
                </p>
              </div>
            )}
            {found.estadoHistoria === "Cerrada" && (
              <div className="mx-4 mb-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl px-4 py-3 flex items-center gap-3 no-print">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-800">
                    Historia Clínica Firmada y Cerrada
                  </p>
                  <p className="text-[10px] text-emerald-600">
                    Código de verificación:{" "}
                    <span className="font-mono font-bold">
                      {found.codigoVerificacion || "--"}
                    </span>
                  </p>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-between items-end px-4 print-break-avoid">
              <div className="text-center w-1/3">
                <div className="border-t border-gray-800 pt-1 text-[10px] font-bold">
                  Firma del Trabajador
                </div>
              </div>
              <div className="text-center w-1/3">
                <div className="border-2 border-gray-300 p-2 rounded text-[10px]">
                  <p className="font-bold">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    Verificado
                  </p>
                  <p className="font-mono text-sm font-black">
                    {found.codigoVerificacion}
                  </p>
                </div>
              </div>
              <div className="text-center w-1/3">
                <DoctorSignature
                  signature={activeSignature}
                  data={activeDoctorData}
                  showData={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
