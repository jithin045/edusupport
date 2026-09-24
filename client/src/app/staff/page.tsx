'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import SlaBadge from '@/components/SlaBadge';
import SortDropdown from '@/components/SortDropdown';
import { 
  LuClipboardList, 
  LuInbox, 
  LuClock, 
  LuTriangleAlert, 
  LuFolderSearch 
} from 'react-icons/lu';

interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  dueAt: string;
  createdAt?: string;
  student?: {
    name?: string;
  };
}

export default function StaffDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  const [mounted, setMounted] = useState<boolean>(false);
  const [user, setUser] = useState<any>({});

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== 'STAFF' && parsedUser.role !== 'MANAGER') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } catch {
      router.push('/login');
      return;
    }

    fetchTickets();
  }, [router]);

  const fetchTickets = async () => {
    try {
      const { data } = await API.get('/tickets');
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch staff queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'SLA_BREACH') {
      const due = new Date(t.dueAt).getTime();
      return due < Date.now() && t.status !== 'RESOLVED' && t.status !== 'CLOSED';
    }
    return t.status === filterStatus;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'priority') {
      const weight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (weight[b.priority] || 0) - (weight[a.priority] || 0);
    } 
    if (sortBy === 'sla') {
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const counts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    pending: tickets.filter(t => t.status === 'PENDING').length,
    breach: tickets.filter(t => new Date(t.dueAt).getTime() < Date.now() && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length,
  };

  const statusFilters = ['ALL', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED', 'SLA_BREACH'];

  const sortOptions = [
    { label: 'Sort: Newest', value: 'newest' },
    { label: 'Sort: Priority (High → Low)', value: 'priority' },
    { label: 'Sort: SLA Due Date', value: 'sla' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex">
      <Sidebar user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-2xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Staff Support Hub</h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Welcome back, {mounted && user?.name ? user.name : 'Staff'}
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Queue" count={counts.total} sub="All campus tickets" 
              icon={<LuClipboardList className="w-4 h-4" />} active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} 
            />
            <MetricCard 
              title="Open Tickets" count={counts.open} sub="Awaiting assignment" 
              icon={<LuInbox className="w-4 h-4 text-indigo-600" />} active={filterStatus === 'OPEN'} onClick={() => setFilterStatus('OPEN')} countColor="text-indigo-600"
            />
            <MetricCard 
              title="Pending Action" count={counts.pending} sub="Requires follow-up" 
              icon={<LuClock className="w-4 h-4 text-amber-600" />} active={filterStatus === 'PENDING'} onClick={() => setFilterStatus('PENDING')} countColor="text-amber-600"
            />
            <MetricCard 
              title="SLA Breaches" count={counts.breach} sub="Exceeded timeframe" 
              icon={<LuTriangleAlert className="w-4 h-4 text-rose-600" />} active={filterStatus === 'SLA_BREACH'} onClick={() => setFilterStatus('SLA_BREACH')} countColor="text-rose-600" activeBorder="border-rose-600 ring-2 ring-rose-600/10"
            />
          </div>

          {/* Toolbar: Filters & Reusable Sort Dropdown */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tickets Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active filter: <span className="font-semibold text-indigo-600">{filterStatus.replace('_', ' ')}</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 flex-wrap">
                {statusFilters.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${filterStatus === status ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'}`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Clean Reusable Sort Component */}
              <SortDropdown options={sortOptions} value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Ticket Listing */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm shadow-2xs">
              Loading queue items...
            </div>
          ) : sortedTickets.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
              <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500 mb-1">
                <LuFolderSearch className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No tickets found in this queue</p>
              <p className="text-xs text-slate-400">Try changing your filter selection above.</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block md:hidden space-y-3">
                {sortedTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => router.push(`/tickets/${ticket._id}`)}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 cursor-pointer active:bg-indigo-50/20 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-indigo-600 text-xs">{ticket.ticketNumber}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{ticket.subject}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Student: <span className="text-slate-700 font-medium">{ticket.student?.name || 'Unknown'}</span></p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                      <span className={`font-semibold ${ticket.priority === 'Critical' ? 'text-rose-600 font-bold' : ticket.priority === 'High' ? 'text-amber-600' : 'text-slate-600'}`}>
                        Priority: {ticket.priority}
                      </span>
                      <SlaBadge dueAt={ticket.dueAt} status={ticket.status} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Ticket ID</th>
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-6">Subject</th>
                      <th className="py-4 px-6">Priority</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">SLA Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {sortedTickets.map((ticket) => (
                      <tr 
                        key={ticket._id} 
                        onClick={() => router.push(`/tickets/${ticket._id}`)}
                        className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-4 px-6 font-mono font-bold text-indigo-600 text-xs">{ticket.ticketNumber}</td>
                        <td className="py-4 px-6 font-medium text-slate-800">{ticket.student?.name || 'Unknown'}</td>
                        <td className="py-4 px-6 text-slate-700 font-medium group-hover:text-indigo-900 transition-colors">{ticket.subject}</td>
                        <td className="py-4 px-6">
                          <span className={`text-xs font-semibold ${ticket.priority === 'Critical' ? 'text-rose-600 font-bold' : ticket.priority === 'High' ? 'text-amber-600' : 'text-slate-600'}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6"><StatusBadge status={ticket.status} /></td>
                        <td className="py-4 px-6"><SlaBadge dueAt={ticket.dueAt} status={ticket.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function MetricCard({ title, count, sub, icon, active, onClick, countColor = 'text-slate-900', activeBorder = 'border-indigo-600 ring-2 ring-indigo-600/10' }: any) {
  return (
    <div 
      onClick={onClick} 
      className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${active ? activeBorder : 'border-slate-200/80 hover:border-slate-300'}`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <span className="p-2 rounded-xl bg-slate-100 text-sm flex items-center justify-center">{icon}</span>
      </div>
      <p className={`text-3xl font-extrabold ${countColor}`}>{count}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}