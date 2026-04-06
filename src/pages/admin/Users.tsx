import React, { useState } from 'react';
import { useAppContext, User, Role } from '../../context/AppContext';
import { 
  Plus, Search, Edit, Trash2, Mail, Phone, Building, Star, 
  MoreVertical, Loader2, X, Users as UsersIcon, Pill, TestTube, 
  UserCircle, ShieldCheck, ShieldAlert, Filter, Download
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const ALL_ROLES: { id: Role | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Users', icon: UsersIcon },
  { id: 'patient', label: 'Patients', icon: UserCircle },
  { id: 'doctor', label: 'Doctors', icon: Star },
  { id: 'pharmacist', label: 'Pharmacists', icon: Pill },
  { id: 'lab_technician', label: 'Lab Techs', icon: TestTube },
  { id: 'receptionist', label: 'Receptionists', icon: ShieldCheck },
  { id: 'admin', label: 'Admins', icon: ShieldAlert },
];

export default function AdminUsers() {
  const { users, departments, updateAdminUser, deleteUser } = useAppContext();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') as Role | 'all' || 'all';
  const [activeRole, setActiveRole] = useState<Role | 'all'>(initialRole);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | 'inactive'>('active');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.mrn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = activeRole === 'all' || u.role === activeRole;
    const notDeleted = !u.deleted;
    
    return matchesSearch && matchesRole && notDeleted;
  }).sort((a,b) => (a.name || '').localeCompare(b.name || ''));

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setDepartmentId(user.departmentId || '');
    setSpecialty(user.specialty || '');
    setStatus(user.status || 'active');
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setIsSubmitting(true);
    try {
      const updateData: any = { 
        name, 
        email, 
        phone, 
        status 
      };
      
      if (editingUser.role === 'doctor') {
        updateData.departmentId = departmentId;
        updateData.specialty = specialty;
      }
      
      await updateAdminUser(editingUser.id, updateData);
      toast.success('User updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingId) return;
    try {
      await deleteUser(deletingId);
      toast.success('User removed successfully!');
      setDeletingId(null);
    } catch (error) {
      toast.error('Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Centralized directory of all hospital personnel and patients.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </button>
        </div>
      </div>

      {/* Role Navigation */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex overflow-x-auto no-scrollbar gap-1">
        {ALL_ROLES.map((role) => {
          const Icon = role.icon;
          const isActive = activeRole === role.id;
          const count = role.id === 'all' 
            ? users.filter(u => !u.deleted).length 
            : users.filter(u => u.role === role.id && !u.deleted).length;

          return (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {role.label}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Table Area */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, MRN or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select className="w-full pl-9 pr-8 py-3 border border-slate-200 rounded-xl bg-white text-sm font-bold appearance-none outline-none focus:border-indigo-500">
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Role & Assignment</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">System Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const dept = departments.find(d => d.id === user.departmentId);
                const roleConfig = ALL_ROLES.find(r => r.id === user.role);
                
                return (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            alt={user.name} 
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.status === 'suspended' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{user.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5 flex gap-2">
                             <span>ID: {user.id.slice(0, 8)}</span>
                             {user.mrn && <span className="bg-indigo-50 text-indigo-600 px-1.5 rounded uppercase">MRN: {user.mrn}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 capitalize">
                          {roleConfig?.icon && <roleConfig.icon className="w-3.5 h-3.5 text-slate-400" />}
                          {user.role?.replace('_', ' ')}
                        </div>
                        {user.role === 'doctor' && (
                          <div className="text-[11px] text-indigo-600 font-bold bg-indigo-50 p-1 rounded-lg inline-block w-fit">
                            {dept?.name || 'No Dept'} • {user.specialty || 'General'}
                          </div>
                        )}
                        {user.role === 'patient' && (
                          <div className="text-[10px] text-slate-500 font-medium">Standard Registration</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-600 flex items-center gap-2">
                          <Mail className="h-3 w-3 text-slate-400" /> {user.email}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-2">
                          <Phone className="h-3 w-3 text-slate-400" /> {user.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                        user.status === 'suspended' 
                          ? 'bg-red-50 text-red-700 border border-red-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                          <ShieldAlert className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingId(user.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <Search className="h-10 w-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">User not found</h3>
               <p className="text-slate-500 max-w-sm">We couldn't find any user results matching "{searchTerm}". Try a different name, email, or MRN.</p>
            </div>
          )}
        </div>
      </div>

      {/* Final Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Edit className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">User Profile Engine</h3>
                  <p className="text-sm text-slate-500 font-medium">Managing identity for <span className="text-indigo-600">{editingUser.name}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-3 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-8 overflow-y-auto space-y-8 no-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Legal Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Primary Email</label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-bold cursor-not-allowed opacity-75"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Account Access Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                    >
                      <option value="active">Active System Access</option>
                      <option value="suspended">Administrative Suspension</option>
                    </select>
                  </div>
               </div>

               {editingUser.role === 'doctor' && (
                 <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 space-y-6">
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                       <Star className="w-4 h-4" /> Clinical Specialization
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned Department</label>
                        <select
                          value={departmentId}
                          onChange={(e) => setDepartmentId(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 font-bold text-indigo-900 transition-all"
                        >
                          <option value="">Select Department</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Medical Specialty</label>
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 font-bold text-indigo-900 transition-all"
                          placeholder="e.g. Cardiologist"
                        />
                      </div>
                    </div>
                 </div>
               )}

               <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-8 py-4 border-2 border-slate-100 text-slate-700 rounded-2xl font-bold bg-white hover:bg-slate-50 hover:border-slate-200 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-extrabold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Commit Updates'
                    )}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Security Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6 mx-auto">
               <Trash2 className="h-10 w-10 text-rose-600" />
             </div>
             <h3 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Revoke Access?</h3>
             <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">This will permanently remove the user from the medical system. This operation is <span className="text-rose-600 font-bold">irreversible</span>.</p>
             <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteUser}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-extrabold shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all"
                >
                  Confirm Exclusion
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="w-full py-4 bg-white text-slate-600 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50 transition-all"
                >
                  Keep Account
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
