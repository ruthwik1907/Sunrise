import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Pill, Plus, Trash2, FileText, CheckCircle, Printer, Download, 
  History, Calendar, User, ShoppingCart, Calculator, ArrowRight
} from 'lucide-react';
import { generateClinicalPDF, InvoiceData } from '../../lib/pdf';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const { 
    currentUser, users, inventory, bills, 
    generatePharmacyBill, hospitalSettings 
  } = useAppContext();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
  
  // Selection State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [qty, setQty] = useState(1);
  const [gstPercent, setGstPercent] = useState(18); // Default 18%
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Filtered inventory based on search
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const handleAddMedicine = () => {
    if (!selectedMedId) {
      toast.error('Please select a medicine');
      return;
    }

    const medicine = inventory.find(i => i.id === selectedMedId);
    if (!medicine) return;

    if (qty > medicine.stock) {
      toast.error(`Only ${medicine.stock} units available in stock`);
      return;
    }

    if (qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    // Check if already added
    const existing = selectedMedicines.find(m => m.id === selectedMedId);
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > medicine.stock) {
        toast.error(`Total quantity (${newQty}) exceeds stock`);
        return;
      }
      setSelectedMedicines(selectedMedicines.map(m => 
        m.id === selectedMedId 
          ? { ...m, quantity: newQty, total: newQty * m.price } 
          : m
      ));
    } else {
      setSelectedMedicines([...selectedMedicines, {
        id: medicine.id,
        name: medicine.name,
        price: medicine.price,
        quantity: qty,
        total: qty * medicine.price
      }]);
    }

    setSelectedMedId('');
    setQty(1);
    setSearchTerm('');
  };

  const removeMedicine = (id: string) => {
    setSelectedMedicines(selectedMedicines.filter(m => m.id !== id));
  };

  const subtotal = useMemo(() => {
    return selectedMedicines.reduce((sum, m) => sum + m.total, 0);
  }, [selectedMedicines]);

  const gstAmount = useMemo(() => {
    return (subtotal * gstPercent) / 100;
  }, [subtotal, gstPercent]);

  const totalAmount = subtotal + gstAmount;

  const handleGenerateBill = async () => {
    if (!patientName.trim()) {
      toast.error('Patient Name is required');
      return;
    }
    if (selectedMedicines.length === 0) {
      toast.error('At least one medicine is required');
      return;
    }

    setIsGenerating(true);
    try {
      const bill = await generatePharmacyBill({
        patientId: patientId || `WALK-${Date.now()}`,
        patientName,
        patientPhone,
        medicines: selectedMedicines,
        subtotal,
        gst: gstAmount,
        totalAmount
      });
      
      // Generate PDF
      const data: InvoiceData = {
        id: bill.id,
        date: bill.createdAt || new Date().toISOString(),
        dueDate: bill.createdAt || new Date().toISOString(),
        status: 'paid',
        patientName: bill.patientName,
        patientId: bill.patientId,
        patientPhone: bill.patientPhone,
        items: (bill.medicines || []).map((m: any) => ({
          description: m.name,
          amount: m.price,
          quantity: m.quantity,
          taxRate: 0,
          taxAmount: 0,
          total: m.total
        })),
        subtotal: bill.subtotal,
        totalTaxAmount: bill.gst || 0,
        totalAmount: bill.totalAmount,
        type: 'pharmacy',
        billId: bill.billId
      };
      generateClinicalPDF(data, hospitalSettings, currentUser);

      // Clear form
      setPatientName('');
      setPatientId('');
      setPatientPhone('');
      setSelectedMedicines([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredBills = useMemo(() => {
     return bills.filter(b => 
        b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.billId.toLowerCase().includes(searchTerm.toLowerCase())
     ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bills, searchTerm]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 italic uppercase">Pharmacy Billing Portal</h1>
           <p className="text-sm text-slate-500 font-medium">Generate invoices and track medicine distribution.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
           {['new', 'history'].map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                 {t === 'new' ? 'New Bill' : 'Billing History'}
              </button>
           ))}
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Patient Info Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" /> Patient Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Search Patient (Name/ID)</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input 
                      list="patient-list"
                      type="text"
                      placeholder="Enter Name or ID"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        const p = users.find(u => u.name === e.target.value || u.id === e.target.value);
                        if (p) {
                          setPatientId(p.id);
                          setPatientPhone(p.phone || '');
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                    <datalist id="patient-list">
                      {users.filter(u => u.role === 'patient').map(u => (
                        <option key={u.id} value={u.name}>{u.id} • {u.phone}</option>
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Contact Number</label>
                  <input 
                    type="text"
                    placeholder="Phone Number"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Medicine Selection Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-500" /> Add Medicines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-8 relative">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Search & Select Medicine</label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Type medicine name..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  {searchTerm && (
                    <div className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200">
                      {filteredInventory.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedMedId(item.id);
                            setSearchTerm(item.name);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-2xl flex items-center justify-between group transition-colors"
                        >
                          <span className="font-bold text-slate-700">{item.name}</span>
                          <span className="text-[10px] bg-slate-100 group-hover:bg-indigo-100 px-2 py-0.5 rounded-lg text-slate-500 font-extrabold uppercase">Stock: {item.stock}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Qty</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl mt-2 text-sm font-bold text-center"
                  />
                </div>
                <div className="md:col-span-2 pb-0.5">
                  <button
                    onClick={handleAddMedicine}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all flex items-center justify-center shadow-lg shadow-slate-200"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Added Medicines Table */}
              <div className="mt-8 border border-slate-100 rounded-[2rem] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] uppercase font-black tracking-widest text-slate-400">Medicine</th>
                      <th className="px-6 py-4 text-center text-[10px] uppercase font-black tracking-widest text-slate-400">Qty</th>
                      <th className="px-6 py-4 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">Price</th>
                      <th className="px-6 py-4 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">Total</th>
                      <th className="px-6 py-4 text-center text-[10px] uppercase font-black tracking-widest text-slate-400"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedMedicines.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/30">
                        <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-600">{item.quantity}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-500">₹{item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">₹{item.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => removeMedicine(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {selectedMedicines.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-slate-300 italic font-medium">No items added to the current session</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Billing Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-8 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold">Billing Summary</h3>
                </div>
                <p className="text-slate-400 text-xs">Official hospital pharmacy invoice generated in real-time.</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="font-black text-slate-900 italic">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2">GST Setting <span className="text-[10px] lowercase px-2 bg-slate-100 rounded text-slate-400 font-bold tracking-tight">Editable</span></span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={gstPercent}
                        onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                        className="w-14 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-right font-black text-slate-900 focus:ring-0"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500 uppercase tracking-widest pb-4 border-b border-slate-100">
                    <span>GST ({gstPercent}%)</span>
                    <span className="font-black text-slate-900 italic text-indigo-600">₹{gstAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{totalAmount.toFixed(2)}</span>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleGenerateBill}
                    disabled={isGenerating || selectedMedicines.length === 0}
                    className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    {isGenerating ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Finalize & Generate
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-tight leading-normal">
                    Proceeding will update central inventory and synchronize this invoice with the main financial audit logs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── HISTORY TAB ── */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Billing History</h2>
                    <p className="text-sm text-slate-500 mt-1">Review and re-print past pharmacy transactions.</p>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Search patient or Bill ID..." 
                      className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full md:w-80 transition-all uppercase"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="overflow-x-auto -mx-10 px-10">
                 <table className="w-full">
                    <thead>
                       <tr className="border-b border-slate-100">
                          <th className="pb-4 text-left text-[10px] uppercase font-black tracking-widest text-slate-400">Bill ID</th>
                          <th className="pb-4 text-left text-[10px] uppercase font-black tracking-widest text-slate-400">Patient</th>
                          <th className="pb-4 text-left text-[10px] uppercase font-black tracking-widest text-slate-400">Date</th>
                          <th className="pb-4 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">Amount</th>
                          <th className="pb-4 text-right text-[10px] uppercase font-black tracking-widest text-slate-400">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredBills.map((bill) => (
                          <tr key={bill.id} className="group hover:bg-slate-50/50 transition-colors">
                             <td className="py-5 font-mono text-xs text-indigo-600 font-bold">{bill.billId}</td>
                             <td className="py-5">
                                <div className="text-sm font-bold text-slate-900">{bill.patientName}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{bill.patientPhone}</div>
                             </td>
                             <td className="py-5 text-xs text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</td>
                             <td className="py-5 text-right text-sm font-black text-slate-900">₹{bill.totalAmount.toFixed(2)}</td>
                             <td className="py-5 text-right">
                                <button 
                                  onClick={() => {
                                    const data: InvoiceData = {
                                      id: bill.id,
                                      date: bill.createdAt,
                                      dueDate: bill.createdAt,
                                      status: 'paid',
                                      patientName: bill.patientName,
                                      patientId: bill.patientId,
                                      patientPhone: bill.patientPhone,
                                      items: (bill.medicines || []).map((m: any) => ({
                                        description: m.name,
                                        amount: m.price,
                                        quantity: m.quantity,
                                        taxRate: 0,
                                        taxAmount: 0,
                                        total: m.total
                                      })),
                                      subtotal: bill.subtotal,
                                      totalTaxAmount: bill.gst || 0,
                                      totalAmount: bill.totalAmount,
                                      type: 'pharmacy',
                                      billId: bill.billId
                                    };
                                    generateClinicalPDF(data, hospitalSettings, currentUser);
                                  }}
                                  className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                   <Download className="w-4 h-4" />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
