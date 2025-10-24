import React, { useState, useEffect } from 'react';
import { fetchStatistics } from '../../services/api';

interface Statistics {
    successfulTreatments: number;
    partnerHospitals: number;
    registeredPatients: number;
    successRate: number;
    expertDoctors: number;
    patientCoordinators: number;
    supportAvailable: string;
}
import { Logo } from '../common/Logo.tsx';

export const Footer = () => {
  const [statistics, setStatistics] = useState<Statistics>({
    successfulTreatments: 2500,
    partnerHospitals: 150,
    registeredPatients: 2500,
    successRate: 98.5,
    expertDoctors: 500,
    patientCoordinators: 50,
    supportAvailable: '24/7'
  });

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const data = await fetchStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('Failed to load statistics:', error);
        // Keep default values on error
      }
    };

    loadStatistics();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-dark via-gray-900 to-dark text-light" id="footer">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Main Footer Content */}
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <Logo className="w-10 h-10 mr-3" />
              <span className="text-2xl font-bold text-primary">AfyaConnect</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting patients in Africa with world-class healthcare in India.
              Your trusted partner for safe, affordable, and quality medical tourism.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              {[
                { name: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { name: 'Twitter', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
                { name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' }
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors duration-300 group"
                  title={social.name}
                >
                  <svg className="w-5 h-5 fill-current text-gray-300 group-hover:text-white" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Find Hospitals', href: '#/search' },
                { name: 'Book Consultation', href: '#/search' },
                { name: 'Treatment Planning', href: '#/dashboard' },
                { name: 'Travel Services', href: '#/travel' },
                { name: 'Virtual Tours', href: '#/experience' },
                { name: 'Mobile App', href: '#/mobile' },
                { name: 'Patient Stories', href: '#/experience' },
                { name: 'Cost Calculator', href: '#/search' }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-secondary transition-colors duration-300 flex items-center group"
                  >
                    <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Medical Specialties */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Medical Specialties</h3>
            <ul className="space-y-3">
              {[
                { name: '❤️ Cardiology', href: '#/search' },
                { name: '🎗️ Oncology', href: '#/search' },
                { name: '🦴 Orthopedics', href: '#/search' },
                { name: '🧠 Neurology', href: '#/search' },
                { name: '👁️ Ophthalmology', href: '#/search' },
                { name: '✨ Plastic Surgery', href: '#/search' },
                { name: '👶 Fertility Treatment', href: '#/search' },
                { name: '🫀 Transplant Surgery', href: '#/search' }
              ].map((specialty, index) => (
                <li key={index}>
                  <a
                    href={specialty.href}
                    className="text-gray-300 hover:text-secondary transition-colors duration-300 text-sm"
                  >
                    {specialty.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Contact & Support</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-secondary mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-white font-medium">24/7 Support Hotline</p>
                  <p className="text-gray-300 text-sm">+91-98765-99999</p>
                  <p className="text-gray-400 text-xs">Available in English, French, Swahili</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-secondary mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-white font-medium">Email Support</p>
                  <p className="text-gray-300 text-sm">support@afyaconnect.com</p>
                  <p className="text-gray-400 text-xs">Response within 2 hours</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-secondary mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-white font-medium">Office Address</p>
                  <p className="text-gray-300 text-sm">Medical Tourism Hub</p>
                  <p className="text-gray-400 text-xs">Mumbai, India</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Statistics Bar */}
      <div className="border-t border-gray-800 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { number: `${statistics.registeredPatients.toLocaleString()}+`, label: 'Happy Patients', icon: '😊' },
            { number: `${statistics.partnerHospitals}+`, label: 'Partner Hospitals', icon: '🏥' },
            { number: `${statistics.expertDoctors}+`, label: 'Expert Doctors', icon: '👨‍⚕️' },
            { number: `${statistics.successRate}%`, label: 'Success Rate', icon: '✅' }
          ].map((stat, index) => (
            <div key={index} className="group">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-primary mb-1 group-hover:text-secondary transition-colors">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} AfyaConnect. All Rights Reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <a href="#/privacy" className="text-gray-400 hover:text-secondary transition-colors">Privacy Policy</a>
              <a href="#/terms" className="text-gray-400 hover:text-secondary transition-colors">Terms of Service</a>
              <a href="#/admin" className="text-gray-400 hover:text-secondary transition-colors">Admin</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">Powered by</span>
            <div className="flex items-center space-x-2">
              <span className="text-primary font-bold">AI</span>
              <span className="text-secondary font-bold">Technology</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full translate-y-24 -translate-x-24 pointer-events-none"></div>
    </div>
  </footer>
  );
};
