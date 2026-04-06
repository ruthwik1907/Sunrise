import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  CreditCard, Search, Printer, CheckCircle, Clock, XCircle, ArrowRight,
  Filter, FileText, User, IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReceptionistBilling() {
  const { currentUser, invoices, users, payInvoice } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!currentUser) return null;

  const filteredInvoices = invoices
    .filter(inv => {
      const patient = users.find(u => u.id === inv.patientId);
      const matchesSearch = 
        (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.invoiceId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handlePayment = async (id: string) => {
    try {
      await payInvoice(id, 'cash');
      toast.success('Payment recorded successfully!');
    } catch {
      toast.error('Failed to record payment');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing Control</h1>
        <p className="text-sm text-slate-500">Manage patient invoices, service fees, and settlement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
          <CreditCard className="absolute top-0 right-0 h-32 w-32 text-white opacity-10 -mr-8 -mt-8 rotate-12" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Pending Revenue</p>
            <h3 className="text-3xl font-bold tracking-tight">
              ₹{invoices.filter(i => i.status === 'unpaid' || i.status === 'pending').reduce((acc, current) => acc + (current.totalAmount || 0), 0).toLocaleString()}
            </h3>
          </div>
          <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
            Audit Report
          </button>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Name or Invoice ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-indigo-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="paid">Settled</option>
              <option value="unpaid">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                {['ID', 'Patient', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredInvoices.map((inv) => {
                const patient = users.find(u => u.id === inv.patientId);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                       <span className="text-xs font-bold text-slate-400">#{inv.invoiceId || inv.id.split('-')[0].toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-xs text-uppercase">
                             {patient?.name.charAt(0) || <User className="h-3 w-3" />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">{patient?.name || 'Member'}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">{inv.type || 'Service'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-900">₹{(inv.totalAmount || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                         inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                       }`}>
                         {inv.status === 'paid' ? 'Settled' : 'Unpaid'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center gap-2 justify-end">
                          {inv.status !== 'paid' && (
                            <button onClick={() => handlePayment(inv.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-700 transition-all shadow-sm">
                               Pay
                            </button>
                          )}
                          <button className="p-2 text-slate-300 hover:text-slate-600">
                             <Printer className="h-4 w-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
