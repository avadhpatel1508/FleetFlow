import Vehicle from '../models/Vehicle.js';
import { logAction } from '../services/auditService.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
    try {
        const query = { isActive: true };
        if (req.query.type) query.type = req.query.type;
        if (req.query.status) query.status = req.query.status;
        if (req.query.region) query.region = req.query.region;

        const vehicles = await Vehicle.find(query);
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, isActive: true });
        if (vehicle) {
            res.json(vehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Fleet Manager
export const createVehicle = async (req, res) => {
    try {
        const { model, licensePlate, maxCapacity, odometer, acquisitionCost, type, region } = req.body;

        const vehicleExists = await Vehicle.findOne({ licensePlate, isActive: true });
        if (vehicleExists) {
            return res.status(400).json({ message: 'Active vehicle with this license plate already exists' });
        }

        const vehicle = await Vehicle.create({
            model,
            licensePlate,
            maxCapacity,
            odometer: odometer || 0,
            acquisitionCost,
            type,
            region
        });

        req.app.get('io').emit('vehicleCreated', vehicle);

        await logAction(req, 'Create', 'Vehicle', vehicle._id, { model, licensePlate });

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a vehicle (Edit details or toggle Out Of Service/Available)
// @route   PUT /api/vehicles/:id
// @access  Private/Fleet Manager
export const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, isActive: true });

        if (vehicle) {
            const previousStatus = vehicle.status;

            vehicle.model = req.body.model || vehicle.model;
            vehicle.licensePlate = req.body.licensePlate || vehicle.licensePlate;
            vehicle.maxCapacity = req.body.maxCapacity || vehicle.maxCapacity;
            vehicle.odometer = req.body.odometer !== undefined ? req.body.odometer : vehicle.odometer;
            vehicle.acquisitionCost = req.body.acquisitionCost || vehicle.acquisitionCost;
            vehicle.type = req.body.type || vehicle.type;
            vehicle.region = req.body.region || vehicle.region;
            vehicle.status = req.body.status || vehicle.status;

            const updatedVehicle = await vehicle.save();

            req.app.get('io').emit('vehicleUpdated', updatedVehicle);

            if (previousStatus !== vehicle.status) {
                await logAction(req, 'StatusChange', 'Vehicle', vehicle._id, { from: previousStatus, to: vehicle.status });
            } else {
                await logAction(req, 'Update', 'Vehicle', vehicle._id, { note: 'Vehicle details updated' });
            }

            res.json(updatedVehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Soft Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Fleet Manager
export const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, isActive: true });

        if (vehicle) {
            if (vehicle.status === 'On Trip') {
                return res.status(400).json({ message: 'Cannot delete a vehicle currently On Trip' });
            }

            vehicle.isActive = false;
            vehicle.status = 'Retired';
            await vehicle.save();

            req.app.get('io').emit('vehicleDeleted', req.params.id);
            req.app.get('io').emit('vehicleUpdated', vehicle);

            await logAction(req, 'Delete', 'Vehicle', vehicle._id, { note: 'Soft deleted' });

            res.json({ message: 'Vehicle removed' });
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
