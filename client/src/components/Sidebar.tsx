'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LuTicket, 
  LuLogOut, 
  LuX 
} from 'react-icons/lu';

interface User {
  name?: string;
  role?: 'STUDENT' | 'STAFF' | 'MANAGER' | string;
}

interface SidebarProps {
  user: User;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, isOpen = false, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const isStaffOrManager = user?.role === 'STAFF' || user?.role === 'MANAGER';
  const dashboardRoute = isStaffOrManager ? '/staff' : '/student';

  const initials = mounted && user?.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none
        md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Brand & Navigation */}
        <div className="p-6 space-y-8">
          {/* Brand Header & Mobile Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20">
                ES
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">EduSupport</h1>
                <p className="text-[11px] text-slate-400 font-medium">Campus Helpdesk</p>
              </div>
            </div>

            {/* Close button for mobile drawer */}
            <button 
              onClick={onClose}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Mobile Menu"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Main Menu</p>
            
            <button
              onClick={() => {
                router.push(dashboardRoute);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${pathname === dashboardRoute ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <LuTicket className="w-4 h-4" />
              {isStaffOrManager ? 'Staff Dashboard' : 'My Tickets'}
            </button>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{mounted && user?.name ? user.name : 'User'}</p>
              <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider truncate">{mounted && user?.role ? user.role : ''}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-rose-500/20 bg-slate-900 cursor-pointer"
          >
            <LuLogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}