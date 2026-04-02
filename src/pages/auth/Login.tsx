import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext, Role } from '../../context/AppContext';
import { Activity, Mail, Lock, ArrowRight, ShieldCheck, UserCircle, Stethoscope, Loader2, Pill, Users, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    
    try {
      const loggedInUser = await login(email, password, role);
      toast.success('Successfully logged in!');
      
      // Map role to route path
      const roleToRoute = {
        patient: '/patient',
        doctor: '/doctor',
        admin: '/admin',
        pharmacist: '/pharmacist',
        receptionist: '/receptionist',
        lab_technician: '/labtechnician',
        labtechnician: '/labtechnician'
      };
      
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate(roleToRoute[loggedInUser.role] || '/');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        toast.error("Invalid email or password.");
      } else {
        toast.error(err.message || "Login failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const roleIcons = {
    patient: <UserCircle className="w-5 h-5 mb-1" />,
    doctor: <Stethoscope className="w-5 h-5 mb-1" />,
    admin: <ShieldCheck className="w-5 h-5 mb-1" />,
    pharmacist: <Pill className="w-5 h-5 mb-1" />,
    receptionist: <Users className="w-5 h-5 mb-1" />,
    lab_technician: <TestTube className="w-5 h-5 mb-1" />
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 text-indigo-600 mb-6 hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">MediCare</span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">I am logging in as a...</label>
              <div className="grid grid-cols-3 gap-3">
                {(['patient', 'doctor', 'admin', 'pharmacist', 'receptionist', 'lab_technician'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                      role === r
                        ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {roleIcons[r as keyof typeof roleIcons]}
                    {r === 'lab_technician' ? 'Lab Tech' : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-colors sm:text-sm"
                    placeholder={`${role}@example.com`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-colors sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">Remember me</label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Forgot password?</Link>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                By signing in, you agree to our <a href="#" className="underline hover:text-slate-700">Terms of Service</a> and <a href="#" className="underline hover:text-slate-700">Privacy Policy</a>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
