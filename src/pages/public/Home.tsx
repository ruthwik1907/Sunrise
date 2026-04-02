import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Users, Calendar, Shield, Heart, Award, Clock, PhoneCall, Stethoscope, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const scrollingImages = [
    "/images/hospital-1.jpg",
    "/images/hospital-2.jpg",
    "/images/hospital-3.jpg",
    "/images/hospital-4.jpg",
    "/images/hospital-5.jpg",
    "/images/hospital-6.jpg",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10 flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-5/12 mb-12 lg:mb-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-6 sm:mb-8 border border-indigo-100 shadow-sm">
              <Activity className="h-4 w-4" />
              <span>Modern Healthcare Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Advanced Healthcare <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Made Accessible</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience world-class medical care with our state-of-the-art facilities, expert medical professionals, and seamless digital health platform. Your health is our priority.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-10 justify-center lg:justify-start">
              <Link to="/book-appointment" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all">
                Book Appointment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/doctors" className="inline-flex justify-center items-center px-8 py-4 border border-slate-200 text-lg font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
                Find a Doctor
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-slate-600 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-flex">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span>Secure & Private</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-6/12 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white">
              <img 
                src="/images/hospital-hero.jpg" 
                alt="Modern Hospital Facility" 
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                onError={(event) => { (event.target as HTMLImageElement).src = 'https://source.unsplash.com/featured/1200x800/?hospital,clinic,doctor'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              
              {/* Floating Badge */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3 sm:gap-4">
                <div className="bg-emerald-100 p-2 sm:p-3 rounded-xl">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Patient Satisfaction</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">Rated 4.9/5 by 10k+ patients</p>
                </div>
              </div>
            </div>
            
            {/* Decorative blobs */}
            <div className="absolute -top-6 -right-6 sm:-top-12 sm:-right-12 w-32 h-32 sm:w-64 sm:h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-6 -left-6 sm:-bottom-12 sm:-left-12 w-32 h-32 sm:w-64 sm:h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </div>

      {/* Scrolling Images Section */}
      <div className="py-12 bg-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Our Facilities & Team</h2>
          <p className="text-slate-500 mt-2">Take a glimpse into our world-class healthcare environment</p>
        </div>
        <div className="relative w-full flex overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...scrollingImages, ...scrollingImages].map((img, idx) => (
              <div key={idx} className="inline-block px-4 w-80 h-56">
                <img 
                  src={img} 
                  alt={`Facility ${idx}`} 
                  className="w-full h-full object-cover rounded-2xl shadow-sm border border-slate-100"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-4 md:gap-8 text-center md:divide-x divide-indigo-800/50">
            <div className="px-2 md:px-4">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">42+</div>
              <div className="text-indigo-200 font-medium uppercase tracking-wider text-xs sm:text-sm">Expert Doctors</div>
            </div>
            <div className="px-2 md:px-4 border-l border-indigo-800/50 md:border-none">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">15k+</div>
              <div className="text-indigo-200 font-medium uppercase tracking-wider text-xs sm:text-sm">Happy Patients</div>
            </div>
            <div className="px-2 md:px-4">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">12</div>
              <div className="text-indigo-200 font-medium uppercase tracking-wider text-xs sm:text-sm">Specialties</div>
            </div>
            <div className="px-2 md:px-4 border-l border-indigo-800/50 md:border-none">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">24/7</div>
              <div className="text-indigo-200 font-medium uppercase tracking-wider text-xs sm:text-sm">Emergency Care</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Why Choose MediCare?</h2>
            <p className="text-lg text-slate-600">We combine medical expertise with modern technology to provide you with the best healthcare experience possible.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-indigo-600 transition-colors">
                <Stethoscope className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Expert Doctors</h3>
              <p className="text-slate-600 leading-relaxed">Our team consists of highly qualified and experienced medical professionals dedicated to your well-being across various specialties.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-indigo-600 transition-colors">
                <Calendar className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Easy Scheduling</h3>
              <p className="text-slate-600 leading-relaxed">Book and manage your appointments online with our seamless scheduling system. No more waiting in lines or playing phone tag.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-indigo-600 transition-colors">
                <Shield className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Records</h3>
              <p className="text-slate-600 leading-relaxed">Your medical history, test results, and personal data are kept strictly confidential and secure on our HIPAA-compliant platform.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-lg text-slate-600">Your journey to better health is just a few clicks away.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-indigo-200 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-indigo-50 mb-6">
                <span className="text-3xl font-extrabold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Find a Doctor</h3>
              <p className="text-slate-600">Search for specialists by department, name, or condition.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-indigo-50 mb-6">
                <span className="text-3xl font-extrabold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Book Appointment</h3>
              <p className="text-slate-600">Choose a convenient date and time slot that works for you.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-indigo-50 mb-6">
                <span className="text-3xl font-extrabold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Get Care</h3>
              <p className="text-slate-600">Visit the hospital or consult online with your chosen doctor.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/20 mb-8 border border-indigo-500/30">
            <Heart className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to prioritize your health?</h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">Join thousands of patients who trust MediCare for their healthcare needs. Create an account today to manage your appointments, records, and more.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-slate-900 bg-white hover:bg-slate-50 shadow-lg hover:shadow-xl transition-all">
              Create Patient Account
            </Link>
            <Link to="/book-appointment" className="inline-flex justify-center items-center px-8 py-4 border border-slate-700 text-lg font-bold rounded-xl text-white bg-slate-800 hover:bg-slate-700 transition-all">
              Book as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
