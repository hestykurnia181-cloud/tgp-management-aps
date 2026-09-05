import React, { useState } from 'react';
import {
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Lock,
  LogIn,
  User,
} from 'lucide-react';
import { useTgp } from '../context/TgpContext';

export const LoginScreen: React.FC = () => {
  const { login, userMessage, errorMessage, clearMessages } = useTgp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    login(username, password);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative z-10 space-y-5 my-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 border border-blue-400/40 shadow-xl shadow-blue-950/40">
            <span className="text-2xl font-black tracking-wider text-white">TGP</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">TGP Management</h2>
          <p className="text-xs text-slate-400 font-medium">Enterprise Multi-Business Platform</p>
        </div>

        {userMessage && (
          <div className="p-3.5 rounded-2xl bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{userMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 border border-slate-700/80 shadow-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Masuk ke Akun</h3>
            <p className="text-xs text-slate-400 mt-0.5">Silakan masuk menggunakan username dan password Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email / Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username / email"
                  data-testid="input_login_username"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  data-testid="input_login_password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              data-testid="btn_login_submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            TGP Enterprise Secure Login &bull; Akses Multi-Bisnis Terisolasi
          </p>
        </div>
      </div>
    </div>
  );
};
