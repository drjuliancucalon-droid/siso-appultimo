import React, { useState, useEffect, useMemo 
} from 'react';
import { 
  Building2, FileTe
xt, Receipt, Shield, Download, Printer,
  Cal
endar, ChevronDown, ChevronUp, Loader2, Alert
Circle,
  CheckCircle, FileSpreadsheet, FileC
heck, UserCheck, ArrowLeft,
  Search, Filter,
 Package, Mail, Eye, Users
} from 'lucide-rea
ct';
import { useAppState, useAppStateObject 
} from '../hooks/useAppState.js';
import { fo
rmatDate } from '../utils/formatters.js';

//
 Configuración localStorage para simular bac
kend

  companies: 'siso_companies',
  patien
ts: 'siso_db_patients',
  bills: 'siso_saved_
bills',
  reports: 'siso_saved_reports',
  cu
stodia: 'siso_cartas_custodia',
  doctor: 's


