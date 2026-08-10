import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export const AdminAuthView: React.FC = () => {
  const { loginAdmin, setCurrentView, setUserRole } = useApp();

  const [email, setEmail] = useState('info@sasaofficial.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const success = loginAdmin(email, password);
      setIsLoading(false);
      if (!success) {
        setErrorMsg('Invalid director credentials. Use info@sasaofficial.com / admin123');
      }
    }, 400);
  };

  const handleQuickDemo = () => {
    setEmail('info@sasaofficial.com');
    setPassword('admin123');
    loginAdmin('info@sasaofficial.com', 'admin123');
  };

  return (
    <div className="min-h-screen bg-[#141418] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Link */}
      <div className="absolute top-6 left-6 sm:left-12">
        <button
          onClick={() => {
            setUserRole('customer');
            setCurrentView('home');
          }}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to SASA Storefront
        </button>
      </div>

      <div className="w-full max-w-md bg-[#1E1E24] border border-[#2E2E38] rounded-2xl p-8 shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Brand Lock Badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#222] border border-[#D4AF37]/40 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-[#D4AF37]">
            <Shield className="w-7 h-7" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold block pt-2">
            SECURE DIRECTOR PORTAL
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-wider text-white">SASA ADMIN LOGIN</h1>
          <p className="text-xs text-gray-400">
            Enter administrative credentials to manage store catalog, orders, and records.
          </p>
        </div>

        {/* Form Error */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Admin Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@sasaofficial.com"
                className="w-full pl-10 pr-4 py-3 bg-[#141418] border border-[#2E2E38] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Security Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#141418] border border-[#2E2E38] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Fill Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 bg-[#2B2B36] hover:bg-[#353544] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <KeyRound className="w-4 h-4" />
              <span>⚡ Auto-fill Admin Credentials</span>
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-[#141418] text-xs font-bold uppercase tracking-widest rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? 'Authenticating...' : 'Sign In To Admin Control'}
          </button>
        </form>

        <div className="border-t border-[#2E2E38] pt-4 text-center text-[11px] text-gray-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            Encrypted End-to-End Director Authentication
          </p>
        </div>

      </div>

    </div>
  );
};
