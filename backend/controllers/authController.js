import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Driver from '../models/Driver.js';

// --- Helpers ---
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });



// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, password, role, licenseExpiryDate, allowedVehicleType } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role: role || 'Dispatcher' });

        if (user.role === 'Driver') {
            const parsedExpiry = licenseExpiryDate ? new Date(licenseExpiryDate) : new Date(Date.now() + 31536000000);
            const parsedTypes = allowedVehicleType?.length > 0 ? allowedVehicleType : ['Car'];
            await Driver.create({ name: user.name, userId: user._id, licenseExpiryDate: parsedExpiry, allowedVehicleType: parsedTypes });
        }

        res.status(201).json({
            message: 'Registration successful!',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


