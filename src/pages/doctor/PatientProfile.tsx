import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Plus, FileText, Calendar, Mail, Phone, Clock, CheckCircle, Activity, Pill, User as UserIcon, X, Bed, Wrench, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function DoctorPatientProfile() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, users, appointments, prescriptions, labReports, addPrescription, updateAppointmentStatus, uploadLabReport, beds, equipment, bookBed, bookEquipment } = useAppContext();
  const navigate = useNavigate();
  
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabReportModal, setShowLabReportModal] = useState(false);
  const [showBedBookingModal, setShowBedBookingModal] = useState(false);
  const [showEquipmentBookingModal, setShowEquipmentBookingModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');
  const [testName, setTestName] = useState('');
  const [labReportFile, setLabReportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bedBookingData, setBedBookingData] = useState({
    bedId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [equipmentBookingData, setEquipmentBookingData] = useState({
    equipmentId: '',
    startDate: '',
    endDate: '',
    purpose: ''
  });

  if (!currentUser) return null;

  const patient = users.find(u => u.id === id && u.role === 'patient');
  
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient not found</h2>
        <p className="text-slate-500 mb-6">The patient you are looking for does not exist or you don't have access.</p>
        <button 
          onClick={() => navigate('/doctor/patients')} 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </button>
      </div>
    );
  }

  const patientApts = appointments.filter(a => a.patientId === patient.id && a.doctorId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const patientLabReports = labReports?.filter(r => r.patientId === patient.id && r.doctorId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPrescription({
        patientId: patient.id,
        doctorId: currentUser.id,
        appointmentId: selectedAptId,
        items: [], // TODO: Parse medications into items
        medications,
        notes
      });
      
      // Auto complete the appointment if it's not already
      const apt = appointments.find(a => a.id === selectedAptId);
      if (apt && apt.status !== 'completed') {
        await updateAppointmentStatus(selectedAptId, 'completed');
      }

      setShowPrescriptionModal(false);
      setMedications('');
      setNotes('');
      setSelectedAptId('');
      toast.success('Prescription added successfully');
    } catch (error) {
      toast.error('Failed to add prescription');
    }
  };

  const handleAddLabReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labReportFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    try {
      await uploadLabReport(labReportFile, patient.id, currentUser.id, testName);
      setShowLabReportModal(false);
      setTestName('');
      setLabReportFile(null);
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsUploading(false);
    }
  };

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
      doc.text(`Name: ${patient.name}`, 14, 55);
      doc.text(`Email: ${patient.email}`, 14, 60);
      if (patient.phone) {
        doc.text(`Phone: ${patient.phone}`, 14, 65);
      }
      
      // Medications
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Medications:', 14, 80);
      
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate-700
      
      const splitText = doc.splitTextToSize(rx.medications || 'No medications specified', 180);
      doc.text(splitText, 14, 90);
      
      // Notes
      if (rx.notes) {
        const notesY = 90 + (splitText.length * 5) + 10;
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text('Doctor\'s Notes:', 14, notesY);
        
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const notesSplit = doc.splitTextToSize(rx.notes, 180);
        doc.text(notesSplit, 14, notesY + 10);
      }
      
      // Footer
      const finalY = rx.notes ? (90 + (splitText.length * 5) + 10 + 10 + (doc.splitTextToSize(rx.notes, 180).length * 5)) : (90 + (splitText.length * 5));
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('This is a digitally generated prescription from MediCare.', 14, finalY + 20);
      
      doc.save(`Prescription_${patient.name}_${new Date(rx.date).getTime()}.pdf`);
      toast.success('Prescription downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleBookBed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookBed({
        bedId: bedBookingData.bedId,
        patientId: patient.id,
        doctorId: currentUser.id,
        startDate: bedBookingData.startDate,
        endDate: bedBookingData.endDate,
        reason: bedBookingData.reason,
        status: 'active'
      });
      setShowBedBookingModal(false);
      setBedBookingData({ bedId: '', startDate: '', endDate: '', reason: '' });
      toast.success('Bed booked successfully');
    } catch (error) {
      toast.error('Failed to book bed');
    }
  };

  const handleBookEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookEquipment({
        equipmentId: equipmentBookingData.equipmentId,
        patientId: patient.id,
        doctorId: currentUser.id,
        startDate: equipmentBookingData.startDate,
        endDate: equipmentBookingData.endDate,
        purpose: equipmentBookingData.purpose,
        status: 'active'
      });
      setShowEquipmentBookingModal(false);
      setEquipmentBookingData({ equipmentId: '', startDate: '', endDate: '', purpose: '' });
      toast.success('Equipment booked successfully');
    } catch (error) {
      toast.error('Failed to book equipment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'pending': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'completed': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'cancelled': return 'bg-red-50 text-red-700 ring-red-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/doctor/patients')} 
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Profile</h1>
          <p className="text-slate-500 text-sm mt-1">View patient details and medical history.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            <img 
              src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name || 'Patient'}&background=random`} 
              alt={patient.name || 'Patient'} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{patient.name || 'Unknown Patient'}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {patient.email}
              </div>
              {patient.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {patient.phone}
                </div>
              )}
            </div>
            <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Patient ID: {patient.id}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowBedBookingModal(true)}
            className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Bed className="h-4 w-4 mr-2" />
            Book Bed
          </button>
          <button 
            onClick={() => setShowEquipmentBookingModal(true)}
            className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Book Equipment
          </button>
          <button 
            onClick={() => setShowLabReportModal(true)}
            className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Activity className="h-4 w-4 mr-2" />
            Upload Lab Report
          </button>
          <button 
            onClick={() => setShowPrescriptionModal(true)}
            className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Prescription
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Appointment History
            </h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {patientApts.length} Total
            </span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[600px]">
            {patientApts.map(apt => (
              <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <p className="font-bold text-slate-900">
                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <span className="text-slate-300">•</span>
                      <Clock className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-700">{apt.time}</p>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 flex items-start gap-2">
                      <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{apt.reason}</span>
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset capitalize shrink-0 ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
                
                {apt.status === 'confirmed' && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Mark Completed
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedAptId(apt.id);
                        setShowPrescriptionModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      <Pill className="h-3.5 w-3.5 mr-1.5" />
                      Add Prescription
                    </button>
                  </div>
                )}
              </div>
            ))}
            {patientApts.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No appointments found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Prescriptions History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-500" />
              Prescriptions
            </h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {patientPrescriptions.length} Total
            </span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[600px]">
            {patientPrescriptions.map(rx => {
              const doctor = users.find(u => u.id === rx.doctorId);
              return (
                <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(rx.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Dr. {doctor?.name || 'Unknown'}</span>
                      <button
                        onClick={() => downloadPrescriptionPDF(rx)}
                        className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Download Prescription"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Pill className="h-3.5 w-3.5" /> Medications
                      </h4>
                      <p className="text-slate-800 text-sm whitespace-pre-wrap font-medium">{rx.medications}</p>
                    </div>
                    
                    {rx.notes && (
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" /> Doctor's Notes
                        </h4>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{rx.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {patientPrescriptions.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Pill className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No prescriptions found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lab Reports History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Lab Reports
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {patientLabReports.length} Total
            </span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[600px]">
            {patientLabReports.map(report => (
              <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(report.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset capitalize ${
                    report.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                  }`}>
                    {report.status}
                  </span>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      {report.testName}
                    </h4>
                  </div>
                  
                  {report.resultData && (
                    <div className="pt-4 border-t border-slate-100">
                      <a 
                        href={report.resultData} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-indigo-600 bg-white hover:bg-slate-50 shadow-sm transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View PDF Report
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {patientLabReports.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No lab reports found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-indigo-600" />
                Add Prescription
              </h3>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPrescription} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Related Appointment</label>
                <select
                  required
                  value={selectedAptId}
                  onChange={(e) => setSelectedAptId(e.target.value)}
                  className="block w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                >
                  <option value="">Select an appointment</option>
                  {patientApts.filter(a => a.status !== 'cancelled').map(a => (
                    <option key={a.id} value={a.id}>{a.date} at {a.time} - {a.reason}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5">Linking to an appointment helps maintain accurate medical records.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Medications & Dosage</label>
                <textarea
                  required
                  rows={4}
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="block w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm resize-none"
                  placeholder="e.g. Amoxicillin 500mg, 1 tablet 3 times a day for 7 days"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor's Notes / Instructions (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm resize-none"
                  placeholder="Additional instructions, dietary restrictions, or warnings..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Lab Report Modal */}
      {showLabReportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Upload Lab Report
              </h3>
              <button 
                onClick={() => setShowLabReportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddLabReport} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Test Name</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="block w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                  placeholder="e.g. Complete Blood Count (CBC)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload PDF Report</label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setLabReportFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLabReportModal(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Bed Booking Modal */}
      {showBedBookingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bed className="h-5 w-5 text-indigo-600" />
                Book Bed for {patient.name}
              </h3>
              <button
                onClick={() => setShowBedBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleBookBed} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Bed</label>
                <select
                  required
                  value={bedBookingData.bedId}
                  onChange={(e) => setBedBookingData({ ...bedBookingData, bedId: e.target.value })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a bed</option>
                  {beds.filter(b => b.status === 'available').map((bed) => (
                    <option key={bed.id} value={bed.id}>
                      Bed {bed.bedNumber} - {bed.roomNumber} ({bed.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={bedBookingData.startDate}
                    onChange={(e) => setBedBookingData({ ...bedBookingData, startDate: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={bedBookingData.endDate}
                    onChange={(e) => setBedBookingData({ ...bedBookingData, endDate: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Admission</label>
                <textarea
                  required
                  rows={3}
                  value={bedBookingData.reason}
                  onChange={(e) => setBedBookingData({ ...bedBookingData, reason: e.target.value })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Medical reason for bed booking..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBedBookingModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700"
                >
                  Book Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Equipment Booking Modal */}
      {showEquipmentBookingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-600" />
                Book Equipment for {patient.name}
              </h3>
              <button
                onClick={() => setShowEquipmentBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleBookEquipment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Equipment</label>
                <select
                  required
                  value={equipmentBookingData.equipmentId}
                  onChange={(e) => setEquipmentBookingData({ ...equipmentBookingData, equipmentId: e.target.value })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose equipment</option>
                  {equipment.filter(e => e.status === 'available').map((equip) => (
                    <option key={equip.id} value={equip.id}>
                      {equip.name} ({equip.type}) - {equip.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={equipmentBookingData.startDate}
                    onChange={(e) => setEquipmentBookingData({ ...equipmentBookingData, startDate: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={equipmentBookingData.endDate}
                    onChange={(e) => setEquipmentBookingData({ ...equipmentBookingData, endDate: e.target.value })}
                    className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
                <textarea
                  required
                  rows={3}
                  value={equipmentBookingData.purpose}
                  onChange={(e) => setEquipmentBookingData({ ...equipmentBookingData, purpose: e.target.value })}
                  className="block w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Medical purpose for equipment booking..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEquipmentBookingModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700"
                >
                  Book Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
