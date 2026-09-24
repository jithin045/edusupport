'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      if (data.role === 'STUDENT') {
        router.push('/student');
      } else {
        router.push('/staff');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-100 to-indigo-50/30 p-4 sm:p-6 md:p-8 select-none">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl mb-3 sm:mb-4 shadow-lg shadow-indigo-500/30">
            ES
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Welcome to EduSupport</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Campus Helpdesk & Ticketing System</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-medium mb-5 border border-rose-100 flex items-center gap-2">
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@edusupport.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition-all text-xs sm:text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Footer */}
        <div className="mt-6 sm:mt-8 pt-5 border-t border-slate-100 text-xs text-slate-500 space-y-2 bg-slate-50/50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-5 sm:p-6 rounded-b-2xl sm:rounded-b-3xl">
          <p className="font-semibold text-slate-700 text-[11px] sm:text-xs">⚡ Quick Demo Logins (Password: password123):</p>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-2.5 rounded-xl border border-slate-200/60 gap-1 sm:gap-0">
            <span className="font-medium">🎓 Student</span>
            <span className="font-mono text-indigo-600 text-[11px] sm:text-xs break-all">student@edusupport.com</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-2.5 rounded-xl border border-slate-200/60 gap-1 sm:gap-0">
            <span className="font-medium">🛠️ Staff</span>
            <span className="font-mono text-indigo-600 text-[11px] sm:text-xs break-all">staff@edusupport.com</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-2.5 rounded-xl border border-slate-200/60 gap-1 sm:gap-0">
            <span className="font-medium">🛡️ Manager</span>
            <span className="font-mono text-indigo-600 text-[11px] sm:text-xs break-all">manager@edusupport.com</span>
          </div>
        </div>

      </div>
    </div>
  );
}