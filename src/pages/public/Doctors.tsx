import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Filter, Star, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function Doctors() {
  const { users, departments } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const doctors = users.filter(u => u.role === 'doctor');

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (doc.specialty && doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept ? doc.departmentId === selectedDept : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Our Medical Specialists</h1>
          <p className="text-lg text-slate-600">Find and book appointments with our highly qualified doctors across various specialties.</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative md:w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" />
            </div>
            <select
              className="block w-full pl-11 pr-10 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl bg-slate-50 focus:bg-white transition-colors appearance-none"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map(doc => {
            const dept = departments.find(d => d.id === doc.departmentId);
            return (
              <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                <div className="p-6 flex-1 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img 
                      src={doc.avatar || `https://ui-avatars.com/api/?name=${doc.name || 'Doctor'}&background=random`} 
                      alt={doc.name || 'Doctor'} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute bottom-0 right-0 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white" title="Available"></div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{doc.name || 'Unknown Doctor'}</h3>
                  <p className="text-indigo-600 font-medium text-sm mb-3">{doc.specialty || 'General Practice'}</p>
                  
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-4 bg-slate-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-slate-700">4.9</span>
                    <span>(120+ reviews)</span>
                  </div>

                  <div className="w-full space-y-2 text-left mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{dept?.name || 'Main Hospital'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Available Today</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                  <Link 
                    to={`/doctors/${doc.id}`} 
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link 
                    to={`/book-appointment?doctor=${doc.id}`} 
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Book
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredDoctors.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No doctors found</h3>
            <p className="text-slate-500 max-w-md mx-auto">We couldn't find any doctors matching your search criteria. Try adjusting your filters or search term.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedDept(''); }}
              className="mt-6 inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
