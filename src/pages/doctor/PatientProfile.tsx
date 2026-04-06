import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  ArrowLeft, Plus, FileText, Calendar, Mail, Phone, Clock, 
  CheckCircle, Activity, Pill, User as UserIcon, X, Bed, 
  Wrench, Download, Search 
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function DoctorPatientProfile() {
  const { id } = useParams<{ id: string }>();
  const { 
    currentUser, users, appointments, prescriptions, labReports, 
    addPrescription, updateAppointmentStatus, uploadLabReport, 
    beds, equipment, bookBed, bookEquipment, inventory 
  } = useAppContext();
  const navigate = useNavigate();
  
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabReportModal, setShowLabReportModal] = useState(false);
  const [showBedBookingModal, setShowBedBookingModal] = useState(false);
  const [showEquipmentBookingModal, setShowEquipmentBookingModal] = useState(false);
  
  const [selectedAptId, setSelectedAptId] = useState('');
  const [medSearchTerm, setMedSearchTerm] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
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
    if (prescriptionItems.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }
    try {
      await addPrescription({
        patientId: patient.id,
        doctorId: currentUser.id,
        appointmentId: selectedAptId,
        items: prescriptionItems,
        notes
      });
      
      const apt = appointments.find(a => a.id === selectedAptId);
      if (apt && apt.status !== 'completed') {
        await updateAppointmentStatus(selectedAptId, 'completed');
      }

      setShowPrescriptionModal(false);
      setPrescriptionItems([]);
      setNotes('');
      setSelectedAptId('');
      toast.success('Prescription added successfully');
    } catch (error) {
      toast.error('Failed to add prescription');
    }
  };

  const addMedicationToPrescription = (med: any) => {
    const newItem = {
      medicineId: med.id,
      medicineName: med.name,
      dosage: '1',
      unit: med.unit || 'tablet',
      frequency: { morning: true, afternoon: false, night: true },
      timing: 'after_food',
      duration: '5 days',
      isOutsourced: med.stock <= 0
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
    setMedSearchTerm('');
  };

  const updatePrescriptionItem = (index: number, updates: any) => {
    const newItems = [...prescriptionItems];
    newItems[index] = { ...newItems[index], ...updates };
    setPrescriptionItems(newItems);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
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
      doc.setTextColor(30, 58, 138); 
      doc.text('PRESCRIPTION', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Date: ${new Date(rx.date).toLocaleDateString()}`, 14, 30);
      doc.text(`Doctor: Dr. ${doctor?.name || 'Unknown'}`, 14, 35);
      
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Patient Information:', 14, 50);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Name: ${patient.name}`, 14, 55);
      doc.text(`Email: ${patient.email}`, 14, 60);
      if (patient.phone) {
        doc.text(`Phone: ${patient.phone}`, 14, 65);
      }
      
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Medications:', 14, 80);
      
      const tableData = rx.items.map((item: any) => [
        item.medicineName,
        `${item.dosage} ${item.unit}`,
        `${item.frequency.morning ? 'M' : '-'}/${item.frequency.afternoon ? 'A' : '-'}/${item.frequency.night ? 'N' : '-'}`,
        item.timing.replace('_', ' '),
        item.duration
      ]);

      (doc as any).autoTable({
        startY: 90,
        head: [['Medicine', 'Dosage', 'Schedule', 'Timing', 'Duration']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillStyle: [30, 58, 138] },
      });
      
      const tableFinalY = (doc as any).lastAutoTable.finalY + 10;
      
      if (rx.notes) {
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text('Doctor\'s Notes:', 14, tableFinalY);
        
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const notesSplit = doc.splitTextToSize(rx.notes, 180);
        doc.text(notesSplit, 14, tableFinalY + 10);
      }
      
      const footerY = rx.notes ? tableFinalY + 20 + (doc.splitTextToSize(rx.notes, 180).length * 5) : tableFinalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('This is a digitally generated prescription from Sunrise Hospital.', 14, Math.min(280, footerY));
      
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
        startDate: bedBookingData.startDate,
        endDate: bedBookingData.endDate || '',
        status: 'pending_admin'
      });
      setShowBedBookingModal(false);
      setBedBookingData({ bedId: '', startDate: '', endDate: '', reason: '' });
      toast.success('Bed request sent to administration');
    } catch (error) {
      toast.error('Failed to send bed request');
    }
  };

  const handleBookEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookEquipment({
        equipmentId: equipmentBookingData.equipmentId,
        patientId: patient.id,
        doctorId: currentUser.id,
        date: equipmentBookingData.startDate,
        startTime: '09:00',
        status: 'pending_admin'
      });
      setShowEquipmentBookingModal(false);
      setEquipmentBookingData({ equipmentId: '', startDate: '', endDate: '', purpose: '' });
      toast.success('Equipment request sent to administration');
    } catch (error) {
      toast.error('Failed to send equipment request');
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/doctor/patients')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive clinical overview for {patient.name}.</p>
        </div>
      </div>

      {/* Patient Stats Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 w-full">
          <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0">
            <img 
              src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name || 'Patient'}&background=random`} 
              alt={patient.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {patient.email}</span>
              {patient.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {patient.phone}</span>}
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">MRN: {patient.mrn || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              const latest = patientApts.find(a => a.status !== 'cancelled' && a.status !== 'completed');
              setSelectedAptId(latest?.id || '');
              setShowPrescriptionModal(true);
            }}
            className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            <Pill className="h-4 w-4 mr-2" /> Rx
          </button>
          <button onClick={() => setShowLabReportModal(true)} className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all">
            <Activity className="h-4 w-4 mr-2" /> Lab
          </button>
          <button onClick={() => setShowBedBookingModal(true)} className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all border-dashed">
            <Bed className="h-4 w-4 mr-2" /> Bed
          </button>
          <button onClick={() => setShowEquipmentBookingModal(true)} className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all border-dashed">
            <Wrench className="h-4 w-4 mr-2" /> Eq.
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* History Sections */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-indigo-600" /> Recent Consultations</span>
            </div>
            <div className="divide-y divide-slate-100">
              {patientApts.map(apt => (
                <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{new Date(apt.date).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-600">{apt.reason}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
              {patientApts.length === 0 && <div className="p-12 text-center text-slate-400 italic">No history found.</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2"><Pill className="h-5 w-5 text-indigo-600" /> Prescriptions</span>
            </div>
            <div className="divide-y divide-slate-100">
              {patientPrescriptions.map(rx => (
                <div key={rx.id} className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{new Date(rx.date).toLocaleDateString()}</span>
                    <button onClick={() => downloadPrescriptionPDF(rx)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 group">
                      <Download className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                      Download PDF
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rx.items.map((item: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                        {item.medicineName} ({item.dosage} {item.unit})
                      </span>
                    ))}
                  </div>
                  {rx.notes && <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">\"{rx.notes}\"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900 text-white rounded-2xl p-6 space-y-4 shadow-xl shadow-indigo-100">
            <h3 className="font-bold text-indigo-200 border-b border-indigo-800 pb-2 flex items-center gap-2"><Activity className="h-4 w-4" /> Vitals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-[10px] text-indigo-300 font-bold uppercase">BP</p>
                <p className="font-bold">120/80</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-[10px] text-indigo-300 font-bold uppercase">Pulse</p>
                <p className="font-bold">72 BPM</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-900">Lab Reports</div>
            <div className="divide-y divide-slate-100">
              {patientLabReports.map(report => (
                <div key={report.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{report.testName}</p>
                    <p className="text-[10px] text-slate-500">{new Date(report.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{report.status}</span>
                </div>
              ))}
              {patientLabReports.length === 0 && <div className="p-8 text-center text-slate-400 italic text-sm">No reports.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Pill className="h-5 w-5 text-indigo-600" /> Clinical Prescription</h3>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleAddPrescription} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Appointment</label>
                  <select required value={selectedAptId} onChange={(e) => setSelectedAptId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm">
                    <option value="">Select Appointment</option>
                    {patientApts.map(a => <option key={a.id} value={a.id}>{a.date} - {a.reason}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Find Medicine</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" placeholder="Search pharmacy stock..." value={medSearchTerm} onChange={(e) => setMedSearchTerm(e.target.value)} />
                  </div>
                  {medSearchTerm && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {inventory.filter(i => i.name.toLowerCase().includes(medSearchTerm.toLowerCase())).map(med => (
                        <button key={med.id} type="button" onClick={() => addMedicationToPrescription(med)} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{med.name}</p>
                            <p className="text-[10px] text-slate-500">{med.stock} in stock</p>
                          </div>
                          {med.stock <= 0 && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">Outsourced</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Medication List</h4>
                {prescriptionItems.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-indigo-900">{item.medicineName}</span>
                      <button onClick={() => removePrescriptionItem(idx)} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Dosage</label>
                        <div className="flex gap-1">
                          <input type="text" value={item.dosage} onChange={(e) => updatePrescriptionItem(idx, { dosage: e.target.value })} className="w-12 border-b border-slate-300 bg-transparent text-sm py-1 focus:outline-none focus:border-indigo-500" />
                          <select value={item.unit} onChange={(e) => updatePrescriptionItem(idx, { unit: e.target.value })} className="flex-1 border-b border-slate-300 bg-transparent text-sm py-1 focus:outline-none focus:border-indigo-500">
                             <option value="tablet">Tab</option>
                             <option value="capsule">Cap</option>
                             <option value="ml">ml</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Schedule</label>
                        <div className="flex gap-2 pt-1">
                          {['morning', 'afternoon', 'night'].map(t => (
                            <button key={t} type="button" onClick={() => updatePrescriptionItem(idx, { frequency: { ...item.frequency, [t]: !item.frequency[t] } })} className={`h-6 w-6 rounded text-[10px] font-bold border transition-colors ${item.frequency[t] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>{t[0].toUpperCase()}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Food / Days</label>
                        <div className="flex gap-2">
                          <select value={item.timing} onChange={(e) => updatePrescriptionItem(idx, { timing: e.target.value })} className="flex-1 border-b border-slate-300 bg-transparent text-sm py-1 focus:outline-none focus:border-indigo-500">
                            <option value="after_food">After</option>
                            <option value="before_food">Before</option>
                          </select>
                          <input type="text" value={item.duration} onChange={(e) => updatePrescriptionItem(idx, { duration: e.target.value })} className="w-16 border-b border-slate-300 bg-transparent text-sm py-1 focus:outline-none focus:border-indigo-500" placeholder="5 days" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none" placeholder="General instructions for the pharmacist or patient..." />

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Discard</button>
                <button type="submit" disabled={prescriptionItems.length === 0} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all">Save & Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bed Request Modal */}
      {showBedBookingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2"><Bed className="h-5 w-5 text-indigo-600" /> Request Bed Admission</span>
              <button onClick={() => setShowBedBookingModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleBookBed} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Bed</label>
                <select required value={bedBookingData.bedId} onChange={(e) => setBedBookingData({...bedBookingData, bedId: e.target.value})} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="">Choose an available bed</option>
                  {beds.filter(b => b.status === 'available').map(b => (
                    <option key={b.id} value={b.id}>Room {b.roomNumber} - Bed {b.bedNumber} ({b.type})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admission Date</label>
                  <input type="date" required value={bedBookingData.startDate} onChange={(e) => setBedBookingData({...bedBookingData, startDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admission Reason</label>
                  <input type="text" required value={bedBookingData.reason} onChange={(e) => setBedBookingData({...bedBookingData, reason: e.target.value})} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. Surgery recovery" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">Send Request to Admin</button>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Request Modal */}
      {showEquipmentBookingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2"><Wrench className="h-5 w-5 text-indigo-600" /> Request Equipment</span>
              <button onClick={() => setShowEquipmentBookingModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleBookEquipment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Equipment</label>
                <select required value={equipmentBookingData.equipmentId} onChange={(e) => setEquipmentBookingData({...equipmentBookingData, equipmentId: e.target.value})} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="">Choose equipment</option>
                  {equipment.filter(e => e.status === 'available').map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usage Date</label>
                <input type="date" required value={equipmentBookingData.startDate} onChange={(e) => setEquipmentBookingData({...equipmentBookingData, startDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">Send Request to Admin</button>
            </form>
          </div>
        </div>
      )}

      {/* Lab Report Modal */}
      {showLabReportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-600" /> Upload Lab Report</span>
              <button onClick={() => setShowLabReportModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddLabReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Name</label>
                <input type="text" required value={testName} onChange={(e) => setTestName(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. Lipid Profile" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report PDF</label>
                <input type="file" required accept="application/pdf" onChange={(e) => setLabReportFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
              <button type="submit" disabled={isUploading} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
                {isUploading ? 'Uploading...' : 'Upload & Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
