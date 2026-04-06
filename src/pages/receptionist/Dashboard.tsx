import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  Calendar, Users, Clock, CheckCircle, XCircle, UserPlus, Search,
  Phone, Mail, Hash, ClipboardList, Stethoscope, AlertCircle, X, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'queue' | 'checkin' | 'walkin' | 'opd' | 'doctors' | 'checkout' | 'labs';

export default function ReceptionistDashboard() {
  const { currentUser, appointments, users, updateAppointmentStatus, createAppointment, createWalkInPatient, bedBookings, equipmentBookings, beds, equipment, generateServiceInvoice, labRequests } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  if (!currentUser) return null;

  const today = new Date().toDateString();
  const todayApts = appointments
    .filter(a => new Date(a.date).toDateString() === today)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const pendingApts = todayApts.filter(a => a.status === 'pending');
  const confirmedApts = todayApts.filter(a => a.status === 'confirmed');
  const completedToday = todayApts.filter(a => a.status === 'completed');
  const checkedInApts = todayApts.filter(a => a.checkInTime);
  const waitingApts = todayApts.filter(a => a.checkInTime && a.status !== 'completed' && a.status !== 'cancelled');

  const doctors = users.filter(u => u.role === 'doctor');

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status}`);
    } catch { toast.error('Failed to update appointment'); }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'confirmed');
      toast.success('Patient checked in successfully!');
    } catch { toast.error('Failed to check in patient'); }
  };

  const printOPD = () => {
    const content = todayApts.map((a, i) => {
      const patient = users.find(u => u.id === a.patientId);
      const doctor = users.find(u => u.id === a.doctorId);
      return `${i + 1}. ${patient?.name || 'Unknown'} | Dr. ${doctor?.name} | ${a.time} | ${a.reason || '-'} | ${a.status}`;
    }).join('\n');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre style="font-family:monospace;padding:20px">
Sunrise Hospital — OPD Daily Register
Date: ${new Date().toLocaleDateString()}
${'─'.repeat(70)}
${content}
${'─'.repeat(70)}
Total Patients: ${todayApts.length}
</pre>`);
      win.print();
    }
  };

  const filtered = todayApts.filter(a => {
    const patient = users.find(u => u.id === a.patientId);
    const doctor = users.find(u => u.id === a.doctorId);
    return (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'queue', label: 'Token Queue', count: todayApts.length },
    { id: 'checkin', label: 'Check-In', count: waitingApts.length },
    { id: 'walkin', label: 'Walk-in / New Appt' },
    { id: 'opd', label: 'OPD Register', count: todayApts.length },
    { id: 'doctors', label: 'Doctor Availability', count: doctors.length },
    { id: 'checkout', label: 'Clinical Checkout', count: bedBookings.filter(b => b.status === 'active').length + equipmentBookings.filter(b => b.status === 'active').length },
    { id: 'labs', label: 'Laboratory Hub', count: labRequests.filter(r => r.status !== 'completed').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Receptionist Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Patient coordination, queue & appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-900">{currentUser.name}</p>
            <p className="text-slate-500">Receptionist</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Patients", value: todayApts.length, icon: Calendar, color: 'indigo' },
          { label: 'Waiting', value: waitingApts.length, icon: Clock, color: 'amber' },
          { label: 'Completed', value: completedToday.length, icon: CheckCircle, color: 'emerald' },
          { label: 'Pending Confirm', value: pendingApts.length, icon: AlertCircle, color: 'red' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 text-${color}-600`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── TOKEN QUEUE ── */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Search by patient, doctor or reason..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">No appointments today</h3>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Token', 'Patient', 'Doctor', 'Time', 'Reason', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filtered.map((apt, idx) => {
                        const patient = users.find(u => u.id === apt.patientId);
                        const doctor = users.find(u => u.id === apt.doctorId);
                        const statusColors: Record<string, string> = {
                          pending: 'bg-amber-50 text-amber-700',
                          confirmed: 'bg-blue-50 text-blue-700',
                          completed: 'bg-emerald-50 text-emerald-700',
                          cancelled: 'bg-red-50 text-red-700',
                        };
                        return (
                          <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                {idx + 1}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{patient?.name || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">{patient?.phone || 'No phone'}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">Dr. {doctor?.name || 'Unknown'}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{apt.time || '—'}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 max-w-32 truncate">{apt.reason || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[apt.status] || 'bg-slate-100 text-slate-600'}`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {apt.status === 'pending' && (
                                  <>
                                    <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                                      Confirm
                                    </button>
                                    <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors">
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {apt.status === 'confirmed' && (
                                  <button onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                    Complete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CHECK-IN ── */}
          {activeTab === 'checkin' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Mark patients as arrived when they physically walk in to the hospital.</p>
              {todayApts.filter(a => a.status === 'pending' || a.status === 'confirmed').length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">All patients processed</h3>
                </div>
              ) : (
                todayApts.filter(a => a.status === 'pending' || a.status === 'confirmed').map((apt, idx) => {
                  const patient = users.find(u => u.id === apt.patientId);
                  const doctor = users.find(u => u.id === apt.doctorId);
                  return (
                    <div key={apt.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{patient?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">Dr. {doctor?.name} · {apt.time} · {apt.reason || 'General'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.status === 'pending' && (
                          <button onClick={() => handleCheckIn(apt.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
                            <CheckCircle className="h-4 w-4" /> Check In
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> Checked In
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── WALK-IN / NEW APPOINTMENT ── */}
          {activeTab === 'walkin' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm font-medium text-indigo-800">Register a walk-in patient or create an appointment for an existing patient.</p>
              </div>
              <button onClick={() => setShowNewAppointment(true)}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                <UserPlus className="h-4 w-4" /> New Appointment / Walk-in
              </button>
            </div>
          )}

          {/* ── OPD REGISTER ── */}
          {activeTab === 'opd' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">OPD Daily Register</h2>
                  <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <button onClick={printOPD}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                  <Printer className="h-4 w-4" /> Print Register
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['#', 'Patient', 'Phone', 'Doctor', 'Time', 'Reason', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {todayApts.map((apt, idx) => {
                      const patient = users.find(u => u.id === apt.patientId);
                      const doctor = users.find(u => u.id === apt.doctorId);
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">{patient?.name || 'Unknown'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{patient?.phone || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Dr. {doctor?.name || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{apt.time || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{apt.reason || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                              apt.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                              apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>{apt.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {todayApts.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">No appointments today.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DOCTOR AVAILABILITY ── */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Live view of doctor schedules and appointment load today.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(doctor => {
                  const drApts = todayApts.filter(a => a.doctorId === doctor.id);
                  const drPending = drApts.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
                  const drDone = drApts.filter(a => a.status === 'completed').length;
                  const isBusy = drPending > 0;
                  return (
                    <div key={doctor.id} className={`rounded-xl border p-5 ${isBusy ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                          {doctor.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">Dr. {doctor.name}</p>
                          <p className="text-xs text-slate-500 truncate">{doctor.specialization || doctor.department || doctor.departmentId || 'General'}</p>
                        </div>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isBusy ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isBusy ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          {isBusy ? 'Busy' : 'Free'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white rounded-lg p-2 border border-slate-100">
                          <p className="font-bold text-slate-900 text-base">{drApts.length}</p>
                          <p className="text-slate-500">Total</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-slate-100">
                          <p className="font-bold text-amber-600 text-base">{drPending}</p>
                          <p className="text-slate-500">Waiting</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-slate-100">
                          <p className="font-bold text-emerald-600 text-base">{drDone}</p>
                          <p className="text-slate-500">Done</p>
                        </div>
                      </div>
                      {drApts.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {drApts.slice(0, 3).map(a => {
                            const patient = users.find(u => u.id === a.patientId);
                            return (
                              <div key={a.id} className="flex items-center justify-between text-xs text-slate-600">
                                <span>{patient?.name || 'Unknown'}</span>
                                <span className="text-slate-400">{a.time}</span>
                              </div>
                            );
                          })}
                          {drApts.length > 3 && <p className="text-xs text-slate-400">+{drApts.length - 3} more</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {doctors.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-slate-500 text-sm">No doctors registered.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <NewAppointmentModal
          onClose={() => setShowNewAppointment(false)}
          onCreate={createAppointment}
          onCreateWalkInPatient={createWalkInPatient}
          users={users}
        />
      )}
    </div>
  );
}

function NewAppointmentModal({ onClose, onCreate, onCreateWalkInPatient, users }: {
  onClose: () => void;
  onCreate: (appointment: any) => Promise<void>;
  onCreateWalkInPatient: (data: any) => Promise<any>;
  users: any[];
}) {
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', date: '', time: '', reason: '',
    patientName: '', patientEmail: '', patientPhone: ''
  });

  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let patientId = formData.patientId;
      if (isNewPatient) {
        if (!formData.patientName) { toast.error('Enter patient name'); return; }
        const newPt = await onCreateWalkInPatient({ name: formData.patientName, email: formData.patientEmail, phone: formData.patientPhone, role: 'patient' });
        patientId = newPt.id;
        toast.success('New patient registered!');
      } else if (!patientId) { toast.error('Select a patient'); return; }
      if (!formData.doctorId || !formData.date || !formData.time) { toast.error('Fill all required fields'); return; }
      await onCreate({ patientId, doctorId: formData.doctorId, date: formData.date, time: formData.time, reason: formData.reason, status: 'pending' });
      toast.success('Appointment created!');
      onClose();
    } catch { toast.error('Failed to create appointment'); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">New Appointment</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['Existing Patient', 'Walk-in / New'].map((label, i) => (
              <button key={label} type="button" onClick={() => setIsNewPatient(i === 1)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isNewPatient === (i === 1) ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}>{label}</button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isNewPatient ? (
              <div className="space-y-3">
                {[
                  { label: 'Patient Name *', key: 'patientName', type: 'text', placeholder: 'Full name', required: true },
                  { label: 'Email', key: 'patientEmail', type: 'email', placeholder: 'Email (optional)' },
                  { label: 'Phone', key: 'patientPhone', type: 'tel', placeholder: 'Phone (optional)' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
                    <input type={f.type} value={(formData as any)[f.key]} placeholder={f.placeholder} required={f.required}
                      onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Patient *</label>
                <select value={formData.patientId} onChange={e => setFormData(p => ({ ...p, patientId: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select patient...</option>
                  {patients.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor *</label>
              <select value={formData.doctorId} onChange={e => setFormData(p => ({ ...p, doctorId: e.target.value }))} required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select doctor...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
                <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Time *</label>
                <input type="time" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Reason</label>
              <textarea value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} rows={2} placeholder="Reason for visit..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
