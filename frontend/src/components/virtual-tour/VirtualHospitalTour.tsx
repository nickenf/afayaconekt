import React, { useState } from 'react';

interface TourStop {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  panoramaUrl?: string;
  category: string;
  features: string[];
  equipment?: string[];
}

interface VirtualHospitalTourProps {
  hospitalName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualHospitalTour: React.FC<VirtualHospitalTourProps> = ({
  hospitalName,
  isOpen,
  onClose
}) => {
  const [currentStop, setCurrentStop] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | 'panorama'>('gallery');

  const tourStops: TourStop[] = [
    {
      id: 'entrance',
      name: 'Main Entrance & Reception',
      description: 'Welcome to our state-of-the-art medical facility with 24/7 reception and patient services.',
      imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800',
      category: 'Reception',
      features: ['24/7 Reception', 'International Patient Desk', 'Multilingual Staff', 'Wheelchair Access'],
      equipment: ['Information Kiosks', 'Waiting Area', 'Pharmacy', 'Coffee Shop']
    },
    {
      id: 'icu',
      name: 'Intensive Care Unit',
      description: 'Advanced ICU with state-of-the-art monitoring and life support systems.',
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
      category: 'Critical Care',
      features: ['24/7 Monitoring', 'Ventilator Support', 'Cardiac Monitoring', 'Isolation Rooms'],
      equipment: ['Ventilators', 'Cardiac Monitors', 'Defibrillators', 'Infusion Pumps']
    },
    {
      id: 'operation-theater',
      name: 'Operation Theaters',
      description: 'Modern operation theaters with advanced surgical equipment and sterile environments.',
      imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800',
      category: 'Surgery',
      features: ['Sterile Environment', 'Advanced Anesthesia', 'Surgical Navigation', 'Live Streaming'],
      equipment: ['Robotic Surgery Systems', 'Laparoscopic Equipment', 'Microscopes', 'Anesthesia Machines']
    },
    {
      id: 'patient-rooms',
      name: 'Patient Rooms',
      description: 'Comfortable patient rooms with modern amenities and family accommodation.',
      imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
      category: 'Accommodation',
      features: ['Private Rooms', 'Family Accommodation', 'Entertainment System', 'Nurse Call System'],
      equipment: ['Hospital Bed', 'TV', 'WiFi', 'Refrigerator', 'Bathroom']
    },
    {
      id: 'diagnostics',
      name: 'Diagnostic Center',
      description: 'Comprehensive diagnostic facilities with latest imaging and laboratory equipment.',
      imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
      category: 'Diagnostics',
      features: ['Digital Imaging', 'Laboratory Services', 'Pathology', 'Radiology'],
      equipment: ['MRI Scanner', 'CT Scanner', 'Ultrasound', 'X-Ray', 'Lab Equipment']
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy & Medical Store',
      description: 'Fully stocked pharmacy with international medications and medical supplies.',
      imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800',
      category: 'Services',
      features: ['24/7 Pharmacy', 'International Medications', 'Home Delivery', 'Insurance Billing'],
      equipment: ['Medication Storage', 'Prescription System', 'Consultation Counter']
    },
    {
      id: 'cafeteria',
      name: 'Cafeteria & Dining',
      description: 'Multi-cuisine cafeteria with healthy meal options and dietary accommodations.',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      category: 'Amenities',
      features: ['Multi-Cuisine Options', 'Dietary Accommodations', 'Healthy Meals', 'Family Dining'],
      equipment: ['Kitchen Facilities', 'Dining Area', 'Takeaway Counter', 'Vending Machines']
    }
  ];

  const currentTourStop = tourStops[currentStop];

  const nextStop = () => {
    setCurrentStop((prev) => (prev + 1) % tourStops.length);
  };

  const prevStop = () => {
    setCurrentStop((prev) => (prev - 1 + tourStops.length) % tourStops.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Virtual Hospital Tour</h2>
              <p className="text-primary-light">{hospitalName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tour Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Tour Progress</span>
              <span>{currentStop + 1} of {tourStops.length}</span>
            </div>
            <div className="w-full bg-primary-dark rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentStop + 1) / tourStops.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Tour Navigation */}
          <div className="w-1/4 bg-gray-50 p-4 overflow-y-auto">
            <h3 className="font-semibold text-dark mb-4">Tour Stops</h3>
            <div className="space-y-2">
              {tourStops.map((stop, index) => (
                <button
                  key={stop.id}
                  onClick={() => setCurrentStop(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentStop
                      ? 'bg-primary text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{stop.name}</div>
                  <div className={`text-xs ${index === currentStop ? 'text-primary-light' : 'text-gray-500'}`}>
                    {stop.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Tour View */}
          <div className="flex-1 flex flex-col">
            {/* View Mode Toggle */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'gallery'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📷 Gallery View
                </button>
                <button
                  onClick={() => setViewMode('panorama')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'panorama'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🌐 360° View
                </button>
              </div>
            </div>

            {/* Tour Content */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Image/Panorama View */}
                <div className="relative">
                  {viewMode === 'gallery' ? (
                    <img
                      src={currentTourStop.imageUrl}
                      alt={currentTourStop.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🌐</div>
                        <p className="text-lg font-medium">360° Panoramic View</p>
                        <p className="text-sm opacity-80">Interactive tour coming soon</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevStop}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextStop}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Information Panel */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-dark mb-2">{currentTourStop.name}</h3>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                      {currentTourStop.category}
                    </span>
                    <p className="text-gray-700 mt-4">{currentTourStop.description}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-dark mb-3">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {currentTourStop.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  {currentTourStop.equipment && (
                    <div>
                      <h4 className="font-semibold text-dark mb-3">Equipment & Facilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentTourStop.equipment.map((item, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                      Book Consultation in This Department
                    </button>
                    <button className="w-full border border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                      Get More Information
                    </button>
                  </div>

                  {/* Tour Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{tourStops.length}</p>
                        <p className="text-xs text-gray-600">Tour Stops</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary">{currentStop + 1}</p>
                        <p className="text-xs text-gray-600">Current Stop</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(((currentStop + 1) / tourStops.length) * 100)}%
                        </p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStop}
                  disabled={currentStop === 0}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex space-x-2">
                  {tourStops.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStop(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentStop ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStop}
                  disabled={currentStop === tourStops.length - 1}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};