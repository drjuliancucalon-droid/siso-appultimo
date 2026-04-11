import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, FileText, Stethoscope, ClipboardList, Printer, Activity, Building2, FileCheck, AlertCircle, Sparkles, BrainCircuit, Loader2, Save, History, CheckCircle2, Trash2, Eye, LogOut, Users, BarChart3, PlusCircle, Search, Cloud, ShieldCheck, UserPlus, AlertTriangle, Pill, GraduationCap, Clock, ShieldAlert, UploadCloud, FileSignature, Share2, Plus, HardDrive, UserCheck, ChevronDown, Lock, Unlock, FileSearch, Banknote, Receipt, Pencil, X, Heart, CheckSquare, Square, ChevronRight, ChevronLeft, RefreshCw, WifiOff, Wifi, Shield, MessageSquare, Download, Upload } from 'lucide-react';

const TabSolicitudExamenes = (props) => {
  const {
    view, setView, navStack, setNavStack, currentUser, setCurrentUser,
    loginAttempts, setLoginAttempts, loginBlockedUntil, setLoginBlockedUntil,
    privacidadAceptada, setPrivacidadAceptada, syncStatus, setSyncStatus,
    showSyncReport, setShowSyncReport, syncReport, setSyncReport,
    alertMsg, setAlertMsg, confirmConfig, setConfirmConfig,
    promptConfig, setPromptConfig, promptValue, setPromptValue,
    aiConfig, setAiConfig, showAIConfig, setShowAIConfig, aiStatus, setAiStatus,
    companies, setCompanies, usersList, setUsersList, usersReady, setUsersReady,
    patientsList, setPatientsList, savedReports, setSavedReports,
    savedBills, setSavedBills, atencionesCerradas, setAtencionesCerradas,
    doctorSignature, setDoctorSignature, auditLog, setAuditLog,
    activeTab, setActiveTab, data, setData, dataType, setDataType,
    isGenerating, setIsGenerating, isGeneratingRestr, setIsGeneratingRestr,
    isGeneratingReco, setIsGeneratingReco, saveStatus, setSaveStatus,
    patientSuggestions, setPatientSuggestions,
    historyNotification, setHistoryNotification,
    showRestriccionesPanel, setShowRestriccionesPanel,
    showRecomendacionesPanel, setShowRecomendacionesPanel,
    showHistoryModal, setShowHistoryModal,
    ripsModalData, setRipsModalData, backupModalData, setBackupModalData,
    hcChoiceAgenda, setHcChoiceAgenda, historyRecords, setHistoryRecords,
    patientSearchTerm, setPatientSearchTerm, genPatSearch, setGenPatSearch,
    examSearch, setExamSearch, examList, setExamList, showExamSuggs, setShowExamSuggs,
    diagExamen, setDiagExamen, justExamen, setJustExamen, printPreview, setPrintPreview,
    selectedCompanyReport, setSelectedCompanyReport, selectedMedicoReport, setSelectedMedicoReport,
    reporteActiveTab, setReporteActiveTab, certSelected, setCertSelected,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate,
    reportAIResult, setReportAIResult, isGeneratingReport, setIsGeneratingReport,
    showExportTable, setShowExportTable, precioPorPaciente, setPrecioPorPaciente,
    showDianPanel, setShowDianPanel, showSecretariaPatientModal, setShowSecretariaPatientModal,
    showTodoChecklist, setShowTodoChecklist, todoSelection, setTodoSelection,
    dianProvider, setDianProvider, dianApiKey, setDianApiKey,
    billData, setBillData, savedBillsList, setSavedBillsList,
    portafolioItems, setPortafolioItems, portafolioForm, setPortafolioForm,
    portafolioEditId, setPortafolioEditId,
    cotizaciones, setCotizaciones, cotizacionForm, setCotizacionForm,
    cotizacionView, setCotizacionView, cotizacionSelId, setCotizacionSelId,
    cajaMovimientos, setCajaMovimientos, cajaForm, setCajaForm, cajaTab, setCajaTab,
    cajaFiltroPeriodo, setCajaFiltroPeriodo, cajaFiltroDesde, setCajaFiltroDesde,
    cajaFiltroHasta, setCajaFiltroHasta, contabTab, setContabTab, contabPeriodo, setContabPeriodo,
    asistenciaFecha, setAsistenciaFecha,
    evolucionForm, setEvolucionForm, showEvolucionModal, setShowEvolucionModal,
    selectedPackage, setSelectedPackage, packageChecklist, setPackageChecklist,
    showPackages, setShowPackages, newComp, setNewComp, ipsPerfilForm, setIpsPerfilForm,
    verificationCode, setVerificationCode, verificationFound, setVerificationFound,
    activeUserMgmtTab, setActiveUserMgmtTab, pendingActivationPlan, setPendingActivationPlan,
    sbCloudData, setSbCloudData, sbLoading, setSbLoading,
    newUserForm, setNewUserForm, userEditId, setUserEditId, editForm, setEditForm,
    propForm, setPropForm, selSvc, setSelSvc, propModulo, setPropModulo,
    mensajes, setMensajes, showMensajePanel, setShowMensajePanel,
    showConsentModal, setShowConsentModal,
    twoFAStep, setTwoFAStep, twoFAToken, setTwoFAToken, twoFAError, setTwoFAError,
    habeasRequests, setHabeasRequests, showHabeasModal, setShowHabeasModal,
    habeasForm, setHabeasForm, showPortalPublico, setShowPortalPublico,
    arlTab, setArlTab, svePrograma, setSvePrograma,
    sveFiltroEmpresa, setSveFiltroEmpresa,
    sveAIAnalisis, setSveAIAnalisis, sveAICargando, setSveAIAnalisisCargando,
    sveAIFiltroEmpresa, setSveAIFiltroEmpresa,
    arlForm, setArlForm, arlGuardados, setArlGuardados,
    showNotifModal, setShowNotifModal, notifData, setNotifData,
    portalCodigo, setPortalCodigo, portalPaciente, setPortalPaciente, portalMultiple, setPortalMultiple,
    epiEmpresa, setEpiEmpresa, epiPeriodo, setEpiPeriodo, epiTab, setEpiTab,
    teleconsultas, setTeleconsultas, teleForm, setTeleForm,
    teleSalaActiva, setTeleSalaActiva, teleTab, setTeleTab,
    mensajeRespuesta, setMensajeRespuesta,
    agendados, setAgendados, showAgenda, setShowAgenda,
    agendaForm, setAgendaForm, agendaSuggs, setAgendaSuggs, agendaTab, setAgendaTab,
    showComposeMensaje, setShowComposeMensaje, composeMensaje, setComposeMensaje,
    companiesTab, setCompaniesTab, editingCompany, setEditingCompany,
    cajaMedicoPeriodo, setCajaMedicoPeriodo, porcentajeMedico, setPorcentajeMedico,
    medicoTurnoActivo, setMedicoTurnoActivo,
    orgsList, setOrgsList, activeOrgId, setActiveOrgId,
    superAdminTab, setSuperAdminTab, newOrgForm, setNewOrgForm,
    portalEmpresaCodigo, setPortalEmpresaCodigo,
    portalEmpresaEncontrada, setPortalEmpresaEncontrada,
    portalEmpresaPacientes, setPortalEmpresaPacientes,
    portalEmpresaTab, setPortalEmpresaTab,
    portalEmpresaBuscando, setPortalEmpresaBuscando,
    portalEmpresaFiltroDoc, setPortalEmpresaFiltroDoc,
    portalActivadoInfo, setPortalActivadoInfo,
    portalEmpresaAdmin, setPortalEmpresaAdmin,
    portalAdminTab, setPortalAdminTab,
    portalAdminLoginUser, setPortalAdminLoginUser,
    portalAdminLoginPass, setPortalAdminLoginPass,
    nuevoMedicoEmpForm, setNuevoMedicoEmpForm,
    sedeForm, setSedeForm, ipsCredForm, setIpsCredForm,
    ipsEditingEmpId, setIpsEditingEmpId,
    showConsentimiento, setShowConsentimiento,
    _hcDirty, _setHcDirty, _exitHcConfirm, _setExitHcConfirm,
    activeDoctorData, activeSignature,
    fileInputRef, fileInputSigRef, csvInputRef,
    goTo, goBack, showAlert, handleChange, handleNameChange, handleSavePatient,
    handleCloseHistory, handleEditHistory, handlePrint, logAccess,
    canViewPatient, isHcOwner, openPatient, handleNewOccupHistory, handleNewGeneralHistory,
    selectPatientSuggestion, generateAIAnalysis, generateAIRestricciones, generateAIRecomendaciones,
    applyRestriccionesChecklist, applyRecomendacionesChecklist, handleManualCloudSave,
    handleExportData, handleImportData, handleSignatureUpload, handleLogin, handleSaveAIConfig,
    exportPatientTable, _printHCClean, handleAceptarPrivacidad,
    renderNavbar,
    BrandLogo, DoctorSignature, DoctorSignatureMemo, InputGroup, PlanGate, LoginForm,
    _isAdmin, _isAdminEmpresa, _isAdminOrEmpresa, _canUse, _contarHC,
    _generarCertificadoHTMLNormalizado,
    PLAN_CONFIG, SECRETARIA_PERMISOS_DEFAULT, DEFAULT_DOCTOR_DATA, ORG_DEFAULT_ID,
    _ls, _sbSet, _sbGet, _SB_URL, _SB_KEY, sanitizeInput,
  } = props;

    // FIX: definir _billDocData/_billDocSig en scope de renderTabSolicitudExamenes
    const _examDocUser2 =
      typeof billData !== "undefined" && billData?.billDoctorId
        ? usersList?.find((u) => u.user === billData.billDoctorId)
        : null;
    const _billDocData = _examDocUser2?.doctorData || activeDoctorData;
    const _billDocSig = _examDocUser2?.doctorData?.firma || activeSignature;
    const EXAMENES_DB = [
      // ═══ LABORATORIO CLÍNICO — GENERALES/BÁSICOS ═══
      "Hemograma completo (CBC) [CUPS: 902210]",
      "Cuadro hemático [CUPS: 902210]",
      "Hemograma con diferencial [CUPS: 902218]",
      "Hematocrito y hemoglobina [CUPS: 902209]",
      "Glicemia en ayunas [CUPS: 903841]",
      "Glicemia posprandial [CUPS: 903842]",
      "Hemoglobina glicosilada (HbA1c) [CUPS: 903427]",
      "Glucosa sérica [CUPS: 903841]",
      "Creatinina sérica [CUPS: 903895]",
      "BUN (nitrógeno ureico) [CUPS: 903856]",
      "Ácido úrico [CUPS: 903868]",
      "Urea [CUPS: 903856]",
      "Perfil lipídico completo [CUPS: 903818]",
      "Colesterol total [CUPS: 903818]",
      "Colesterol HDL [CUPS: 903815]",
      "Colesterol LDL [CUPS: 903816]",
      "Triglicéridos [CUPS: 903868]",
      "VLDL [CUPS: 903817]",
      "Pruebas de función hepática [CUPS: 903866]",
      "ALT (TGP) [CUPS: 903866]",
      "AST (TGO) [CUPS: 903867]",
      "Fosfatasa alcalina [CUPS: 903835]",
      "GGT (gamma glutamil transferasa) [CUPS: 903849]",
      "Bilirrubinas totales y fraccionadas [CUPS: 903809]",
      "Proteínas totales y fraccionadas [CUPS: 903861]",
      "Albúmina sérica [CUPS: 903801]",
      "LDH (lactato deshidrogenasa) [CUPS: 903829]",
      "CPK total [CUPS: 903825]",
      "CPK-MB [CUPS: 903826]",
      "Troponina I [CUPS: 903870]",
      "Troponina T ultrasensible [CUPS: 903871]",
      "BNP / NT-proBNP [CUPS: 903807]",
      "Parcial de orina (uroanálisis) [CUPS: 907106]",
      "Urocultivo [CUPS: 901235]",
      "Coprocultivo [CUPS: 901221]",
      "Coproscópico [CUPS: 907002]",
      "Sangre oculta en heces [CUPS: 907003]",
      // ═══ ELECTROLITOS ═══
      "Sodio sérico [CUPS: 903862]",
      "Potasio sérico [CUPS: 903859]",
      "Cloro sérico [CUPS: 903822]",
      "Calcio sérico [CUPS: 903811]",
      "Calcio iónico [CUPS: 903812]",
      "Magnesio sérico [CUPS: 903851]",
      "Fósforo sérico [CUPS: 903837]",
      "Bicarbonato (CO2 total) [CUPS: 903831]",
      // ═══ CARDIOVASCULARES ═══
      "Electrocardiograma (ECG) de 12 derivaciones [CUPS: 895101]",
      "Electrocardiograma en reposo [CUPS: 895101]",
      "Ecocardiograma transtorácico [CUPS: 881202]",
      "Ecocardiograma con Doppler [CUPS: 881203]",
      "Ecocardiograma con Doppler color [CUPS: 881204]",
      "Ecocardiograma transesofágico [CUPS: 881205]",
      "Prueba de esfuerzo (ergometría) [CUPS: 895301]",
      "Holter de ritmo 24 horas [CUPS: 895201]",
      "Holter de presión arterial (MAPA) [CUPS: 895202]",
      "Valoración de riesgo cardiovascular (Framingham)",
      "Índice tobillo-brazo (ITB)",
      "Eco Doppler carotídeo [CUPS: 882302]",
      "Eco Doppler de vasos de cuello [CUPS: 882301]",
      "Angiografía coronaria [CUPS: 877101]",
      "Angiotomografía coronaria (Angio-TAC) [CUPS: 879201]",
      "Cateterismo cardíaco [CUPS: 377101]",
      // ═══ CONTROL METABÓLICO / PESO ═══
      "TSH (hormona estimulante de tiroides) [CUPS: 904902]",
      "T3 libre [CUPS: 904903]",
      "T4 libre [CUPS: 904904]",
      "T3 total [CUPS: 904905]",
      "T4 total [CUPS: 904906]",
      "Perfil tiroideo [CUPS: 904902]",
      "Insulina en ayunas [CUPS: 904218]",
      "Índice HOMA-IR",
      "Péptido C [CUPS: 904219]",
      "Curva de tolerancia a glucosa (PTOG 75g) [CUPS: 903845]",
      "Microalbuminuria [CUPS: 907107]",
      "Relación albúmina/creatinina en orina [CUPS: 907108]",
      "Ácidos grasos libres",
      "Leptina sérica",
      "Cortisol sérico (8am) [CUPS: 904210]",
      "Cortisol en orina 24h [CUPS: 904211]",
      // ═══ PREQUIRÚRGICOS ═══
      "Hemograma prequirúrgico [CUPS: 902210]",
      "Grupo sanguíneo y Rh [CUPS: 902004]",
      "Tiempos de coagulación (PT/INR, PTT) [CUPS: 902050]",
      "Tiempo de protrombina (TP) [CUPS: 902049]",
      "Tiempo de tromboplastina (PTT) [CUPS: 902048]",
      "INR [CUPS: 902050]",
      "Tiempo de sangría [CUPS: 902046]",
      "Glicemia prequirúrgica [CUPS: 903841]",
      "BUN prequirúrgico [CUPS: 903856]",
      "Creatinina prequirúrgica [CUPS: 903895]",
      "Electrolitos prequirúrgicos (Na, K, Cl) [CUPS: 903862]",
      "EKG prequirúrgico [CUPS: 895101]",
      "Radiografía de tórax prequirúrgica [CUPS: 871121]",
      "Valoración preanestésica [CUPS: 890205]",
      "Pruebas cruzadas (compatibilidad sanguínea) [CUPS: 902005]",
      "Recuento de plaquetas [CUPS: 902230]",
      "Fibrinógeno [CUPS: 902041]",
      // ═══ POSTQUIRÚRGICOS ═══
      "Hemograma de control postquirúrgico [CUPS: 902210]",
      "PCR postquirúrgica [CUPS: 903860]",
      "VSG (velocidad de sedimentación globular) [CUPS: 902205]",
      "Proteína C reactiva (PCR) [CUPS: 903860]",
      "PCR ultrasensible [CUPS: 903860]",
      "Perfil metabólico postquirúrgico",
      "Gases arteriales [CUPS: 903602]",
      "Dímero D [CUPS: 902038]",
      "Procalcitonina [CUPS: 906847]",
      "Hemocultivos [CUPS: 901210]",
      // ═══ INFECCIOSAS / SEROLOGÍA ═══
      "VDRL [CUPS: 906919]",
      "FTA-ABS [CUPS: 906920]",
      "Prueba de VIH (ELISA) [CUPS: 906249]",
      "Western Blot VIH [CUPS: 906250]",
      "Carga viral VIH [CUPS: 906251]",
      "Antígeno de superficie hepatitis B (HBsAg) [CUPS: 906221]",
      "Anti-HBs [CUPS: 906223]",
      "Anti-HBc total [CUPS: 906222]",
      "Anti-VHC [CUPS: 906224]",
      "PCR para hepatitis C [CUPS: 906225]",
      "IgM para hepatitis A [CUPS: 906220]",
      "Serología completa",
      "Hemocultivos [CUPS: 901210]",
      "Prueba de tuberculina (PPD) [CUPS: 860205]",
      "IGRA (QuantiFERON TB Gold) [CUPS: 906841]",
      "BK seriado (baciloscopia) [CUPS: 901101]",
      "Gota gruesa (malaria) [CUPS: 901301]",
      // ═══ HEMATOLOGÍA ESPECIAL ═══
      "Ferritina [CUPS: 903833]",
      "Hierro sérico [CUPS: 903850]",
      "Transferrina [CUPS: 903869]",
      "Saturación de transferrina [CUPS: 903869]",
      "Vitamina B12 [CUPS: 903878]",
      "Ácido fólico [CUPS: 903800]",
      "Vitamina D (25-OH) [CUPS: 903879]",
      "Reticulocitos [CUPS: 902237]",
      "Frotis de sangre periférica [CUPS: 902201]",
      "Electroforesis de hemoglobina [CUPS: 902216]",
      "Coombs directo [CUPS: 902008]",
      "Coombs indirecto [CUPS: 902009]",
      // ═══ COAGULACIÓN ═══
      "Antitrombina III [CUPS: 902032]",
      "Proteína C funcional [CUPS: 902033]",
      "Proteína S funcional [CUPS: 902034]",
      "Anticoagulante lúpico [CUPS: 902031]",
      "Anticuerpos anticardiolipina [CUPS: 906102]",
      "Anti-Beta 2 glicoproteína I [CUPS: 906103]",
      // ═══ MARCADORES TUMORALES ═══
      "PSA (antígeno prostático) [CUPS: 906313]",
      "PSA libre [CUPS: 906314]",
      "AFP (alfa fetoproteína) [CUPS: 906302]",
      "CEA [CUPS: 906304]",
      "CA 19-9 [CUPS: 906303]",
      "CA 125 [CUPS: 906305]",
      "CA 15-3 [CUPS: 906306]",
      "Beta HCG cuantitativa [CUPS: 904216]",
      // ═══ HORMONALES / REPRODUCTIVOS ═══
      "Prueba de embarazo (Beta HCG) [CUPS: 904216]",
      "FSH [CUPS: 904214]",
      "LH [CUPS: 904215]",
      "Estradiol [CUPS: 904212]",
      "Progesterona [CUPS: 904220]",
      "Testosterona total [CUPS: 904224]",
      "Testosterona libre [CUPS: 904225]",
      "Prolactina [CUPS: 904221]",
      "DHEA-S [CUPS: 904211]",
      "17-OH progesterona [CUPS: 904201]",
      "Espermograma [CUPS: 907501]",
      // ═══ FUNCIÓN RENAL ═══
      "Depuración de creatinina [CUPS: 903896]",
      "Proteína en orina 24h [CUPS: 907109]",
      "Creatinuria en orina 24h [CUPS: 907110]",
      "Cistatina C [CUPS: 903897]",
      "Electrolitos en orina 24h [CUPS: 907111]",
      // ═══ INMUNOLOGÍA / AUTOINMUNIDAD ═══
      "ANA (anticuerpos antinucleares) [CUPS: 906104]",
      "Anti-DNA doble cadena [CUPS: 906105]",
      "Factor reumatoideo [CUPS: 906110]",
      "Anti-CCP (anti péptido citrulinado) [CUPS: 906106]",
      "ANCA (c-ANCA, p-ANCA) [CUPS: 906101]",
      "Complemento C3 y C4 [CUPS: 906107]",
      "Inmunoglobulinas (IgA, IgG, IgM, IgE) [CUPS: 906108]",
      "HLA-B27 [CUPS: 906109]",
      // ═══ TOXICOLOGÍA OCUPACIONAL ═══
      "Plomo en sangre (plombemia) [CUPS: 903609]",
      "Protoporfirina zinc (ZPP) [CUPS: 903610]",
      "Ácido delta aminolevulínico en orina [CUPS: 903601]",
      "Mercurio en orina [CUPS: 903607]",
      "Cadmio en sangre [CUPS: 903603]",
      "Arsénico en orina [CUPS: 903602]",
      "Colinesterasa sérica [CUPS: 903823]",
      "Colinesterasa eritrocitaria [CUPS: 903824]",
      "Ácido hipúrico en orina (tolueno) [CUPS: 903604]",
      "Ácido mandélico en orina (estireno) [CUPS: 903605]",
      "Ácido trans-mucónico (benceno) [CUPS: 903606]",
      "Fenol en orina [CUPS: 903608]",
      "Carboxihemoglobina [CUPS: 902215]",
      "Metemoglobina [CUPS: 902225]",
      "Cromo en orina [CUPS: 903611]",
      "Níquel en orina [CUPS: 903612]",
      "Manganeso en sangre [CUPS: 903613]",
      "Prueba de drogas de abuso en orina (panel 5/10) [CUPS: 903614]",
      "Cotinina en orina (nicotina) [CUPS: 903615]",
      "Alcohol en sangre (alcoholemia) [CUPS: 903616]",
      // ═══ IMAGENOLOGÍA ═══
      "Radiografía de tórax PA y lateral [CUPS: 871121]",
      "Radiografía columna lumbosacra AP y lateral [CUPS: 871040]",
      "Radiografía columna cervical AP y lateral [CUPS: 871010]",
      "Radiografía columna dorsal AP y lateral [CUPS: 871020]",
      "Radiografía de manos AP bilateral [CUPS: 873320]",
      "Radiografía de pelvis AP [CUPS: 872200]",
      "Radiografía de rodilla AP y lateral [CUPS: 873430]",
      "Radiografía de pies bilateral [CUPS: 873510]",
      "Radiografía de cráneo [CUPS: 870100]",
      "Radiografía de senos paranasales [CUPS: 870300]",
      "Radiografía de hombro AP [CUPS: 873110]",
      "Radiografía de cadera AP [CUPS: 872210]",
      "Radiografía de muñeca AP y lateral [CUPS: 873310]",
      "Ecografía abdominal total [CUPS: 881302]",
      "Ecografía pélvica transabdominal [CUPS: 881401]",
      "Ecografía pélvica transvaginal [CUPS: 881402]",
      "Ecografía de tiroides [CUPS: 881101]",
      "Ecografía de mama bilateral [CUPS: 881501]",
      "Ecografía de partes blandas [CUPS: 881601]",
      "Ecografía renal y vías urinarias [CUPS: 881303]",
      "Ecografía Doppler venoso miembros inferiores [CUPS: 882301]",
      "Ecografía Doppler arterial miembros inferiores [CUPS: 882302]",
      "Ecografía de cuello [CUPS: 881102]",
      "Ecografía testicular [CUPS: 881602]",
      "Ecografía de hombro [CUPS: 881603]",
      "TAC de cráneo simple [CUPS: 879101]",
      "TAC de cráneo con contraste [CUPS: 879102]",
      "TAC de tórax simple [CUPS: 879201]",
      "TAC de tórax con contraste [CUPS: 879202]",
      "TAC de abdomen y pelvis con contraste [CUPS: 879302]",
      "TAC de columna lumbosacra [CUPS: 879401]",
      "TAC de columna cervical [CUPS: 879402]",
      "TAC de huesos y articulaciones [CUPS: 879501]",
      "Resonancia magnética de cráneo [CUPS: 883101]",
      "Resonancia magnética de columna lumbar [CUPS: 883201]",
      "Resonancia magnética de columna cervical [CUPS: 883202]",
      "Resonancia magnética de columna dorsal [CUPS: 883203]",
      "Resonancia magnética de rodilla [CUPS: 883301]",
      "Resonancia magnética de hombro [CUPS: 883302]",
      "Resonancia magnética de cadera [CUPS: 883303]",
      "Resonancia magnética de muñeca [CUPS: 883304]",
      "Resonancia magnética de tobillo [CUPS: 883305]",
      "Gamagrafía ósea [CUPS: 886101]",
      "Gamagrafía tiroidea [CUPS: 886201]",
      "Densitometría ósea (DXA) [CUPS: 886301]",
      "Mamografía bilateral [CUPS: 874101]",
      "Mamografía digital bilateral [CUPS: 874102]",
      "PET-CT (Tomografía por emisión de positrones) [CUPS: 886401]",
      // ═══ FISIOLOGÍA / MEDICINA OCUPACIONAL ═══
      "Espirometría simple [CUPS: 893801]",
      "Espirometría con broncodilatador [CUPS: 893802]",
      "Espirometría ocupacional [CUPS: 893801]",
      "Audiometría [CUPS: 892201]",
      "Audiometría tonal [CUPS: 892201]",
      "Audiometría de palabras [CUPS: 892202]",
      "Audiometría ocupacional [CUPS: 892201]",
      "Impedanciometría [CUPS: 892203]",
      "Logoaudiometría [CUPS: 892204]",
      "Potenciales evocados auditivos (BERA) [CUPS: 892205]",
      "Emisiones otoacústicas [CUPS: 892206]",
      "Optometría [CUPS: 890203]",
      "Optometría ocupacional [CUPS: 890203]",
      "Visiometría [CUPS: 890203]",
      "Examen de optometría y visiometría [CUPS: 890203]",
      "Agudeza visual [CUPS: 890203]",
      "Tonometría ocular [CUPS: 890901]",
      "Campimetría [CUPS: 890902]",
      "Fondo de ojo [CUPS: 890903]",
      "Test de Ishihara (visión cromática) [CUPS: 890904]",
      "Evaluación osteomuscular [CUPS: 890401]",
      "Perfil de columna ocupacional",
      "Test de Wells",
      "Test de Phalen",
      "Test de Tinel",
      "Test de Finkelstein",
      "Test de Neer",
      "Test de Hawkins",
      "Test de Jobe",
      "Test de Spurling",
      "Test de Lasègue",
      "Test de Adams (escoliosis)",
      "Test de Romberg",
      "Dinamometría de mano [CUPS: 890402]",
      "Glicemia en ayunas (preocupacional) [CUPS: 903841]",
      "Perfil lipídico (preocupacional) [CUPS: 903818]",
      "Hemograma (preocupacional) [CUPS: 902210]",
      "Cuadro hemático (preocupacional) [CUPS: 902210]",
      "Hepatitis B antígeno (HBsAg) [CUPS: 906221]",
      "Tamizaje VIH [CUPS: 906249]",
      "Pleuroscopia [CUPS: 342201]",
      "Electroencefalograma (EEG) [CUPS: 895601]",
      "Electromiografía (EMG) [CUPS: 895701]",
      "Velocidad de conducción nerviosa [CUPS: 895702]",
      // ═══ SALUD MENTAL ═══
      "Escala de ansiedad y depresión de Goldberg (EADG) [CUPS: 890801]",
      "Cuestionario de depresión PHQ-9 [CUPS: 890802]",
      "Cuestionario de ansiedad GAD-7 [CUPS: 890803]",
      "Test AUDIT (uso de alcohol) [CUPS: 890804]",
      "Cuestionario CAGE (alcoholismo)",
      "Inventario de Burnout de Maslach (MBI) [CUPS: 890805]",
      "Escala de estrés percibido (PSS-14)",
      "Cuestionario de riesgo psicosocial (Batería Min. Salud Res. 2764/2022) [CUPS: 890806]",
      "Evaluación neuropsicológica [CUPS: 890807]",
      "Evaluación psicológica forense [CUPS: 890808]",
      "Valoración psiquiátrica [CUPS: 890201]",
      "Valoración psicológica [CUPS: 890208]",
      "Test de Minnesota (MMPI) [CUPS: 890809]",
      "Test de Bender [CUPS: 890810]",
      "Test de matrices de Raven [CUPS: 890811]",
      "Test de personalidad [CUPS: 890812]",
      "Evaluación de aptitudes laborales [CUPS: 890813]",
      "Evaluación de estrés laboral (Bonn) [CUPS: 890814]",
      "Evaluación del riesgo psicosocial [CUPS: 890815]",
      "Escala de Hamilton (depresión) [CUPS: 890816]",
      "Escala de Beck (depresión) [CUPS: 890817]",
      "Escala de Columbia (riesgo suicida) [CUPS: 890818]",
      "MoCA (evaluación cognitiva Montreal) [CUPS: 890819]",
      "Mini Mental State Examination (MMSE) [CUPS: 890820]",
      // ═══ PROCEDIMIENTOS ═══
      "Endoscopia digestiva alta [CUPS: 441101]",
      "Colonoscopia [CUPS: 452101]",
      "Colonoscopia con toma de biopsia [CUPS: 452102]",
      "Gastroscopia [CUPS: 441102]",
      "Rectosigmoidoscopia [CUPS: 452001]",
      "CPRE (colangiopancreatografía retrógrada) [CUPS: 512101]",
      "Biopsia de piel [CUPS: 861201]",
      "Biopsia de ganglio [CUPS: 861301]",
      "Biopsia de próstata guiada por ecografía [CUPS: 861401]",
      "Biopsia de mama guiada [CUPS: 861501]",
      "Punción lumbar [CUPS: 030301]",
      "Punción aspiración con aguja fina (PAAF) tiroides [CUPS: 861601]",
      "Drenaje de absceso [CUPS: 860101]",
      "Curación de herida [CUPS: 860201]",
      "Citología cervicouterina (PAP) [CUPS: 892301]",
      "Colposcopia [CUPS: 692101]",
      "Histeroscopia [CUPS: 692201]",
      "Laparoscopia diagnóstica [CUPS: 541001]",
      "Cistoscopia [CUPS: 571101]",
      "Broncoscopia [CUPS: 331101]",
      // ═══ VALORACIONES MÉDICAS ═══
      "Consulta de medicina general [CUPS: 890101]",
      "Consulta de medicina especializada [CUPS: 890201]",
      "Consulta de medicina del trabajo [CUPS: 890202]",
      "Consulta de control o seguimiento [CUPS: 890301]",
      "Valoración por fisioterapia [CUPS: 890501]",
      "Valoración por terapia ocupacional [CUPS: 890502]",
      "Valoración por fonoaudiología [CUPS: 890503]",
      "Valoración por nutrición [CUPS: 890504]",
      "Valoración por psicología [CUPS: 890208]",
      "Valoración por trabajo social [CUPS: 890505]",
      "Consulta de urgencias [CUPS: 890601]",
      // ═══ CONTROL GENERAL SEGÚN PATOLOGÍA ═══
      "Control de HTA: perfil lipídico + creatinina + electrolitos + EKG",
      "Control de diabetes: HbA1c + perfil lipídico + creatinina + microalbuminuria + fondo de ojo",
      "Control de hipotiroidismo: TSH + T4L",
      "Control de dislipidemia: perfil lipídico completo",
      "Control de enfermedad renal: creatinina + BUN + electrolitos + parcial de orina",
      "Control de EPOC: espirometría + radiografía de tórax + gases arteriales",
      "Control de asma ocupacional: espirometría seriada + PEF",
      "Control de hipoacusia: audiometría de control",
    ];
    // States moved to component level (no hooks in conditionals - React rule)
    const showSuggs = showExamSuggs;
    const setShowSuggs = setShowExamSuggs;
    const suggestions =
      examSearch.length >= 2
        ? EXAMENES_DB.filter((e) =>
            e.toLowerCase().includes(examSearch.toLowerCase())
          ).slice(0, 12)
        : [];
    // ══ B-11: Pruebas prohibidas como requisito laboral - Res. 1843/2025 Art. 10 ══
    const _PRUEBAS_PROHIBIDAS_RES1843 = [
      {
        terminos: [
          "embarazo",
          "gravidez",
          "beta hcg",
          "bhcg",
          "prueba de embarazo",
          "test de embarazo",
          "gestacion",
        ],
        nombre: "Prueba de embarazo",
      },
      {
        terminos: [
          "vih",
          "hiv",
          "sida",
          "aids",
          "prueba de vih",
          "elisa vih",
          "western blot",
        ],
        nombre: "Prueba de VIH/SIDA",
      },
      {
        terminos: [
          "serologia",
          "serológico",
          "vdrl",
          "rpr",
          "sifilis",
          "treponema",
        ],
        nombre: "Prueba serológica (sífilis/treponema)",
      },
    ];
    const _esPruebaProhibida = (nombre) => {
      const n = nombre.toLowerCase();
      return _PRUEBAS_PROHIBIDAS_RES1843.find((p) =>
        p.terminos.some((t) => n.includes(t))
      );
    };
    const addExam = (nombre) => {
      // ── Verificar si es prueba prohibida como requisito laboral ──
      const prohibida = _esPruebaProhibida(nombre);
      const tipoExActual = data?.tipoExamen || "";
      const esEvalOcupacional = ["INGRESO", "PERIODICO", "RETIRO"].includes(
        tipoExActual
      );
      if (prohibida && esEvalOcupacional) {
        // Mostrar advertencia - el médico PUEDE agregarla con justificación clínica
        showPrompt(
          `⚠️ Res. 1843/2025 Art. 10 - PRUEBA RESTRINGIDA\n\n"${prohibida.nombre}" está prohibida como requisito de ingreso o permanencia laboral.\n\nSi hay indicación CLÍNICA justificada, escriba la justificación aquí. De lo contrario, cancele.\n\nJustificación clínica (requerida):`,
          (justificacion) => {
            if (!justificacion || !justificacion.trim()) return; // canceló
            const nuevo = {
              nombre,
              fecha: new Date().toISOString().split("T")[0],
              urgente: false,
              justificacionClin: justificacion.trim(),
              alertaRes1843: true,
            };
            const updated = [...examList, nuevo];
            setExamList(updated);
            setData((p) => ({
              ...p,
              solicitudExamenes: updated,
              justificacionPruebaEspecial:
                (p.justificacionPruebaEspecial
                  ? p.justificacionPruebaEspecial + " | "
                  : "") + `${prohibida.nombre}: ${justificacion.trim()}`,
            }));
            setExamSearch("");
            setShowExamSuggs(false);
          }
        );
        return; // espera confirmación del médico
      }
      // ── Examen sin restricción - agregar normalmente ──
      const nuevo = {
        nombre,
        fecha: new Date().toISOString().split("T")[0],
        urgente: false,
      };
      const updated = [...examList, nuevo];
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
      setExamSearch("");
      setShowExamSuggs(false);
    };
    const addFreeText = () => {
      if (!examSearch.trim()) return;
      addExam(examSearch.trim());
    };
    const removeExam = (i) => {
      const updated = examList.filter((_, j) => j !== i);
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
    };
    const saveLocal = () => {
      setData((p) => ({
        ...p,
        solicitudExamenes: examList,
        solicitudExamenesDiag: diagExamen,
        solicitudExamenesJust: justExamen,
      }));
    };
    // Paquetes de exámenes por grupo/frecuencia
    const EXAM_PACKAGES = [
      {
        id: "ocup_ingreso",
        nombre: "📋 Ingreso Ocupacional",
        frecuencia: "Por evento",
        examenes: [
          "Hemograma completo (CBC)",
          "Glicemia en ayunas",
          "Perfil lipídico completo",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Radiografía de tórax PA y lateral",
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Audiometría ocupacional",
          "Optometría ocupacional",
          "Visiometría",
        ],
      },
      {
        id: "ocup_periodico",
        nombre: "🔄 Periódico Ocupacional",
        frecuencia: "Anual",
        examenes: [
          "Hemograma completo (CBC)",
          "Glicemia en ayunas",
          "Perfil lipídico completo",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Audiometría ocupacional",
          "Optometría ocupacional",
        ],
      },
      {
        id: "alturas",
        nombre: "⛰️ Trabajo en Alturas (Res. 4272/2021)",
        frecuencia: "Anual",
        examenes: [
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Espirometría simple",
          "Audiometría ocupacional",
          "Optometría ocupacional",
          "Glucosa sérica",
          "Hemograma completo (CBC)",
          "Radiografía de tórax PA y lateral",
        ],
      },
      {
        id: "alimentos",
        nombre: "🍽️ Manipulación Alimentos (Res. 2674/2013)",
        frecuencia: "Anual",
        examenes: [
          "Coproscópico",
          "Coprocultivo",
          "VDRL",
          "Parcial de orina (uroanálisis)",
          "Hemograma completo (CBC)",
          "Citología cervicouterina (PAP)",
        ],
      },
      {
        id: "cardiovascular",
        nombre: "❤️ Riesgo Cardiovascular",
        frecuencia: "Semestral",
        examenes: [
          "Perfil lipídico completo",
          "Glicemia en ayunas",
          "Hemoglobina glicosilada (HbA1c)",
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Proteína C reactiva (PCR) ultrasensible",
          "Creatinina sérica",
        ],
      },
      {
        id: "respiratorio",
        nombre: "🫁 Riesgo Respiratorio (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Espirometría simple",
          "Espirometría con broncodilatador",
          "Radiografía de tórax PA y lateral",
          "Hemograma completo (CBC)",
        ],
      },
      {
        id: "osteomuscular",
        nombre: "🦴 Riesgo Osteomuscular (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Radiografía columna lumbosacra AP y lateral",
          "Radiografía columna cervical AP y lateral",
          "Radiografía de manos AP bilateral",
          "Electromiografía (EMG)",
        ],
      },
      {
        id: "ruido",
        nombre: "🔊 Exposición a Ruido (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Audiometría ocupacional",
          "Audiometría tonal",
          "Audiometría de palabras",
          "Impedanciometría",
        ],
      },
      {
        id: "quimico",
        nombre: "⚗️ Riesgo Químico",
        frecuencia: "Anual",
        examenes: [
          "Hemograma completo (CBC)",
          "Pruebas de función hepática",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Plomo en sangre (si exposición)",
        ],
      },
      {
        id: "visual",
        nombre: "👁️ Riesgo Visual",
        frecuencia: "Anual",
        examenes: [
          "Optometría ocupacional",
          "Agudeza visual",
          "Tonometría ocular",
          "Campimetría",
          "Visiometría",
        ],
      },
    ];
    const applyPackage = () => {
      if (!selectedPackage) return;
      const pkg = EXAM_PACKAGES.find((p) => p.id === selectedPackage);
      if (!pkg) return;
      const toAdd = pkg.examenes.filter((e) => packageChecklist[e] !== false); // por defecto todos marcados
      const nuevos = toAdd.map((nombre) => ({
        nombre,
        fecha: new Date().toISOString().split("T")[0],
        urgente: false,
        paquete: pkg.nombre,
      }));
      const updated = [...examList, ...nuevos];
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
      setSelectedPackage(null);
      setPackageChecklist({});
      setShowPackages(false);
    };
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-5">
          <h3 className="text-base font-black text-teal-800 flex items-center gap-2 mb-1">
            🔬 Solicitud de Exámenes y Procedimientos
          </h3>
          <p className="text-xs text-gray-400">
            Busque el examen o escríbalo libremente · Se imprimirá con los datos
            del paciente
          </p>
        </div>
        {/* ── PAQUETES DE EXÁMENES ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-indigo-800 uppercase">
              📦 Paquetes por Grupo / Frecuencia
            </p>
            <button
              onClick={() => setShowPackages((v) => !v)}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700"
            >
              {showPackages ? "✕ Cerrar" : "+ Seleccionar Paquete"}
            </button>
          </div>
          {showPackages && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {EXAM_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setPackageChecklist(
                        Object.fromEntries(pkg.examenes.map((e) => [e, true]))
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      selectedPackage === pkg.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <p className="font-black text-gray-800">{pkg.nombre}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      🔁 {pkg.frecuencia} · {pkg.examenes.length} exámenes
                    </p>
                  </button>
                ))}
              </div>
              {selectedPackage &&
                (() => {
                  const pkg = EXAM_PACKAGES.find(
                    (p) => p.id === selectedPackage
                  );
                  return (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                      <p className="text-xs font-black text-indigo-800 mb-2">
                        {pkg.nombre} - Seleccione los exámenes a agregar:
                      </p>
                      <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto mb-3">
                        {pkg.examenes.map((ex) => (
                          <label
                            key={ex}
                            className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-white rounded p-1"
                          >
                            <input
                              type="checkbox"
                              checked={packageChecklist[ex] !== false}
                              onChange={(e) =>
                                setPackageChecklist((p) => ({
                                  ...p,
                                  [ex]: e.target.checked,
                                }))
                              }
                              className="accent-indigo-600 w-3.5 h-3.5 flex-shrink-0"
                            />
                            <span className="text-gray-700">{ex}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={applyPackage}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700"
                        >
                          ✓ Agregar seleccionados
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPackage(null);
                            setPackageChecklist({});
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          )}
        </div>
        {/* Buscador */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-200 p-5">
          <label className="block text-xs font-black text-teal-700 uppercase mb-2">
            Buscar o añadir examen / procedimiento
          </label>
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                {/* Buscador CUPS integrado + búsqueda libre */}
                <input
                  value={examSearch}
                  onChange={(e) => {
                    setExamSearch(e.target.value);
                    setShowExamSuggs(true);
                  }}
                  onFocus={() => setShowSuggs(true)}
                  placeholder="Buscar CUPS o examen - Ej: 903001 hemograma, 912701 espirometría, audiometría..."
                  className="w-full p-2.5 border-2 border-teal-200 rounded-xl text-sm focus:border-teal-500 outline-none"
                />
                {showSuggs && suggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-teal-200 rounded-xl shadow-2xl z-50 w-full max-h-52 overflow-y-auto">
                    {/* CUPS matches first */}
                    {_buscarCUPS(examSearch, 5).map((item, i) => (
                      <button
                        key={"cups" + i}
                        type="button"
                        onClick={() => addExam(item.code + " - " + item.desc)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-teal-50 last:border-none"
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: "900",
                            color: "#134e4a",
                            background: "#ccfbf1",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            marginRight: "6px",
                            fontSize: "10px",
                          }}
                        >
                          {item.code}
                        </span>
                        <span className="text-gray-800">{item.desc}</span>
                        <span
                          style={{
                            fontSize: "8px",
                            color: "#0d9488",
                            marginLeft: "4px",
                          }}
                        >
                          ({item.group})
                        </span>
                      </button>
                    ))}
                    {/* Regular exam DB matches */}
                    {suggestions
                      .filter(
                        (s) =>
                          !_buscarCUPS(examSearch, 5).some((c) =>
                            s.includes(c.code)
                          )
                      )
                      .map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addExam(s)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-gray-50 last:border-none font-medium text-gray-800"
                        >
                          🔬 {s}
                        </button>
                      ))}
                    {examSearch.trim() &&
                      !EXAMENES_DB.some(
                        (e) => e.toLowerCase() === examSearch.toLowerCase()
                      ) && (
                        <button
                          type="button"
                          onClick={addFreeText}
                          className="w-full text-left px-3 py-2 text-xs bg-teal-50 text-teal-700 font-black border-t"
                        >
                          ✏️ Agregar "{examSearch}" como texto libre
                        </button>
                      )}
                  </div>
                )}
              </div>
              <button
                onClick={addFreeText}
                className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-teal-700 whitespace-nowrap"
              >
                + Agregar
              </button>
            </div>
          </div>
          {/* Lista de exámenes agregados */}
          {examList.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">
                Exámenes solicitados ({examList.length})
              </p>
              {examList.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2"
                >
                  <span className="text-teal-500 font-black text-sm">🔬</span>
                  <span className="flex-1 text-xs font-semibold text-gray-800">
                    {ex.nombre}
                    {ex.alertaRes1843 && (
                      <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1 rounded font-black">
                        ⚠️ Justif. clínica - Res.1843 Art.10
                      </span>
                    )}
                  </span>
                  <label className="flex items-center gap-1 text-[10px] text-blue-600 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ex.incluirEnRecomendaciones || false}
                      onChange={(e) => {
                        const u = [...examList];
                        u[i] = { ...u[i], incluirEnRecomendaciones: e.target.checked };
                        setExamList(u);
                        setData((p) => ({ ...p, solicitudExamenes: u }));
                      }}
                      className="accent-blue-500"
                    />
                    Incluir en Recomendaciones
                  </label>
                  <label className="flex items-center gap-1 text-[10px] text-red-600 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ex.urgente || false}
                      onChange={(e) => {
                        const u = [...examList];
                        u[i] = { ...u[i], urgente: e.target.checked };
                        setExamList(u);
                        setData((p) => ({ ...p, solicitudExamenes: u }));
                      }}
                      className="accent-red-500"
                    />
                    Urgente
                  </label>
                  <button
                    onClick={() => removeExam(i)}
                    className="text-red-400 hover:text-red-600 font-black text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Diagnóstico y justificación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase mb-1">
              Diagnóstico / Impresión Diagnóstica
            </label>
            <input
              value={diagExamen}
              onChange={(e) => {
                setDiagExamen(e.target.value);
                setData((p) => ({
                  ...p,
                  solicitudExamenesDiag: e.target.value,
                }));
              }}
              placeholder="Ej: Hipertensión arterial esencial (I10), Diabetes tipo 2 (E11)..."
              className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase mb-1">
              Justificación / Motivo del examen
            </label>
            <textarea
              rows={3}
              value={justExamen}
              onChange={(e) => {
                setJustExamen(e.target.value);
                setData((p) => ({
                  ...p,
                  solicitudExamenesJust: e.target.value,
                }));
              }}
              placeholder="Explique el motivo clínico por el cual se solicitan los exámenes..."
              className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm resize-none focus:border-blue-400 outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                saveLocal();
                showAlert("✅ Solicitud de exámenes guardada correctamente.");
              }}
              className="bg-teal-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-teal-700 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Guardar solicitud
            </button>
          </div>
        </div>
        {/* Preview de impresión */}
        {examList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-gray-600 uppercase">
                Vista previa del documento imprimible
              </p>
              <button
                onClick={() => {
                  const w = window.open("", "_blank", "width=870,height=1100");
                  if (!w) return;
                  const fd =
                    data.fechaConsulta ||
                    new Date().toLocaleDateString("es-CO");
                  const exHtml = examList
                    .map(
                      (ex, i) =>
                        `<tr style="background:${
                          i % 2 === 0 ? "#f0fdfa" : "white"
                        }"><td style="padding:7px 10px;font-size:9pt;">${
                          i + 1
                        }. ${ex.nombre}${
                          ex.urgente
                            ? ' <b style="color:#dc2626;">(URGENTE)</b>'
                            : ""
                        }</td></tr>`
                    )
                    .join("");
                  const _miIPSExam = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  w.document.write(
                    `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Solicitud de Exámenes</title><style>@page{size:letter portrait;margin:1.2cm 1.5cm;}body{font-family:Arial,sans-serif;font-size:9pt;color:#222;}h2{margin:0;font-size:13pt;color:#0d9488;text-transform:uppercase;}table{width:100%;border-collapse:collapse;margin-top:8px;}th{background:#0d9488;color:white;padding:7px 10px;font-size:8.5pt;text-align:left;}td{border-bottom:1px solid #e5e7eb;}p{margin:3px 0;font-size:9pt;}.sig{margin-top:40px;display:flex;justify-content:space-between;}.sig-line{border-top:1.5px solid #222;width:200px;text-align:center;padding-top:4px;font-size:8pt;font-weight:bold;}</style></head><body><div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0d9488;padding-bottom:10px;margin-bottom:14px;">${_ipsDocLeftHtml(
                      _miIPSExam,
                      _billDocData,
                      "#0d9488"
                    )}<div style="text-align:right;"><h2>Solicitud de Exámenes</h2><p>Fecha: ${fd}</p></div></div><div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:4px;padding:10px;margin-bottom:10px;"><p><b>Paciente:</b> ${
                      data.nombres || ""
                    } &nbsp; <b>Doc:</b> ${data.docTipo || "CC"} ${
                      data.docNumero || ""
                    } &nbsp; <b>Edad:</b> ${
                      data.edad || "--"
                    } años &nbsp; <b>EPS:</b> ${data.eps || "--"}</p>${
                      diagExamen
                        ? `<p style="margin-top:4px;"><b>Diagnóstico:</b> ${diagExamen}</p>`
                        : ""
                    }</div><table><thead><tr><th>Examen / Procedimiento Solicitado</th></tr></thead><tbody>${exHtml}</tbody></table>${
                      justExamen
                        ? `<div style="margin-top:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;padding:8px;"><p style="font-weight:bold;font-size:8.5pt;color:#92400e;text-transform:uppercase;margin-bottom:4px;">Justificación clínica:</p><p style="white-space:pre-wrap;">${justExamen}</p></div>`
                        : ""
                    }<div class="sig"><div class="sig-line">Firma Paciente / Responsable</div><div style="text-align:center;"><img src="${
                      _billDocSig || ""
                    }" style="max-height:60px;" onerror="this.style.display='none'"/><div class="sig-line">${
                      _billDocData?.nombre || ""
                    }<br>${
                      _billDocData?.licencia || ""
                    }</div></div></div></body></html>`
                  );
                  w.document.close();
                  w.focus();
                  setTimeout(() => {
                    w.print();
                    w.close();
                  }, 700);
                }}
                className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Solicitud
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-teal-700 text-white px-4 py-2 text-xs font-bold uppercase">
                Exámenes Solicitados - {data.nombres || "Paciente"}
              </div>
              {examList.map((ex, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 text-xs flex items-center gap-2 border-b last:border-none ${
                    i % 2 === 0 ? "bg-white" : "bg-teal-50/30"
                  }`}
                >
                  <span className="text-teal-600 font-black">{i + 1}.</span>
                  <span className="flex-1">{ex.nombre}</span>
                  {ex.urgente && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded">
                      URGENTE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
};

export default TabSolicitudExamenes;
