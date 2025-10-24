-- Initialize database schema for AfyaConnect
-- This file runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'patient',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    specialties TEXT[],
    rating DECIMAL(3,2),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    experience_years INTEGER,
    rating DECIMAL(3,2),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals(name);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Insert sample data
INSERT INTO hospitals (name, address, phone, email, description, specialties, rating) VALUES
('City General Hospital', '123 Main St, Nairobi', '+254-700-123456', 'info@citygeneral.co.ke', 'Leading healthcare provider in Nairobi', ARRAY['Cardiology', 'Neurology', 'Orthopedics'], 4.5),
('Metro Medical Center', '456 Health Ave, Nairobi', '+254-700-654321', 'contact@metromedical.co.ke', 'Comprehensive medical services', ARRAY['Pediatrics', 'Dermatology', 'Gynecology'], 4.2)
ON CONFLICT DO NOTHING;

INSERT INTO doctors (hospital_id, first_name, last_name, specialty, email, experience_years, rating) VALUES
((SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1), 'Dr. Sarah', 'Johnson', 'Cardiology', 'sarah.johnson@citygeneral.co.ke', 15, 4.8),
((SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1), 'Dr. Michael', 'Chen', 'Neurology', 'michael.chen@citygeneral.co.ke', 12, 4.6),
((SELECT id FROM hospitals WHERE name = 'Metro Medical Center' LIMIT 1), 'Dr. Emily', 'Davis', 'Pediatrics', 'emily.davis@metromedical.co.ke', 10, 4.7)
ON CONFLICT DO NOTHING;