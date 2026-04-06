import React from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  Calendar, Users, Clock, CheckCircle, AlertCircle,
  UserPlus, Stethoscope, Bed, CreditCard, ArrowRight,
  TrendingUp, Activity, FlaskConical
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReceptionistDashboard() {
  const { currentUser, appointments, labRequests, users } = useAppContext();
  if (!currentUser) return null;

  const today = new Date().toDateString();
  const todayApts = appointments.filter(a => new Date(a.date).toDateString() === today);
  const pendingApts = todayApts.filter(a => a.status === 'pending');
  const completedToday = todayApts.filter(a => a.status === 'completed');
  const waitingApts = todayApts.filter(a => a.checkInTime && a.status !== 'completed' && a.status !== 'cancelled');

  const modules = [
    { name: 'OPD & Registration', desc: 'Patient intake & token queue', icon: UserPlus, href: '/receptionist/opd', color: 'indigo' },
    { name: 'Clinical Status', desc: 'Physicians & Lab tracking', icon: Stethoscope, href: '/receptionist/clinical', color: 'emerald' },
    { name: 'Ward & Beds', desc: 'Bed allotment & discharge', icon: Bed, href: '/receptionist/beds', color: 'rose' },
    { name: 'Billing Control', desc: 'Invoices & cash settlement', icon: CreditCard, href: '/receptionist/billing', color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Main Terminal</h1>
          <p className="text-sm text-slate-500">Daily clinical operations overview & control center.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2.5 pr-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest pl-0.5">Medical Registrar</p>
            <p className="font-bold text-slate-900 leading-none">{currentUser.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Intake", value: todayApts.length, icon: Calendar, color: 'indigo' },
          { label: 'Waiting Room', value: waitingApts.length, icon: Clock, color: 'amber' },
          { label: 'Clinical Completed', value: completedToday.length, icon: CheckCircle, color: 'emerald' },
          { label: 'Alert (Pending)', value: pendingApts.length, icon: AlertCircle, color: 'rose' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`bg-${color}-50 p-3 rounded-xl text-${color}-600`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm font-medium text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Module Navigation */}
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Operational Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map(mod => {
          const Icon = mod.icon;
          return (
            <Link 
              key={mod.name} 
              to={mod.href}
              className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-600 hover:shadow-md transition-all group"
            >
               <div className={`h-12 w-12 rounded-xl bg-${mod.color}-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                  <Icon className={`h-6 w-6 text-${mod.color}-600 group-hover:text-white`} />
               </div>
               <h3 className="font-bold text-slate-900 mb-1">{mod.name}</h3>
               <p className="text-xs text-slate-500 leading-relaxed mb-4">{mod.desc}</p>
               <div className="flex items-center gap-1 text-indigo-600 font-bold text-[10px] uppercase tracking-wider pt-3 border-t border-slate-50 transition-all">
                  Open Module <ArrowRight className="h-3 w-3" />
               </div>
            </Link>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-indigo-50 rounded-2xl p-8 text-indigo-900 relative overflow-hidden border border-indigo-100">
            <div className="flex items-center gap-3 mb-8">
               <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Activity className="h-5 w-5 text-white" />
               </div>
               <h3 className="text-lg font-bold">Clinic Health Metrics</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
               {[
                  { label: 'Retention', val: '94%' },
                  { label: 'Avg Wait', val: '18m' },
                  { label: 'Labs Pending', val: labRequests.filter(r => r.status !== 'completed').length },
                  { label: 'Billed', val: '91%' },
               ].map(stat => (
                  <div key={stat.label}>
                     <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{stat.label}</p>
                     <p className="text-2xl font-bold text-indigo-900">{stat.val}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Lab Queue Integrated */}
         <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold uppercase tracking-tight text-slate-900 text-xs">Live Lab Queue</h3>
                <FlaskConical className="h-4 w-4 text-indigo-600" />
             </div>
             
             <div className="space-y-3 prose-xs">
                {labRequests.filter(r => r.status !== 'completed').length === 0 ? (
                  <div className="text-center py-8">
                     <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Labs Clear</p>
                  </div>
                ) : (
                  labRequests.filter(r => r.status !== 'completed').slice(0, 4).map(req => {
                    const patient = users.find(u => u.id === req.patientId);
                    return (
                      <div key={req.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                         <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 uppercase truncate">{patient?.name.split(' ')[0] || 'Member'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{req.testName}</p>
                         </div>
                         <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-bold uppercase rounded border border-amber-500/20 flex-shrink-0">{req.status.split('_')[0]}</span>
                      </div>
                    );
                  })
                )}
             </div>

             {labRequests.filter(r => r.status !== 'completed').length > 4 && (
               <Link to="/receptionist/clinical" className="block w-full mt-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all text-indigo-600 text-center">
                  +{labRequests.filter(r => r.status !== 'completed').length - 4} More in Clinical
               </Link>
             )}
          </div>

         <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
               <h3 className="font-bold text-slate-900">Recent Pulse</h3>
               <div className="space-y-4">
                  {todayApts.slice(0, 3).map(a => (
                     <div key={a.id} className="flex gap-3 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                           <Clock className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900">{a.time}</p>
                           <p className="text-[10px] text-slate-500 line-clamp-1">{a.reason || 'General'}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <Link 
              to="/receptionist/opd"
              className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all text-center"
            >
               View Full Queue
            </Link>
         </div>
      </div>
    </div>
  );
}
