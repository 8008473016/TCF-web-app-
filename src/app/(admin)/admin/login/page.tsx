'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loginSecret, setLoginSecret] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    setIsLoading(true);
    
    try {
      const success = await login(loginSecret);
      if (success) {
        // Force refresh or redirect to populate cookies properly
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setLoginError(true);
      }
    } catch (error) {
      console.error(error);
      setLoginError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4 bg-[#F5F2EB]">
      <div className="bg-white border border-[#DE2943]/20 max-w-md w-full p-8 sm:p-12 shadow-xl rounded-2xl space-y-6">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 text-[#DE2943] mx-auto" />
          <h1 className="text-2xl font-serif font-black tracking-wider text-[#121110] uppercase">TCF Admin Locker</h1>
          <p className="text-xs text-[#121110]/60">Restricted administrative access. Please enter credentials.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#121110]/70 block">
              Locker Secret Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••••••••"
              value={loginSecret}
              onChange={(e) => setLoginSecret(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 bg-white text-[#121110] text-sm rounded-lg focus:outline-none focus:border-[#DE2943] text-center font-bold tracking-widest focus:ring-1 focus:ring-[#DE2943]"
              disabled={isLoading}
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#121110] hover:bg-[#DE2943] text-white transition-colors duration-355 font-bold uppercase text-xs tracking-widest shadow-md rounded-lg cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Verify Credentials'
            )}
          </button>
        </form>

        {loginError && (
          <p className="text-[#DE2943] text-xs font-semibold text-center bg-red-50 border border-red-200 p-3 rounded-lg">
            Invalid credentials secret code. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
