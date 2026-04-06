import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  FileText, Search, Filter, CreditCard, Download, CheckCircle,
  Clock, XCircle, Stethoscope, Pill, FlaskConical, IndianRupee, TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { generateClinicalPDF, InvoiceData } from '../../lib/pdf';

type CategoryFilter = 'all' | 'consultation' | 'medication' | 'lab_test';

export default function AdminInvoices() {
  const { invoices, users, bills, hospitalSettings, currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getInvoiceCategory = (invoice: any): CategoryFilter => {
    const desc = (invoice.description || '').toLowerCase();
    if (desc.includes('pharmacy') || desc.includes('medication')) return 'medication';
    if (desc.includes('lab') || invoice.items?.some((i: any) => i.type === 'lab_test')) return 'lab_test';
    return 'consultation';
  };

  const combinedInvoices = [
    ...invoices.map(inv => ({ ...inv, _source: 'invoice' })),
    ...bills.map(bill => ({
      id: bill.id,
      patientId: bill.patientId || 'walk-in',
      patientName: bill.patientName,
      date: bill.createdAt,
      dueDate: bill.createdAt,
      amount: bill.totalAmount,
      subtotal: bill.subtotal,
      totalTaxAmount: bill.totalAmount - bill.subtotal,
      status: 'paid' as const, // Pharmacy bills are considered paid upon generation in this system
      description: `Pharmacy Bill: ${bill.billId}`,
      items: bill.medicines.map((m: any, idx: number) => ({
        id: `m-${idx}`,
        description: m.name,
        amount: m.price * m.quantity,
        type: 'medication' as const,
        taxRate: bill.gst,
        taxAmount: (m.price * m.quantity * bill.gst) / 100
      })),
      paymentMethod: 'upi' as const, // Default for pharmacy bills in this system
      transactionId: bill.billId,
      _source: 'bill',
      billId: bill.billId
    }))
  ];

  const filteredInvoices = combinedInvoices.filter(invoice => {
    const patientName = invoice.patientName || users.find(u => u.id === invoice.patientId)?.name || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || getInvoiceCategory(invoice) === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Revenue stats
  const totalRevenue = combinedInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const pharmacyRevenue = combinedInvoices.filter(i => i.status === 'paid' && getInvoiceCategory(i) === 'medication').reduce((s, i) => s + i.amount, 0);
  const consultRevenue = combinedInvoices.filter(i => i.status === 'paid' && getInvoiceCategory(i) === 'consultation').reduce((s, i) => s + i.amount, 0);
  const labRevenue = combinedInvoices.filter(i => i.status === 'paid' && getInvoiceCategory(i) === 'lab_test').reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = combinedInvoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><CheckCircle className="w-3 h-3 mr-1" /> Paid</span>;
      case 'unpaid':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"><Clock className="w-3 h-3 mr-1" /> Unpaid</span>;
      case 'partial':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"><Clock className="w-3 h-3 mr-1" /> Partial</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700">{status}</span>;
    }
  };

  const getCategoryBadge = (invoice: any) => {
    const cat = getInvoiceCategory(invoice);
    switch (cat) {
      case 'medication':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><Pill className="h-3 w-3" /> Pharmacy</span>;
      case 'lab_test':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700"><FlaskConical className="h-3 w-3" /> Lab</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"><Stethoscope className="h-3 w-3" /> Consultation</span>;
    }
  };

  const downloadInvoicePDF = (invoice: any) => {
    const data: InvoiceData = {
      id: invoice.id,
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status,
      patientName: invoice.patientName || users.find(u => u.id === invoice.patientId)?.name || 'Unknown',
      patientId: invoice.patientId,
      patientPhone: invoice.patientPhone,
      items: (invoice.items || []).map((item: any) => ({
        description: item.description,
        amount: item.amount || 0,
        quantity: item.quantity || 1,
        taxRate: item.taxRate || 0,
        taxAmount: item.taxAmount || 0,
        total: (item.amount || 0) + (item.taxAmount || 0)
      })),
      subtotal: invoice.subtotal || invoice.amount,
      totalTaxAmount: invoice.totalTaxAmount || 0,
      totalAmount: invoice.amount,
      gstNumber: invoice.gstNumber,
      type: getInvoiceCategory(invoice) as any,
      billId: invoice.billId
    };
    
    generateClinicalPDF(data, hospitalSettings, currentUser);
  };

  const categoryTabs: { id: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Invoices', icon: <FileText className="h-4 w-4" /> },
    { id: 'consultation', label: 'Appointments', icon: <Stethoscope className="h-4 w-4" /> },
    { id: 'medication', label: 'Pharmacy', icon: <Pill className="h-4 w-4" /> },
    { id: 'lab_test', label: 'Lab Tests', icon: <FlaskConical className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">Track all patient billing across departments.</p>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 opacity-80" />
            <p className="text-xs font-medium opacity-80">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</p>
          <p className="text-xs opacity-70 mt-1">from paid invoices</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-indigo-600">
            <Stethoscope className="h-4 w-4" />
            <p className="text-xs font-medium text-slate-500">Consultations</p>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{consultRevenue.toFixed(0)}</p>
          <p className="text-xs text-slate-400 mt-1">{invoices.filter(i => getInvoiceCategory(i) === 'consultation').length} invoices</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-green-600">
            <Pill className="h-4 w-4" />
            <p className="text-xs font-medium text-slate-500">Pharmacy</p>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{pharmacyRevenue.toFixed(0)}</p>
          <p className="text-xs text-slate-400 mt-1">{invoices.filter(i => getInvoiceCategory(i) === 'medication').length} invoices</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-purple-600">
            <FlaskConical className="h-4 w-4" />
            <p className="text-xs font-medium text-slate-500">Lab Tests</p>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{labRevenue.toFixed(0)}</p>
          <p className="text-xs text-slate-400 mt-1">{invoices.filter(i => getInvoiceCategory(i) === 'lab_test').length} invoices</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm border">
          <div className="flex items-center gap-2 mb-2 text-amber-600">
            <IndianRupee className="h-4 w-4" />
            <p className="text-xs font-medium text-slate-500">Unpaid</p>
          </div>
          <p className="text-xl font-bold text-amber-600">₹{totalUnpaid.toFixed(0)}</p>
          <p className="text-xs text-slate-400 mt-1">{invoices.filter(i => i.status === 'unpaid').length} pending</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          {categoryTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name or invoice ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Invoice</th>
                <th className="p-4 font-medium">Patient</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map(invoice => {
                const patient = users.find(u => u.id === invoice.patientId);
                const isExpanded = expandedId === invoice.id;
                return (
                  <React.Fragment key={invoice.id}>
                    <tr className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-mono text-sm font-medium text-slate-900">
                            #{invoice.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                            {(patient?.name || '?').charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{patient?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-4">{getCategoryBadge(invoice)}</td>
                      <td className="p-4 text-sm text-slate-600">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-semibold text-slate-900">₹{invoice.amount.toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(invoice.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : invoice.id)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => downloadInvoicePDF(invoice)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-4 pb-4 bg-slate-50">
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                              <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-white">
                                  <tr>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Item Description</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Base Price</th>
                                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">GST %</th>
                                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">GST Amt</th>
                                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {(invoice.items || []).map((item: any) => (
                                    <tr key={item.id} className="bg-white">
                                      <td className="px-4 py-2.5 text-sm text-slate-900">{item.description}</td>
                                      <td className="px-4 py-2.5 text-sm text-slate-900">₹{(item.amount || 0).toFixed(2)}</td>
                                      <td className="px-4 py-2.5 text-sm text-slate-600 text-center">{item.taxRate || 0}%</td>
                                      <td className="px-4 py-2.5 text-sm text-slate-900 text-right">₹{(item.taxAmount || 0).toFixed(2)}</td>
                                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900 text-right">₹{((item.amount || 0) + (item.taxAmount || 0)).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-slate-50/50">
                                  <tr className="border-t border-slate-200">
                                    <td colSpan={1} className="px-4 py-2 text-xs font-medium text-slate-500 uppercase">Summary</td>
                                    <td className="px-4 py-2 text-sm text-slate-900">₹{(invoice.subtotal || invoice.amount).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center text-slate-400">—</td>
                                    <td className="px-4 py-2 text-sm text-slate-900 text-right">₹{(invoice.totalTaxAmount || 0).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm font-bold text-indigo-700 text-right">₹{invoice.amount.toFixed(2)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-4 px-1">
                              <div className="flex gap-4">
                                <p className="text-xs text-slate-500">CGST (9%): <span className="font-medium text-slate-700">₹{((invoice.totalTaxAmount || 0) / 2).toFixed(2)}</span></p>
                                <p className="text-xs text-slate-500">SGST (9%): <span className="font-medium text-slate-700">₹{((invoice.totalTaxAmount || 0) / 2).toFixed(2)}</span></p>
                              </div>
                              {invoice.paymentMethod && (
                                <p className="text-xs text-slate-500">Paid via <span className="font-medium capitalize text-slate-700">{invoice.paymentMethod}</span>{invoice.transactionId ? ` · Txn: ${invoice.transactionId}` : ''}</p>
                              )}
                            </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No invoices found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
