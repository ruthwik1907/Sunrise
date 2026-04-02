import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Plus, Calendar, Clock, FileText, Search, Filter, MoreVertical, X } from 'lucide-react';

export default function PatientAppointments() {
  const { currentUser, appointments, users, departments } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!currentUser) return null;

  const myAppointments = appointments
    .filter(a => a.patientId === currentUser.id)
    .filter(a => {
      const doctor = users.find(u => u.id === a.doctorId);
      const dept = departments.find(d => d.id === a.departmentId);
      const searchMatch = 
        (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your upcoming and past medical appointments.</p>
        </div>
        <Link 
          to="/book-appointment" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor, department, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {myAppointments.map((apt) => {
                const doctor = users.find(u => u.id === apt.doctorId);
                const dept = departments.find(d => d.id === apt.departmentId);
                
                return (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={doctor?.avatar || `https://ui-avatars.com/api/?name=${doctor?.name || 'Doctor'}&background=random`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">Dr. {doctor?.name || 'Unknown Doctor'}</div>
                          <div className="text-xs text-slate-500">{dept?.name || 'Unknown Department'}</div>
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
                        <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
                          View Details
                        </button>
                        {apt.status === 'pending' && (
                          <button className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">
                            Cancel
                          </button>
                        )}
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
                      <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or book a new appointment.</p>
                      <Link 
                        to="/book-appointment" 
                        className="mt-4 inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Link>
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
