import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Mail, Lock, User, Phone, CheckCircle2, KeyRound } from 'lucide-react';

export const CustomerAuthModal: React.FC = () => {
  const {
    isCustomerAuthModalOpen, setIsCustomerAuthModalOpen,
    loginCustomer, registerCustomer
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('ayesha.khan@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCustomerAuthModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    const res = loginCustomer(loginEmail, loginPassword);
    setMessage({ text: res.message, isError: !res.success });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;
    const res = registerCustomer({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });
    setMessage({ text: res.message, isError: !res.success });
  };

  const handleQuickDemoCustomer = () => {
    setLoginEmail('ayesha.khan@gmail.com');
    setLoginPassword('password123');
    loginCustomer('ayesha.khan@gmail.com', 'password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative space-y-5 animate-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={() => setIsCustomerAuthModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <span className="font-serif text-2xl tracking-[0.2em] font-bold text-[#222222] uppercase block">
            SASA
          </span>
          <span className="text-[9px] tracking-[0.35em] text-[#9E8055] font-sans font-semibold uppercase block">
            PRIVÉ CLIENT ACCESS
          </span>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-[#EAE4DC] text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setMessage(null); }}
            className={`flex-1 py-2.5 text-center transition border-b-2 ${
              mode === 'login'
                ? 'border-[#222] text-[#222] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setMessage(null); }}
            className={`flex-1 py-2.5 text-center transition border-b-2 ${
              mode === 'register'
                ? 'border-[#222] text-[#222] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className={`p-3 text-xs font-semibold rounded-lg text-center ${
            message.isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-[#222]">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ayesha.khan@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#EAE4DC] rounded-xl focus:outline-none focus:border-[#9E8055]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#EAE4DC] rounded-xl focus:outline-none focus:border-[#9E8055]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoCustomer}
              className="w-full py-2 bg-[#F5F1EC] text-[#222] hover:bg-[#EAE4DC] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#9E8055]" />
              <span>⚡ Auto-fill Customer Account</span>
            </button>

            <button
              type="submit"
              className="w-full py-3 bg-[#222222] text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-[#9E8055] transition shadow"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-[#222]">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full pl-9 pr-3 py-2 border border-[#EAE4DC] rounded-xl focus:outline-none focus:border-[#9E8055]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ayesha@gmail.com"
                  className="w-full pl-9 pr-3 py-2 border border-[#EAE4DC] rounded-xl focus:outline-none focus:border-[#9E8055]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Mobile / WhatsApp *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full pl-9 pr-3 py-2 border border-[#EAE4DC] rounded-xl focus:outline-none focus:border-[#9E8055]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-9 pr-3 py-2 border border-[#EAE4DC] rounded-xl focus:outline-none focus:border-[#9E8055]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#222222] text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-[#9E8055] transition shadow mt-2"
            >
              Create SASA Account
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
