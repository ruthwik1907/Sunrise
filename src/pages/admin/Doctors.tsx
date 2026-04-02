import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Search, Edit, Trash2, Mail, Phone, Building, Star, MoreVertical, Loader2, X, Users, Pill, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';
import { User, Role } from '../../context/AppContext';

type StaffRole = 'doctor' | 'receptionist' | 'pharmacist' | 'lab_technician';

export default function AdminStaff() {
  const { users, departments, addDoctor, addReceptionist, addPharmacist, addLabTechnician, updateAdminUser, deleteUser } = useAppContext();
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
  
  const filteredStaff = currentStaff.filter(staff => 
    (staff.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (staff.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.specialty && staff.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      
      await updateAdminUser(editingStaff.id, updateData);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all hospital staff members and their accounts.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
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
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
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
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
            />
          </div>
          {activeTab === 'doctor' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg">
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Member</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                {activeTab === 'doctor' && (
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department & Specialty</th>
                )}
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredStaff.map((staff) => {
                const dept = departments.find(d => d.id === staff.departmentId);
                return (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={staff.avatar || `https://ui-avatars.com/api/?name=${staff.name || 'Staff'}&background=random`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{staff.name || 'Unknown Staff'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            {activeTab === 'doctor' && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                            {activeTab === 'doctor' ? '4.8 (124 reviews)' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-slate-600 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" /> {staff.email}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {staff.phone || '+1 (555) 123-4567'}
                        </div>
                      </div>
                    </td>
                    {activeTab === 'doctor' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-indigo-500" /> {dept?.name || 'Unassigned'}
                          </div>
                          <div className="text-sm text-slate-500">
                            {staff.specialty || 'General Practice'}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(staff)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" 
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingId(staff.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="More options">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'doctor' ? 5 : 4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Search className="h-8 w-8 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900">No {activeTab === 'lab_technician' ? 'lab technicians' : activeTab + 's'} found</p>
                      <p className="text-sm">We couldn't find any {activeTab === 'lab_technician' ? 'lab technicians' : activeTab + 's'} matching your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredStaff.length}</span> {activeTab === 'lab_technician' ? 'lab technicians' : activeTab + 's'}
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Add {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter phone number"
                />
              </div>
              {activeTab === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Enter specialty"
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Edit {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter phone number"
                />
              </div>
              {activeTab === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Enter specialty"
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this {activeTab}? This will permanently remove their account and all associated data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStaff}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
