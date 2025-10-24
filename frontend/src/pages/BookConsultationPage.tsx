import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/common/Loader';
import { ErrorMessage } from '../components/common/ErrorMessage';

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
  availabilitySchedule: string;
}

export const BookConsultationPage: React.FC = () => {
  const { user, token } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Form state
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isTelemedicine, setIsTelemedicine] = useState(false);
  const [notes, setNotes] = useState('');

  // Get doctor ID from URL
  const doctorId = window.location.hash.split('/').pop();

  useEffect(() => {
    if (doctorId) {
      loadDoctor();
    }
  }, [doctorId]);

  const loadDoctor = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}`);
      if (response.ok) {
        const doctorData = await response.json();
        setDoctor(doctorData);
      } else {
        setError('Doctor not found');
      }
    } catch (err) {
      setError('Failed to load doctor information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentDate || !appointmentTime) {
      alert('Please select a date and time');
      return;
    }

    setIsBooking(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: parseInt(doctorId!),
          appointmentDate,
          appointmentTime,
          notes,
          isTelemedicine
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Consultation booked successfully!');
        // Redirect to dashboard or appointments page
        window.location.hash = '#/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to book consultation');
      }
    } catch (err: any) {
      setError('Failed to book consultation');
    } finally {
      setIsBooking(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader message="Loading doctor information..." />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <ErrorMessage message={error || 'Doctor not found'} />
          <button
            onClick={() => window.history.back()}
            className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:text-primary/80 font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <img
                  src={doctor.imageUrl}
                  alt={`${doctor.title} ${doctor.firstName} ${doctor.lastName}`}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-primary/10"
                />
                <h2 className="text-xl font-bold text-dark">
                  {doctor.title} {doctor.firstName} {doctor.lastName}
                </h2>
                <p className="text-primary font-medium">{doctor.specialtyName}</p>
                <p className="text-sm text-gray-600">{doctor.hospitalName}</p>
                <p className="text-sm text-gray-500">{doctor.city}, {doctor.state}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Experience:</span>
                  <span className="text-sm font-medium">{doctor.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <span className="text-sm font-medium">⭐ {doctor.rating} ({doctor.reviewCount} reviews)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Consultation Fee:</span>
                  <span className="text-lg font-bold text-primary">${doctor.consultationFee}</span>
                </div>
                {doctor.telemedicineAvailable && (
                  <div className="flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Telemedicine Available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-dark mb-6">Book Consultation</h3>

              {error && <ErrorMessage message={error} />}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date *
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time *
                  </label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Choose a time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* Consultation Type */}
                {doctor.telemedicineAvailable && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isTelemedicine}
                        onChange={(e) => setIsTelemedicine(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Request telemedicine consultation</span>
                    </label>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Any specific concerns or questions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-dark mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Consultation Fee:</span>
                      <span>${doctor.consultationFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>30 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{isTelemedicine ? 'Telemedicine' : 'In-person'}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${doctor.consultationFee}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? <Loader message="Booking..." /> : 'Book Consultation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};