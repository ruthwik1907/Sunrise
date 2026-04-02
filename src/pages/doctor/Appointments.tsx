import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Calendar, Clock, FileText, Search, Filter, MoreVertical, X, CheckCircle, XCircle, Check } from 'lucide-react';

export default function DoctorAppointments() {
  const { currentUser, appointments, users, updateAppointmentStatus } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!currentUser) return null;

  const myAppointments = appointments
    .filter(a => a.doctorId === currentUser.id)
    .filter(a => {
      const patient = users.find(u => u.id === a.patientId);
      const searchMatch = 
        (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === 'all' || a.status === statusFilter;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'pending': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'completed': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'cancelled': return 'bg-red-50 text-red-700 ring-red-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your patient appointments and schedule.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {myAppointments.map((apt) => {
                const patient = users.find(u => u.id === apt.patientId);
                
                return (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={patient?.avatar || `https://ui-avatars.com/api/?name=${patient?.name || 'Patient'}&background=random`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{patient?.name || 'Unknown Patient'}</div>
                          <div className="text-xs text-slate-500">{patient?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-slate-900">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {apt.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset capitalize ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 mr-2 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600 line-clamp-2 max-w-xs">{apt.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {apt.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateAppointmentStatus(apt.id, 'confirmed')} 
                              className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-md transition-colors"
                              title="Accept Appointment"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => updateAppointmentStatus(apt.id, 'cancelled')} 
                              className="text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors"
                              title="Decline Appointment"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <button 
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')} 
                            className="text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                            title="Mark as Completed"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <Link 
                          to={`/doctor/patients/${patient?.id}`} 
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                          View Patient
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {myAppointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Calendar className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900">No appointments found</h3>
                      <p className="text-sm text-slate-500 mt-1">There are no appointments matching your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
