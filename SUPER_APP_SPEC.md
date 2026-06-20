# SISO-APP SUPER APPLICATION SPECIFICATION

## Overview
This is the complete specification to build a modular, scalable super-application that combines:
1. **The existing monolith** (`../monolito-guia/`) - a React SPA with Vite + Supabase for occupational health
2. **The protocol document** - a comprehensive plan for OcupaSalud Pro platform

## CRITICAL: What Already Exists in the Monolith
The monolith (`../monolito-guia/src/App.jsx`) is a ~48,000-line single-file React app with ALL of these working features:

### Existing Features (MUST preserve):
- **Authentication System**: Multi-user login with SHA-256/PBKDF2 hashing, rate limiting, session timeout (30min), 2FA TOTP
- **Multi-tenant/Multi-org**: Organizations, companies, roles (super_admin, administrador, medico, secretaria, admin_empresa)
- **Plan/License System**: libre/starter/pro/clinica plans with feature gating (PlanGate component)
- **Supabase Cloud Sync**: Full CRUD with RLS, offline fallback to localStorage, sync queue
- **Patient Management**: Occupational and general patient records with full HC (Historia Clínica)
- **CIE-10/CIE-11**: Complete diagnostic catalogs with autocomplete for Colombian occupational health
- **CUPS**: Colombian procedure codes catalog
- **Medications**: 200+ Colombian medications with autocomplete, custom meds support
- **Medical Restrictions**: 12 categories with GTC-45/GATISO normative references
- **Recommendations**: Categorized medical recommendations checklist
- **AI Integration**: 4 providers (Gemini, Groq, Together AI, OpenRouter) for analysis, reports, profesiogramas
- **Prescriptions/Derivations**: Full prescription system with print support, derivation/interconsulta management
- **Digital Signature**: SHA-256 hash verification, QR codes (Ley 527/1999)
- **RIPS Generation**: Resolution 2275/2023 compliant JSON export
- **FHIR R4 Export**: HL7 FHIR Bundle generation (Res. 1888/2025)
- **RDA Generation**: Resumen Digital de Atención
- **DIAN UBL 2.1**: Electronic invoice XML generation
- **Consent System**: Digital informed consent (Ley 1581/2012, Res. 1843/2025)
- **Worker Portal**: Public portal for workers to check their HC by verification code
- **Company Portal**: Portal for company admins
- **Telemedicine**: Basic teleconsultation via Daily.co/Jitsi
- **Agenda/Scheduling**: Appointment management with queue system
- **Billing**: Bills, proposals, quotations, cashbox (caja)
- **Epidemiological Reports**: SVE programs (DME, cardiovascular, respiratory, etc.)
- **ARL Reports**: FURAT, FUREP digital forms
- **Audit Log**: All actions logged
- **Print System**: Premium print styles for all documents
- **File Attachments**: Supabase Storage for paraclinical attachments
- **Notifications**: WhatsApp/Email/SMS notification system (link-based)
- **Backup/Restore**: JSON backup with retention certification (20 years)
- **Security**: XSS sanitization, MIME validation, CSP headers, PBKDF2, rate limiting

### Existing Pages:
- Dashboard, Historia (HC), Companies, Users, Agenda, Bill, Caja, Planes, Reporte

## What the Protocol Document Adds (NEW features needed):

### MODULE 1: SG-SST Management (NEW)
- **Policy & Objectives**: AI-powered SST policy generator
- **IPEVR**: Interactive risk matrix by area/position with GTC-45
- **Annual Work Plan**: Visual Gantt chronogram
- **Training Module**: E-learning with videos, quizzes, auto-certificates
- **Accident Investigation**: FURAT/FUREP digital + tree of causes + 5-whys
- **Inspections & Audits**: Digital checklists with mobile photos
- **Document Repository**: 21 mandatory documents with version control

### MODULE 3: Advanced AI & Analytics (ENHANCE existing)
- **Accident Prediction**: XGBoost model integration
- **Absenteeism Prediction**: Random Forest model
- **Epidemiological Surveillance**: DBSCAN clustering
- **Normative Assistant**: LLM-powered chatbot for SST regulations

### MODULE 4: Worker Portal (ENHANCE existing)
- Request appointments
- Report unsafe conditions with photos
- Psychosocial risk surveys

### MODULE 5: Administration (ENHANCE existing)
- Multi-company management (already exists, enhance)
- Automated billing (enhance existing)
- Compliance reports

## ARCHITECTURE: Modular Structure

Transform the monolith into this modular structure:

```
src/
├── app/                          # App shell
│   ├── App.jsx                   # Main app with router
│   ├── AppProviders.jsx          # Context providers wrapper
│   └── routes.jsx                # Route definitions
│
├── modules/                      # Feature modules (domain-driven)
│   ├── auth/                     # Authentication & authorization
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ChangePasswordForm.jsx
│   │   │   └── TwoFactorAuth.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── totpService.js
│   │   └── index.js
│   │
│   ├── clinical/                 # Clinical records (HC)
│   │   ├── components/
│   │   │   ├── OccupationalHC.jsx
│   │   │   ├── GeneralHC.jsx
│   │   │   ├── PhysicalExam.jsx
│   │   │   ├── VitalSigns.jsx
│   │   │   ├── DiagnosticSection.jsx
│   │   │   ├── ConsentModal.jsx
│   │   │   ├── RestrictionsPanel.jsx
│   │   │   ├── RecommendationsPanel.jsx
│   │   │   └── PrescriptionTab.jsx
│   │   ├── hooks/
│   │   │   └── useClinicalRecord.js
│   │   ├── services/
│   │   │   ├── patientService.js
│   │   │   └── hcService.js
│   │   └── index.js
│   │
│   ├── ai/                       # AI engine
│   │   ├── components/
│   │   │   ├── AIConfigPanel.jsx
│   │   │   └── AIAssistant.jsx
│   │   ├── services/
│   │   │   ├── aiProviders.js
│   │   │   ├── aiAnalysis.js
│   │   │   └── predictiveModels.js
│   │   └── index.js
│   │
│   ├── companies/                # Company management
│   │   ├── components/
│   │   │   ├── CompanyList.jsx
│   │   │   ├── CompanyForm.jsx
│   │   │   └── CompanyPortal.jsx
│   │   ├── hooks/
│   │   │   └── useCompanies.js
│   │   └── index.js
│   │
│   ├── sgsst/                    # SG-SST Management (NEW)
│   │   ├── components/
│   │   │   ├── SSTDashboard.jsx
│   │   │   ├── PolicyGenerator.jsx
│   │   │   ├── RiskMatrix.jsx
│   │   │   ├── AnnualPlan.jsx
│   │   │   ├── TrainingModule.jsx
│   │   │   ├── AccidentInvestigation.jsx
│   │   │   ├── InspectionChecklist.jsx
│   │   │   └── DocumentRepository.jsx
│   │   ├── hooks/
│   │   │   └── useSGSST.js
│   │   ├── services/
│   │   │   └── sgsstService.js
│   │   └── index.js
│   │
│   ├── telemedicine/             # Telemedicine
│   │   ├── components/
│   │   │   ├── VideoConsult.jsx
│   │   │   ├── AppointmentScheduler.jsx
│   │   │   └── ProfesiogramaAI.jsx
│   │   ├── services/
│   │   │   └── telemedService.js
│   │   └── index.js
│   │
│   ├── billing/                  # Billing & finance
│   │   ├── components/
│   │   │   ├── BillGenerator.jsx
│   │   │   ├── CashBox.jsx
│   │   │   ├── Proposals.jsx
│   │   │   └── DIANExport.jsx
│   │   ├── services/
│   │   │   └── billingService.js
│   │   └── index.js
│   │
│   ├── reports/                  # Reports & analytics
│   │   ├── components/
│   │   │   ├── EpidemiologicalReport.jsx
│   │   │   ├── SVEPrograms.jsx
│   │   │   ├── ARLReports.jsx
│   │   │   ├── ComplianceReport.jsx
│   │   │   └── AnalyticsDashboard.jsx
│   │   ├── services/
│   │   │   ├── ripsService.js
│   │   │   ├── fhirService.js
│   │   │   └── rdaService.js
│   │   └── index.js
│   │
│   ├── users/                    # User management
│   │   ├── components/
│   │   │   ├── UserList.jsx
│   │   │   ├── UserForm.jsx
│   │   │   ├── LicenseManager.jsx
│   │   │   └── DoctorProfile.jsx
│   │   ├── hooks/
│   │   │   └── useUsers.js
│   │   └── index.js
│   │
│   ├── patients/                 # Patient/Worker portal
│   │   ├── components/
│   │   │   ├── WorkerPortal.jsx
│   │   │   ├── PatientList.jsx
│   │   │   └── UnsafeConditionReport.jsx
│   │   └── index.js
│   │
│   ├── agenda/                   # Scheduling
│   │   ├── components/
│   │   │   ├── AgendaView.jsx
│   │   │   ├── QueueManager.jsx
│   │   │   └── AppointmentForm.jsx
│   │   └── index.js
│   │
│   └── notifications/            # Notifications
│       ├── components/
│       │   └── NotificationModal.jsx
│       ├── services/
│       │   └── notificationService.js
│       └── index.js
│
├── shared/                       # Shared utilities
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── InputGroup.jsx
│   │   │   ├── SelectGroup.jsx
│   │   │   ├── TextAreaGroup.jsx
│   │   │   ├── SectionTitle.jsx
│   │   │   ├── PlanGate.jsx
│   │   │   ├── BrandLogo.jsx
│   │   │   ├── DoctorSignature.jsx
│   │   │   └── FortalezaPass.jsx
│   │   ├── CIE10Input.jsx
│   │   ├── CIE11Badge.jsx
│   │   ├── CUPSInput.jsx
│   │   └── MedicamentoAutocomplete.jsx
│   │
│   ├── data/                     # Static data catalogs
│   │   ├── catalogs.js           # ARL, AFP, EPS, contracts, etc.
│   │   ├── cie10.js              # CIE-10 occupational codes
│   │   ├── cie11.js              # CIE-11 equivalences
│   │   ├── cups.js               # CUPS procedure codes
│   │   ├── medicamentos.js       # Colombian medications catalog
│   │   ├── restricciones.js      # Medical restrictions catalog
│   │   ├── recomendaciones.js    # Recommendations catalog
│   │   ├── derivaciones.js       # Derivation/interconsulta catalog
│   │   ├── planConfig.js         # Plan definitions
│   │   └── initialStates.js      # Initial form states
│   │
│   ├── hooks/
│   │   ├── useAppState.js        # Global state management
│   │   └── useLocalStorage.js
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── supabase.js           # Supabase client & sync
│   │   ├── storage.js            # localStorage/sessionStorage wrappers
│   │   ├── security.js           # Sanitization, hashing, validation
│   │   ├── crypto.js             # SHA-256, PBKDF2, TOTP
│   │   ├── formatters.js         # Date, number, text formatters
│   │   ├── normativa.js          # Colombian regulation helpers
│   │   ├── aiProviders.js        # AI provider configurations
│   │   └── printUtils.js         # Print window generation
│   │
│   └── styles/
│       └── print.css             # Print styles
│
├── pages/                        # Page-level components (route targets)
│   ├── Dashboard.jsx
│   ├── Historia.jsx
│   ├── Companies.jsx
│   ├── Users.jsx
│   ├── Agenda.jsx
│   ├── Bill.jsx
│   ├── Caja.jsx
│   ├── Planes.jsx
│   ├── Reporte.jsx
│   ├── SGSST.jsx                 # NEW
│   ├── Telemedicine.jsx          # NEW dedicated page
│   └── WorkerPortal.jsx          # NEW dedicated page
│
├── main.jsx                      # Entry point
└── styles.css                    # Global styles (Tailwind)
```

## TECH STACK (Keep existing):
- React 18 with Vite
- Tailwind CSS (via CDN in index.html)  
- Lucide React for icons
- Supabase for backend/storage
- No additional dependencies beyond what's in monolith

## KEY CONSTRAINTS:
1. **All existing functionality MUST work** - this is a medical system in production
2. **Same Supabase integration** - keep _SB_URL, _SB_KEY, RLS policies
3. **Same authentication flow** - users/passwords/roles must remain compatible
4. **Same data structures** - patient records, companies, etc. must be backwards-compatible
5. **Colombian regulations** - Res. 1843/2025, Decreto 1072/2015, Ley 1581/2012
6. **Spanish language** - all UI text in Spanish
7. **Print system** - must preserve all print functionality
8. **Offline support** - localStorage fallback must work

## IMPLEMENTATION ORDER:
1. Set up modular project structure
2. Extract shared utilities and data catalogs
3. Extract UI components
4. Extract authentication module
5. Extract clinical module (largest)
6. Extract remaining modules
7. Build NEW SG-SST module
8. Build enhanced pages
9. Wire everything together with App.jsx router
10. Test all functionality

## TESTING REQUIREMENTS:
- App must build without errors (`npm run build`)
- All routes must render
- Login flow must work
- Patient creation and HC must work
- Print functions must work
- AI integration must work
- Supabase sync must work
