import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // MongoDB TTL: auto-delete when expiresAt is reached
    },
    used: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('OTP', otpSchema);
