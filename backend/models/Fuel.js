import mongoose from 'mongoose';

const fuelSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Please assign a vehicle']
    },
    liters: {
        type: Number,
        required: [true, 'Please specify amount in liters']
    },
    cost: {
        type: Number,
        required: [true, 'Please specify fuel cost']
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'Please specify fuel date']
    }
}, {
    timestamps: true
});

const Fuel = mongoose.model('Fuel', fuelSchema);
export default Fuel;
