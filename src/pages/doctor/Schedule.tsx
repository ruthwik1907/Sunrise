import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorSchedule() {
  const { currentUser, doctorSchedules, updateDoctorSchedule } = useAppContext();
  
  const defaultSchedule = [
    { day: 'Monday', isWorking: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
    { day: 'Tuesday', isWorking: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
    { day: 'Wednesday', isWorking: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
    { day: 'Thursday', isWorking: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
    { day: 'Friday', isWorking: true, start: '09:00', end: '15:00', breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Saturday', isWorking: false, start: '10:00', end: '14:00', breakStart: '', breakEnd: '' },
    { day: 'Sunday', isWorking: false, start: '10:00', end: '14:00', breakStart: '', breakEnd: '' },
  ];

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const mySchedules = doctorSchedules.filter(s => s.doctorId === currentUser.id);
      if (mySchedules.length > 0) {
        // Map the existing schedules to our local state format
        const loadedSchedule = defaultSchedule.map(defaultDay => {
          const existingDay = mySchedules.find(s => s.dayOfWeek === defaultDay.day);
          if (existingDay) {
            return {
              day: defaultDay.day,
              isWorking: existingDay.isWorking ?? false,
              start: existingDay.startTime,
              end: existingDay.endTime,
              breakStart: existingDay.breakStart || '',
              breakEnd: existingDay.breakEnd || ''
            };
          }
          return defaultDay;
        });
        setSchedule(loadedSchedule);
      }
    }
  }, [currentUser, doctorSchedules]);

  if (!currentUser) return null;

  const handleToggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isWorking = !newSchedule[index].isWorking;
    setSchedule(newSchedule);
  };

  const handleTimeChange = (index: number, field: string, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const schedulesToSave = schedule.map(day => ({
        doctorId: currentUser.id,
        dayOfWeek: day.day,
        startTime: day.start,
        endTime: day.end,
        slotDurationMinutes: 30, // Default slot duration
        isWorking: day.isWorking,
        breakStart: day.breakStart || undefined,
        breakEnd: day.breakEnd || undefined,
      }));
      
      await updateDoctorSchedule(currentUser.id, schedulesToSave);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success('Schedule updated successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your working hours and availability.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70"
        >
          {isSaving ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            <span className="inline-flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </span>
          )}
        </button>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">Schedule updated successfully. Your new availability is now live.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Weekly Availability</h2>
            <p className="text-sm text-slate-500">Set your regular working hours for each day of the week.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {schedule.map((day, index) => (
            <div key={day.day} className={`p-6 flex flex-col lg:flex-row lg:items-center gap-6 transition-colors ${day.isWorking ? 'bg-white' : 'bg-slate-50/50'}`}>
              
              {/* Day Toggle */}
              <div className="w-40 flex items-center justify-between lg:justify-start gap-4 flex-shrink-0">
                <span className={`font-semibold ${day.isWorking ? 'text-slate-900' : 'text-slate-400'}`}>
                  {day.day}
                </span>
                <button 
                  onClick={() => handleToggleDay(index)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${day.isWorking ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${day.isWorking ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Time Inputs */}
              {day.isWorking ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Working Hours</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="time" 
                          value={day.start}
                          onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                        />
                      </div>
                      <span className="text-slate-400 font-medium">to</span>
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="time" 
                          value={day.end}
                          onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Break Time</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input 
                          type="time" 
                          value={day.breakStart}
                          onChange={(e) => handleTimeChange(index, 'breakStart', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                        />
                      </div>
                      <span className="text-slate-400 font-medium">to</span>
                      <div className="relative flex-1">
                        <input 
                          type="time" 
                          value={day.breakEnd}
                          onChange={(e) => handleTimeChange(index, 'breakEnd', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center text-slate-400 text-sm italic">
                  Not available on this day
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-800">Important Note</h3>
          <p className="text-sm text-amber-700 mt-1">
            Changes to your schedule will only affect future appointments. Existing appointments that fall outside your new schedule will remain unchanged and must be rescheduled manually if needed.
          </p>
        </div>
      </div>
    </div>
  );
}
