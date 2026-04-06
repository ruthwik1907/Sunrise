import React from 'react';
import { MessageSquare, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function Messages() {
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8 text-center">
        <div className="h-32 w-32 bg-indigo-50 rounded-3xl flex items-center justify-center animate-pulse mx-auto">
          <MessageSquare className="h-16 w-16 text-indigo-300" />
        </div>
        <div className="absolute top-20 right-[35%] lg:right-[42%] bg-white p-2 rounded-xl shadow-lg border border-slate-100">
          <Clock className="h-6 w-6 text-amber-500" />
        </div>
      </div>
      
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 text-center">Secure Messaging</h1>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider mb-6 mx-auto">
        <Zap className="h-3 w-3 fill-current" /> Coming Soon
      </div>
      
      <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed mb-10 text-center">
        We are currently finalizing our end-to-end encrypted clinical messaging platform. 
        Soon, you'll be able to communicate directly with your doctors and care team in real-time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mx-auto">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 text-left">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">E2E Encrypted</h3>
            <p className="text-xs text-slate-500">Your conversations will be strictly private and secure.</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 text-left">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Direct Consultation</h3>
            <p className="text-xs text-slate-500">Instant access to medical advice from your specialists.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
