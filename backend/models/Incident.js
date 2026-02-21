import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: false
    },
    type: {
        type: String,
        enum: ['Accident', 'Traffic Violation', 'Cargo Damage', 'Safety Complaint', 'Other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'Critical'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    penaltyApplied: {
        type: Number,
        default: 0
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Incident', incidentSchema);
