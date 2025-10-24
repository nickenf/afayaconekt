import React from 'react';
import { Hospital } from '../../types/index.ts';
import { HospitalCard } from '../HospitalCard.tsx';
import { Loader } from '../common/Loader.tsx';
import { ErrorMessage } from '../common/ErrorMessage.tsx';

interface FeaturedHospitalsProps {
    hospitals: Hospital[];
    isLoading: boolean;
    error: string | null;
    hasSearched: boolean;
}

const NoResultsMessage = ({ message, subtext }: { message: string, subtext: string }) => (
    <div className="text-center text-gray-600 py-16 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <p className="text-xl font-semibold text-dark">{message}</p>
        <p className="mt-2">{subtext}</p>
    </div>
);

export const FeaturedHospitals = ({ hospitals, isLoading, error, hasSearched }: FeaturedHospitalsProps) => {
    const renderContent = () => {
        if (isLoading) {
            return <Loader message="Finding the best hospitals..." />;
        }
        if (error) {
            return <ErrorMessage message={error} />;
        }
        if (hospitals.length === 0) {
            if (hasSearched) {
                return <NoResultsMessage message="No Hospitals Found" subtext="Your search did not match any hospitals. Try a different search term." />;
            }
            return <NoResultsMessage message="No Hospitals Available" subtext="There are currently no hospitals listed on the platform." />;
        }
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hospitals.map(hospital => (
                    <HospitalCard
                        key={hospital.id}
                        id={hospital.id}
                        name={hospital.name}
                        specialties={hospital.specialties}
                        imageUrl={hospital.imageUrl}
                        city={hospital.city}
                        description={hospital.description}
                        averageRating={hospital.averageRating}
                        ratingCount={hospital.ratingCount}
                    />
                ))}
            </div>
        );
    };

    return (
      <section className="py-20 bg-light" id="hospitals">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-dark">Find the Right Hospital for You</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Search our curated network of India's top accredited hospitals to find the perfect match for your medical needs.
            </p>
          </div>
           {renderContent()}
        </div>
      </section>
    );
};