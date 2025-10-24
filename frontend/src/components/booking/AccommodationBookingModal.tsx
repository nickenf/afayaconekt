import React, { useState, useEffect } from 'react';
import { Loader } from '../common/Loader.tsx';
import { ErrorMessage } from '../common/ErrorMessage.tsx';

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
    amenities: string[];
    images: string[];
    contactPhone: string;
    contactEmail: string;
}

interface AccommodationBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    accommodation: Accommodation | null;
    onBookingSuccess: () => void;
}

export const AccommodationBookingModal: React.FC<AccommodationBookingModalProps> = ({
    isOpen,
    onClose,
    accommodation,
    onBookingSuccess
}) => {
    const [formData, setFormData] = useState({
        checkInDate: '',
        checkOutDate: '',
        numberOfGuests: 1,
        specialRequests: '',
        contactPhone: '',
        emergencyContact: '',
        guestName: '',
        guestEmail: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [calculatedCost, setCalculatedCost] = useState(0);

    // Update cost when dates change
    useEffect(() => {
        if (accommodation && formData.checkInDate && formData.checkOutDate) {
            const checkIn = new Date(formData.checkInDate);
            const checkOut = new Date(formData.checkOutDate);
            const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
            setCalculatedCost(accommodation.pricePerNight * nights);
        } else {
            setCalculatedCost(0);
        }
    }, [formData.checkInDate, formData.checkOutDate, accommodation]);

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accommodation) return;

        setIsLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Only add Authorization header if user is logged in
            const authToken = localStorage.getItem('authToken');
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch('/api/accommodation-bookings', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    accommodationId: accommodation.id,
                    ...formData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create booking');
            }

            const result = await response.json();
            alert(`Booking created successfully! Total cost: ${result.currency} ${result.totalCost} for ${result.nights} nights`);
            onBookingSuccess();
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !accommodation) return null;

    const minCheckInDate = new Date().toISOString().split('T')[0];
    const minCheckOutDate = formData.checkInDate || minCheckInDate;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-dark">Book Accommodation</h2>
                            <p className="text-gray-600 mt-1">{accommodation.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Accommodation Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-4">
                            <img
                                src={accommodation.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                                alt={accommodation.name}
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-dark">{accommodation.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{accommodation.address}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {accommodation.distanceFromHospital} km from hospital
                                    </span>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary">
                                            {accommodation.currency} {accommodation.pricePerNight}
                                        </p>
                                        <p className="text-xs text-gray-500">per night</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && <ErrorMessage message={error} />}

                    {/* Booking Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Check-in Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.checkInDate}
                                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                                    min={minCheckInDate}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Check-out Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.checkOutDate}
                                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                                    min={minCheckOutDate}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Guests
                            </label>
                            <select
                                value={formData.numberOfGuests}
                                onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Phone *
                            </label>
                            <input
                                type="tel"
                                value={formData.contactPhone}
                                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Guest Name *
                            </label>
                            <input
                                type="text"
                                value={formData.guestName}
                                onChange={(e) => handleInputChange('guestName', e.target.value)}
                                placeholder="Full name for booking"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Guest Email *
                            </label>
                            <input
                                type="email"
                                value={formData.guestEmail}
                                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                                placeholder="email@example.com"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Emergency Contact
                            </label>
                            <input
                                type="text"
                                value={formData.emergencyContact}
                                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                                placeholder="Name and phone number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Requests
                            </label>
                            <textarea
                                value={formData.specialRequests}
                                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                                rows={3}
                                placeholder="Any special requirements or preferences..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Cost Summary */}
                        {calculatedCost > 0 && accommodation && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-blue-800">Accommodation:</span>
                                        <span className="font-medium text-blue-900">{accommodation.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-800">Price per night:</span>
                                        <span className="font-medium text-blue-900">
                                            {accommodation.currency} {accommodation.pricePerNight}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-800">Number of nights:</span>
                                        <span className="font-medium text-blue-900">
                                            {Math.max(1, Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24)))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-800">Number of guests:</span>
                                        <span className="font-medium text-blue-900">{formData.numberOfGuests}</span>
                                    </div>
                                    <hr className="border-blue-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-800 font-medium">Total Cost:</span>
                                        <span className="text-xl font-bold text-blue-900">
                                            {accommodation.currency} {calculatedCost}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader message="Booking..." /> : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};