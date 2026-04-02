import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, User as UserIcon, Mail, Phone, Calendar, ArrowRight, X } from 'lucide-react';

export default function DoctorPatients() {
  const { currentUser, appointments, users } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;

  // Get unique patients for this doctor
  const myAppointments = appointments.filter(a => a.doctorId === currentUser.id);
  const patientIds = Array.from(new Set(myAppointments.map(a => a.patientId)));
  const myPatients = users.filter(u => patientIds.includes(u.id));

  const filteredPatients = myPatients.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Patients</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage your patient list.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name or email..."
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Visit</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredPatients.map((patient) => {
                const patientApts = myAppointments.filter(a => a.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const lastVisit = patientApts.find(a => a.status === 'completed')?.date;

                return (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name || 'Patient'}&background=random`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{patient.name || 'Unknown Patient'}</div>
                          <div className="text-xs text-slate-500">ID: {patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {patient.email}
                        </div>
                        {patient.phone && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                            {patient.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lastVisit ? (
                        <div className="flex items-center text-sm text-slate-900">
                          <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
                          {new Date(lastVisit).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 italic">No completed visits</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/doctor/patients/${patient.id}`} 
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        View Profile <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <UserIcon className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900">No patients found</h3>
                      <p className="text-sm text-slate-500 mt-1">There are no patients matching your search.</p>
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
