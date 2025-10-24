import { useState, useEffect } from 'react';
import { Hospital } from './types/index.ts';
import { searchHospitals, fetchInitialHospitals } from './services/api.ts';
import { useRouter } from './hooks/useRouter.ts';
import { AuthProvider } from './contexts/AuthContext.tsx';

import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { Chatbot } from './components/Chatbot.tsx';
import { QuickAccessPanel } from './components/common/QuickAccessPanel.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { HospitalDetailPage } from './pages/HospitalDetailPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { SearchResultsPage } from './pages/SearchResultsPage.tsx';
import { PatientDashboard } from './pages/PatientDashboard.tsx';
import { TravelPlanningPage } from './pages/TravelPlanningPage.tsx';
import { EnhancedExperiencePage } from './pages/EnhancedExperiencePage.tsx';
import { MobileAppPage } from './pages/MobileAppPage.tsx';
import { SuccessStoriesPage } from './pages/SuccessStoriesPage.tsx';
import { BookConsultationPage } from './pages/BookConsultationPage.tsx';

const GenericPage = ({ title, content }: { title: string, content: string}) => (
    <div className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-primary mb-4">{title}</h1>
        <p>{content}</p>
    </div>
);

export const App = () => {
    const route = useRouter();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    const loadInitialHospitals = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setHasSearched(false);
            const data = await fetchInitialHospitals();
            setHospitals(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        loadInitialHospitals();
    }, []);

    const handleSearch = async (query: string) => {
        try {
            setIsLoading(true);
            setError(null);
            setHasSearched(true);
            const results = await searchHospitals(query);
            setHospitals(results);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderPage = () => {
        if (route.startsWith('#/hospital/')) {
            const hospitalName = decodeURIComponent(route.split('/')[2]);
            return <HospitalDetailPage hospitalName={hospitalName} />;
        }

        if (route.startsWith('#/book-consultation/')) {
            return <BookConsultationPage />;
        }
        
        switch (route) {
            case '#/':
            case '':
                return <HomePage hospitals={hospitals} isLoading={isLoading} error={error} onSearch={handleSearch} hasSearched={hasSearched} />;
            case '#/search':
                return <SearchResultsPage />;
            case '#/experience':
                return <EnhancedExperiencePage />;
            case '#/success-stories':
                return <SuccessStoriesPage />;
            case '#/admin':
                return <AdminPage />;
            case '#/privacy':
                return <GenericPage title="Privacy Policy" content="Details about the privacy policy will go here." />;
            case '#/terms':
                 return <GenericPage title="Terms of Service" content="Details about the terms of service will go here." />;
            // Hidden routes for future development
            case '#/dashboard':
                return <PatientDashboard />;
            case '#/travel':
                return <TravelPlanningPage />;
            case '#/mobile':
                return <MobileAppPage />;
            default:
                return <HomePage hospitals={hospitals} isLoading={isLoading} error={error} onSearch={handleSearch} hasSearched={hasSearched} />;
        }
    };

    return (
        <AuthProvider>
            <div className="flex flex-col min-h-screen bg-light">
                <Header />
                <main className="flex-grow">
                    {renderPage()}
                </main>
                <Footer />
                <Chatbot />
                <QuickAccessPanel />
            </div>
        </AuthProvider>
    );
};