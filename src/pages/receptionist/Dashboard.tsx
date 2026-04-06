import React, { useState } from 'react';
import { useAppContext, User } from '../../context/AppContext';
import {
  Calendar, Users, Clock, CheckCircle, XCircle, UserPlus, Search,
  Phone, Mail, Hash, ClipboardList, Stethoscope, AlertCircle, X, Printer, Bed,
  LogOut, Wrench, ChevronRight, Activity, ArrowRight, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomSelect } from '../../components/ui/CustomSelect';

type TabType = 'queue' | 'checkin' | 'walkin' | 'opd' | 'doctors' | 'checkout' | 'labs';

export default function ReceptionistDashboard() {
  const { currentUser, appointments, users, updateAppointmentStatus, createAppointment, createWalkInPatient, bedBookings, equipmentBookings, beds, equipment, generateServiceInvoice, labRequests } = useAppContext();
  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [foundFamily, setFoundFamily] = useState<User[]>([]);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', date: new Date().toISOString().split('T')[0], time: '', reason: '',
    patientName: '', patientEmail: '', patientPhone: ''
  });

  const doctors = users.filter(u => u.role === 'doctor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let patientId = formData.patientId;
      if (isNewPatient) {
        if (!formData.patientName) { toast.error('Enter patient name'); setIsSubmitting(false); return; }
        const newPt = await createWalkInPatient({ 
          name: formData.patientName, 
          email: formData.patientEmail, 
          phone: formData.patientPhone, 
          role: 'patient' 
        });
        patientId = newPt.id;
        toast.success('New patient registered!');
      } else if (!patientId) { toast.error('Select a patient'); setIsSubmitting(false); return; }
      
      if (!formData.doctorId || !formData.date || !formData.time) { 
        toast.error('Fill all required fields'); 
        setIsSubmitting(false);
        return; 
      }
      
      await createAppointment({ 
        patientId, 
        doctorId: formData.doctorId, 
        date: formData.date, 
        time: formData.time, 
        reason: formData.reason, 
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        departmentId: users.find(u => u.id === formData.doctorId)?.departmentId || 'general'
      } as any);
      
      toast.success('Medical Token Authorized!');
      // Reset form
      setFormData({
        patientId: '', doctorId: '', date: new Date().toISOString().split('T')[0], time: '', reason: '',
        patientName: '', patientEmail: '', patientPhone: ''
      });
      setIsNewPatient(false);
      setGlobalSearch('');
      setFoundFamily([]);
      setShowNewAppointment(false);
    } catch { 
      toast.error('Failed to authorize token'); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toDateString();
  const todayApts = appointments
    .filter(a => new Date(a.date).toDateString() === today)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const pendingApts = todayApts.filter(a => a.status === 'pending');
  const confirmedApts = todayApts.filter(a => a.status === 'confirmed');
  const completedToday = todayApts.filter(a => a.status === 'completed');
  const checkedInApts = todayApts.filter(a => a.checkInTime);
  const waitingApts = todayApts.filter(a => a.checkInTime && a.status !== 'completed' && a.status !== 'cancelled');

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

  const labsQueueCount = labRequests.filter(r => r.status !== 'completed').length;
  const activeCheckouts = bedBookings.filter(b => b.status === 'active').length + equipmentBookings.filter(b => b.status === 'active').length;

  const tabs: { id: TabType; label: string; count?: number; icon: any }[] = [
    { id: 'queue', label: 'Token Queue', count: todayApts.length, icon: ClipboardList },
    { id: 'checkin', label: 'Check-In', count: pendingApts.length + confirmedApts.length, icon: Calendar },
    { id: 'walkin', label: 'Check-In Desk', icon: UserPlus },
    { id: 'opd', label: 'OPD Register', count: todayApts.length, icon: Printer },
    { id: 'doctors', label: 'Physicians', count: doctors.length, icon: Stethoscope },
    { id: 'checkout', label: 'Release', count: activeCheckouts, icon: LogOut },
    { id: 'labs', label: 'Laboratories', count: labsQueueCount, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Receptionist Terminal</h1>
          <p className="text-slate-500 font-medium mt-1">Patient coordination, live queue & clinical desk management.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-black text-slate-900 uppercase tracking-tight">{currentUser.name}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Registrar</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Today's Intake", value: todayApts.length, icon: Calendar, color: 'indigo' },
          { label: 'Waiting Room', value: waitingApts.length, icon: Clock, color: 'amber' },
          { label: 'Clinical Completed', value: completedToday.length, icon: CheckCircle, color: 'emerald' },
          { label: 'Alert (Pending)', value: pendingApts.length, icon: AlertCircle, color: 'rose' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-50/50 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}>
                <Icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-lg text-[9px] ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-8">
          {/* ── TOKEN QUEUE ── */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Search live token system..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                </div>
                <div className="w-full sm:w-auto">
                   <button onClick={printOPD} className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-700 rounded-2xl hover:bg-slate-50 transition-all">
                      Daily PDF Registry
                   </button>
                </div>
              </div>
              
              {filtered.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-sm font-black text-slate-900 uppercase tracking-widest">No active clinical tokens</h3>
                  <p className="text-xs text-slate-400 mt-2">Create a new walk-in session from the check-in desk.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                      <tr>
                        {['# Token', 'Clinical Profile', 'Specialist', 'Schedule', 'Module', 'Registry', 'Command'].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filtered.map((apt, idx) => {
                        const patient = users.find(u => u.id === apt.patientId);
                        const doctor = users.find(u => u.id === apt.doctorId);
                        const statusColors: Record<string, string> = {
                          pending: 'bg-amber-50 text-amber-700 border-amber-100',
                          confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                          completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                          cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
                        };
                        return (
                          <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-slate-200">
                                {idx + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{patient?.name.split(' ')[0] || 'Guest'}</p>
                                <p className="text-[10px] font-bold text-slate-400">{patient?.phone || 'No Auth'}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                  <p className="text-xs font-bold text-slate-700 uppercase">Dr. {doctor?.name.split(' ')[0]}</p>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-tighter">{apt.time || 'NOW'}</td>
                            <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-32 truncate">{apt.reason || 'Symptomatic'}</td>
                            <td className="px-6 py-1">
                              <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[apt.status] || 'bg-slate-100 text-slate-600'}`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                {apt.status === 'pending' && (
                                  <>
                                    <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                      className="p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                      className="p-2 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                {apt.status === 'confirmed' && (
                                  <button onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                                    Release
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

          {/* ── CHECK-IN DESK ── */}
          {activeTab === 'walkin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Left: Discovery */}
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Search className="w-48 h-48 rotate-12" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Patient Discovery</h3>
                  <p className="text-slate-400 text-sm mb-8 font-medium">Identify existing medical files via MRN or Mobile.</p>
                  
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="MRN / Phone / Full Name..." 
                      value={globalSearch}
                      onChange={(e) => {
                        setGlobalSearch(e.target.value);
                        if (e.target.value.length >= 3) {
                          const query = e.target.value.toLowerCase();
                          const results = users.filter(u => 
                            u.role === 'patient' && 
                            ((u.phone || '').includes(query) || (u.id || '').toLowerCase().includes(query) || (u.name || '').toLowerCase().includes(query))
                          );
                          setFoundFamily(results);
                        } else {
                          setFoundFamily([]);
                        }
                      }}
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 backdrop-blur-xl transition-all font-bold text-lg"
                    />
                  </div>
                </div>

                {foundFamily.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {foundFamily.map(member => (
                      <div key={member.id} className="p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-700 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{member.name.split(' ')[0]}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">ID: {member.id.split('-')[0].toUpperCase()}</span>
                              <span className="text-[10px] font-black text-slate-400 tracking-widest">{member.phone || 'NO RECORD'}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setFormData(p => ({ ...p, patientId: member.id }));
                            setIsNewPatient(false);
                            toast.success(`Active: ${member.name.split(' ')[0]}`);
                          }}
                          className="p-4 bg-indigo-50 text-indigo-700 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : globalSearch.length >= 3 && (
                  <div className="p-16 text-center bg-slate-50/50 rounded-[2rem] border-4 border-dashed border-slate-100">
                    <UserPlus className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Zero Records Found</h4>
                    <p className="text-sm text-slate-400 font-medium mb-8">This patient requires a new clinical identity file.</p>
                    <button 
                      onClick={() => setIsNewPatient(true)}
                      className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-2xl shadow-indigo-100 transition-all"
                    >
                      Initialize New File
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Desk Form */}
              <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100/50 relative">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Clinical Desk</h3>
                       <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Medical Token Authorization</p>
                    </div>
                    <div className="flex p-1.5 bg-slate-100 rounded-2xl shadow-inner">
                       <button onClick={() => setIsNewPatient(false)} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isNewPatient ? 'bg-white text-indigo-700 shadow-xl' : 'text-slate-400'}`}>Registry</button>
                       <button onClick={() => setIsNewPatient(true)} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isNewPatient ? 'bg-white text-indigo-700 shadow-xl' : 'text-slate-400'}`}>Walk-in</button>
                    </div>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-8">
                    {isNewPatient ? (
                      <div className="space-y-5 animate-in fade-in duration-300">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Full Legal Name</label>
                           <input type="text" value={formData.patientName} onChange={e => setFormData(p => ({ ...p, patientName: e.target.value }))}
                             className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all" placeholder="Patient Full Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Mobile Number</label>
                              <input type="tel" value={formData.patientPhone} onChange={e => setFormData(p => ({ ...p, patientPhone: e.target.value }))}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all" placeholder="+91..." />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Email Access</label>
                              <input type="email" value={formData.patientEmail} onChange={e => setFormData(p => ({ ...p, patientEmail: e.target.value }))}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all" placeholder="patient@live.com" />
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-indigo-50/50 border-2 border-indigo-100 rounded-3xl flex items-center justify-between group cursor-default">
                         <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-100">
                               <Users className="h-7 w-7 text-white" />
                            </div>
                            <div>
                               <p className="text-xl font-black text-indigo-900 uppercase tracking-tight">{formData.patientId ? users.find(u => u.id === formData.patientId)?.name.split(' ')[0] : 'No File Loaded'}</p>
                               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Ready for terminal authorization</p>
                            </div>
                         </div>
                         {formData.patientId && <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg"><CheckCircle className="h-4 w-4 text-white" /></div>}
                      </div>
                    )}

                    <div className="space-y-4">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Clinical Specialist Assignment</label>
                       <div className="grid grid-cols-2 gap-4">
                          {doctors.slice(0, 4).map(d => (
                            <button 
                              key={d.id} 
                              type="button" 
                              onClick={() => setFormData(p => ({ ...p, doctorId: d.id }))}
                              className={`p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${formData.doctorId === d.id ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                            >
                               <p className={`text-sm font-black uppercase tracking-tight ${formData.doctorId === d.id ? 'text-indigo-900' : 'text-slate-700'}`}>Dr. {d.name.split(' ')[0]}</p>
                               <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase truncate">{d.specialty || 'General'}</p>
                               {formData.doctorId === d.id && <div className="absolute top-0 right-0 p-2"><div className="h-2 w-2 bg-indigo-600 rounded-full" /></div>}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Schedule Date</label>
                          <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all uppercase text-xs" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Session Start</label>
                          <input type="time" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all" />
                       </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-slate-300 hover:bg-indigo-600 active:scale-95 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Authorize Medical Token <ArrowRight className="h-4 w-4" /></>}
                    </button>
                 </form>
              </div>
            </div>
          )}

          {/* ── CHECK-IN / IN-PATIENT ── */}
          {activeTab === 'checkin' && (
            <div className="space-y-6">
               <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter">Physical Arrival Desk</h3>
                    <p className="text-sm font-medium text-indigo-600">Pending clinical confirmations for today's tokens.</p>
                  </div>
                  <Calendar className="h-10 w-10 text-indigo-200" />
               </div>

               {todayApts.filter(a => a.status === 'pending' || a.status === 'confirmed').length === 0 ? (
                 <div className="py-24 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <div className="h-16 w-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                   </div>
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Intake Synchronized</h4>
                   <p className="text-xs text-slate-400 mt-2">All scheduled tokens have been processed or checked in.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {todayApts.filter(a => a.status === 'pending' || a.status === 'confirmed').map((apt, idx) => {
                      const patient = users.find(u => u.id === apt.patientId);
                      const doctor = users.find(u => u.id === apt.doctorId);
                      return (
                        <div key={apt.id} className="p-6 bg-white border-2 border-slate-50 rounded-3xl hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col justify-between group">
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                   {idx + 1}
                                </div>
                                <div>
                                   <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{patient?.name.split(' ')[0]}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DR. {doctor?.name.split(' ')[0]} @ {apt.time}</p>
                                </div>
                             </div>
                             {apt.status === 'confirmed' && <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">Confirmed</div>}
                          </div>
                          
                          {apt.status === 'pending' && (
                            <button onClick={() => handleCheckIn(apt.id)}
                              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                              <CheckCircle className="h-4 w-4" /> Physical Check-In
                            </button>
                          )}
                        </div>
                      );
                    })}
                 </div>
               )}
            </div>
          )}

          {/* ── RELEASE / CHECKOUT ── */}
          {activeTab === 'checkout' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-rose-950 uppercase tracking-tighter">Clinical Closure Registry</h3>
                    <p className="text-sm font-bold text-rose-600/80">Authorize discharge for active sessions and settle hospital logistics.</p>
                  </div>
                  <LogOut className="h-16 w-16 text-rose-200/50 hidden md:block" />
               </div>

               {activeCheckouts === 0 ? (
                 <div className="py-24 text-center bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-100">
                    <div className="h-16 w-16 rounded-3xl bg-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-100">
                       <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Zero Active Sessions</h4>
                    <p className="text-sm text-slate-400 font-medium">All clinical equipment and bed allocations are currently closed.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Closures */}
                    {bedBookings.filter(b => b.status === 'active').map(booking => (
                       <ClosureCard key={booking.id} type="BED" booking={booking} users={users} beds={beds} equipment={equipment} />
                    ))}
                    {equipmentBookings.filter(b => b.status === 'active').map(booking => (
                       <ClosureCard key={booking.id} type="EQUIPMENT" booking={booking} users={users} beds={beds} equipment={equipment} />
                    ))}
                 </div>
               )}
            </div>
          )}
          
          {/* Labs, Doctors, etc. tabs to be polished similarly if needed, but primary front-desk actions are now high-fidelity */}
        </div>
      </div>
    </div>
  );
}

function ClosureCard({ type, booking, users, beds, equipment }: any) {
  const patient = users.find((u: any) => u.id === booking.patientId);
  const resource = type === 'BED' 
    ? beds.find((b: any) => b.id === booking.bedId)?.bedNumber 
    : equipment.find((e: any) => e.id === booking.equipmentId)?.name;

  return (
    <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] hover:border-rose-200 hover:shadow-2xl hover:shadow-rose-50/50 transition-all group flex flex-col justify-between">
       <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-5">
             <div className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-xl ${type === 'BED' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {type === 'BED' ? <Bed className="h-8 w-8" /> : <Wrench className="h-8 w-8" />}
             </div>
             <div>
                <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{patient?.name.split(' ')[0] || 'Unknown'}</p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{type}: {resource}</p>
             </div>
          </div>
          <span className="px-4 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-amber-100">Occupied</span>
       </div>
       <div className="flex gap-4">
          <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-100">
             Authorize Discharge
          </button>
          <button className="px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
             <Printer className="h-4 w-4" />
          </button>
       </div>
    </div>
  );
}
