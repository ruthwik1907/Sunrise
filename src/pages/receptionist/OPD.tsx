import React, { useState } from 'react';
import { useAppContext, User } from '../../context/AppContext';
import {
  Calendar, Users, Clock, CheckCircle, XCircle, UserPlus, Search,
  Printer, ArrowRight, Loader2, ClipboardList, Phone, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReceptionistOPD() {
  const { 
    currentUser, appointments, users, updateAppointmentStatus, 
    createAppointment, createWalkInPatient 
  } = useAppContext();

  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState<'queue' | 'walkin' | 'register'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [foundFamily, setFoundFamily] = useState<User[]>([]);
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
      setFormData({
        patientId: '', doctorId: '', date: new Date().toISOString().split('T')[0], time: '', reason: '',
        patientName: '', patientEmail: '', patientPhone: ''
      });
      setIsNewPatient(false);
      setGlobalSearch('');
      setFoundFamily([]);
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

  const filtered = todayApts.filter(a => {
    const patient = users.find(u => u.id === a.patientId);
    const doctor = users.find(u => u.id === a.doctorId);
    return (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status}`);
    } catch { toast.error('Failed to update appointment'); }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">OPD & Registration</h1>
        <p className="text-sm text-slate-500">Manage patient intake, live tokens, and registration.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-1 p-2 bg-slate-50/50 border-b border-slate-100">
          {[
            { id: 'queue', label: 'Token Queue', icon: ClipboardList },
            { id: 'walkin', label: 'Check-In Desk', icon: UserPlus },
            { id: 'register', label: 'OPD Register', icon: Printer }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Search live token system..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500" />
                </div>
                <button onClick={printOPD} className="px-6 py-3.5 bg-white border-2 border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-700 rounded-2xl hover:bg-slate-50">
                  Print Daily Registry
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      {['# Token', 'Clinical Profile', 'Specialist', 'Schedule', 'Registry', 'Command'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filtered.map((apt, idx) => {
                      const patient = users.find(u => u.id === apt.patientId);
                      const doctor = users.find(u => u.id === apt.doctorId);
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                              {idx + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{patient?.name || 'Guest'}</p>
                            <p className="text-[10px] font-bold text-slate-400">{patient?.phone || 'No Auth'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-700 uppercase">Dr. {doctor?.name.split(' ')[0]}</p>
                          </td>
                          <td className="px-6 py-4 text-xs font-black text-slate-600 uppercase">{apt.time}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              apt.status === 'confirmed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                              apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
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
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'walkin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg shadow-indigo-100 relative overflow-hidden">
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-1">Patient Discovery</h3>
                  <p className="text-indigo-100 text-xs mb-6 font-medium">Identify existing medical files via MRN or Mobile.</p>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-300" />
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
                      className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>

                {foundFamily.map(member => (
                  <div key={member.id} className="p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-500 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-700 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{member.name}</p>
                        <p className="text-[10px] font-black text-slate-400 tracking-widest">{member.phone || 'NO RECORD'}</p>
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

                {globalSearch.length >= 3 && foundFamily.length === 0 && (
                  <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                    <UserPlus className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <h4 className="text-sm font-bold text-slate-900 uppercase mb-4">Zero Records Found</h4>
                    <button 
                      onClick={() => setIsNewPatient(true)}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                    >
                      Initialize New File
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 shadow-2xl relative">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Clinical Desk</h3>
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                    <button onClick={() => setIsNewPatient(false)} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${!isNewPatient ? 'bg-white text-indigo-700 shadow-xl' : 'text-slate-400'}`}>Registry</button>
                    <button onClick={() => setIsNewPatient(true)} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${isNewPatient ? 'bg-white text-indigo-700 shadow-xl' : 'text-slate-400'}`}>Walk-in</button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {isNewPatient ? (
                    <div className="space-y-5">
                      <input type="text" value={formData.patientName} onChange={e => setFormData(p => ({ ...p, patientName: e.target.value }))}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white transition-all" placeholder="Patient Full Name" />
                      <div className="grid grid-cols-2 gap-5">
                        <input type="tel" value={formData.patientPhone} onChange={e => setFormData(p => ({ ...p, patientPhone: e.target.value }))}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white transition-all" placeholder="+91..." />
                        <input type="email" value={formData.patientEmail} onChange={e => setFormData(p => ({ ...p, patientEmail: e.target.value }))}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white transition-all" placeholder="patient@live.com" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-indigo-50/50 border-2 border-indigo-100 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <Users className="h-10 w-10 text-indigo-600" />
                        <div>
                          <p className="text-xl font-black text-indigo-900 uppercase">{formData.patientId ? users.find(u => u.id === formData.patientId)?.name : 'No Patient Selected'}</p>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Authorized for clinical token</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist Assignment</label>
                    <div className="grid grid-cols-2 gap-4">
                      {doctors.slice(0, 4).map(d => (
                        <button 
                          key={d.id} type="button" 
                          onClick={() => setFormData(p => ({ ...p, doctorId: d.id }))}
                          className={`p-5 rounded-2xl border-2 transition-all text-left ${formData.doctorId === d.id ? 'border-indigo-600 bg-white shadow-xl' : 'border-slate-50 bg-slate-50'}`}
                        >
                          <p className="text-sm font-black uppercase">{d.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{d.specialty || 'General'}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-xs" />
                    <input type="time" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold" />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Authorize Medical Token <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <Printer className="mx-auto h-12 w-12 text-slate-200 mb-4" />
               <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">OPD Daily Archive</h3>
               <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">Generate a physical copy of all clinical operations and patient intakes for today.</p>
               <button onClick={printOPD} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
                 Generate Registry PDF
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
