import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Smartphone, Mail, Save, Building, Globe, Database, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { currentUser, users, createAdminUser, updateAdminUser, deleteUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', phone: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const admins = users.filter(u => u.role === 'admin');

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage hospital platform configurations and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-4 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'general' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building className={`h-5 w-5 ${activeTab === 'general' ? 'text-indigo-600' : 'text-slate-400'}`} />
            General Settings
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'security' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield className={`h-5 w-5 ${activeTab === 'security' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Security & Access
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'notifications' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell className={`h-5 w-5 ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-slate-400'}`} />
            System Notifications
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'integrations' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Globe className={`h-5 w-5 ${activeTab === 'integrations' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Integrations
          </button>
          
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'admins' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className={`h-5 w-5 ${activeTab === 'admins' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Admin Management
          </button>
          
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'database' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Database className={`h-5 w-5 ${activeTab === 'database' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Database & Backups
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-slate-900">General Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Configure basic hospital information and platform defaults.</p>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Hospital Name</label>
                    <input 
                      type="text" 
                      defaultValue="City General Hospital"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Contact Email</label>
                    <input 
                      type="email" 
                      defaultValue="admin@citygeneral.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <input 
                      type="tel" 
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Timezone</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm appearance-none">
                      <option>Pacific Time (PT)</option>
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Hospital Address</label>
                  <textarea 
                    rows={3}
                    defaultValue="123 Medical Center Blvd, Health City, HC 90210"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Security & Access</h2>
                <p className="text-sm text-slate-500 mt-1">Manage platform security policies and access controls.</p>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-indigo-600">
                      <Key className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900">Password Policy</h3>
                      <p className="text-sm text-slate-500 mt-1 mb-4">Enforce strong passwords for all staff accounts.</p>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                          <span className="text-sm text-slate-700">Require minimum 12 characters</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                          <span className="text-sm text-slate-700">Require numbers and special characters</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                          <span className="text-sm text-slate-700">Force password reset every 90 days</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-indigo-600">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
                        <p className="text-sm text-slate-500 mt-1">Require 2FA for all administrative accounts.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-slate-900">System Notifications</h2>
                <p className="text-sm text-slate-500 mt-1">Configure automated alerts and system-wide notifications.</p>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Patient Alerts</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Appointment Reminders</p>
                      <p className="text-xs text-slate-500 mt-0.5">Send automated SMS/Email 24h before appointment</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Lab Results Ready</p>
                      <p className="text-xs text-slate-500 mt-0.5">Notify patients when new lab results are available</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Admin Alerts</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">System Errors</p>
                      <p className="text-xs text-slate-500 mt-0.5">Receive immediate alerts for critical system failures</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Admin Management</h2>
                  <p className="text-sm text-slate-500 mt-1">Create and manage administrator accounts.</p>
                </div>
                <button 
                  onClick={() => setShowAddAdmin(!showAddAdmin)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin
                </button>
              </div>

              {showAddAdmin && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Admin</h3>
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={newAdmin.name}
                          onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={newAdmin.email}
                          onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                        <input 
                          type="tel" 
                          value={newAdmin.phone}
                          onChange={e => setNewAdmin({...newAdmin, phone: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <input 
                          type="password" 
                          required
                          value={newAdmin.password}
                          onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowAddAdmin(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
                      >
                        Create Admin
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={admin.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=random`} alt={admin.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{admin.name}</p>
                              <p className="text-xs text-slate-500">Administrator</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600">{admin.email}</div>
                          {admin.phone && <div className="text-xs text-slate-500 mt-0.5">{admin.phone}</div>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {currentUser?.id !== admin.id && (
                              <button 
                                onClick={() => setDeletingId(admin.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {admins.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No administrators found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeTab === 'integrations' || activeTab === 'database') && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500">
              <div className="bg-slate-50 p-6 rounded-full mb-6 border border-slate-100">
                {activeTab === 'integrations' ? (
                  <Globe className="h-12 w-12 text-slate-400" />
                ) : (
                  <Database className="h-12 w-12 text-slate-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon</h2>
              <p className="text-slate-500 max-w-md">
                This configuration module is currently under development and will be available in the next platform update.
              </p>
            </div>
          )}
        </div>
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Administrator?</h3>
              <p className="text-sm text-slate-500 text-center">Are you sure you want to delete this admin? This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAdmin}
                  className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
