// siso-appultimo/functions/_middleware.js
// BFF same-origin — capa de seguridad global para /api/*.
//
// A diferencia del monolito (../ocupasaludparadesplegar/functions/_middleware.js,
// que inyecta SISO_TOKEN en el HTML servido al navegador vía
// window.__SISO_CONFIG — patrón explícitamente prohibido para el refactor,
// ver docs/audits/REFRACTOR_D1_BFF_SECURITY_DESIGN.md §2 y §9), este
// middleware NUNCA lee ni expone SISO_TOKEN. Su único rol:
//
//   1) Defensa en profundidad: si el navegador enviara un header
//      X-Siso-Token/Authorization propio hacia /api/internal-store/*, se
//      descarta ANTES de que la request llegue al handler — ningún endpoint
//      debe ni puede confiar en un token provisto por el cliente. El único
//      SISO_TOKEN válido es el binding de entorno server-side que cada
//      handler lee directamente de context.env — nunca este archivo.
//   2) Evita que respuestas de /api/* queden cacheadas por el navegador o
//      por proxies intermedios (Cache-Control: no-store), relevante porque
//      son datos potencialmente sensibles aunque de acceso público.
//   3) Defensa adicional: si por error un handler futuro llegara a setear
//      un header X-Siso-Token en la respuesta, se elimina antes de salir
//      hacia el navegador.

const API_PREFIX = "/api/";

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (!url.pathname.startsWith(API_PREFIX)) {
    // Fuera de /api/*: no es responsabilidad de este middleware.
    return context.next();
  }

  // Reconstruir la request sin headers de auth que el cliente pudiera haber
  // enviado — ningún handler de este BFF debe leerlos, pero tampoco deben
  // ni siquiera llegar a estar disponibles en context.request.
  const sanitizedHeaders = new Headers(request.headers);
  sanitizedHeaders.delete("X-Siso-Token");
  sanitizedHeaders.delete("Authorization");
  const sanitizedRequest = new Request(request, { headers: sanitizedHeaders });

  const response = await context.next(sanitizedRequest);

  const hardenedHeaders = new Headers(response.headers);
  hardenedHeaders.set("Cache-Control", "no-store, private");
  hardenedHeaders.set("X-Content-Type-Options", "nosniff");
  hardenedHeaders.delete("X-Siso-Token");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: hardenedHeaders,
  });
}
