import Fuel from '../models/Fuel.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Get all fuel logs
// @route   GET /api/fuel
// @access  Private
export const getFuelLogs = async (req, res) => {
    try {
        const query = {};
        if (req.query.vehicleId) query.vehicleId = req.query.vehicleId;

        const logs = await Fuel.find(query).populate('vehicleId', 'model licensePlate status');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a fuel log
// @route   POST /api/fuel
// @access  Private/Fleet Manager
export const createFuelLog = async (req, res) => {
    try {
        const { vehicleId, liters, cost, date } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const log = await Fuel.create({
            vehicleId,
            liters,
            cost,
            date: date || Date.now()
        });

        // Emit real-time update
        req.app.get('io').emit('fuelCreated', log);

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a fuel log
// @route   PUT /api/fuel/:id
// @access  Private/Fleet Manager
export const updateFuelLog = async (req, res) => {
    try {
        const log = await Fuel.findById(req.params.id);

        if (log) {
            log.liters = req.body.liters !== undefined ? req.body.liters : log.liters;
            log.cost = req.body.cost !== undefined ? req.body.cost : log.cost;
            log.date = req.body.date || log.date;

            const updatedLog = await log.save();
            res.json(updatedLog);
        } else {
            res.status(404).json({ message: 'Log not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a fuel log
// @route   DELETE /api/fuel/:id
// @access  Private/Fleet Manager
export const deleteFuelLog = async (req, res) => {
    try {
        const log = await Fuel.findById(req.params.id);

        if (log) {
            await log.deleteOne();
            res.json({ message: 'Fuel log removed' });
        } else {
            res.status(404).json({ message: 'Log not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
