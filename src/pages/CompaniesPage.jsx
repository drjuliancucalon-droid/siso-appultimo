// src/pages/CompaniesPage.jsx — Routes to full Companies module with encuestas
import React from 'react';
import { CompanyList } from '../modules/companies';

export default function CompaniesPage(props) {
  return <CompanyList {...props} />;
}
