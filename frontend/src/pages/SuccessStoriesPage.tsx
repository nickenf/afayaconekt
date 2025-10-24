import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PatientTestimonials } from '../components/testimonials/PatientTestimonials';
import { ShareTestimonialModal } from '../components/testimonials/ShareTestimonialModal';
import { fetchStatistics } from '../services/api';

interface Statistics {
    successfulTreatments: number;
    partnerHospitals: number;
    registeredPatients: number;
    successRate: number;
    expertDoctors: number;
    patientCoordinators: number;
    supportAvailable: string;
    totalSavings: number;
}

export const SuccessStoriesPage: React.FC = () => {
    const { user } = useAuth();
    const [showShareModal, setShowShareModal] = useState(false);
    const [statistics, setStatistics] = useState<Statistics>({
        successfulTreatments: 2500,
        partnerHospitals: 150,
        registeredPatients: 2500,
        successRate: 98.5,
        expertDoctors: 500,
        patientCoordinators: 50,
        supportAvailable: '24/7',
        totalSavings: 2800000
    });

    useEffect(() => {
        const loadStatistics = async () => {
            try {
                const stats = await fetchStatistics();
                setStatistics(stats);
            } catch (error) {
                console.error('Failed to load statistics:', error);
            }
        };

        loadStatistics();
    }, []);

    const handleShareStory = () => {
        if (!user) {
            alert('Please log in to share your success story.');
            window.location.hash = '#/'; // Redirect to home for login
            return;
        }
        setShowShareModal(true);
    };

    const handleShareSuccess = () => {
        // Refresh the page or update testimonials list
        window.location.reload();
    };

    const handleStartJourney = () => {
        // Redirect to home page where users can start searching for hospitals
        window.location.hash = '#/';
        // Scroll to the search section
        setTimeout(() => {
            const searchSection = document.getElementById('hero');
            if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Success Stories
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6">
                        Real Patients,
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            Real Results
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Discover how patients from across Africa have transformed their lives through
                        world-class medical treatment in India. These are their authentic stories of hope, healing, and renewed vitality.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg p-6 shadow-lg">
                            <div className="text-3xl font-bold text-primary mb-2">{statistics.successfulTreatments.toLocaleString()}+</div>
                            <div className="text-gray-600">Successful Treatments</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-lg">
                            <div className="text-3xl font-bold text-secondary mb-2">{statistics.successRate}%</div>
                            <div className="text-gray-600">Success Rate</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-lg">
                            <div className="text-3xl font-bold text-green-600 mb-2">${((statistics.totalSavings || 0) / 1000000).toFixed(1)}M</div>
                            <div className="text-gray-600">Total Savings</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-lg">
                            <div className="text-3xl font-bold text-orange-600 mb-2">{statistics.expertDoctors}+</div>
                            <div className="text-gray-600">Expert Doctors</div>
                        </div>
                    </div>
                </div>

                {/* Testimonials Component */}
                <PatientTestimonials />

                {/* Call to Action */}
                <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of patients who have found healing and hope through AfyaConnect
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleStartJourney}
                            className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Start Your Journey
                        </button>
                        <button
                            onClick={handleShareStory}
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                        >
                            Share Your Story
                        </button>
                    </div>
                </div>
            </div>

            {/* Share Testimonial Modal */}
            <ShareTestimonialModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                onSuccess={handleShareSuccess}
            />
        </div>
    );
};