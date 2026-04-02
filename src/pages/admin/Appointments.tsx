import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, FileText, MoreVertical, Filter } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage all hospital appointments.</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by patient, doctor, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full sm:w-48 pl-10 pr-10 py-2 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm rounded-lg appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredAppointments.map((apt) => {
                const patient = users.find(u => u.id === apt.patientId);
                const doctor = users.find(u => u.id === apt.doctorId);
                
                let doctorDisplayName = 'Unknown';
                if (doctor && doctor.name) {
                  const nameParts = doctor.name.split(' ');
                  doctorDisplayName = nameParts.length > 1 ? nameParts[1] : doctor.name;
                }
                
                return (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={patient?.avatar || `https://ui-avatars.com/api/?name=${patient?.name || 'Patient'}&background=random`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{patient?.name || 'Unknown Patient'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{patient?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img className="h-8 w-8 rounded-full object-cover border border-slate-200" src={doctor?.avatar || `https://ui-avatars.com/api/?name=${doctor?.name || 'Doctor'}&background=random`} alt="" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-bold text-slate-900">Dr. {doctorDisplayName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{doctor?.specialty || 'Unknown Specialty'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500" /> {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> {apt.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        apt.status === 'completed' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {apt.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                        {apt.status === 'pending' && <Clock className="w-3.5 h-3.5 mr-1" />}
                        {apt.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                        {apt.status === 'cancelled' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                        <span className="capitalize">{apt.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={apt.status}
                          onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as any)}
                          className="block w-32 pl-3 pr-8 py-1.5 text-xs border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors opacity-0 group-hover:opacity-100" title="More options">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Search className="h-8 w-8 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900">No appointments found</p>
                      <p className="text-sm">We couldn't find any appointments matching your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredAppointments.length}</span> appointments
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
