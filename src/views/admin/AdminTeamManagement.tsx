import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminUser } from '../../types';
import {
  ShieldCheck, UserPlus, Trash2, Edit3, Key, Mail, UserCheck,
  CheckCircle, AlertTriangle, Lock, Eye, EyeOff, ShieldAlert
} from 'lucide-react';

export const AdminTeamManagement: React.FC = () => {
  const {
    adminUsers, currentAdmin, addAdminUser, updateAdminUser, removeAdminUser
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'super_admin' | 'catalog_manager' | 'order_manager' | 'marketing_manager'>('catalog_manager');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('catalog_manager');
    setStatus('active');
    setShowPassword(false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword(u.password || '');
    setRole(u.role);
    setStatus(u.status);
    setShowPassword(false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Name and Email are required.');
      return;
    }

    if (!editingUser && !password.trim()) {
      setErrorMessage('Password is required for new admin user.');
      return;
    }

    // Check duplicate email
    const duplicate = adminUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== editingUser?.id);
    if (duplicate) {
      setErrorMessage('An admin with this email address already exists.');
      return;
    }

    if (editingUser) {
      updateAdminUser({
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        role,
        status,
        ...(password.trim() ? { password: password.trim() } : {})
      });
    } else {
      addAdminUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        status
      });
    }

    setIsModalOpen(false);
  };

  const handleRemove = (user: AdminUser) => {
    if (adminUsers.length <= 1) {
      alert('Cannot remove the last administrator account.');
      return;
    }

    if (user.role === 'super_admin') {
      const superAdminCount = adminUsers.filter(u => u.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        alert('Cannot remove the sole Super Admin of the portal. Assign another user Super Admin privileges first.');
        return;
      }
    }

    if (window.confirm(`Are you sure you want to permanently remove administrator "${user.name}" (${user.email})?`)) {
      removeAdminUser(user.id);
    }
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'super_admin': return { label: 'Super Admin', color: 'bg-[#222] text-[#D4AF37] border-[#D4AF37]' };
      case 'catalog_manager': return { label: 'Catalog Manager', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'order_manager': return { label: 'Order Dispatcher', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'marketing_manager': return { label: 'Marketing Lead', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      default: return { label: 'Administrator', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in bg-white min-h-screen">
      
      {/* Header & Add User Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE4DC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#222]">Admin Team & User Access</h2>
            <span className="px-2.5 py-0.5 bg-[#222] text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#D4AF37]">
              {adminUsers.length} Admins
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Grant secure portal access, add executive staff or team managers, configure granular roles, and remove credentials.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#222222] hover:bg-[#8B5E34] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition flex items-center gap-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Admin User</span>
        </button>
      </div>

      {/* Security & Access Route Notice */}
      <div className="p-4 bg-[#F5F1EC] rounded-xl border border-[#EAE4DC] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#8B5E34] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#222] space-y-1">
          <p className="font-bold text-sm">Protected Admin Portal URL</p>
          <p className="text-gray-600 leading-relaxed">
            The administrator panel is isolated and strictly accessed via <strong className="font-mono text-[#222]">https://sasaofficial.com/sasa/admin</strong>. Public visitors cannot see admin options or controls across the website.
          </p>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-xl border border-[#EAE4DC] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1E1E24] text-[#D5D5D5] uppercase text-[10px] tracking-wider border-b border-[#2E2E38]">
              <th className="p-3.5">Administrator</th>
              <th className="p-3.5">Email / Login</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Access Status</th>
              <th className="p-3.5">Last Active</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE4DC]">
            {adminUsers.map(user => {
              const roleInfo = getRoleLabel(user.role);
              const isSelf = currentAdmin?.id === user.id || currentAdmin?.email === user.email;

              return (
                <tr key={user.id} className="hover:bg-amber-50/20 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1E1E24] text-[#D4AF37] font-serif font-bold text-sm flex items-center justify-center border border-[#D4AF37] shadow-2xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#222]">{user.name}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 bg-[#F5F1EC] text-[#8B5E34] text-[9px] font-bold rounded border border-[#EAE4DC]">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">Added: {user.createdAt}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {user.status === 'active' ? '● Active' : '○ Suspended'}
                    </span>
                  </td>

                  <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                    {user.lastLogin || 'Recent session'}
                  </td>

                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1.5 text-gray-500 hover:text-black rounded hover:bg-gray-100 transition"
                      title="Edit Admin User"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRemove(user)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                      title="Remove Admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Admin User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#EAE4DC] max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#222]">
                  {editingUser ? 'Edit Admin User' : 'Add New Admin User'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Assign administrative role and login credentials.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black p-1">
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-[#222] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-medium focus:ring-1 focus:ring-[#8B5E34]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#222] mb-1">Email Address (Login Username) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. manager@sasaofficial.com"
                  className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-medium focus:ring-1 focus:ring-[#8B5E34]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-[#222]">
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#8B5E34] hover:underline flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong password..."
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-mono focus:ring-1 focus:ring-[#8B5E34]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#222] mb-1">Admin Privilege Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222] focus:ring-1 focus:ring-[#8B5E34]"
                >
                  <option value="super_admin">Super Admin (Full Administrative Authority)</option>
                  <option value="catalog_manager">Catalog Manager (Products, Collections, Inventory)</option>
                  <option value="order_manager">Order Dispatcher (Orders, Tracking, Customers)</option>
                  <option value="marketing_manager">Marketing Lead (Sales Campaigns, Banners, Coupons)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#222] mb-1">Account Status</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === 'active'}
                      onChange={() => setStatus('active')}
                      className="text-[#8B5E34]"
                    />
                    <span className="font-semibold text-green-700">Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={status === 'inactive'}
                      onChange={() => setStatus('inactive')}
                      className="text-[#8B5E34]"
                    />
                    <span className="font-semibold text-gray-500">Suspended</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#222222] hover:bg-[#8B5E34] text-white font-semibold rounded-lg uppercase tracking-wider transition shadow-sm"
                >
                  {editingUser ? 'Update Admin' : 'Save Admin User'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
