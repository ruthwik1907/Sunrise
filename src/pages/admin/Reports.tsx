import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminReports() {
  const { appointments, invoices, departments, users } = useAppContext();

  const handleExportReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text('MediCare Analytics Report', 20, 30);
    
    // Date
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Summary Statistics
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Summary Statistics', 20, 65);
    
    const totalAppointments = appointments.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalDoctors = users.filter(u => u.role === 'doctor').length;
    const totalPatients = users.filter(u => u.role === 'patient').length;
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Appointments: ${totalAppointments}`, 20, 80);
    doc.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 20, 90);
    doc.text(`Total Doctors: ${totalDoctors}`, 20, 100);
    doc.text(`Total Patients: ${totalPatients}`, 20, 110);
    
    // Appointments by Status
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Appointments by Status', 20, 130);
    
    const statusTableData = statusData.map(item => [item.name, item.value.toString()]);
    
    (doc as any).autoTable({
      startY: 140,
      head: [['Status', 'Count']],
      body: statusTableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 }
    });
    
    // Revenue by Department
    const deptRevenue = departments.map(dept => {
      const deptInvoices = invoices.filter(inv => 
        appointments.find(apt => apt.id === inv.appointmentId)?.departmentId === dept.id
      );
      const revenue = deptInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      return [dept.name, `$${revenue.toLocaleString()}`];
    });
    
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Revenue by Department', 20, (doc as any).lastAutoTable.finalY + 20);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [['Department', 'Revenue']],
      body: deptRevenue,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 }
    });
    
    // Save the PDF
    doc.save('medicare-analytics-report.pdf');
  };

  // Prepare data for Appointments by Status chart
  const statusCounts = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const statusData = Object.keys(statusCounts).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: statusCounts[key]
  }));

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  // Prepare data for Revenue by Department
  const deptRevenue = departments.map(dept => {
    const deptAppointments = appointments.filter(a => a.departmentId === dept.id);
    const deptAppointmentIds = deptAppointments.map(a => a.id);
    
    const revenue = invoices
      .filter(i => i.status === 'paid' && i.appointmentId && deptAppointmentIds.includes(i.appointmentId))
      .reduce((sum, inv) => sum + inv.amount, 0);
      
    return {
      name: dept.name,
      revenue
    };
  }).filter(d => d.revenue > 0);

  // Data for Patient Growth (Unique patients seen per month over last 6 months)
  const patientGrowthData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toLocaleString('default', { month: 'short' });
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const uniquePatients = new Set(
      appointments
        .filter(a => a.date.startsWith(yearMonth))
        .map(a => a.patientId)
    ).size;
      
    return { month: monthStr, patients: uniquePatients };
  });

  // Data for Monthly Revenue (over last 6 months)
  const monthlyRevenueData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toLocaleString('default', { month: 'short' });
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const revenue = invoices
      .filter(inv => inv.status === 'paid' && inv.date.startsWith(yearMonth))
      .reduce((sum, inv) => sum + inv.amount, 0);
      
    return { month: monthStr, revenue };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive overview of hospital performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </button>
          <button 
            onClick={handleExportReport}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Revenue Trend</h2>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  formatter={(value: any) => value ? [`$${Number(value).toLocaleString()}`, 'Revenue'] : ['N/A', 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Growth Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Patient Growth</h2>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  formatter={(value: any) => value ? [Number(value), 'New Patients'] : ['N/A', 'New Patients']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments Status Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Appointments by Status</h2>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Department Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Revenue by Department</h2>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptRevenue}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={100} />
                <Tooltip 
                  formatter={(value: any) => value ? [`$${Number(value).toLocaleString()}`, 'Revenue'] : ['N/A', 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
