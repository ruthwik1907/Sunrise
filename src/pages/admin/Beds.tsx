import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bed, Plus, Edit, Trash2, Users, AlertTriangle, X, Loader2, Home, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomSelect } from '../../components/ui/CustomSelect';

export default function AdminBeds() {
  const { beds, departments, addBed, updateBed, deleteBed, bedBookings, users } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingBed, setEditingBed] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    bedNumber: '',
    type: 'general' as const,
    departmentId: '',
    pricePerDay: 500,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomNumber || !formData.bedNumber || !formData.departmentId) {
      toast.error('Please fill in all clinical requirements.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingBed) {
        await updateBed(editingBed.id, formData);
        toast.success('Bed registry updated.');
      } else {
        await addBed({ ...formData, status: 'available' });
        toast.success('New clinical bed authorized.');
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Authorization failed: ${error?.message || 'Check connection'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingBed(null);
    setFormData({ roomNumber: '', bedNumber: '', type: 'general', departmentId: '', pricePerDay: 500, notes: '' });
  };

  const handleEdit = (bed: any) => {
    setEditingBed(bed);
    setFormData({
      roomNumber: bed.roomNumber,
      bedNumber: bed.bedNumber,
      type: bed.type,
      departmentId: bed.departmentId,
      pricePerDay: bed.pricePerDay || 500,
      notes: bed.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (bedId: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Confirm Deletion?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteBed(bedId);
                toast.success('Bed purged from registry.');
              } catch {
                toast.error('Failed to purge bed.');
              }
            }}
            className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg"
          >
            Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg">Cancel</button>
        </div>
      </div>
    ));
  };

  const statusMap: Record<string, { label: string, color: string }> = {
    available: { label: 'Operational', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    occupied: { label: 'Occupied', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    maintenance: { label: 'Maintenance', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    reserved: { label: 'Reserved', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ward Inventory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage inpatient bed capacity and occupancy real-time.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Authorize New Bed
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Operational', value: beds.filter(b => b.status === 'available').length, icon: CheckCircle2, color: 'emerald' },
          { label: 'In-Patient', value: beds.filter(b => b.status === 'occupied').length, icon: Users, color: 'indigo' },
          { label: 'Tech Support', value: beds.filter(b => b.status === 'maintenance').length, icon: AlertTriangle, color: 'amber' },
          { label: 'Total Units', value: beds.length, icon: Bed, color: 'slate' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Beds Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <Home className="h-4 w-4 text-indigo-600" /> Ward Register
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/30">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Locator</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinical Tier</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50 font-medium">
              {beds.map((bed) => {
                const department = departments.find(d => d.id === bed.departmentId);
                const booking = bedBookings.find(b => b.bedId === bed.id && b.status === 'active');
                const patient = booking ? users.find(u => u.id === booking.patientId) : null;
                const status = statusMap[bed.status] || { label: bed.status, color: 'bg-slate-50 text-slate-600' };

                return (
                  <tr key={bed.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">Room {bed.roomNumber}</div>
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Bed {bed.bedNumber}</div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-slate-50 text-slate-700`}>
                        {bed.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-xs font-bold text-slate-500 uppercase">
                      {department?.name || 'GEN-WARD'}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${bed.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-50'}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                       {patient ? (
                         <div className="flex items-center gap-2">
                           <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-black">{patient.name.charAt(0)}</div>
                           <span className="text-xs font-bold text-slate-900">{patient.name.split(' ')[0]}</span>
                         </div>
                       ) : <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">VACANT</span>}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(bed)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-xl transition-all">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(bed.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg rounded-xl transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {beds.length === 0 && (
          <div className="text-center py-24 bg-slate-50/50">
            <Bed className="mx-auto h-16 w-16 text-slate-100" />
            <h3 className="mt-4 text-sm font-black text-slate-900 uppercase tracking-widest">Zero inventory</h3>
            <p className="mt-2 text-xs text-slate-400 font-medium">Initialize the ward by adding the first bed unit.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-slate-50 relative">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center"><Bed className="h-6 w-6 text-indigo-600" /></div>
                {editingBed ? 'Update Unit' : 'Clinical Unit Authorization'}
              </h3>
              <p className="text-slate-500 font-medium mt-2">Manage clinical ward placement and tiering.</p>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-10 py-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Room Index</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                    placeholder="e.g. 302"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Unit Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                    placeholder="e.g. B-09"
                  />
                </div>
              </div>
              
              <CustomSelect
                label="Clinical Tier"
                options={[
                  { value: 'general', label: 'General Admission' },
                  { value: 'private', label: 'Private Suite' },
                  { value: 'semi_private', label: 'Semi-Private' },
                  { value: 'icu', label: 'Critical Care (ICU)' },
                ]}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              />

              <CustomSelect
                label="Assigned Department"
                options={[
                  { value: '', label: 'Select Clinical Ward' },
                  ...departments.map(d => ({ value: d.id, label: d.name }))
                ]}
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              />

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Operational Cost (Per 24h)</label>
                <div className="relative">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                   <input
                    type="number"
                    required
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-5 bg-slate-50 text-slate-700 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingBed ? 'Update Unit' : 'Authorize')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
