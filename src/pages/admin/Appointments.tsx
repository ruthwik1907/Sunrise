import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, FileText, MoreVertical, Filter, ChevronRight } from 'lucide-react';
import { CustomSelect } from '../../components/ui/CustomSelect';

export default function AdminAppointments() {
  const { appointments, users, updateAppointmentStatus } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  let filteredAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (filter !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.status === filter);
  }

  if (searchTerm) {
    filteredAppointments = filteredAppointments.filter(a => {
      const patient = users.find(u => u.id === a.patientId);
      const doctor = users.find(u => u.id === a.doctorId);
      return (
        (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  const statusOptions = [
    { value: 'all', label: 'All Scheduled' },
    { value: 'pending', label: 'Pending Auth' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const updateOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirm' },
    { value: 'completed', label: 'Complete' },
    { value: 'cancelled', label: 'Cancel' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointment Ledger</h1>
          <p className="text-slate-500 font-medium mt-1">Audit and manage clinical scheduling across all departments.</p>
        </div>
        <button className="inline-flex items-center justify-center px-5 py-3 border-2 border-slate-100 text-sm font-black uppercase tracking-widest rounded-2xl text-slate-700 bg-white hover:bg-slate-50 shadow-xl shadow-slate-100 transition-all">
          <FileText className="h-4 w-4 mr-2" />
          Export Ledger
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-6 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search appointments by name, doctor, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="w-full sm:w-64">
            <CustomSelect
              options={statusOptions}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/30">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Clinical Case</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Counselor</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Session Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Registry Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredAppointments.map((apt) => {
                const patient = users.find(u => u.id === apt.patientId);
                const doctor = users.find(u => u.id === apt.doctorId);
                const statusColors: Record<string, string> = {
                  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  pending: 'bg-amber-50 text-amber-700 border-amber-100',
                  completed: 'bg-slate-50 text-slate-700 border-slate-200',
                  cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
                };

                return (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-slate-100" src={patient?.avatar || `https://ui-avatars.com/api/?name=${patient?.name || 'P'}&background=random`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{patient?.name || 'Unknown Patient'}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{apt.reason || 'General Consultation'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                             {doctor?.name?.charAt(0) || 'D'}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-bold text-slate-900 tracking-tight">Dr. {doctor?.name?.split(' ')[0] || 'Unassigned'}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doctor?.specialty || 'Clinical'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-black text-indigo-700 flex items-center gap-1.5 uppercase tracking-tighter">
                          <Calendar className="h-3.5 w-3.5" /> {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                          <Clock className="h-3.5 w-3.5 text-slate-300" /> {apt.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[apt.status] || 'bg-slate-100 text-slate-600'}`}>
                        {apt.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5 mr-1.5 animate-pulse" />}
                        {apt.status === 'pending' && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                        {apt.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                        {apt.status === 'cancelled' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-32">
                          <select
                            value={apt.status}
                            onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as any)}
                            className="appearance-none block w-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer text-slate-600"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirm</option>
                            <option value="completed">Complete</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Case Details">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
