'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import API from '@/utils/api';
import { LuX, LuChevronDown, LuCheck } from 'react-icons/lu';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

export default function CreateTicketModal({ 
  isOpen, 
  onClose, 
  onTicketCreated 
}: CreateTicketModalProps) {
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Academics');
  const [priority, setPriority] = useState<string>('Medium');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Dropdown open/closed states
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState<boolean>(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  const categories: string[] = ['Academics', 'Finance', 'Hostel', 'IT'];
  const priorities: string[] = ['Low', 'Medium', 'High', 'Critical'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await API.post('/tickets', { subject, description, category, priority });
      setSubject('');
      setDescription('');
      setCategory('Academics');
      setPriority('Medium');
      onTicketCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Create New Support Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">Submit your query directly to the relevant department</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-medium border border-rose-100">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Fee payment discrepancy"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none text-xs text-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Custom Category Dropdown */}
            <div className="relative" ref={categoryRef}>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Category</label>
              <button
                type="button"
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsPriorityOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-900 hover:bg-slate-100/60 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all cursor-pointer"
              >
                <span>{category}</span>
                <LuChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setCategory(cat); setIsCategoryOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${category === cat ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      <span>{cat}</span>
                      {category === cat && <LuCheck className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Priority Dropdown */}
            <div className="relative" ref={priorityRef}>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Priority</label>
              <button
                type="button"
                onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsCategoryOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-900 hover:bg-slate-100/60 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all cursor-pointer"
              >
                <span>{priority}</span>
                <LuChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isPriorityOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPriorityOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  {priorities.map((pri) => (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => { setPriority(pri); setIsPriorityOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${priority === pri ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      <span className={`${pri === 'Critical' ? 'text-rose-600 font-bold' : pri === 'High' ? 'text-amber-600 font-semibold' : ''}`}>{pri}</span>
                      {priority === pri && <LuCheck className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none text-xs text-slate-900 bg-slate-50/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors border border-slate-200/60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}