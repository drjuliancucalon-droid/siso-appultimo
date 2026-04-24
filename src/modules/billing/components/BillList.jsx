import React from 'react';
import { Receipt, FileCheck, Eye, Download, Trash2 } from 'lucide-react';

export default function BillList({ bills = [], onEdit, onDelete, onView, onDownload }) {
  return (
    <div className="space
