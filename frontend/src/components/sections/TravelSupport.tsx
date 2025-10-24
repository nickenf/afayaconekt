import React, { useState, useEffect } from 'react';
import { TravelInfo } from '../../types/index.ts';
import { Loader } from '../common/Loader.tsx';
import { ErrorMessage } from '../common/ErrorMessage.tsx';
import { fetchTravelInfo } from '../../services/api.ts';

const InfoCard = ({ title, content, icon, href }: { title: string, content: string, icon: React.ReactNode, href?: string }) => (
    <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-secondary hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mr-4">{icon}</div>
            {href ? (
                <a href={href} className="text-primary text-2xl font-bold hover:text-secondary transition-colors duration-300 cursor-pointer">
                    {title}
                </a>
            ) : (
                <h3 className="text-primary text-2xl font-bold">{title}</h3>
            )}
        </div>
        <p className="text-gray-600">{content}</p>
        {href && (
            <div className="mt-4">
                <a
                    href={href}
                    className="inline-flex items-center text-secondary font-medium hover:text-secondary/80 transition-colors duration-300"
                >
                    <span>Learn More</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        )}
    </div>
);

export const TravelSupport = () => {
    const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getTravelInfo = async () => {
            try {
                const data = await fetchTravelInfo();
                setTravelInfo(data);
            } catch (err: any) {
                setError("Could not load travel support information. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        getTravelInfo();
    }, []);

    const renderContent = () => {
        if (isLoading) return <Loader message="Loading travel advice..." />;
        if (error || !travelInfo) return <ErrorMessage message={error || "Travel information is currently unavailable."} />;
        
        return (
             <div className="grid md:grid-cols-3 gap-8">
                 <InfoCard
                     title="Visa Assistance"
                     content={travelInfo.visa}
                     href="#/travel#visa"
                     icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>}
                 />
                 <InfoCard
                     title="Accommodation"
                     content={travelInfo.accommodation}
                     href="#/travel"
                     icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                 />
                 <InfoCard
                     title="Local Support"
                     content={travelInfo.localSupport}
                     href="#footer"
                     icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                 />
             </div>
         );
    };

    return (
        <section className="py-20 bg-light" id="travel-support">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-dark">We're With You, Every Step of the Way</h2>
                    <p className="mt-4 text-lg text-gray-600">Our support extends beyond medical treatment to ensure your journey is seamless.</p>
                </div>
                {renderContent()}
            </div>
        </section>
    );
};