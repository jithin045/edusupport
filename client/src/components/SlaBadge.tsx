'use client';

import React from 'react';

interface SlaBadgeProps {
  dueAt: string;
  status: string;
}

export default function SlaBadge({ dueAt, status }: SlaBadgeProps) {
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-100 text-slate-600 border-slate-200">
        Completed
      </span>
    );
  }

  const now = new Date().getTime();
  const due = new Date(dueAt).getTime();
  const diff = due - now;

  if (diff < 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-rose-50 text-rose-700 border-rose-200">
        SLA Breached
      </span>
    );
  }

  if (diff < 4 * 60 * 60 * 1000) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
        Due Soon
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
      Within SLA
    </span>
  );
}