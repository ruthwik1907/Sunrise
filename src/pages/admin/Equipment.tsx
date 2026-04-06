import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Wrench, Plus, Edit, Trash2, AlertTriangle, CheckCircle, Clock, X, Loader2, PenTool, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomSelect } from '../../components/ui/CustomSelect';

export default function AdminEquipment() {
  const { equipment, departments, addEquipment, updateEquipment, deleteEquipment, equipmentBookings } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'diagnostic' as const,
    model: '',
    serialNumber: '',
    location: '',
    departmentId: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    pricePerUse: 250,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.departmentId) {
      toast.error('Please fill in essential clinical data.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, formData);
        toast.success('Equipment registry updated.');
      } else {
        await addEquipment({ ...formData, status: 'available' });
        toast.success('New clinical asset registered.');
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Authorization failed: ${error?.message || 'Check connection'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (equip: any) => {
    setEditingEquipment(equip);
    setFormData({
      name: equip.name,
      type: equip.type,
      model: equip.model || '',
      serialNumber: equip.serialNumber || '',
      location: equip.location,
      departmentId: equip.departmentId,
      lastMaintenanceDate: equip.lastMaintenanceDate || '',
      nextMaintenanceDate: equip.nextMaintenanceDate || '',
      pricePerUse: equip.pricePerUse || 250,
      notes: equip.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEquipment(null);
    setFormData({
      name: '', type: 'diagnostic', model: '', serialNumber: '', location: '',
      departmentId: '', lastMaintenanceDate: '', nextMaintenanceDate: '', pricePerUse: 250, notes: ''
    });
  };

  const handleDelete = async (equipmentId: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Confirm asset purge?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteEquipment(equipmentId);
                toast.success('Biomedical asset purged.');
              } catch {
                toast.error('Failed to purge asset.');
              }
            }}
            className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg"
          >
            Purge
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg">Cancel</button>
        </div>
      </div>
    ));
  };

  const needsMaintenance = (equip: any) => {
    if (!equip.nextMaintenanceDate) return false;
    return new Date(equip.nextMaintenanceDate) <= new Date();
  };

  const typeConfig: Record<string, { label: string, color: string }> = {
    diagnostic: { label: 'Diagnostic', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    surgical: { label: 'Surgical Unit', color: 'bg-rose-50 text-rose-700 border-rose-100' },
    monitoring: { label: 'Live Monitor', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    therapeutic: { label: 'Therapeutic', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  };

  const statusConfig: Record<string, { label: string, color: string }> = {
    available: { label: 'Operational', color: 'bg-emerald-50 text-emerald-700' },
    in_use: { label: 'In Operation', color: 'bg-indigo-50 text-indigo-700' },
    maintenance: { label: 'In Lab', color: 'bg-amber-50 text-amber-700' },
    out_of_order: { label: 'Offline', color: 'bg-rose-50 text-rose-700' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Biomedical Assets</h1>
          <p className="text-slate-500 font-medium mt-1">Manage clinical instrumentation and preventative maintenance cycles.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all font-bold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register New Asset
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Operational', value: equipment.filter(e => e.status === 'available').length, icon: CheckCircle, color: 'emerald' },
          { label: 'Active Session', value: equipment.filter(e => e.status === 'in_use').length, icon: Clock, color: 'indigo' },
          { label: 'Maintenance Due', value: equipment.filter(needsMaintenance).length, icon: AlertTriangle, color: 'amber' },
          { label: 'Asset Total', value: equipment.length, icon: Database, color: 'slate' },
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

      {/* Equipment Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <PenTool className="h-4 w-4 text-indigo-600" /> Biomedical Registry
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/30">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Details</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Status</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Lab Sync</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {equipment.map((equip) => {
                const department = departments.find(d => d.id === equip.departmentId);
                const category = typeConfig[equip.type] || { label: equip.type, color: 'bg-slate-50 text-slate-600' };
                const status = statusConfig[equip.status] || { label: equip.status, color: 'bg-slate-50 text-slate-600' };
                const maintDue = needsMaintenance(equip);

                return (
                   <tr key={equip.id} className={`hover:bg-slate-50/50 transition-colors group ${maintDue ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{equip.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MOD: {equip.model || 'GEN-UNIT'}</div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 ${category.color}`}>
                        {category.label}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-xs font-bold text-slate-500 uppercase">
                      {department?.name || 'CENTRAL-LAB'}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${equip.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-50'}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      {equip.nextMaintenanceDate ? (
                        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-tight ${maintDue ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>
                           <Clock className="h-3.5 w-3.5" /> {new Date(equip.nextMaintenanceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      ) : <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">N/A</span>}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(equip)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-xl transition-all">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(equip.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg rounded-xl transition-all">
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
        {equipment.length === 0 && (
          <div className="text-center py-24 bg-slate-50/50">
            <Database className="mx-auto h-16 w-16 text-slate-100" />
            <h3 className="mt-4 text-sm font-black text-slate-900 uppercase tracking-widest">Zero clinical assets</h3>
            <p className="mt-2 text-xs text-slate-400 font-medium">Initialize the biomedical register by adding critical equipment.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-slate-50 relative">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center"><Wrench className="h-6 w-6 text-indigo-600" /></div>
                {editingEquipment ? 'Update Clinical Asset' : 'Asset Authorization'}
              </h3>
              <p className="text-slate-500 font-medium mt-2">Manage technical specifications and clinical placement.</p>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-10 py-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Clinical Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                    placeholder="e.g. Siemens X-Ray 2000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <CustomSelect
                    label="Tech Category"
                    options={[
                      { value: 'diagnostic', label: 'Diagnostic' },
                      { value: 'surgical', label: 'Surgical Unit' },
                      { value: 'monitoring', label: 'Monitoring' },
                      { value: 'therapeutic', label: 'Therapeutic' },
                    ]}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  />
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Model ID</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                      placeholder="XR-500"
                    />
                  </div>
                </div>
                
                <CustomSelect
                   label="Institutional Assignment"
                   options={[
                     { value: '', label: 'Select Clinical Department' },
                     ...departments.map(d => ({ value: d.id, label: d.name }))
                   ]}
                   value={formData.departmentId}
                   onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-5">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Lab Check-In</label>
                      <input
                        type="date"
                        value={formData.lastMaintenanceDate}
                        onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm uppercase"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Next Calibration</label>
                      <input
                        type="date"
                        value={formData.nextMaintenanceDate}
                        onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm uppercase"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Precision Service Fee (₹)</label>
                   <input
                    type="number"
                    required
                    value={formData.pricePerUse}
                    onChange={(e) => setFormData({ ...formData, pricePerUse: parseInt(e.target.value) || 0 })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                    placeholder="250"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-5 bg-slate-50 text-slate-700 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                   className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 font-bold"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingEquipment ? 'Update Asset' : 'Authorize')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
