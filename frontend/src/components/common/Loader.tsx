import React from 'react';

export const Loader = ({ message }: { message: string }) => (
    <div className="text-center py-16 text-primary" aria-live="polite">
        <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-primary border-l-primary border-b-primary/50 rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-semibold">{message}</p>
    </div>
);
