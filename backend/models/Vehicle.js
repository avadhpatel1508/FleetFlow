import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    model: {
        type: String,
        required: [true, 'Please add a vehicle model or name']
    },
    licensePlate: {
        type: String,
        required: [true, 'Please add a license plate'],
        unique: true
    },
    maxCapacity: {
        type: Number,
        required: [true, 'Please specify maximum capacity in kg']
    },
    odometer: {
        type: Number,
        required: [true, 'Please add current odometer reading'],
        default: 0
    },
    acquisitionCost: {
        type: Number,
        required: [true, 'Please add acquisition cost']
    },
    type: {
        type: String,
        required: [true, 'Please add vehicle type (e.g., Truck, Van, Car)']
    },
    region: {
        type: String,
        required: [true, 'Please specify the operating region']
    },
    status: {
        type: String,
        enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
        default: 'Available'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
