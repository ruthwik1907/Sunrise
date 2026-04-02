import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Calendar, FileText, CreditCard, Activity, ArrowRight, Clock, CheckCircle, AlertCircle, Bed, Wrench, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { currentUser, appointments, prescriptions, invoices, labReports, users, beds, equipment, bedBookings, equipmentBookings } = useAppContext();

  if (!currentUser) return null;

  const myAppointments = appointments.filter(a => a.patientId === currentUser.id);
  const upcomingAppointments = myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const myPrescriptions = prescriptions.filter(p => p.patientId === currentUser.id);
  const myInvoices = invoices.filter(i => i.patientId === currentUser.id);
  const unpaidInvoices = myInvoices.filter(i => i.status === 'unpaid');
  const myLabReports = labReports.filter(l => l.patientId === currentUser.id);
  const pendingLabReports = myLabReports.filter(l => l.status === 'pending');

  const downloadPrescriptionPDF = (rx: any) => {
    try {
      const doctor = users.find(u => u.id === rx.doctorId);
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); // Indigo-900
      doc.text('PRESCRIPTION', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Date: ${new Date(rx.date).toLocaleDateString()}`, 14, 30);
      doc.text(`Doctor: Dr. ${doctor?.name || 'Unknown'}`, 14, 35);
      
      // Patient Info
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text('Patient Information:', 14, 50);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Name: ${currentUser.name}`, 14, 55);
      doc.text(`Email: ${currentUser.email}`, 14, 60);
      
      // Medications
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Medications:', 14, 75);
      
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate-700
      
      const splitText = doc.splitTextToSize(rx.medications || 'No medications specified', 180);
      doc.text(splitText, 14, 85);
      
      // Footer
      const finalY = 85 + (splitText.length * 5);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('This is a digitally generated prescription from MediCare.', 14, finalY + 20);
      
      doc.save(`Prescription_${new Date(rx.date).getTime()}.pdf`);
      toast.success('Prescription downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser.name}</h1>
          <p className="text-slate-500">Here is your healthcare summary for today.</p>
        </div>
        <Link to="/book-appointment" className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <Calendar className="h-4 w-4 mr-2" />
          Book Appointment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Upcoming Visits</p>
            <p className="text-2xl font-bold text-slate-900">{upcomingAppointments.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Prescriptions</p>
            <p className="text-2xl font-bold text-slate-900">{myPrescriptions.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-amber-50 p-4 rounded-xl text-amber-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Lab Tests</p>
            <p className="text-2xl font-bold text-slate-900">{pendingLabReports.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-rose-50 p-4 rounded-xl text-rose-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Unpaid Bills</p>
            <p className="text-2xl font-bold text-slate-900">{unpaidInvoices.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Upcoming Appointments
            </h2>
            <Link to="/patient/appointments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 3).map(apt => {
                const doctor = users.find(u => u.id === apt.doctorId);
                return (
                  <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img src={doctor?.avatar || `https://ui-avatars.com/api/?name=${doctor?.name || 'Doctor'}&background=random`} alt={doctor?.name || 'Doctor'} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-semibold text-slate-900">Dr. {doctor?.name || 'Unknown Doctor'}</p>
                          <p className="text-sm text-slate-500 capitalize">{doctor?.specialty || 'General Practice'}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
                        apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.status === 'confirmed' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        <span className="capitalize">{apt.status}</span>
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-6 text-sm text-slate-600 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{apt.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No upcoming appointments</p>
                <Link to="/book-appointment" className="mt-2 text-indigo-600 hover:text-indigo-700 hover:underline text-sm font-medium">Book one now</Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Recent Prescriptions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Recent Prescriptions
              </h2>
              <Link to="/patient/records" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {myPrescriptions.length > 0 ? (
                myPrescriptions.slice(0, 2).map(rx => {
                  const doctor = users.find(u => u.id === rx.doctorId);
                  return (
                    <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">Prescribed by Dr. {doctor?.name || 'Unknown Doctor'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(rx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadPrescriptionPDF(rx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Download Prescription"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">Rx</span>
                        </div>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                        <p className="text-sm text-slate-700 line-clamp-2 font-medium">{rx.medications}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No recent prescriptions.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Lab Reports */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                Lab Reports
              </h2>
              <Link to="/patient/records" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {myLabReports.length > 0 ? (
                myLabReports.slice(0, 2).map(lab => {
                  return (
                    <div key={lab.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${lab.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{lab.testName}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{new Date(lab.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
                        lab.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {lab.status === 'completed' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        <span className="capitalize">{lab.status}</span>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Activity className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No lab reports available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Beds */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bed className="h-5 w-5 text-blue-500" />
              Available Beds
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {beds.filter(b => b.status === 'available').length} Available
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {beds.filter(b => b.status === 'available').length > 0 ? (
              beds.filter(b => b.status === 'available').slice(0, 5).map(bed => {
                const department = departments.find(d => d.id === bed.departmentId);
                return (
                  <div key={bed.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">Bed {bed.bedNumber}</h3>
                        <p className="text-sm text-slate-600">Room {bed.roomNumber} • {bed.type}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{department?.name || 'General Ward'}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Bed className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No beds available at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Equipment */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-500" />
              Available Equipment
            </h2>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {equipment.filter(e => e.status === 'available').length} Available
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {equipment.filter(e => e.status === 'available').length > 0 ? (
              equipment.filter(e => e.status === 'available').slice(0, 5).map(equip => {
                const department = departments.find(d => d.id === equip.departmentId);
                return (
                  <div key={equip.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{equip.name}</h3>
                        <p className="text-sm text-slate-600">{equip.type} • {equip.location}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{department?.name || 'General Equipment'}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Wrench className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No equipment available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Bookings */}
      {(bedBookings.filter(b => b.patientId === currentUser.id).length > 0 || equipmentBookings.filter(b => b.patientId === currentUser.id).length > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              My Resource Bookings
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {bedBookings.filter(b => b.patientId === currentUser.id).map(booking => {
              const bed = beds.find(b => b.id === booking.bedId);
              return (
                <div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-semibold text-slate-900">Bed {bed?.bedNumber} Booking</h3>
                        <p className="text-sm text-slate-600">Room {bed?.roomNumber} • {bed?.type}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>From: {new Date(booking.startDate).toLocaleDateString()}</span>
                    <span>To: {new Date(booking.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
            {equipmentBookings.filter(b => b.patientId === currentUser.id).map(booking => {
              const equip = equipment.find(e => e.id === booking.equipmentId);
              return (
                <div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-5 w-5 text-purple-500" />
                      <div>
                        <h3 className="font-semibold text-slate-900">{equip?.name} Booking</h3>
                        <p className="text-sm text-slate-600">{equip?.type} • {equip?.location}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>From: {new Date(booking.startDate).toLocaleDateString()}</span>
                    <span>To: {new Date(booking.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
