import React from 'react';
import { ShieldCheck, Lock, ArrowLeft, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-emerald-900 px-8 py-10 text-white relative">
          <Link to="/" className="inline-flex items-center text-emerald-200 hover:text-white transition-colors mb-6 text-sm font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-emerald-200">Last Updated: April 6, 2026</p>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <ShieldCheck className="h-48 w-48" />
          </div>
        </div>
        
        <div className="p-8 sm:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-emerald-600" /> Data Privacy & Sunrise Hospital
            </h2>
            <p>
              Your privacy is critical to Sunrise Hospital, Renigunta. We are committed to protecting the Personal Health Information (PHI) of our patients and the professional data of our staff. This policy outlines our standards for data collection, usage, and security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
            <p>
              We collect information necessary for clinical care and administrative management:
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Patient Identity:</strong> Name, Date of Birth (DOB), Address, Phone Number, and MRN.</li>
              <li><strong>Clinical Data:</strong> Vital signs, diagnosis, prescriptions, and lab reports.</li>
              <li><strong>Financial Data:</strong> Transaction history for billing (SHPH, SHLB, SHCS invoices).</li>
              <li><strong>Technical Data:</strong> IP address, device type, and login timestamps (Audit Logs).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use and Share Information</h2>
            <p>
              Your data is used specifically for:
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Providing world-class medical consultation and treatment.</li>
              <li>Managing resource allocation (Bed and Equipment bookings).</li>
              <li>Communicating clinical updates via Notifications and Reports.</li>
              <li>Ensuring operational integrity through Audit Logs.</li>
            </ul>
            <p className="mt-4 italic">Note: We DO NOT sell patient data to third-party pharmaceutical or marketing companies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-emerald-600" /> 3. Data Confidentiality & Access
            </h2>
            <p>
              Access to PHI is strictly restricted based on roles:
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Doctors:</strong> Access to assigned patient profiles and clinical history.</li>
              <li><strong>Pharmacists:</strong> Access to prescription items for dispensation.</li>
              <li><strong>Receptionists:</strong> Access to non-clinical check-in and billing data.</li>
              <li><strong>Admins:</strong> Oversight of system-wide operations and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Retention and Right to Deletion</h2>
            <p>
              Medical records are retained as per the healthcare guidelines of the Andhra Pradesh state government. Patients have the right to request a digital export of their data through the Receptionist counter.
            </p>
          </section>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h2 className="text-xl font-bold text-emerald-900 mb-2">Compliance & Data Officer</h2>
            <p className="text-emerald-800 text-sm">
              IT Security Department, Sunrise Hospital, Renigunta, AP - 517520.<br/>
              Email: security@sunrisehospital.com
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">© 2026 Sunrise Hospital. Your health, our priority.</p>
        </div>
      </div>
    </div>
  );
}
