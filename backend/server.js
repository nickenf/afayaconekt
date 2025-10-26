
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { GoogleGenAI } from "@google/genai";
import { initializeDatabase } from './database.js';
import { MOCK_TRAVEL_INFO } from './mock-data.js';
import {
    hashPassword,
    comparePassword,
    generateToken,
    authenticateToken,
    optionalAuth,
    validateRegistration,
    validateLogin,
    checkValidation
} from './auth.js';
import dotenv from 'dotenv';

dotenv.config(); // Load .env for production, .env.local for development

// --- App Setup ---
// Teach express how to handle .ts and .tsx files for the browser-based setup.
// This ensures they are sent with the 'application/javascript' MIME type.
express.static.mime.define({'application/javascript': ['ts', 'tsx']});

const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database ---
const db = await initializeDatabase();

// --- Security Middleware ---
app.use(helmet()); // Security headers

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // Middleware to parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- File Upload Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB limit from env
    },
    fileFilter: (req, file, cb) => {
        // Accept common image formats
        const allowedMimes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed.'), false);
        }
    }
});

// --- API Routes ---

// GET /api/hospitals - Fetch all hospitals or search
app.get('/api/hospitals', async (req, res) => {
    try {
        const query = req.query.q;
        // Select only the columns needed for the list view to optimize payload size.
        const columns = 'id, name, specialties, imageUrl, city, description, averageRating, ratingCount';
        if (query) {
            const hospitals = await db.query(
                `SELECT ${columns} FROM hospitals WHERE name ILIKE $1 OR specialties ILIKE $1 OR city ILIKE $1`,
                [`%${query}%`]
            );
            hospitals = hospitals.rows;
            res.json(hospitals);
        } else {
            const hospitals = await db.query(`SELECT ${columns} FROM hospitals`);
            res.json(hospitals.rows);
        }
    } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        res.status(500).json({ error: 'Failed to fetch hospital data' });
    }
});

// GET /api/hospitals/:id - Fetch full details for a single hospital by ID (for admin editing)
app.get('/api/hospitals/:id', async (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const result = await db.query('SELECT * FROM hospitals WHERE id = $1', [hospitalId]);
        const hospital = result.rows[0];

        if (hospital) {
            // Parse JSON fields before sending
            hospital.accreditations = JSON.parse(hospital.accreditations || '[]');
            hospital.gallery = JSON.parse(hospital.gallery || '[]');
            hospital.languagesSpoken = JSON.parse(hospital.languagesSpoken || '[]');
            hospital.insuranceAccepted = JSON.parse(hospital.insuranceAccepted || '[]');
            hospital.paymentMethods = JSON.parse(hospital.paymentMethods || '[]');
            hospital.accommodationPartners = JSON.parse(hospital.accommodationPartners || '[]');
            hospital.dietaryServices = JSON.parse(hospital.dietaryServices || '[]');
            res.json(hospital);
        } else {
            res.status(404).json({ error: 'Hospital not found' });
        }
    } catch (error) {
        console.error('Failed to fetch hospital details:', error);
        res.status(500).json({ error: 'Failed to fetch hospital details' });
    }
});

// GET /api/hospitals/advanced-search - Advanced hospital search with filters
app.get('/api/hospitals/advanced-search', async (req, res) => {
    console.log('Advanced search called with params:', req.query);
    try {
        const {
            specialty, treatment, hospitalName, city, district, state, priceRange, accreditation,
            services, minRating, sortBy = 'rating', limit = 20
        } = req.query;

        let query = `
            SELECT h.*,
                   COUNT(DISTINCT d.id) as doctorCount,
                   GROUP_CONCAT(DISTINCT ms.name) as availableSpecialties
            FROM hospitals h
            LEFT JOIN doctors d ON h.id = d.hospitalId
            LEFT JOIN medical_specialties ms ON d.specialtyId = ms.id
            WHERE 1=1
        `;
        const params = [];

        if (specialty) {
            query += ' AND h.specialties LIKE ?';
            params.push(`%${specialty}%`);
        }

        if (treatment) {
            query += ' AND (h.specialties LIKE ? OR h.description LIKE ?)';
            params.push(`%${treatment}%`, `%${treatment}%`);
        }

        if (hospitalName) {
            query += ' AND h.name LIKE ?';
            params.push(`%${hospitalName}%`);
        }

        if (city) {
            query += ' AND h.city LIKE ?';
            params.push(`%${city}%`);
        }

        if (district) {
            query += ' AND (h.city LIKE ? OR h.state LIKE ?)';
            params.push(`%${district}%`, `%${district}%`);
        }

        if (state) {
            query += ' AND h.state LIKE ?';
            params.push(`%${state}%`);
        }

        if (priceRange) {
            query += ' AND h.priceRange = ?';
            params.push(priceRange);
        }

        if (accreditation) {
            query += ' AND h.accreditations LIKE ?';
            params.push(`%${accreditation}%`);
        }

        if (minRating) {
            query += ' AND h.averageRating >= ?';
            params.push(parseFloat(minRating));
        }

        query += ' GROUP BY h.id';

        // Add sorting
        switch (sortBy) {
            case 'rating':
                query += ' ORDER BY h.averageRating DESC, h.ratingCount DESC';
                break;
            case 'price_low':
                query += ' ORDER BY h.priceRange ASC, h.averageRating DESC';
                break;
            case 'price_high':
                query += ' ORDER BY h.priceRange DESC, h.averageRating DESC';
                break;
            case 'name':
                query += ' ORDER BY h.name ASC';
                break;
            default:
                query += ' ORDER BY h.averageRating DESC';
        }

        query += ' LIMIT ?';
        params.push(parseInt(limit));

        const hospitals = await db.all(query, ...params);

        // Parse JSON fields
        hospitals.forEach(hospital => {
            try {
                if (hospital.accreditations && typeof hospital.accreditations === 'string') {
                    hospital.accreditations = JSON.parse(hospital.accreditations);
                } else if (!hospital.accreditations) {
                    hospital.accreditations = [];
                }
                if (hospital.gallery && typeof hospital.gallery === 'string') {
                    hospital.gallery = JSON.parse(hospital.gallery);
                } else if (!hospital.gallery) {
                    hospital.gallery = [];
                }
                if (hospital.languagesSpoken && typeof hospital.languagesSpoken === 'string') {
                    hospital.languagesSpoken = JSON.parse(hospital.languagesSpoken);
                } else if (!hospital.languagesSpoken) {
                    hospital.languagesSpoken = [];
                }
                if (hospital.insuranceAccepted && typeof hospital.insuranceAccepted === 'string') {
                    hospital.insuranceAccepted = JSON.parse(hospital.insuranceAccepted);
                } else if (!hospital.insuranceAccepted) {
                    hospital.insuranceAccepted = [];
                }
                if (hospital.paymentMethods && typeof hospital.paymentMethods === 'string') {
                    hospital.paymentMethods = JSON.parse(hospital.paymentMethods);
                } else if (!hospital.paymentMethods) {
                    hospital.paymentMethods = [];
                }
            } catch (parseError) {
                console.error('Error parsing JSON fields for hospital:', hospital.id, parseError);
                // Set defaults if parsing fails
                hospital.accreditations = [];
                hospital.gallery = [];
                hospital.languagesSpoken = [];
                hospital.insuranceAccepted = [];
                hospital.paymentMethods = [];
            }
        });

        res.json(hospitals);
    } catch (error) {
        console.error('Failed to perform advanced search:', error);
        res.status(500).json({ error: 'Failed to perform advanced search' });
    }
});

// GET /api/hospitals/:name - Fetch details for a single hospital (legacy endpoint)
app.get('/api/hospitals/name/:name', async (req, res) => {
    try {
        const hospitalName = req.params.name;
        const result = await db.query('SELECT * FROM hospitals WHERE name = $1', [hospitalName]);
        const hospital = result.rows[0];

        if (hospital) {
            // Parse JSON fields before sending
            hospital.accreditations = JSON.parse(hospital.accreditations || '[]');
            hospital.gallery = JSON.parse(hospital.gallery || '[]');
            res.json(hospital);
        } else {
            res.status(404).json({ error: 'Hospital not found' });
        }
    } catch (error) {
        console.error('Failed to fetch hospital details:', error);
        res.status(500).json({ error: 'Failed to fetch hospital details' });
    }
});

// POST /api/hospitals - Create a new hospital
app.post('/api/hospitals', async (req, res) => {
    try {
        const {
            name, specialties, imageUrl, city, state, country, description,
            accreditations, internationalPatientServices, gallery, establishedYear,
            bedCount, doctorCount, nurseCount, languagesSpoken, contactPhone,
            contactEmail, website, address, priceRange, insuranceAccepted,
            paymentMethods, accommodationPartners, dietaryServices
        } = req.body;

        if (!name || !city || !description) {
            return res.status(400).json({ error: 'Name, city, and description are required' });
        }

        // Check if hospital with same name already exists
        const existingHospital = await db.query('SELECT id FROM hospitals WHERE name = $1', [name]);
        if (existingHospital.rows.length > 0) {
            return res.status(400).json({ error: 'Hospital with this name already exists' });
        }

        const result = await db.query(`
            INSERT INTO hospitals (
                name, specialties, imageUrl, city, state, country, description,
                accreditations, internationalPatientServices, gallery, establishedYear,
                bedCount, doctorCount, nurseCount, languagesSpoken, contactPhone,
                contactEmail, website, address, priceRange, insuranceAccepted,
                paymentMethods, accommodationPartners, dietaryServices
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        `, [
            name, specialties || '', imageUrl || '', city, state || '', country || 'India', description,
            accreditations ? JSON.stringify(accreditations) : '[]',
            internationalPatientServices || '',
            gallery ? JSON.stringify(gallery) : '[]',
            establishedYear || null, bedCount || 0, doctorCount || 0, nurseCount || 0,
            languagesSpoken ? JSON.stringify(languagesSpoken) : '["English"]',
            contactPhone || '', contactEmail || '', website || '', address || '', priceRange || 'moderate',
            insuranceAccepted ? JSON.stringify(insuranceAccepted) : '[]',
            paymentMethods ? JSON.stringify(paymentMethods) : '[]',
            accommodationPartners ? JSON.stringify(accommodationPartners) : '[]',
            dietaryServices ? JSON.stringify(dietaryServices) : '[]'
        ]);

        res.status(201).json({
            success: true,
            message: 'Hospital created successfully',
            hospitalId: result.lastID
        });
    } catch (error) {
        console.error('Failed to create hospital:', error);
        res.status(500).json({ error: 'Failed to create hospital' });
    }
});

// PUT /api/hospitals/:id - Update a hospital
app.put('/api/hospitals/:id', async (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);
        const {
            name, specialties, imageUrl, city, state, country, description,
            accreditations, internationalPatientServices, gallery, establishedYear,
            bedCount, doctorCount, nurseCount, languagesSpoken, contactPhone,
            contactEmail, website, address, priceRange, insuranceAccepted,
            paymentMethods, accommodationPartners, dietaryServices
        } = req.body;

        if (!name || !city || !description) {
            return res.status(400).json({ error: 'Name, city, and description are required' });
        }

        // Check if hospital exists
        const existingHospital = await db.query('SELECT id FROM hospitals WHERE id = $1', [hospitalId]);
        if (existingHospital.rows.length === 0) {
            return res.status(404).json({ error: 'Hospital not found' });
        }

        // Check if another hospital with same name exists
        const nameConflict = await db.query('SELECT id FROM hospitals WHERE name = $1 AND id != $2', [name, hospitalId]);
        if (nameConflict.rows.length > 0) {
            return res.status(400).json({ error: 'Another hospital with this name already exists' });
        }

        await db.query(`
            UPDATE hospitals SET
                name = $1, specialties = $2, imageUrl = $3, city = $4, state = $5, country = $6, description = $7,
                accreditations = $8, internationalPatientServices = $9, gallery = $10, establishedYear = $11,
                bedCount = $12, doctorCount = $13, nurseCount = $14, languagesSpoken = $15, contactPhone = $16,
                contactEmail = $17, website = $18, address = $19, priceRange = $20, insuranceAccepted = $21,
                paymentMethods = $22, accommodationPartners = $23, dietaryServices = $24, updatedAt = CURRENT_TIMESTAMP
            WHERE id = $25
        `, [
            name, specialties, imageUrl, city, state, country || 'India', description,
            accreditations ? JSON.stringify(accreditations) : '[]',
            internationalPatientServices,
            gallery ? JSON.stringify(gallery) : '[]',
            establishedYear, bedCount, doctorCount, nurseCount,
            languagesSpoken ? JSON.stringify(languagesSpoken) : '[]',
            contactPhone, contactEmail, website, address, priceRange,
            insuranceAccepted ? JSON.stringify(insuranceAccepted) : '[]',
            paymentMethods ? JSON.stringify(paymentMethods) : '[]',
            accommodationPartners ? JSON.stringify(accommodationPartners) : '[]',
            dietaryServices ? JSON.stringify(dietaryServices) : '[]',
            hospitalId
        ]);

        res.json({
            success: true,
            message: 'Hospital updated successfully'
        });
    } catch (error) {
        console.error('Failed to update hospital:', error);
        res.status(500).json({ error: 'Failed to update hospital' });
    }
});

// DELETE /api/hospitals/:id - Delete a hospital
app.delete('/api/hospitals/:id', async (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);

        // Check if hospital exists
        const hospital = await db.query('SELECT id FROM hospitals WHERE id = $1', [hospitalId]);
        if (hospital.rows.length === 0) {
            return res.status(404).json({ error: 'Hospital not found' });
        }

        // Check if hospital has associated doctors (optional: prevent deletion if it has doctors)
        const doctorCount = await db.query('SELECT COUNT(*) as count FROM doctors WHERE hospitalId = $1', [hospitalId]);
        if (doctorCount.rows[0].count > 0) {
            return res.status(400).json({
                error: 'Cannot delete hospital with associated doctors. Please reassign or remove doctors first.'
            });
        }

        await db.query('DELETE FROM hospitals WHERE id = $1', [hospitalId]);

        res.json({
            success: true,
            message: 'Hospital deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete hospital:', error);
        res.status(500).json({ error: 'Failed to delete hospital' });
    }
});

// POST /api/doctors - Create a new doctor
app.post('/api/doctors', async (req, res) => {
    try {
        const {
            hospitalId, firstName, lastName, title, specialtyId, subSpecialties,
            qualifications, experience, imageUrl, biography, languagesSpoken,
            consultationFee, availabilitySchedule, isAvailable, telemedicineAvailable,
            contactEmail, licenseNumber, awards, publications
        } = req.body;

        if (!hospitalId || !firstName || !lastName || !specialtyId) {
            return res.status(400).json({ error: 'Hospital ID, first name, last name, and specialty ID are required' });
        }

        // Check if hospital exists
        const hospital = await db.query('SELECT id FROM hospitals WHERE id = $1', [hospitalId]);
        if (hospital.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid hospital ID' });
        }

        // Check if specialty exists
        const specialty = await db.query('SELECT id FROM medical_specialties WHERE id = $1', [specialtyId]);
        if (specialty.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid specialty ID' });
        }

        const result = await db.query(`
            INSERT INTO doctors (
                hospitalId, firstName, lastName, title, specialtyId, subSpecialties,
                qualifications, experience, imageUrl, biography, languagesSpoken,
                consultationFee, availabilitySchedule, isAvailable, telemedicineAvailable,
                contactEmail, licenseNumber, awards, publications
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
            hospitalId, firstName, lastName, title || 'Dr.', specialtyId,
            subSpecialties ? JSON.stringify(subSpecialties) : '[]',
            qualifications || '', experience || 0, imageUrl || '',
            biography || '', languagesSpoken ? JSON.stringify(languagesSpoken) : '["English"]',
            consultationFee || 0, availabilitySchedule || '', isAvailable !== false, telemedicineAvailable || false,
            contactEmail || '', licenseNumber || '', awards ? JSON.stringify(awards) : '[]',
            publications || ''
        ]);

        res.status(201).json({
            success: true,
            message: 'Doctor created successfully',
            doctorId: result.lastID
        });
    } catch (error) {
        console.error('Failed to create doctor:', error);
        res.status(500).json({ error: 'Failed to create doctor' });
    }
});

// PUT /api/doctors/:id - Update a doctor
app.put('/api/doctors/:id', async (req, res) => {
    try {
        const doctorId = parseInt(req.params.id);
        const {
            hospitalId, firstName, lastName, title, specialtyId, subSpecialties,
            qualifications, experience, imageUrl, biography, languagesSpoken,
            consultationFee, availabilitySchedule, isAvailable, telemedicineAvailable,
            contactEmail, licenseNumber, awards, publications
        } = req.body;

        if (!hospitalId || !firstName || !lastName || !specialtyId) {
            return res.status(400).json({ error: 'Hospital ID, first name, last name, and specialty ID are required' });
        }

        // Check if doctor exists
        const existingDoctor = await db.query('SELECT id FROM doctors WHERE id = $1', [doctorId]);
        if (existingDoctor.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Check if hospital exists
        const hospital = await db.query('SELECT id FROM hospitals WHERE id = $1', [hospitalId]);
        if (hospital.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid hospital ID' });
        }

        // Check if specialty exists
        const specialty = await db.query('SELECT id FROM medical_specialties WHERE id = $1', [specialtyId]);
        if (specialty.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid specialty ID' });
        }

        await db.query(`
            UPDATE doctors SET
                hospitalId = $1, firstName = $2, lastName = $3, title = $4, specialtyId = $5, subSpecialties = $6,
                qualifications = $7, experience = $8, imageUrl = $9, biography = $10, languagesSpoken = $11,
                consultationFee = $12, availabilitySchedule = $13, isAvailable = $14, telemedicineAvailable = $15,
                contactEmail = $16, licenseNumber = $17, awards = $18, publications = $19, updatedAt = CURRENT_TIMESTAMP
            WHERE id = $20
        `, [
            hospitalId, firstName, lastName, title || 'Dr.', specialtyId,
            subSpecialties ? JSON.stringify(subSpecialties) : '[]',
            qualifications || '', experience || 0, imageUrl || '',
            biography || '', languagesSpoken ? JSON.stringify(languagesSpoken) : '["English"]',
            consultationFee || 0, availabilitySchedule || '', isAvailable !== false, telemedicineAvailable || false,
            contactEmail || '', licenseNumber || '', awards ? JSON.stringify(awards) : '[]',
            publications || '', doctorId
        ]);

        res.json({
            success: true,
            message: 'Doctor updated successfully'
        });
    } catch (error) {
        console.error('Failed to update doctor:', error);
        res.status(500).json({ error: 'Failed to update doctor' });
    }
});

// DELETE /api/doctors/:id - Delete a doctor
app.delete('/api/doctors/:id', async (req, res) => {
    try {
        const doctorId = parseInt(req.params.id);

        // Check if doctor exists
        const doctor = await db.get('SELECT id FROM doctors WHERE id = ?', doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Check if doctor has associated appointments (optional: prevent deletion if active appointments)
        const appointmentCount = await db.query('SELECT COUNT(*) as count FROM appointments WHERE doctorId = $1 AND status NOT IN (\'cancelled\', \'completed\')', [doctorId]);
        if (appointmentCount.rows[0].count > 0) {
            return res.status(400).json({
                error: 'Cannot delete doctor with active appointments. Please cancel or complete appointments first.'
            });
        }

        await db.query('DELETE FROM doctors WHERE id = $1', [doctorId]);

        res.json({
            success: true,
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete doctor:', error);
        res.status(500).json({ error: 'Failed to delete doctor' });
    }
});

// GET /api/doctors - Fetch all doctors
app.get('/api/doctors', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                d.*,
                h.name as hospitalName,
                h.city,
                h.state,
                ms.name as specialtyName
            FROM doctors d
            JOIN hospitals h ON d.hospitalId = h.id
            JOIN medical_specialties ms ON d.specialtyId = ms.id
            ORDER BY d.firstName, d.lastName
        `);
        const doctors = result.rows;

        // Parse JSON fields
        doctors.forEach(doctor => {
            if (doctor.languagesSpoken) {
                doctor.languagesSpoken = JSON.parse(doctor.languagesSpoken);
            } else {
                doctor.languagesSpoken = [];
            }
            if (doctor.subSpecialties) {
                doctor.subSpecialties = JSON.parse(doctor.subSpecialties);
            } else {
                doctor.subSpecialties = [];
            }
            if (doctor.awards) {
                doctor.awards = JSON.parse(doctor.awards);
            } else {
                doctor.awards = [];
            }
        });

        res.json(doctors);
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

// GET /api/doctors/:id - Fetch a single doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
    try {
        const doctorId = parseInt(req.params.id);
        const result = await db.query(`
            SELECT
                d.*,
                h.name as hospitalName,
                h.city,
                h.state,
                ms.name as specialtyName
            FROM doctors d
            JOIN hospitals h ON d.hospitalId = h.id
            JOIN medical_specialties ms ON d.specialtyId = ms.id
            WHERE d.id = $1
        `, [doctorId]);
        const doctor = result.rows[0];

        if (doctor) {
            // Parse JSON fields
            if (doctor.languagesSpoken) {
                doctor.languagesSpoken = JSON.parse(doctor.languagesSpoken);
            } else {
                doctor.languagesSpoken = [];
            }
            if (doctor.subSpecialties) {
                doctor.subSpecialties = JSON.parse(doctor.subSpecialties);
            } else {
                doctor.subSpecialties = [];
            }
            if (doctor.awards) {
                doctor.awards = JSON.parse(doctor.awards);
            } else {
                doctor.awards = [];
            }
            res.json(doctor);
        } else {
            res.status(404).json({ error: 'Doctor not found' });
        }
    } catch (error) {
        console.error('Failed to fetch doctor:', error);
        res.status(500).json({ error: 'Failed to fetch doctor' });
    }
});

// POST /api/appointments - Create a new appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            doctorId, appointmentDate, appointmentTime, duration = 30,
            notes, isTelemedicine = false, meetingLink
        } = req.body;

        if (!doctorId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ error: 'Doctor ID, appointment date, and time are required' });
        }

        // Get doctor details to get hospitalId and consultationFee
        const doctor = await db.get('SELECT hospitalId, consultationFee FROM doctors WHERE id = ?', doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Check if doctor is available
        if (!doctor.rows[0].isAvailable) {
            return res.status(400).json({ error: 'Doctor is not currently available' });
        }

        // Check for conflicting appointments
        const conflictingAppointment = await db.query(`
            SELECT id FROM appointments
            WHERE doctorId = $1 AND appointmentDate = $2 AND appointmentTime = $3 AND status NOT IN ('cancelled', 'completed')
        `, [doctorId, appointmentDate, appointmentTime]);

        if (conflictingAppointment.rows.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked' });
        }

        const result = await db.query(`
            INSERT INTO appointments (
                userId, doctorId, hospitalId, appointmentType, appointmentDate, appointmentTime,
                duration, status, notes, consultationFee, isTelemedicine, meetingLink
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [userId, doctorId, doctor.rows[0].hospitalId, 'consultation', appointmentDate, appointmentTime,
           duration, 'scheduled', notes || '', doctor.rows[0].consultationFee, isTelemedicine, meetingLink || '']);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointmentId: result.rows[0].id
        });
    } catch (error) {
        console.error('Failed to create appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// POST /api/appointments - Create a new appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const {
            doctorId, appointmentDate, appointmentTime, duration = 30,
            notes, isTelemedicine = false, meetingLink
        } = req.body;

        if (!doctorId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ error: 'Doctor ID, appointment date, and time are required' });
        }

        // Get doctor details to get hospitalId and consultationFee
        const doctor = await db.query('SELECT hospitalId, consultationFee FROM doctors WHERE id = $1', [doctorId]);
        if (doctor.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Check if doctor is available
        if (!doctor.rows[0].isAvailable) {
            return res.status(400).json({ error: 'Doctor is not currently available' });
        }

        // Check for conflicting appointments
        const conflictingAppointment = await db.query(`
            SELECT id FROM appointments
            WHERE doctorId = $1 AND appointmentDate = $2 AND appointmentTime = $3 AND status NOT IN ('cancelled', 'completed')
        `, [doctorId, appointmentDate, appointmentTime]);

        if (conflictingAppointment.rows.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked' });
        }

        const userId = 1; // Default user for testing

        const result = await db.query(`
            INSERT INTO appointments (
                userId, doctorId, hospitalId, appointmentType, appointmentDate, appointmentTime,
                duration, status, notes, consultationFee, isTelemedicine, meetingLink
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [userId, doctorId, doctor.rows[0].hospitalId, 'consultation', appointmentDate, appointmentTime,
           duration, 'scheduled', notes || '', doctor.rows[0].consultationFee, isTelemedicine, meetingLink || '']);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointmentId: result.rows[0].id
        });
    } catch (error) {
        console.error('Failed to create appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// GET /api/specialties - Fetch all medical specialties
app.get('/api/specialties', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, description, icon, category FROM medical_specialties WHERE isActive = true ORDER BY name');
        const specialties = result.rows;
        res.json(specialties);
    } catch (error) {
        console.error('Failed to fetch specialties:', error);
        res.status(500).json({ error: 'Failed to fetch specialties' });
    }
});

// POST /api/hospitals/upload-image - Upload hospital image
app.post('/api/hospitals/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Failed to upload image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});


// POST /api/chat - Handle chatbot messages
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Mock response for chat without using Gemini API
        const mockResponse = "Hello! I'm a mock chatbot response. For real medical advice, please consult with a doctor by submitting an inquiry to a hospital.";
        res.json({ response: mockResponse });

    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({ error: 'Failed to get response from assistant' });
    }
});

// GET /api/travel-info - Fetch travel support information
app.get('/api/travel-info', (req, res) => {
    res.json(MOCK_TRAVEL_INFO);
});

// GET /api/statistics - Fetch success statistics
app.get('/api/statistics', async (req, res) => {
    try {
        // Get total successful treatments (completed appointments)
        const treatmentsResult = await db.query(`
            SELECT COUNT(*) as count FROM appointments
            WHERE status = 'completed'
        `);

        // Get total partner hospitals
        const hospitalsResult = await db.query(`
            SELECT COUNT(*) as count FROM hospitals
        `);

        // Get total registered patients
        const patientsResult = await db.query(`
            SELECT COUNT(*) as count FROM users
            WHERE role = 'patient'
        `);

        // Get success rate and total savings from published testimonials
        const testimonialsResult = await db.query(`
            SELECT
                COUNT(*) as totalTestimonials,
                AVG(rating) as averageRating,
                SUM(costSaved) as totalSavings
            FROM user_testimonials
            WHERE isPublished = TRUE
        `);

        console.log('Testimonials result:', testimonialsResult);

        // Get total expert doctors
        const doctorsResult = await db.query(`
            SELECT COUNT(*) as count FROM doctors
            WHERE isAvailable = TRUE
        `);

        // Get total patient coordinators
        const coordinatorsResult = await db.query(`
            SELECT COUNT(*) as count FROM patient_coordinators
            WHERE isAvailable = TRUE
        `);

        // Calculate success rate (convert to percentage)
        const successRate = testimonialsResult.rows[0].totaltestimonials > 0
            ? Math.round((testimonialsResult.rows[0].averagerating || 0) * 20) // Convert 4.8 rating to 96%
            : 98.5; // Default fallback

        const statistics = {
            successfulTreatments: treatmentsResult.rows[0].count || 2500,
            partnerHospitals: hospitalsResult.rows[0].count || 150,
            registeredPatients: patientsResult.rows[0].count || 2500,
            successRate: successRate,
            expertDoctors: doctorsResult.rows[0].count || 500,
            patientCoordinators: coordinatorsResult.rows[0].count || 50,
            supportAvailable: '24/7',
            totalSavings: testimonialsResult.rows[0].totalsavings || 2800000
        };

        res.json(statistics);
    } catch (error) {
        console.error('Failed to fetch statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// POST /api/inquiries - Submit a new patient inquiry
app.post('/api/inquiries', async (req, res) => {
    const { hospitalName, patientName, patientEmail, message } = req.body;
    if (!hospitalName || !patientName || !patientEmail || !message) {
        return res.status(400).json({ error: 'Missing required inquiry fields' });
    }

    try {
        const submittedAt = new Date().toISOString();
        const result = await db.query(
            'INSERT INTO inquiries (hospitalName, patientName, patientEmail, message, submittedAt) VALUES ($1, $2, $3, $4, $5)',
            [hospitalName, patientName, patientEmail, message, submittedAt]
        );
        res.status(201).json({ success: true, id: result.lastID });
    } catch (error) {
        console.error('Failed to submit inquiry:', error);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
});

// GET /api/inquiries - Fetch all inquiries for admin dashboard
app.get('/api/inquiries', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM inquiries ORDER BY submittedAt DESC');
        const inquiries = result.rows;
        res.json(inquiries);
    } catch (error) {
        console.error('Failed to fetch inquiries:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

// POST /api/hospitals/:id/ratings - Submit a rating for a hospital
app.post('/api/hospitals/:id/ratings', async (req, res) => {
    const hospitalId = parseInt(req.params.id, 10);
    const { rating } = req.body;

    if (!hospitalId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'A valid hospital ID and a rating between 1 and 5 are required.' });
    }

    try {
        await db.exec('BEGIN TRANSACTION');

        const hospital = await db.query('SELECT averageRating, ratingCount FROM hospitals WHERE id = $1', [hospitalId]);
        if (hospital.rows.length === 0) {
            await db.exec('ROLLBACK');
            return res.status(404).json({ error: 'Hospital not found' });
        }

        const { averagerating, ratingcount } = hospital.rows[0];
        const newRatingCount = ratingcount + 1;
        const newAverageRating = ((averagerating * ratingcount) + rating) / newRatingCount;

        await db.query(
            'UPDATE hospitals SET averageRating = $1, ratingCount = $2 WHERE id = $3',
            [newAverageRating, newRatingCount, hospitalId]
        );
        
        await db.exec('COMMIT');
        
        res.status(201).json({ success: true, newAverageRating: newAverageRating, newRatingCount });

    } catch (error) {
        await db.exec('ROLLBACK');
        console.error('Failed to submit rating:', error);
        res.status(500).json({ error: 'Failed to submit rating.' });
    }
});

// --- Authentication Routes ---

// POST /api/auth/register - User registration
app.post('/api/auth/register', validateRegistration, checkValidation, async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, dateOfBirth, country } = req.body;

        // Check if user already exists
        const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const result = await db.query(
            `INSERT INTO users (email, password_hash, firstName, lastName, phone, dateOfBirth, country, createdAt, updatedAt)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [email, hashedPassword, firstName, lastName, phone || null, dateOfBirth || null, country || null]
        );

        // Generate token
        const token = generateToken(result.lastID, email, 'patient');

        // Return user data (without password)
        const user = await db.query(
            'SELECT id, email, firstName, lastName, phone, dateOfBirth, country, role, isVerified, createdAt FROM users WHERE id = $1',
            [result.rows[0].id]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// POST /api/auth/login - User login
app.post('/api/auth/login', validateLogin, checkValidation, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isValidPassword = await comparePassword(password, user.rows[0].password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user.rows[0].id, user.rows[0].email, user.rows[0].role);

        // Return user data (without password)
        const { password_hash: _, ...userWithoutPassword } = user.rows[0];

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// GET /api/auth/profile - Get user profile (protected route)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.query(
            'SELECT id, email, firstName, lastName, phone, dateOfBirth, country, role, isVerified, createdAt FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: user.rows[0] });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/auth/profile - Update user profile (protected route)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, dateOfBirth, country } = req.body;
        const userId = req.user.userId;

        await db.query(
            `UPDATE users SET firstName = $1, lastName = $2, phone = $3, dateOfBirth = $4, country = $5, updatedAt = CURRENT_TIMESTAMP
             WHERE id = $6`,
            [firstName, lastName, phone || null, dateOfBirth || null, country || null, userId]
        );

        // Return updated user data
        const user = await db.query(
            'SELECT id, email, firstName, lastName, phone, dateOfBirth, country, role, isVerified, createdAt FROM users WHERE id = $1',
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user.rows[0]
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST /api/auth/change-password - Change password (protected route)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Get current user
        const user = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await comparePassword(currentPassword, user.rows[0].password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password
        await db.query(
            'UPDATE users SET password_hash = $1, updatedAt = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedNewPassword, userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// --- Medical Tourism API Routes ---

// GET /api/specialties - Fetch all medical specialties
app.get('/api/specialties', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM medical_specialties WHERE isActive = TRUE ORDER BY name');
        const specialties = result.rows;
        res.json(specialties);
    } catch (error) {
        console.error('Failed to fetch specialties:', error);
        res.status(500).json({ error: 'Failed to fetch medical specialties' });
    }
});

// GET /api/treatments - Fetch treatments by specialty
app.get('/api/treatments', async (req, res) => {
    try {
        const { specialtyId } = req.query;
        let query = `
            SELECT t.*, ms.name as specialtyName
            FROM treatments t
            JOIN medical_specialties ms ON t.specialtyId = ms.id
            WHERE t.isActive = TRUE
        `;
        const params = [];

        if (specialtyId) {
            query += ' AND t.specialtyId = ?';
            params.push(specialtyId);
        }

        query += ' ORDER BY t.name';
        const treatments = await db.all(query, ...params);
        res.json(treatments);
    } catch (error) {
        console.error('Failed to fetch treatments:', error);
        res.status(500).json({ error: 'Failed to fetch treatments' });
    }
});

// GET /api/doctors - Fetch doctors with filtering
app.get('/api/doctors', async (req, res) => {
    try {
        const { hospitalId, specialtyId, limit = 50 } = req.query;
        let query = `
            SELECT d.*, h.name as hospitalName, ms.name as specialtyName
            FROM doctors d
            JOIN hospitals h ON d.hospitalId = h.id
            JOIN medical_specialties ms ON d.specialtyId = ms.id
            WHERE d.isAvailable = TRUE
        `;
        const params = [];

        if (hospitalId) {
            query += ' AND d.hospitalId = ?';
            params.push(hospitalId);
        }

        if (specialtyId) {
            query += ' AND d.specialtyId = ?';
            params.push(specialtyId);
        }

        query += ' ORDER BY d.rating DESC, d.experience DESC LIMIT ?';
        params.push(parseInt(limit));

        const result = await db.query(query, params);
        const doctors = result.rows;
        
        // Parse JSON fields
        doctors.forEach(doctor => {
            if (doctor.languagesSpoken) {
                doctor.languagesSpoken = JSON.parse(doctor.languagesSpoken);
            }
            if (doctor.subSpecialties) {
                doctor.subSpecialties = JSON.parse(doctor.subSpecialties || '[]');
            }
            if (doctor.awards) {
                doctor.awards = JSON.parse(doctor.awards || '[]');
            }
        });

        res.json(doctors);
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

// GET /api/doctors/:id - Fetch doctor details
app.get('/api/doctors/:id', async (req, res) => {
    try {
        const doctorId = parseInt(req.params.id);
        const result = await db.query(`
            SELECT d.*, h.name as hospitalName, h.city, h.state, ms.name as specialtyName
            FROM doctors d
            JOIN hospitals h ON d.hospitalId = h.id
            JOIN medical_specialties ms ON d.specialtyId = ms.id
            WHERE d.id = $1
        `, [doctorId]);
        const doctor = result.rows[0];

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Parse JSON fields
        if (doctor.languagesSpoken) {
            doctor.languagesSpoken = JSON.parse(doctor.languagesSpoken);
        }
        if (doctor.subSpecialties) {
            doctor.subSpecialties = JSON.parse(doctor.subSpecialties || '[]');
        }
        if (doctor.awards) {
            doctor.awards = JSON.parse(doctor.awards || '[]');
        }

        // Get doctor reviews
        const reviewResult = await db.query(`
            SELECT * FROM doctor_reviews
            WHERE doctorId = $1 AND isVerified = TRUE
            ORDER BY createdAt DESC LIMIT 10
        `, [doctorId]);
        const reviews = reviewResult.rows;

        doctor.reviews = reviews;
        res.json(doctor);
    } catch (error) {
        console.error('Failed to fetch doctor details:', error);
        res.status(500).json({ error: 'Failed to fetch doctor details' });
    }
});

// GET /api/search/hospitals - Advanced hospital search with filters
app.get('/api/search/hospitals', async (req, res) => {
    try {
        const {
            specialty, treatment, hospitalName, city, district, state, priceRange, accreditation,
            services, minRating, sortBy = 'rating', limit = 20
        } = req.query;

        let query = `
            SELECT h.*,
                   COUNT(DISTINCT d.id) as doctorCount,
                   GROUP_CONCAT(DISTINCT ms.name) as availableSpecialties
            FROM hospitals h
            LEFT JOIN doctors d ON h.id = d.hospitalId
            LEFT JOIN medical_specialties ms ON d.specialtyId = ms.id
            WHERE 1=1
        `;
        const params = [];

        if (specialty) {
            query += ' AND h.specialties LIKE ?';
            params.push(`%${specialty}%`);
        }

        if (treatment) {
            query += ' AND (h.specialties LIKE ? OR h.description LIKE ?)';
            params.push(`%${treatment}%`, `%${treatment}%`);
        }

        if (hospitalName) {
            query += ' AND h.name LIKE ?';
            params.push(`%${hospitalName}%`);
        }

        if (city) {
            query += ' AND h.city LIKE ?';
            params.push(`%${city}%`);
        }

        if (district) {
            query += ' AND (h.city LIKE ? OR h.state LIKE ?)';
            params.push(`%${district}%`, `%${district}%`);
        }

        if (state) {
            query += ' AND h.state LIKE ?';
            params.push(`%${state}%`);
        }

        if (priceRange) {
            query += ' AND h.priceRange = ?';
            params.push(priceRange);
        }

        if (accreditation) {
            query += ' AND h.accreditations LIKE ?';
            params.push(`%${accreditation}%`);
        }

        if (minRating) {
            query += ' AND h.averageRating >= ?';
            params.push(parseFloat(minRating));
        }

        query += ' GROUP BY h.id';

        // Add sorting
        switch (sortBy) {
            case 'rating':
                query += ' ORDER BY h.averageRating DESC, h.ratingCount DESC';
                break;
            case 'price_low':
                query += ' ORDER BY h.priceRange ASC, h.averageRating DESC';
                break;
            case 'price_high':
                query += ' ORDER BY h.priceRange DESC, h.averageRating DESC';
                break;
            case 'name':
                query += ' ORDER BY h.name ASC';
                break;
            default:
                query += ' ORDER BY h.averageRating DESC';
        }

        query += ' LIMIT ?';
        params.push(parseInt(limit));

        const result = await db.query(query, params);
        const hospitals = result.rows;

        // Parse JSON fields
        hospitals.forEach(hospital => {
            try {
                if (hospital.accreditations && typeof hospital.accreditations === 'string') {
                    hospital.accreditations = JSON.parse(hospital.accreditations);
                } else if (!hospital.accreditations) {
                    hospital.accreditations = [];
                }
                if (hospital.gallery && typeof hospital.gallery === 'string') {
                    hospital.gallery = JSON.parse(hospital.gallery);
                } else if (!hospital.gallery) {
                    hospital.gallery = [];
                }
                if (hospital.languagesSpoken && typeof hospital.languagesSpoken === 'string') {
                    hospital.languagesSpoken = JSON.parse(hospital.languagesSpoken);
                } else if (!hospital.languagesSpoken) {
                    hospital.languagesSpoken = [];
                }
                if (hospital.insuranceAccepted && typeof hospital.insuranceAccepted === 'string') {
                    hospital.insuranceAccepted = JSON.parse(hospital.insuranceAccepted);
                } else if (!hospital.insuranceAccepted) {
                    hospital.insuranceAccepted = [];
                }
                if (hospital.paymentMethods && typeof hospital.paymentMethods === 'string') {
                    hospital.paymentMethods = JSON.parse(hospital.paymentMethods);
                } else if (!hospital.paymentMethods) {
                    hospital.paymentMethods = [];
                }
            } catch (parseError) {
                console.error('Error parsing JSON fields for hospital:', hospital.id, parseError);
                // Set defaults if parsing fails
                hospital.accreditations = [];
                hospital.gallery = [];
                hospital.languagesSpoken = [];
                hospital.insuranceAccepted = [];
                hospital.paymentMethods = [];
            }
        });

        res.json(hospitals);
    } catch (error) {
        console.error('Failed to perform advanced search:', error);
        res.status(500).json({ error: 'Failed to perform advanced search' });
    }
});

// GET /api/treatments/cost-estimate - Get treatment cost estimates
app.get('/api/treatments/cost-estimate', async (req, res) => {
    try {
        const { treatmentId, hospitalId } = req.query;

        if (!treatmentId) {
            return res.status(400).json({ error: 'Treatment ID is required' });
        }

        let query = `
            SELECT t.name as treatmentName, t.averageCost, t.costRange, t.duration, t.recoveryTime,
                   ht.cost as hospitalCost, ht.costCurrency, ht.waitingTime,
                   h.name as hospitalName, h.city, h.priceRange
            FROM treatments t
            LEFT JOIN hospital_treatments ht ON t.id = ht.treatmentId
            LEFT JOIN hospitals h ON ht.hospitalId = h.id
            WHERE t.id = ?
        `;
        const params = [treatmentId];

        if (hospitalId) {
            query += ' AND h.id = ?';
            params.push(hospitalId);
        }

        query += ' AND (ht.isAvailable = TRUE OR ht.isAvailable IS NULL)';

        const estimates = await db.all(query, ...params);

        if (estimates.length === 0) {
            return res.status(404).json({ error: 'Treatment not found' });
        }

        res.json(estimates);
    } catch (error) {
        console.error('Failed to get cost estimates:', error);
        res.status(500).json({ error: 'Failed to get cost estimates' });
    }
});

// POST /api/doctors/:id/reviews - Submit doctor review
app.post('/api/doctors/:id/reviews', optionalAuth, async (req, res) => {
    try {
        const doctorId = parseInt(req.params.id);
        const { rating, reviewText, treatmentType, visitDate, patientName, isAnonymous = false } = req.body;
        const userId = req.user?.userId || null;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        if (!patientName && !userId) {
            return res.status(400).json({ error: 'Patient name is required for anonymous reviews' });
        }

        // Check if doctor exists
        const doctor = await db.query('SELECT id FROM doctors WHERE id = $1', [doctorId]);
        if (doctor.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Insert review
        const result = await db.run(`
            INSERT INTO doctor_reviews (
                doctorId, userId, patientName, rating, reviewText,
                treatmentType, visitDate, isAnonymous, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, doctorId, userId, patientName, rating, reviewText, treatmentType, visitDate, isAnonymous);

        // Update doctor's average rating
        const avgResult = await db.get(`
            SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount
            FROM doctor_reviews WHERE doctorId = ?
        `, doctorId);

        await db.run(`
            UPDATE doctors SET rating = ?, reviewCount = ?, updatedAt = datetime('now')
            WHERE id = ?
        `, avgResult.avgRating, avgResult.reviewCount, doctorId);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            reviewId: result.lastID
        });

    } catch (error) {
        console.error('Failed to submit review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

// --- Treatment Planning & Booking API Routes ---

// POST /api/appointments - Book a consultation/appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const {
            doctorId, hospitalId, appointmentType, appointmentDate, appointmentTime,
            duration, notes, isTelemedicine
        } = req.body;
        const userId = req.user.userId;

        // Validate required fields
        if (!doctorId || !hospitalId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ error: 'Doctor, hospital, date, and time are required' });
        }

        // Check if doctor exists and get consultation fee
        const doctor = await db.query('SELECT consultationFee FROM doctors WHERE id = $1', [doctorId]);
        if (doctor.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Check for scheduling conflicts
        const conflict = await db.get(`
            SELECT id FROM appointments
            WHERE doctorId = ? AND appointmentDate = ? AND appointmentTime = ?
            AND status NOT IN ('cancelled', 'completed')
        `, doctorId, appointmentDate, appointmentTime);

        if (conflict) {
            return res.status(409).json({ error: 'This time slot is already booked' });
        }

        // Create appointment
        const result = await db.run(`
            INSERT INTO appointments (
                userId, doctorId, hospitalId, appointmentType, appointmentDate,
                appointmentTime, duration, notes, consultationFee, isTelemedicine,
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, userId, doctorId, hospitalId, appointmentType || 'consultation', appointmentDate,
           appointmentTime, duration || 30, notes, doctor.consultationFee, isTelemedicine || false);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointmentId: result.lastID,
            consultationFee: doctor.rows[0].consultationFee
        });

    } catch (error) {
        console.error('Failed to book appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// GET /api/appointments - Get user's appointments
app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, upcoming } = req.query;

        let query = `
            SELECT a.*,
                   d.firstName as doctorFirstName, d.lastName as doctorLastName,
                   d.title as doctorTitle, d.imageUrl as doctorImage,
                   h.name as hospitalName, h.city,
                   ms.name as specialtyName
            FROM appointments a
            JOIN doctors d ON a.doctorId = d.id
            JOIN hospitals h ON a.hospitalId = h.id
            JOIN medical_specialties ms ON d.specialtyId = ms.id
            WHERE a.userId = ?
        `;
        const params = [userId];

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        if (upcoming === 'true') {
            query += ' AND a.appointmentDate >= date("now")';
        }

        query += ' ORDER BY a.appointmentDate DESC, a.appointmentTime DESC';

        const appointments = await db.all(query, ...params);
        res.json(appointments);

    } catch (error) {
        console.error('Failed to fetch appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// GET /api/doctors/:id/availability - Get doctor's available time slots
app.get('/api/doctors/:id/availability', async (req, res) => {
    try {
        const doctorId = parseInt(req.params.id);
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Get doctor's existing appointments for the date
        const bookedSlots = await db.all(`
            SELECT appointmentTime, duration
            FROM appointments
            WHERE doctorId = ? AND appointmentDate = ?
            AND status NOT IN ('cancelled', 'completed')
        `, doctorId, date);

        // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
        const timeSlots = [];
        for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                // Check if this slot conflicts with existing appointments
                const isBooked = bookedSlots.some(slot => {
                    const slotStart = new Date(`2000-01-01 ${slot.appointmentTime}`);
                    const slotEnd = new Date(slotStart.getTime() + (slot.duration * 60000));
                    const checkTime = new Date(`2000-01-01 ${time}`);
                    
                    return checkTime >= slotStart && checkTime < slotEnd;
                });

                timeSlots.push({
                    time,
                    available: !isBooked
                });
            }
        }

        res.json({ date, timeSlots });

    } catch (error) {
        console.error('Failed to fetch availability:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// POST /api/treatment-plans - Create treatment plan
app.post('/api/treatment-plans', authenticateToken, async (req, res) => {
    try {
        const {
            doctorId, hospitalId, treatmentId, planName, description,
            estimatedCost, estimatedDuration, startDate, endDate,
            priority, notes, preOperativeInstructions, postOperativeInstructions
        } = req.body;
        const userId = req.user.userId;

        if (!doctorId || !hospitalId || !treatmentId || !planName) {
            return res.status(400).json({ error: 'Doctor, hospital, treatment, and plan name are required' });
        }

        // Create treatment plan
        const result = await db.run(`
            INSERT INTO treatment_plans (
                userId, doctorId, hospitalId, treatmentId, planName, description,
                estimatedCost, estimatedDuration, startDate, endDate, priority,
                notes, preOperativeInstructions, postOperativeInstructions,
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, userId, doctorId, hospitalId, treatmentId, planName, description,
           estimatedCost, estimatedDuration, startDate, endDate, priority || 'medium',
           notes, preOperativeInstructions, postOperativeInstructions);

        res.status(201).json({
            success: true,
            message: 'Treatment plan created successfully',
            planId: result.lastID
        });

    } catch (error) {
        console.error('Failed to create treatment plan:', error);
        res.status(500).json({ error: 'Failed to create treatment plan' });
    }
});

// GET /api/treatment-plans - Get user's treatment plans
app.get('/api/treatment-plans', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const plans = await db.all(`
            SELECT tp.*,
                   d.firstName as doctorFirstName, d.lastName as doctorLastName,
                   d.title as doctorTitle, h.name as hospitalName,
                   t.name as treatmentName, t.successRate
            FROM treatment_plans tp
            JOIN doctors d ON tp.doctorId = d.id
            JOIN hospitals h ON tp.hospitalId = h.id
            JOIN treatments t ON tp.treatmentId = t.id
            WHERE tp.userId = ?
            ORDER BY tp.createdAt DESC
        `, userId);

        res.json(plans);

    } catch (error) {
        console.error('Failed to fetch treatment plans:', error);
        res.status(500).json({ error: 'Failed to fetch treatment plans' });
    }
});

// --- Travel & Accommodation API Routes ---

// GET /api/accommodations - Get accommodation options by hospital
app.get('/api/accommodations', async (req, res) => {
    try {
        const { hospitalId, type, maxPrice, minRating } = req.query;

        let query = `
            SELECT * FROM accommodation_options
            WHERE isActive = TRUE
        `;
        const params = [];

        if (hospitalId) {
            query += ' AND hospitalId = ?';
            params.push(hospitalId);
        }

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        if (maxPrice) {
            query += ' AND pricePerNight <= ?';
            params.push(parseFloat(maxPrice));
        }

        if (minRating) {
            query += ' AND rating >= ?';
            params.push(parseFloat(minRating));
        }

        query += ' ORDER BY isPartner DESC, rating DESC, pricePerNight ASC';

        const accommodations = await db.all(query, ...params);

        // Parse JSON fields
        accommodations.forEach(accommodation => {
            if (accommodation.amenities) {
                accommodation.amenities = JSON.parse(accommodation.amenities);
            }
            if (accommodation.images) {
                accommodation.images = JSON.parse(accommodation.images || '[]');
            }
        });

        res.json(accommodations);
    } catch (error) {
        console.error('Failed to fetch accommodations:', error);
        res.status(500).json({ error: 'Failed to fetch accommodations' });
    }
});

// GET /api/accommodations/:id/rooms - Get room types for a specific accommodation
app.get('/api/accommodations/:id/rooms', async (req, res) => {
    try {
        const accommodationId = parseInt(req.params.id);

        const rooms = await db.all(`
            SELECT * FROM accommodation_rooms
            WHERE accommodationId = ? AND isAvailable = TRUE
            ORDER BY pricePerNight ASC
        `, accommodationId);

        // Parse JSON fields
        rooms.forEach(room => {
            if (room.amenities) {
                room.amenities = JSON.parse(room.amenities);
            }
        });

        res.json(rooms);
    } catch (error) {
        console.error('Failed to fetch accommodation rooms:', error);
        res.status(500).json({ error: 'Failed to fetch accommodation rooms' });
    }
});

// GET /api/transportation - Get transportation services
app.get('/api/transportation', async (req, res) => {
    try {
        const { serviceType, maxPrice } = req.query;
        
        let query = `
            SELECT * FROM transportation_services
            WHERE isActive = TRUE
        `;
        const params = [];

        if (serviceType) {
            query += ' AND serviceType = ?';
            params.push(serviceType);
        }

        if (maxPrice) {
            query += ' AND pricePerKm <= ?';
            params.push(parseFloat(maxPrice));
        }

        query += ' ORDER BY rating DESC, pricePerKm ASC';

        const services = await db.all(query, ...params);

        // Parse JSON fields
        services.forEach(service => {
            if (service.amenities) {
                service.amenities = JSON.parse(service.amenities);
            }
        });

        res.json(services);
    } catch (error) {
        console.error('Failed to fetch transportation services:', error);
        res.status(500).json({ error: 'Failed to fetch transportation services' });
    }
});

// POST /api/travel-bookings - Create travel booking
app.post('/api/travel-bookings', authenticateToken, async (req, res) => {
    try {
        const {
            appointmentId, treatmentPlanId, bookingType, providerName,
            bookingDetails, totalCost, currency, startDate, endDate, specialRequests
        } = req.body;
        const userId = req.user.userId;

        if (!bookingType || !providerName) {
            return res.status(400).json({ error: 'Booking type and provider name are required' });
        }

        const result = await db.run(`
            INSERT INTO travel_bookings (
                userId, appointmentId, treatmentPlanId, bookingType, providerName,
                bookingDetails, totalCost, currency, startDate, endDate, specialRequests,
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, userId, appointmentId, treatmentPlanId, bookingType, providerName,
           bookingDetails, totalCost, currency || 'USD', startDate, endDate, specialRequests);

        res.status(201).json({
            success: true,
            message: 'Travel booking created successfully',
            bookingId: result.lastID
        });

    } catch (error) {
        console.error('Failed to create travel booking:', error);
        res.status(500).json({ error: 'Failed to create travel booking' });
    }
});

// GET /api/travel-bookings - Get user's travel bookings
app.get('/api/travel-bookings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status } = req.query;

        let query = `
            SELECT tb.*,
                    a.appointmentDate, a.appointmentTime,
                    tp.planName, tp.startDate as treatmentStartDate
            FROM travel_bookings tb
            LEFT JOIN appointments a ON tb.appointmentId = a.id
            LEFT JOIN treatment_plans tp ON tb.treatmentPlanId = tp.id
            WHERE tb.userId = ?
        `;
        const params = [userId];

        if (status) {
            query += ' AND tb.status = ?';
            params.push(status);
        }

        query += ' ORDER BY tb.createdAt DESC';

        const bookings = await db.all(query, ...params);
        res.json(bookings);

    } catch (error) {
        console.error('Failed to fetch travel bookings:', error);
        res.status(500).json({ error: 'Failed to fetch travel bookings' });
    }
});

// POST /api/accommodation-bookings - Create accommodation booking
app.post('/api/accommodation-bookings', optionalAuth, async (req, res) => {
    try {
        const {
            accommodationId, checkInDate, checkOutDate, numberOfGuests,
            specialRequests, contactPhone, emergencyContact,
            guestName, guestEmail // For anonymous bookings
        } = req.body;
        const userId = req.user?.userId || null;

        if (!accommodationId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ error: 'Accommodation ID, check-in date, and check-out date are required' });
        }

        // Get accommodation details
        const accommodation = await db.get('SELECT * FROM accommodation_options WHERE id = ?', accommodationId);
        if (!accommodation) {
            return res.status(404).json({ error: 'Accommodation not found' });
        }

        // Calculate total cost
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalCost = accommodation.pricePerNight * nights;

        // Create booking (no room selection needed)
        const result = await db.run(`
            INSERT INTO accommodation_bookings (
                userId, guestName, guestEmail, accommodationId, checkInDate, checkOutDate, numberOfGuests,
                totalCost, currency, specialRequests, contactPhone, emergencyContact,
                bookingStatus, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, userId, guestName, guestEmail, accommodationId, checkInDate, checkOutDate, numberOfGuests || 1,
           totalCost, accommodation.currency, specialRequests, contactPhone, emergencyContact, 'pending');

        res.status(201).json({
            success: true,
            message: 'Accommodation booking created successfully',
            bookingId: result.lastID,
            totalCost,
            currency: accommodation.currency,
            nights
        });

    } catch (error) {
        console.error('Failed to create accommodation booking:', error);
        res.status(500).json({ error: 'Failed to create accommodation booking' });
    }
});

// GET /api/accommodation-bookings - Get user's accommodation bookings
app.get('/api/accommodation-bookings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const bookings = await db.all(`
            SELECT ab.*,
                   ao.name as accommodationName, ao.type, ao.address, ao.contactPhone as accommodationPhone,
                   ao.contactEmail as accommodationEmail, ao.pricePerNight as accommodationPrice
            FROM accommodation_bookings ab
            JOIN accommodation_options ao ON ab.accommodationId = ao.id
            WHERE ab.userId = ?
            ORDER BY ab.createdAt DESC
        `, userId);

        res.json(bookings);

    } catch (error) {
        console.error('Failed to fetch accommodation bookings:', error);
        res.status(500).json({ error: 'Failed to fetch accommodation bookings' });
    }
});

// GET /api/admin/accommodation-bookings - Get all accommodation bookings for admin
app.get('/api/admin/accommodation-bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await db.all(`
            SELECT ab.*,
                   ao.name as accommodationName, ao.type, ao.address, ao.pricePerNight as accommodationPrice,
                   u.firstName, u.lastName, u.email, u.phone
            FROM accommodation_bookings ab
            JOIN accommodation_options ao ON ab.accommodationId = ao.id
            LEFT JOIN users u ON ab.userId = u.id
            ORDER BY ab.createdAt DESC
        `);

        res.json(bookings);

    } catch (error) {
        console.error('Failed to fetch admin accommodation bookings:', error);
        res.status(500).json({ error: 'Failed to fetch accommodation bookings' });
    }
});

// PUT /api/admin/accommodation-bookings/:id/status - Update booking status
app.put('/api/admin/accommodation-bookings/:id/status', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { status, notes } = req.body;

        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await db.run(`
            UPDATE accommodation_bookings
            SET bookingStatus = ?, adminNotes = ?, updatedAt = datetime('now')
            WHERE id = ?
        `, status, notes, bookingId);

        res.json({
            success: true,
            message: 'Booking status updated successfully'
        });

    } catch (error) {
        console.error('Failed to update booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

// POST /api/visa-applications - Submit visa application
app.post('/api/visa-applications', authenticateToken, async (req, res) => {
    try {
        const {
            passportNumber, passportExpiry, nationality, purposeOfVisit,
            hospitalInvitationLetter, medicalDocuments, financialDocuments,
            travelItinerary, accommodationBooking
        } = req.body;
        const userId = req.user.userId;

        if (!passportNumber || !passportExpiry || !nationality) {
            return res.status(400).json({ error: 'Passport details and nationality are required' });
        }

        // Check if user already has a pending application
        const existingApp = await db.get(`
            SELECT id FROM visa_applications
            WHERE userId = ? AND applicationStatus IN ('draft', 'submitted', 'under_review')
        `, userId);

        if (existingApp) {
            return res.status(400).json({ error: 'You already have a pending visa application' });
        }

        const result = await db.run(`
            INSERT INTO visa_applications (
                userId, passportNumber, passportExpiry, nationality, purposeOfVisit,
                hospitalInvitationLetter, medicalDocuments, financialDocuments,
                travelItinerary, accommodationBooking, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, userId, passportNumber, passportExpiry, nationality, purposeOfVisit || 'medical',
           hospitalInvitationLetter || false, medicalDocuments || false, financialDocuments || false,
           travelItinerary || false, accommodationBooking || false);

        res.status(201).json({
            success: true,
            message: 'Visa application submitted successfully',
            applicationId: result.lastID
        });

    } catch (error) {
        console.error('Failed to submit visa application:', error);
        res.status(500).json({ error: 'Failed to submit visa application' });
    }
});

// GET /api/visa-applications - Get user's visa applications
app.get('/api/visa-applications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const applications = await db.all(`
            SELECT * FROM visa_applications
            WHERE userId = ?
            ORDER BY createdAt DESC
        `, userId);

        res.json(applications);

    } catch (error) {
        console.error('Failed to fetch visa applications:', error);
        res.status(500).json({ error: 'Failed to fetch visa applications' });
    }
});

// --- Admin Testimonial Management API Routes ---

// PUT /api/admin/testimonials/:id/approve - Approve a testimonial
app.put('/api/admin/testimonials/:id/approve', authenticateToken, async (req, res) => {
    try {
        const testimonialId = parseInt(req.params.id);

        // Check if user is admin (you might want to add role checking here)
        // For now, we'll assume authenticated users can manage testimonials

        await db.run(`
            UPDATE user_testimonials
            SET isApproved = TRUE, updatedAt = datetime('now')
            WHERE id = ?
        `, testimonialId);

        res.json({ success: true, message: 'Testimonial approved successfully' });

    } catch (error) {
        console.error('Failed to approve testimonial:', error);
        res.status(500).json({ error: 'Failed to approve testimonial' });
    }
});

// PUT /api/admin/testimonials/:id/reject - Reject a testimonial
app.put('/api/admin/testimonials/:id/reject', authenticateToken, async (req, res) => {
    try {
        const testimonialId = parseInt(req.params.id);

        await db.run(`
            UPDATE user_testimonials
            SET isApproved = FALSE, isPublished = FALSE, updatedAt = datetime('now')
            WHERE id = ?
        `, testimonialId);

        res.json({ success: true, message: 'Testimonial rejected' });

    } catch (error) {
        console.error('Failed to reject testimonial:', error);
        res.status(500).json({ error: 'Failed to reject testimonial' });
    }
});

// PUT /api/admin/testimonials/:id/publish - Publish an approved testimonial
app.put('/api/admin/testimonials/:id/publish', authenticateToken, async (req, res) => {
    try {
        const testimonialId = parseInt(req.params.id);

        await db.run(`
            UPDATE user_testimonials
            SET isPublished = TRUE, updatedAt = datetime('now')
            WHERE id = ?
        `, testimonialId);

        res.json({ success: true, message: 'Testimonial published successfully' });

    } catch (error) {
        console.error('Failed to publish testimonial:', error);
        res.status(500).json({ error: 'Failed to publish testimonial' });
    }
});

// PUT /api/admin/testimonials/:id/unpublish - Unpublish a testimonial
app.put('/api/admin/testimonials/:id/unpublish', authenticateToken, async (req, res) => {
    try {
        const testimonialId = parseInt(req.params.id);

        await db.run(`
            UPDATE user_testimonials
            SET isPublished = FALSE, updatedAt = datetime('now')
            WHERE id = ?
        `, testimonialId);

        res.json({ success: true, message: 'Testimonial unpublished' });

    } catch (error) {
        console.error('Failed to unpublish testimonial:', error);
        res.status(500).json({ error: 'Failed to unpublish testimonial' });
    }
});

// GET /api/admin/testimonials - Get all testimonials for admin (including pending)
app.get('/api/admin/testimonials', authenticateToken, async (req, res) => {
    try {
        const testimonials = await db.all(`
            SELECT ut.*,
                   u.firstName as submitterFirstName,
                   u.lastName as submitterLastName
            FROM user_testimonials ut
            JOIN users u ON ut.userId = u.id
            ORDER BY ut.createdAt DESC
        `);

        // Parse JSON fields
        testimonials.forEach(testimonial => {
            if (testimonial.tags) {
                testimonial.tags = JSON.parse(testimonial.tags);
            }
        });

        res.json(testimonials);

    } catch (error) {
        console.error('Failed to fetch admin testimonials:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// POST /api/travel-assistance - Request travel assistance
app.post('/api/travel-assistance', authenticateToken, async (req, res) => {
    try {
        const {
            requestType, priority, description, preferredDate,
            budget, currency, specialRequirements
        } = req.body;
        const userId = req.user.userId;

        if (!requestType || !description) {
            return res.status(400).json({ error: 'Request type and description are required' });
        }

        const result = await db.run(`
            INSERT INTO travel_assistance_requests (
                userId, requestType, priority, description, preferredDate,
                budget, currency, specialRequirements, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, userId, requestType, priority || 'medium', description, preferredDate,
           budget, currency || 'USD', specialRequirements);

        res.status(201).json({
            success: true,
            message: 'Travel assistance request submitted successfully',
            requestId: result.lastID
        });

    } catch (error) {
        console.error('Failed to submit travel assistance request:', error);
        res.status(500).json({ error: 'Failed to submit travel assistance request' });
    }
});

// --- User Testimonials API Routes ---

// POST /api/testimonials - Submit a user testimonial
app.post('/api/testimonials', authenticateToken, (req, res, next) => {
    const uploadMiddleware = upload.fields([
        { name: 'beforeImage', maxCount: 1 },
        { name: 'afterImage', maxCount: 1 }
    ]);

    uploadMiddleware(req, res, (err) => {
        if (err) {
            return next(err); // Pass error to error handling middleware
        }
        next(); // Continue to the route handler
    });
}, async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            patientName, patientCountry, patientAge, treatmentType,
            hospitalName, doctorName, rating, testimonialText,
            treatmentDate, treatmentDuration, costSaved,
            videoTestimonial, tags, useProfileImage
        } = req.body;

        // Get uploaded files
        const files = req.files;
        const beforeImageFile = files.beforeImage?.[0];
        const afterImageFile = files.afterImage?.[0];

        // Validate required fields
        if (!patientName || !patientCountry || !treatmentType || !hospitalName ||
            !doctorName || !rating || !testimonialText) {
            return res.status(400).json({
                error: 'Patient name, country, treatment type, hospital, doctor, rating, and testimonial text are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Handle image URLs
        let beforeImageUrl = null;
        let afterImageUrl = null;

        if (beforeImageFile) {
            beforeImageUrl = `/uploads/${beforeImageFile.filename}`;
        } else if (useProfileImage === 'true') {
            // Generate avatar URL for profile image
            beforeImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=0D47A1&color=fff&size=200`;
        }

        if (afterImageFile) {
            afterImageUrl = `/uploads/${afterImageFile.filename}`;
        }

        // Parse tags if provided
        let parsedTags = null;
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                parsedTags = null;
            }
        }

        // Insert testimonial
        const result = await db.run(`
            INSERT INTO user_testimonials (
                userId, patientName, patientCountry, patientAge, treatmentType,
                hospitalName, doctorName, rating, testimonialText, treatmentDate,
                treatmentDuration, costSaved, beforeImage, afterImage, videoTestimonial,
                tags, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, userId, patientName, patientCountry, patientAge || null, treatmentType,
           hospitalName, doctorName, parseInt(rating), testimonialText, treatmentDate || null,
           treatmentDuration || null, costSaved ? parseFloat(costSaved) : null,
           beforeImageUrl, afterImageUrl, videoTestimonial || null,
           parsedTags ? JSON.stringify(parsedTags) : null);

        res.status(201).json({
            success: true,
            message: 'Testimonial submitted successfully. It will be reviewed before publication.',
            testimonialId: result.lastID
        });

    } catch (error) {
        console.error('Failed to submit testimonial:', error);
        res.status(500).json({ error: 'Failed to submit testimonial' });
    }
});

// GET /api/testimonials - Get published user testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const { treatmentType, limit = 20 } = req.query;

        let query = `
            SELECT ut.*,
                   u.firstName as submitterFirstName,
                   u.lastName as submitterLastName
            FROM user_testimonials ut
            JOIN users u ON ut.userId = u.id
            WHERE ut.isPublished = TRUE
        `;
        const params = [];

        if (treatmentType) {
            query += ' AND ut.treatmentType LIKE ?';
            params.push(`%${treatmentType}%`);
        }

        query += ' ORDER BY ut.createdAt DESC LIMIT ?';
        params.push(parseInt(limit));

        const testimonials = await db.all(query, ...params);

        // Parse JSON fields
        testimonials.forEach(testimonial => {
            if (testimonial.tags) {
                testimonial.tags = JSON.parse(testimonial.tags);
            }
        });

        res.json(testimonials);

    } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// GET /api/testimonials/my - Get user's own testimonials (authenticated)
app.get('/api/testimonials/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const testimonials = await db.all(`
            SELECT * FROM user_testimonials
            WHERE userId = ?
            ORDER BY createdAt DESC
        `, userId);

        // Parse JSON fields
        testimonials.forEach(testimonial => {
            if (testimonial.tags) {
                testimonial.tags = JSON.parse(testimonial.tags);
            }
        });

        res.json(testimonials);

    } catch (error) {
        console.error('Failed to fetch user testimonials:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});


// --- Frontend Serving ---
// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all handler: send back index.html for any non-API routes (SPA routing)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// --- Error Handling Middleware ---
app.use((error, req, res, next) => {
    console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: `File too large. Maximum file size is ${parseInt(process.env.MAX_FILE_SIZE) / (1024 * 1024)}MB per image.`
        });
    }
    if (error.message && error.message.includes('Only image files')) {
        return res.status(400).json({
            error: 'Only image files (JPG, PNG, GIF, WebP) are allowed.'
        });
    }
    if (error.name === 'MulterError') {
        return res.status(400).json({
            error: 'File upload error: ' + error.message
        });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            details: error.message
        });
    }

    // Handle database errors
    if (error.code && error.code.startsWith('23')) { // PostgreSQL constraint violations
        return res.status(400).json({
            error: 'Database constraint violation',
            details: error.message
        });
    }

    // Default error response
    res.status(error.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
});

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// --- Start Server ---
const server = app.listen(port, () => {
    console.log(`AfyaConnect server is running on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
