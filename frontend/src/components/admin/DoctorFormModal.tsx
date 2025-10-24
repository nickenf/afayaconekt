import { useState, useEffect } from 'react';
import { Loader } from '../common/Loader.tsx';
import { ErrorMessage } from '../common/ErrorMessage.tsx';

interface Doctor {
    id?: number;
    hospitalId: number;
    firstName: string;
    lastName: string;
    title: string;
    specialtyId: number;
    subSpecialties: string[];
    qualifications: string;
    experience: number;
    imageUrl: string;
    biography: string;
    languagesSpoken: string[];
    consultationFee: number;
    availabilitySchedule: string;
    isAvailable: boolean;
    telemedicineAvailable: boolean;
    contactEmail: string;
    licenseNumber: string;
    awards: string[];
    publications: string;
}

interface Hospital {
    id: number;
    name: string;
    city: string;
    state: string;
}

interface Specialty {
    id: number;
    name: string;
}

interface DoctorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    doctor?: Doctor | null;
}

export const DoctorFormModal = ({ isOpen, onClose, onSave, doctor }: DoctorFormModalProps) => {
    const [formData, setFormData] = useState<Doctor>({
        hospitalId: 0,
        firstName: '',
        lastName: '',
        title: 'Dr.',
        specialtyId: 0,
        subSpecialties: [],
        qualifications: '',
        experience: 0,
        imageUrl: '',
        biography: '',
        languagesSpoken: ['English'],
        consultationFee: 0,
        availabilitySchedule: '',
        isAvailable: true,
        telemedicineAvailable: false,
        contactEmail: '',
        licenseNumber: '',
        awards: [],
        publications: ''
    });

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadHospitalsAndSpecialties();
        }
    }, [isOpen]);

    useEffect(() => {
        if (doctor) {
            setFormData({
                ...doctor,
                subSpecialties: Array.isArray(doctor.subSpecialties) ? doctor.subSpecialties : [],
                languagesSpoken: Array.isArray(doctor.languagesSpoken) ? doctor.languagesSpoken : ['English'],
                awards: Array.isArray(doctor.awards) ? doctor.awards : []
            });
        } else {
            setFormData({
                hospitalId: 0,
                firstName: '',
                lastName: '',
                title: 'Dr.',
                specialtyId: 0,
                subSpecialties: [],
                qualifications: '',
                experience: 0,
                imageUrl: '',
                biography: '',
                languagesSpoken: ['English'],
                consultationFee: 0,
                availabilitySchedule: '',
                isAvailable: true,
                telemedicineAvailable: false,
                contactEmail: '',
                licenseNumber: '',
                awards: [],
                publications: ''
            });
        }
    }, [doctor, isOpen]);

    const loadHospitalsAndSpecialties = async () => {
        try {
            const [hospitalsRes, specialtiesRes] = await Promise.all([
                fetch('/api/hospitals'),
                fetch('/api/specialties')
            ]);

            if (hospitalsRes.ok) {
                const hospitalsData = await hospitalsRes.json();
                setHospitals(hospitalsData);
            }

            if (specialtiesRes.ok) {
                const specialtiesData = await specialtiesRes.json();
                setSpecialties(specialtiesData);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleInputChange = (field: keyof Doctor, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayInputChange = (field: keyof Doctor, value: string) => {
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
            const url = doctor ? `/api/doctors/${doctor.id}` : '/api/doctors';
            const method = doctor ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save doctor');
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
                            {doctor ? 'Edit Doctor' : 'Add New Doctor'}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <select
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Dr.">Dr.</option>
                                    <option value="Prof. Dr.">Prof. Dr.</option>
                                    <option value="Dr. (HOD)">Dr. (HOD)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hospital *
                                </label>
                                <select
                                    value={formData.hospitalId}
                                    onChange={(e) => handleInputChange('hospitalId', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                >
                                    <option value={0}>Select Hospital</option>
                                    {hospitals.map(hospital => (
                                        <option key={hospital.id} value={hospital.id}>
                                            {hospital.name} - {hospital.city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specialty *
                                </label>
                                <select
                                    value={formData.specialtyId}
                                    onChange={(e) => handleInputChange('specialtyId', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                >
                                    <option value={0}>Select Specialty</option>
                                    {specialties.map(specialty => (
                                        <option key={specialty.id} value={specialty.id}>
                                            {specialty.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Qualifications
                            </label>
                            <input
                                type="text"
                                value={formData.qualifications}
                                onChange={(e) => handleInputChange('qualifications', e.target.value)}
                                placeholder="MBBS, MD, DM (Cardiology)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    value={formData.experience}
                                    onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Consultation Fee ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.consultationFee}
                                    onChange={(e) => handleInputChange('consultationFee', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Biography
                            </label>
                            <textarea
                                value={formData.biography}
                                onChange={(e) => handleInputChange('biography', e.target.value)}
                                rows={3}
                                placeholder="Brief professional biography..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

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
                                    Sub-specialties (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.subSpecialties.join(', ')}
                                    onChange={(e) => handleArrayInputChange('subSpecialties', e.target.value)}
                                    placeholder="Interventional Cardiology, Heart Transplant"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Awards & Recognitions (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.awards.join(', ')}
                                onChange={(e) => handleArrayInputChange('awards', e.target.value)}
                                placeholder="Best Doctor Award 2023, Excellence in Cardiology"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Publications
                            </label>
                            <textarea
                                value={formData.publications}
                                onChange={(e) => handleInputChange('publications', e.target.value)}
                                rows={2}
                                placeholder="Notable publications and research..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Doctor Image
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
                                                alt="Doctor preview"
                                                className="w-24 h-24 object-cover rounded-full border"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Availability
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAvailable}
                                            onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                                            className="mr-2"
                                        />
                                        Currently Available
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.telemedicineAvailable}
                                            onChange={(e) => handleInputChange('telemedicineAvailable', e.target.checked)}
                                            className="mr-2"
                                        />
                                        Telemedicine Available
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Availability Schedule
                                </label>
                                <textarea
                                    value={formData.availabilitySchedule}
                                    onChange={(e) => handleInputChange('availabilitySchedule', e.target.value)}
                                    rows={3}
                                    placeholder="Mon-Fri: 9AM-5PM&#10;Sat: 9AM-1PM"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                />
                            </div>
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
                                {isLoading ? <Loader message="Saving..." /> : (doctor ? 'Update Doctor' : 'Create Doctor')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};