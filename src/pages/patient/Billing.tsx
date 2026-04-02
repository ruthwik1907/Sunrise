import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CreditCard, CheckCircle, Download, FileText, Search, Filter, AlertCircle, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function PatientBilling() {
  const { currentUser, invoices, payInvoice } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!currentUser) return null;

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
      const tableColumn = ["Description", "Type", "Amount"];
      const tableRows = invoice.items?.map((item: any) => [
        item.description,
        item.type,
        `$${item.amount.toFixed(2)}`
      ]) || [['Consultation Fee', 'consultation', `$${invoice.amount.toFixed(2)}`]];
      
      (doc as any).autoTable({
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        styles: { fontSize: 10, cellPadding: 5 },
      });
      
      // Total
      const finalY = (doc as any).lastAutoTable.finalY || 85;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Amount: $${invoice.amount.toFixed(2)}`, 14, finalY + 15);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Thank you for your business.', 14, finalY + 35);
      
      doc.save(`Invoice_${invoice.id}.pdf`);
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
            <p className="text-2xl font-bold text-slate-900">${totalUnpaid.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Paid</p>
            <p className="text-2xl font-bold text-slate-900">
              ${myInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
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
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mr-3">
                        <FileText className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">#{invoice.id}</div>
                        <div className="text-sm text-slate-500 line-clamp-1 max-w-xs">{invoice.description}</div>
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
                      ${invoice.amount.toFixed(2)}
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
                        onClick={() => downloadInvoicePDF(invoice)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {invoice.status === 'unpaid' ? (
                        <button 
                          onClick={() => payInvoice(invoice.id, 'cash')}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Paid
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
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
