import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Search, Edit, Trash2, Mail, Phone, Building, Star, MoreVertical, Loader2, X, Users, Pill, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';
import { User, Role } from '../../context/AppContext';
import { CustomSelect } from '../../components/ui/CustomSelect';

type StaffRole = 'doctor' | 'receptionist' | 'pharmacist' | 'lab_technician';

export default function AdminStaff() {
  const { users, departments, addDoctor, addReceptionist, addPharmacist, addLabTechnician, updateUser, deleteUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<StaffRole>('doctor');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const getRoleUsers = (role: StaffRole) => {
    const roleMap: Record<StaffRole, Role> = {
      doctor: 'doctor',
      receptionist: 'receptionist',
      pharmacist: 'pharmacist',
      lab_technician: 'lab_technician'
    };
    return users.filter(u => u.role === roleMap[role]);
  };

  const currentStaff = getRoleUsers(activeTab);
  
  const filteredStaff = currentStaff.filter(staff => {
    const matchesSearch = (staff.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (staff.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (staff.specialty && staff.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = filterDept ? staff.departmentId === filterDept : true;
    return matchesSearch && matchesDept;
  });

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    if (activeTab === 'doctor' && (!departmentId || !specialty)) {
      toast.error('Please fill in department and specialty for doctors.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const staffData = { name, email, password, phone, departmentId, specialty };
      
      switch (activeTab) {
        case 'doctor':
          await addDoctor(staffData);
          break;
        case 'receptionist':
          await addReceptionist(staffData);
          break;
        case 'pharmacist':
          await addPharmacist(staffData);
          break;
        case 'lab_technician':
          await addLabTechnician(staffData);
          break;
      }
      
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')} added successfully!`);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error(`Failed to add ${activeTab}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (staff: User) => {
    setEditingStaff(staff);
    setName(staff.name);
    setEmail(staff.email);
    setPhone(staff.phone || '');
    setDepartmentId(staff.departmentId || '');
    setSpecialty(staff.specialty || '');
    setPassword('');
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    
    if (!name || !email) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    if (activeTab === 'doctor' && (!departmentId || !specialty)) {
      toast.error('Please fill in department and specialty for doctors.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updateData: any = { name, email, phone };
      if (activeTab === 'doctor') {
        updateData.departmentId = departmentId;
        updateData.specialty = specialty;
      }
      
      await updateUser(editingStaff.id, updateData);
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')} updated successfully!`);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Update staff error:', error);
      toast.error(`Failed to update ${activeTab}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingId) return;
    try {
      await deleteUser(deletingId);
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')} deleted successfully!`);
    } catch (error) {
      console.error('Delete staff error:', error);
      toast.error(`Failed to delete ${activeTab}.`);
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setDepartmentId('');
    setSpecialty('');
    setEditingStaff(null);
  };

  const tabs = [
    { id: 'doctor' as StaffRole, name: 'Doctors', icon: Star, count: getRoleUsers('doctor').length },
    { id: 'receptionist' as StaffRole, name: 'Receptionists', icon: Users, count: getRoleUsers('receptionist').length },
    { id: 'pharmacist' as StaffRole, name: 'Pharmacists', icon: Pill, count: getRoleUsers('pharmacist').length },
    { id: 'lab_technician' as StaffRole, name: 'Lab Technicians', icon: TestTube, count: getRoleUsers('lab_technician').length },
  ];

  const deptOptions = [
    { value: '', label: 'Select Department' },
    ...departments.map(d => ({ value: d.id, label: d.name }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Registry</h1>
          <p className="text-slate-500 font-medium mt-1">Manage clinical and support personnel across all departments.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'lab_technician' ? 'lab technicians' : activeTab + 's'} by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-slate-100 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
            />
          </div>
          {activeTab === 'doctor' && (
            <div className="w-full sm:w-64">
              <CustomSelect
                options={[{ value: '', label: 'All Departments' }, ...departments.map(d => ({ value: d.id, label: d.name }))]}
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Staff Member</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Contact Info</th>
                {activeTab === 'doctor' && (
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Dept & Specialty</th>
                )}
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredStaff.map((staff) => {
                const dept = departments.find(d => d.id === staff.departmentId);
                return (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-slate-50" src={staff.avatar || `https://ui-avatars.com/api/?name=${staff.name || 'Staff'}&background=random`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{staff.name || 'Unknown Staff'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-bold uppercase tracking-widest">
                            {activeTab === 'doctor' && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                            {activeTab === 'doctor' ? 'Clinical Staff' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-indigo-400" /> {staff.email}
                        </div>
                        <div className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-indigo-400" /> {staff.phone || '+1 (555) 123-4567'}
                        </div>
                      </div>
                    </td>
                    {activeTab === 'doctor' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-indigo-700 flex items-center gap-1.5 uppercase tracking-tight">
                            <Building className="h-3.5 w-3.5" /> {dept?.name || 'Unassigned'}
                          </div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {staff.specialty || 'General Practice'}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(staff)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-xl transition-all" 
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingId(staff.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg rounded-xl transition-all" 
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg rounded-xl transition-all" title="More options">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 relative">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {showEditModal ? 'Update Personnel' : 'Add New Staff'}
              </h3>
              <p className="text-slate-500 font-medium mt-1">
                {showEditModal ? 'Update credentials and department access.' : 'Register a new clinical or support member.'}
              </p>
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={showEditModal ? handleUpdateStaff : handleAddStaff} className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 tracking-tight mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 tracking-tight mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium transition-all"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                {!showEditModal && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 tracking-tight mb-1.5">Initial Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium transition-all"
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 tracking-tight mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium transition-all"
                    placeholder="e.g. +1 (555) 000-0000"
                  />
                </div>
                {activeTab === 'doctor' && (
                  <>
                    <CustomSelect
                      label="Department"
                      options={deptOptions}
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      required
                    />
                    <div>
                      <label className="block text-sm font-bold text-slate-700 tracking-tight mb-1.5">Specialty</label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium transition-all"
                        placeholder="e.g. Cardiologist"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-4 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (showEditModal ? 'Update' : 'Register')}
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
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Remove Personnel?</h3>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed">
              This will permanently delete the account and all clinical records associated with this member.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={handleDeleteStaff}
                className="w-full py-4 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-red-100 transition-all"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="w-full py-4 bg-slate-50 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                No, Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
