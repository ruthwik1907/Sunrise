import React from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  Stethoscope, Activity, Search,
  Clock, CheckCircle, Info, FlaskConical, User
} from 'lucide-react';

export default function ReceptionistClinical() {
  const { currentUser, users, labRequests } = useAppContext();
  if (!currentUser) return null;

  const doctors = users.filter(u => u.role === 'doctor' && u.status === 'active');
  const pendingLabs = labRequests.filter(r => r.status !== 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Status</h1>
        <p className="text-sm text-slate-500">Real-time tracking of physician availability and diagnostic labs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctors Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-indigo-600" /> Active Physicians
              </h3>
              <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {doctors.length} Online
              </span>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map(doc => (
                  <div key={doc.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-600 transition-all flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-lg">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Dr. {doc.name.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doc.specialty || 'General'}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Available</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Labs Queue */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold uppercase tracking-tight text-slate-900">Lab Queue</h3>
                <FlaskConical className="h-5 w-5 text-indigo-600" />
             </div>
             
             <div className="space-y-3">
                {pendingLabs.length === 0 ? (
                  <div className="text-center py-8">
                     <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Labs Clear</p>
                  </div>
                ) : (
                  pendingLabs.slice(0, 5).map(req => {
                    const patient = users.find(u => u.id === req.patientId);
                    return (
                      <div key={req.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                         <div>
                            <p className="text-xs font-bold text-slate-900 uppercase">{patient?.name.split(' ')[0] || 'Member'}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{req.testName}</p>
                         </div>
                         <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-bold uppercase rounded border border-amber-500/20">{req.status}</span>
                      </div>
                    );
                  })
                )}
             </div>

             {pendingLabs.length > 5 && (
               <button className="w-full mt-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all text-indigo-600">
                  View {pendingLabs.length - 5} More
               </button>
             )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
             <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                   <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Load</p>
                   <p className="text-xl font-bold text-slate-900 tracking-tight">Optimized</p>
                </div>
             </div>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Physician availability is at 100%. Clinical turnaround for diagnostic labs currently averaging 45 minutes.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
