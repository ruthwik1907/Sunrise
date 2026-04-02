import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, Bell, Shield, Key, Smartphone, Mail, Save, Camera, Calendar, FileText, Loader2 } from 'lucide-react';

export default function Settings() {
  const { currentUser, uploadAvatar } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    await uploadAvatar(file);
    setIsUploading(false);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="h-5 w-5" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell className="h-5 w-5" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'security' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield className="h-5 w-5" />
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === 'profile' && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Profile Picture</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm" />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <User className="h-10 w-10 text-indigo-600" />
                      </div>
                    )}
                    <button className="absolute bottom-0 right-0 h-8 w-8 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/jpeg,image/png,image/gif" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors flex items-center"
                    >
                      {isUploading ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Uploading...</> : 'Change Picture'}
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" defaultValue={currentUser.name} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" defaultValue={currentUser.email} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" defaultValue="1985-06-15" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <textarea rows={3} defaultValue="123 Main St, Apt 4B&#10;New York, NY 10001" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h2>
                <p className="text-sm text-slate-500 mb-6">Choose how you want to be notified about your appointments, test results, and messages.</p>
                
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-indigo-50 p-2 rounded-lg text-indigo-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Appointment Reminders</h3>
                        <p className="text-sm text-slate-500">Receive reminders for upcoming appointments.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                        <span className="text-sm text-slate-600">Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                        <span className="text-sm text-slate-600">SMS</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-emerald-50 p-2 rounded-lg text-emerald-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Test Results</h3>
                        <p className="text-sm text-slate-500">Get notified when new lab results are available.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                        <span className="text-sm text-slate-600">Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                        <span className="text-sm text-slate-600">SMS</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Direct Messages</h3>
                        <p className="text-sm text-slate-500">Notifications for messages from your doctors.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                        <span className="text-sm text-slate-600">Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                        <span className="text-sm text-slate-600">SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div className="pt-2">
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                      <Key className="h-4 w-4 mr-2" />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Authenticator App</h3>
                      <p className="text-xs text-slate-500">Not configured</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
                    Setup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
