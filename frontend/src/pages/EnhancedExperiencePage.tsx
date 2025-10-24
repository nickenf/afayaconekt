import React, { useState } from 'react';
import { VirtualHospitalTour } from '../components/virtual-tour/VirtualHospitalTour';
import { TreatmentRecommendations } from '../components/ai/TreatmentRecommendations';
import { PatientTestimonials } from '../components/testimonials/PatientTestimonials';
import { SuccessRateAnalytics } from '../components/analytics/SuccessRateAnalytics';

export const EnhancedExperiencePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'tours' | 'ai' | 'testimonials' | 'analytics'>('overview');
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('Apollo Hospitals Chennai');

  const features = [
    {
      id: 'tours',
      title: 'Virtual Hospital Tours',
      description: 'Explore hospitals with immersive 360° virtual tours',
      icon: '🏥',
      color: 'from-blue-500 to-cyan-500',
      stats: '8 Tour Stops • 360° Views'
    },
    {
      id: 'ai',
      title: 'AI Treatment Recommendations',
      description: 'Get personalized treatment suggestions powered by AI',
      icon: '🤖',
      color: 'from-purple-500 to-pink-500',
      stats: '92% Accuracy • Instant Results'
    },
    {
      id: 'testimonials',
      title: 'Patient Success Stories',
      description: 'Real experiences from patients who found healing',
      icon: '💬',
      color: 'from-green-500 to-emerald-500',
      stats: '2,500+ Stories • 98.5% Success'
    },
    {
      id: 'analytics',
      title: 'Success Rate Analytics',
      description: 'Comprehensive data on treatment outcomes',
      icon: '📊',
      color: 'from-orange-500 to-red-500',
      stats: 'Real-time Data • 15+ Treatments'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">Enhanced Experience Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our advanced features designed to provide you with the most comprehensive 
            and personalized medical tourism experience
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '🌟' },
                { id: 'tours', label: 'Virtual Tours', icon: '🏥' },
                { id: 'ai', label: 'AI Recommendations', icon: '🤖' },
                { id: 'testimonials', label: 'Success Stories', icon: '💬' },
                { id: 'analytics', label: 'Analytics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                    activeSection === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="group cursor-pointer"
                    onClick={() => setActiveSection(feature.id as any)}
                  >
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className={`h-32 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <span className="text-4xl">{feature.icon}</span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                        <p className="text-xs text-primary font-medium">{feature.stats}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Demo */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-dark mb-4">Experience the Future of Medical Tourism</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Our platform combines cutting-edge technology with personalized care to provide 
                    an unmatched medical tourism experience.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="font-semibold text-dark mb-2">Discover</h3>
                    <p className="text-gray-600 text-sm">
                      Use AI to find the perfect treatment and hospital for your needs
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏥</span>
                    </div>
                    <h3 className="font-semibold text-dark mb-2">Explore</h3>
                    <p className="text-gray-600 text-sm">
                      Take virtual tours of hospitals before making your decision
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✨</span>
                    </div>
                    <h3 className="font-semibold text-dark mb-2">Experience</h3>
                    <p className="text-gray-600 text-sm">
                      Join thousands of successful patients with proven outcomes
                    </p>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowVirtualTour(true)}
                    className="bg-primary text-white py-3 px-8 rounded-lg font-medium hover:bg-primary/90 transition-colors mr-4"
                  >
                    Start Virtual Tour
                  </button>
                  <button
                    onClick={() => setActiveSection('ai')}
                    className="border border-primary text-primary py-3 px-8 rounded-lg font-medium hover:bg-primary/5 transition-colors"
                  >
                    Get AI Recommendations
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'tours' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-dark">Virtual Hospital Tours</h2>
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Apollo Hospitals Chennai">Apollo Hospitals Chennai</option>
                    <option value="Fortis Hospital Gurgaon">Fortis Hospital Gurgaon</option>
                    <option value="Max Super Speciality Hospital Delhi">Max Super Speciality Hospital Delhi</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {[
                    { name: 'Operation Theaters', image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400' },
                    { name: 'Patient Rooms', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400' }
                  ].map((area, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => setShowVirtualTour(true)}>
                      <img
                        src={area.image}
                        alt={area.name}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-center text-white">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="font-medium">Take Virtual Tour</p>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-semibold">{area.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowVirtualTour(true)}
                    className="bg-primary text-white py-3 px-8 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Start Complete Virtual Tour
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ai' && <TreatmentRecommendations />}
          {activeSection === 'testimonials' && <PatientTestimonials />}
          {activeSection === 'analytics' && <SuccessRateAnalytics />}
        </div>

        {/* Virtual Tour Modal */}
        <VirtualHospitalTour
          hospitalName={selectedHospital}
          isOpen={showVirtualTour}
          onClose={() => setShowVirtualTour(false)}
        />
      </div>
    </div>
  );
};