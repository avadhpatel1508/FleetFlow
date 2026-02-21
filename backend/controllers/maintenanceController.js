import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import { statusEngine } from '../services/statusEngine.js';
import { logAction } from '../services/auditService.js';

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private
export const getMaintenanceLogs = async (req, res) => {
    try {
        const query = {};
        if (req.query.vehicleId) query.vehicleId = req.query.vehicleId;

        const logs = await Maintenance.find(query)
            .populate('vehicleId', 'model licensePlate status isActive')
            .sort('-date');

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a maintenance log
// @route   POST /api/maintenance
// @access  Private/Fleet Manager (and Dispatcher via route)
export const createMaintenanceLog = async (req, res) => {
    try {
        const { vehicleId, serviceType, cost, notes, date } = req.body;

        const vehicle = await Vehicle.findOne({ _id: vehicleId, isActive: true });
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found or inactive' });
        }

        const log = await Maintenance.create({
            vehicleId,
            serviceType,
            cost,
            notes,
            date: date || Date.now()
        });

        // Use status engine to transition vehicle to In Shop and emit events
        await statusEngine.logMaintenance(vehicleId, req);

        req.app.get('io').emit('maintenanceCreated', log);

        await logAction(req, 'Create', 'Maintenance', log._id, { serviceType, cost, vehicleId });

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a maintenance log
// @route   PUT /api/maintenance/:id
// @access  Private/Fleet Manager
export const updateMaintenanceLog = async (req, res) => {
    try {
        const log = await Maintenance.findById(req.params.id);

        if (log) {
            log.serviceType = req.body.serviceType || log.serviceType;
            log.cost = req.body.cost !== undefined ? req.body.cost : log.cost;
            log.notes = req.body.notes || log.notes;
            log.date = req.body.date || log.date;

            const updatedLog = await log.save();

            await logAction(req, 'Update', 'Maintenance', log._id, { note: 'Maintenance updated' });

            res.json(updatedLog);
        } else {
            res.status(404).json({ message: 'Log not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a maintenance log
// @route   DELETE /api/maintenance/:id
// @access  Private/Fleet Manager
export const deleteMaintenanceLog = async (req, res) => {
    try {
        const log = await Maintenance.findById(req.params.id);

        if (log) {
            await log.deleteOne(); // Maintenance logs usually safe to hard delete or you can just leave it as is since it doesn't affect flow directly
            await logAction(req, 'Delete', 'Maintenance', req.params.id, { note: 'Maintenance log deleted' });
            res.json({ message: 'Maintenance log removed' });
        } else {
            res.status(404).json({ message: 'Log not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
