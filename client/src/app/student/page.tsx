'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import SlaBadge from '@/components/SlaBadge';
import CreateTicketModal from '@/components/CreateTicketModal';
import { LuPlus } from 'react-icons/lu';

interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  dueAt: string;
}

export default function StudentDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  // 🛡️ Added mounting state to prevent hydration mismatches with localStorage
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
      if (parsedUser.role !== 'STUDENT') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } catch (e) {
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
      console.error('Failed to fetch student tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex">
      {/* Persistent Sidebar with Mobile Drawer State */}
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
              <h1 className="text-sm font-bold text-white tracking-tight">Student Support Portal</h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Welcome back, {mounted && user?.name ? user.name : 'Student'}
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">My Support Tickets</h2>
              <p className="text-xs text-slate-500 mt-0.5">Track your active and resolved helpdesk requests</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-2 rounded-xl">
                Total: {tickets.length}
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LuPlus className="w-4 h-4" /> Create Ticket
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm shadow-2xs">
              Loading your tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3 shadow-2xs">
              <p className="text-3xl">🎫</p>
              <p className="text-sm font-semibold text-slate-700">You haven't created any support tickets yet.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Need help with academics, finance, IT, or hostel matters? Create your first ticket now.</p>
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
                >
                  Create Your First Ticket
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile View: Stacked Ticket Cards */}
              <div className="block md:hidden space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => router.push(`/tickets/${ticket._id}`)}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 cursor-pointer active:bg-indigo-50/20 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-indigo-600 text-xs">
                        {ticket.ticketNumber}
                      </span>
                      <StatusBadge status={ticket.status} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{ticket.subject}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Category: <span className="text-slate-700 font-medium">{ticket.category}</span></p>
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

              {/* Desktop View: Standard Table */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Ticket ID</th>
                      <th className="py-4 px-6">Subject</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Priority</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">SLA Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {tickets.map((ticket) => (
                      <tr 
                        key={ticket._id} 
                        onClick={() => router.push(`/tickets/${ticket._id}`)}
                        className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-4 px-6 font-mono font-bold text-indigo-600 text-xs">
                          {ticket.ticketNumber}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-800 group-hover:text-indigo-900 transition-colors">
                          {ticket.subject}
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                          {ticket.category}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-xs font-semibold ${ticket.priority === 'Critical' ? 'text-rose-600 font-bold' : ticket.priority === 'High' ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="py-4 px-6">
                          <SlaBadge dueAt={ticket.dueAt} status={ticket.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modular Create Ticket Modal */}
      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTicketCreated={fetchTickets} 
      />
    </div>
  );
}