import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Users, Calendar, Clock, MessageSquare, ArrowRight, CheckCircle, Activity } from 'lucide-react';

export default function DoctorDashboard() {
  const { currentUser, appointments, users, messages } = useAppContext();

  if (!currentUser) return null;

  const myAppointments = appointments.filter(a => a.doctorId === currentUser.id);
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = myAppointments.filter(a => a.date === today && a.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time));
  
  const uniquePatients = new Set(myAppointments.map(a => a.patientId)).size;
  
  const myMessages = messages.filter(m => m.receiverId === currentUser.id);
  const unreadMessages = myMessages.filter(m => !m.read);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser.name}</h1>
          <p className="text-slate-500">Here is your schedule and updates for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/doctor/schedule" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar className="h-4 w-4 mr-2" />
            My Schedule
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Today's Appointments</p>
            <p className="text-2xl font-bold text-slate-900">{todaysAppointments.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900">{uniquePatients}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-amber-50 p-4 rounded-xl text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-slate-900">{myAppointments.filter(a => a.status === 'pending').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Unread Messages</p>
            <p className="text-2xl font-bold text-slate-900">{unreadMessages.length}</p>
          </div>
          {unreadMessages.length > 0 && (
            <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Today's Schedule
            </h2>
            <Link to="/doctor/appointments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {todaysAppointments.length > 0 ? (
              todaysAppointments.map(apt => {
                const patient = users.find(u => u.id === apt.patientId);
                return (
                  <div key={apt.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 text-indigo-700 font-bold px-4 py-3 rounded-xl border border-indigo-100 text-center min-w-[80px]">
                        {apt.time}
                      </div>
                      <div className="flex items-center gap-3">
                        <img src={patient?.avatar || `https://ui-avatars.com/api/?name=${patient?.name || 'Patient'}&background=random`} alt={patient?.name || 'Patient'} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-bold text-slate-900">{patient?.name || 'Unknown Patient'}</p>
                          <p className="text-sm text-slate-500 truncate max-w-[200px]">{apt.reason}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 ${
                        apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                        apt.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.status === 'confirmed' ? <CheckCircle className="h-3.5 w-3.5" /> : 
                         apt.status === 'completed' ? <CheckCircle className="h-3.5 w-3.5" /> :
                         <Clock className="h-3.5 w-3.5" />}
                        <span className="capitalize">{apt.status}</span>
                      </span>
                      <Link to={`/doctor/patients/${patient?.id || ''}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Recent Messages
            </h2>
            <Link to="/doctor/messages" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {myMessages.length > 0 ? (
              myMessages.slice(0, 4).map(msg => {
                const sender = users.find(u => u.id === msg.senderId);
                return (
                  <div key={msg.id} className={`p-5 hover:bg-slate-50 transition-colors ${!msg.read ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex items-start gap-3">
                      <img src={sender?.avatar || `https://ui-avatars.com/api/?name=${sender?.name || 'User'}&background=random`} alt={sender?.name || 'User'} className="w-8 h-8 rounded-full object-cover border border-slate-200 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className={`text-sm font-medium truncate ${!msg.read ? 'text-slate-900' : 'text-slate-700'}`}>{sender?.name || 'Unknown User'}</p>
                          <p className="text-xs text-slate-400 shrink-0 ml-2">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className={`text-sm line-clamp-2 ${!msg.read ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">No new messages.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
