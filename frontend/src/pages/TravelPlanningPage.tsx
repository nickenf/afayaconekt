import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { AccommodationBookingModal } from '../components/booking/AccommodationBookingModal';

interface Accommodation {
  id: number;
  name: string;
  type: string;
  description: string;
  address: string;
  distanceFromHospital: number;
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  contactPhone: string;
  contactEmail: string;
  isPartner: boolean;
}

interface TransportationService {
  id: number;
  serviceType: string;
  providerName: string;
  description: string;
  vehicleType: string;
  capacity: number;
  amenities: string[];
  pricePerKm: number;
  minimumCharge: number;
  currency: string;
  coverage: string;
  rating: number;
  reviewCount: number;
  contactPhone: string;
  contactEmail: string;
}

export const TravelPlanningPage: React.FC = () => {
  const { } = useAuth();
  const route = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [transportServices, setTransportServices] = useState<TransportationService[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'accommodation' | 'transport' | 'visa'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);

  useEffect(() => {
    const checkTabFromURL = () => {
      // Check URL hash fragments for initial tab (handle hash-based routing)
      const hash = window.location.hash;
      // Look for second # in "#/travel#visa"
      const secondHashIndex = hash.indexOf('#', 1);
      if (secondHashIndex !== -1) {
        const tabFragment = hash.substring(secondHashIndex + 1);
        if (tabFragment && ['overview', 'accommodation', 'transport', 'visa'].includes(tabFragment)) {
          setActiveTab(tabFragment as 'overview' | 'accommodation' | 'transport' | 'visa');
        }
      }
    };

    // Check tab from URL whenever route changes
    checkTabFromURL();

    fetchTravelData();
  }, [route, selectedHospital]);

  const fetchTravelData = async () => {
    setIsLoading(true);
    try {
      // Fetch accommodations
      const accommodationUrl = selectedHospital 
        ? `/api/accommodations?hospitalId=${selectedHospital}`
        : '/api/accommodations';
      
      const accommodationResponse = await fetch(accommodationUrl);
      if (accommodationResponse.ok) {
        const accommodationData = await accommodationResponse.json();
        setAccommodations(accommodationData);
      }

      // Fetch transportation services
      const transportResponse = await fetch('/api/transportation');
      if (transportResponse.ok) {
        const transportData = await transportResponse.json();
        setTransportServices(transportData);
      }

    } catch (error) {
      console.error('Failed to fetch travel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccommodationTypeIcon = (type: string) => {
    switch (type) {
      case 'luxury_hotel': return '🏨';
      case 'business_hotel': return '🏢';
      case 'guest_house': return '🏠';
      case 'service_apartment': return '🏠';
      default: return '🏨';
    }
  };

  const getTransportIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'airport_transfer': return '✈️';
      case 'hospital_shuttle': return '🚐';
      case 'ambulance': return '🚑';
      case 'local_transport': return '🚗';
      default: return '🚗';
    }
  };

  const handleBookAccommodation = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    // Refresh accommodations data
    fetchTravelData();
    // Close modal
    setBookingModalOpen(false);
    setSelectedAccommodation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Travel Planning</h1>
          <p className="text-gray-600">Plan your medical journey with comprehensive travel and accommodation services</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
                { id: 'transport', label: 'Transportation', icon: '🚗' },
                { id: 'visa', label: 'Visa Assistance', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                    activeTab === tab.id
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
        {isLoading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading travel options...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Travel Checklist */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">Medical Travel Checklist</h3>
                  <div className="space-y-4">
                    {[
                      { task: 'Book consultation with doctor', status: 'pending', icon: '👨‍⚕️' },
                      { task: 'Apply for medical visa', status: 'pending', icon: '📄' },
                      { task: 'Book accommodation near hospital', status: 'pending', icon: '🏨' },
                      { task: 'Arrange airport transfer', status: 'pending', icon: '✈️' },
                      { task: 'Get travel insurance', status: 'pending', icon: '🛡️' },
                      { task: 'Prepare medical documents', status: 'pending', icon: '📋' },
                      { task: 'Currency exchange', status: 'pending', icon: '💱' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-dark">{item.task}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-dark mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-left flex items-center">
                        <span className="mr-3">📄</span>
                        Apply for Visa
                      </button>
                      <button className="w-full border border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors text-left flex items-center">
                        <span className="mr-3">🏨</span>
                        Book Accommodation
                      </button>
                      <button className="w-full border border-secondary text-secondary py-3 px-4 rounded-lg font-medium hover:bg-secondary/5 transition-colors text-left flex items-center">
                        <span className="mr-3">🚗</span>
                        Arrange Transport
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Travel Tip</h4>
                    <p className="text-blue-800 text-sm">
                      Book your accommodation at least 2 weeks before your treatment date to ensure availability and better rates.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accommodation' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-dark">Accommodation Options</h3>
                    <div className="flex items-center space-x-4">
                      <select
                        value={selectedHospital || ''}
                        onChange={(e) => setSelectedHospital(e.target.value ? parseInt(e.target.value) : null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">All Hospitals</option>
                        <option value="1">Apollo Hospitals Chennai</option>
                        <option value="2">Fortis Hospital Gurgaon</option>
                        <option value="3">Max Super Speciality Hospital Delhi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accommodations.map((accommodation) => (
                      <div key={accommodation.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48">
                          <img
                            src={accommodation.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                            alt={accommodation.name}
                            className="w-full h-full object-cover"
                          />
                          {accommodation.isPartner && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                                Partner
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                            <span className="text-sm font-medium">{accommodation.rating}⭐</span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-dark flex items-center">
                                {getAccommodationTypeIcon(accommodation.type)} {accommodation.name}
                              </h4>
                              <p className="text-sm text-gray-600 capitalize">{accommodation.type.replace('_', ' ')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">${accommodation.pricePerNight}</p>
                              <p className="text-xs text-gray-500">per night</p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{accommodation.description}</p>

                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {accommodation.distanceFromHospital} km from hospital
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {amenity}
                                </span>
                              ))}
                              {accommodation.amenities.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{accommodation.amenities.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBookAccommodation(accommodation)}
                              className="flex-1 bg-primary text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                              Book Now
                            </button>
                            <button className="flex-1 border border-primary text-primary py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transport' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-dark mb-6">Transportation Services</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {transportServices.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-dark flex items-center">
                              {getTransportIcon(service.serviceType)} {service.providerName}
                            </h4>
                            <p className="text-sm text-primary font-medium capitalize">
                              {service.serviceType.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-600">{service.vehicleType} • {service.capacity} passengers</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">${service.pricePerKm}</p>
                            <p className="text-xs text-gray-500">per km</p>
                            <p className="text-xs text-gray-500">Min: ${service.minimumCharge}</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">{service.description}</p>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {service.amenities.map((amenity, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <span className="ml-1 text-sm font-medium">{service.rating}⭐ ({service.reviewCount})</span>
                          </div>
                          <span className="text-xs text-gray-500">Coverage: {service.coverage}</span>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 bg-primary text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                            Book Service
                          </button>
                          <button className="flex-1 border border-primary text-primary py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors">
                            Get Quote
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visa' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-dark mb-6">Visa Assistance</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Visa Information */}
                  <div>
                    <h4 className="font-medium text-dark mb-4">Medical Visa Requirements</h4>
                    <div className="space-y-3">
                      {[
                        'Valid passport (minimum 6 months validity)',
                        'Completed visa application form',
                        'Recent passport-size photographs',
                        'Medical letter from Indian hospital',
                        'Medical documents from home country',
                        'Proof of financial means',
                        'Travel itinerary and accommodation booking',
                        'Return flight tickets'
                      ].map((requirement, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{requirement}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Processing Time</h5>
                      <p className="text-blue-800 text-sm">
                        Medical visas typically take 3-5 business days to process. 
                        We recommend applying at least 2 weeks before your travel date.
                      </p>
                    </div>
                  </div>

                  {/* Visa Application Form */}
                  <div>
                    <h4 className="font-medium text-dark mb-4">Start Your Visa Application</h4>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Enter passport number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                          <option value="">Select nationality</option>
                          <option value="kenyan">Kenyan</option>
                          <option value="ugandan">Ugandan</option>
                          <option value="tanzanian">Tanzanian</option>
                          <option value="nigerian">Nigerian</option>
                          <option value="south_african">South African</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                          <option value="medical">Medical Treatment</option>
                          <option value="medical_attendant">Medical Attendant</option>
                          <option value="medical_consultation">Medical Consultation</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Submit Visa Application
                      </button>
                    </form>

                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        Need help? Our visa specialists are available 24/7
                      </p>
                      <button className="text-primary hover:text-primary/80 text-sm font-medium">
                        Contact Visa Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accommodation Booking Modal */}
        <AccommodationBookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedAccommodation(null);
          }}
          accommodation={selectedAccommodation}
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
    </div>
  );
};