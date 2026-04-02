import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Edit, Trash2, Mail, Phone, Calendar, FileText, MoreVertical, ShieldAlert, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '../../context/AppContext';

export default function AdminPatients() {
  const { users, updateAdminUser, deleteUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPatient, setEditingPatient] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const patients = users.filter(u => u.role === 'patient');
  
  const filteredPatients = patients.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

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
      await updateAdminUser(editingPatient.id, {
        name,
        email,
        phone
      });
      toast.success('Patient updated successfully!');
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
      toast.success('Patient deleted successfully!');
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
          <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all registered patients in the hospital system.</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
          <FileText className="h-4 w-4 mr-2" />
          Export Data
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
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Information</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name || 'Patient'}&background=random`} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900">{patient.name || 'Unknown Patient'}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {patient.id.split('-')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-slate-600 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {patient.email}
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {patient.phone || '+1 (555) 000-0000'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> Oct 12, 2023
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(patient)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" 
                        title="Edit Patient"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Suspend Account">
                        <ShieldAlert className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingId(patient.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Search className="h-8 w-8 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900">No patients found</p>
                      <p className="text-sm">We couldn't find any patients matching your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredPatients.length}</span> patients
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

      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Patient?</h3>
              <p className="text-sm text-slate-500 text-center">Are you sure you want to delete this patient? This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePatient}
                  className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Patient</h3>
                <p className="text-sm text-slate-500 mt-1">Update the details for this patient.</p>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePatient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={showEditModal}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors ${showEditModal ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                  placeholder="patient@example.com"
                />
                {showEditModal && (
                  <p className="mt-1 text-xs text-slate-500">Email cannot be changed after creation.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    'Update Patient'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
