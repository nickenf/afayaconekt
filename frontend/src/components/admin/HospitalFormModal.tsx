import { useState, useEffect } from 'react';
import { Loader } from '../common/Loader.tsx';
import { ErrorMessage } from '../common/ErrorMessage.tsx';

interface Hospital {
    id?: number;
    name: string;
    specialties: string;
    imageUrl: string;
    city: string;
    state: string;
    country: string;
    description: string;
    accreditations: string[];
    internationalPatientServices: string;
    gallery: string[];
    establishedYear: number;
    bedCount: number;
    doctorCount: number;
    nurseCount: number;
    languagesSpoken: string[];
    contactPhone: string;
    contactEmail: string;
    website: string;
    address: string;
    priceRange: string;
    insuranceAccepted: string[];
    paymentMethods: string[];
    accommodationPartners: string[];
    dietaryServices: string[];
}

interface HospitalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    hospital?: Hospital | null;
}

export const HospitalFormModal = ({ isOpen, onClose, onSave, hospital }: HospitalFormModalProps) => {
    const [formData, setFormData] = useState<Hospital>({
        name: '',
        specialties: '',
        imageUrl: '',
        city: '',
        state: '',
        country: 'India',
        description: '',
        accreditations: [],
        internationalPatientServices: '',
        gallery: [],
        establishedYear: new Date().getFullYear(),
        bedCount: 0,
        doctorCount: 0,
        nurseCount: 0,
        languagesSpoken: ['English'],
        contactPhone: '',
        contactEmail: '',
        website: '',
        address: '',
        priceRange: 'moderate',
        insuranceAccepted: [],
        paymentMethods: [],
        accommodationPartners: [],
        dietaryServices: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (hospital) {
            setFormData({
                ...hospital,
                accreditations: Array.isArray(hospital.accreditations) ? hospital.accreditations : [],
                gallery: Array.isArray(hospital.gallery) ? hospital.gallery : [],
                languagesSpoken: Array.isArray(hospital.languagesSpoken) ? hospital.languagesSpoken : ['English'],
                insuranceAccepted: Array.isArray(hospital.insuranceAccepted) ? hospital.insuranceAccepted : [],
                paymentMethods: Array.isArray(hospital.paymentMethods) ? hospital.paymentMethods : [],
                accommodationPartners: Array.isArray(hospital.accommodationPartners) ? hospital.accommodationPartners : [],
                dietaryServices: Array.isArray(hospital.dietaryServices) ? hospital.dietaryServices : []
            });
        } else {
            setFormData({
                name: '',
                specialties: '',
                imageUrl: '',
                city: '',
                state: '',
                country: 'India',
                description: '',
                accreditations: [],
                internationalPatientServices: '',
                gallery: [],
                establishedYear: new Date().getFullYear(),
                bedCount: 0,
                doctorCount: 0,
                nurseCount: 0,
                languagesSpoken: ['English'],
                contactPhone: '',
                contactEmail: '',
                website: '',
                address: '',
                priceRange: 'moderate',
                insuranceAccepted: [],
                paymentMethods: [],
                accommodationPartners: [],
                dietaryServices: []
            });
        }
    }, [hospital, isOpen]);

    const handleInputChange = (field: keyof Hospital, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayInputChange = (field: keyof Hospital, value: string) => {
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(prev => ({
            ...prev,
            [field]: array
        }));
    };

    const handleImageUpload = async (file: File) => {
        if (!file) return;

        setUploadingImage(true);
        setError(null);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const response = await fetch('/api/hospitals/upload-image', {
                method: 'POST',
                body: formDataUpload
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload image');
            }

            const result = await response.json();
            handleInputChange('imageUrl', result.imageUrl);
        } catch (err: any) {
            setError(`Image upload failed: ${err.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const url = hospital ? `/api/hospitals/${hospital.id}` : '/api/hospitals';
            const method = hospital ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save hospital');
            }

            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-dark">
                            {hospital ? 'Edit Hospital' : 'Add New Hospital'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {error && <ErrorMessage message={error} />}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hospital Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Specialties (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.specialties}
                                onChange={(e) => handleInputChange('specialties', e.target.value)}
                                placeholder="Cardiology, Oncology, Neurology"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hospital Image
                                </label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Upload Image File
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={uploadingImage}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                        {uploadingImage && (
                                            <div className="mt-2 text-sm text-blue-600">
                                                Uploading image...
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Or enter Image URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    {formData.imageUrl && (
                                        <div className="mt-2">
                                            <img
                                                src={formData.imageUrl}
                                                alt="Hospital preview"
                                                className="w-32 h-24 object-cover rounded-md border"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Capacity & Services */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Established Year
                                </label>
                                <input
                                    type="number"
                                    value={formData.establishedYear}
                                    onChange={(e) => handleInputChange('establishedYear', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bed Count
                                </label>
                                <input
                                    type="number"
                                    value={formData.bedCount}
                                    onChange={(e) => handleInputChange('bedCount', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Doctor Count
                                </label>
                                <input
                                    type="number"
                                    value={formData.doctorCount}
                                    onChange={(e) => handleInputChange('doctorCount', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nurse Count
                                </label>
                                <input
                                    type="number"
                                    value={formData.nurseCount}
                                    onChange={(e) => handleInputChange('nurseCount', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Arrays */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Languages Spoken (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.languagesSpoken.join(', ')}
                                    onChange={(e) => handleArrayInputChange('languagesSpoken', e.target.value)}
                                    placeholder="English, Hindi, Tamil"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Accreditations (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.accreditations.join(', ')}
                                    onChange={(e) => handleArrayInputChange('accreditations', e.target.value)}
                                    placeholder="JCI, NABH, ISO 9001"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                International Patient Services
                            </label>
                            <textarea
                                value={formData.internationalPatientServices}
                                onChange={(e) => handleInputChange('internationalPatientServices', e.target.value)}
                                rows={2}
                                placeholder="Dedicated coordinators, visa assistance, airport pickup..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader message="Saving..." /> : (hospital ? 'Update Hospital' : 'Create Hospital')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};