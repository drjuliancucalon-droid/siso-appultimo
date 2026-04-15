// src/pages/CompaniesPage.jsx — Company management page
// Reads companies from localStorage (transition) or backend (future)
import React, { useState, useEffect } from 'react';
import { CompanyList } from '../modules/companies/components/CompanyList';
import { CompanyForm } from '../modules/companies/components/CompanyForm';
import { Building2 } from 'lucide-react';

const COMPANIES_KEY = 'siso_companies';
const PATIENTS_KEY = 'siso_db_patients';

function loadFromStorage(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch { return fallback; }
}

function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(() => loadFromStorage(COMPANIES_KEY));
  const [patients] = useState(() => loadFromStorage(PATIENTS_KEY));
  const [editingCompany, setEditingCompany] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    saveToStorage(COMPANIES_KEY, companies);
  }, [companies]);

  const handleAdd = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDelete = (company) => {
    if (window.confirm(`¿Eliminar empresa "${company.razonSocial || company.nombre}"?`)) {
      setCompanies((prev) => prev.filter((c) => c.id !== company.id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-orange-600" />
        <h1 className="text-2xl font-bold text-gray-800">Empresas</h1>
      </div>
      <CompanyList
        companies={companies}
        patients={patients}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
