import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  specialtyName: string;
  consultationFee: number;
  hospitalName: string;
  city: string;
  state: string;
  telemedicineAvailable: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentBookingProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  doctor,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [isTelemedicine, setIsTelemedicine] = useState(false);
  const [notes, setNotes] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(`/api/doctors/${doctor.id}/availability?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.timeSlots);
      }
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to book an appointment');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          hospitalId: 1, // This should be dynamic based on doctor's hospital
          appointmentType,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          duration: 30,
          notes,
          isTelemedicine
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to book appointment');
      }
    } catch (error) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark">Book Consultation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Doctor Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-lg font-bold">
                {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark">
                  {doctor.title} {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="text-primary font-medium">{doctor.specialtyName}</p>
                <p className="text-sm text-gray-600">{doctor.hospitalName}</p>
                <p className="text-sm text-gray-500">{doctor.city}, {doctor.state}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Consultation Fee:</span>
              <span className="text-lg font-bold text-primary">${doctor.consultationFee}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Appointment Type
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="consultation">Initial Consultation</option>
                <option value="follow-up">Follow-up Consultation</option>
                <option value="second-opinion">Second Opinion</option>
                <option value="pre-operative">Pre-operative Consultation</option>
                <option value="post-operative">Post-operative Follow-up</option>
              </select>
            </div>

            {/* Telemedicine Option */}
            {doctor.telemedicineAvailable && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isTelemedicine}
                    onChange={(e) => setIsTelemedicine(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Online consultation (Telemedicine)
                  </span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Available
                  </span>
                </label>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-dark mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                max={maxDateStr}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Available Time Slots
                </label>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-gray-600">Loading available slots...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          selectedTime === slot.time
                            ? 'border-primary bg-primary text-white'
                            : slot.available
                            ? 'border-gray-300 hover:border-primary hover:bg-primary/5'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-dark mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Please describe your symptoms or reason for consultation..."
              />
            </div>

            {/* Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-dark mb-2">Appointment Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                  <p><strong>Type:</strong> {appointmentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p><strong>Format:</strong> {isTelemedicine ? 'Online (Telemedicine)' : 'In-person'}</p>
                  <p><strong>Fee:</strong> ${doctor.consultationFee}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedDate || !selectedTime}
                className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  </div>
                ) : (
                  `Book Appointment - $${doctor.consultationFee}`
                )}
              </button>
            </div>
          </form>

          {!user && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> You need to be logged in to book an appointment. 
                Please sign in or create an account to continue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};