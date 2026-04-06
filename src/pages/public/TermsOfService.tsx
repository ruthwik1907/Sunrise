import React from 'react';
import { ShieldCheck, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-indigo-900 px-8 py-10 text-white relative">
          <Link to="/" className="inline-flex items-center text-indigo-200 hover:text-white transition-colors mb-6 text-sm font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-indigo-200">Last Updated: April 6, 2026</p>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <ShieldCheck className="h-48 w-48" />
          </div>
        </div>
        
        <div className="p-8 sm:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-indigo-600" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the Sunrise Hospital Management System ("System"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the System. Our services are provided primarily in the region of Renigunta, Andhra Pradesh, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Medical Services Disclosure</h2>
            <p>
              The System is a digital platform for managing medical records, appointments, and prescriptions. While we strive for 100% data accuracy, the digital records are supplementary to the physical clinical judgment of our licensed medical professionals. In case of emergencies, please visit our facility at Renigunta immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their login credentials. Any activity performed under your account is your responsibility. Patients must provide accurate and truthful information, including Date of Birth and Address, as these are critical for medical identification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Privacy and Data Security</h2>
            <p>
              Your use of the System is also governed by our Privacy Policy. We implement industrial-grade encryption but remind users that no digital transmission is 100% secure. We comply with Indian healthcare data regulations (DISHA) and other relevant local laws of Andhra Pradesh.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Billing and Payments</h2>
            <p>
              All consultation fees, pharmacy bills (SHPH prefix), and lab invoices (SHLB prefix) generated through the system are valid legal documents. Payments made via UPI, Card, or Cash at the counter are subject to our refund policy. GST is applicable as per Government of India norms.
            </p>
          </section>

          <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h2 className="text-xl font-bold text-indigo-900 mb-2">Emergency Contact</h2>
            <p className="text-indigo-800 text-sm">
              Sunrise Hospital, Railway Station Road, Renigunta, AP - 517520.<br/>
              Emergency Helpline: +91 877 227 1234
            </p>
          </section>
        </div>
        
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">© 2026 Sunrise Hospital. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
