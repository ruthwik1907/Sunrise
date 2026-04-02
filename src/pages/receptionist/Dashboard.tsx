import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Calendar, Users, Clock, CheckCircle, XCircle, UserPlus, Search, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReceptionistDashboard() {
  const { currentUser, appointments, users, updateAppointmentStatus, createAppointment, createWalkInPatient } = useAppContext();
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'all'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  if (!currentUser) return null;

  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(apt => new Date(apt.date).toDateString() === today);
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const allAppointments = appointments;

  const getFilteredAppointments = (appointments: any[]) => {
    return appointments.filter(apt => {
      const patient = users.find(u => u.id === apt.patientId);
      const doctor = users.find(u => u.id === apt.doctorId);
      return (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (apt.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const filteredToday = getFilteredAppointments(todayAppointments);
  const filteredPending = getFilteredAppointments(pendingAppointments);
  const filteredAll = getFilteredAppointments(allAppointments);

  const handleStatusUpdate = async (appointmentId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      toast.success(`Appointment ${status} successfully`);
    } catch (error) {
      toast.error(`Failed to ${status} appointment`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Receptionist Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage appointments and patient coordination</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-900">{currentUser.name}</p>
            <p className="text-slate-500">Receptionist</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-slate-900">{todayAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{pendingAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Confirmed</p>
              <p className="text-2xl font-bold text-slate-900">
                {appointments.filter(apt => apt.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Cancelled</p>
              <p className="text-2xl font-bold text-slate-900">
                {appointments.filter(apt => apt.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'today'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Today ({todayAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Pending ({pendingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              All ({allAppointments.length})
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {(activeTab === 'today' ? filteredToday :
            activeTab === 'pending' ? filteredPending :
            filteredAll).map(apt => {
            const patient = users.find(u => u.id === apt.patientId);
            const doctor = users.find(u => u.id === apt.doctorId);

            return (
              <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{patient?.name || 'Unknown Patient'}</h3>
                        <p className="text-sm text-slate-500">with Dr. {doctor?.name || 'Unknown'}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Date & Time</p>
                        <p className="font-medium text-slate-900">
                          {new Date(apt.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-slate-600">{apt.time}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Reason</p>
                        <p className="font-medium text-slate-900">{apt.reason || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Contact</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-900">{patient?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-900">{patient?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {(activeTab === 'today' ? filteredToday :
            activeTab === 'pending' ? filteredPending :
            filteredAll).length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No appointments found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {activeTab === 'today' ? "No appointments scheduled for today." :
                 activeTab === 'pending' ? "No pending appointments." :
                 "No appointments found."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <NewAppointmentModal
          onClose={() => setShowNewAppointment(false)}
          onCreate={createAppointment}
          onCreateWalkInPatient={createWalkInPatient}
          users={users}
        />
      )}
    </div>
  );
}

function NewAppointmentModal({ onClose, onCreate, onCreateWalkInPatient, users }: {
  onClose: () => void;
  onCreate: (appointment: any) => Promise<void>;
  onCreateWalkInPatient: (data: Partial<User>) => Promise<User>;
  users: any[];
}) {
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    // New patient fields
    patientName: '',
    patientEmail: '',
    patientPhone: ''
  });

  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let patientId = formData.patientId;
      
      // If creating a new patient
      if (isNewPatient) {
        if (!formData.patientName) {
          toast.error('Please enter patient name.');
          return;
        }
        
        const newPatient = await onCreateWalkInPatient({
          name: formData.patientName,
          email: formData.patientEmail,
          phone: formData.patientPhone,
          role: 'patient'
        });
        patientId = newPatient.id;
        toast.success('New patient created successfully!');
      } else {
        if (!patientId) {
          toast.error('Please select a patient.');
          return;
        }
      }
      
      if (!formData.doctorId || !formData.date || !formData.time) {
        toast.error('Please fill in all required fields.');
        return;
      }
      
      await onCreate({
        patientId,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: 'pending'
      });
      
      toast.success('Appointment created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create appointment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">New Appointment</h2>
        
        {/* Patient Type Toggle */}
        <div className="mb-4">
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setIsNewPatient(false)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                !isNewPatient
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Existing Patient
            </button>
            <button
              type="button"
              onClick={() => setIsNewPatient(true)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isNewPatient
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              New Patient
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selection/Creation */}
          {isNewPatient ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Email</label>
                <input
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => setFormData({...formData, patientEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter patient email (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Phone</label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter patient phone (optional)"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Doctor *</label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>Dr. {doctor.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Appointment reason..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}