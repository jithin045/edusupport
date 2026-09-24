'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">EduSupport</h1>
          <p className="text-sm text-gray-500 mt-2">Campus Helpdesk & Support Ticketing System</p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors text-sm shadow-sm"
          >
            Go to Login Portal
          </button>
        </div>

        <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
          Built for Edumerge Assessment • 4-Hour MVP
        </div>
      </div>
    </div>
  );
}