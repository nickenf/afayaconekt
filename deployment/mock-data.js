export const MOCK_HOSPITALS = [
  {
    name: 'Apollo Hospital, Chennai',
    specialties: 'Cardiology, Oncology, Orthopedics',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800',
    city: 'Chennai',
    description: 'A flagship hospital of the Apollo Group, known for its advanced cardiac and cancer care with state-of-the-art technology.'
  },
  {
    name: 'Fortis Memorial Research Institute, Gurugram',
    specialties: 'Neurology, Renal Sciences, Trauma Care',
    imageUrl: 'https://images.unsplash.com/photo-1629424115197-a3536ba9383e?q=80&w=800',
    city: 'Gurugram',
    description: 'A multi-super specialty, quaternary care hospital with a vast pool of talented and experienced team of doctors.'
  },
  {
    name: 'Medanta - The Medicity, Gurugram',
    specialties: 'Organ Transplants, Cardiac Surgery, Gastroenterology',
    imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=800',
    city: 'Gurugram',
    description: 'Home to some of the most eminent doctors in the world, renowned for its clinical excellence and cutting-edge technology.'
  },
  {
    name: 'Manipal Hospital, Bangalore',
    specialties: 'Robotic Surgery, Pediatrics, Bariatric Surgery',
    imageUrl: 'https://images.unsplash.com/photo-1626302592078-2054a3e221c5?q=80&w=800',
    city: 'Bangalore',
    description: 'A leading healthcare provider in India, offering a wide range of services from preventive to curative and rehabilitative care.'
  },
  {
    name: 'Kokilaben Dhirubhai Ambani Hospital, Mumbai',
    specialties: 'Robotic Surgery, Childrens Health, Sports Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1551192070-589705f4c51e?q=80&w=800',
    city: 'Mumbai',
    description: 'One of India\'s most advanced tertiary care facilities, setting new benchmarks in global healthcare standards.'
  },
  {
    name: 'Narayana Health City, Bangalore',
    specialties: 'Cardiac Sciences, Cancer Care, Nephrology',
    imageUrl: 'https://images.unsplash.com/photo-1629424115024-5ac84043a1a3?q=80&w=800',
    city: 'Bangalore',
    description: 'A world-renowned healthcare facility that provides high-quality, affordable medical care to patients from across the globe.'
  },
];

export const MOCK_HOSPITAL_DETAILS = MOCK_HOSPITALS.map((h, index) => ({
  ...h,
  accreditations: ['Joint Commission International (JCI)', 'National Accreditation Board for Hospitals & Healthcare Providers (NABH)'],
  internationalPatientServices: 'Dedicated international patient lounge, language interpreters, visa assistance, airport transfers, accommodation arrangement, and customized meal plans.',
  gallery: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600'
  ],
  // The video URL for the first hospital, representing a newly generated tour.
  ...(index === 0 && { videoUrl: 'https://videos.pexels.com/video-files/8245239/8245239-hd.mp4' })
}));

export const MOCK_TRAVEL_INFO = {
    visa: 'We provide an official invitation letter to help you obtain a medical visa. Our team guides you through the application process for a smooth experience.',
    accommodation: 'We have partnerships with nearby hotels and guesthouses offering discounted rates. Options range from budget-friendly stays to luxury apartments.',
    localSupport: 'A dedicated patient coordinator will be your single point of contact, assisting with local transport, currency exchange, and any other on-ground needs.'
};