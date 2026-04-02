import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Users, UserPlus, Calendar, Building, Activity, ArrowRight, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { users, appointments, departments, invoices } = useAppContext();

  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'patient').length;
  const totalAppointments = appointments.length;
  const totalDepartments = departments.length;
  
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Administration</h1>
          <p className="text-slate-500">Overview of hospital operations and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/reports" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Activity className="h-4 w-4 mr-2" />
            View Reports
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <UserPlus className="h-6 w-6" />
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" /> +12%
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalDoctors}</p>
            <p className="text-sm font-medium text-slate-500">Total Doctors</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" /> +8%
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
            <p className="text-sm font-medium text-slate-500">Total Patients</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" /> +24%
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalAppointments}</p>
            <p className="text-sm font-medium text-slate-500">Total Appointments</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-rose-50 p-3 rounded-xl text-rose-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" /> +18%
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Recent Appointments
            </h2>
            <Link to="/admin/appointments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {appointments.slice(-5).reverse().map(apt => {
              const patient = users.find(u => u.id === apt.patientId);
              const doctor = users.find(u => u.id === apt.doctorId);
              
              // Safely extract doctor's last name or fallback
              let doctorDisplayName = 'Unknown';
              if (doctor && doctor.name) {
                const nameParts = doctor.name.split(' ');
                doctorDisplayName = nameParts.length > 1 ? nameParts[1] : doctor.name;
              }

              return (
                <div key={apt.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={patient?.avatar || `https://ui-avatars.com/api/?name=${patient?.name || 'Patient'}&background=random`} alt={patient?.name || 'Patient'} className="w-10 h-10 rounded-full object-cover border border-slate-200 hidden sm:block" />
                    <div>
                      <p className="font-semibold text-slate-900">{patient?.name || 'Unknown Patient'} <span className="text-slate-400 font-normal mx-1">with</span> Dr. {doctorDisplayName}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {apt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {apt.time}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                    apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                    apt.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                    apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          {/* Departments Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-500" />
                Departments
              </h2>
              <Link to="/admin/departments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Manage <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {departments.slice(0, 4).map(dept => {
                const deptDoctors = users.filter(u => u.role === 'doctor' && u.departmentId === dept.id).length;
                return (
                  <div key={dept.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
                        <Building className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-slate-900">{dept.name}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {deptDoctors} Doctors
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-rose-500" />
                Financial Summary
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500 font-medium">Collected Revenue</span>
                  <span className="text-slate-900 font-bold">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500 font-medium">Pending Payments</span>
                  <span className="text-slate-900 font-bold">${pendingRevenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
