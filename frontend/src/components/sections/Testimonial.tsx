import React, { useState, useEffect, useRef } from 'react';
import { getUserTestimonials } from '../../services/api';

interface TestimonialData {
    id: number;
    patientName: string;
    patientCountry: string;
    treatmentType: string;
    hospitalName: string;
    rating: number;
    testimonialText: string;
    costSaved?: number;
    tags?: string[];
}

export const Testimonial = () => {
    const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data = await getUserTestimonials('', 10); // Get up to 10 testimonials
                setTestimonials(data);
            } catch (error) {
                console.error('Failed to fetch testimonials:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Auto-scroll animation (right to left)
    useEffect(() => {
        if (testimonials.length > 3) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = prevIndex + 1;
                    // Reset to 0 when we reach the end to create infinite scroll effect
                    return nextIndex >= testimonials.length ? 0 : nextIndex;
                });
            }, 5000); // Change every 5 seconds

            return () => clearInterval(interval);
        }
    }, [testimonials.length]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            return nextIndex >= testimonials.length ? 0 : nextIndex;
        });
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            const prevIndexCalc = prevIndex - 1;
            return prevIndexCalc < 0 ? testimonials.length - 1 : prevIndexCalc;
        });
    };

    // Get 3 testimonials to display (with wrap-around)
    const getVisibleTestimonials = () => {
        if (testimonials.length === 0) return [];

        const visible = [];
        for (let i = 0; i < 3; i++) {
            const index = (currentIndex + i) % testimonials.length;
            visible.push(testimonials[index]);
        }
        return visible;
    };

    if (isLoading || testimonials.length === 0) {
        return (
            <section id="testimonials" className="bg-primary text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-pulse">
                        <div className="h-12 w-12 bg-secondary/20 rounded-full mx-auto mb-4"></div>
                        <div className="h-8 bg-white/20 rounded mx-auto mb-4 max-w-2xl"></div>
                        <div className="h-6 bg-white/20 rounded mx-auto max-w-md"></div>
                    </div>
                </div>
            </section>
        );
    }

    const visibleTestimonials = getVisibleTestimonials();

    return (
        <section id="testimonials" className="bg-primary text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">
                        Real patients who found healing and hope through medical tourism in India
                    </p>
                </div>

                {/* Testimonial Carousel */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Navigation Arrows */}
                    {testimonials.length > 3 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute -left-16 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-4 transition-all duration-300 backdrop-blur-sm hover:scale-110"
                                aria-label="Previous testimonials"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute -right-16 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-4 transition-all duration-300 backdrop-blur-sm hover:scale-110"
                                aria-label="Next testimonials"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Carousel Container */}
                    <div className="overflow-hidden px-4">
                        <div
                            ref={carouselRef}
                            className="flex transition-transform duration-700 ease-in-out"
                            style={{
                                transform: `translateX(-${currentIndex * (100 / 3)}%)`,
                                width: `${(testimonials.length / 3) * 100}%`
                            }}
                        >
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={`${testimonial.id}-${index}`}
                                    className="w-1/3 px-4 flex-shrink-0"
                                >
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                                        {/* Quote Icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.5 2a.5.5 0 00-.5.5v1.5a1 1 0 001 1h.5a1 1 0 001-1V4a1 1 0 00-1-1h-1.5a.5.5 0 00-.5-.5zM3 4.5a.5.5 0 01.5-.5H5a2 2 0 012 2v2.5a.5.5 0 01-1 0V6a1 1 0 00-1-1H3.5a.5.5 0 01-.5-.5zm9.5-2.5a.5.5 0 00-.5.5v1.5a1 1 0 001 1h.5a1 1 0 001-1V4a1 1 0 00-1-1h-1.5a.5.5 0 00-.5-.5zM11 4.5a.5.5 0 01.5-.5H13a2 2 0 012 2v2.5a.5.5 0 01-1 0V6a1 1 0 00-1-1h-1.5a.5.5 0 01-.5-.5z" clipRule="evenodd" />
                                        </svg>

                                        {/* Testimonial Text */}
                                        <blockquote className="text-lg italic mb-6 leading-relaxed font-light text-center">
                                            "{testimonial.testimonialText.length > 150
                                                ? testimonial.testimonialText.substring(0, 150) + '...'
                                                : testimonial.testimonialText}"
                                        </blockquote>

                                        {/* Rating */}
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="flex text-yellow-300 mr-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : 'text-white/30'}`}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-white/80 text-sm">{testimonial.rating}/5</span>
                                        </div>

                                        {/* Patient Info */}
                                        <div className="text-center">
                                            <cite className="font-bold text-base not-italic tracking-wide mb-2 block">
                                                {testimonial.patientName}
                                            </cite>
                                            <div className="text-white/70 text-sm mb-2">
                                                {testimonial.patientCountry}
                                            </div>
                                            <div className="text-white/60 text-xs">
                                                {testimonial.treatmentType} at {testimonial.hospitalName}
                                            </div>
                                            {testimonial.costSaved && (
                                                <div className="text-green-300 font-medium text-sm mt-2">
                                                    Saved ${testimonial.costSaved.toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carousel Indicators */}
                    {testimonials.length > 3 && (
                        <div className="flex justify-center space-x-2 mt-8">
                            {Array.from({ length: Math.ceil(testimonials.length / 3) }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i * 3)}
                                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                        Math.floor(currentIndex / 3) === i ? 'bg-secondary' : 'bg-white/30 hover:bg-white/50'
                                    }`}
                                    aria-label={`Go to testimonial group ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* See More Link */}
                    <div className="text-center mt-12">
                        <a
                            href="#/success-stories"
                            className="inline-flex items-center px-8 py-3 bg-secondary text-white font-semibold rounded-full hover:bg-secondary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <span>See More Success Stories</span>
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
