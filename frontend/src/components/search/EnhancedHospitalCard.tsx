import React from 'react';
import { StarRating } from '../common/StarRating';

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

interface EnhancedHospitalCardProps {
  hospital: Hospital;
  onViewDetails: (hospitalName: string) => void;
  onGetQuote: (hospitalId: number) => void;
}

export const EnhancedHospitalCard: React.FC<EnhancedHospitalCardProps> = ({
  hospital,
  onViewDetails,
  onGetQuote
}) => {
  const getPriceRangeDisplay = (range: string) => {
    switch (range) {
      case 'budget': return { text: 'Budget Friendly', color: 'text-green-600', bg: 'bg-green-100' };
      case 'moderate': return { text: 'Moderate', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'premium': return { text: 'Premium', color: 'text-purple-600', bg: 'bg-purple-100' };
      default: return { text: 'Contact for Pricing', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const priceDisplay = getPriceRangeDisplay(hospital.priceRange);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Hospital Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={hospital.imageUrl}
          alt={hospital.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priceDisplay.bg} ${priceDisplay.color}`}>
            {priceDisplay.text}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <StarRating rating={hospital.averageRating} size="sm" />
            <span className="text-xs text-gray-600 ml-1">({hospital.ratingCount})</span>
          </div>
        </div>
      </div>

      {/* Hospital Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-dark mb-1 group-hover:text-primary transition-colors">
              {hospital.name}
            </h3>
            <p className="text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {hospital.city}, {hospital.state}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Est. {hospital.establishedYear}</p>
            <p className="text-sm text-gray-500">{hospital.bedCount} beds</p>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {hospital.description}
        </p>

        {/* Specialties */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {hospital.specialties.split(',').slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium"
              >
                {specialty.trim()}
              </span>
            ))}
            {hospital.specialties.split(',').length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                +{hospital.specialties.split(',').length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Accreditations */}
        {hospital.accreditations && hospital.accreditations.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {hospital.accreditations.slice(0, 3).map((acc, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {acc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Services */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {hospital.telemedicineServices && (
              <div className="flex items-center text-blue-600">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Telemedicine
              </div>
            )}
            {hospital.visaAssistance && (
              <div className="flex items-center text-purple-600">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Visa Assistance
              </div>
            )}
            {hospital.airportPickup && (
              <div className="flex items-center text-orange-600">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Airport Pickup
              </div>
            )}
          </div>
        </div>

        {/* Languages Spoken */}
        {hospital.languagesSpoken && hospital.languagesSpoken.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Languages Spoken:</p>
            <div className="flex flex-wrap gap-1">
              {hospital.languagesSpoken.slice(0, 4).map((lang, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {lang}
                </span>
              ))}
              {hospital.languagesSpoken.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{hospital.languagesSpoken.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => onViewDetails(hospital.name)}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            View Details
          </button>
          <button
            onClick={() => onGetQuote(hospital.id)}
            className="flex-1 border border-primary text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors text-sm"
          >
            Get Quote
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-center">
          <div>
            <p className="text-lg font-bold text-primary">{hospital.doctorCount}</p>
            <p className="text-xs text-gray-500">Doctors</p>
          </div>
          <div>
            <p className="text-lg font-bold text-secondary">{hospital.bedCount}</p>
            <p className="text-xs text-gray-500">Beds</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{hospital.averageRating.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};