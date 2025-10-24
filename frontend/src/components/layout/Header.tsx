import React, { useState } from 'react';
import { Logo } from '../common/Logo.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { AuthModal } from '../auth/AuthModal.tsx';
import { UserProfile } from '../auth/UserProfile.tsx';

export const Header = () => {
    const { user, logout } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const handleAuthClick = (mode: 'login' | 'register') => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    const handleLogout = () => {
        logout();
        setShowUserDropdown(false);
    };
    // This refined handler smoothly navigates or scrolls.
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        
        // If it's a page route, just change the hash.
        if (targetId.startsWith('#/')) {
            window.location.hash = targetId;
            if (targetId === '#/') {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
             }
            return;
        }

        const isHomePage = window.location.hash === '#/' || window.location.hash === '';

        const scrollToAction = () => {
            const element = document.getElementById(targetId.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        if (isHomePage) {
            scrollToAction();
        } else {
            // Navigate to home page first, then scroll.
            window.location.hash = '/';
            setTimeout(scrollToAction, 100); // Timeout allows the page to change before scrolling.
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <a href="#/" onClick={(e) => handleNavClick(e, '#/')} className="flex items-center gap-3 no-underline">
                        <Logo className="w-10 h-10" />
                        <span className="text-3xl font-bold text-primary">
                            AfyaConnect
                        </span>
                    </a>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#/" onClick={(e) => handleNavClick(e, '#/')} className="text-dark font-medium hover:text-primary transition-colors duration-300">Home</a>
                        <a href="#/search" onClick={(e) => handleNavClick(e, '#/search')} className="text-dark font-medium hover:text-primary transition-colors duration-300">Find Treatment</a>
                        <a href="#/experience" onClick={(e) => handleNavClick(e, '#/experience')} className="text-dark font-medium hover:text-primary transition-colors duration-300">Virtual Tours</a>
                        <a href="#testimonials" onClick={(e) => handleNavClick(e, '#testimonials')} className="text-dark font-medium hover:text-primary transition-colors duration-300">Success Stories</a>
                        <a href="#footer" onClick={(e) => handleNavClick(e, '#footer')} className="bg-primary text-white font-bold py-2 px-5 rounded-full hover:bg-blue-800 transition-colors duration-300">Get Started</a>
                        
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center space-x-2 text-dark font-medium hover:text-primary transition-colors duration-300"
                                >
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </div>
                                    <span>{user.firstName}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <button
                                            onClick={() => {
                                                setShowUserProfile(true);
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            My Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleNavClick(new Event('click') as any, '#/dashboard');
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            My Dashboard
                                        </button>
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center space-x-2 bg-primary text-white font-bold py-2 px-5 rounded-full hover:bg-blue-800 transition-colors duration-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Account</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <button
                                            onClick={() => {
                                                handleAuthClick('login');
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleAuthClick('register');
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            Create Account
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode={authMode}
            />

            {/* User Profile Modal */}
            {showUserProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <UserProfile onClose={() => setShowUserProfile(false)} />
                </div>
            )}

            {/* Click outside to close dropdown */}
            {showUserDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                />
            )}
        </header>
    );
};