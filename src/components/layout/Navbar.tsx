import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Activity, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 text-indigo-600" onClick={closeMenu}>
              <Activity className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight text-slate-900">MediCare</span>
            </Link>
          </div>
          
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <Link to="/" className="border-transparent text-slate-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Home</Link>
            <Link to="/about" className="border-transparent text-slate-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">About / Departments</Link>
            <Link to="/doctors" className="border-transparent text-slate-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Doctors Directory</Link>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!currentUser ? (
              <>
                <Link to="/login" className="text-slate-500 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                <Link to="/book-appointment" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">Book Appointment</Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to={
                    currentUser.role === 'lab_technician' || currentUser.role === 'labtechnician'
                      ? '/labtechnician'
                      : `/${currentUser.role}`
                  }
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
                >
                  <UserIcon className="h-5 w-5" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 p-2">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" onClick={closeMenu} className="border-transparent text-slate-500 hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Home</Link>
            <Link to="/about" onClick={closeMenu} className="border-transparent text-slate-500 hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">About / Departments</Link>
            <Link to="/doctors" onClick={closeMenu} className="border-transparent text-slate-500 hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Doctors Directory</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200">
            {!currentUser ? (
              <div className="flex flex-col space-y-2 px-4">
                <Link to="/login" onClick={closeMenu} className="block text-center text-slate-500 hover:text-slate-900 px-3 py-2 rounded-md text-base font-medium border border-slate-200">Login</Link>
                <Link to="/book-appointment" onClick={closeMenu} className="block text-center bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-base font-medium transition-colors">Book Appointment</Link>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4">
                <Link to={`/${currentUser.role}`} onClick={closeMenu} className="flex items-center gap-2 text-base font-medium text-slate-700 hover:text-indigo-600">
                  <UserIcon className="h-5 w-5" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 p-2">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
