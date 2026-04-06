import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, Building, Users, Activity, MoreVertical, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  description: string;
}

export default function AdminDepartments() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, users } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDepartment({ name, description });
      toast.success('Department added successfully!');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (dept: any) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description);
    setShowEditModal(true);
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setIsSubmitting(true);
    try {
      await updateDepartment(editingDept.id, { name, description });
      toast.success('Department updated successfully!');
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to update department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deletingId) return;
    try {
      await deleteDepartment(deletingId);
      toast.success('Department deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete department.');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingDept(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Facilities & Departments</h1>
          <p className="text-slate-500 font-medium mt-1">Manage clinical departments and facility organization.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const doctorCount = users.filter(u => u.role === 'doctor' && u.departmentId === dept.id).length;
          
          return (
            <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                      <Building className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditClick(dept)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" 
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setDeletingId(dept.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{dept.description}</p>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>Medical Staff</span>
                </div>
                <span className="bg-white text-indigo-700 border border-indigo-100 py-1 px-3 rounded-lg text-sm font-bold shadow-sm">
                  {doctorCount} Doctors
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{showEditModal ? 'Edit Department' : 'Add New Department'}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {showEditModal ? 'Update department details and description.' : 'Create a new medical department for the hospital.'}
                  </p>
                </div>
                <button 
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={showEditModal ? handleUpdateDepartment : handleAddDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                  placeholder="e.g. Cardiology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all resize-none"
                  placeholder="Brief description of the department's focus and services..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    showEditModal ? 'Update Department' : 'Save Department'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
              <Trash2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Delete Department?</h3>
            <p className="text-slate-500 font-medium mt-2">This action will permanently remove the department. This cannot be undone.</p>
            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={handleDeleteDepartment}
                className="w-full py-4 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-red-100 transition-all"
              >
                Yes, Delete it
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
