import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const QuickAccessPanel: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      title: 'Find Treatment',
      icon: '🏥',
      href: '#/search',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Search by medical condition'
    },
    {
      title: 'Virtual Tours',
      icon: '🌐',
      href: '#/experience',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Explore hospitals in 360°'
    },
    {
      title: 'Success Stories',
      icon: '💬',
      href: '#testimonials',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Real patient experiences'
    },
    {
      title: 'Get Free Consultation',
      icon: '📞',
      href: '#footer',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Speak with our experts'
    }
  ];

  const availableActions = quickActions;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        {/* Quick Actions Menu */}
        {isOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
              <h3 className="font-bold text-lg">Quick Access</h3>
              <p className="text-sm text-primary-light">Jump to any feature instantly</p>
            </div>

            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {availableActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white mr-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-lg">{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-dark group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}

              {!user && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Sign in for more features</p>
                        <p className="text-xs text-yellow-700">Access dashboard, bookings & more</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};