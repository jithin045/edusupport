'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    OPEN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ASSIGNED: 'bg-sky-50 text-sky-700 border-sky-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  
  const badgeStyle = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  const formattedStatus = status ? status.replace(/_/g, ' ') : '';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeStyle}`}>
      {formattedStatus}
    </span>
  );
}