import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Pill, Search, CheckCircle, Clock, AlertTriangle, Package, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PharmacistDashboard() {
  const { currentUser, prescriptions, users, updatePrescriptionStatus } = useAppContext();
  const [activeTab, setActiveTab] = useState<'pending' | 'dispensed' | 'inventory'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed');

  const filteredPending = pendingPrescriptions.filter(rx => {
    const patient = users.find(u => u.id === rx.patientId);
    const doctor = users.find(u => u.id === rx.doctorId);
    return (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (rx.medications || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredDispensed = dispensedPrescriptions.filter(rx => {
    const patient = users.find(u => u.id === rx.patientId);
    const doctor = users.find(u => u.id === rx.doctorId);
    return (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (rx.medications || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDispensePrescription = async (prescriptionId: string) => {
    try {
      await updatePrescriptionStatus(prescriptionId, 'dispensed', currentUser.id);
      toast.success('Prescription dispensed successfully');
    } catch (error) {
      toast.error('Failed to dispense prescription');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pharmacist Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage prescriptions and medication dispensing</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Pill className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-900">{currentUser.name}</p>
            <p className="text-slate-500">Pharmacist</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-amber-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{pendingPrescriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Dispensed Today</p>
              <p className="text-2xl font-bold text-slate-900">
                {dispensedPrescriptions.filter(rx => {
                  const today = new Date().toDateString();
                  return rx.dispensedAt && new Date(rx.dispensedAt).toDateString() === today;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-slate-900">{prescriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Urgent</p>
              <p className="text-2xl font-bold text-slate-900">
                {pendingPrescriptions.filter(rx => {
                  // Consider prescriptions older than 24 hours as urgent
                  const prescriptionDate = new Date(rx.date);
                  const now = new Date();
                  const hoursDiff = (now.getTime() - prescriptionDate.getTime()) / (1000 * 60 * 60);
                  return hoursDiff > 24;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Pending ({pendingPrescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('dispensed')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'dispensed'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Dispensed ({dispensedPrescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Inventory
            </button>
          </div>

          {(activeTab === 'pending' || activeTab === 'dispensed') && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {filteredPending.map(rx => {
              const patient = users.find(u => u.id === rx.patientId);
              const doctor = users.find(u => u.id === rx.doctorId);
              const isUrgent = (() => {
                const prescriptionDate = new Date(rx.date);
                const now = new Date();
                const hoursDiff = (now.getTime() - prescriptionDate.getTime()) / (1000 * 60 * 60);
                return hoursDiff > 24;
              })();

              return (
                <div key={rx.id} className={`bg-white rounded-xl shadow-sm border p-6 ${isUrgent ? 'border-red-200 bg-red-50/50' : 'border-slate-200'}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{patient?.name || 'Unknown Patient'}</h3>
                          <p className="text-sm text-slate-500">Prescribed by Dr. {doctor?.name || 'Unknown'}</p>
                        </div>
                        {isUrgent && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-slate-800 font-medium whitespace-pre-wrap">{rx.medications}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Prescribed on {new Date(rx.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleDispensePrescription(rx.id)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Dispense
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredPending.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">All caught up!</h3>
                <p className="mt-1 text-sm text-slate-500">No pending prescriptions to dispense.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dispensed' && (
          <div className="space-y-4">
            {filteredDispensed.map(rx => {
              const patient = users.find(u => u.id === rx.patientId);
              const doctor = users.find(u => u.id === rx.doctorId);
              const pharmacist = users.find(u => u.id === rx.dispensedBy);

              return (
                <div key={rx.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{patient?.name || 'Unknown Patient'}</h3>
                          <p className="text-sm text-slate-500">Prescribed by Dr. {doctor?.name || 'Unknown'}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Dispensed
                        </span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-slate-800 font-medium whitespace-pre-wrap">{rx.medications}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span>Prescribed: {new Date(rx.date).toLocaleDateString()}</span>
                        <span>Dispensed: {rx.dispensedAt ? new Date(rx.dispensedAt).toLocaleDateString() : 'Unknown'}</span>
                        <span>By: {pharmacist?.name || 'Unknown Pharmacist'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredDispensed.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No dispensed prescriptions</h3>
                <p className="mt-1 text-sm text-slate-500">Dispensed prescriptions will appear here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Inventory Management</h3>
            <p className="mt-1 text-sm text-slate-500">Medication inventory tracking coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}