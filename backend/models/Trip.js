import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Please assign a vehicle']
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: [true, 'Please assign a driver']
    },
    cargoWeight: {
        type: Number,
        required: [true, 'Please specify cargo weight in kg']
    },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft'
    },
    startOdometer: {
        type: Number
    },
    endOdometer: {
        type: Number
    },
    revenue: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
