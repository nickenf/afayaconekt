
import { Hospital, HospitalDetails, TravelInfo, Inquiry } from '../types/index.ts';

// Simulate network latency for mock functions
const simulateDelay = (delay = 500) => new Promise(res => setTimeout(res, delay));

// --- API Functions ---

// UPDATED: Fetch from the backend API
export const fetchInitialHospitals = async (): Promise<Hospital[]> => {
    const response = await fetch('/api/hospitals');
    if (!response.ok) {
        throw new Error('Failed to fetch hospitals.');
    }
    return response.json();
};

// UPDATED: Search via the backend API
export const searchHospitals = async (query: string): Promise<Hospital[]> => {
    const response = await fetch(`/api/hospitals?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Failed to search for hospitals.');
    }
    return response.json();
};

// UPDATED: Fetch details from the backend API
export const fetchHospitalDetails = async (hospitalName: string): Promise<HospitalDetails> => {
    const response = await fetch(`/api/hospitals/name/${encodeURIComponent(hospitalName)}`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Hospital not found");
        }
        throw new Error("Failed to fetch hospital details.");
    }
    return response.json();
};

// UPDATED: Fetch travel info from the backend API
export const fetchTravelInfo = async (): Promise<TravelInfo> => {
    const response = await fetch('/api/travel-info');
    if (!response.ok) {
        throw new Error('Failed to fetch travel information.');
    }
    return response.json();
};

// UPDATED: Fetch inquiries from the backend API
export const fetchInquiries = async (): Promise<Inquiry[]> => {
    const response = await fetch('/api/inquiries');
    if (!response.ok) {
        throw new Error('Failed to fetch inquiries.');
    }
    return response.json();
};

interface NewInquiry {
    hospitalName: string;
    patientName: string;
    patientEmail: string;
    message: string;
}

// UPDATED: Submit inquiry to the backend API
export const submitInquiry = async (inquiryData: NewInquiry): Promise<{ success: true }> => {
    const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit inquiry.");
    }
    
    const data = await response.json();
    if (data.success) {
        return { success: true };
    } else {
        throw new Error("An unexpected error occurred while submitting.");
    }
};

// Submit a new rating for a hospital
export const submitRating = async (hospitalId: number, rating: number): Promise<{ success: true, newAverageRating: number, newRatingCount: number }> => {
    const response = await fetch(`/api/hospitals/${hospitalId}/ratings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit rating.");
    }
    
    return response.json();
};

// UPDATED: Get response from the Gemini-powered backend
export const getChatbotResponse = async (message: string): Promise<string> => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from assistant.");
    }

    const data = await response.json();
    return data.response;
};

// Submit user testimonial
export const submitTestimonial = async (testimonialData: {
    patientName: string;
    patientCountry: string;
    patientAge?: number;
    treatmentType: string;
    hospitalName: string;
    doctorName: string;
    rating: number;
    testimonialText: string;
    treatmentDate?: string;
    treatmentDuration?: string;
    costSaved?: number;
    beforeImage?: File | null;
    afterImage?: File | null;
    videoTestimonial?: string;
    tags?: string[];
    useProfileImage?: boolean;
}): Promise<{ success: true; testimonialId: number }> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Authentication required');
    }

    // Create FormData for file uploads
    const formData = new FormData();

    // Add text fields
    Object.entries(testimonialData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'beforeImage' && key !== 'afterImage') {
            if (key === 'tags' && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        }
    });

    // Add image files
    if (testimonialData.beforeImage) {
        formData.append('beforeImage', testimonialData.beforeImage);
    }
    if (testimonialData.afterImage) {
        formData.append('afterImage', testimonialData.afterImage);
    }

    const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit testimonial');
    }

    return response.json();
};

// Get published user testimonials
export const getUserTestimonials = async (treatmentType?: string, limit?: number): Promise<any[]> => {
    const params = new URLSearchParams();
    if (treatmentType) params.append('treatmentType', treatmentType);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`/api/testimonials?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
    }
    return response.json();
};

// Get user's own testimonials
export const getMyTestimonials = async (): Promise<any[]> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Authentication required');
    }

    const response = await fetch('/api/testimonials/my', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
    }
    return response.json();
};

// Get success statistics
export const fetchStatistics = async () => {
    const response = await fetch('/api/statistics');
    if (!response.ok) {
        throw new Error('Failed to fetch statistics');
    }
    return response.json();
};
