import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DigitalHealthPassport } from '../components/mobile/DigitalHealthPassport';

export const MobileAppPage: React.FC = () => {
  const { user } = useAuth();
  const [showHealthPassport, setShowHealthPassport] = useState(false);
  const [showQRCheckIn, setShowQRCheckIn] = useState(false);

  const mobileFeatures = [
    {
      id: 'health-passport',
      title: 'Digital Health Passport',
      description: 'Secure medical ID with QR code access',
      icon: '🆔',
      color: 'from-purple-500 to-pink-500',
      action: () => setShowHealthPassport(true),
      badge: 'Offline Ready'
    },
    {
      id: 'qr-checkin',
      title: 'QR Check-In',
      description: 'Quick hospital check-in with QR codes',
      icon: '📱',
      color: 'from-blue-500 to-cyan-500',
      action: () => setShowQRCheckIn(true),
      badge: 'Fast & Easy'
    },
    {
      id: 'notifications',
      title: 'Smart Notifications',
      description: 'Appointment reminders and updates',
      icon: '🔔',
      color: 'from-green-500 to-emerald-500',
      action: () => alert('Notification settings coming soon!'),
      badge: 'Real-time'
    }
  ];

  const quickActions = [
    { title: 'Book Appointment', icon: '📅', action: () => window.location.hash = '#/search' },
    { title: 'View Dashboard', icon: '📊', action: () => window.location.hash = '#/dashboard' },
    { title: 'Plan Travel', icon: '✈️', action: () => window.location.hash = '#/travel' },
    { title: 'Get Support', icon: '💬', action: () => alert('Support chat coming soon!') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">AfyaConnect Mobile</h1>
            <p className="text-primary-light">Your health companion on the go</p>
          </div>
          
          {user && (
            <div className="mt-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">Welcome, {user.firstName}!</h3>
                <p className="text-sm opacity-90">Manage your health journey</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <p className="text-sm font-medium text-dark">{action.title}</p>
              </button>
            ))}
          </div>

          {/* Mobile Features */}
          <h2 className="text-lg font-semibold text-dark mb-4">Mobile Features</h2>
          <div className="space-y-4">
            {mobileFeatures.map((feature) => (
              <div
                key={feature.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">{feature.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-dark">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      {feature.badge}
                    </span>
                  </div>
                  
                  <button
                    onClick={feature.action}
                    className={`w-full bg-gradient-to-r ${feature.color} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity`}
                  >
                    Open {feature.title}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PWA Features */}
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">📱 App Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Offline Access
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Push Notifications
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Home Screen Install
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                App-like Experience
              </div>
            </div>
          </div>

          {/* Installation Prompt */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">📲 Install AfyaConnect App</h4>
            <p className="text-yellow-800 text-sm mb-3">
              Get the full app experience with offline access and push notifications
            </p>
            <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
              Install App on Home Screen
            </button>
          </div>
        </div>

        {/* Mobile Components */}
        <DigitalHealthPassport
          isOpen={showHealthPassport}
          onClose={() => setShowHealthPassport(false)}
        />
        
      </div>
    </div>
  );
};