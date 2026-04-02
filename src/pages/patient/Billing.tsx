import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CreditCard, CheckCircle, Download, FileText, Search, Filter, AlertCircle, Calendar, Pill, Stethoscope, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function PatientBilling() {
  const { currentUser, invoices, payInvoice } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!currentUser) return null;

  const getCategory = (invoice: any) => {
    const desc = (invoice.description || '').toLowerCase();
    if (desc.includes('pharmacy') || invoice.items?.some((i: any) => i.type === 'medication')) return 'pharmacy';
    if (desc.includes('lab') || invoice.items?.some((i: any) => i.type === 'lab_test')) return 'lab';
    return 'consultation';
  };

  const getCategoryBadge = (invoice: any) => {
    const cat = getCategory(invoice);
    if (cat === 'pharmacy') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><Pill className="h-3 w-3" /> Pharmacy</span>;
    if (cat === 'lab') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700"><FlaskConical className="h-3 w-3" /> Lab Test</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"><Stethoscope className="h-3 w-3" /> Consultation</span>;
  };

  const myInvoices = invoices
    .filter(i => i.patientId === currentUser.id)
    .filter(i => {
      const searchMatch = 
        i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === 'all' || i.status === statusFilter;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalUnpaid = myInvoices
    .filter(i => i.status === 'unpaid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const downloadInvoicePDF = (invoice: any) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); // Indigo-900
      doc.text('INVOICE', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Invoice ID: #${invoice.id}`, 14, 30);
      doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 14, 35);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 14, 40);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 45);
      
      // Patient Info
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text('Billed To:', 14, 60);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(currentUser.name, 14, 65);
      doc.text(currentUser.email, 14, 70);
      if (currentUser.phone) doc.text(currentUser.phone, 14, 75);
      
      // Items Table
      const tableColumn = ["Description", "Type", "Base Amount", "GST %", "GST Amt", "Total"];
      const tableRows = (invoice.items || []).map((item: any) => [
        item.description,
        item.type.replace('_', ' '),
        `₹${(item.amount || 0).toFixed(2)}`,
        `${item.taxRate || 0}%`,
        `₹${(item.taxAmount || 0).toFixed(2)}`,
        `₹${((item.amount || 0) + (item.taxAmount || 0)).toFixed(2)}`
      ]);
      
      (doc as any).autoTable({
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        styles: { fontSize: 8, cellPadding: 3 },
      });
      
      // Total
      const finalY = (doc as any).lastAutoTable.finalY || 85;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Subtotal: ₹${(invoice.subtotal || invoice.amount).toFixed(2)}`, 140, finalY + 10);
      doc.text(`GST (18%): ₹${(invoice.totalTaxAmount || 0).toFixed(2)}`, 140, finalY + 16);
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Amount: ₹${invoice.amount.toFixed(2)}`, 140, finalY + 26);
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`GSTIN: ${invoice.gstNumber || '29AAAAA0000A1Z5'}`, 14, finalY + 26);
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('Thank you for choosing Sunrise Hospital.', 105, 280, { align: 'center' });
      
      doc.save(`Invoice_${invoice.id.substring(0, 8)}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your medical bills and payment history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Statement
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Outstanding</p>
            <p className="text-2xl font-bold text-slate-900">₹{totalUnpaid.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Paid</p>
            <p className="text-2xl font-bold text-slate-900">
              ₹{myInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Invoices</p>
            <p className="text-2xl font-bold text-slate-900">{myInvoices.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {myInvoices.map((invoice) => (
                <React.Fragment key={invoice.id}>
                  <tr className={`hover:bg-slate-50 transition-colors group ${expandedId === invoice.id ? 'bg-slate-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">#{invoice.id.substring(0, 8).toUpperCase()}</div>
                          <div className="mt-0.5">{getCategoryBadge(invoice)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
                        {new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        ₹{invoice.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ring-1 ring-inset ${
                        invoice.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                          : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          {expandedId === invoice.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => downloadInvoicePDF(invoice)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group-hover:opacity-100"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {invoice.status === 'unpaid' ? (
                          <button
                            onClick={() => payInvoice(invoice.id, 'cash')}
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors whitespace-nowrap"
                          >
                            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                            Pay
                          </button>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg">
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            Paid
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === invoice.id && invoice.items && invoice.items.length > 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 pb-4 bg-slate-50">
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                              <thead className="bg-white">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Item</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Base Price</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">GST %</th>
                                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">GST Amt</th>
                                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {(invoice.items || []).map((item: any) => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-2.5 text-sm text-slate-900">{item.description}</td>
                                    <td className="px-4 py-2.5 text-sm text-slate-900">₹{(item.amount || 0).toFixed(2)}</td>
                                    <td className="px-4 py-2.5 text-xs text-slate-500 text-center">{item.taxRate || 0}%</td>
                                    <td className="px-4 py-2.5 text-sm text-slate-900 text-right">₹{(item.taxAmount || 0).toFixed(2)}</td>
                                    <td className="px-4 py-2.5 text-sm font-bold text-slate-900 text-right">₹{((item.amount || 0) + (item.taxAmount || 0)).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-indigo-50/30">
                                <tr>
                                  <td colSpan={1} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Summary</td>
                                  <td className="px-4 py-2 text-sm text-slate-900">₹{(invoice.subtotal || invoice.amount).toFixed(2)}</td>
                                  <td className="px-4 py-2 text-center text-slate-400">—</td>
                                  <td className="px-4 py-2 text-sm text-slate-900 text-right">₹{(invoice.totalTaxAmount || 0).toFixed(2)}</td>
                                  <td className="px-4 py-2 text-sm font-black text-indigo-700 text-right">₹{invoice.amount.toFixed(2)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          <div className="p-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50">
                            <span>Hospital GSTIN: {invoice.gstNumber || '29AAAAA0000A1Z5'}</span>
                            <span className="font-medium text-slate-500">Verified & Tax Compliant</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {myInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <FileText className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900">No invoices found</h3>
                      <p className="text-sm text-slate-500 mt-1">You don't have any billing records matching your search.</p>
                    </div>
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
