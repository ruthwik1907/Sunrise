import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, Building, Users, Activity, MoreVertical, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDepartments() {
  const { departments, addDepartment, users } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
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
      setName('');
      setDescription('');
    } catch (error) {
      toast.error('Failed to add department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Departments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage medical departments and their associated staff.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
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
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Add New Department</h3>
              <p className="text-sm text-slate-500 mt-1">Create a new medical department for the hospital.</p>
            </div>
            <form onSubmit={handleAddDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors"
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
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-colors resize-none"
                  placeholder="Brief description of the department's focus and services..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                    'Save Department'
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
