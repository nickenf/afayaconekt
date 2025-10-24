import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { submitTestimonial } from '../../services/api';

interface ShareTestimonialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const ShareTestimonialModal: React.FC<ShareTestimonialModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        patientName: user?.firstName + ' ' + user?.lastName || '',
        patientCountry: '',
        patientAge: '',
        treatmentType: '',
        hospitalName: '',
        doctorName: '',
        rating: 5,
        testimonialText: '',
        treatmentDate: '',
        treatmentDuration: '',
        costSaved: '',
        tags: [] as string[],
        beforeImage: null as File | null,
        afterImage: null as File | null,
        useProfileImage: true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const treatmentTypes = [
        'Heart Surgery', 'Orthopedics', 'Fertility', 'Eye Surgery',
        'Cancer Treatment', 'Neurology', 'Gastroenterology', 'Dermatology',
        'Plastic Surgery', 'Transplant Surgery', 'Pediatrics', 'Gynecology'
    ];

    const countries = [
        'Kenya', 'Nigeria', 'South Africa', 'Tanzania', 'Uganda', 'Ghana',
        'Ethiopia', 'Rwanda', 'Zimbabwe', 'Botswana', 'Namibia', 'Zambia',
        'Mozambique', 'Malawi', 'Angola', 'Cameroon', 'Ivory Coast', 'Senegal'
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleTagToggle = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
        if (!formData.patientCountry) newErrors.patientCountry = 'Country is required';
        if (!formData.treatmentType) newErrors.treatmentType = 'Treatment type is required';
        if (!formData.hospitalName.trim()) newErrors.hospitalName = 'Hospital name is required';
        if (!formData.doctorName.trim()) newErrors.doctorName = 'Doctor name is required';
        if (!formData.testimonialText.trim()) newErrors.testimonialText = 'Testimonial text is required';
        if (formData.rating < 1 || formData.rating > 5) newErrors.rating = 'Rating must be between 1 and 5';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const result = await submitTestimonial({
                ...formData,
                patientAge: formData.patientAge ? parseInt(formData.patientAge) : undefined,
                costSaved: formData.costSaved ? parseFloat(formData.costSaved) : undefined
            });
            console.log('Testimonial submitted successfully:', result);
            alert('Thank you for sharing your success story! Your testimonial has been submitted and will be reviewed before publication.');

            // Show success message
            alert('Thank you for sharing your success story! Your testimonial has been submitted and will be reviewed before publication.');

            // Reset form
            setFormData({
                patientName: user?.firstName + ' ' + user?.lastName || '',
                patientCountry: '',
                patientAge: '',
                treatmentType: '',
                hospitalName: '',
                doctorName: '',
                rating: 5,
                testimonialText: '',
                treatmentDate: '',
                treatmentDuration: '',
                costSaved: '',
                tags: [],
                beforeImage: null,
                afterImage: null,
                useProfileImage: true
            });

            onClose();
            onSuccess?.();

        } catch (error: any) {
            console.error('Error submitting testimonial:', error);

            // Show specific error message from backend if available
            const errorMessage = error?.message || 'Failed to submit testimonial. Please try again.';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Share Your Success Story</h2>
                            <p className="text-primary-light text-sm">Help inspire others with your journey</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Patient Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.patientName}
                                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.patientName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Your full name"
                                />
                                {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Country *
                                </label>
                                <select
                                    value={formData.patientCountry}
                                    onChange={(e) => handleInputChange('patientCountry', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.patientCountry ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Select your country</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                                {errors.patientCountry && <p className="text-red-500 text-xs mt-1">{errors.patientCountry}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Age (optional)
                                </label>
                                <input
                                    type="number"
                                    value={formData.patientAge}
                                    onChange={(e) => handleInputChange('patientAge', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Your age"
                                    min="1"
                                    max="120"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Rating *
                                </label>
                                <select
                                    value={formData.rating}
                                    onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.rating ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    {[5, 4, 3, 2, 1].map(rating => (
                                        <option key={rating} value={rating}>
                                            {rating} ⭐ {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
                                        </option>
                                    ))}
                                </select>
                                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                            </div>
                        </div>

                        {/* Treatment Information */}
                        <div>
                            <label className="block text-sm font-medium text-dark mb-2">
                                Treatment Type *
                            </label>
                            <select
                                value={formData.treatmentType}
                                onChange={(e) => handleInputChange('treatmentType', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.treatmentType ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select treatment type</option>
                                {treatmentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {errors.treatmentType && <p className="text-red-500 text-xs mt-1">{errors.treatmentType}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Hospital Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.hospitalName}
                                    onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.hospitalName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Hospital where you were treated"
                                />
                                {errors.hospitalName && <p className="text-red-500 text-xs mt-1">{errors.hospitalName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Doctor Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.doctorName}
                                    onChange={(e) => handleInputChange('doctorName', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.doctorName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Your doctor's name"
                                />
                                {errors.doctorName && <p className="text-red-500 text-xs mt-1">{errors.doctorName}</p>}
                            </div>
                        </div>

                        {/* Optional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Treatment Date (optional)
                                </label>
                                <input
                                    type="date"
                                    value={formData.treatmentDate}
                                    onChange={(e) => handleInputChange('treatmentDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Duration (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.treatmentDuration}
                                    onChange={(e) => handleInputChange('treatmentDuration', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., 2 weeks"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Cost Saved (optional)
                                </label>
                                <input
                                    type="number"
                                    value={formData.costSaved}
                                    onChange={(e) => handleInputChange('costSaved', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Amount saved in USD"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Testimonial Text */}
                        <div>
                            <label className="block text-sm font-medium text-dark mb-2">
                                Your Success Story *
                            </label>
                            <textarea
                                value={formData.testimonialText}
                                onChange={(e) => handleInputChange('testimonialText', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-32 resize-none ${errors.testimonialText ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Share your experience, how it changed your life, and why you recommend AfyaConnect..."
                            />
                            {errors.testimonialText && <p className="text-red-500 text-xs mt-1">{errors.testimonialText}</p>}
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <label className="block text-sm font-medium text-dark mb-4">
                                Treatment Images (Optional)
                            </label>

                            {/* Profile Image Option */}
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.useProfileImage}
                                        onChange={(e) => handleInputChange('useProfileImage', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Use my profile image as the "before" image</span>
                                </label>
                                {formData.useProfileImage && user && (
                                    <div className="mt-2 flex items-center">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=0D47A1&color=fff`}
                                            alt="Profile"
                                            className="w-16 h-16 rounded-full object-cover mr-3"
                                        />
                                        <span className="text-sm text-gray-600">This will be used as your "before treatment" image</span>
                                    </div>
                                )}
                            </div>

                            {/* Image Upload Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark mb-2">
                                        Before Treatment Image
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleInputChange('beforeImage', e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="beforeImage"
                                            disabled={formData.useProfileImage}
                                        />
                                        <label htmlFor="beforeImage" className={`cursor-pointer ${formData.useProfileImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {formData.beforeImage ? (
                                                <div>
                                                    <img
                                                        src={URL.createObjectURL(formData.beforeImage)}
                                                        alt="Before treatment"
                                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                                    />
                                                    <p className="text-sm text-gray-600">Click to change image</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    <p className="text-sm text-gray-600">Click to upload "before" image</p>
                                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark mb-2">
                                        After Treatment Image
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleInputChange('afterImage', e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="afterImage"
                                        />
                                        <label htmlFor="afterImage" className="cursor-pointer">
                                            {formData.afterImage ? (
                                                <div>
                                                    <img
                                                        src={URL.createObjectURL(formData.afterImage)}
                                                        alt="After treatment"
                                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                                    />
                                                    <p className="text-sm text-gray-600">Click to change image</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    <p className="text-sm text-gray-600">Click to upload "after" image</p>
                                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Images help other patients visualize your transformation. "Before" images show your condition before treatment, "after" images show the results.
                            </p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-dark mb-2">
                                Tags (optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['Life-Saving', 'Pain Relief', 'Quality Care', 'Affordable', 'Excellent Doctors', 'Great Support', 'Highly Recommend'].map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleTagToggle(tag)}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                            formData.tags.includes(tag)
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    'Share My Story'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};