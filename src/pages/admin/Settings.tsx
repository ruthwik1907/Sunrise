import React, { useState, useEffect } from 'react';
import { useAppContext, User, HospitalSettings, AuditLog } from '../../context/AppContext';
import { 
  Settings as SettingsIcon, User as UserIcon, Bell, Shield, Key, Smartphone, Mail, 
  Save, Building, Globe, Database, Users, Plus, Edit2, Trash2, CheckCircle2, 
  History, ClipboardList, Search, Filter, Calendar as CalendarIcon, Clock,
  Activity, UserPlus, ChevronRight, AlertTriangle, Lock, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminSettings() {
  const { currentUser, users, createAdminUser, deleteUser, hospitalSettings, updateHospitalSettings, auditLogs, purgeCollection } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', phone: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for audit log filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  // Unified form state matching the interface exactly
  const [formSettings, setFormSettings] = useState<HospitalSettings>(hospitalSettings || {
    name: 'Sunrise Hospital',
    email: 'contact@sunrisehospital.com',
    phone: '+91 98765 43210',
    address: '123 Healthcare Way, Medical District, Hyderabad, India',
    gstNumber: '29AAAAA0000A1Z5',
    currency: 'INR',
    theme: 'light',
    notifications: {
      email: true,
      sms: true,
      appointments: true,
      labResults: true,
      systemErrors: true,
    },
    security: {
      minPasswordLength: 12,
      requireSpecialChars: true,
      forcePasswordResetDays: 90,
      twoFactorAuth: false,
    }
  });

  useEffect(() => {
    if (hospitalSettings) {
      setFormSettings(hospitalSettings);
    }
  }, [hospitalSettings]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateHospitalSettings(formSettings);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const admins = users.filter((u: User) => u.role === 'admin' && !u.deleted);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminUser(newAdmin);
      setShowAddAdmin(false);
      setNewAdmin({ name: '', email: '', password: '', phone: '' });
      toast.success('Admin created successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create admin');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deletingId) return;
    try {
      await deleteUser(deletingId);
      toast.success('Admin deleted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete admin');
    } finally {
      setDeletingId(null);
    }
  };

  const updateNotifications = (key: keyof HospitalSettings['notifications']) => {
    setFormSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const updateSecurity = (key: keyof HospitalSettings['security'], value: any) => {
    setFormSettings((prev: HospitalSettings) => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  const filteredLogs = auditLogs
    .filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      return matchesSearch && matchesAction;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your hospital management platform and security policies.</p>
        </div>
        <button 
          onClick={() => handleSaveSettings()}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 bg-slate-50/50 border-r border-slate-100 p-6 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'general' 
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-500/10' 
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <Building className={`h-5 w-5 ${activeTab === 'general' ? 'text-indigo-600' : 'text-slate-400'}`} />
            General Information
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'security' 
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-500/10' 
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <Shield className={`h-5 w-5 ${activeTab === 'security' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Security & Access
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'notifications' 
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-500/10' 
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <Bell className={`h-5 w-5 ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'admins' 
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-500/10' 
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <Users className={`h-5 w-5 ${activeTab === 'admins' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Admin Users
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'audit' 
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-500/10' 
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <History className={`h-5 w-5 ${activeTab === 'audit' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Audit Logs
          </button>

          <div className="h-px bg-slate-200 my-4 mx-2 hidden md:block"></div>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'integrations' 
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-500/10' 
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <Globe className={`h-5 w-5 ${activeTab === 'integrations' ? 'text-indigo-600' : 'text-slate-400'}`} />
            API & Integrations
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'maintenance' 
                ? 'bg-red-50 text-red-700 shadow-md shadow-red-100/50 ring-1 ring-red-500/10' 
                : 'text-slate-600 hover:bg-red-50/50 hover:text-red-600 transition-colors'
            }`}
          >
            <Database className={`h-5 w-5 ${activeTab === 'maintenance' ? 'text-red-600' : 'text-slate-400'}`} />
            Database Maintenance
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                  <Building className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">General Information</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure your hospital's basic information and GST details.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-8 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Hospital Name</label>
                    <input 
                       type="text" 
                       value={formSettings.name}
                       onChange={(e) => setFormSettings({...formSettings, name: e.target.value})}
                       className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                       placeholder="Sunrise Hospital"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Contact Email</label>
                    <input 
                      type="email" 
                      value={formSettings.email}
                      onChange={(e) => setFormSettings({...formSettings, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Phone</label>
                    <input 
                      type="tel" 
                      value={formSettings.phone}
                      onChange={(e) => setFormSettings({...formSettings, phone: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">GST Registration No.</label>
                    <input 
                      type="text" 
                      value={formSettings.gstNumber}
                      onChange={(e) => setFormSettings({...formSettings, gstNumber: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Address</label>
                  <textarea 
                    rows={4}
                    value={formSettings.address}
                    onChange={(e) => setFormSettings({...formSettings, address: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium resize-none"
                  />
                </div>

                <button type="submit" className="hidden">Submit</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-100/50">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Security & Access Control</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure password policies and secure access protocols.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 max-w-3xl">
                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 border-dashed">
                  <div className="flex items-start gap-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-indigo-600">
                      <Key className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">Password Policy</h3>
                      <p className="text-sm text-slate-500 mt-1 mb-8">Set complexity requirements for system users.</p>
                      
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <div>
                               <p className="text-sm font-bold text-slate-800">Require Special Characters</p>
                               <p className="text-xs text-slate-500">At least one @, #, $ symbol</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                type="checkbox" 
                                checked={formSettings.security.requireSpecialChars}
                                onChange={() => updateSecurity('requireSpecialChars', !formSettings.security.requireSpecialChars)}
                                className="sr-only peer" 
                                />
                                <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                         </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min Length</label>
                            <input 
                              type="number" 
                              value={formSettings.security.minPasswordLength}
                              onChange={(e) => updateSecurity('minPasswordLength', parseInt(e.target.value))}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reset (Days)</label>
                            <input 
                              type="number" 
                              value={formSettings.security.forcePasswordResetDays}
                              onChange={(e) => updateSecurity('forcePasswordResetDays', parseInt(e.target.value))}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 border-dashed">
                  <div className="flex items-start gap-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-indigo-600">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">2FA Enforcement</h3>
                        <p className="text-sm text-slate-500 mt-1">Force users to verify identities via mobile.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formSettings.security.twoFactorAuth}
                          onChange={() => updateSecurity('twoFactorAuth', !formSettings.security.twoFactorAuth)}
                          className="sr-only peer" 
                        />
                        <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                  <Bell className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Communication Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage system-wide notification preferences.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {[
                  { id: 'appointments', label: 'Appointment Alerts', icon: CalendarIcon, sub: 'Automatic reminders for upcoming slots' },
                  { id: 'labResults', label: 'Lab Results Notifier', icon: Activity, sub: 'Instant notification on report generation' },
                  { id: 'email', label: 'Global Email Relay', icon: Mail, sub: 'Primary switch for all system emails' },
                  { id: 'sms', label: 'SMS Notification Pool', icon: Smartphone, sub: 'Control outgoing phone alerts' },
                  { id: 'systemErrors', label: 'Critical Error logs', icon: ClipboardList, sub: 'Alert tech team on platform issues' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                           <Icon className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900">{item.label}</p>
                           <p className="text-[10px] text-slate-500 mt-0.5 max-w-[140px] truncate uppercase font-bold tracking-wider">{item.sub}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(formSettings.notifications as any)[item.id]}
                          onChange={() => updateNotifications(item.id as any)}
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold">Admin Management</h2>
                  <p className="text-slate-400 text-sm mt-1 max-w-sm">Securely manage users with administrative privileges across the platform.</p>
                </div>
                <button 
                  onClick={() => setShowAddAdmin(!showAddAdmin)}
                  className="relative z-10 px-6 py-3 bg-white text-slate-900 text-sm font-extrabold rounded-2xl shadow-xl transition-all hover:scale-[1.05] active:scale-[0.95]"
                >
                  {showAddAdmin ? 'Cancel Operation' : 'Provision New Admin'}
                </button>
                <div className="absolute top-0 right-0 h-full w-64 bg-indigo-600/20 blur-3xl -mr-20 -mt-20 rounded-full"></div>
              </div>

              {showAddAdmin && (
                <div className="bg-indigo-50/50 p-10 rounded-[2.5rem] border border-indigo-100 border-dashed animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Provision Administrator</h3>
                  </div>
                  
                  <form onSubmit={handleAddAdmin} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Full Operational Name</label>
                        <input 
                          type="text" 
                          required
                          value={newAdmin.name}
                          onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                          className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium"
                          placeholder="e.g. Dr. John Carter"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Secure Email</label>
                        <input 
                          type="email" 
                          required
                          value={newAdmin.email}
                          onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                          className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Initial Credential</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            required
                            value={newAdmin.password}
                            onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium pr-12"
                          />
                          <Key className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Phone</label>
                        <input 
                          type="tel" 
                          value={newAdmin.phone}
                          onChange={e => setNewAdmin({...newAdmin, phone: e.target.value})}
                          className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button 
                        type="submit"
                        className="px-10 py-3.5 bg-indigo-600 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Confirm Provisioning
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                  <div key={admin.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-50/50 hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-[1rem] bg-indigo-50 flex items-center justify-center text-indigo-700 font-extrabold text-lg">
                            {admin.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-slate-900 truncate">{admin.name}</h4>
                            <p className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-500">Administrator</p>
                        </div>
                        <button 
                            disabled={admin.id === currentUser?.id}
                            onClick={() => setDeletingId(admin.id)}
                            className="ml-auto p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 disabled:hidden"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-slate-500">
                             <Mail className="w-4 h-4" />
                             <span className="text-xs font-medium truncate">{admin.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                             <Smartphone className="w-4 h-4" />
                             <span className="text-xs font-medium">{admin.phone || 'No phone set'}</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Platform Audit Logs</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Tracking all administrative and clinical actions for compliance.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 w-full sm:w-64 transition-all"
                    />
                  </div>
                  <div className="relative">
                     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <select 
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 appearance-none transition-all"
                     >
                       <option value="all">All Actions</option>
                       <option value="create">Create</option>
                       <option value="update">Update</option>
                       <option value="delete">Delete</option>
                       <option value="login">Login</option>
                     </select>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                     <History className="h-12 w-12 text-slate-300" />
                     <p className="text-sm font-bold text-slate-400">No activity logs found matching your criteria</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="group bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                        log.action === 'create' ? 'bg-emerald-50 text-emerald-600' :
                        log.action === 'update' ? 'bg-blue-50 text-blue-600' :
                        log.action === 'delete' ? 'bg-red-50 text-red-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {log.action === 'create' ? <Plus className="w-5 h-5" /> : 
                         log.action === 'update' ? <Edit2 className="w-5 h-5" /> :
                         log.action === 'delete' ? <Trash2 className="w-5 h-5" /> :
                         <History className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-extrabold text-slate-900 truncate">{log.details || `Performed ${log.action} on ${log.module}`}</span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{log.module}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                           <div className="flex items-center gap-1.5">
                              <UserIcon className="h-3 w-3" />
                              <span className="text-slate-600">{log.userName}</span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-400 uppercase tracking-tight">{log.userRole}</span>
                           </div>
                           <div className="h-3 w-px bg-slate-100"></div>
                           <div className="flex items-center gap-1.5">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{format(new Date(log.timestamp), 'MMM dd, yyyy')}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(log.timestamp), 'HH:mm')}</span>
                           </div>
                        </div>
                      </div>

                      <button className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                  <Database className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">API & External Integrations</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage machine-to-machine connections and HIS synchronization.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* API Gateway Panel */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                          <Key className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold">API Gateway</h3>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Operational</span>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Master API Key</label>
                        <div className="flex items-center gap-2">
                           <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-slate-300 truncate">
                              ••••••••••••••••••••••••••••••••
                           </div>
                           <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                              <Search className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">Use this key for server-side HL7/FHIR integrations only. Never expose it in client-side code.</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700"></div>
                </div>

                {/* HIS Connector Status */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                          <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">HIS Connector</h3>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">Syncing...</span>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-700">HL7 v2.5 Engine</span>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase">Latency: 24ms</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
                            <span className="text-xs font-bold text-slate-700">FHIR R4 Endpoint</span>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase italic">Standby</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Webhooks Section */}
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-10 overflow-hidden relative">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <div>
                       <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Event Webhooks</h3>
                       <p className="text-sm text-slate-500 mt-1">Push clinical events to your external systems in real-time.</p>
                    </div>
                    <button className="px-6 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10">Configure New Hook</button>
                 </div>

                 <div className="space-y-3">
                    {[
                       { url: "https://his-sync.production.internal/hooks/v1", events: ["patient.register", "billing.complete"], active: true },
                       { url: "https://lab-results.external.com/api/webhooks", events: ["lab.completed"], active: true },
                       { url: "https://reports-analytics.hospital.org", events: ["invoice.paid"], active: false },
                    ].map((hook, i) => (
                       <div key={i} className="flex items-center gap-6 p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${hook.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                             <Mail className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-900 truncate">{hook.url}</span>
                                {!hook.active && <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[8px] font-black uppercase rounded tracking-wider">Muted</span>}
                             </div>
                             <div className="flex gap-2 mt-1.5 overflow-x-auto no-scrollbar pb-1">
                                {hook.events.map(ev => (
                                   <span key={ev} className="px-2 py-0.5 bg-indigo-50 text-indigo-600/60 text-[9px] font-black uppercase rounded-lg border border-indigo-100/50 whitespace-nowrap">{ev}</span>
                                ))}
                             </div>
                          </div>
                          <button className="p-3 text-slate-300 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100">
                             <SettingsIcon className="w-4 h-4" />
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-md w-full p-10 animate-in zoom-in-95 duration-200 text-center">
            <div className="h-20 w-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">Revoke Admin Access?</h3>
            <p className="text-slate-500 mt-3 font-medium px-4">This will immediately suspend all administrative privileges for this account. Recovery requires manual restoration by another admin.</p>
            <div className="mt-10 flex flex-col gap-3">
              <button 
                onClick={handleDeleteAdmin}
                className="w-full py-4 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-[0.98]"
              >
                Yes, Revoke Access
              </button>
              <button 
                onClick={() => setDeletingId(null)}
                className="w-full py-4 text-sm font-extrabold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MaintenanceTab({ purgeCollection }: { purgeCollection: (name: string) => Promise<number> }) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [targetCollection, setTargetCollection] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const collections = [
    { id: 'appointments', name: 'Appointments', count: 'All history' },
    { id: 'auditLogs', name: 'Audit Logs', count: 'System tracking' },
    { id: 'bills', name: 'Pharmacy Bills', count: 'Finance records' },
    { id: 'prescriptions', name: 'Prescriptions', count: 'Medical orders' },
    { id: 'medicalRecords', name: 'Medical Records', count: 'Patient history' },
    { id: 'bedBookings', name: 'Bed Occupancy', count: 'In-patient data' },
    { id: 'equipmentBookings', name: 'Equipment Usage', count: 'Resource logs' },
    { id: 'inventory', name: 'Inventory Stocks', count: 'Pharmacy/Lab' },
    { id: 'users', name: 'User Directory', count: 'Patients/Staff (Safeguarded)', caution: true },
    { id: 'beds', name: 'Bed Registry', count: 'Infrastructure', caution: true },
    { id: 'equipment', name: 'Equipment Registry', count: 'Medical devices', caution: true },
    { id: 'departments', name: 'Clinical Departments', count: 'Core structure', caution: true },
    { id: 'doctorSchedules', name: 'Doctor Rosters', count: 'Shift data' },
  ];

  const handlePurge = async () => {
    if (!targetCollection) return;
    
    const secret = import.meta.env.VITE_ADMIN_PURGE_PASSWORD;
    if (!secret) {
      toast.error('Maintenance secret not configured in system environment.');
      return;
    }

    if (password !== secret) {
      toast.error('Invalid maintenance password. Access denied.');
      return;
    }

    setIsPurging(true);
    try {
      await purgeCollection(targetCollection);
      setTargetCollection(null);
      setPassword('');
    } catch (err) {
      // toast handled in context
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-100/50">
          <Database className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Database Maintenance</h2>
          <p className="text-sm text-slate-500 mt-1 uppercase font-black tracking-widest text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full inline-block">
            High Privileged Operations
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-2xl">
        <div className="flex gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900">Destructive Actions Ahead</h3>
            <p className="text-xs text-amber-700 leading-relaxed font-semibold">
              Purging a collection will permanently delete all records. This action cannot be undone. 
              Active sessions and data currently in memory across hospital terminals may become inconsistent.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => (
          <div key={col.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-red-50 transition-colors">
                <ClipboardList className={`h-5 w-5 ${col.caution ? 'text-red-500' : 'text-slate-400'}`} />
              </div>
              <button
                onClick={() => setTargetCollection(col.id)}
                className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all active:scale-95"
              >
                Purge
              </button>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{col.name}</h4>
            <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-tight">{col.count}</p>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {targetCollection && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verify Intent</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                You are about to purge all records from <span className="font-bold text-red-600 uppercase">{targetCollection}</span>.
                This operation requires the maintenance master password.
              </p>

              <div className="mt-8 space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="Enter Master Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-red-500 focus:ring-0 transition-all outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setTargetCollection(null)}
                    disabled={isPurging}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurge}
                    disabled={isPurging || !password}
                    className="flex-1 py-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isPurging ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Confirm Purge'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
