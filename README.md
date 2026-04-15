# 🏥 SISO OcupaSalud Pro v2.0

**Sistema Integral de Salud Ocupacional y SG-SST**

Aplicación modular para gestión de salud ocupacional conforme a la normativa colombiana (Res. 1843/2025, Decreto 1072/2015, Ley 1581/2012).

## 🚀 Quick Start

### Requisitos
- Node.js 20+
- npm 10+

### Frontend
```bash
npm install
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd backend
cp ../.env.example .env  # Editar con credenciales reales
npm install
npm run dev
# → http://localhost:3001
```

### Ambos juntos
```bash
npm run dev:all
```

## 🔐 Credenciales de desarrollo
| Usuario | Password | Rol |
|---------|----------|-----|
| drcucalon | Cucalon2026! | administrador |

## 📦 Arquitectura

```
siso-appultimo/
├── src/                    # Frontend (React + Vite)
│   ├── App.jsx             # Router con lazy loading (5 KB)
│   ├── app/Layout.jsx      # Header + tabs horizontal
│   ├── pages/              # 14 páginas por ruta
│   ├── modules/            # Módulos por dominio
│   │   ├── auth/           # Autenticación
│   │   ├── clinical/       # HC Ocupacional + General
│   │   ├── ai/             # IA multi-proveedor
│   │   ├── billing/        # Facturación + Caja
│   │   ├── companies/      # Gestión de empresas
│   │   ├── agenda/         # Citas + Cola
│   │   ├── reports/        # Reportes + RIPS + FHIR
│   │   ├── sgsst/          # SG-SST completo
│   │   ├── patients/       # Portal trabajador
│   │   ├── users/          # Gestión usuarios
│   │   ├── notifications/  # Notificaciones
│   │   └── telemedicine/   # Telemedicina
│   ├── stores/             # Zustand (auth, ui, ai)
│   ├── hooks/              # useBackendData, useSaveData
│   ├── lib/                # API client, print service
│   └── shared/             # Componentes UI, data, utils
│
├── backend/                # Backend (Express + JWT)
│   └── src/
│       ├── server.js       # Express v5 + Helmet + CORS
│       ├── routes/
│       │   ├── auth.js     # Login PBKDF2 + JWT
│       │   ├── ai.js       # Proxy IA seguro
│       │   ├── data.js     # Lectura de datos
│       │   ├── write.js    # Escritura de datos
│       │   └── admin.js    # Reset passwords
│       ├── middleware/
│       │   └── auth.js     # JWT + role guard
│       └── services/
│           └── supabaseClient.js
│
└── public/                 # Archivos estáticos
```

## 🛡️ Seguridad
- JWT access + refresh tokens
- PBKDF2 con salt (100K iteraciones)
- API keys de IA solo en servidor
- Rate limiting (100 req/min, 10/15min login)
- Helmet security headers
- CORS estricto
- Audit log server-side
- Zod validation en endpoints

## 📊 Métricas
| Métrica | Valor |
|---------|-------|
| Build chunks | 19 |
| Core bundle (gzip) | 73 KB |
| HC chunk (gzip) | 31 KB |
| Build time | ~6 segundos |
| Pacientes (prod) | 162 |
| Empresas (prod) | 26 |
| Usuarios (prod) | 4 |

## 📋 Normativa colombiana
- Res. 1843/2025 — Historia Clínica Ocupacional
- Res. 1995/1999 — Manejo de HC
- Decreto 1072/2015 — SG-SST
- Ley 1581/2012 — Protección de datos (Habeas Data)
- Res. 2275/2023 — RIPS
- Res. 1888/2025 — FHIR R4
- Ley 527/1999 — Firma digital
- GTC-45 — Identificación de peligros
- Guías GATISO — Vigilancia epidemiológica

## 🔧 Stack
- **Frontend:** React 18, Vite 6, Tailwind CSS, Zustand, React Router, Tanstack Query, Lucide
- **Backend:** Node.js, Express 5, JWT, Zod, Helmet, CORS
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Netlify (frontend) + Railway/Render (backend)
