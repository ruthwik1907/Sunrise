import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Plus, Trash2, Printer, CheckCircle, Search, 
  User, CreditCard, ShoppingBag, FileText, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const { inventory, generatePharmacyBill, currentUser, hospitalSettings } = useAppContext();
  
  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
  
  // Selection State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [qty, setQty] = useState(1);
  const [gstPercent, setGstPercent] = useState(18); // Default 18%
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedBill, setLastGeneratedBill] = useState<any>(null);

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
      const billData = {
        patientName,
        patientId: patientId || undefined,
        medicines: selectedMedicines.map(m => ({
          name: m.name,
          quantity: m.quantity,
          price: m.price,
          total: m.total
        })),
        subtotal,
        gst: gstPercent,
        totalAmount
      };

      await generatePharmacyBill(billData);
      
      // Store for printing
      setLastGeneratedBill({
        ...billData,
        date: new Date().toLocaleString(),
        billId: `PRE-GEN-${Date.now().toString().slice(-4)}` // Temporary display ID if not returned
      });

      // Reset form
      // setPatientName('');
      // setPatientId('');
      // setSelectedMedicines([]);
    } catch (error) {
      // Error handled by AppContext toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-indigo-600" />
            Pharmacy Billing
          </h1>
          <p className="text-slate-500 text-sm mt-1">Generate invoices and manage medicine sales</p>
        </div>
        <div className="flex gap-2">
          {lastGeneratedBill && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Last Bill
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                Patient Details
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient ID (Optional)</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="MRN Number"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Medicine Selection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-4 w-4 text-indigo-600" />
                Add Medicines
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-6 relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Search & Select Medicine</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Type component of name..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  {searchTerm && (
                    <div className="absolute z-10 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5">
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSelectedMedId(item.id);
                              setSearchTerm(item.name);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                          >
                            <span className="font-medium text-slate-700">{item.name}</span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Stock: {item.stock}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500">No medicines found</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    onClick={handleAddMedicine}
                    className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Selection Table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden mt-4">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Medicine</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedMedicines.length > 0 ? (
                      selectedMedicines.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-600">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">₹{item.total.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeMedicine(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No medicines added yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Bill Summary
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-600">GST (%)</span>
                <input
                  type="number"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-semibold"
                />
              </div>
              
              <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-100">
                <span>GST ({gstPercent}%)</span>
                <span className="font-semibold text-slate-900">₹{gstAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-indigo-600">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleGenerateBill}
                  disabled={isGenerating || selectedMedicines.length === 0}
                  className="w-full py-4 bg-indigo-600 text-white font-extrabold rounded-2xl hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Generate Official Bill
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 px-4">
                  Finalizing will reduce stock from inventory and record this sale in the admin panel permanently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRINT AREA (only visible during print) ── */}
      <div id="invoice-print-area" className="hidden print:block print:p-8 bg-white max-w-A4 mx-auto text-black font-sans leading-relaxed">
        <div className="border-4 border-slate-900 p-6 md:p-10 relative overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-slate-200 pb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{hospitalSettings?.name || 'Sunrise Hospital'}</h1>
              <p className="text-sm font-bold text-slate-600 mt-1">{hospitalSettings?.address || '19/472, Old Check Post Circle, Renigunta'}</p>
              <div className="flex gap-4 mt-2 text-xs font-semibold text-slate-500">
                <span>Ph: {hospitalSettings?.phone || '+91 94949 94220'}</span>
                <span>Email: {hospitalSettings?.email || 'contact@sunrisehospital.com'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-slate-900 text-white px-3 py-1 text-xs font-black uppercase tracking-widest rounded-sm mb-4 inline-block">Pharmacy Invoice</span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice Date</p>
              <p className="text-sm font-black">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-4 rounded-lg">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billed To (Patient)</p>
              <p className="text-lg font-black text-slate-900">{patientName || 'Walk-in Patient'}</p>
              {patientId && <p className="text-xs font-bold text-slate-500">ID: {patientId}</p>}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoice ID</p>
              <p className="text-lg font-black text-slate-900">#{lastGeneratedBill?.billId || '---'}</p>
              <p className="text-xs font-bold text-slate-500">Issued by: {currentUser?.name || 'Pharmacist'}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mb-8">
            <thead className="border-b-2 border-slate-900">
              <tr>
                <th className="py-3 text-left text-xs font-black uppercase text-slate-400">Medicine Name</th>
                <th className="py-3 text-center text-xs font-black uppercase text-slate-400">Qty</th>
                <th className="py-3 text-right text-xs font-black uppercase text-slate-400">Price</th>
                <th className="py-3 text-right text-xs font-black uppercase text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedMedicines.map((m, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-bold text-slate-800">{m.name}</td>
                  <td className="py-3 text-center font-bold text-slate-600">{m.quantity}</td>
                  <td className="py-3 text-right font-bold text-slate-600">₹{m.price.toFixed(2)}</td>
                  <td className="py-3 text-right font-black text-slate-900">₹{m.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>GST ({gstPercent}%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-slate-100 border-b-2 border-slate-900 text-lg font-black text-slate-900 uppercase">
                <span>Total Due</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm font-black text-slate-900 mb-1 italic">"Thank you. Get well soon."</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Computer Generated Invoice - No signature required</p>
          </div>
        </div>

        {/* Sidebar strip in print */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-indigo-600 h-full"></div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .no-print { display: none !important; }
          header, aside, footer { display: none !important; }
        }
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
