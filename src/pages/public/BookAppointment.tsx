import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Calendar, Clock, User, Stethoscope, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const { currentUser, users, departments, bookAppointment, doctorSchedules, appointments } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor');

  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState(preselectedDoctor || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=/book-appointment');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (preselectedDoctor) {
      const doc = users.find(u => u.id === preselectedDoctor);
      if (doc) setDepartmentId(doc.departmentId || '');
    }
  }, [preselectedDoctor, users]);

  const doctors = useMemo(() => {
    return users.filter(u => u.role === 'doctor' && (!departmentId || u.departmentId === departmentId));
  }, [users, departmentId]);

  useEffect(() => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      setTime('');
      return;
    }

    const selectedDate = new Date(date);
    const dayOfWeekStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find the doctor's schedule for this day
    const schedule = doctorSchedules.find(s => s.doctorId === doctorId && s.dayOfWeek === dayOfWeekStr);
    
    if (!schedule || schedule.isWorking === false) {
      setAvailableSlots([]);
      setTime('');
      return;
    }

    // Generate slots
    const slots: string[] = [];
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    
    // Parse break times if they exist
    let breakStartHour = -1, breakStartMin = -1, breakEndHour = -1, breakEndMin = -1;
    if (schedule.breakStart && schedule.breakEnd) {
      [breakStartHour, breakStartMin] = schedule.breakStart.split(':').map(Number);
      [breakEndHour, breakEndMin] = schedule.breakEnd.split(':').map(Number);
    }
    
    let currentHour = startHour;
    let currentMin = startMin;
    const slotDurationMinutes = 30; // Default slot duration
    
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      
      // Check if slot is in the past (if today)
      let isPast = false;
      if (isToday) {
        if (currentHour < now.getHours() || (currentHour === now.getHours() && currentMin <= now.getMinutes())) {
          isPast = true;
        }
      }
      
      // Check if slot is during break time
      let isBreak = false;
      if (breakStartHour !== -1) {
        const currentMins = currentHour * 60 + currentMin;
        const breakStartMins = breakStartHour * 60 + breakStartMin;
        const breakEndMins = breakEndHour * 60 + breakEndMin;
        if (currentMins >= breakStartMins && currentMins < breakEndMins) {
          isBreak = true;
        }
      }
      
      // Check if slot is already booked
      const isBooked = appointments.some(a => 
        a.doctorId === doctorId && 
        a.date === date && 
        a.time === timeString &&
        a.status !== 'cancelled'
      );
      
      if (!isPast && !isBreak && !isBooked) {
        slots.push(timeString);
      }
      
      currentMin += slotDurationMinutes;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    
    setAvailableSlots(slots);
    if (!slots.includes(time)) {
      setTime('');
    }
  }, [doctorId, date, doctorSchedules, appointments, time]);

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!departmentId || !doctorId || !date || !time || !reason) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    // Basic validation
    if (reason.length < 10) {
      toast.error('Please provide a more detailed reason for your visit (min 10 characters).');
      return;
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Please select a future date for your appointment.');
      return;
    }

    setIsSubmitting(true);

    try {
      await bookAppointment({
        patientId: currentUser.id,
        doctorId,
        departmentId,
        date,
        time,
        reason
      });
      navigate('/patient/appointments');
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Book an Appointment</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Schedule a visit with our medical specialists. We'll make sure you get the care you need.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Info panel */}
            <div className="md:w-1/3 bg-indigo-600 p-8 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-6">What to expect</h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-indigo-300 mr-3 shrink-0" />
                    <div>
                      <h4 className="font-medium">Easy Scheduling</h4>
                      <p className="text-indigo-200 text-sm mt-1">Choose a time that works best for you from our available slots.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-indigo-300 mr-3 shrink-0" />
                    <div>
                      <h4 className="font-medium">Expert Doctors</h4>
                      <p className="text-indigo-200 text-sm mt-1">Get matched with specialists tailored to your medical needs.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-indigo-300 mr-3 shrink-0" />
                    <div>
                      <h4 className="font-medium">Instant Confirmation</h4>
                      <p className="text-indigo-200 text-sm mt-1">Receive immediate confirmation and reminders for your visit.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mt-12 pt-8 border-t border-indigo-500/50">
                <p className="text-sm text-indigo-200">Need immediate assistance?</p>
                <p className="font-bold text-lg mt-1">Call Emergency: 911</p>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="md:w-2/3 p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Department Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-slate-700">
                      <Stethoscope className="w-4 h-4 mr-2 text-slate-400" />
                      Department <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={departmentId}
                        onChange={(e) => {
                          setDepartmentId(e.target.value);
                          setDoctorId('');
                        }}
                        className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl bg-slate-50 focus:bg-white transition-colors appearance-none"
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-slate-700">
                      <User className="w-4 h-4 mr-2 text-slate-400" />
                      Doctor <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={doctorId}
                        onChange={(e) => setDoctorId(e.target.value)}
                        disabled={!departmentId && !preselectedDoctor}
                        className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl bg-slate-50 focus:bg-white transition-colors appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.specialty || 'General'})</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-slate-700">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      Date <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="block w-full px-4 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-slate-700">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      Time <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        disabled={!date || !doctorId || availableSlots.length === 0}
                        className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl bg-slate-50 focus:bg-white transition-colors appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!date || !doctorId 
                            ? "Select Date & Doctor First" 
                            : availableSlots.length === 0 
                              ? "No slots available" 
                              : "Select Time"}
                        </option>
                        {availableSlots.map(slot => (
                          <option key={slot} value={slot}>{formatTime(slot)}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    Reason for Visit <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="block w-full px-4 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl bg-slate-50 focus:bg-white transition-colors resize-none"
                    placeholder="Briefly describe your symptoms or reason for appointment..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent shadow-sm text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Confirm Appointment'
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">
                    By booking, you agree to our terms of service and cancellation policy.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
