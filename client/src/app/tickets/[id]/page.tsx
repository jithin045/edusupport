'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/utils/api';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import { LuChevronDown, LuCheck } from 'react-icons/lu';

interface Comment {
  _id: string;
  message: string;
  createdAt: string;
  author?: {
    name?: string;
    role?: string;
  };
}

interface Activity {
  _id: string;
  action: string;
  createdAt: string;
  actor?: {
    name?: string;
  };
  oldValue?: string;
  newValue?: string;
}

interface TicketData {
  ticket: {
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    category: string;
    description: string;
    student?: {
      name?: string;
    };
  };
  comments: Comment[];
  activities: Activity[];
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>('');
  
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPriority, setNewPriority] = useState<string>('');
  
  const [updating, setUpdating] = useState<boolean>(false);
  const [commenting, setCommenting] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Custom Dropdown States
  const [isStatusOpen, setIsStatusOpen] = useState<boolean>(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState<boolean>(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  const statuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  useEffect(() => {
    if (id) fetchTicketDetails();
  }, [id]);

  // Handle clicking outside custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTicketDetails = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      setData(res.data);
      setNewStatus(res.data.ticket.status);
      setNewPriority(res.data.ticket.priority);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await API.patch(`/tickets/${id}`, { status: newStatus, priority: newPriority });
      alert('Ticket workflow updated successfully!');
      fetchTicketDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      await API.post(`/tickets/${id}/comments`, { message: commentText });
      setCommentText('');
      fetchTicketDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm font-sans">
        Loading ticket details...
      </div>
    );
  }

  const { ticket, comments, activities } = data;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex flex-col md:flex-row">
      {/* Persistent Sidebar with Mobile Support */}
      <Sidebar user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16">
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
              <h1 className="text-sm font-bold text-white tracking-tight">Ticket Details</h1>
              <p className="text-[11px] text-slate-400">Reference ID: <span className="font-mono font-bold text-indigo-400">{ticket.ticketNumber}</span></p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Back Button */}
          <div>
            <button
              onClick={() => router.push(user.role === 'STUDENT' ? '/student' : '/staff')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80 bg-white shadow-2xs cursor-pointer"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Details & Comments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Ticket Card */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{ticket.subject}</h1>
                  <StatusBadge status={ticket.status} />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 pt-1 pb-2 border-b border-slate-100">
                  <span>Category: <strong className="text-slate-700">{ticket.category}</strong></span>
                  <span className="hidden sm:inline">•</span>
                  <span>Student: <strong className="text-slate-700">{ticket.student?.name}</strong></span>
                  <span className="hidden sm:inline">•</span>
                  <span>Priority: <strong className="text-slate-700">{ticket.priority}</strong></span>
                </div>

                <div className="text-sm text-slate-700 bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </div>
              </div>

              {/* Discussion & Comments Section */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Discussion & Activity Thread</h2>

                <div className="space-y-3.5">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No comments posted yet. Start the conversation below.</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c._id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/60 text-sm space-y-1.5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-xs">{c.author?.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.author?.role === 'STUDENT' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {c.author?.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">{c.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
                  <textarea
                    rows={3}
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type a response or update note..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none text-xs text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 resize-none"
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={commenting}
                      className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {commenting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Workflow Controls & Audit Trail */}
            <div className="space-y-6">
              {user.role !== 'STUDENT' && (
                <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Workflow Actions</h2>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    
                    {/* Custom Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Update Status</label>
                      <button
                        type="button"
                        onClick={() => { setIsStatusOpen(!isStatusOpen); setIsPriorityOpen(false); }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-900 hover:bg-slate-100/60 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all cursor-pointer"
                      >
                        <span>{newStatus}</span>
                        <LuChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isStatusOpen && (
                        <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                          {statuses.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => { setNewStatus(status); setIsStatusOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${newStatus === status ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                              <span>{status}</span>
                              {newStatus === status && <LuCheck className="w-3.5 h-3.5 text-indigo-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Custom Priority Dropdown */}
                    <div className="relative" ref={priorityRef}>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Update Priority</label>
                      <button
                        type="button"
                        onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsStatusOpen(false); }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-900 hover:bg-slate-100/60 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all cursor-pointer"
                      >
                        <span>{newPriority}</span>
                        <LuChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isPriorityOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isPriorityOpen && (
                        <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                          {priorities.map((pri) => (
                            <button
                              key={pri}
                              type="button"
                              onClick={() => { setNewPriority(pri); setIsPriorityOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${newPriority === pri ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                              <span className={`${pri === 'Critical' ? 'text-rose-600 font-bold' : pri === 'High' ? 'text-amber-600 font-semibold' : ''}`}>{pri}</span>
                              {newPriority === pri && <LuCheck className="w-3.5 h-3.5 text-indigo-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={updating}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? 'Saving...' : 'Save Workflow Changes'}
                    </button>
                  </form>
                </div>
              )}

              {/* Immutable Audit Trail Timeline */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Audit Trail</h2>
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-100">
                  {activities.map((act) => (
                    <div key={act._id} className="relative pl-7 text-xs space-y-1">
                      <div className="absolute left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white shadow-2xs"></div>
                      <p className="font-semibold text-slate-900">{act.action}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by <span className="text-slate-600 font-medium">{act.actor?.name || 'System'}</span>
                      </p>
                      {act.oldValue && act.newValue && (
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-600">
                          {act.oldValue.replace(/_/g, ' ')} → <span className="text-indigo-600 font-bold">{act.newValue.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}