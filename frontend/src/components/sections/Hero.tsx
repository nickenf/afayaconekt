import React, { useState } from 'react';

interface HeroProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}


export const Hero = ({ onSearch, isLoading }: HeroProps) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const handleInputChange = (value: string) => {
        setQuery(value);
        // Auto-refresh when input is cleared
        if (value === '') {
            setTimeout(() => onSearch(''), 300);
        }
    };

    return (
        <section className="relative bg-gradient-to-br from-primary via-blue-700 to-secondary py-20 text-white overflow-hidden" id="hero">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-secondary/20 rounded-full -translate-x-16 -translate-y-16"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Access World-Class
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                            Healthcare in India
                        </span>
                    </h1>
                    
                    <p className="text-xl max-w-3xl mx-auto mb-8 font-light leading-relaxed">
                        Your trusted bridge to affordable, high-quality medical treatment.
                        Find leading hospitals, expert doctors, and comprehensive care packages.
                    </p>

                </div>

                {/* Enhanced Search */}
                <div className="max-w-4xl mx-auto">
                    <form className="bg-white rounded-2xl shadow-2xl p-2 mb-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col md:flex-row gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Search by specialty, treatment, or hospital name..."
                                aria-label="Search for hospitals by specialty"
                                disabled={isLoading}
                                className="flex-grow border-none py-4 px-6 text-lg text-dark placeholder-gray-500 focus:outline-none rounded-xl"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-800 transition-colors duration-300 disabled:bg-primary/80 disabled:cursor-wait min-w-[170px] flex justify-center items-center"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-6 h-6 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Search Hospitals
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { title: 'Advanced Search', href: '#/search', icon: '🔍', desc: 'Filter by specialty & location' },
                            { title: 'Virtual Tours', href: '#/experience', icon: '🌐', desc: 'Explore hospitals in 360°' },
                            { title: 'Plan Travel', href: '#/travel', icon: '✈️', desc: 'Visa, hotels & transport' },
                            { title: 'Patient Stories', href: '#/success-stories', icon: '⭐', desc: 'Real testimonials & success stories' }
                        ].map((action, index) => (
                            <a
                                key={index}
                                href={action.href}
                                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-4 transition-all duration-300 text-center group"
                            >
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                    {action.icon}
                                </div>
                                <div className="font-semibold text-sm mb-1">{action.title}</div>
                                <div className="text-xs text-white/80">{action.desc}</div>
                            </a>
                        ))}
                    </div>
                 </div>

             </div>
         </section>
    );
};