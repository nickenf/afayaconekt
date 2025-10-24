import React from 'react';
import { Hospital } from '../types/index.ts';
import { StarRating } from './common/StarRating.tsx';

export const HospitalCard = ({ name, specialties, imageUrl, city, description, averageRating, ratingCount }: Hospital) => (
  <div className="group bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col border border-gray-200">
    <div className="h-48 overflow-hidden">
        <img 
            src={imageUrl} 
            alt={`Exterior of ${name}`} 
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" 
        />
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <p className="text-sm font-semibold text-primary mb-1">{city}</p>
      <h3 className="text-xl font-bold mb-2 text-dark">{name}</h3>
      <div className="relative mb-4 group/tooltip flex" aria-label={`Rating: ${averageRating.toFixed(1)} out of 5 stars from ${ratingCount} reviews.`}>
        <StarRating rating={averageRating} ratingCount={ratingCount} size="sm" />
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-dark text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none" role="tooltip">
          {`Average: ${averageRating.toFixed(1)} / 5 (${ratingCount} reviews)`}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-dark"></div>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
      <p className="text-xs text-gray-500 mb-4"><strong className="font-semibold text-gray-700">Top Specialties:</strong> {specialties}</p>
      <a href={`#/hospital/${encodeURIComponent(name)}`} className="mt-auto block text-center bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors duration-300">
        View Details
      </a>
    </div>
  </div>
);