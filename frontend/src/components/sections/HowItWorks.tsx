import React from 'react';

const Step = ({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) => (
    <div className="text-center p-6">
        <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex justify-center items-center text-3xl font-bold mx-auto mb-6 border-4 border-secondary/20">
            {icon}
        </div>
        <h3 className="text-2xl font-semibold mb-2 text-dark">{number}. {title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export const HowItWorks = () => (
  <section className="py-20 bg-white" id="how-it-works">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-dark">Your Journey to Health in 3 Simple Steps</h2>
        <p className="mt-4 text-lg text-gray-600">We simplify your medical travel experience from start to finish.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <Step 
            number="1"
            title="Search & Discover"
            description="Browse our curated list of accredited hospitals by specialty or treatment."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
        <Step 
            number="2"
            title="Connect & Consult"
            description="Securely share medical records and get a personalized treatment plan and quote."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        />
        <Step 
            number="3"
            title="Travel & Treatment"
            description="Receive full assistance with visas, accommodation, and local support for a stress-free journey."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
        />
      </div>
    </div>
  </section>
);
