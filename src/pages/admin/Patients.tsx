import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Edit, Trash2, Mail, Phone, Calendar, FileText, MoreVertical, ShieldAlert, X, Loader2, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '../../context/AppContext';
import { CustomSelect } from '../../components/ui/CustomSelect';

export default function AdminPatients() {
  const { users, updateUser, deleteUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPatient, setEditingPatient] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const patients = users.filter(u => u.role === 'patient');
  
  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.phone && p.phone.includes(searchTerm));
    const matchesStatus = filterStatus ? true : true; // Status logic to be expanded if field exists
    return matchesSearch && matchesStatus;
  });

  const handleEditClick = (patient: User) => {
    setEditingPatient(patient);
    setName(patient.name);
    setEmail(patient.email);
    setPhone(patient.phone || '');
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    
    if (!name || !email) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateUser(editingPatient.id, {
        name,
        email,
        phone
      });
      toast.success('Patient record updated successfully!');
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Update patient error:', error);
      toast.error('Failed to update patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!deletingId) return;
    try {
      await deleteUser(deletingId);
      toast.success('Patient record removed successfully!');
    } catch (error) {
      console.error('Delete patient error:', error);
      toast.error('Failed to delete patient.');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setEditingPatient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Registry</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and audit hospital clinical files.</p>
        </div>
        <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-slate-700 bg-white border-2 border-slate-100 hover:bg-slate-50 shadow-xl shadow-slate-100 transition-all">
          <FileText className="h-4 w-4 mr-2" />
          Export Registry
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
              placeholder="Search by name, email, or medical ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-slate-100 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
            />
          </div>
          <div className="w-full sm:w-64">
            <CustomSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active Care' },
                { value: 'inactive', label: 'Past Patients' }
              ]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Patient Profile</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Contact Access</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Enrollment</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-slate-50" src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name || 'Patient'}&background=random`} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{patient.name || 'Unknown Patient'}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">UID: {patient.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-indigo-400" /> {patient.email}
                      </div>
                      <div className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-indigo-400" /> {patient.phone || '+1 (555) 000-0000'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                      <Calendar className="h-3.5 w-3.5 text-slate-300" /> Oct 2023
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      Verified
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(patient)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-xl transition-all" 
                        title="Edit Record"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white hover:shadow-lg rounded-xl transition-all" title="Security Lock">
                        <ShieldAlert className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingId(patient.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg rounded-xl transition-all" 
                        title="Purge Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Patient Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 relative">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Update File</h3>
              <p className="text-slate-500 font-medium mt-1">Modify patient contact information.</p>
              <button 
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePatient} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 tracking-tight mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium transition-all"
                  placeholder="Legal full name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 tracking-tight mb-1.5">Email (Read-only)</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-slate-50 bg-slate-50 text-slate-400 rounded-2xl text-sm font-medium cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 tracking-tight mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="flex gap-4 pt-6 mt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
              <Trash2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Purge Patient?</h3>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed">
              This will permanently delete the clinical registry and all history associated with this patient.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={handleDeletePatient}
                className="w-full py-4 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-red-100 transition-all"
              >
                Yes, Purge
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="w-full py-4 bg-slate-50 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
