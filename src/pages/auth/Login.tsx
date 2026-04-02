import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext, Role } from '../../context/AppContext';
import { Mail, Lock, ArrowRight, ShieldCheck, Stethoscope, Pill, Users, TestTube2, Building2, HeartPulse, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const staffRoles: { role: Role; label: string; icon: React.ReactNode; color: string }[] = [
  { role: 'doctor', label: 'Doctor', icon: <Stethoscope className="h-5 w-5" />, color: 'bg-blue-500' },
  { role: 'admin', label: 'Admin', icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-purple-500' },
  { role: 'pharmacist', label: 'Pharmacist', icon: <Pill className="h-5 w-5" />, color: 'bg-green-500' },
  { role: 'receptionist', label: 'Receptionist', icon: <Users className="h-5 w-5" />, color: 'bg-orange-500' },
  { role: 'lab_technician', label: 'Lab Tech', icon: <TestTube2 className="h-5 w-5" />, color: 'bg-cyan-500' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('patient');
  const [isStaff, setIsStaff] = useState(false);
  const [selectedStaffRole, setSelectedStaffRole] = useState<Role>('doctor');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const activeRole = isStaff ? selectedStaffRole : 'patient';

  const handleToggle = (staff: boolean) => {
    setIsStaff(staff);
    setRole(staff ? selectedStaffRole : 'patient');
  };

  const handleStaffRoleSelect = (r: Role) => {
    setSelectedStaffRole(r);
    setRole(r);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password, activeRole);
      toast.success('Welcome back! 👋');
      const roleToRoute: Record<string, string> = {
        patient: '/patient', doctor: '/doctor', admin: '/admin',
        pharmacist: '/pharmacist', receptionist: '/receptionist',
        lab_technician: '/labtechnician', labtechnician: '/labtechnician'
      };
      navigate(redirectTo || roleToRoute[loggedInUser.role] || '/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        toast.error('Invalid email or password.');
      } else {
        toast.error(err.message || 'Login failed. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #db2777 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/5"></div>
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3 w-fit">
          <img src="/images/logo.png" alt="Sunrise" className="h-10 w-10 rounded-xl" onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
          <span className="text-2xl font-extrabold text-white tracking-tight">Sunrise Hospital</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-start">
          <div className="p-4 bg-white/15 rounded-2xl mb-6 backdrop-blur-sm border border-white/20">
            <HeartPulse className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Caring for you,<br />every step of the way.
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Sunrise Hospital — where world-class healthcare meets compassionate service. Access your health information securely.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Appointments', 'Lab Reports', 'Prescriptions', 'Billing'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-medium border border-white/20 backdrop-blur-sm">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* Building icon bottom */}
        <div className="relative z-10 flex items-center gap-2 text-white/50 text-sm">
          <Building2 className="h-4 w-4" />
          <span>19/472, Old Check Post Circle · 9494994220</span>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-slate-50 relative overflow-hidden">
        {/* Soft bg blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-100 opacity-40 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-100 opacity-30 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">Sunrise Hospital</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Create one free →
              </Link>
            </p>
          </div>

          {/* ── Patient / Staff Toggle Slider ── */}
          <div className="mb-8">
            <div className="relative flex bg-slate-200 rounded-2xl p-1 w-full">
              {/* Sliding pill */}
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-in-out shadow-md"
                style={{
                  left: isStaff ? 'calc(50%)' : '4px',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                }}
              />
              <button
                type="button"
                onClick={() => handleToggle(false)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${!isStaff ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <HeartPulse className="h-4 w-4" />
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleToggle(true)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${isStaff ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Building2 className="h-4 w-4" />
                Hospital Staff
              </button>
            </div>
          </div>

          {/* Staff Role Selector — only visible in Staff mode */}
          <div className={`transition-all duration-300 overflow-hidden ${isStaff ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select your role</p>
            <div className="grid grid-cols-5 gap-2">
              {staffRoles.map(({ role: r, label, icon, color }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleStaffRoleSelect(r)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs font-medium transition-all duration-200 border-2 ${
                    selectedStaffRole === r
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm scale-105'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40'
                  }`}
                >
                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${selectedStaffRole === r ? color : 'bg-slate-300'} transition-colors`}>
                    {icon}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 h-4 w-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={isStaff ? `${selectedStaffRole}@hospital.com` : 'patient@example.com'}
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-indigo-500/40 active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            By signing in you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
