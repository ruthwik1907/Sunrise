  import React from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Navbar } from './Navbar';
import { 
  LayoutDashboard, Calendar, FileText, CreditCard, MessageSquare, Settings, 
  Users, UserPlus, Activity, PieChart, Building, Loader2, Bed, Wrench,
  Pill
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const DashboardLayout = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { currentUser, isAuthReady } = useAppContext();
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  const patientLinks = [
    { name: 'Dashboard', href: '/patient', icon: LayoutDashboard },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Medical Records', href: '/patient/records', icon: FileText },
    { name: 'Billing', href: '/patient/billing', icon: CreditCard },
    { name: 'Messages', href: '/patient/messages', icon: MessageSquare },
    { name: 'Settings', href: '/patient/settings', icon: Settings },
  ];

  const doctorLinks = [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'Schedule', href: '/doctor/schedule', icon: Calendar },
    { name: 'Messages', href: '/doctor/messages', icon: MessageSquare },
    { name: 'Settings', href: '/doctor/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Doctors', href: '/admin/doctors', icon: UserPlus },
    { name: 'Patients', href: '/admin/patients', icon: Users },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Departments', href: '/admin/departments', icon: Building },
    { name: 'Beds', href: '/admin/beds', icon: Bed },
    { name: 'Equipment', href: '/admin/equipment', icon: Wrench },
    { name: 'Invoices', href: '/admin/invoices', icon: CreditCard },
    { name: 'Reports', href: '/admin/reports', icon: PieChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const pharmacistLinks = [
    { name: 'Dashboard', href: '/pharmacist', icon: LayoutDashboard },
  ];

  const receptionistLinks = [
    { name: 'Dashboard', href: '/receptionist', icon: LayoutDashboard },
  ];

  const labTechnicianLinks = [
    { name: 'Dashboard', href: '/labtechnician', icon: LayoutDashboard },
  ];

  let links = patientLinks;
  if (currentUser.role === 'doctor') links = doctorLinks;
  if (currentUser.role === 'admin') links = adminLinks;
  if (currentUser.role === 'pharmacist') links = pharmacistLinks;
  if (currentUser.role === 'receptionist') links = receptionistLinks;
  if (currentUser.role === 'lab_technician' || currentUser.role === 'labtechnician') links = labTechnicianLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href || (link.href !== `/${currentUser.role}` && location.pathname.startsWith(link.href));
              
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-indigo-700" : "text-slate-400")} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
