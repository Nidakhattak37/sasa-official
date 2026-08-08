import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, CheckCircle, Store, Truck, Mail, Send, Server, AlertCircle, Copy, Shield, Key } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email || 'info@sasaofficial.com');
  const [address, setAddress] = useState(settings.address);
  const [defaultShippingFee, setDefaultShippingFee] = useState(settings.defaultShippingFee);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);

  // Hostinger SMTP state for live testing
  const [smtpHost, setSmtpHost] = useState('smtp.hostinger.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [testEmailRecipient, setTestEmailRecipient] = useState(email || 'info@sasaofficial.com');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });

  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Fetch email config & status from server
  useEffect(() => {
    fetch('/api/email-status')
      .then(res => res.json())
      .then(data => {
        if (data.officialEmail) {
          setTestEmailRecipient(data.officialEmail);
        }
        if (data.smtpHost) setSmtpHost(data.smtpHost);
        if (data.smtpPort) setSmtpPort(data.smtpPort);
        if (data.recentLogs) setEmailLogs(data.recentLogs);
      })
      .catch(err => {
        console.log('Fetching email status info:', err);
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      phone,
      email,
      address,
      defaultShippingFee: Number(defaultShippingFee),
      freeShippingThreshold: Number(freeShippingThreshold),
      taxRate: Number(taxRate),
      currencyCode
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestEmail = async () => {
    setTestStatus({ loading: true });
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testEmailRecipient || email || 'info@sasaofficial.com',
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          pass: smtpPass
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({
          loading: false,
          success: true,
          message: data.message || `Test email successfully dispatched to ${testEmailRecipient || email || 'info@sasaofficial.com'}!`
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          message: data.error || data.message || 'SMTP connection failed. Check your Hostinger credentials.'
        });
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: err.message || 'Failed to communicate with server email endpoint.'
      });
    }
  };

  const envVariablesSnippet = `# SASA Official - Hostinger Environment Variables
PORT=3000
OFFICIAL_EMAIL=${email || 'info@sasaofficial.com'}
SMTP_HOST=${smtpHost || 'smtp.hostinger.com'}
SMTP_PORT=${smtpPort || '465'}
SMTP_SECURE=true
SMTP_USER=${smtpUser || 'info@sasaofficial.com'}
SMTP_PASS=${smtpPass || 'your_hostinger_email_password'}`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envVariablesSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      <div className="border-b border-[#EAE4DC] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Store Settings & Hostinger Email Setup</h2>
          <p className="text-xs text-gray-500">Configure store contact details, Hostinger SMTP email notifications for new orders, and shipping fees.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-green-50 text-green-800 text-xs font-semibold rounded border border-green-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Store settings updated successfully!
        </div>
      )}

      {/* Official Order Notifications & Hostinger Email Section */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
          <h3 className="font-serif text-base font-bold text-[#222] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#D4AF37]" /> Official Email & Hostinger Order Notifications
          </h3>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-semibold flex items-center gap-1">
            <Server className="w-3 h-3" /> Hostinger SMTP Ready
          </span>
        </div>

        <p className="text-[#555] leading-relaxed">
          Whenever a customer places an order on your storefront, the system automatically takes the customer's email from the checkout order form, packages the complete order breakdown, and delivers it to your <strong>Official Company Email</strong> with the customer's email configured as the <strong>Reply-To</strong> address.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 bg-[#FAF8F5] border border-[#EAE4DC] p-4 rounded-lg">
            <label className="block font-bold text-[#222] mb-1">
              Store Owner Official Email (Alerts Recipient) *
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTestEmailRecipient(e.target.value);
                }}
                placeholder="info@sasaofficial.com"
                className="flex-1 px-3 py-2 bg-white border border-[#D5CDBC] rounded font-semibold text-[#222] focus:outline-none focus:border-[#9E8055]"
              />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              All order notifications, tracking alerts, and store inquiries are sent to this address.
            </span>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#222]">Hostinger SMTP Server Host</label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.hostinger.com"
              className="w-full px-3 py-2 border rounded bg-white"
            />
            <span className="text-[10px] text-gray-400">Default: smtp.hostinger.com</span>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#222]">SMTP Port</label>
            <select
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="w-full px-3 py-2 border rounded bg-white"
            >
              <option value="465">465 (SSL / Recommended for Hostinger)</option>
              <option value="587">587 (TLS / STARTTLS)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#222]">Hostinger Webmail / SMTP Username</label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="info@sasaofficial.com"
              className="w-full px-3 py-2 border rounded bg-white"
            />
            <span className="text-[10px] text-gray-400">Your Hostinger Titan or Webmail address</span>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#222]">Hostinger Email Password / App Password</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border rounded bg-white"
            />
          </div>
        </div>

        {/* Test Email Trigger */}
        <div className="bg-[#F5F1EC] p-4 rounded-lg border border-[#EAE4DC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-bold text-[#222] block">Verify Hostinger Email Connection</span>
            <span className="text-[11px] text-gray-600 block">
              Sends an automated test email to <strong>{testEmailRecipient || email}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={testStatus.loading}
            className="px-4 py-2.5 bg-[#1E1E24] text-white hover:bg-[#D4AF37] hover:text-[#1E1E24] font-bold rounded transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {testStatus.loading ? 'Sending Test...' : 'Send Test Email'}
          </button>
        </div>

        {/* Test Result Message */}
        {testStatus.message && (
          <div className={`p-3 rounded-lg border flex items-start gap-2 ${
            testStatus.success ? 'bg-green-50 text-green-900 border-green-200' : 'bg-red-50 text-red-900 border-red-200'
          }`}>
            {testStatus.success ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">{testStatus.success ? 'Success: ' : 'Notice: '}</span>
              {testStatus.message}
            </div>
          </div>
        )}

        {/* Hostinger Environment Variables Quick-Copy Box */}
        <div className="bg-[#1E1E24] text-[#E0E0E0] p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#D4AF37] font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Hostinger .env Environment Variables (Click to Copy)
            </span>
            <button
              type="button"
              onClick={copyEnvSnippet}
              className="px-2.5 py-1 bg-[#33333E] hover:bg-[#444455] text-white rounded text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copiedEnv ? 'Copied to Clipboard!' : 'Copy .env'}
            </button>
          </div>
          <pre className="text-[11px] font-mono bg-[#141418] p-3 rounded overflow-x-auto text-emerald-400 whitespace-pre">
            {envVariablesSnippet}
          </pre>
          <p className="text-[10px] text-gray-400">
            Paste these into your Hostinger Cloud / VPS / Node.js App settings or <code>.env</code> file.
          </p>
        </div>
      </div>

      {/* General Storefront Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Brand Details */}
        <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#222] flex items-center gap-2 border-b border-[#EAE4DC] pb-3">
            <Store className="w-4 h-4 text-[#9E8055]" /> Brand & Storefront Specs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#222]">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Public Customer Care Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Helpline / WhatsApp Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Default Currency</label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white"
              >
                <option value="PKR">PKR - Pakistani Rupee (Rs)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="AED">AED - UAE Dirham (AED)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-[#222]">Physical Flagship Store Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#222] flex items-center gap-2 border-b border-[#EAE4DC] pb-3">
            <Truck className="w-4 h-4 text-[#9E8055]" /> Shipping & Freight Rates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#222]">Standard Nationwide Shipping Fee (PKR)</label>
              <input
                type="number"
                required
                value={defaultShippingFee}
                onChange={(e) => setDefaultShippingFee(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Free Shipping Threshold Spend (PKR)</label>
              <input
                type="number"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-[#222] text-white font-semibold text-xs uppercase tracking-wider rounded hover:bg-[#9E8055] transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" /> Save Store Configuration
          </button>
        </div>

      </form>

    </div>
  );
};
