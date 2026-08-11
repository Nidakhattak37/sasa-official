import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, CheckCircle, Store, Truck, Mail, Send, Server, AlertCircle, Copy, Shield, Key, Database, RefreshCw, Layers, CheckCircle2, Globe, HardDrive, Link as LinkIcon, ArrowRight, Sparkles } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, products, orders, banners, menuItems, instantClassics, dualEditorial } = useApp();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email || 'info@sasaofficial.com');
  const [address, setAddress] = useState(settings.address);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || 'https://www.instagram.com/sasaofficial.pk?igsh=MXhhZmJwNzR1M3FucA==');
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

  // MongoDB Atlas Database State
  const [mongoUri, setMongoUri] = useState('');
  const [mongoDbName, setMongoDbName] = useState('sasaofficial');
  const [dbStatus, setDbStatus] = useState<{
    loading: boolean;
    connected?: boolean;
    type?: string;
    databaseName?: string;
    uriConfigured?: boolean;
    maskedUri?: string;
    isAuthError?: boolean;
    isSslAlert80?: boolean;
    activeFallback?: boolean;
    counts?: Record<string, number>;
    message?: string;
  }>({ loading: true });
  const [mongoTestStatus, setMongoTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });

  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Fetch email config & MongoDB status from server
  const fetchDbStatus = () => {
    setDbStatus(prev => ({ ...prev, loading: true }));
    fetch('/api/db/status')
      .then(res => res.json())
      .then(data => {
        setDbStatus({
          loading: false,
          connected: data.connected,
          type: data.type,
          databaseName: data.databaseName || 'sasaofficial',
          uriConfigured: data.uriConfigured,
          maskedUri: data.maskedUri,
          isAuthError: data.isAuthError,
          isSslAlert80: data.isSslAlert80,
          activeFallback: data.activeFallback,
          counts: data.counts || { orders: orders.length, products: products.length, customers: 1 },
          message: data.message
        });
      })
      .catch(err => {
        setDbStatus({
          loading: false,
          connected: false,
          type: 'Local Browser State',
          databaseName: 'sasaofficial',
          message: err.message
        });
      });
  };

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

    fetchDbStatus();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      phone,
      email,
      address,
      instagramUrl,
      defaultShippingFee: Number(defaultShippingFee),
      freeShippingThreshold: Number(freeShippingThreshold),
      taxRate: Number(taxRate),
      currency: currencyCode || settings.currency || 'PKR',
      announcementBarText: settings.announcementBarText,
      enableCOD: settings.enableCOD,
      enableCard: settings.enableCard
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

  const handleTestMongo = async () => {
    setMongoTestStatus({ loading: true });
    try {
      const res = await fetch('/api/db/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: mongoUri,
          databaseName: mongoDbName
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMongoTestStatus({
          loading: false,
          success: true,
          message: data.message || `Successfully connected to MongoDB Atlas database "${mongoDbName}"!`
        });
        fetchDbStatus();
      } else {
        setMongoTestStatus({
          loading: false,
          success: false,
          message: data.message || data.error || 'Failed to connect to MongoDB Atlas cluster.'
        });
      }
    } catch (err: any) {
      setMongoTestStatus({
        loading: false,
        success: false,
        message: err.message || 'Error connecting to MongoDB cluster.'
      });
    }
  };

  const handleSyncToMongo = async () => {
    setSyncStatus({ loading: true });
    try {
      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          orders,
          banners,
          menuItems,
          instantClassics,
          dualEditorial,
          settings: {
            storeName,
            email,
            phone,
            address,
            instagramUrl,
            defaultShippingFee,
            freeShippingThreshold
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncStatus({
          loading: false,
          success: true,
          message: data.message || 'Catalog & Orders synced to MongoDB Atlas!'
        });
        fetchDbStatus();
      } else {
        setSyncStatus({
          loading: false,
          success: false,
          message: data.message || data.error || 'MongoDB Atlas is not connected yet.'
        });
      }
    } catch (err: any) {
      setSyncStatus({
        loading: false,
        success: false,
        message: err.message || 'Failed to sync data to MongoDB Atlas.'
      });
    }
  };

  const envVariablesSnippet = `# SASA Official - Production Environment Variables
PORT=3000

# OFFICIAL STORE OWNER EMAIL (ORDER NOTIFICATIONS)
OFFICIAL_EMAIL=${email || 'info@sasaofficial.com'}

# HOSTINGER SMTP EMAIL CONFIGURATION
SMTP_HOST=${smtpHost || 'smtp.hostinger.com'}
SMTP_PORT=${smtpPort || '465'}
SMTP_SECURE=true
SMTP_USER=${smtpUser || 'info@sasaofficial.com'}
SMTP_PASS=${smtpPass || 'your_hostinger_email_password'}

# MONGODB ATLAS DATABASE CONFIGURATION
MONGODB_URI=${mongoUri || 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sasaofficial?retryWrites=true&w=majority'}
MONGODB_DB_NAME=${mongoDbName || 'sasaofficial'}`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envVariablesSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      <div className="border-b border-[#EAE4DC] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Store Settings, MongoDB Atlas & Hostinger Setup</h2>
          <p className="text-xs text-gray-500">Configure store contact details, MongoDB Atlas cloud database connection, and Hostinger order email alerts.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-green-50 text-green-800 text-xs font-semibold rounded border border-green-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Store settings updated successfully!
        </div>
      )}

      {/* ============================================================================== */}
      {/* MONGODB ATLAS CLOUD DATABASE INTEGRATION */}
      {/* ============================================================================== */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#222] flex items-center gap-2">
                MongoDB Atlas Cloud Database
              </h3>
              <span className="text-[11px] text-gray-500">Database Name: <strong className="text-[#222]">sasaofficial</strong> | Engine: NoSQL Document Store</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dbStatus.connected ? (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected to Atlas Cluster
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-600" /> Local Mode (Atlas Ready)
              </span>
            )}
            <button
              type="button"
              onClick={fetchDbStatus}
              title="Refresh database status"
              className="p-1.5 border border-[#EAE4DC] rounded hover:bg-gray-50 text-gray-600 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbStatus.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Database Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#EAE4DC]">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">Database Name</span>
            <span className="font-mono text-sm font-bold text-[#1E1E24] block">{dbStatus.databaseName || 'sasaofficial'}</span>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Active Production DB</span>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#EAE4DC]">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">Orders Collection</span>
            <span className="font-mono text-sm font-bold text-[#1E1E24] block">
              {dbStatus.counts?.orders ?? orders.length} Orders
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Auto-synced on checkout</span>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#EAE4DC]">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">Products Catalog</span>
            <span className="font-mono text-sm font-bold text-[#1E1E24] block">
              {dbStatus.counts?.products ?? products.length} SKUs
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Lawn & Pret Couture</span>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#EAE4DC]">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">Atlas Status</span>
            <span className={`text-[11px] font-bold block truncate ${dbStatus.connected ? 'text-emerald-700' : 'text-amber-700'}`}>
              {dbStatus.connected ? 'Cluster Online' : dbStatus.isAuthError ? 'Auth Check Required' : dbStatus.uriConfigured ? 'Action Needed (IP Allow)' : 'Local Storage Mode'}
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5 block font-mono truncate">
              {dbStatus.maskedUri || 'sasaofficial.xo5gxgs.mongodb.net'}
            </span>
          </div>
        </div>

        {/* Decoupled Storage Architecture System Status */}
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE4DC] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#222] text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Decoupled Storage Architecture
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              Optimized & Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Website File Storage */}
            <div className="p-3 bg-white rounded-lg border border-[#EAE4DC] flex items-start gap-3 shadow-2xs">
              <div className="p-2 bg-amber-50 text-[#8B5E34] rounded-lg border border-amber-200 flex-shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1E1E24] text-xs">Website Image Storage</span>
                  <span className="text-[9px] font-mono bg-amber-50 text-[#8B5E34] px-1.5 py-0.5 rounded border border-amber-200">
                    /public/uploads
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">
                  High-resolution dress photographs are saved directly to website file storage on disk. Fast static CDN caching, no database bloat.
                </p>
              </div>
            </div>

            {/* MongoDB Metadata & Links Storage */}
            <div className="p-3 bg-white rounded-lg border border-[#EAE4DC] flex items-start gap-3 shadow-2xs">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex-shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1E1E24] text-xs">MongoDB Atlas Document Store</span>
                  <span className="text-[9px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                    Link URLs Only
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">
                  MongoDB Atlas stores product information (name, SKU, prices, inventory, sizes) and references the website image link URLs.
                </p>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#1E1E24] text-white rounded-lg flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono gap-2">
            <span className="text-[#D4AF37] font-semibold flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> Data Pipeline:
            </span>
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-white">Admin Uploads Photo</span>
              <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-amber-300">Saved to Website Storage (/uploads/)</span>
              <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-emerald-400">Link URL Saved in MongoDB Atlas</span>
            </div>
          </div>
        </div>

        {/* Action Needed Banner: Authentication Failure */}
        {dbStatus.uriConfigured && !dbStatus.connected && dbStatus.isAuthError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="font-bold text-amber-900 text-xs">
                MongoDB Atlas: Authentication Pending (Local Storage Mode Active)
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your connection string reached the MongoDB Atlas cluster (<strong>sasaofficial.xo5gxgs.mongodb.net</strong>), but the database user credentials failed authentication. The store is operating smoothly in local fallback mode.
            </p>
            <div className="bg-white/80 border border-amber-300 rounded-lg p-3 text-[11px] text-amber-900 space-y-1">
              <strong className="block text-amber-950 font-bold">How to verify or reset your Atlas Database Credentials:</strong>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Log in to your <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" className="text-[#9E8055] font-bold underline">MongoDB Atlas Console</a>.</li>
                <li>In the left sidebar under <strong>Security</strong>, click <strong>Database Access</strong>.</li>
                <li>Verify your database username (e.g. <code>mupak9_db_user</code> or create a new user <code>sasa_admin</code> with <em>Read and write to any database</em> privileges).</li>
                <li>Click <strong>Edit &gt; Edit Password</strong> to reset your password.</li>
                <li>Paste the updated connection string in the box below and click <strong>Test Connection</strong> to activate!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Action Needed Banner: IP Firewall Block (SSL Alert 80) */}
        {dbStatus.uriConfigured && !dbStatus.connected && dbStatus.isSslAlert80 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="font-bold text-amber-900 text-xs">
                MongoDB Atlas Connection Attempted: Action Needed in MongoDB Atlas Dashboard
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your MongoDB connection string is detected, but MongoDB Atlas refused the TLS handshake (<code>SSL alert number 80</code>). This occurs when the server's cloud IP address is not whitelisted in your MongoDB Atlas cluster firewall.
            </p>
            <div className="bg-white/80 border border-amber-300 rounded-lg p-3 text-[11px] text-amber-900 space-y-1">
              <strong className="block text-amber-950 font-bold">1-Minute Fix in your MongoDB Atlas Dashboard:</strong>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Log in to your <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" className="text-[#9E8055] font-bold underline">MongoDB Atlas Console</a>.</li>
                <li>In the left sidebar under <strong>Security</strong>, click <strong>Network Access</strong>.</li>
                <li>Click the green <strong>"Add IP Address"</strong> button.</li>
                <li>Click <strong>"Allow Access from Anywhere"</strong> (this adds <code>0.0.0.0/0</code>).</li>
                <li>Click <strong>Confirm</strong>, wait 30 seconds, then click the refresh button above!</li>
              </ol>
            </div>
          </div>
        )}

        {/* MongoDB Connection Input & Test */}
        <div className="bg-[#FAF8F5] border border-[#EAE4DC] p-4 rounded-xl space-y-4">
          <div>
            <label className="block font-bold text-[#222] mb-1">
              MongoDB Atlas Connection String URI
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                placeholder="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sasaofficial?retryWrites=true&w=majority"
                className="flex-1 px-3 py-2 bg-white border border-[#D5CDBC] rounded font-mono text-[11px] text-[#222] focus:outline-none focus:border-[#9E8055]"
              />
              <button
                type="button"
                onClick={handleTestMongo}
                disabled={mongoTestStatus.loading}
                className="px-4 py-2 bg-[#1E1E24] text-white hover:bg-[#D4AF37] hover:text-[#1E1E24] font-bold rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
              >
                <Server className="w-3.5 h-3.5" />
                {mongoTestStatus.loading ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Format: <code>mongodb+srv://&lt;username&gt;:&lt;password&gt;@&lt;cluster-name&gt;.mongodb.net/sasaofficial?retryWrites=true&w=majority</code>
            </span>
          </div>

          {/* Test Status Feedback */}
          {mongoTestStatus.message && (
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${
              mongoTestStatus.success ? 'bg-green-50 text-green-900 border-green-200' : 'bg-red-50 text-red-900 border-red-200'
            }`}>
              {mongoTestStatus.success ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">{mongoTestStatus.success ? 'Atlas Connected: ' : 'Notice: '}</span>
                {mongoTestStatus.message}
              </div>
            </div>
          )}

          {/* Sync Button */}
          <div className="pt-2 border-t border-[#EAE4DC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-[#222] block">Sync Local Inventory & Orders to MongoDB Atlas</span>
              <span className="text-[11px] text-gray-500">Pushes current catalog items, categories, and initial order records into MongoDB Atlas collections.</span>
            </div>
            <button
              type="button"
              onClick={handleSyncToMongo}
              disabled={syncStatus.loading}
              className="px-4 py-2 bg-white border border-[#D5CDBC] text-[#222] hover:border-[#9E8055] hover:text-[#9E8055] font-bold rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.loading ? 'animate-spin' : ''}`} />
              {syncStatus.loading ? 'Syncing...' : 'Sync Data to Atlas'}
            </button>
          </div>

          {syncStatus.message && (
            <div className={`p-3 rounded-lg border text-[11px] ${
              syncStatus.success ? 'bg-green-50 text-green-900 border-green-200' : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              {syncStatus.message}
            </div>
          )}
        </div>

        {/* MongoDB Atlas Quick Setup Guide */}
        <div className="bg-[#FAF8F5] border border-[#EAE4DC] p-4 rounded-xl space-y-2">
          <span className="font-bold text-[#1E1E24] text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> How to get your MongoDB Atlas Credentials:
          </span>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600 leading-relaxed">
            <li>Log in to <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer" className="text-[#9E8055] font-bold underline">MongoDB Atlas</a> and create a free <strong>M0 Cluster</strong>.</li>
            <li>Go to <strong>Security &gt; Database Access</strong> and create a Database User with password (e.g. <code>sasa_admin</code>).</li>
            <li>Go to <strong>Security &gt; Network Access</strong> and click <strong>Add IP Address &gt; Allow Access from Anywhere (0.0.0.0/0)</strong> so your server can connect.</li>
            <li>Go to <strong>Database &gt; Connect &gt; Drivers (Node.js)</strong> and copy your connection string (replace <code>&lt;password&gt;</code> with your actual user password and add <code>/sasaofficial</code> before the <code>?</code>).</li>
          </ol>
        </div>
      </div>

      {/* Official Order Notifications & Hostinger Email Section */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
              <Mail className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#222]">
                Official Email & Hostinger Order Notifications
              </h3>
              <span className="text-[11px] text-gray-500">Instant email alerts on new customer checkout orders</span>
            </div>
          </div>
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

        {/* Environment Variables Quick-Copy Box */}
        <div className="bg-[#1E1E24] text-[#E0E0E0] p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#D4AF37] font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Production .env Environment Variables (Click to Copy)
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

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-[#222]">Official Instagram Profile URL</label>
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#9E8055] hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    Open Profile ↗
                  </a>
                )}
              </div>
              <input
                type="url"
                required
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/sasaofficial.pk?igsh=MXhhZmJwNzR1M3FucA=="
                className="w-full px-3 py-2 border rounded bg-white font-mono text-xs"
              />
              <span className="text-[10px] text-gray-400">
                Connected handle: <strong>@sasaofficial.pk</strong> (displayed in footer, gallery, and contact desk)
              </span>
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

