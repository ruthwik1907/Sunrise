import React from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  Bed, LogOut, CheckCircle, Wrench, Printer, Home, Users, AlertTriangle,
  Plus, Search, X, ChevronRight, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReceptionistBeds() {
  const { 
    currentUser, users, bedBookings, equipmentBookings, beds, equipment,
    bookBed, updateBedBooking
  } = useAppContext();
  
  const [activeTab, setActiveTab] = React.useState<'active' | 'available'>('active');
  const [showAllotModal, setShowAllotModal] = React.useState(false);
  const [selectedBed, setSelectedBed] = React.useState<any>(null);
  const [searchPatient, setSearchPatient] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!currentUser) return null;

  const patients = users.filter(u => u.role === 'patient');
  const filteredPatients = searchPatient.length >= 3 
    ? patients.filter(p => 
        p.name.toLowerCase().includes(searchPatient.toLowerCase()) || 
        (p.phone || '').includes(searchPatient) || 
        (p.mrn || '').toLowerCase().includes(searchPatient.toLowerCase())
      )
    : [];

  const handleAllot = async (patientId: string) => {
    if (!selectedBed) return;
    setIsSubmitting(true);
    try {
      await bookBed({
        patientId,
        bedId: selectedBed.id,
        startDate: new Date().toISOString(),
        status: 'active',
        reason: `Allotted by ${currentUser.name}`
      });
      toast.success('Bed Allotted Successfully!');
      setShowAllotModal(false);
      setSelectedBed(null);
      setSearchPatient('');
    } catch {
      toast.error('Failed to allot bed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCheckouts = bedBookings.filter(b => b.status === 'active').length + equipmentBookings.filter(b => b.status === 'active').length;
  const availableBeds = beds.filter(b => b.status === 'available');

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ward & Beds</h1>
        <p className="text-sm text-slate-500">Manage inpatient bed capacity and occupancy real-time.</p>
      </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Operational', value: beds.filter(b => b.status === 'available').length, icon: CheckCircle, color: 'emerald' },
          { label: 'In-Patient', value: beds.filter(b => b.status === 'occupied').length, icon: Users, color: 'indigo' },
          { label: 'Tech Support', value: beds.filter(b => b.status === 'maintenance').length, icon: AlertTriangle, color: 'amber' },
          { label: 'Total Units', value: beds.length, icon: Bed, color: 'slate' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`h-10 w-10 rounded-lg bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-5 w-5 text-${color}-600`} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none mb-1">{value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

       {/* Tabs */}
       <div className="flex items-center gap-2 border-b border-slate-100 mb-6">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Active Sessions ({activeCheckouts})
          </button>
          <button 
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === 'available' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Available Inventory ({availableBeds.length})
          </button>
       </div>

       {activeTab === 'active' ? (
         <div className="space-y-4">
           <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex items-center justify-between">
             <div>
               <h3 className="text-lg font-bold text-rose-900">Closure Registry</h3>
               <p className="text-xs font-semibold text-rose-600">Authorize discharge for active sessions.</p>
             </div>
             <LogOut className="h-8 w-8 text-rose-200" />
           </div>

           {activeCheckouts === 0 ? (
             <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
               <h4 className="text-sm font-bold text-slate-900 uppercase">Clear Records</h4>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {bedBookings.filter(b => b.status === 'active').map(booking => (
                 <ClosureCard 
                    key={booking.id} 
                    type="BED" 
                    booking={booking} 
                    users={users} 
                    beds={beds} 
                    equipment={equipment}
                    onDischarge={() => updateBedBooking(booking.id, { status: 'completed', endDate: new Date().toISOString() })}
                 />
               ))}
               {equipmentBookings.filter(b => b.status === 'active').map(booking => (
                  <ClosureCard 
                    key={booking.id} 
                    type="EQUIPMENT" 
                    booking={booking} 
                    users={users} 
                    beds={beds} 
                    equipment={equipment} 
                    onDischarge={() => { /* Equipment discharge logic if any */ }}
                  />
               ))}
             </div>
           )}
         </div>
       ) : (
         <div className="space-y-4">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-indigo-900">Available Inventory</h3>
                <p className="text-xs font-semibold text-indigo-600">Quick-allot beds to patients waiting for admission.</p>
              </div>
              <Plus className="h-8 w-8 text-indigo-200" />
            </div>

            {availableBeds.length === 0 ? (
              <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-slate-900 uppercase">No Available Units</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {availableBeds.map(bed => (
                  <div key={bed.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-600 transition-all flex flex-col justify-between group">
                    <div className="mb-4">
                       <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                          <Bed className="h-5 w-5" />
                       </div>
                       <p className="font-bold text-slate-900">Room {bed.roomNumber}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bed.bedNumber} • {bed.type}</p>
                    </div>
                    <button 
                      onClick={() => { setSelectedBed(bed); setShowAllotModal(true); }}
                      className="w-full py-2 bg-white border border-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold uppercase transition-all hover:bg-indigo-600 hover:text-white"
                    >
                      Allot Patient
                    </button>
                  </div>
                ))}
              </div>
            )}
         </div>
       )}

       {/* Allotment Modal */}
       {showAllotModal && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                  <div>
                    <h3 className="font-bold text-slate-900">Bed Allotment</h3>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Room {selectedBed?.roomNumber} • {selectedBed?.bedNumber}</p>
                  </div>
                  <button onClick={() => setShowAllotModal(false)} className="p-2 hover:bg-white rounded-lg transition-all">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search patient by MRN or Name..." 
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {searchPatient.length < 3 ? (
                      <div className="text-center py-8">
                        <Users className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search to find patient</p>
                      </div>
                    ) : filteredPatients.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 text-amber-200 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No patient found</p>
                      </div>
                    ) : (
                      filteredPatients.map(p => (
                        <button 
                          key={p.id}
                          disabled={isSubmitting}
                          onClick={() => handleAllot(p.id)}
                          className="w-full p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-600 hover:shadow-md transition-all flex items-center justify-between group disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {p.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-slate-900">{p.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{p.mrn || 'NO MRN'}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-all" />
                        </button>
                      ))
                    )}
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}

function ClosureCard({ type, booking, users, beds, equipment, onDischarge }: any) {
  const patient = users.find((u: any) => u.id === booking.patientId);
  const resource = type === 'BED' 
    ? beds.find((b: any) => b.id === booking.bedId)?.bedNumber 
    : equipment.find((e: any) => e.id === booking.equipmentId)?.name;

  return (
    <div className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-600 transition-all flex flex-col justify-between">
       <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${type === 'BED' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {type === 'BED' ? <Bed className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
             </div>
             <div>
                <p className="font-bold text-slate-900">{patient?.name.split(' ')[0] || 'Member'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{type}: {resource}</p>
             </div>
          </div>
       </div>
       <div className="flex gap-2 pt-4 border-t border-slate-50">
          <button 
            onClick={onDischarge}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase transition-colors hover:bg-indigo-700"
          >
             Discharge
          </button>
          <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-slate-900 transition-colors">
             <Printer className="h-4 w-4" />
          </button>
       </div>
    </div>
  );
}
