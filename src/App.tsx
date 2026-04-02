/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from 'react-hot-toast';

// Lazy load Public Pages
const Home = React.lazy(() => import('./pages/public/Home'));
const About = React.lazy(() => import('./pages/public/About'));
const Doctors = React.lazy(() => import('./pages/public/Doctors'));
const DoctorProfile = React.lazy(() => import('./pages/public/DoctorProfile'));
const BookAppointment = React.lazy(() => import('./pages/public/BookAppointment'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));

// Lazy load Patient Pages
const PatientDashboard = React.lazy(() => import('./pages/patient/Dashboard'));
const PatientAppointments = React.lazy(() => import('./pages/patient/Appointments'));
const PatientRecords = React.lazy(() => import('./pages/patient/Records'));
const PatientBilling = React.lazy(() => import('./pages/patient/Billing'));
const PatientMessages = React.lazy(() => import('./pages/patient/Messages'));
const PatientSettings = React.lazy(() => import('./pages/patient/Settings'));

// Lazy load Doctor Pages
const DoctorDashboard = React.lazy(() => import('./pages/doctor/Dashboard'));
const DoctorPatients = React.lazy(() => import('./pages/doctor/Patients'));
const DoctorPatientProfile = React.lazy(() => import('./pages/doctor/PatientProfile'));
const DoctorAppointments = React.lazy(() => import('./pages/doctor/Appointments'));
const DoctorSchedule = React.lazy(() => import('./pages/doctor/Schedule'));
const DoctorMessages = React.lazy(() => import('./pages/doctor/Messages'));
const DoctorSettings = React.lazy(() => import('./pages/doctor/Settings'));

// Lazy load Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminDoctors = React.lazy(() => import('./pages/admin/Doctors'));
const AdminPatients = React.lazy(() => import('./pages/admin/Patients'));
const AdminAppointments = React.lazy(() => import('./pages/admin/Appointments'));
const AdminDepartments = React.lazy(() => import('./pages/admin/Departments'));
const AdminBeds = React.lazy(() => import('./pages/admin/Beds'));
const AdminEquipment = React.lazy(() => import('./pages/admin/Equipment'));
const AdminInvoices = React.lazy(() => import('./pages/admin/Invoices'));
const AdminReports = React.lazy(() => import('./pages/admin/Reports'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));

// Lazy load Staff Pages
const PharmacistDashboard = React.lazy(() => import('./pages/pharmacist/Dashboard'));
const ReceptionistDashboard = React.lazy(() => import('./pages/receptionist/Dashboard'));
const LabTechnicianDashboard = React.lazy(() => import('./pages/labtechnician/Dashboard'));

export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" />
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
            <Route path="/doctors" element={<><Navbar /><Doctors /><Footer /></>} />
            <Route path="/doctors/:id" element={<><Navbar /><DoctorProfile /><Footer /></>} />
            <Route path="/book-appointment" element={<><Navbar /><BookAppointment /><Footer /></>} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
            <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />
            <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />

            {/* Patient Portal */}
            <Route path="/patient" element={<DashboardLayout allowedRoles={['patient']} />}>
              <Route index element={<PatientDashboard />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="records" element={<PatientRecords />} />
              <Route path="billing" element={<PatientBilling />} />
              <Route path="messages" element={<PatientMessages />} />
              <Route path="settings" element={<PatientSettings />} />
              <Route path="*" element={<Navigate to="/patient" replace />} />
            </Route>

            {/* Doctor Portal */}
            <Route path="/doctor" element={<DashboardLayout allowedRoles={['doctor']} />}>
              <Route index element={<DoctorDashboard />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="patients/:id" element={<DoctorPatientProfile />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="messages" element={<DoctorMessages />} />
              <Route path="settings" element={<DoctorSettings />} />
              <Route path="*" element={<Navigate to="/doctor" replace />} />
            </Route>

            {/* Admin Portal */}
            <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
              <Route index element={<AdminDashboard />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="beds" element={<AdminBeds />} />
              <Route path="equipment" element={<AdminEquipment />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* Pharmacist Portal */}
            <Route path="/pharmacist" element={<DashboardLayout allowedRoles={['pharmacist']} />}>
              <Route index element={<PharmacistDashboard />} />
              <Route path="*" element={<Navigate to="/pharmacist" replace />} />
            </Route>

            {/* Receptionist Portal */}
            <Route path="/receptionist" element={<DashboardLayout allowedRoles={['receptionist']} />}>
              <Route index element={<ReceptionistDashboard />} />
              <Route path="*" element={<Navigate to="/receptionist" replace />} />
            </Route>

            {/* Lab Technician Portal */}
            <Route path="/labtechnician" element={<DashboardLayout allowedRoles={['lab_technician']} />}>
              <Route index element={<LabTechnicianDashboard />} />
              <Route path="*" element={<Navigate to="/labtechnician" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AppProvider>
  );
}
