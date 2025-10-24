
import React, { useState, useEffect } from 'react';
import { HospitalDetails } from '../types/index.ts';
import { Loader } from '../components/common/Loader.tsx';
import { ErrorMessage } from '../components/common/ErrorMessage.tsx';
import { StarRating } from '../components/common/StarRating.tsx';
import { ImageGallery } from '../components/ImageGallery.tsx';
import { VideoPlayer } from '../components/VideoPlayer.tsx';
import { fetchHospitalDetails, submitInquiry, submitRating } from '../services/api.ts';

interface HospitalDetailPageProps {
    hospitalName: string;
}

interface NewRatingData {
    newAverageRating: number;
    newRatingCount: number;
}

const RatingForm = ({ hospitalId, hospitalName, onRatingSubmitted }: { hospitalId: number, hospitalName: string, onRatingSubmitted: (data: NewRatingData) => void }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    const handleSubmitRating = async () => {
        if (rating === 0) {
            setError("Please select a rating before submitting.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const newRatingData = await submitRating(hospitalId, rating);
            onRatingSubmitted(newRatingData);
        } catch (err: any) {
            setError("Sorry, we couldn't submit your rating. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-10 p-6 bg-gray-50 rounded-lg border">
            <h4 className="text-xl font-semibold text-center text-dark mb-4">Rate your experience with {hospitalName}</h4>
            <div className="flex justify-center items-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-yellow-400 transition-transform duration-200 hover:scale-125 focus:outline-none"
                        aria-label={`Rate ${star} stars`}
                    >
                        <svg className="w-8 h-8" fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.522 4.675a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.88a1 1 0 00-.364 1.118l1.522 4.675c.3.921-.755 1.688-1.539 1.118l-3.97-2.88a1 1 0 00-1.175 0l-3.97 2.88c-.784.57-1.838-.197-1.539-1.118l1.522-4.675a1 1 0 00-.364-1.118L2.48 9.102c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69L11.049 2.927z" />
                        </svg>
                    </button>
                ))}
            </div>
            <p className="text-center text-gray-600 font-medium h-6 mb-2 transition-opacity duration-200" aria-live="polite">
                {ratingLabels[hoverRating || rating] || 'Select your rating'}
            </p>
            {error && <p className="text-red-600 text-center text-sm mb-2">{error}</p>}
            <button
                onClick={handleSubmitRating}
                disabled={isSubmitting || rating === 0}
                className="w-full mt-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                    </>
                ) : 'Submit Rating'}
            </button>
        </div>
    );
}


export const HospitalDetailPage = ({ hospitalName }: HospitalDetailPageProps) => {
    const [details, setDetails] = useState<HospitalDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'details' | 'form' | 'confirmation'>('details');
    const [ratingSubmitted, setRatingSubmitted] = useState(false);
    
    // Form state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    useEffect(() => {
        window.scrollTo(0, 0);
        const getDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchHospitalDetails(hospitalName);
                setDetails(data);
            } catch (err: any) {
                console.error("Failed to fetch hospital details:", err);
                setError(err.message || "Sorry, we couldn't fetch the details for this hospital.");
            } finally {
                setIsLoading(false);
            }
        };
        getDetails();
    }, [hospitalName]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            await submitInquiry({
                hospitalName: details?.name || 'Unknown Hospital',
                patientName: formData.name,
                patientEmail: formData.email,
                message: formData.message,
            });
            setView('confirmation');
        } catch (err: any) {
            setFormError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleRatingSubmitted = (data: NewRatingData) => {
        setRatingSubmitted(true);
        setDetails(prevDetails => {
            if (!prevDetails) return null;
            return {
                ...prevDetails,
                averageRating: data.newAverageRating,
                ratingCount: data.newRatingCount,
            };
        });
    };

    const renderContent = () => {
        if (isLoading) return <Loader message="Loading hospital details..." />;
        if (error || !details) return <ErrorMessage message={error || "Could not load hospital details."} />;

        switch (view) {
            case 'form':
                return (
                    <>
                        <h2 className="text-4xl font-bold text-primary mb-4">Request a Quote from {details.name}</h2>
                        <p className="bg-blue-50 border-l-4 border-primary p-4 my-6 italic text-dark">
                            You're taking a positive step towards your health by reaching out to {details.name}.
                        </p>
                        <form className="bg-gray-50 p-8 rounded-lg mt-8" onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="name" className="block font-semibold mb-2">Full Name</label>
                                    <input type="text" id="name" value={formData.name} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block font-semibold mb-2">Email Address</label>
                                    <input type="email" id="email" value={formData.email} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="message" className="block font-semibold mb-2">Your Message</label>
                                <textarea id="message" rows={5} value={formData.message} onChange={handleInputChange} required placeholder="Briefly describe your medical needs..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                            </div>
                            {formError && <p className="text-red-600 text-center mb-4">{formError}</p>}
                            <div className="flex flex-col items-center gap-4 mt-8">
                                <button type="submit" className="w-full bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition text-lg disabled:bg-gray-400" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Inquiry'}</button>
                                <a href="#" className="text-primary font-semibold hover:underline" onClick={(e) => { e.preventDefault(); setView('details'); }}>&larr; Back to Details</a>
                            </div>
                        </form>
                    </>
                );
            case 'confirmation':
                return (
                    <div className="text-center py-8">
                        <h3 className="text-3xl font-bold text-secondary mb-4">Thank You!</h3>
                        <p className="text-lg mb-2">Your quote request has been sent to {details.name}.</p>
                        <p className="text-lg">They will contact you via email with a personalized treatment plan shortly.</p>

                        {ratingSubmitted ? (
                             <div className="mt-10 p-4 bg-green-100 text-green-800 rounded-lg font-semibold flex items-center justify-center gap-2" role="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Thank you for your feedback!</span>
                            </div>
                        ) : (
                            <RatingForm 
                                hospitalId={details.id}
                                hospitalName={details.name}
                                onRatingSubmitted={handleRatingSubmitted}
                            />
                        )}

                        <a href="#/" className="mt-8 inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition">Back to Home</a>
                    </div>
                );
            case 'details':
            default:
                return (
                    <>
                        <h2 className="text-5xl font-bold text-primary mb-2">{details.name}</h2>
                        <div className="flex items-center gap-4 mb-8">
                            <p className="text-xl font-semibold text-gray-600">{details.city}, India</p>
                            <div className="border-l-2 pl-4">
                                <StarRating rating={details.averageRating} ratingCount={details.ratingCount} size="lg" />
                            </div>
                        </div>

                        <ImageGallery images={details.gallery} altPrefix={details.name} />
                        
                        <div className="prose max-w-none">
                             {details.videoUrl && (
                                <>
                                    <h3 className="text-3xl font-bold text-primary mt-10 mb-4 pb-2 border-b-2 border-secondary">Virtual Tour</h3>
                                    <VideoPlayer src={details.videoUrl} poster={details.imageUrl} />
                                </>
                            )}
                            <h3 className="text-3xl font-bold text-primary mt-10 mb-4 pb-2 border-b-2 border-secondary">Overview</h3>
                            <p>{details.description}</p>
                            <h3 className="text-3xl font-bold text-primary mt-10 mb-4 pb-2 border-b-2 border-secondary">Accreditations</h3>
                            <ul className="list-disc pl-5 space-y-1">{details.accreditations.map((acc, index) => <li key={index}>{acc}</li>)}</ul>
                            <h3 className="text-3xl font-bold text-primary mt-10 mb-4 pb-2 border-b-2 border-secondary">International Patient Services</h3>
                            <p>{details.internationalPatientServices}</p>
                        </div>
                        <button className="w-full mt-12 bg-primary text-white font-bold py-4 text-xl rounded-lg hover:bg-blue-700 transition transform hover:scale-105" onClick={() => setView('form')}>Get a Free Quote & Treatment Plan</button>
                    </>
                );
        }
    };

    return (
        <section className="bg-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderContent()}
            </div>
        </section>
    );
};
