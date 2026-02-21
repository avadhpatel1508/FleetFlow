import express from 'express';
import {
    authUser,
    registerUser,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

export default router;
