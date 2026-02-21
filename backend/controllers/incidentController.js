import Incident from '../models/Incident.js';
import Driver from '../models/Driver.js';

// Penalty points by severity
const PENALTY_MAP = {
    'Low': 5,
    'Medium': 15,
    'Critical': 30
};

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Private (Fleet Manager, Safety Officer)
export const getIncidents = async (req, res) => {
    try {
        const { driverId } = req.query;
        const filter = {};
        if (driverId) filter.driverId = driverId;

        const incidents = await Incident.find(filter)
            .populate('driverId', 'name safetyScore')
            .populate('vehicleId', 'model licensePlate')
            .populate('reportedBy', 'name')
            .sort({ date: -1 });

        res.status(200).json(incidents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create incident and apply safety score penalty
// @route   POST /api/incidents
// @access  Private (Fleet Manager, Safety Officer)
export const createIncident = async (req, res) => {
    try {
        const { driverId, vehicleId, type, severity, description, date } = req.body;

        const penalty = PENALTY_MAP[severity] || 0;

        // Treat empty string vehicleId as absent — empty string fails ObjectId cast
        const resolvedVehicleId = vehicleId && vehicleId.trim() !== '' ? vehicleId : undefined;

        // Deduct safety score from the driver
        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        const newSafetyScore = Math.max(0, driver.safetyScore - penalty);
        await Driver.findByIdAndUpdate(driverId, { safetyScore: newSafetyScore });

        const incident = await Incident.create({
            driverId,
            vehicleId: resolvedVehicleId,
            type,
            severity,
            description,
            date: date || Date.now(),
            penaltyApplied: penalty,
            reportedBy: req.user._id
        });

        const populated = await incident.populate([
            { path: 'driverId', select: 'name safetyScore' },
            { path: 'vehicleId', select: 'model licensePlate' },
            { path: 'reportedBy', select: 'name' }
        ]);

        // Emit socket event so dashboard updates in real-time
        const io = req.app.get('io');
        if (io) {
            io.emit('incidentCreated', populated);
            io.emit('driverUpdated');
        }

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete an incident
// @route   DELETE /api/incidents/:id
// @access  Private (Fleet Manager only)
export const deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) return res.status(404).json({ message: 'Incident not found' });

        // Restore the driver's safety score when deleting the record
        await Driver.findByIdAndUpdate(incident.driverId, {
            $inc: { safetyScore: incident.penaltyApplied }
        });

        await incident.deleteOne();
        res.status(200).json({ message: 'Incident removed and penalty reversed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
