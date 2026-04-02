import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, Search, Filter, CreditCard, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function AdminInvoices() {
  const { invoices, users } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = invoices.filter(invoice => {
    const patient = users.find(u => u.id === invoice.patientId);
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20">{status}</span>;
    }
  };

  const downloadInvoicePDF = (invoice: any) => {
    const patient = users.find(u => u.id === invoice.patientId);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Invoice #: ${invoice.id.substring(0, 8).toUpperCase()}`, 20, 35);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 42);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 49);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 56);
    
    // Patient Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Bill To:', 140, 35);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Patient: ${patient?.name || 'Unknown'}`, 140, 42);
    doc.text(`Email: ${patient?.email || 'N/A'}`, 140, 49);
    
    // Items Table
    const tableColumn = ["Description", "Type", "Amount"];
    const tableRows = invoice.items.map((item: any) => [
      item.description,
      item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('_', ' '),
      `$${item.amount.toFixed(2)}`
    ]);
    
    (doc as any).autoTable({
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 2: { halign: 'right' } }
    });
    
    // Total
    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Amount: $${invoice.amount.toFixed(2)}`, 140, finalY + 15);
    
    if (invoice.paymentMethod) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`Payment Method: ${invoice.paymentMethod.toUpperCase()}`, 20, finalY + 15);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('Thank you for choosing our healthcare services.', 105, 280, { align: 'center' });
    
    doc.save(`Invoice_${invoice.id.substring(0, 8)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all patient invoices.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name or invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full sm:w-auto"
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
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Patient</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map((invoice) => {
                const patient = users.find(u => u.id === invoice.patientId);
                return (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-900 text-sm">
                          #{invoice.id.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                          {patient?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{patient?.name || 'Unknown Patient'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-900">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => downloadInvoicePDF(invoice)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="h-8 w-8 text-slate-300 mb-2" />
                      <p>No invoices found matching your criteria.</p>
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
