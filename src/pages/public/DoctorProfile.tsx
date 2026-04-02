import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Calendar, Star, MapPin, Clock, Award, Shield, Phone, Mail, User, Search } from 'lucide-react';

export default function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const { users, departments } = useAppContext();
  const navigate = useNavigate();

  const doctor = users.find(u => u.id === id && u.role === 'doctor');
  const department = departments.find(d => d.id === doctor?.departmentId);

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Doctor not found</h2>
          <p className="text-slate-500 mb-6">The medical professional you are looking for does not exist or has been removed from our directory.</p>
          <button onClick={() => navigate('/doctors')} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full">
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/doctors')} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="md:flex">
            {/* Left Column - Profile Info */}
            <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 flex flex-col items-center text-center border-r border-slate-100 relative">
              <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600/10"></div>
              
              <div className="relative mb-6 mt-8">
                <img 
                  src={doctor.avatar || `https://ui-avatars.com/api/?name=${doctor.name}&background=random`} 
                  alt={doctor.name} 
                  className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-lg relative z-10" 
                />
                <div className="absolute bottom-2 right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white z-20" title="Available"></div>
              </div>
              
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{doctor.name}</h1>
              <p className="text-indigo-600 font-bold text-sm mb-4 uppercase tracking-wide">{doctor.specialty || 'General Practice'}</p>
              
              <div className="flex items-center gap-1 text-sm text-slate-700 mb-6 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold">4.9</span>
                <span className="text-slate-500">(124 reviews)</span>
              </div>

              <div className="w-full space-y-4 text-left mt-4 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{department?.name || 'Main Hospital'}</p>
                    <p className="text-xs text-slate-500">Building A, Floor 3, Room 302</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Working Hours</p>
                    <p className="text-xs text-slate-500">Mon-Fri: 9:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Details & Booking */}
            <div className="md:w-2/3 p-8 md:p-10 flex flex-col">
              <div className="mb-10">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  About {doctor.name.split(' ')[1] || doctor.name}
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {doctor.name} is a highly skilled and compassionate {doctor.specialty || 'medical professional'} in the {department?.name || 'hospital'} department. 
                  With over 12 years of clinical experience, they provide comprehensive care and personalized treatment plans for all patients, focusing on preventative medicine and holistic wellness.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900">Qualifications</h3>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1 ml-10 list-disc">
                    <li>MD, Harvard Medical School</li>
                    <li>Board Certified in {doctor.specialty || 'General Medicine'}</li>
                    <li>Fellowship at Mayo Clinic</li>
                  </ul>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900">Specialties</h3>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1 ml-10 list-disc">
                    <li>{doctor.specialty || 'General Practice'}</li>
                    <li>Preventative Care</li>
                    <li>Chronic Disease Management</li>
                  </ul>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="break-all">{doctor.email}</span>
                  </div>
                </div>
                
                <Link 
                  to={`/book-appointment?doctor=${doctor.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
