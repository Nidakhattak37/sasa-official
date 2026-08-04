import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section className="py-16 bg-[#222222] text-[#F5F1EC]">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <Mail className="w-8 h-8 mx-auto text-[#D4AF37] stroke-1" />
        
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white">
          Subscribe to SASA Privé
        </h2>
        
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
          Be the first to receive secret launch previews, private lawn catalog invitations, and exclusive 10% discount codes.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-950/80 border border-green-700 text-green-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Thank you for subscribing! Check your inbox for your welcome privilege code.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="flex-1 px-4 py-3 bg-[#2E2E2E] border border-[#444] rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#D4AF37] text-[#222222] font-semibold text-xs tracking-[0.15em] uppercase rounded hover:bg-[#c39e2e] transition"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
