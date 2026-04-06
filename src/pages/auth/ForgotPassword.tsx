import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendResetOTP, verifyResetOTP, resetPasswordWithOTP } = useAppContext();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendResetOTP(email);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyResetOTP(email, otp);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPasswordWithOTP(email, otp, password);
      // Wait for toast from context
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex justify-center items-center gap-2 text-indigo-600 mb-6 hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">Sunrise Hospital</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-600">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email address</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all sm:text-sm"
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
              >
                {isLoading ? 'Sending...' : 'Send Verification OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 text-center">Verify Identity</label>
                <p className="text-xs text-slate-500 text-center mb-4">Enter the 6-digit code sent to {email}</p>
                <div className="mt-1 relative flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-48 text-center px-4 py-4 text-2xl font-black tracking-[0.5em] border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all"
              >
                Verify & Continue
              </button>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all sm:text-sm"
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
              >
                Save New Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
