import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
  LayoutDashboard, Calendar, FileText, CreditCard, MessageSquare, Settings,
  Users, UserPlus, Activity, PieChart, Building, Loader2, Bed, Wrench,
  Pill, Menu, X, LogOut, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const DashboardLayout = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { currentUser, isAuthReady, logout } = useAppContext();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar when screen gets wider
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const roleLabel = currentUser.role.replace('_', ' ').replace('labtechnician', 'lab technician');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User profile */}
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base flex-shrink-0">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
          <p className="text-xs text-slate-500 capitalize truncate">{roleLabel}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href ||
            (link.href !== `/${currentUser.role}` && link.href !== '/labtechnician' && location.pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-indigo-600' : 'text-slate-400')} />
              <span className="flex-1">{link.name}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout at bottom */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={() => { logout(); }}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut className="h-5 w-5 text-slate-400" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Top Bar (replaces Navbar inside dashboards) ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-14 flex items-center px-4 gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/images/logo.png" alt="Sunrise" className="h-8 w-auto"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-extrabold text-base text-slate-900 tracking-tight hidden sm:block">
            Sunrise Hospital
          </span>
        </Link>

        {/* Current page title on mobile */}
        <span className="flex-1 text-sm font-semibold text-slate-700 capitalize lg:hidden truncate">
          {roleLabel} Portal
        </span>

        {/* Desktop: user name + role */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
            <p className="text-xs text-slate-500 capitalize">{roleLabel}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Mobile Sidebar Overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            {/* Drawer */}
            <div
              className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* ── Desktop Sidebar (always visible on lg+) ── */}
        <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
