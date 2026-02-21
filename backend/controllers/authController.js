import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../services/emailService.js';

// --- Helpers ---
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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
        // Only block if EXPLICITLY set to false (new registration flow)
        // Existing users with undefined isVerified can still log in
        if (user.isVerified === false) {
            return res.status(403).json({ message: 'Please verify your email before logging in.', needsVerification: true, email: user.email });
        }
        res.json({
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

// @desc    Register new user (sends OTP, does NOT auto-login)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password, role, licenseExpiryDate, allowedVehicleType } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            // If they exist but aren't verified, resend OTP
            if (!userExists.isVerified) {
                const otp = generateOTP();
                await OTP.deleteMany({ email });
                await OTP.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
                await sendOTPEmail(email, otp);
                return res.status(200).json({ message: 'OTP resent. Please verify your email.', needsVerification: true, email });
            }
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role: role || 'Dispatcher', isVerified: false });

        if (user.role === 'Driver') {
            const parsedExpiry = licenseExpiryDate ? new Date(licenseExpiryDate) : new Date(Date.now() + 31536000000);
            const parsedTypes = allowedVehicleType?.length > 0 ? allowedVehicleType : ['Car'];
            await Driver.create({ name: user.name, userId: user._id, licenseExpiryDate: parsedExpiry, allowedVehicleType: parsedTypes });
        }

        const otp = generateOTP();
        await OTP.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
        await sendOTPEmail(email, otp);

        res.status(201).json({ message: 'Registration successful! Please check your email for the verification code.', needsVerification: true, email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const record = await OTP.findOne({ email, used: false }).sort({ createdAt: -1 });
        if (!record) return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
        if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

        record.used = true;
        await record.save();

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        res.json({
            message: 'Email verified successfully!',
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

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No account found with this email.' });
        if (user.isVerified) return res.status(400).json({ message: 'Account is already verified.' });

        await OTP.deleteMany({ email });
        const otp = generateOTP();
        await OTP.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
        await sendOTPEmail(email, otp);

        res.json({ message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password - send OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        // Always return 200 to prevent email enumeration
        if (!user) return res.status(200).json({ message: 'If an account with that email exists, a reset code has been sent.' });

        // Reuse the OTP model — tag with 'reset:' prefix to distinguish from signup OTPs
        const resetEmail = `reset:${email}`;
        await OTP.deleteMany({ email: resetEmail });
        const otp = generateOTP();
        await OTP.create({ email: resetEmail, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
        await sendPasswordResetEmail(email, otp);

        res.status(200).json({ message: 'If an account with that email exists, a reset code has been sent.', sent: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password using OTP
// @route   PUT /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    try {
        const resetEmail = `reset:${email}`;
        const record = await OTP.findOne({ email: resetEmail, used: false }).sort({ createdAt: -1 });
        if (!record) return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
        if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

        record.used = true;
        await record.save();

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.password = password;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
