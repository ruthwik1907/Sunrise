import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Wrench, Plus, Edit, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminEquipment() {
  const { equipment, departments, addEquipment, updateEquipment, deleteEquipment, equipmentBookings } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'diagnostic' as const,
    model: '',
    serialNumber: '',
    location: '',
    departmentId: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, formData);
        toast.success('Equipment updated successfully');
      } else {
        await addEquipment({ ...formData, status: 'available' });
        toast.success('Equipment added successfully');
      }
      setShowModal(false);
      setEditingEquipment(null);
      setFormData({
        name: '', type: 'diagnostic', model: '', serialNumber: '', location: '',
        departmentId: '', lastMaintenanceDate: '', nextMaintenanceDate: '', notes: ''
      });
    } catch (error: any) {
      console.error('Failed to save equipment:', error);
      toast.error(`Failed to save equipment: ${error?.message || error || 'Unknown error'}`);
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
      notes: equip.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (equipmentId: string) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await deleteEquipment(equipmentId);
        toast.success('Equipment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete equipment');
      }
    }
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_order': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentTypeColor = (type: string) => {
    switch (type) {
      case 'diagnostic': return 'bg-blue-100 text-blue-800';
      case 'surgical': return 'bg-red-100 text-red-800';
      case 'monitoring': return 'bg-purple-100 text-purple-800';
      case 'therapeutic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const needsMaintenance = (equip: any) => {
    if (!equip.nextMaintenanceDate) return false;
    return new Date(equip.nextMaintenanceDate) <= new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipment Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage hospital equipment and maintenance schedules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Available</p>
              <p className="text-2xl font-bold text-slate-900">
                {equipment.filter(e => e.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">In Use</p>
              <p className="text-2xl font-bold text-slate-900">
                {equipment.filter(e => e.status === 'in_use').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Maintenance Due</p>
              <p className="text-2xl font-bold text-slate-900">
                {equipment.filter(needsMaintenance).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-slate-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Total Equipment</p>
              <p className="text-2xl font-bold text-slate-900">{equipment.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">All Equipment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Equipment
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
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Next Maintenance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {equipment.map((equip) => {
                const department = departments.find(d => d.id === equip.departmentId);

                return (
                  <tr key={equip.id} className={`hover:bg-slate-50 ${needsMaintenance(equip) ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {equip.name}
                      </div>
                      {equip.model && (
                        <div className="text-sm text-slate-500">
                          Model: {equip.model}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEquipmentTypeColor(equip.type)}`}>
                        {equip.type.charAt(0).toUpperCase() + equip.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {department?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEquipmentStatusColor(equip.status)}`}>
                        {equip.status.replace('_', ' ').charAt(0).toUpperCase() + equip.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {equip.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {equip.nextMaintenanceDate ? (
                        <span className={needsMaintenance(equip) ? 'text-red-600 font-medium' : ''}>
                          {new Date(equip.nextMaintenanceDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(equip)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(equip.id)}
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
        {equipment.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No equipment</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by adding your first equipment item.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-600" />
                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEquipment(null);
                  setFormData({
                    name: '', type: 'diagnostic', model: '', serialNumber: '', location: '',
                    departmentId: '', lastMaintenanceDate: '', nextMaintenanceDate: '', notes: ''
                  });
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="X-Ray Machine"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="diagnostic">Diagnostic</option>
                    <option value="surgical">Surgical</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="therapeutic">Therapeutic</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model (Optional)</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="XR-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="SN123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Room 201"
                  />
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Maintenance (Optional)</label>
                  <input
                    type="date"
                    value={formData.lastMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Next Maintenance (Optional)</label>
                  <input
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Any special notes about this equipment..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEquipment(null);
                    setFormData({
                      name: '', type: 'diagnostic', model: '', serialNumber: '', location: '',
                      departmentId: '', lastMaintenanceDate: '', nextMaintenanceDate: '', notes: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700"
                >
                  {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}