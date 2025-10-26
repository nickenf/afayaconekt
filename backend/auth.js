import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Hash password
export async function hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(userId, email, role) {
    return jwt.sign(
        { userId, email, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// Verify JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Authentication middleware
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
}

// Optional authentication middleware (doesn't fail if no token)
export function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }
    next();
}

// Validation rules for registration
export const validateRegistration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('firstName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('First name is required'),
    body('lastName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Last name is required'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
];

// Validation rules for login
export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

// Check validation results
export function checkValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
}