import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Heart, Shield, Clock, Users, Award, Stethoscope } from 'lucide-react';

export default function About() {
  const { departments } = useAppContext();

  const values = [
    { icon: <Heart className="w-6 h-6 text-rose-500" />, title: "Compassionate Care", desc: "We treat every patient with empathy, respect, and kindness." },
    { icon: <Shield className="w-6 h-6 text-emerald-500" />, title: "Patient Safety", desc: "Highest standards of safety and hygiene in all our facilities." },
    { icon: <Clock className="w-6 h-6 text-blue-500" />, title: "24/7 Availability", desc: "Round-the-clock emergency services and medical support." },
    { icon: <Users className="w-6 h-6 text-indigo-500" />, title: "Expert Team", desc: "Highly qualified doctors and dedicated healthcare professionals." }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-indigo-900 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-24 -left-24 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">About MediCare</h1>
            <p className="text-xl text-indigo-100 leading-relaxed">
              We are a leading healthcare provider committed to delivering exceptional medical services. 
              Our hospital is equipped with modern technology and staffed by compassionate professionals dedicated to your well-being.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">The principles that guide our practice and ensure the highest quality of care for our patients.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-8 text-center hover:shadow-md transition-shadow border border-slate-100">
                <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4 text-indigo-600">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Departments</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Comprehensive medical services across various specialties to meet all your healthcare needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all group">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{dept.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats/Milestones */}
      <div className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold mb-2">25+</div>
              <div className="text-indigo-100 font-medium">Years of Excellence</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">150+</div>
              <div className="text-indigo-100 font-medium">Specialist Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">50k+</div>
              <div className="text-indigo-100 font-medium">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">24/7</div>
              <div className="text-indigo-100 font-medium">Emergency Care</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
