import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    licenseExpiryDate: {
        type: Date,
        required: [true, 'Please add license expiry date']
    },
    allowedVehicleType: {
        type: [String],
        required: [true, 'Please specify allowed vehicle types']
    },
    safetyScore: {
        type: Number,
        default: 100
    },
    completionRate: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ['On Duty', 'Off Duty', 'Suspended'],
        default: 'Off Duty'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Not required for existing drivers created by dispatchers
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
