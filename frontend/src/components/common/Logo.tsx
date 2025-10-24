import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
    <svg 
        className={className}
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AfyaConnect Logo"
        role="img"
    >
        {/* A stylized 'A' suggesting a bridge, using the primary brand color */}
        <path d="M8 38L24 10L40 38" stroke="#0D47A1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* A medical cross symbol as the crossbar, using the secondary brand color */}
        <path d="M18 24H30" stroke="#00ACC1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 18V30" stroke="#00ACC1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);