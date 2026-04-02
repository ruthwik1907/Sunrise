import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { InventoryItem } from '../../context/AppContext';
import {
  Pill, Search, CheckCircle, Clock, AlertTriangle, Package, User,
  Plus, Edit2, Trash2, X, ShieldAlert, TrendingUp, IndianRupee, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'pending' | 'dispensed' | 'inventory' | 'transactions';

interface DispenseModal {
  prescriptionId: string;
  patientName: string;
  medications: string;
  items: { inventoryItemId: string; quantity: number }[];
}

export default function PharmacistDashboard() {
  const {
    currentUser, prescriptions, users, dispensePrescription,
    inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, invoices
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [dispenseModal, setDispenseModal] = useState<DispenseModal | null>(null);
  const [dispenseSelections, setDispenseSelections] = useState<{ inventoryItemId: string; quantity: number }[]>([{ inventoryItemId: '', quantity: 1 }]);
  const [isDispensing, setIsDispensing] = useState(false);

  const [formData, setFormData] = useState({
    name: '', category: '', stock: 0, unitPrice: 0,
    expiryDate: '', manufacturer: '', reorderLevel: 10,
  });

  if (!currentUser) return null;

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed');

  const myTransactions = invoices.filter(
    inv => inv.description?.toLowerCase().includes('pharmacy') &&
      dispensedPrescriptions.some(rx => rx.appointmentId === inv.appointmentId && rx.dispensedBy === currentUser.id)
  );

  const filteredPending = pendingPrescriptions.filter(rx => {
    const patient = users.find(u => u.id === rx.patientId);
    const doctor = users.find(u => u.id === rx.doctorId);
    return (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rx.medications || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rx.items || []).some(item => item.medicationName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    (item.manufacturer || '').toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const isUrgent = (date: string) => {
    const hours = (Date.now() - new Date(date).getTime()) / 3600000;
    return hours > 24;
  };

  const isLowStock = (item: InventoryItem) => item.stock <= item.reorderLevel;
  const isOutOfStock = (item: InventoryItem) => item.stock === 0;

  // --- Inventory CRUD ---
  const openAddModal = () => {
    setFormData({ name: '', category: '', stock: 0, unitPrice: 0, expiryDate: '', manufacturer: '', reorderLevel: 10 });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setFormData({
      name: item.name, category: item.category, stock: item.stock,
      unitPrice: item.unitPrice, expiryDate: item.expiryDate,
      manufacturer: item.manufacturer || '', reorderLevel: item.reorderLevel,
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.category || !formData.expiryDate) {
      toast.error('Please fill all required fields.');
      return;
    }
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, formData);
        toast.success('Medicine updated successfully!');
      } else {
        await addInventoryItem(formData);
        toast.success('Medicine added to inventory!');
      }
      setShowAddModal(false);
    } catch {
      toast.error('Failed to save medicine.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Delete this medicine from inventory?')) return;
    try {
      await deleteInventoryItem(id);
      toast.success('Medicine removed from inventory.');
    } catch {
      toast.error('Failed to delete medicine.');
    }
  };

  // --- Dispense Flow ---
  const openDispenseModal = (rx: any) => {
    const patient = users.find(u => u.id === rx.patientId);
    const meds = rx.items?.map((i: any) => i.medicationName).join(', ') || rx.medications || 'N/A';
    setDispenseModal({ prescriptionId: rx.id, patientName: patient?.name || 'Unknown', medications: meds, items: [] });
    setDispenseSelections([{ inventoryItemId: '', quantity: 1 }]);
  };

  const canDispense = () => {
    if (dispenseSelections.length === 0) return false;
    return dispenseSelections.every(sel => {
      if (!sel.inventoryItemId) return false;
      const item = inventory.find(i => i.id === sel.inventoryItemId);
      return item && item.stock >= sel.quantity && sel.quantity > 0;
    });
  };

  const handleDispense = async () => {
    if (!dispenseModal || !canDispense()) return;
    setIsDispensing(true);
    try {
      await dispensePrescription(dispenseModal.prescriptionId, currentUser.id, dispenseSelections);
      toast.success('Prescription dispensed & invoice generated!');
      setDispenseModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispense prescription.');
    } finally {
      setIsDispensing(false);
    }
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'pending', label: `Pending`, count: pendingPrescriptions.length },
    { id: 'dispensed', label: 'Dispensed', count: dispensedPrescriptions.length },
    { id: 'inventory', label: 'Inventory', count: inventory.length },
    { id: 'transactions', label: 'Transactions', count: myTransactions.length },
  ];

  const lowStockCount = inventory.filter(isLowStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pharmacy Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage prescriptions, inventory & billing</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              {lowStockCount} Low Stock Alert{lowStockCount > 1 ? 's' : ''}
            </span>
          )}
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Pill className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-900">{currentUser.name}</p>
            <p className="text-slate-500">Pharmacist</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Rx</p>
              <p className="text-2xl font-bold text-slate-900">{pendingPrescriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Dispensed Today</p>
              <p className="text-2xl font-bold text-slate-900">
                {dispensedPrescriptions.filter(rx => rx.dispensedAt && new Date(rx.dispensedAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Layers className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Medicines</p>
              <p className="text-2xl font-bold text-slate-900">{inventory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Low / Out of Stock</p>
              <p className="text-2xl font-bold text-slate-900">{lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── PENDING TAB ── */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient, doctor or medication..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              {filteredPending.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">All caught up!</h3>
                  <p className="mt-1 text-sm text-slate-500">No pending prescriptions to dispense.</p>
                </div>
              ) : (
                filteredPending.map(rx => {
                  const patient = users.find(u => u.id === rx.patientId);
                  const doctor = users.find(u => u.id === rx.doctorId);
                  const urgent = isUrgent(rx.date);
                  const medList = rx.items?.map(i => `${i.medicationName} ${i.dosage}`).join(', ') || rx.medications || 'N/A';
                  return (
                    <div key={rx.id} className={`rounded-xl border p-5 ${urgent ? 'border-red-200 bg-red-50/40' : 'border-slate-200'}`}>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{patient?.name || 'Unknown Patient'}</h3>
                              <p className="text-xs text-slate-500">Prescribed by Dr. {doctor?.name || 'Unknown'} · {new Date(rx.date).toLocaleDateString()}</p>
                            </div>
                            {urgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <AlertTriangle className="h-3 w-3" /> Urgent
                              </span>
                            )}
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 font-medium">
                            {medList}
                          </div>
                          {rx.notes && <p className="mt-2 text-xs text-slate-500 italic">Note: {rx.notes}</p>}
                        </div>
                        <button
                          onClick={() => openDispenseModal(rx)}
                          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors flex-shrink-0"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Dispense
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── DISPENSED TAB ── */}
          {activeTab === 'dispensed' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dispensed prescriptions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              {dispensedPrescriptions.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">No dispensed prescriptions yet</h3>
                </div>
              ) : (
                dispensedPrescriptions.map(rx => {
                  const patient = users.find(u => u.id === rx.patientId);
                  const doctor = users.find(u => u.id === rx.doctorId);
                  const pharmacist = users.find(u => u.id === rx.dispensedBy);
                  return (
                    <div key={rx.id} className="rounded-xl border border-slate-200 p-5">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{patient?.name || 'Unknown Patient'}</h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Dispensed</span>
                          </div>
                          <p className="text-xs text-slate-500 mb-2">Prescribed by Dr. {doctor?.name || 'Unknown'}</p>
                          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                            {rx.items?.map(i => `${i.medicationName} ${i.dosage}`).join(', ') || rx.medications}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                            <span>Prescribed: {new Date(rx.date).toLocaleDateString()}</span>
                            {rx.dispensedAt && <span>Dispensed: {new Date(rx.dispensedAt).toLocaleDateString()}</span>}
                            <span>By: {pharmacist?.name || 'Unknown Pharmacist'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── INVENTORY TAB ── */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors flex-shrink-0 w-full sm:w-auto justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Add Medicine
                </button>
              </div>

              {filteredInventory.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">No medicines found</h3>
                  <p className="mt-1 text-sm text-slate-500">Add medicines to start tracking inventory.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Medicine', 'Category', 'Stock', 'Unit Price', 'Expiry', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredInventory.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                              {item.manufacturer && <p className="text-xs text-slate-500">{item.manufacturer}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{item.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${isOutOfStock(item) ? 'text-red-600' : isLowStock(item) ? 'text-amber-600' : 'text-slate-900'}`}>
                              {item.stock}
                            </span>
                            <span className="text-xs text-slate-400"> units</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            ₹{item.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {isOutOfStock(item) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
                                <ShieldAlert className="h-3 w-3" /> Out of Stock
                              </span>
                            ) : isLowStock(item) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                                <AlertTriangle className="h-3 w-3" /> Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                <CheckCircle className="h-3 w-3" /> In Stock
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-3 border border-indigo-100">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-medium">Total Revenue Generated</p>
                    <p className="text-xl font-bold text-indigo-900">
                      ₹{invoices.filter(inv => inv.description?.includes('Pharmacy')).reduce((s, i) => s + i.amount, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Prescriptions Dispensed</p>
                    <p className="text-xl font-bold text-emerald-900">{dispensedPrescriptions.filter(rx => rx.dispensedBy === currentUser.id).length}</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Invoice', 'Patient', 'Medications', 'Amount', 'Date', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {invoices.filter(inv => inv.description?.includes('Pharmacy')).map(inv => {
                      const patient = users.find(u => u.id === inv.patientId);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono text-slate-600">#{inv.id.substring(0, 8).toUpperCase()}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">{patient?.name || 'Unknown'}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">
                            {inv.items?.map(i => i.description).join('; ') || inv.description}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-900">₹{inv.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{new Date(inv.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {invoices.filter(inv => inv.description?.includes('Pharmacy')).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                          No pharmacy transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ADD/EDIT INVENTORY MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editingItem ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Medicine Name *</label>
                  <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category *</label>
                  <input value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Analgesic" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Manufacturer</label>
                  <input value={formData.manufacturer} onChange={e => setFormData(p => ({ ...p, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Sun Pharma" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stock (Units) *</label>
                  <input type="number" min="0" value={formData.stock} onChange={e => setFormData(p => ({ ...p, stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Unit Price (₹) *</label>
                  <input type="number" min="0" step="0.01" value={formData.unitPrice} onChange={e => setFormData(p => ({ ...p, unitPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry Date *</label>
                  <input type="date" value={formData.expiryDate} onChange={e => setFormData(p => ({ ...p, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reorder Level</label>
                  <input type="number" min="0" value={formData.reorderLevel} onChange={e => setFormData(p => ({ ...p, reorderLevel: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveItem} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">
                {editingItem ? 'Save Changes' : 'Add Medicine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISPENSE MODAL ── */}
      {dispenseModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Dispense Prescription</h2>
                <p className="text-sm text-slate-500">Patient: {dispenseModal.patientName}</p>
              </div>
              <button onClick={() => setDispenseModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-600 mb-1">Prescribed Medications:</p>
                <p className="text-sm text-slate-800">{dispenseModal.medications}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Select from Inventory:</p>
                  <button
                    onClick={() => setDispenseSelections(p => [...p, { inventoryItemId: '', quantity: 1 }])}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Add Item
                  </button>
                </div>
                {dispenseSelections.map((sel, idx) => {
                  const selectedItem = inventory.find(i => i.id === sel.inventoryItemId);
                  const outOfStock = selectedItem && selectedItem.stock < sel.quantity;
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <select
                          value={sel.inventoryItemId}
                          onChange={e => setDispenseSelections(p => p.map((s, i) => i === idx ? { ...s, inventoryItemId: e.target.value } : s))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select medicine...</option>
                          {inventory.map(item => (
                            <option key={item.id} value={item.id} disabled={item.stock === 0}>
                              {item.name} {item.stock === 0 ? '(Out of Stock)' : `(${item.stock} left · ₹${item.unitPrice}/unit)`}
                            </option>
                          ))}
                        </select>
                        {outOfStock && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> Only {selectedItem.stock} units available
                          </p>
                        )}
                        {selectedItem && !outOfStock && (
                          <p className="text-xs text-emerald-600">
                            Subtotal: ₹{(selectedItem.unitPrice * sel.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <input
                        type="number" min="1"
                        value={sel.quantity}
                        onChange={e => setDispenseSelections(p => p.map((s, i) => i === idx ? { ...s, quantity: Number(e.target.value) } : s))}
                        className="w-20 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {dispenseSelections.length > 1 && (
                        <button onClick={() => setDispenseSelections(p => p.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {dispenseSelections.some(sel => sel.inventoryItemId) && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Total Invoice Amount:</span>
                    <span>₹{dispenseSelections.reduce((total, sel) => {
                      const item = inventory.find(i => i.id === sel.inventoryItemId);
                      return total + (item ? item.unitPrice * sel.quantity : 0);
                    }, 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200 flex-shrink-0">
              <button onClick={() => setDispenseModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDispense}
                disabled={!canDispense() || isDispensing}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${
                  canDispense() && !isDispensing
                    ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                    : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {isDispensing ? 'Processing...' : !canDispense() ? 'Select items to dispense' : 'Confirm & Generate Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
