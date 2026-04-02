import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bed, Plus, Edit, Trash2, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBeds() {
  const { beds, departments, addBed, updateBed, deleteBed, bedBookings } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingBed, setEditingBed] = useState<any>(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    bedNumber: '',
    type: 'general' as const,
    departmentId: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBed) {
        await updateBed(editingBed.id, formData);
        toast.success('Bed updated successfully');
      } else {
        await addBed({ ...formData, status: 'available' });
        toast.success('Bed added successfully');
      }
      setShowModal(false);
      setEditingBed(null);
      setFormData({ roomNumber: '', bedNumber: '', type: 'general', departmentId: '', notes: '' });
    } catch (error: any) {
      console.error('Failed to save bed:', error);
      toast.error(`Failed to save bed: ${error?.message || error || 'Unknown error'}`);
    }
  };

  const handleEdit = (bed: any) => {
    setEditingBed(bed);
    setFormData({
      roomNumber: bed.roomNumber,
      bedNumber: bed.bedNumber,
      type: bed.type,
      departmentId: bed.departmentId,
      notes: bed.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (bedId: string) => {
    if (window.confirm('Are you sure you want to delete this bed?')) {
      try {
        await deleteBed(bedId);
        toast.success('Bed deleted successfully');
      } catch (error) {
        toast.error('Failed to delete bed');
      }
    }
  };

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBedTypeColor = (type: string) => {
    switch (type) {
      case 'icu': return 'bg-red-100 text-red-800';
      case 'private': return 'bg-indigo-100 text-indigo-800';
      case 'semi_private': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bed Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage hospital beds and their availability</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bed
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Bed className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Available</p>
              <p className="text-2xl font-bold text-slate-900">
                {beds.filter(b => b.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Occupied</p>
              <p className="text-2xl font-bold text-slate-900">
                {beds.filter(b => b.status === 'occupied').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Maintenance</p>
              <p className="text-2xl font-bold text-slate-900">
                {beds.filter(b => b.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Bed className="h-8 w-8 text-slate-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Total Beds</p>
              <p className="text-2xl font-bold text-slate-900">{beds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Beds Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">All Beds</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Room/Bed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {beds.map((bed) => {
                const department = departments.find(d => d.id === bed.departmentId);
                const booking = bedBookings.find(b => b.bedId === bed.id && b.status === 'active');
                const patient = booking ? useAppContext().users.find(u => u.id === booking.patientId) : null;

                return (
                  <tr key={bed.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        Room {bed.roomNumber}
                      </div>
                      <div className="text-sm text-slate-500">
                        Bed {bed.bedNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBedTypeColor(bed.type)}`}>
                        {bed.type.charAt(0).toUpperCase() + bed.type.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {department?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBedStatusColor(bed.status)}`}>
                        {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {patient?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(bed)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bed.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {beds.length === 0 && (
          <div className="text-center py-12">
            <Bed className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No beds</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by adding your first bed.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bed className="h-5 w-5 text-indigo-600" />
                {editingBed ? 'Edit Bed' : 'Add New Bed'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBed(null);
                  setFormData({ roomNumber: '', bedNumber: '', type: 'general', departmentId: '', notes: '' });
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bed Number</label>
                  <input
                    type="text"
                    required
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="A1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bed Type</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="private">Private</option>
                  <option value="semi_private">Semi-Private</option>
                  <option value="icu">ICU</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Any special notes about this bed..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBed(null);
                    setFormData({ roomNumber: '', bedNumber: '', type: 'general', departmentId: '', notes: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700"
                >
                  {editingBed ? 'Update Bed' : 'Add Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}