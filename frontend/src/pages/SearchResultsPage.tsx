import React, { useState, useEffect, useRef } from 'react';
import { AdvancedSearch } from '../components/search/AdvancedSearch';
import { EnhancedHospitalCard } from '../components/search/EnhancedHospitalCard';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { CostEstimator } from '../components/search/CostEstimator';

interface SearchFilters {
   specialty?: string;
   treatment?: string;
   hospitalName?: string;
   city?: string;
   district?: string;
   state?: string;
   priceRange?: string;
   accreditation?: string;
   minRating?: number;
   sortBy?: string;
}

interface Hospital {
  id: number;
  name: string;
  specialties: string;
  imageUrl: string;
  city: string;
  state: string;
  description: string;
  accreditations: string[];
  averageRating: number;
  ratingCount: number;
  establishedYear: number;
  bedCount: number;
  doctorCount: number;
  priceRange: string;
  languagesSpoken: string[];
  telemedicineServices: boolean;
  visaAssistance: boolean;
  airportPickup: boolean;
  translationServices: boolean;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  specialtyName: string;
  qualifications: string;
  experience: number;
  imageUrl: string;
  biography: string;
  languagesSpoken: string[];
  consultationFee: number;
  rating: number;
  reviewCount: number;
  hospitalName: string;
  city: string;
  state: string;
  telemedicineAvailable: boolean;
}

export const SearchResultsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hospitals' | 'doctors'>('hospitals');
  const [showCostEstimator, setShowCostEstimator] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial data
    handleSearch({});
  }, []);

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Search hospitals
      const hospitalParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) hospitalParams.append(key, value.toString());
      });

      const hospitalResponse = await fetch(`/api/search/hospitals?${hospitalParams}`);
      if (hospitalResponse.ok) {
        const hospitalData = await hospitalResponse.json();
        setHospitals(hospitalData);
      }

      // Search doctors
      const doctorParams = new URLSearchParams();
      if (filters.specialty) {
        // Get specialty ID first
        const specialtyResponse = await fetch('/api/specialties');
        if (specialtyResponse.ok) {
          const specialties = await specialtyResponse.json();
          const specialty = specialties.find((s: any) => s.name === filters.specialty);
          if (specialty) {
            doctorParams.append('specialtyId', specialty.id.toString());
          }
        }
      }

      const doctorResponse = await fetch(`/api/doctors?${doctorParams}`);
      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        setDoctors(doctorData);
      }

    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
      // Scroll to results section after search completes
      setTimeout(() => {
        if (resultsRef.current) {
          // Scroll to the results section with some offset for better visibility
          const yOffset = -100; // Offset to show some content above the results
          const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({
            top: y,
            behavior: 'smooth'
          });
        }
      }, 500); // Increased delay to ensure results are fully rendered
    }
  };

  const handleViewHospitalDetails = (hospitalName: string) => {
    window.location.hash = `#/hospital/${encodeURIComponent(hospitalName)}`;
  };

  const handleGetQuote = (hospitalId: number) => {
    setSelectedHospitalId(hospitalId);
    setShowCostEstimator(true);
  };

  const handleViewDoctorProfile = (doctorId: number) => {
    window.location.hash = `#/doctor/${doctorId}`;
  };

  const handleBookConsultation = (doctorId: number) => {
    window.location.hash = `#/book-consultation/${doctorId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advanced Search Component */}
        <AdvancedSearch onSearch={handleSearch} isLoading={isLoading} />

        {/* Results Tabs */}
        <div ref={resultsRef} data-results-section className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('hospitals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'hospitals'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Hospitals ({hospitals.length})
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'doctors'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Doctors ({doctors.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results Content */}
        <div className="space-y-6">
          {activeTab === 'hospitals' ? (
            <>
              {hospitals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hospitals.map((hospital) => (
                    <EnhancedHospitalCard
                      key={hospital.id}
                      hospital={hospital}
                      onViewDetails={handleViewHospitalDetails}
                      onGetQuote={handleGetQuote}
                    />
                  ))}
                </div>
              ) : !isLoading ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
                  <p className="text-gray-600">Try adjusting your search filters to find more results.</p>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {doctors.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {doctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onViewProfile={handleViewDoctorProfile}
                      onBookConsultation={handleBookConsultation}
                    />
                  ))}
                </div>
              ) : !isLoading ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-600">Try adjusting your search filters to find more results.</p>
                </div>
              ) : null}
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Searching for the best options...</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6 space-y-3">
          <button
            onClick={() => setShowCostEstimator(true)}
            className="bg-secondary text-white p-4 rounded-full shadow-lg hover:bg-secondary/90 transition-colors"
            title="Cost Estimator"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </button>
        </div>

        {/* Cost Estimator Modal */}
        <CostEstimator
          isOpen={showCostEstimator}
          onClose={() => setShowCostEstimator(false)}
          selectedHospitalId={selectedHospitalId || undefined}
        />
      </div>
    </div>
  );
};