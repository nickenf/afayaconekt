import React from 'react';
import { StarRating } from '../common/StarRating';

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

interface DoctorCardProps {
  doctor: Doctor;
  onViewProfile: (doctorId: number) => void;
  onBookConsultation: (doctorId: number) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onViewProfile,
  onBookConsultation
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Doctor Image */}
          <div className="flex-shrink-0">
            <img
              src={doctor.imageUrl}
              alt={`${doctor.title} ${doctor.firstName} ${doctor.lastName}`}
              className="w-20 h-20 rounded-full object-cover border-4 border-primary/10"
            />
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-dark">
                  {doctor.title} {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="text-primary font-medium">{doctor.specialtyName}</p>
                <p className="text-sm text-gray-600">{doctor.hospitalName}</p>
                <p className="text-sm text-gray-500">{doctor.city}, {doctor.state}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1">
                  <StarRating rating={doctor.rating} size="sm" />
                  <span className="text-sm text-gray-600 ml-1">({doctor.reviewCount})</span>
                </div>
                {doctor.telemedicineAvailable && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Online
                  </span>
                )}
              </div>
            </div>

            {/* Experience & Qualifications */}
            <div className="mt-3">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {doctor.experience} years of experience
              </div>
              <p className="text-sm text-gray-700 mb-3">{doctor.qualifications}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{doctor.biography}</p>
            </div>

            {/* Languages */}
            {doctor.languagesSpoken && doctor.languagesSpoken.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Languages:</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.languagesSpoken.slice(0, 3).map((lang, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {lang}
                    </span>
                  ))}
                  {doctor.languagesSpoken.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{doctor.languagesSpoken.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Consultation Fee */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Consultation Fee:</span>
                <span className="text-lg font-bold text-primary ml-2">${doctor.consultationFee}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onViewProfile(doctor.id)}
                className="flex-1 border border-primary text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors text-sm"
              >
                View Profile
              </button>
              <button
                onClick={() => onBookConsultation(doctor.id)}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
              >
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};