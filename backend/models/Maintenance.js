import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Please assign a vehicle']
    },
    serviceType: {
        type: String,
        required: [true, 'Please specify service type']
    },
    cost: {
        type: Number,
        required: [true, 'Please specify maintenance cost']
    },
    notes: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'Please specify maintenance date']
    }
}, {
    timestamps: true
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;
