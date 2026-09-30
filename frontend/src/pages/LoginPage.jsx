import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { getSupabaseClient } from '../services/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { error: authError } = await getSupabaseClient().auth.signInWithPassword({
        email: username,
        password
      });
      if (authError) throw authError;
      navigate('/dashboard', { replace: true });
    } catch (authError) {
      setError(authError.message || 'Sign-in is not configured.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Library Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/70">Email</label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <User className="h-4 w-4 text-white/40" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                placeholder="name@example.com"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Password</label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Lock className="h-4 w-4 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-white/50 transition hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
