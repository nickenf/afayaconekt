import React, { useState, useEffect } from 'react';
import { StarRating } from '../common/StarRating';
import { getUserTestimonials } from '../../services/api';


interface Testimonial {
  id: string;
  patientName: string;
  patientCountry: string;
  patientAge: number;
  treatmentType: string;
  hospitalName: string;
  doctorName: string;
  rating: number;
  testimonialText: string;
  treatmentDate: string;
  treatmentDuration: string;
  costSaved: number;
  beforeImage?: string;
  afterImage?: string;
  videoTestimonial?: string;
  isVerified: boolean;
  tags: string[];
}

export const PatientTestimonials: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [filterByTreatment, setFilterByTreatment] = useState<string>('all');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch testimonials with current filter
        const treatmentTypeParam = filterByTreatment === 'all' ? undefined : treatmentTypeMapping[filterByTreatment as keyof typeof treatmentTypeMapping];
        const testimonialData = await getUserTestimonials(treatmentTypeParam);
        const transformedData = testimonialData.map((item: any) => ({
          id: item.id.toString(),
          patientName: item.patientName,
          patientCountry: item.patientCountry,
          patientAge: item.patientAge ? parseInt(item.patientAge) : 0,
          treatmentType: item.treatmentType,
          hospitalName: item.hospitalName,
          doctorName: item.doctorName,
          rating: item.rating,
          testimonialText: item.testimonialText,
          treatmentDate: item.treatmentDate || '',
          treatmentDuration: item.treatmentDuration || '',
          costSaved: item.costSaved ? parseFloat(item.costSaved) : 0,
          beforeImage: item.beforeImage,
          afterImage: item.afterImage,
          videoTestimonial: item.videoTestimonial,
          isVerified: item.isVerified === 1,
          tags: Array.isArray(item.tags) ? item.tags : (item.tags ? JSON.parse(item.tags) : [])
        }));
        setTestimonials(transformedData);

      } catch (err: any) {
        setError(err.message || 'Failed to load testimonials');
        // Fallback to mock data if API fails
        setTestimonials([
          {
            id: 'fallback-1',
            patientName: 'Test User',
            patientCountry: 'Kenya',
            patientAge: 0,
            treatmentType: 'Cardiology',
            hospitalName: 'Apollo Hospitals Chennai',
            doctorName: 'Dr. Rajesh Kumar',
            rating: 5,
            testimonialText: 'Amazing experience! The doctors were professional and the facilities were world-class. I saved over $10,000 compared to treatment in the US.',
            treatmentDate: '',
            treatmentDuration: '',
            costSaved: 10000,
            isVerified: true,
            tags: ['Excellent Doctors', 'Cost-Effective']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filterByTreatment]);


  const treatments = ['all', 'Heart Surgery', 'Orthopedics', 'Fertility', 'Eye Surgery', 'Cancer Treatment'];

  // Map filter options to actual treatmentType values
  const treatmentTypeMapping = {
    'Heart Surgery': 'Cardiology',
    'Orthopedics': 'Orthopedics',
    'Fertility': 'Fertility',
    'Eye Surgery': 'Ophthalmology',
    'Cancer Treatment': 'Oncology'
  };

  const currentTestimonial = testimonials[activeTestimonial] || testimonials[0];

  // Reset active testimonial index if it exceeds available testimonials
  React.useEffect(() => {
    if (activeTestimonial >= testimonials.length && testimonials.length > 0) {
      setActiveTestimonial(0);
    }
  }, [testimonials, activeTestimonial]);


  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">Unable to load testimonials. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!isLoading && testimonials.length === 0 && filterByTreatment !== 'all') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-dark mb-2">Patient Success Stories</h3>
            <p className="text-gray-600">Real experiences from patients who found healing through AfyaConnect</p>
          </div>
          <div>
            <select
              value={filterByTreatment}
              onChange={(e) => {
                setFilterByTreatment(e.target.value);
                setActiveTestimonial(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {treatments.map(treatment => (
                <option key={treatment} value={treatment}>
                  {treatment === 'all' ? 'All Treatments' : treatment}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.966-5.618-2.479.048-.132.096-.263.144-.394M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-dark mb-2">No testimonials found</h4>
          <p className="text-gray-600 mb-6">
            We don't have any testimonials for "{filterByTreatment === 'all' ? 'All Treatments' : filterByTreatment}" yet.
          </p>
          <button
            onClick={() => setFilterByTreatment('all')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            View All Testimonials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-dark mb-2">Patient Success Stories</h3>
          <p className="text-gray-600">Real experiences from patients who found healing through AfyaConnect</p>
        </div>
        <div>
          <select
            value={filterByTreatment}
            onChange={(e) => {
              setFilterByTreatment(e.target.value);
              setActiveTestimonial(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {treatments.map(treatment => (
              <option key={treatment} value={treatment}>
                {treatment === 'all' ? 'All Treatments' : treatment}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Testimonial */}
        <div className="space-y-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-lg p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold">{currentTestimonial.patientName}</h4>
                  <p className="text-primary-light">{currentTestimonial.patientCountry} • Age {currentTestimonial.patientAge}</p>
                  <p className="text-sm opacity-90 mt-1">{currentTestimonial.treatmentType}</p>
                </div>
                <div className="text-right">
                  <StarRating rating={currentTestimonial.rating} size="sm" />
                  {currentTestimonial.isVerified && (
                    <div className="flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <blockquote className="text-lg italic mb-4">
                "{currentTestimonial.testimonialText}"
              </blockquote>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="opacity-80">Hospital:</p>
                  <p className="font-medium">{currentTestimonial.hospitalName}</p>
                </div>
                <div>
                  <p className="opacity-80">Doctor:</p>
                  <p className="font-medium">{currentTestimonial.doctorName}</p>
                </div>
                <div>
                  <p className="opacity-80">Duration:</p>
                  <p className="font-medium">{currentTestimonial.treatmentDuration}</p>
                </div>
                <div>
                  <p className="opacity-80">Cost Saved:</p>
                  <p className="font-medium">${currentTestimonial.costSaved.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Quote decoration */}
            <div className="absolute -top-4 -left-4 text-6xl text-primary/20">
              "
            </div>
          </div>

          {/* Treatment Tags */}
          <div>
            <div className="flex flex-wrap gap-2">
              {currentTestimonial.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Before/After Images */}
          {currentTestimonial.beforeImage && currentTestimonial.afterImage && (
            <div>
              <h5 className="font-semibold text-dark mb-3">Treatment Results</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Before Treatment</p>
                  <img
                    src={currentTestimonial.beforeImage}
                    alt="Before treatment"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">After Treatment</p>
                  <img
                    src={currentTestimonial.afterImage}
                    alt="After treatment"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Testimonial List */}
        <div>
          <h4 className="font-semibold text-dark mb-4">More Success Stories</h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                onClick={() => setActiveTestimonial(index)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  index === activeTestimonial
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-dark">{testimonial.patientName}</h5>
                    <p className="text-sm text-gray-600">{testimonial.patientCountry}</p>
                  </div>
                  <StarRating rating={testimonial.rating} size="sm" />
                </div>
                <p className="text-sm text-primary font-medium mb-1">{testimonial.treatmentType}</p>
                <p className="text-sm text-gray-700 line-clamp-2">{testimonial.testimonialText}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{testimonial.hospitalName}</span>
                  <span className="text-xs text-green-600 font-medium">
                    Saved ${testimonial.costSaved.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-8 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTestimonial(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === activeTestimonial ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};