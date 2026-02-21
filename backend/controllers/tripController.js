import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import { statusEngine } from '../services/statusEngine.js';
import { logAction } from '../services/auditService.js';

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res) => {
    try {
        const query = { isActive: true };
        if (req.query.status) query.status = req.query.status;

        // If the user is a Driver, only show them their specific active dispatched/completed trips
        if (req.user.role === 'Driver') {
            const driverProfile = await Driver.findOne({ userId: req.user._id, isActive: true });
            if (!driverProfile) {
                return res.status(404).json({ message: 'Driver profile not found' });
            }
            query.driverId = driverProfile._id;
        } else if (req.query.driverId) {
            // Managers/Dispatchers can filter by a specific driver ID
            query.driverId = req.query.driverId;
        }

        const trips = await Trip.find(query)
            .populate('vehicleId', 'model licensePlate status maxCapacity')
            .populate('driverId', 'name status')
            .sort('-createdAt');

        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single trip
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, isActive: true })
            .populate('vehicleId', 'model licensePlate status maxCapacity')
            .populate('driverId', 'name status');

        if (trip) {
            res.json(trip);
        } else {
            res.status(404).json({ message: 'Trip not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a trip (Draft or Dispatched)
// @route   POST /api/trips
// @access  Private/Dispatcher, Fleet Manager
export const createTrip = async (req, res) => {
    try {
        const { vehicleId, driverId, cargoWeight, status, revenue } = req.body;

        const vehicle = await Vehicle.findOne({ _id: vehicleId, isActive: true });
        const driver = await Driver.findOne({ _id: driverId, isActive: true });

        if (!vehicle || !driver) {
            return res.status(404).json({ message: 'Vehicle or Driver not found or inactive' });
        }

        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({
                message: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${vehicle.maxCapacity}kg)`
            });
        }

        if (driver.allowedVehicleType && driver.allowedVehicleType.length > 0 && !driver.allowedVehicleType.includes(vehicle.type)) {
            return res.status(400).json({
                message: `Driver ${driver.name} is not certified to drive ${vehicle.type} vehicles. Allowed types: ${driver.allowedVehicleType.join(', ')}`
            });
        }

        const initialStatus = status || 'Draft';

        let startOdo = undefined;
        if (initialStatus === 'Dispatched') {
            const { vehicle: vUpdate } = await statusEngine.dispatchTrip(vehicleId, driverId, req);
            startOdo = vUpdate.odometer;
        }

        const trip = await Trip.create({
            vehicleId,
            driverId,
            cargoWeight,
            status: initialStatus,
            startOdometer: startOdo,
            revenue: revenue || 0
        });

        req.app.get('io').emit('tripCreated', trip);

        await logAction(req, 'Create', 'Trip', trip._id, { status: initialStatus, vehicleId, driverId });

        res.status(201).json(trip);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a trip status
// @route   PUT /api/trips/:id
// @access  Private/Dispatcher, Fleet Manager
export const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, isActive: true });

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const { status, endOdometer } = req.body;
        const previousStatus = trip.status;

        if (status === 'Dispatched' && previousStatus === 'Draft') {
            const { vehicle } = await statusEngine.dispatchTrip(trip.vehicleId, trip.driverId, req);
            trip.status = 'Dispatched';
            trip.startOdometer = vehicle.odometer;
        }
        else if (status === 'Completed' && previousStatus === 'Dispatched') {
            if (endOdometer === undefined) {
                return res.status(400).json({ message: 'End odometer reading is required to complete trip' });
            }
            if (endOdometer < trip.startOdometer) {
                return res.status(400).json({ message: 'End odometer cannot be less than start odometer' });
            }
            await statusEngine.completeTrip(trip.vehicleId, trip.driverId, endOdometer, req);

            const distance = endOdometer - trip.startOdometer;
            const generatedRevenue = (distance * 2.50) + (trip.cargoWeight * 0.50);

            trip.status = 'Completed';
            trip.endOdometer = endOdometer;
            trip.revenue = Math.round(generatedRevenue * 100) / 100;
        }
        else if (status === 'Cancelled' && previousStatus !== 'Completed') {
            if (previousStatus === 'Dispatched') {
                await statusEngine.cancelTrip(trip.vehicleId, trip.driverId, req);
            }
            trip.status = 'Cancelled';
        }

        const updatedTrip = await trip.save();
        req.app.get('io').emit('tripUpdated', updatedTrip);

        await logAction(req, 'StatusChange', 'Trip', trip._id, { from: previousStatus, to: trip.status });

        res.json(updatedTrip);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Soft Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private/Fleet Manager
export const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (trip) {
            // Revert vehicle/driver if trip was Dispatched and not Completed
            if (trip.status === 'Dispatched') {
                await statusEngine.cancelTrip(trip.vehicleId, trip.driverId, req);
            }

            trip.isActive = false;
            trip.status = 'Cancelled';
            await trip.save();

            req.app.get('io').emit('tripDeleted', req.params.id);
            req.app.get('io').emit('tripUpdated', trip);

            await logAction(req, 'Delete', 'Trip', trip._id, { note: 'Soft deleted' });

            res.json({ message: 'Trip removed' });
        } else {
            res.status(404).json({ message: 'Trip not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
