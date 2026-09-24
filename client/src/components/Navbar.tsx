'use client';

import React, { ReactNode } from 'react';

interface NavbarProps {
  user?: any;
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

export default function Navbar({ 
  title, 
  subtitle, 
  actionButton 
}: NavbarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-xs">
      <div>
        <h1 className="text-sm font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actionButton}
      </div>
    </header>
  );
}