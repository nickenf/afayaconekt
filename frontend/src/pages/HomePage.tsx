import React, { useEffect, useRef } from 'react';
import { Hospital } from '../types/index.ts';
import { Hero } from '../components/sections/Hero.tsx';
import { HowItWorks } from '../components/sections/HowItWorks.tsx';
import { FeaturedHospitals } from '../components/sections/FeaturedHospitals.tsx';
import { Testimonial } from '../components/sections/Testimonial.tsx';
import { TravelSupport } from '../components/sections/TravelSupport.tsx';

interface HomePageProps {
    hospitals: Hospital[];
    isLoading: boolean;
    error: string | null;
    onSearch: (query: string) => void;
    hasSearched: boolean;
}

export const HomePage = ({ hospitals, isLoading, error, onSearch, hasSearched }: HomePageProps) => {
    const resultsRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to results when search is performed (trigger on hospitals change when hasSearched is true)
    useEffect(() => {
        if (hasSearched && resultsRef.current) {
            setTimeout(() => {
                const yOffset = -100; // Offset to show some content above the results
                const y = resultsRef.current!.getBoundingClientRect().top + window.pageYOffset + yOffset;

                window.scrollTo({
                    top: y,
                    behavior: 'smooth'
                });
            }, 500); // Delay to ensure results are rendered
        }
    }, [hospitals, hasSearched]); // Trigger when hospitals array changes and hasSearched is true

    return (
        <>
            <Hero onSearch={onSearch} isLoading={isLoading} />
            <QuickAccessSection />
            <HowItWorks />
            <div ref={resultsRef}>
                <FeaturedHospitals
                    hospitals={hospitals}
                    isLoading={isLoading}
                    error={error}
                    hasSearched={hasSearched}
                />
            </div>
            <Testimonial />
            <TravelSupport />
        </>
    );
};

// Quick Access Section Component
const QuickAccessSection = () => {
    const quickActions = [
        {
            title: 'Find Treatment in India',
            description: 'Search hospitals by your medical condition',
            icon: '🏥',
            color: 'from-blue-500 to-cyan-500',
            href: '#/search',
            features: ['World-Class Hospitals', 'Expert Doctors', 'Save 60-80%']
        },
        {
            title: 'See Success Stories',
            description: 'Real patients who found healing in India',
            icon: '💬',
            color: 'from-green-500 to-emerald-500',
            href: '#/success-stories',
            features: ['Real Patient Stories', 'Verified Results', 'Life-Changing Outcomes']
        },
        {
            title: 'Virtual Hospital Tours',
            description: 'Explore world-class facilities online',
            icon: '🌐',
            color: 'from-orange-500 to-red-500',
            href: '#/experience',
            features: ['360° Virtual Tours', 'See Facilities', 'Build Confidence']
        },
        {
            title: 'Book Accommodation',
            description: 'Find hotels and lodging near hospitals',
            icon: '🏨',
            color: 'from-teal-500 to-cyan-500',
            href: '#/travel',
            features: ['Hospital-Adjacent Hotels', 'Medical Tourism Packages', 'Convenient Locations']
        },
        {
            title: 'Patient Dashboard',
            description: 'Manage appointments, treatment plans & records',
            icon: '📋',
            color: 'from-indigo-500 to-purple-500',
            href: '#/dashboard',
            features: ['Treatment Plans', 'Medical Records', 'Appointment Scheduling']
        },
        {
            title: 'Get Free Consultation',
            description: 'Speak with our medical tourism experts',
            icon: '📞',
            color: 'from-purple-500 to-pink-500',
            href: '#footer',
            features: ['Free Consultation', 'Expert Guidance', 'Personalized Plan']
        }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-dark mb-4">Quick Access to All Features</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Everything you need for your medical tourism journey, just one click away
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {quickActions.map((action, index) => (
                        <a
                            key={index}
                            href={action.href}
                            className="group block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                        >
                            <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                            <div className="p-8">
                                <div className="flex items-center mb-4">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center text-3xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                                        {action.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
                                            {action.title}
                                        </h3>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {action.description}
                                </p>

                                <div className="space-y-2">
                                    {action.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center text-sm text-gray-500">
                                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-center text-primary font-medium group-hover:text-secondary transition-colors">
                                    <span>Get Started</span>
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

            </div>
        </section>
    );
};
