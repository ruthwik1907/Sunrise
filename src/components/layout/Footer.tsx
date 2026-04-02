import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-indigo-400 mb-4">
              <Activity className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight text-white">MediCare</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6">
              Providing world-class healthcare services with advanced technology and compassionate care. Your health is our priority.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link to="/doctors" className="hover:text-indigo-400 transition-colors">Find a Doctor</Link></li>
              <li><Link to="/book-appointment" className="hover:text-indigo-400 transition-colors">Book Appointment</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition-colors">Patient Portal</Link></li>
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Departments</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Cardiology</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Neurology</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Orthopedics</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Pediatrics</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Dermatology</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Renigunta<br />Tirupati</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>+91 87654 3212</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>contact@medicare.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
