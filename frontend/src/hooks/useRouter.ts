import { useState, useEffect } from 'react';

// A simple, lightweight hash-based router hook.
export const useRouter = () => {
    // Initialize state with the current hash, defaulting to '#/' for the homepage.
    const [route, setRoute] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash || '#/');
        };

        // Listen for changes to the URL hash
        window.addEventListener('hashchange', handleHashChange);
        
        // Cleanup listener on component unmount
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return route;
};
