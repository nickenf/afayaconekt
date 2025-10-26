import pkg from 'pg';
const { Pool } = pkg;
import { MOCK_HOSPITAL_DETAILS } from './mock-data.js';

// This function will initialize the database connection and schema
export async function initializeDatabase() {
    try {
        const db = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'afyaconnect',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Test the connection
        await db.query('SELECT NOW()');
        console.log('PostgreSQL database connected successfully');

        // Create the hospitals table with enhanced medical tourism fields
        await db.query(`
            CREATE TABLE IF NOT EXISTS hospitals (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                specialties TEXT,
                imageUrl TEXT,
                city TEXT,
                state TEXT,
                country TEXT DEFAULT 'India',
                description TEXT,
                accreditations TEXT,
                internationalPatientServices TEXT,
                gallery TEXT,
                averageRating REAL NOT NULL DEFAULT 0,
                ratingCount INTEGER NOT NULL DEFAULT 0,
                videoUrl TEXT,
                establishedYear INTEGER,
                bedCount INTEGER,
                doctorCount INTEGER,
                nurseCount INTEGER,
                ambulanceServices BOOLEAN DEFAULT TRUE,
                pharmacyServices BOOLEAN DEFAULT TRUE,
                laboratoryServices BOOLEAN DEFAULT TRUE,
                radiologyServices BOOLEAN DEFAULT TRUE,
                bloodBankServices BOOLEAN DEFAULT FALSE,
                organTransplantServices BOOLEAN DEFAULT FALSE,
                telemedicineServices BOOLEAN DEFAULT FALSE,
                languagesSpoken TEXT,
                contactPhone TEXT,
                contactEmail TEXT,
                website TEXT,
                address TEXT,
                latitude REAL,
                longitude REAL,
                priceRange TEXT DEFAULT 'moderate',
                insuranceAccepted TEXT,
                paymentMethods TEXT,
                visaAssistance BOOLEAN DEFAULT TRUE,
                airportPickup BOOLEAN DEFAULT TRUE,
                accommodationPartners TEXT,
                translationServices BOOLEAN DEFAULT TRUE,
                dietaryServices TEXT,
                wifiAvailable BOOLEAN DEFAULT TRUE,
                parkingAvailable BOOLEAN DEFAULT TRUE,
                disabilityAccessible BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create medical specialties table
        await db.query(`
            CREATE TABLE IF NOT EXISTS medical_specialties (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                icon TEXT,
                category TEXT,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create doctors table
        await db.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                id SERIAL PRIMARY KEY,
                hospitalId INTEGER NOT NULL,
                firstName TEXT NOT NULL,
                lastName TEXT NOT NULL,
                title TEXT DEFAULT 'Dr.',
                specialtyId INTEGER NOT NULL,
                subSpecialties TEXT,
                qualifications TEXT,
                experience INTEGER,
                imageUrl TEXT,
                biography TEXT,
                languagesSpoken TEXT,
                consultationFee REAL,
                availabilitySchedule TEXT,
                rating REAL DEFAULT 0,
                reviewCount INTEGER DEFAULT 0,
                isAvailable BOOLEAN DEFAULT TRUE,
                telemedicineAvailable BOOLEAN DEFAULT FALSE,
                contactEmail TEXT,
                licenseNumber TEXT,
                awards TEXT,
                publications TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (hospitalId) REFERENCES hospitals (id),
                FOREIGN KEY (specialtyId) REFERENCES medical_specialties (id)
            )
        `);

        // Create treatments table
        await db.query(`
            CREATE TABLE IF NOT EXISTS treatments (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                specialtyId INTEGER NOT NULL,
                description TEXT,
                duration TEXT,
                recoveryTime TEXT,
                successRate REAL,
                riskLevel TEXT DEFAULT 'low',
                averageCost REAL,
                costRange TEXT,
                preparationRequired TEXT,
                followUpRequired TEXT,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (specialtyId) REFERENCES medical_specialties (id)
            )
        `);

        // Create hospital_treatments junction table
        await db.query(`
            CREATE TABLE IF NOT EXISTS hospital_treatments (
                id SERIAL PRIMARY KEY,
                hospitalId INTEGER NOT NULL,
                treatmentId INTEGER NOT NULL,
                cost REAL,
                costCurrency TEXT DEFAULT 'USD',
                isAvailable BOOLEAN DEFAULT TRUE,
                waitingTime TEXT,
                successRate REAL,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (hospitalId) REFERENCES hospitals (id),
                FOREIGN KEY (treatmentId) REFERENCES treatments (id),
                UNIQUE(hospitalId, treatmentId)
            )
        `);

        // Create doctor reviews table
        await db.query(`
            CREATE TABLE IF NOT EXISTS doctor_reviews (
                id SERIAL PRIMARY KEY,
                doctorId INTEGER NOT NULL,
                userId INTEGER,
                patientName TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                reviewText TEXT,
                treatmentType TEXT,
                visitDate TEXT,
                isVerified BOOLEAN DEFAULT FALSE,
                isAnonymous BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (doctorId) REFERENCES doctors (id),
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create hospital amenities table
        await db.query(`
            CREATE TABLE IF NOT EXISTS hospital_amenities (
                id SERIAL PRIMARY KEY,
                hospitalId INTEGER NOT NULL,
                amenityType TEXT NOT NULL,
                amenityName TEXT NOT NULL,
                description TEXT,
                isAvailable BOOLEAN DEFAULT TRUE,
                additionalCost REAL DEFAULT 0,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (hospitalId) REFERENCES hospitals (id)
            )
        `);

        // Create appointments table
        await db.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                doctorId INTEGER NOT NULL,
                hospitalId INTEGER NOT NULL,
                appointmentType TEXT NOT NULL DEFAULT 'consultation',
                appointmentDate TEXT NOT NULL,
                appointmentTime TEXT NOT NULL,
                duration INTEGER DEFAULT 30,
                status TEXT NOT NULL DEFAULT 'scheduled',
                notes TEXT,
                consultationFee REAL,
                isTelemedicine BOOLEAN DEFAULT FALSE,
                meetingLink TEXT,
                reminderSent BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (doctorId) REFERENCES doctors (id),
                FOREIGN KEY (hospitalId) REFERENCES hospitals (id)
            )
        `);

        // Create treatment plans table
        await db.query(`
            CREATE TABLE IF NOT EXISTS treatment_plans (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                doctorId INTEGER NOT NULL,
                hospitalId INTEGER NOT NULL,
                treatmentId INTEGER NOT NULL,
                planName TEXT NOT NULL,
                description TEXT,
                estimatedCost REAL,
                estimatedDuration TEXT,
                startDate TEXT,
                endDate TEXT,
                status TEXT NOT NULL DEFAULT 'draft',
                priority TEXT DEFAULT 'medium',
                notes TEXT,
                preOperativeInstructions TEXT,
                postOperativeInstructions TEXT,
                followUpRequired BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (doctorId) REFERENCES doctors (id),
                FOREIGN KEY (hospitalId) REFERENCES hospitals (id),
                FOREIGN KEY (treatmentId) REFERENCES treatments (id)
            )
        `);

        // Create medical records table
        await db.query(`
            CREATE TABLE IF NOT EXISTS medical_records (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                recordType TEXT NOT NULL,
                fileName TEXT NOT NULL,
                originalFileName TEXT NOT NULL,
                fileSize INTEGER,
                mimeType TEXT,
                uploadDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                isShared BOOLEAN DEFAULT FALSE,
                sharedWith TEXT,
                tags TEXT,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create consultation notes table
        await db.query(`
            CREATE TABLE IF NOT EXISTS consultation_notes (
                id SERIAL PRIMARY KEY,
                appointmentId INTEGER NOT NULL,
                doctorId INTEGER NOT NULL,
                userId INTEGER NOT NULL,
                symptoms TEXT,
                diagnosis TEXT,
                recommendations TEXT,
                prescriptions TEXT,
                followUpDate TEXT,
                followUpInstructions TEXT,
                isConfidential BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appointmentId) REFERENCES appointments (id),
                FOREIGN KEY (doctorId) REFERENCES doctors (id),
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create treatment milestones table
        await db.query(`
            CREATE TABLE IF NOT EXISTS treatment_milestones (
                id SERIAL PRIMARY KEY,
                treatmentPlanId INTEGER NOT NULL,
                milestoneTitle TEXT NOT NULL,
                description TEXT,
                scheduledDate TEXT,
                completedDate TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                notes TEXT,
                isRequired BOOLEAN DEFAULT TRUE,
                orderIndex INTEGER DEFAULT 0,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (treatmentPlanId) REFERENCES treatment_plans (id)
            )
        `);

        // Create second opinions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS second_opinions (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                primaryDoctorId INTEGER,
                secondOpinionDoctorId INTEGER NOT NULL,
                medicalCondition TEXT NOT NULL,
                currentDiagnosis TEXT,
                proposedTreatment TEXT,
                secondOpinionText TEXT,
                agreement TEXT,
                recommendedAction TEXT,
                consultationFee REAL,
                status TEXT NOT NULL DEFAULT 'requested',
                requestDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                responseDate TEXT,
                isUrgent BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (primaryDoctorId) REFERENCES doctors (id),
                FOREIGN KEY (secondOpinionDoctorId) REFERENCES doctors (id)
            )
        `);

        // Create travel bookings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS travel_bookings (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                appointmentId INTEGER,
                treatmentPlanId INTEGER,
                bookingType TEXT NOT NULL,
                bookingReference TEXT,
                providerName TEXT,
                bookingDetails TEXT,
                totalCost REAL,
                currency TEXT DEFAULT 'USD',
                bookingDate TEXT,
                startDate TEXT,
                endDate TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                confirmationNumber TEXT,
                cancellationPolicy TEXT,
                specialRequests TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (appointmentId) REFERENCES appointments (id),
                FOREIGN KEY (treatmentPlanId) REFERENCES treatment_plans (id)
            )
        `);

        // Create visa applications table
        await db.query(`
            CREATE TABLE IF NOT EXISTS visa_applications (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                passportNumber TEXT NOT NULL,
                passportExpiry TEXT NOT NULL,
                nationality TEXT NOT NULL,
                purposeOfVisit TEXT NOT NULL DEFAULT 'medical',
                hospitalInvitationLetter BOOLEAN DEFAULT FALSE,
                medicalDocuments BOOLEAN DEFAULT FALSE,
                financialDocuments BOOLEAN DEFAULT FALSE,
                travelItinerary BOOLEAN DEFAULT FALSE,
                accommodationBooking BOOLEAN DEFAULT FALSE,
                applicationStatus TEXT NOT NULL DEFAULT 'draft',
                submissionDate TEXT,
                approvalDate TEXT,
                visaNumber TEXT,
                visaExpiry TEXT,
                processingFee REAL,
                notes TEXT,
                assignedOfficer TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create accommodation options table
        await db.query(`
            CREATE TABLE IF NOT EXISTS accommodation_options (
                id SERIAL PRIMARY KEY,
                hospitalId INTEGER NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                address TEXT,
                distanceFromHospital REAL,
                amenities TEXT,
                images TEXT,
                pricePerNight REAL,
                currency TEXT DEFAULT 'USD',
                rating REAL DEFAULT 0,
                reviewCount INTEGER DEFAULT 0,
                contactPhone TEXT,
                contactEmail TEXT,
                website TEXT,
                isPartner BOOLEAN DEFAULT FALSE,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (hospitalId) REFERENCES hospitals (id)
            )
        `);

        // Create accommodation rooms table (room types/packages for each accommodation)
        await db.query(`
            CREATE TABLE IF NOT EXISTS accommodation_rooms (
                id SERIAL PRIMARY KEY,
                accommodationId INTEGER NOT NULL,
                roomType TEXT NOT NULL,
                description TEXT,
                maxOccupancy INTEGER DEFAULT 2,
                pricePerNight REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                amenities TEXT,
                isAvailable BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (accommodationId) REFERENCES accommodation_options (id)
            )
        `);

        // Create accommodation bookings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS accommodation_bookings (
                id SERIAL PRIMARY KEY,
                userId INTEGER,
                guestName TEXT,
                guestEmail TEXT,
                accommodationId INTEGER NOT NULL,
                roomId INTEGER,
                checkInDate TEXT NOT NULL,
                checkOutDate TEXT NOT NULL,
                numberOfGuests INTEGER DEFAULT 1,
                totalCost REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                bookingStatus TEXT NOT NULL DEFAULT 'pending',
                specialRequests TEXT,
                contactPhone TEXT,
                emergencyContact TEXT,
                adminNotes TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (accommodationId) REFERENCES accommodation_options (id),
                FOREIGN KEY (roomId) REFERENCES accommodation_rooms (id)
            )
        `);

        // Create transportation services table
        await db.query(`
            CREATE TABLE IF NOT EXISTS transportation_services (
                id SERIAL PRIMARY KEY,
                serviceType TEXT NOT NULL,
                providerName TEXT NOT NULL,
                description TEXT,
                vehicleType TEXT,
                capacity INTEGER,
                amenities TEXT,
                pricePerKm REAL,
                minimumCharge REAL,
                currency TEXT DEFAULT 'USD',
                coverage TEXT,
                contactPhone TEXT,
                contactEmail TEXT,
                isActive BOOLEAN DEFAULT TRUE,
                rating REAL DEFAULT 0,
                reviewCount INTEGER DEFAULT 0,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create travel assistance requests table
        await db.query(`
            CREATE TABLE IF NOT EXISTS travel_assistance_requests (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                requestType TEXT NOT NULL,
                priority TEXT DEFAULT 'medium',
                description TEXT NOT NULL,
                preferredDate TEXT,
                budget REAL,
                currency TEXT DEFAULT 'USD',
                specialRequirements TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                assignedAgent TEXT,
                responseText TEXT,
                estimatedCost REAL,
                finalCost REAL,
                completionDate TEXT,
                rating INTEGER,
                feedback TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create payments table
        await db.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                appointmentId INTEGER,
                treatmentPlanId INTEGER,
                travelBookingId INTEGER,
                paymentType TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                paymentMethod TEXT NOT NULL,
                paymentStatus TEXT NOT NULL DEFAULT 'pending',
                transactionId TEXT,
                gatewayResponse TEXT,
                paymentDate TEXT,
                dueDate TEXT,
                description TEXT,
                invoiceNumber TEXT,
                taxAmount REAL DEFAULT 0,
                discountAmount REAL DEFAULT 0,
                refundAmount REAL DEFAULT 0,
                refundDate TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (appointmentId) REFERENCES appointments (id),
                FOREIGN KEY (treatmentPlanId) REFERENCES treatment_plans (id),
                FOREIGN KEY (travelBookingId) REFERENCES travel_bookings (id)
            )
        `);

        // Create insurance claims table
        await db.query(`
            CREATE TABLE IF NOT EXISTS insurance_claims (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                appointmentId INTEGER,
                treatmentPlanId INTEGER,
                insuranceProvider TEXT NOT NULL,
                policyNumber TEXT NOT NULL,
                claimNumber TEXT,
                claimAmount REAL NOT NULL,
                approvedAmount REAL,
                currency TEXT DEFAULT 'USD',
                claimStatus TEXT NOT NULL DEFAULT 'submitted',
                submissionDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                approvalDate TEXT,
                rejectionReason TEXT,
                documentsSubmitted TEXT,
                preAuthorizationRequired BOOLEAN DEFAULT FALSE,
                preAuthorizationNumber TEXT,
                estimatedProcessingTime TEXT,
                contactPerson TEXT,
                contactPhone TEXT,
                contactEmail TEXT,
                notes TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (appointmentId) REFERENCES appointments (id),
                FOREIGN KEY (treatmentPlanId) REFERENCES treatment_plans (id)
            )
        `);

        // Create financial packages table
        await db.query(`
            CREATE TABLE IF NOT EXISTS financial_packages (
                id SERIAL PRIMARY KEY,
                packageName TEXT NOT NULL,
                description TEXT,
                packageType TEXT NOT NULL,
                baseAmount REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                installmentOptions TEXT,
                interestRate REAL DEFAULT 0,
                processingFee REAL DEFAULT 0,
                eligibilityCriteria TEXT,
                requiredDocuments TEXT,
                approvalTime TEXT,
                termsAndConditions TEXT,
                isActive BOOLEAN DEFAULT TRUE,
                popularityScore INTEGER DEFAULT 0,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create medical loans table
        await db.query(`
            CREATE TABLE IF NOT EXISTS medical_loans (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                treatmentPlanId INTEGER,
                loanAmount REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                interestRate REAL NOT NULL,
                loanTerm INTEGER NOT NULL,
                monthlyPayment REAL NOT NULL,
                applicationStatus TEXT NOT NULL DEFAULT 'draft',
                approvalDate TEXT,
                disbursementDate TEXT,
                firstPaymentDate TEXT,
                loanProvider TEXT NOT NULL,
                loanOfficer TEXT,
                collateralRequired BOOLEAN DEFAULT FALSE,
                collateralDetails TEXT,
                guarantorRequired BOOLEAN DEFAULT FALSE,
                guarantorDetails TEXT,
                creditScore INTEGER,
                employmentVerification BOOLEAN DEFAULT FALSE,
                incomeVerification BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (treatmentPlanId) REFERENCES treatment_plans (id)
            )
        `);

        // Create currency exchange rates table
        await db.query(`
            CREATE TABLE IF NOT EXISTS currency_rates (
                id SERIAL PRIMARY KEY,
                fromCurrency TEXT NOT NULL,
                toCurrency TEXT NOT NULL,
                exchangeRate REAL NOT NULL,
                lastUpdated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                source TEXT DEFAULT 'manual',
                isActive BOOLEAN DEFAULT TRUE,
                UNIQUE(fromCurrency, toCurrency)
            )
        `);

        // Create financial transactions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS financial_transactions (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                transactionType TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                description TEXT,
                referenceId TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                transactionDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                processedDate TEXT,
                failureReason TEXT,
                metadata TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create support tickets table
        await db.query(`
            CREATE TABLE IF NOT EXISTS support_tickets (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                ticketNumber TEXT NOT NULL UNIQUE,
                subject TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                priority TEXT DEFAULT 'medium',
                status TEXT NOT NULL DEFAULT 'open',
                assignedAgent TEXT,
                assignedCoordinator TEXT,
                resolution TEXT,
                satisfactionRating INTEGER,
                feedback TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                resolvedAt TEXT,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create support messages table
        await db.query(`
            CREATE TABLE IF NOT EXISTS support_messages (
                id SERIAL PRIMARY KEY,
                ticketId INTEGER NOT NULL,
                senderId INTEGER,
                senderType TEXT NOT NULL,
                senderName TEXT NOT NULL,
                message TEXT NOT NULL,
                messageType TEXT DEFAULT 'text',
                attachments TEXT,
                isRead BOOLEAN DEFAULT FALSE,
                readAt TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticketId) REFERENCES support_tickets (id),
                FOREIGN KEY (senderId) REFERENCES users (id)
            )
        `);

        // Create patient coordinators table
        await db.query(`
            CREATE TABLE IF NOT EXISTS patient_coordinators (
                id SERIAL PRIMARY KEY,
                firstName TEXT NOT NULL,
                lastName TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL,
                specialization TEXT,
                languagesSpoken TEXT,
                experience INTEGER,
                rating REAL DEFAULT 0,
                reviewCount INTEGER DEFAULT 0,
                isAvailable BOOLEAN DEFAULT TRUE,
                workingHours TEXT,
                timeZone TEXT DEFAULT 'Asia/Kolkata',
                profileImage TEXT,
                biography TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create coordinator assignments table
        await db.query(`
            CREATE TABLE IF NOT EXISTS coordinator_assignments (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                coordinatorId INTEGER NOT NULL,
                appointmentId INTEGER,
                treatmentPlanId INTEGER,
                assignmentType TEXT NOT NULL,
                assignmentDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status TEXT NOT NULL DEFAULT 'active',
                notes TEXT,
                endDate TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (coordinatorId) REFERENCES patient_coordinators (id),
                FOREIGN KEY (appointmentId) REFERENCES appointments (id),
                FOREIGN KEY (treatmentPlanId) REFERENCES treatment_plans (id)
            )
        `);

        // Create notifications table
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                priority TEXT DEFAULT 'medium',
                isRead BOOLEAN DEFAULT FALSE,
                readAt TEXT,
                actionUrl TEXT,
                actionText TEXT,
                expiresAt TEXT,
                metadata TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create emergency contacts table
        await db.query(`
            CREATE TABLE IF NOT EXISTS emergency_contacts (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                contactType TEXT NOT NULL,
                name TEXT NOT NULL,
                relationship TEXT,
                phone TEXT NOT NULL,
                email TEXT,
                address TEXT,
                isPrimary BOOLEAN DEFAULT FALSE,
                isActive BOOLEAN DEFAULT TRUE,
                notes TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create user testimonials table
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_testimonials (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                patientName TEXT NOT NULL,
                patientCountry TEXT NOT NULL,
                patientAge INTEGER,
                treatmentType TEXT NOT NULL,
                hospitalName TEXT NOT NULL,
                doctorName TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                testimonialText TEXT NOT NULL,
                treatmentDate TEXT,
                treatmentDuration TEXT,
                costSaved REAL,
                beforeImage TEXT,
                afterImage TEXT,
                videoTestimonial TEXT,
                isVerified BOOLEAN DEFAULT FALSE,
                isApproved BOOLEAN DEFAULT FALSE,
                isPublished BOOLEAN DEFAULT FALSE,
                tags TEXT,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `);

        // Create the inquiries table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS inquiries (
                id SERIAL PRIMARY KEY,
                hospitalName TEXT NOT NULL,
                patientName TEXT NOT NULL,
                patientEmail TEXT NOT NULL,
                message TEXT NOT NULL,
                submittedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create the users table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                firstName TEXT NOT NULL,
                lastName TEXT NOT NULL,
                phone TEXT,
                dateOfBirth TEXT,
                country TEXT,
                role TEXT NOT NULL DEFAULT 'patient',
                isVerified BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);


        // Seed medical specialties first
        await seedMedicalSpecialties(db);

        // Seed treatments
        await seedTreatments(db);

        // Check if hospitals table is empty and seed
        const hospitalCount = await db.query('SELECT COUNT(*) as count FROM hospitals');
        if (hospitalCount.rows[0].count === 0) {
            console.log('Database is empty. Seeding hospitals...');
            await seedHospitals(db);
            console.log('Hospitals seeded successfully.');
        }

        // Seed doctors
        await seedDoctors(db);

        // Seed accommodation options
        await seedAccommodationOptions(db);

        // Seed transportation services
        await seedTransportationServices(db);

        // Seed patient coordinators
        await seedPatientCoordinators(db);

        // Seed accommodation rooms
        await seedAccommodationRooms(db);

        // Seed sample testimonials
        await seedTestimonials(db);

        return db;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1); // Exit if DB connection fails
    }
}

// Seed medical specialties
async function seedMedicalSpecialties(db) {
    const specialtyCount = await db.query('SELECT COUNT(*) as count FROM medical_specialties');
    if (specialtyCount.rows[0].count === 0) {
        console.log('Seeding medical specialties...');
        const specialties = [
            { name: 'Cardiology', description: 'Heart and cardiovascular system', icon: '❤️', category: 'Internal Medicine' },
            { name: 'Oncology', description: 'Cancer treatment and care', icon: '🎗️', category: 'Specialized Medicine' },
            { name: 'Orthopedics', description: 'Bones, joints, and musculoskeletal system', icon: '🦴', category: 'Surgery' },
            { name: 'Neurology', description: 'Brain and nervous system', icon: '🧠', category: 'Internal Medicine' },
            { name: 'Gastroenterology', description: 'Digestive system', icon: '🫁', category: 'Internal Medicine' },
            { name: 'Ophthalmology', description: 'Eye and vision care', icon: '👁️', category: 'Surgery' },
            { name: 'Dermatology', description: 'Skin, hair, and nail conditions', icon: '🧴', category: 'Internal Medicine' },
            { name: 'Plastic Surgery', description: 'Reconstructive and cosmetic surgery', icon: '✨', category: 'Surgery' },
            { name: 'Fertility Treatment', description: 'Reproductive health and fertility', icon: '👶', category: 'Specialized Medicine' },
            { name: 'Transplant Surgery', description: 'Organ transplantation', icon: '🫀', category: 'Surgery' },
            { name: 'Pediatrics', description: 'Children\'s healthcare', icon: '👶', category: 'General Medicine' },
            { name: 'Gynecology', description: 'Women\'s reproductive health', icon: '👩', category: 'General Medicine' }
        ];

        for (const specialty of specialties) {
            await db.query(
                'INSERT INTO medical_specialties (name, description, icon, category) VALUES ($1, $2, $3, $4)',
                [specialty.name, specialty.description, specialty.icon, specialty.category]
            );
        }
        console.log('Medical specialties seeded successfully.');
    }
}

// Seed treatments
async function seedTreatments(db) {
    const treatmentCount = await db.query('SELECT COUNT(*) as count FROM treatments');
    if (treatmentCount.rows[0].count === 0) {
        console.log('Seeding treatments...');
        const treatments = [
            { name: 'Heart Bypass Surgery', specialtyId: 1, description: 'Coronary artery bypass surgery', duration: '4-6 hours', recoveryTime: '6-8 weeks', successRate: 95.0, riskLevel: 'moderate', averageCost: 8000, costRange: '$6,000 - $12,000' },
            { name: 'Angioplasty', specialtyId: 1, description: 'Balloon angioplasty with stent placement', duration: '1-2 hours', recoveryTime: '1-2 weeks', successRate: 98.0, riskLevel: 'low', averageCost: 4000, costRange: '$3,000 - $6,000' },
            { name: 'Chemotherapy', specialtyId: 2, description: 'Cancer treatment with medications', duration: '3-6 months', recoveryTime: 'Ongoing', successRate: 70.0, riskLevel: 'moderate', averageCost: 15000, costRange: '$10,000 - $25,000' },
            { name: 'Radiation Therapy', specialtyId: 2, description: 'High-energy radiation treatment', duration: '6-8 weeks', recoveryTime: '2-4 weeks', successRate: 85.0, riskLevel: 'low', averageCost: 12000, costRange: '$8,000 - $18,000' },
            { name: 'Hip Replacement', specialtyId: 3, description: 'Total hip joint replacement', duration: '2-3 hours', recoveryTime: '3-6 months', successRate: 95.0, riskLevel: 'moderate', averageCost: 7000, costRange: '$5,000 - $10,000' },
            { name: 'Knee Replacement', specialtyId: 3, description: 'Total knee joint replacement', duration: '2-3 hours', recoveryTime: '3-6 months', successRate: 95.0, riskLevel: 'moderate', averageCost: 6500, costRange: '$4,500 - $9,000' },
            { name: 'Brain Tumor Surgery', specialtyId: 4, description: 'Surgical removal of brain tumors', duration: '4-8 hours', recoveryTime: '2-6 months', successRate: 80.0, riskLevel: 'high', averageCost: 20000, costRange: '$15,000 - $30,000' },
            { name: 'Cataract Surgery', specialtyId: 6, description: 'Lens replacement surgery', duration: '30 minutes', recoveryTime: '1-2 weeks', successRate: 99.0, riskLevel: 'low', averageCost: 1500, costRange: '$1,000 - $2,500' },
            { name: 'LASIK Surgery', specialtyId: 6, description: 'Laser vision correction', duration: '15 minutes', recoveryTime: '1-2 days', successRate: 96.0, riskLevel: 'low', averageCost: 2000, costRange: '$1,500 - $3,000' },
            { name: 'IVF Treatment', specialtyId: 9, description: 'In vitro fertilization', duration: '2-3 weeks', recoveryTime: '2 weeks', successRate: 40.0, riskLevel: 'low', averageCost: 5000, costRange: '$3,000 - $8,000' }
        ];

        for (const treatment of treatments) {
            await db.query(
                'INSERT INTO treatments (name, specialtyId, description, duration, recoveryTime, successRate, riskLevel, averageCost, costRange) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [treatment.name, treatment.specialtyId, treatment.description, treatment.duration, treatment.recoveryTime, treatment.successRate, treatment.riskLevel, treatment.averageCost, treatment.costRange]
            );
        }
        console.log('Treatments seeded successfully.');
    }
}

// Seed enhanced hospitals
async function seedHospitals(db) {
    const enhancedHospitals = [
        {
            name: 'Apollo Hospitals Chennai',
            specialties: 'Cardiology, Oncology, Transplant Surgery, Neurology',
            imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800',
            city: 'Chennai',
            state: 'Tamil Nadu',
            description: 'Leading multi-specialty hospital with world-class facilities and international patient care.',
            accreditations: JSON.stringify(['JCI', 'NABH', 'ISO 9001']),
            internationalPatientServices: 'Dedicated international patient coordinators, visa assistance, airport transfers',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800']),
            establishedYear: 1983,
            bedCount: 550,
            doctorCount: 150,
            nurseCount: 800,
            languagesSpoken: JSON.stringify(['English', 'Hindi', 'Tamil', 'Arabic']),
            contactPhone: '+91-44-2829-3333',
            contactEmail: 'international@apollohospitals.com',
            website: 'https://www.apollohospitals.com',
            address: '21, Greams Lane, Off Greams Road, Chennai - 600006',
            priceRange: 'premium',
            insuranceAccepted: JSON.stringify(['International Insurance', 'Travel Insurance', 'Self Pay']),
            paymentMethods: JSON.stringify(['Credit Card', 'Wire Transfer', 'Cash']),
            accommodationPartners: JSON.stringify(['Taj Hotels', 'ITC Hotels', 'Service Apartments']),
            dietaryServices: JSON.stringify(['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Diabetic'])
        },
        {
            name: 'Fortis Hospital Gurgaon',
            specialties: 'Cardiology, Orthopedics, Oncology, Gastroenterology',
            imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
            city: 'Gurgaon',
            state: 'Haryana',
            description: 'Advanced healthcare facility with cutting-edge technology and experienced medical professionals.',
            accreditations: JSON.stringify(['JCI', 'NABH', 'ISO 14001']),
            internationalPatientServices: 'International patient lounge, multilingual staff, cultural liaison services',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800']),
            establishedYear: 2001,
            bedCount: 400,
            doctorCount: 120,
            nurseCount: 600,
            languagesSpoken: JSON.stringify(['English', 'Hindi', 'Punjabi', 'Urdu']),
            contactPhone: '+91-124-496-2200',
            contactEmail: 'international@fortishealthcare.com',
            website: 'https://www.fortishealthcare.com',
            address: 'Sector 44, Opposite HUDA City Centre Metro Station, Gurgaon - 122002',
            priceRange: 'premium',
            insuranceAccepted: JSON.stringify(['International Insurance', 'Corporate Insurance', 'Self Pay']),
            paymentMethods: JSON.stringify(['Credit Card', 'Debit Card', 'Wire Transfer', 'Cash']),
            accommodationPartners: JSON.stringify(['Marriott Hotels', 'Hyatt Hotels', 'Guest Houses']),
            dietaryServices: JSON.stringify(['Vegetarian', 'Non-Vegetarian', 'Jain', 'Continental'])
        },
        {
            name: 'Max Super Speciality Hospital Delhi',
            specialties: 'Neurology, Plastic Surgery, Fertility Treatment, Ophthalmology',
            imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            city: 'New Delhi',
            state: 'Delhi',
            description: 'Premier healthcare destination with state-of-the-art infrastructure and patient-centric care.',
            accreditations: JSON.stringify(['JCI', 'NABH', 'NABL']),
            internationalPatientServices: 'Dedicated international wing, concierge services, family accommodation',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800']),
            establishedYear: 2006,
            bedCount: 500,
            doctorCount: 200,
            nurseCount: 750,
            languagesSpoken: JSON.stringify(['English', 'Hindi', 'Bengali', 'French']),
            contactPhone: '+91-11-2651-5050',
            contactEmail: 'international@maxhealthcare.com',
            website: 'https://www.maxhealthcare.in',
            address: '1, Press Enclave Road, Saket, New Delhi - 110017',
            priceRange: 'premium',
            insuranceAccepted: JSON.stringify(['Global Insurance', 'Medical Tourism Insurance', 'Self Pay']),
            paymentMethods: JSON.stringify(['All Major Credit Cards', 'Bank Transfer', 'Cash']),
            accommodationPartners: JSON.stringify(['Radisson Hotels', 'Park Hotels', 'Service Apartments']),
            dietaryServices: JSON.stringify(['Multi-Cuisine', 'Therapeutic Diets', 'Religious Dietary Requirements'])
        },
        {
            name: 'Medanta The Medicity Gurgaon',
            specialties: 'Cardiology, Oncology, Neurology, Transplant Surgery',
            imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
            city: 'Gurgaon',
            state: 'Haryana',
            description: 'One of India\'s largest multi-super specialty institutes with comprehensive medical care.',
            accreditations: JSON.stringify(['JCI', 'NABH', 'ISO 9001']),
            internationalPatientServices: 'International patient coordinators, visa assistance, luxury accommodations',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800']),
            establishedYear: 2009,
            bedCount: 1250,
            doctorCount: 300,
            nurseCount: 1000,
            languagesSpoken: JSON.stringify(['English', 'Hindi', 'Punjabi', 'Arabic', 'Russian']),
            contactPhone: '+91-124-414-1414',
            contactEmail: 'international@medanta.org',
            website: 'https://www.medanta.org',
            address: 'CH Baktawar Singh Road, Sector 38, Gurgaon - 122001',
            priceRange: 'premium',
            insuranceAccepted: JSON.stringify(['International Insurance', 'Travel Insurance', 'Corporate Insurance']),
            paymentMethods: JSON.stringify(['Credit Card', 'Debit Card', 'Wire Transfer', 'Cash']),
            accommodationPartners: JSON.stringify(['Medanta Guest House', 'Luxury Hotels', 'Service Apartments']),
            dietaryServices: JSON.stringify(['Vegetarian', 'Non-Vegetarian', 'Jain', 'Halal', 'Kosher'])
        },
        {
            name: 'Kokilaben Dhirubhai Ambani Hospital Mumbai',
            specialties: 'Cardiology, Oncology, Neurology, Gastroenterology',
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
            city: 'Mumbai',
            state: 'Maharashtra',
            description: 'State-of-the-art tertiary care hospital with advanced medical technology and compassionate care.',
            accreditations: JSON.stringify(['JCI', 'NABH', 'CAP']),
            internationalPatientServices: 'International patient lounge, multilingual staff, concierge services',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800']),
            establishedYear: 2008,
            bedCount: 750,
            doctorCount: 250,
            nurseCount: 850,
            languagesSpoken: JSON.stringify(['English', 'Hindi', 'Marathi', 'Gujarati', 'Arabic']),
            contactPhone: '+91-22-3099-9999',
            contactEmail: 'international@kokilabenhospital.com',
            website: 'https://www.kokilabenhospital.com',
            address: 'Rao Saheb Acharya Marg, Four Bungalows, Andheri West, Mumbai - 400053',
            priceRange: 'premium',
            insuranceAccepted: JSON.stringify(['International Insurance', 'Travel Insurance', 'TPA Insurance']),
            paymentMethods: JSON.stringify(['All Major Credit Cards', 'Bank Transfer', 'Cash']),
            accommodationPartners: JSON.stringify(['Taj Hotels', 'ITC Hotels', 'Luxury Apartments']),
            dietaryServices: JSON.stringify(['Multi-Cuisine', 'Therapeutic Diets', 'Cultural Preferences'])
        }
    ];

    for (const hospital of enhancedHospitals) {
        await db.query(`
            INSERT INTO hospitals (
                name, specialties, imageUrl, city, state, description, accreditations,
                internationalPatientServices, gallery, establishedYear, bedCount, doctorCount,
                nurseCount, languagesSpoken, contactPhone, contactEmail, website, address,
                priceRange, insuranceAccepted, paymentMethods, accommodationPartners, dietaryServices
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        `, [
            hospital.name, hospital.specialties, hospital.imageUrl, hospital.city, hospital.state,
            hospital.description, hospital.accreditations, hospital.internationalPatientServices,
            hospital.gallery, hospital.establishedYear, hospital.bedCount, hospital.doctorCount,
            hospital.nurseCount, hospital.languagesSpoken, hospital.contactPhone, hospital.contactEmail,
            hospital.website, hospital.address, hospital.priceRange, hospital.insuranceAccepted,
            hospital.paymentMethods, hospital.accommodationPartners, hospital.dietaryServices
        ]);
    }
}

// Seed doctors
async function seedDoctors(db) {
    const doctorCount = await db.query('SELECT COUNT(*) as count FROM doctors');
    if (doctorCount.rows[0].count === 0) {
        console.log('Seeding doctors...');
        const doctors = [
            {
                hospitalId: 1, firstName: 'Rajesh', lastName: 'Kumar', specialtyId: 1,
                qualifications: 'MBBS, MD, DM (Cardiology)', experience: 15,
                imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
                biography: 'Leading cardiologist with expertise in interventional cardiology and heart transplants.',
                languagesSpoken: JSON.stringify(['English', 'Hindi', 'Tamil']),
                consultationFee: 150, rating: 4.8, reviewCount: 245
            },
            {
                hospitalId: 1, firstName: 'Priya', lastName: 'Sharma', specialtyId: 2,
                qualifications: 'MBBS, MD, DM (Oncology)', experience: 12,
                imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
                biography: 'Renowned oncologist specializing in breast cancer and precision medicine.',
                languagesSpoken: JSON.stringify(['English', 'Hindi']),
                consultationFee: 200, rating: 4.9, reviewCount: 189
            },
            {
                hospitalId: 2, firstName: 'Amit', lastName: 'Singh', specialtyId: 3,
                qualifications: 'MBBS, MS (Orthopedics)', experience: 18,
                imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
                biography: 'Expert orthopedic surgeon with specialization in joint replacement and sports medicine.',
                languagesSpoken: JSON.stringify(['English', 'Hindi', 'Punjabi']),
                consultationFee: 120, rating: 4.7, reviewCount: 312
            },
            {
                hospitalId: 3, firstName: 'Sunita', lastName: 'Patel', specialtyId: 4,
                qualifications: 'MBBS, MD, DM (Neurology)', experience: 20,
                imageUrl: 'https://images.unsplash.com/photo-1594824388853-d0d4c0b5e0b5?w=400',
                biography: 'Leading neurologist with expertise in stroke management and neurocritical care.',
                languagesSpoken: JSON.stringify(['English', 'Hindi', 'Gujarati']),
                consultationFee: 180, rating: 4.9, reviewCount: 156
            }
        ];

        for (const doctor of doctors) {
            await db.query(`
                INSERT INTO doctors (
                    hospitalId, firstName, lastName, specialtyId, qualifications, experience,
                    imageUrl, biography, languagesSpoken, consultationFee, rating, reviewCount
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                doctor.hospitalId, doctor.firstName, doctor.lastName, doctor.specialtyId,
                doctor.qualifications, doctor.experience, doctor.imageUrl, doctor.biography,
                doctor.languagesSpoken, doctor.consultationFee, doctor.rating, doctor.reviewCount
            ]);
        }
        console.log('Doctors seeded successfully.');
    }
}

// Seed accommodation options
async function seedAccommodationOptions(db) {
    const accommodationCount = await db.query('SELECT COUNT(*) as count FROM accommodation_options');
    if (accommodationCount.rows[0].count === 0) {
        console.log('Seeding accommodation options...');
        const accommodations = [
            {
                hospitalId: 1, name: 'Taj Coromandel Chennai', type: 'luxury_hotel',
                description: 'Luxury 5-star hotel with premium amenities and medical tourism packages',
                address: '37, Mahatma Gandhi Road, Nungambakkam, Chennai - 600034',
                distanceFromHospital: 2.5, pricePerNight: 180,
                amenities: JSON.stringify(['WiFi', 'Restaurant', 'Spa', 'Gym', 'Medical Concierge', 'Airport Transfer']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']),
                rating: 4.8, reviewCount: 1250, contactPhone: '+91-44-6600-2827',
                contactEmail: 'reservations.coromandel@tajhotels.com', isPartner: true
            },
            {
                hospitalId: 1, name: 'Apollo Guest House', type: 'guest_house',
                description: 'Hospital-affiliated guest house with medical facilities and patient care',
                address: 'Near Apollo Hospitals, Greams Road, Chennai - 600006',
                distanceFromHospital: 0.2, pricePerNight: 60,
                amenities: JSON.stringify(['WiFi', 'Meals', 'Medical Support', 'Laundry', 'Pharmacy Access']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']),
                rating: 4.2, reviewCount: 890, contactPhone: '+91-44-2829-4444',
                contactEmail: 'guesthouse@apollohospitals.com', isPartner: true
            },
            {
                hospitalId: 2, name: 'Marriott Gurgaon', type: 'business_hotel',
                description: 'Modern business hotel with excellent connectivity and medical tourism services',
                address: 'MG Road, Gurgaon, Haryana - 122002',
                distanceFromHospital: 1.8, pricePerNight: 120,
                amenities: JSON.stringify(['WiFi', 'Business Center', 'Restaurant', 'Gym', 'Medical Assistance']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800']),
                rating: 4.5, reviewCount: 2100, contactPhone: '+91-124-459-5000',
                contactEmail: 'reservations.gurgaon@marriott.com', isPartner: true
            },
            {
                hospitalId: 3, name: 'Radisson Blu Delhi', type: 'luxury_hotel',
                description: 'Premium hotel with specialized medical tourism packages and concierge services',
                address: 'Paschim Vihar, New Delhi - 110063',
                distanceFromHospital: 3.2, pricePerNight: 150,
                amenities: JSON.stringify(['WiFi', 'Multiple Restaurants', 'Spa', 'Pool', 'Medical Concierge', 'Translation Services']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800']),
                rating: 4.6, reviewCount: 1800, contactPhone: '+91-11-4252-5252',
                contactEmail: 'reservations.delhi@radissonblu.com', isPartner: true
            }
        ];

        for (const accommodation of accommodations) {
            await db.query(`
                INSERT INTO accommodation_options (
                    hospitalId, name, type, description, address, distanceFromHospital,
                    pricePerNight, amenities, images, rating, reviewCount,
                    contactPhone, contactEmail, isPartner
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
                accommodation.hospitalId, accommodation.name, accommodation.type,
                accommodation.description, accommodation.address, accommodation.distanceFromHospital,
                accommodation.pricePerNight, accommodation.amenities, accommodation.images,
                accommodation.rating, accommodation.reviewCount, accommodation.contactPhone,
                accommodation.contactEmail, accommodation.isPartner
            ]);
        }
        console.log('Accommodation options seeded successfully.');
    }
}

// Seed accommodation rooms
async function seedAccommodationRooms(db) {
    const roomCount = await db.query('SELECT COUNT(*) as count FROM accommodation_rooms');
    if (roomCount.rows[0].count === 0) {
        console.log('Seeding accommodation rooms...');
        const roomTypes = [
            // Taj Coromandel Chennai (accommodationId: 1)
            {
                accommodationId: 1, roomType: 'Deluxe Room', description: 'Elegant room with premium amenities and city views',
                maxOccupancy: 2, pricePerNight: 180, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Spa Access', 'City View'])
            },
            {
                accommodationId: 1, roomType: 'Executive Suite', description: 'Spacious suite with separate living area and premium services',
                maxOccupancy: 3, pricePerNight: 280, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Spa Access', 'Living Area', 'Executive Lounge', 'Butler Service'])
            },
            {
                accommodationId: 1, roomType: 'Presidential Suite', description: 'Luxury presidential suite with panoramic views and exclusive services',
                maxOccupancy: 4, pricePerNight: 500, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Spa Access', 'Living Area', 'Executive Lounge', 'Butler Service', 'Panoramic View', 'Private Chef'])
            },

            // Apollo Guest House (accommodationId: 2)
            {
                accommodationId: 2, roomType: 'Standard Room', description: 'Comfortable room with basic amenities',
                maxOccupancy: 2, pricePerNight: 60, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'])
            },
            {
                accommodationId: 2, roomType: 'Deluxe Room', description: 'Spacious room with premium amenities',
                maxOccupancy: 3, pricePerNight: 90, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Room Service'])
            },
            {
                accommodationId: 2, roomType: 'Suite', description: 'Luxury suite with separate living area',
                maxOccupancy: 4, pricePerNight: 140, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Room Service', 'Living Area', 'Balcony'])
            },

            // Marriott Gurgaon (accommodationId: 3)
            {
                accommodationId: 3, roomType: 'Business Room', description: 'Modern room designed for business travelers',
                maxOccupancy: 2, pricePerNight: 120, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Work Desk', 'Coffee Maker', 'Gym Access'])
            },
            {
                accommodationId: 3, roomType: 'Executive Suite', description: 'Executive suite with premium business amenities',
                maxOccupancy: 3, pricePerNight: 180, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Work Desk', 'Coffee Maker', 'Gym Access', 'Executive Lounge', 'Room Service'])
            },
            {
                accommodationId: 3, roomType: 'Presidential Suite', description: 'Luxury presidential suite with panoramic views',
                maxOccupancy: 4, pricePerNight: 350, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Work Desk', 'Coffee Maker', 'Gym Access', 'Executive Lounge', 'Room Service', 'Panoramic View', 'Butler Service'])
            },

            // Radisson Blu Delhi (accommodationId: 4)
            {
                accommodationId: 4, roomType: 'Classic Room', description: 'Elegant room with city views',
                maxOccupancy: 2, pricePerNight: 150, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'City View', 'Mini Bar', 'Spa Access'])
            },
            {
                accommodationId: 4, roomType: 'Deluxe Suite', description: 'Spacious suite with premium amenities',
                maxOccupancy: 3, pricePerNight: 220, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'City View', 'Mini Bar', 'Spa Access', 'Separate Living Area', 'Room Service'])
            },
            {
                accommodationId: 4, roomType: 'Royal Suite', description: 'Royal suite with luxury amenities and services',
                maxOccupancy: 4, pricePerNight: 450, currency: 'USD',
                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'City View', 'Mini Bar', 'Spa Access', 'Separate Living Area', 'Room Service', 'Private Butler', 'Jacuzzi'])
            }
        ];

        for (const room of roomTypes) {
            await db.query(`
                INSERT INTO accommodation_rooms (
                    accommodationId, roomType, description, maxOccupancy,
                    pricePerNight, currency, amenities
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                room.accommodationId, room.roomType, room.description,
                room.maxOccupancy, room.pricePerNight, room.currency, room.amenities
            ]);
        }
        console.log('Accommodation rooms seeded successfully.');
    }
}

// Seed transportation services
async function seedTransportationServices(db) {
    const transportCount = await db.query('SELECT COUNT(*) as count FROM transportation_services');
    if (transportCount.rows[0].count === 0) {
        console.log('Seeding transportation services...');
        const transportServices = [
            {
                serviceType: 'airport_transfer', providerName: 'MediCab India',
                description: 'Specialized medical tourism airport transfer service',
                vehicleType: 'Sedan/SUV', capacity: 4,
                amenities: JSON.stringify(['AC', 'WiFi', 'Medical Kit', 'Wheelchair Access']),
                pricePerKm: 2.5, minimumCharge: 25, coverage: 'Pan India',
                contactPhone: '+91-98765-43210', contactEmail: 'bookings@medicab.in',
                rating: 4.7, reviewCount: 1500
            },
            {
                serviceType: 'hospital_shuttle', providerName: 'Apollo Transport Services',
                description: 'Hospital-affiliated shuttle service for patients and families',
                vehicleType: 'Mini Bus', capacity: 12,
                amenities: JSON.stringify(['AC', 'Medical Support', 'Comfortable Seating']),
                pricePerKm: 1.8, minimumCharge: 15, coverage: 'Chennai Metro',
                contactPhone: '+91-44-2829-5555', contactEmail: 'transport@apollohospitals.com',
                rating: 4.5, reviewCount: 890
            },
            {
                serviceType: 'local_transport', providerName: 'Comfort Cabs',
                description: 'Local transportation for medical appointments and city travel',
                vehicleType: 'Hatchback/Sedan', capacity: 4,
                amenities: JSON.stringify(['AC', 'GPS', 'English Speaking Driver']),
                pricePerKm: 1.2, minimumCharge: 10, coverage: 'Major Cities',
                contactPhone: '+91-99999-54321', contactEmail: 'book@comfortcabs.in',
                rating: 4.3, reviewCount: 2200
            }
        ];

        for (const service of transportServices) {
            await db.query(`
                INSERT INTO transportation_services (
                    serviceType, providerName, description, vehicleType, capacity,
                    amenities, pricePerKm, minimumCharge, coverage, contactPhone,
                    contactEmail, rating, reviewCount
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
                service.serviceType, service.providerName, service.description,
                service.vehicleType, service.capacity, service.amenities,
                service.pricePerKm, service.minimumCharge, service.coverage,
                service.contactPhone, service.contactEmail, service.rating, service.reviewCount
            ]);
        }
        console.log('Transportation services seeded successfully.');
    }
}

// Seed patient coordinators
async function seedPatientCoordinators(db) {
    const coordinatorCount = await db.query('SELECT COUNT(*) as count FROM patient_coordinators');
    if (coordinatorCount.rows[0].count === 0) {
        console.log('Seeding patient coordinators...');
        const coordinators = [
            {
                firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@afyaconnect.com',
                phone: '+91-98765-11111', specialization: 'Cardiology & Oncology',
                languagesSpoken: JSON.stringify(['English', 'French', 'Swahili']),
                experience: 8, rating: 4.9, reviewCount: 156,
                workingHours: '24/7 Available', timeZone: 'Asia/Kolkata',
                profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
                biography: 'Experienced patient coordinator specializing in cardiac and cancer care with 8 years in medical tourism.'
            },
            {
                firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@afyaconnect.com',
                phone: '+91-98765-22222', specialization: 'Orthopedics & Neurology',
                languagesSpoken: JSON.stringify(['English', 'Hindi', 'Mandarin']),
                experience: 6, rating: 4.8, reviewCount: 203,
                workingHours: '9 AM - 9 PM IST', timeZone: 'Asia/Kolkata',
                profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
                biography: 'Dedicated coordinator with expertise in orthopedic and neurological treatments for international patients.'
            },
            {
                firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@afyaconnect.com',
                phone: '+91-98765-33333', specialization: 'Fertility & Gynecology',
                languagesSpoken: JSON.stringify(['English', 'Hindi', 'Malayalam', 'Tamil']),
                experience: 10, rating: 4.9, reviewCount: 298,
                workingHours: '8 AM - 8 PM IST', timeZone: 'Asia/Kolkata',
                profileImage: 'https://images.unsplash.com/photo-1594824388853-d0d4c0b5e0b5?w=400',
                biography: 'Senior coordinator with extensive experience in fertility treatments and women\'s health services.'
            },
        ];

        for (const coordinator of coordinators) {
            await db.query(`
                INSERT INTO patient_coordinators (
                    firstName, lastName, email, phone, specialization, languagesSpoken,
                    experience, rating, reviewCount, workingHours, timeZone,
                    profileImage, biography
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
                coordinator.firstName, coordinator.lastName, coordinator.email,
                coordinator.phone, coordinator.specialization, coordinator.languagesSpoken,
                coordinator.experience, coordinator.rating, coordinator.reviewCount,
                coordinator.workingHours, coordinator.timeZone, coordinator.profileImage,
                coordinator.biography
            ]);
        }
        console.log('Patient coordinators seeded successfully.');
    }
}

// Seed sample testimonials
async function seedTestimonials(db) {
    const testimonialCount = await db.query('SELECT COUNT(*) as count FROM user_testimonials');
    if (testimonialCount.rows[0].count === 0) {
        console.log('Seeding sample testimonials...');
        const testimonials = [
            {
                userId: 1, // Will be created if needed
                patientName: 'John Smith',
                patientCountry: 'United States',
                patientAge: 45,
                treatmentType: 'Cardiology',
                hospitalName: 'Apollo Hospitals Chennai',
                doctorName: 'Dr. Rajesh Kumar',
                rating: 5,
                testimonialText: 'Amazing experience! The doctors were professional and the facilities were world-class. I saved over $10,000 compared to treatment in the US. The care I received was exceptional.',
                treatmentDate: '2024-06-15',
                treatmentDuration: '2 weeks',
                costSaved: 12000,
                isVerified: true,
                isApproved: true,
                isPublished: true,
                tags: JSON.stringify(['Excellent Doctors', 'Cost-Effective', 'World-Class Facilities'])
            },
            {
                userId: 1,
                patientName: 'Maria Garcia',
                patientCountry: 'Spain',
                patientAge: 38,
                treatmentType: 'Fertility Treatment',
                hospitalName: 'Max Super Speciality Hospital Delhi',
                doctorName: 'Dr. Priya Sharma',
                rating: 5,
                testimonialText: 'After years of trying, we finally had success with IVF treatment in India. The doctors were compassionate and the technology was state-of-the-art. Highly recommended!',
                treatmentDate: '2024-08-20',
                treatmentDuration: '3 weeks',
                costSaved: 15000,
                isVerified: true,
                isApproved: true,
                isPublished: true,
                tags: JSON.stringify(['Successful Treatment', 'Compassionate Care', 'Advanced Technology'])
            },
            {
                userId: 1,
                patientName: 'Ahmed Hassan',
                patientCountry: 'Egypt',
                patientAge: 52,
                treatmentType: 'Orthopedics',
                hospitalName: 'Fortis Hospital Gurgaon',
                doctorName: 'Dr. Amit Singh',
                rating: 4,
                testimonialText: 'I had knee replacement surgery and the results exceeded my expectations. The hospital staff was attentive and the recovery was smooth. Great value for money.',
                treatmentDate: '2024-07-10',
                treatmentDuration: '4 weeks',
                costSaved: 8000,
                isVerified: true,
                isApproved: true,
                isPublished: true,
                tags: JSON.stringify(['Successful Surgery', 'Good Recovery', 'Value for Money'])
            },
            {
                userId: 1,
                patientName: 'Sophie Dubois',
                patientCountry: 'France',
                patientAge: 29,
                treatmentType: 'Dermatology',
                hospitalName: 'Apollo Hospitals Chennai',
                doctorName: 'Dr. Sunita Patel',
                rating: 5,
                testimonialText: 'The dermatology treatment I received was outstanding. The doctors took time to explain everything and the results were amazing. I would definitely recommend this hospital.',
                treatmentDate: '2024-09-05',
                treatmentDuration: '1 week',
                costSaved: 5000,
                isVerified: true,
                isApproved: true,
                isPublished: true,
                tags: JSON.stringify(['Excellent Results', 'Professional Staff', 'Highly Recommended'])
            },
            {
                userId: 1,
                patientName: 'David Wilson',
                patientCountry: 'United Kingdom',
                patientAge: 61,
                treatmentType: 'Oncology',
                hospitalName: 'Max Super Speciality Hospital Delhi',
                doctorName: 'Dr. Rajesh Kumar',
                rating: 5,
                testimonialText: 'The cancer treatment I received was comprehensive and effective. The medical team was supportive throughout my journey. I am grateful for the excellent care.',
                treatmentDate: '2024-05-12',
                treatmentDuration: '8 weeks',
                costSaved: 25000,
                isVerified: true,
                isApproved: true,
                isPublished: true,
                tags: JSON.stringify(['Comprehensive Care', 'Supportive Team', 'Effective Treatment'])
            }
        ];

        for (const testimonial of testimonials) {
            await db.query(`
                INSERT INTO user_testimonials (
                    userId, patientName, patientCountry, patientAge, treatmentType,
                    hospitalName, doctorName, rating, testimonialText, treatmentDate,
                    treatmentDuration, costSaved, isVerified, isApproved, isPublished, tags
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            `, [
                testimonial.userId, testimonial.patientName, testimonial.patientCountry,
                testimonial.patientAge, testimonial.treatmentType, testimonial.hospitalName,
                testimonial.doctorName, testimonial.rating, testimonial.testimonialText,
                testimonial.treatmentDate, testimonial.treatmentDuration, testimonial.costSaved,
                testimonial.isVerified, testimonial.isApproved, testimonial.isPublished,
                testimonial.tags
            ]);
        }
        console.log('Sample testimonials seeded successfully.');
    }
}