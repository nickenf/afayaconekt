export interface Hospital {
  id: number;
  name: string;
  specialties: string;
  imageUrl: string;
  city: string;
  description: string;
  averageRating: number;
  ratingCount: number;
}

export interface HospitalDetails extends Hospital {
    accreditations: string[];
    internationalPatientServices: string;
    gallery: string[];
    videoUrl?: string;
}

export interface Inquiry {
    id: number;
    hospitalName: string;
    patientName: string;
    patientEmail: string;
    message: string;
    submittedAt: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface TravelInfo {
    visa: string;
    accommodation: string;
    localSupport: string;
}