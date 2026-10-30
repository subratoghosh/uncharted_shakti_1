'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ArrowRight, AlertTriangle, ShieldCheck, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { ShaktiqBrand } from '../../../components/landing/ShaktiqBrand';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Successful registration: Redirect to login with success query parameter
      router.push('/login?registered=true');
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong during registration');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-butter-bg flex items-center justify-center p-4 selection:bg-butter-cream selection:text-green-dark">
      <div className="w-full max-w-md bg-[#FFFDF7] border border-[#0C382E]/15 rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_rgba(12,56,46,0.1)] text-[#0C382E] space-y-6 relative overflow-hidden">
        {/* Header with Brand */}
        <div className="text-center space-y-3 relative z-10">
          <div className="flex justify-center pb-1">
            <ShaktiqBrand href="/" theme="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0C382E]/5 border border-[#0C382E]/15 text-[11px] font-mono text-[#0C382E] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-green-accent" />
            <span>Developer Account Setup</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0C382E] font-slab">
            Create an Account
          </h1>
          <p className="text-xs text-[#0C382E]/70">
            Join ShaktIQ for autonomous OpenAPI compatibility verification
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 text-xs bg-red-50 border border-red-300 text-red-900 rounded-2xl flex items-start gap-2.5 animate-fade-in shadow-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Social OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="flex items-center justify-center gap-2.5 h-11 px-4 bg-white hover:bg-[#F6EED8] border border-[#0C382E]/20 hover:border-[#0C382E]/40 rounded-2xl text-xs font-semibold text-[#0C382E] transition-all duration-200 shadow-xs active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="flex items-center justify-center gap-2.5 h-11 px-4 bg-white hover:bg-[#F6EED8] border border-[#0C382E]/20 hover:border-[#0C382E]/40 rounded-2xl text-xs font-semibold text-[#0C382E] transition-all duration-200 shadow-xs active:scale-[0.98]"
          >
            <svg className="w-4 h-4 fill-current text-[#0C382E]" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#0C382E]/15 w-full" />
          <span className="bg-[#FFFDF7] px-3 text-[10px] uppercase tracking-wider text-[#0C382E]/60 font-mono font-semibold absolute">
            Or register with email
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0C382E] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-green-accent" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 text-sm bg-white border border-[#0C382E]/20 rounded-xl text-[#0C382E] placeholder:text-[#0C382E]/35 focus:outline-none focus:border-[#0C382E] focus:ring-2 focus:ring-[#0C382E]/15 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0C382E] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-green-accent" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              placeholder="ada@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 text-sm bg-white border border-[#0C382E]/20 rounded-xl text-[#0C382E] placeholder:text-[#0C382E]/35 focus:outline-none focus:border-[#0C382E] focus:ring-2 focus:ring-[#0C382E]/15 transition-all font-mono shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0C382E] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-green-accent" />
              <span>Password (min. 8 characters)</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3.5 text-sm bg-white border border-[#0C382E]/20 rounded-xl text-[#0C382E] placeholder:text-[#0C382E]/35 focus:outline-none focus:border-[#0C382E] focus:ring-2 focus:ring-[#0C382E]/15 transition-all font-mono shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0C382E] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-accent" />
              <span>Confirm Password</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 px-3.5 text-sm bg-white border border-[#0C382E]/20 rounded-xl text-[#0C382E] placeholder:text-[#0C382E]/35 focus:outline-none focus:border-[#0C382E] focus:ring-2 focus:ring-[#0C382E]/15 transition-all font-mono shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 bg-[#0C382E] hover:bg-[#07241D] text-butter-cream text-sm font-bold rounded-2xl shadow-md hover:shadow-[0_8px_24px_rgba(12,56,46,0.25)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer link to sign in */}
        <div className="text-xs text-center text-[#0C382E]/70 pt-2 border-t border-[#0C382E]/15">
          Already registered?{' '}
          <Link
            href="/login"
            className="text-[#0C382E] hover:underline font-bold transition-colors ml-1"
          >
            Sign in to existing account
          </Link>
        </div>
      </div>
    </div>
  );
}
