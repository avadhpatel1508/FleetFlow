import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        await User.deleteMany();
        await Vehicle.deleteMany();
        await Driver.deleteMany();

        // Admin User
        await User.create({
            name: 'Admin Manager',
            email: 'admin@fleetflow.com',
            password: 'password123',
            role: 'Fleet Manager'
        });

        // Vehicles
        await Vehicle.create([
            {
                model: 'Ford Transit 2022',
                licensePlate: 'ABC-1234',
                maxCapacity: 1500,
                odometer: 12000,
                acquisitionCost: 35000,
                type: 'Van',
                region: 'North',
                status: 'Available'
            },
            {
                model: 'Volvo FH16',
                licensePlate: 'XYZ-9876',
                maxCapacity: 25000,
                odometer: 85000,
                acquisitionCost: 120000,
                type: 'Truck',
                region: 'South',
                status: 'Available'
            }
        ]);

        // Drivers
        await Driver.create([
            {
                name: 'John Doe',
                licenseExpiryDate: new Date('2025-12-31'),
                allowedVehicleType: ['Van', 'Truck'],
                safetyScore: 95,
                status: 'Off Duty'
            },
            {
                name: 'Jane Smith',
                licenseExpiryDate: new Date('2026-05-15'),
                allowedVehicleType: ['Van'],
                safetyScore: 98,
                status: 'Off Duty'
            }
        ]);

        console.log('Seed data imported successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
